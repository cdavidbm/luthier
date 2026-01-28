/**
 * LuthierContent - Componente de alto nivel para contenido con frontmatter
 *
 * Combina la carga de archivos Markdown con extraccion de metadatos
 * y renderizado. Soporta tanto archivos individuales como colecciones.
 *
 * MODOS DE USO:
 *
 * 1. Archivo individual (src):
 *    <luthier-content src="content/posts/mi-articulo.md">
 *      <template slot="header">
 *        <h1>{{title}}</h1>
 *        <time>{{date}}</time>
 *      </template>
 *    </luthier-content>
 *
 * 2. Coleccion (collection):
 *    <luthier-content
 *      collection="content/posts"
 *      limit="6"
 *      ordenar="date"
 *      export-to="POSTS">
 *    </luthier-content>
 *
 * ATRIBUTOS:
 * - src : Ruta a un archivo .md individual
 * - collection : Ruta a una carpeta con coleccion de .md
 * - limit : Limite de items para colecciones
 * - ordenar : Campo por el cual ordenar
 * - orden : Direccion de orden ('asc' o 'desc', default: 'desc')
 * - export-to : Nombre de variable global donde exportar los datos
 * - template : Template para renderizado de coleccion ('card', 'lista', 'grid')
 *
 * SLOTS:
 * - header : Template para cabecera con metadatos (usa {{campo}} para interpolacion)
 * - footer : Template para pie del contenido
 *
 * EVENTOS:
 * - luthier:content-loaded : Emitido cuando el contenido se ha cargado
 *   (detail: { type: 'single'|'collection', data: Object|Array, src: string })
 *
 * @example Articulo individual con metadatos
 * <luthier-content src="content/posts/bienvenida.md">
 *   <template slot="header">
 *     <header class="articulo-header">
 *       <h1>{{title}}</h1>
 *       <div class="meta">
 *         <time datetime="{{date}}">{{date}}</time>
 *         <span class="autor">Por {{author}}</span>
 *       </div>
 *     </header>
 *   </template>
 * </luthier-content>
 *
 * @example Cargar coleccion y exportar
 * <luthier-content
 *   collection="content/posts"
 *   limit="5"
 *   ordenar="date"
 *   export-to="ULTIMOS_POSTS">
 * </luthier-content>
 *
 * <luthier-loop source="ULTIMOS_POSTS" template="card"></luthier-loop>
 *
 * @version 1.0.0
 * @license MIT
 */
