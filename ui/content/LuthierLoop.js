/**
 * LuthierLoop - Iterador de contenido
 *
 * Componente para iterar sobre datos y renderizar contenido repetitivo
 * como listas de noticias, cards, articulos, etc.
 *
 * SEGURIDAD:
 * Este componente usa DOM APIs (createElement, textContent) en lugar de
 * innerHTML para prevenir vulnerabilidades XSS. Todo el contenido de usuario
 * se escapa automáticamente mediante textContent.
 *
 * FUENTES DE DATOS:
 * 1. Atributo 'source': nombre de variable global (window.ARTICULOS)
 * 2. Atributo 'datos': JSON inline
 * 3. window.LUTHIER_CONFIG.datos[source]
 *
 * ATRIBUTOS:
 * - source   : Nombre de la variable global con los datos
 * - datos    : JSON string con datos inline
 * - limit    : Numero maximo de items a mostrar
 * - ordenar  : Campo por el que ordenar (ej: "fecha")
 * - orden    : "asc" | "desc" (default: "desc")
 * - template : Tipo de template a usar (card, lista, grid)
 * - vacio    : Mensaje cuando no hay datos
 *
 * TEMPLATES DISPONIBLES:
 * - card: Renderiza cada item como luthier-card
 * - lista: Renderiza como lista simple
 * - grid: Renderiza en grid responsivo
 * - custom: Usa el contenido interno como template
 *
 * @example Con source global
 * <luthier-loop source="ARTICULOS" limit="6" template="card"></luthier-loop>
 *
 * @example Con datos inline
 * <luthier-loop datos='[{"titulo":"A"},{"titulo":"B"}]' template="lista"></luthier-loop>
 */
