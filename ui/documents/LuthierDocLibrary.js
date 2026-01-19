/**
 * LuthierDocLibrary - Biblioteca de documentos
 *
 * Galeria de documentos con:
 * - Filtros por categoria y tipo
 * - Busqueda en tiempo real
 * - Iconos automaticos por tipo de archivo
 * - Descarga y visualizacion
 *
 * FUENTES DE DATOS:
 * 1. window.DOCUMENTOS (array global)
 * 2. Atributo source con nombre de variable global
 *
 * ATRIBUTOS:
 * - source      : Nombre de variable global con datos
 * - sin-filtros : Oculta los filtros de categoria/tipo
 * - sin-busqueda: Oculta el campo de busqueda
 * - sin-contador: Oculta el contador de resultados
 *
 * ESTRUCTURA DE DATOS:
 * {
 *   titulo: "Nombre del documento",
 *   descripcion: "Descripcion breve",
 *   archivo: "ruta/al/archivo.pdf",
 *   tipo: "pdf" | "xlsx" | "docx" | etc,
 *   categoria: "informes" | "planes" | etc,
 *   fecha: "2024-01-15",
 *   tamano: "1.5 MB"
 * }
 *
 * @example
 * <luthier-doc-library></luthier-doc-library>
 *
 * @example Sin filtros
 * <luthier-doc-library sin-filtros sin-busqueda></luthier-doc-library>
 */
