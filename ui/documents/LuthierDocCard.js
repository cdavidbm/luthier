/**
 * LuthierDocCard - Tarjeta individual de documento
 *
 * Componente para mostrar un documento individual con:
 * - Icono automatico segun tipo
 * - Metadatos (fecha, tamano, tipo)
 * - Botones de descarga y visualizacion
 *
 * ATRIBUTOS:
 * - titulo  : Titulo del documento
 * - archivo : URL del archivo
 * - tipo    : Tipo de archivo (pdf, xlsx, docx, etc)
 * - fecha   : Fecha en formato ISO (2024-01-15)
 * - tamano  : Tamano del archivo (ej: "1.5 MB")
 * - descripcion : Descripcion breve (opcional)
 *
 * @example
 * <luthier-doc-card
 *     titulo="Informe Anual 2024"
 *     archivo="docs/informe-2024.pdf"
 *     tipo="pdf"
 *     fecha="2024-01-15"
 *     tamano="2.3 MB">
 * </luthier-doc-card>
 */
(function(global) {
    'use strict';

    class LuthierDocCard extends HTMLElement {

        connectedCallback() {
            var config = {
                titulo: this.getAttribute('titulo') || 'Documento',
                archivo: this.getAttribute('archivo') || '#',
                tipo: this.getAttribute('tipo') || 'pdf',
                fecha: this.getAttribute('fecha') || '',
                tamano: this.getAttribute('tamano') || '',
                descripcion: this.getAttribute('descripcion') || ''
            };

            this.classList.add('doc-card-wrapper');
            this.innerHTML = this._render(config);
        }

        _render(config) {
            var icono = LuthierUtils.obtenerIconoDocumento(config.tipo);
            var fechaFormateada = config.fecha ? LuthierDate.formatoCorto(config.fecha) : '';
            var archivoSeguro = LuthierUtils.sanitizarURL(config.archivo);
            var tituloSeguro = LuthierUtils.escaparHTML(config.titulo);
            var descripcionSegura = LuthierUtils.escaparHTML(config.descripcion);

            return '\
                <article class="doc-card">\
                    <div class="doc-card__icono doc-card__icono--' + icono.clase + '">\
                        ' + icono.icono + '\
                    </div>\
                    <div class="doc-card__contenido">\
                        <h3 class="doc-card__titulo">\
                            <a href="' + archivoSeguro + '" target="_blank" rel="noopener noreferrer">' + tituloSeguro + '</a>\
                        </h3>\
                        ' + (config.descripcion ? '<p class="doc-card__descripcion">' + descripcionSegura + '</p>' : '') + '\
                        <div class="doc-card__meta">\
                            ' + (fechaFormateada ? '<span class="doc-card__meta-item">&#128197; ' + fechaFormateada + '</span>' : '') + '\
                            ' + (config.tamano ? '<span class="doc-card__meta-item">&#128230; ' + LuthierUtils.escaparHTML(config.tamano) + '</span>' : '') + '\
                            <span class="doc-card__meta-item doc-card__tipo">' + LuthierUtils.escaparHTML(config.tipo.toUpperCase()) + '</span>\
                        </div>\
                    </div>\
                    <div class="doc-card__acciones">\
                        <a href="' + archivoSeguro + '" class="doc-card__btn doc-card__btn--descargar" download title="Descargar" rel="noopener noreferrer">\
                            &#11015;\
                        </a>\
                        <a href="' + archivoSeguro + '" target="_blank" rel="noopener noreferrer" class="doc-card__btn doc-card__btn--ver" title="Ver">\
                            &#128065;\
                        </a>\
                    </div>\
                </article>\
            ';
        }

    }

    if (!customElements.get('luthier-doc-card')) {
        customElements.define('luthier-doc-card', LuthierDocCard);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierDocCard = LuthierDocCard;

})(typeof window !== 'undefined' ? window : this);