(function(global) {
    'use strict';

    class LuthierLoop extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            var config = {
                source: this.getAttribute('source') || '',
                limit: parseInt(this.getAttribute('limit'), 10) || 0,
                ordenar: this.getAttribute('ordenar') || '',
                orden: this.getAttribute('orden') || 'desc',
                template: this.getAttribute('template') || 'card',
                vacio: this.getAttribute('vacio') || 'No hay elementos para mostrar'
            };

            var datos = this._obtenerDatos(config);

            // Aplicar ordenamiento
            if (config.ordenar && datos.length > 0) {
                datos = typeof LuthierData !== 'undefined'
                    ? LuthierData.ordenarPor(datos, config.ordenar, config.orden)
                    : datos;
            }

            if (config.limit > 0 && datos.length > config.limit) {
                datos = datos.slice(0, config.limit);
            }

            this.classList.add('loop-wrapper');
            this.classList.add('loop-wrapper--' + config.template);

            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            // Renderizar usando DOM APIs (seguro contra XSS)
            var contenido = this._render(datos, config);
            this.appendChild(contenido);
        }

        _obtenerDatos(config) {
            var datos = [];

            // 1. Intentar desde atributo datos (JSON inline)
            var datosAttr = this.getAttribute('datos');
            if (datosAttr) {
                try {
                    datos = JSON.parse(datosAttr);
                } catch (e) {
                    console.warn('LuthierLoop: Error parseando atributo "datos"', e);
                }
            }
            // 2. Intentar desde source (variable global)
            else if (config.source && global[config.source]) {
                datos = global[config.source];
            }
            // 3. Intentar desde LUTHIER_CONFIG
            else if (config.source && global.LUTHIER_CONFIG && global.LUTHIER_CONFIG.datos) {
                datos = global.LUTHIER_CONFIG.datos[config.source] || [];
            }

            return Array.isArray(datos) ? datos : [];
        }

        /**
         * Renderiza el contenido como elementos DOM (no strings)
         * @param {Array} datos - Array de items a renderizar
         * @param {Object} config - Configuración del componente
         * @returns {HTMLElement} Elemento contenedor con el contenido
         */
        _render(datos, config) {
            var self = this;

            // Caso vacío
            if (datos.length === 0) {
                var pVacio = document.createElement('p');
                pVacio.className = 'loop__vacio';
                pVacio.textContent = config.vacio;
                return pVacio;
            }

            var contenedor;
            var i;

            switch (config.template) {
                case 'card':
                    contenedor = document.createElement('div');
                    contenedor.className = 'loop__grid';
                    for (i = 0; i < datos.length; i++) {
                        contenedor.appendChild(self._renderCard(datos[i]));
                    }
                    break;

                case 'lista':
                    contenedor = document.createElement('ul');
                    contenedor.className = 'loop__lista';
                    for (i = 0; i < datos.length; i++) {
                        contenedor.appendChild(self._renderListaItem(datos[i]));
                    }
                    break;

                case 'grid':
                    contenedor = document.createElement('div');
                    contenedor.className = 'loop__grid loop__grid--auto';
                    for (i = 0; i < datos.length; i++) {
                        var divItem = document.createElement('div');
                        divItem.className = 'loop__item';
                        divItem.appendChild(self._renderItem(datos[i]));
                        contenedor.appendChild(divItem);
                    }
                    break;

                default:
                    // Template genérico - usar fragment
                    contenedor = document.createDocumentFragment();
                    for (i = 0; i < datos.length; i++) {
                        contenedor.appendChild(self._renderItem(datos[i]));
                    }
            }

            return contenedor;
        }

        /**
         * Renderiza un item como card usando DOM APIs
         * @param {Object} item - Datos del item
         * @returns {HTMLElement} Elemento article
         */
        _renderCard(item) {
            var imagen = item.imagen || '';
            var titulo = item.titulo || item.nombre || '';
            var resumen = item.resumen || item.descripcion || '';
            var enlace = LuthierUtils.sanitizarURL(item.url || item.enlace || item.slug || '#');
            var fecha = item.fecha ? LuthierDate.formatoCorto(item.fecha) : '';
            var categoria = item.categoriaNombre || item.categoria || '';

            var article = document.createElement('article');
            article.className = 'loop__card';

            // Imagen (si existe)
            if (imagen) {
                var divImagen = document.createElement('div');
                divImagen.className = 'loop__card-imagen';
                var linkImagen = document.createElement('a');
                linkImagen.href = enlace;
                var img = document.createElement('img');
                img.src = imagen;
                img.alt = titulo;
                img.loading = 'lazy';
                linkImagen.appendChild(img);
                divImagen.appendChild(linkImagen);
                article.appendChild(divImagen);
            }

            // Cuerpo
            var divCuerpo = document.createElement('div');
            divCuerpo.className = 'loop__card-cuerpo';

            // Categoría
            if (categoria) {
                var spanCategoria = document.createElement('span');
                spanCategoria.className = 'loop__card-categoria';
                spanCategoria.textContent = categoria;
                divCuerpo.appendChild(spanCategoria);
            }

            // Título
            var h3 = document.createElement('h3');
            h3.className = 'loop__card-titulo';
            var linkTitulo = document.createElement('a');
            linkTitulo.href = enlace;
            linkTitulo.textContent = titulo;
            h3.appendChild(linkTitulo);
            divCuerpo.appendChild(h3);

            // Resumen
            if (resumen) {
                var p = document.createElement('p');
                p.className = 'loop__card-resumen';
                p.textContent = resumen;
                divCuerpo.appendChild(p);
            }

            // Fecha
            if (fecha) {
                var time = document.createElement('time');
                time.className = 'loop__card-fecha';
                time.textContent = fecha;
                divCuerpo.appendChild(time);
            }

            article.appendChild(divCuerpo);
            return article;
        }

        /**
         * Renderiza un item como elemento de lista usando DOM APIs
         * @param {Object} item - Datos del item
         * @returns {HTMLElement} Elemento li
         */
        _renderListaItem(item) {
            var titulo = item.titulo || item.nombre || '';
            var enlace = LuthierUtils.sanitizarURL(item.url || item.enlace || item.slug || '#');
            var fecha = item.fecha ? LuthierDate.formatoCorto(item.fecha) : '';

            var li = document.createElement('li');
            li.className = 'loop__lista-item';

            var a = document.createElement('a');
            a.href = enlace;
            a.textContent = titulo;
            li.appendChild(a);

            if (fecha) {
                var time = document.createElement('time');
                time.textContent = fecha;
                li.appendChild(time);
            }

            return li;
        }

        /**
         * Renderiza un item genérico usando DOM APIs
         * @param {Object} item - Datos del item
         * @returns {HTMLElement} Elemento div
         */
        _renderItem(item) {
            var titulo = item.titulo || item.nombre || '';
            var resumen = item.resumen || item.descripcion || '';
            var enlace = LuthierUtils.sanitizarURL(item.url || item.enlace || item.slug || '');

            var div = document.createElement('div');
            div.className = 'loop__item-contenido';

            var strong = document.createElement('strong');
            strong.textContent = titulo;

            if (enlace) {
                var a = document.createElement('a');
                a.href = enlace;
                a.appendChild(strong);
                div.appendChild(a);
            } else {
                div.appendChild(strong);
            }

            if (resumen) {
                var p = document.createElement('p');
                p.textContent = resumen;
                div.appendChild(p);
            }

            return div;
        }

    }

    if (!customElements.get('luthier-loop')) {
        customElements.define('luthier-loop', LuthierLoop);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierLoop = LuthierLoop;

})(typeof window !== 'undefined' ? window : this);