(function(global) {
    'use strict';

    class LuthierDocLibrary extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 50);
        }

        _init() {
            this._config = {
                mostrarFiltros: !this.hasAttribute('sin-filtros'),
                mostrarBusqueda: !this.hasAttribute('sin-busqueda'),
                mostrarContador: !this.hasAttribute('sin-contador'),
                categorias: this._parsearCategorias(),
                tipos: this._parsearTipos()
            };

            // Obtener documentos
            var sourceName = this.getAttribute('source') || 'DOCUMENTOS';
            this._documentos = global[sourceName] || [];

            this.classList.add('doc-library-wrapper');
            this._renderizar();
            this._initEventos();
            this._renderizarLista();
        }

        _parsearCategorias() {
            var attr = this.getAttribute('categorias');
            if (!attr) {
                return [
                    { valor: 'informes', nombre: 'Informes' },
                    { valor: 'planes', nombre: 'Planes' },
                    { valor: 'otros', nombre: 'Otros documentos' }
                ];
            }
            return attr.split(',').map(function(cat) {
                var partes = cat.trim().split(':');
                return { valor: partes[0], nombre: partes[1] || partes[0] };
            });
        }

        _parsearTipos() {
            var attr = this.getAttribute('tipos');
            if (!attr) {
                return [
                    { valor: 'pdf', nombre: 'PDF' },
                    { valor: 'xlsx', nombre: 'Excel (.xlsx)' },
                    { valor: 'xls', nombre: 'Excel (.xls)' },
                    { valor: 'docx', nombre: 'Word (.docx)' }
                ];
            }
            return attr.split(',').map(function(tipo) {
                var partes = tipo.trim().split(':');
                return { valor: partes[0], nombre: partes[1] || partes[0].toUpperCase() };
            });
        }

        _renderizar() {
            var config = this._config;
            var html = '';

            // Filtros
            if (config.mostrarFiltros || config.mostrarBusqueda) {
                html += '<div class="doc-library__filtros">';

                if (config.mostrarFiltros) {
                    html += '\
                        <div class="doc-library__filtro-grupo">\
                            <label for="doc-filtro-categoria">Categoria:</label>\
                            <select id="doc-filtro-categoria" class="doc-library__select">\
                                <option value="">Todas</option>\
                                ' + config.categorias.map(function(cat) {
                                    return '<option value="' + cat.valor + '">' + cat.nombre + '</option>';
                                }).join('') + '\
                            </select>\
                        </div>\
                        <div class="doc-library__filtro-grupo">\
                            <label for="doc-filtro-tipo">Tipo:</label>\
                            <select id="doc-filtro-tipo" class="doc-library__select">\
                                <option value="">Todos</option>\
                                ' + config.tipos.map(function(tipo) {
                                    return '<option value="' + tipo.valor + '">' + tipo.nombre + '</option>';
                                }).join('') + '\
                            </select>\
                        </div>\
                    ';
                }

                if (config.mostrarBusqueda) {
                    html += '\
                        <div class="doc-library__filtro-grupo doc-library__filtro-grupo--busqueda">\
                            <label for="doc-filtro-busqueda">Buscar:</label>\
                            <input type="search" id="doc-filtro-busqueda" class="doc-library__input" placeholder="Escriba para buscar...">\
                        </div>\
                    ';
                }

                html += '</div>';
            }

            // Contador
            if (config.mostrarContador) {
                html += '\
                    <p class="doc-library__contador">\
                        Mostrando <span id="doc-contador">' + this._documentos.length + '</span> documentos\
                    </p>\
                ';
            }

            // Lista
            html += '<div class="doc-library__lista" id="doc-lista"></div>';

            // Sin resultados
            html += '\
                <div class="doc-library__sin-resultados" id="doc-sin-resultados" style="display: none;">\
                    <p>No se encontraron documentos con los filtros seleccionados.</p>\
                </div>\
            ';

            this.innerHTML = html;

            // Guardar referencias
            this._elementos = {
                lista: this.querySelector('#doc-lista'),
                contador: this.querySelector('#doc-contador'),
                sinResultados: this.querySelector('#doc-sin-resultados'),
                filtroCategoria: this.querySelector('#doc-filtro-categoria'),
                filtroTipo: this.querySelector('#doc-filtro-tipo'),
                filtroBusqueda: this.querySelector('#doc-filtro-busqueda')
            };
        }

        _initEventos() {
            var self = this;
            var el = this._elementos;

            if (el.filtroCategoria) {
                el.filtroCategoria.addEventListener('change', function() {
                    self._renderizarLista();
                });
            }

            if (el.filtroTipo) {
                el.filtroTipo.addEventListener('change', function() {
                    self._renderizarLista();
                });
            }

            if (el.filtroBusqueda) {
                var timeout = null;
                el.filtroBusqueda.addEventListener('input', function() {
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        self._renderizarLista();
                    }, 300);
                });
            }
        }

        _filtrarDocumentos() {
            var el = this._elementos;
            var categoria = el.filtroCategoria ? el.filtroCategoria.value.toLowerCase() : '';
            var tipo = el.filtroTipo ? el.filtroTipo.value.toLowerCase() : '';
            var busqueda = el.filtroBusqueda ? el.filtroBusqueda.value.toLowerCase().trim() : '';

            return this._documentos.filter(function(doc) {
                if (categoria && doc.categoria !== categoria) return false;
                if (tipo && doc.tipo !== tipo) return false;
                if (busqueda) {
                    var texto = (doc.titulo + ' ' + doc.descripcion + ' ' + doc.categoria).toLowerCase();
                    if (texto.indexOf(busqueda) === -1) return false;
                }
                return true;
            });
        }


        _nombreCategoria(categoria) {
            var nombres = {
                'informes': 'Informe',
                'planes': 'Plan',
                'otros': 'Otro'
            };
            return nombres[categoria] || categoria;
        }

        _renderizarDocumento(doc) {
            var icono = LuthierUtils.obtenerIconoDocumento(doc.tipo);
            var archivoSeguro = LuthierUtils.sanitizarURL(doc.archivo);
            var tituloSeguro = LuthierUtils.escaparHTML(doc.titulo);
            var descripcionSegura = LuthierUtils.escaparHTML(doc.descripcion);
            var tamanoSeguro = LuthierUtils.escaparHTML(doc.tamano);

            return '\
                <article class="doc-library__card">\
                    <div class="doc-library__card-icono doc-library__card-icono--' + icono.clase + '">\
                        ' + icono.icono + '\
                    </div>\
                    <div class="doc-library__card-contenido">\
                        <h2 class="doc-library__card-titulo">\
                            <a href="' + archivoSeguro + '" target="_blank" rel="noopener noreferrer">' + tituloSeguro + '</a>\
                        </h2>\
                        <p class="doc-library__card-descripcion">' + descripcionSegura + '</p>\
                        <div class="doc-library__card-meta">\
                            <span class="doc-library__card-meta-item">&#128197; ' + LuthierDate.formatoCorto(doc.fecha) + '</span>\
                            <span class="doc-library__card-meta-item">&#128230; ' + tamanoSeguro + '</span>\
                            <span class="doc-library__card-meta-item">\
                                <span class="doc-library__card-categoria">' + this._nombreCategoria(doc.categoria) + '</span>\
                            </span>\
                            <span class="doc-library__card-meta-item">' + LuthierUtils.escaparHTML(doc.tipo.toUpperCase()) + '</span>\
                        </div>\
                    </div>\
                    <div class="doc-library__card-acciones">\
                        <a href="' + archivoSeguro + '" target="_blank" rel="noopener noreferrer" class="doc-library__btn doc-library__btn--primario" download>\
                            &#11015; Descargar\
                        </a>\
                        <a href="' + archivoSeguro + '" target="_blank" rel="noopener noreferrer" class="doc-library__btn doc-library__btn--secundario">\
                            &#128065; Ver\
                        </a>\
                    </div>\
                </article>\
            ';
        }

        _renderizarLista() {
            var self = this;
            var el = this._elementos;
            var documentos = this._filtrarDocumentos();

            // Actualizar contador
            if (el.contador) {
                el.contador.textContent = documentos.length;
            }

            // Sin resultados
            if (documentos.length === 0) {
                el.lista.style.display = 'none';
                el.sinResultados.style.display = 'block';
                return;
            }

            el.lista.style.display = 'flex';
            el.sinResultados.style.display = 'none';

            // Renderizar
            var html = '';
            for (var i = 0; i < documentos.length; i++) {
                html += self._renderizarDocumento(documentos[i]);
            }
            el.lista.innerHTML = html;
        }
    }

    if (!customElements.get('luthier-doc-library')) {
        customElements.define('luthier-doc-library', LuthierDocLibrary);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierDocLibrary = LuthierDocLibrary;

})(typeof window !== 'undefined' ? window : this);