(function(global) {
    'use strict';

    class LuthierContent extends HTMLElement {

        connectedCallback() {
            this._data = null;
            this._type = null;
            this._loaded = false;

            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            var src = this.getAttribute('src');
            var collection = this.getAttribute('collection');

            if (src) {
                this._type = 'single';
                this._cargarIndividual(src);
            } else if (collection) {
                this._type = 'collection';
                this._cargarColeccion(collection);
            } else {
                this._mostrarError('Debe especificar atributo "src" o "collection"');
            }
        }

        /**
         * Carga un archivo MD individual con frontmatter
         * @private
         */
        _cargarIndividual(src) {
            var self = this;

            // Mostrar estado de carga
            this._mostrarCargando();

            // Crear elemento luthier-markdown interno
            var md = document.createElement('luthier-markdown');
            md.setAttribute('src', src);
            md.setAttribute('extract-frontmatter', '');
            md.style.display = 'none';

            // Escuchar cuando se cargue
            md.addEventListener('luthier:markdown-loaded', function(e) {
                self._data = {
                    frontmatter: e.detail.frontmatter,
                    body: e.detail.body,
                    src: src
                };

                // Renderizar con metadatos
                self._renderizarIndividual(e.detail);

                // Remover el markdown temporal
                if (md.parentNode) {
                    md.parentNode.removeChild(md);
                }

                self._loaded = true;
                self._emitirEvento();
            });

            md.addEventListener('luthier:markdown-rendered', function() {
                // El markdown se renderizo, pero esperamos al evento markdown-loaded
                // para tener acceso al frontmatter
            });

            // Agregar temporalmente para que se cargue
            document.body.appendChild(md);
        }

        /**
         * Carga una coleccion de archivos MD
         * @private
         */
        _cargarColeccion(carpeta) {
            var self = this;

            // Verificar que LuthierCollections este disponible
            if (!global.LuthierCollections) {
                this._mostrarError('LuthierCollections no esta disponible. Incluya collection-loader.js');
                return;
            }

            // Mostrar estado de carga
            this._mostrarCargando();

            // Opciones de carga
            var opciones = {
                ordenar: this.getAttribute('ordenar') || this.getAttribute('sort') || 'date',
                orden: this.getAttribute('orden') || this.getAttribute('order') || 'desc',
                limite: parseInt(this.getAttribute('limit') || this.getAttribute('limite'), 10) || 0,
                cargarContenido: this.hasAttribute('load-content')
            };

            // Filtro opcional
            var filtroAttr = this.getAttribute('filtro') || this.getAttribute('filter');
            if (filtroAttr) {
                try {
                    opciones.filtro = JSON.parse(filtroAttr);
                } catch (e) {
                    console.warn('LuthierContent: filtro invalido, ignorando');
                }
            }

            // Cargar coleccion
            global.LuthierCollections.cargar(carpeta, opciones, function(items, error) {
                if (error) {
                    self._mostrarError('Error al cargar coleccion: ' + (error.message || error));
                    return;
                }

                self._data = items;

                // Exportar a variable global si se especifico
                var exportTo = self.getAttribute('export-to') || self.getAttribute('exportTo');
                if (exportTo) {
                    global[exportTo] = items;
                }

                // Renderizar coleccion
                self._renderizarColeccion(items);

                self._loaded = true;
                self._emitirEvento();
            });
        }

        /**
         * Muestra estado de carga
         * @private
         */
        _mostrarCargando() {
            var loading = document.createElement('div');
            loading.className = 'content-loading';
            loading.textContent = 'Cargando...';
            this.textContent = '';
            this.appendChild(loading);
        }

        /**
         * Muestra un error
         * @private
         */
        _mostrarError(mensaje) {
            var error = document.createElement('div');
            error.className = 'content-error';
            error.textContent = mensaje;
            this.textContent = '';
            this.appendChild(error);
            console.error('LuthierContent:', mensaje);
        }

        /**
         * Renderiza contenido individual con metadatos
         * @private
         */
        _renderizarIndividual(detail) {
            var self = this;
            this.textContent = '';

            // Procesar template de header si existe
            var headerTemplate = this.querySelector('template[slot="header"]');
            if (headerTemplate && detail.frontmatter) {
                var header = this._procesarTemplate(headerTemplate, detail.frontmatter);
                this.appendChild(header);
            }

            // Crear contenedor para el body
            var bodyContainer = document.createElement('div');
            bodyContainer.className = 'content-body';

            // Crear luthier-markdown para renderizar el body
            var mdElement = document.createElement('luthier-markdown');
            bodyContainer.appendChild(mdElement);
            this.appendChild(bodyContainer);

            // Renderizar el body (sin frontmatter, ya fue extraido)
            mdElement.renderizar(detail.body);

            // Procesar template de footer si existe
            var footerTemplate = this.querySelector('template[slot="footer"]');
            if (footerTemplate && detail.frontmatter) {
                var footer = this._procesarTemplate(footerTemplate, detail.frontmatter);
                this.appendChild(footer);
            }

            this.classList.add('content-loaded');
        }

        /**
         * Renderiza una coleccion de items
         * @private
         */
        _renderizarColeccion(items) {
            this.textContent = '';

            if (items.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'content-empty';
                empty.textContent = 'No hay contenido disponible';
                this.appendChild(empty);
                return;
            }

            // Verificar si hay un template personalizado como hijo
            var customTemplate = this.querySelector('template[slot="item"]');

            if (customTemplate) {
                // Usar template personalizado
                var container = document.createElement('div');
                container.className = 'content-collection';

                for (var i = 0; i < items.length; i++) {
                    var itemEl = this._procesarTemplate(customTemplate, items[i]);
                    container.appendChild(itemEl);
                }

                this.appendChild(container);
            } else {
                // Usar LuthierLoop si esta disponible
                var templateType = this.getAttribute('template') || 'card';

                if (global.customElements.get('luthier-loop')) {
                    var loop = document.createElement('luthier-loop');
                    loop.setAttribute('datos', JSON.stringify(items));
                    loop.setAttribute('template', templateType);
                    this.appendChild(loop);
                } else {
                    // Fallback: lista simple
                    var list = document.createElement('ul');
                    list.className = 'content-list';

                    for (var j = 0; j < items.length; j++) {
                        var li = document.createElement('li');
                        var a = document.createElement('a');
                        a.href = items[j].url || items[j]._path || '#';
                        a.textContent = items[j].title || items[j].titulo || items[j]._slug;
                        li.appendChild(a);
                        list.appendChild(li);
                    }

                    this.appendChild(list);
                }
            }

            this.classList.add('content-loaded');
        }

        /**
         * Propiedades peligrosas que no deben accederse (prevencion de prototype pollution)
         * @private
         */
        _propiedadesPeligrosas: ['__proto__', 'constructor', 'prototype'],

        /**
         * Verifica si una propiedad es segura para acceder
         * @private
         */
        _esPropiedadSegura: function(obj, prop) {
            // Prevenir prototype pollution
            if (this._propiedadesPeligrosas.indexOf(prop) !== -1) {
                return false;
            }
            // Usar hasOwnProperty de Object.prototype directamente para seguridad
            return Object.prototype.hasOwnProperty.call(obj, prop);
        },

        /**
         * Obtiene un valor de un objeto de forma segura (previene prototype pollution)
         * @private
         */
        _obtenerValorSeguro: function(data, campo) {
            var partes = campo.split('.');
            var valor = data;

            for (var i = 0; i < partes.length; i++) {
                var parte = partes[i];

                // Verificar que es un objeto valido y la propiedad es segura
                if (valor && typeof valor === 'object' && this._esPropiedadSegura(valor, parte)) {
                    valor = valor[parte];
                } else {
                    return '';
                }
            }

            return valor;
        },

        /**
         * Escapa HTML para prevenir XSS
         * @private
         */
        _escaparHTML: function(valor) {
            return LuthierUtils.escaparHTML(valor);
        },

        /**
         * Procesa un template reemplazando {{campo}} con valores
         * Usa manipulacion DOM segura en lugar de innerHTML
         * @private
         */
        _procesarTemplate: function(template, data) {
            var self = this;

            // Clonar el contenido del template
            var clone = template.content.cloneNode(true);

            // Procesar todos los nodos de texto que contienen {{campo}}
            var walker = document.createTreeWalker(
                clone,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            var nodosTexto = [];
            var node;
            while (node = walker.nextNode()) {
                if (node.nodeValue && node.nodeValue.indexOf('{{') !== -1) {
                    nodosTexto.push(node);
                }
            }

            // Procesar cada nodo de texto encontrado
            nodosTexto.forEach(function(nodo) {
                var texto = nodo.nodeValue;
                var nuevoTexto = texto.replace(/\{\{([^}]+)\}\}/g, function(match, campo) {
                    campo = campo.trim();
                    var valor = self._obtenerValorSeguro(data, campo);
                    return self._escaparHTML(valor);
                });
                nodo.nodeValue = nuevoTexto;
            });

            // Procesar atributos que contienen {{campo}}
            var elementos = clone.querySelectorAll('*');
            for (var i = 0; i < elementos.length; i++) {
                var el = elementos[i];
                var attrs = el.attributes;

                for (var j = 0; j < attrs.length; j++) {
                    var attr = attrs[j];
                    if (attr.value && attr.value.indexOf('{{') !== -1) {
                        attr.value = attr.value.replace(/\{\{([^}]+)\}\}/g, function(match, campo) {
                            campo = campo.trim();
                            var valor = self._obtenerValorSeguro(data, campo);
                            return self._escaparHTML(valor);
                        });
                    }
                }
            }

            // Crear contenedor para el resultado
            var container = document.createElement('div');
            container.appendChild(clone);

            // Si solo hay un hijo, retornarlo directamente
            if (container.children.length === 1) {
                return container.children[0];
            }

            // Si hay multiples hijos, retornar el contenedor
            return container;
        }

        /**
         * Emite evento de contenido cargado
         * @private
         */
        _emitirEvento() {
            this.dispatchEvent(new CustomEvent('luthier:content-loaded', {
                bubbles: true,
                detail: {
                    type: this._type,
                    data: this._data,
                    src: this.getAttribute('src') || this.getAttribute('collection')
                }
            }));
        }

        // =====================================================================
        // API PUBLICA
        // =====================================================================

        /**
         * Retorna los datos cargados
         * @returns {Object|Array|null}
         */
        getData() {
            return this._data;
        }

        /**
         * Retorna el frontmatter (solo para tipo 'single')
         * @returns {Object|null}
         */
        getFrontmatter() {
            if (this._type === 'single' && this._data) {
                return this._data.frontmatter;
            }
            return null;
        }

        /**
         * Verifica si el contenido ya se cargo
         * @returns {boolean}
         */
        isLoaded() {
            return this._loaded;
        }

        /**
         * Recarga el contenido
         */
        reload() {
            this._loaded = false;
            this._data = null;
            this._init();
        }
    }

    // Registrar el componente
    if (!customElements.get('luthier-content')) {
        customElements.define('luthier-content', LuthierContent);
    }

    // Exportar globalmente
    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierContent = LuthierContent;

})(typeof window !== 'undefined' ? window : this);
