/**
 * LuthierAccordion - Acordeon accesible
 *
 * Componente de acordeon con:
 * - Navegacion completa por teclado (flechas, Home, End)
 * - Soporte ARIA completo
 * - Modo multiple (varios abiertos) o unico
 * - Animacion de apertura/cierre
 *
 * ATRIBUTOS:
 * - multiple : Permite tener varios items abiertos a la vez
 * - abierto  : Indice del item abierto por defecto (ej: "0")
 *
 * ESTRUCTURA REQUERIDA:
 * El componente espera elementos con atributos data-titulo o usa
 * la estructura de elementos hijos directos como items.
 *
 * @example Uso basico
 * <luthier-accordion>
 *     <div data-titulo="Seccion 1">
 *         <p>Contenido de la seccion 1...</p>
 *     </div>
 *     <div data-titulo="Seccion 2">
 *         <p>Contenido de la seccion 2...</p>
 *     </div>
 * </luthier-accordion>
 *
 * @example Modo multiple con item abierto
 * <luthier-accordion multiple abierto="0">
 *     <div data-titulo="FAQ 1">Respuesta 1</div>
 *     <div data-titulo="FAQ 2">Respuesta 2</div>
 * </luthier-accordion>
 */
(function(global) {
    'use strict';

    class LuthierAccordion extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                multiple: this.hasAttribute('multiple'),
                abierto: this.getAttribute('abierto')
            };

            // Obtener items del contenido original
            var items = this._extraerItems();

            if (items.length === 0) {
                console.warn('LuthierAccordion: No se encontraron items');
                return;
            }

            this.classList.add('accordion-wrapper');
            this.innerHTML = this._render(items);
            this._initEventos();

            // Abrir item por defecto
            if (this._config.abierto !== null) {
                var indice = parseInt(this._config.abierto, 10);
                if (!isNaN(indice) && indice >= 0 && indice < items.length) {
                    this._abrirItem(indice);
                }
            }
        }

        _extraerItems() {
            var items = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                var titulo = hijo.getAttribute('data-titulo') || hijo.querySelector('summary')?.textContent || 'Item ' + (i + 1);
                var contenido = hijo.innerHTML;

                // Si es un details, extraer contenido sin summary
                if (hijo.tagName === 'DETAILS') {
                    var summary = hijo.querySelector('summary');
                    if (summary) {
                        titulo = summary.textContent;
                        contenido = hijo.innerHTML.replace(summary.outerHTML, '');
                    }
                }

                items.push({
                    titulo: titulo,
                    contenido: contenido,
                    abierto: false
                });
            }

            return items;
        }

        _render(items) {
            var self = this;
            var html = '<div class="accordion" role="presentation">';

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var headerId = 'accordion-header-' + i;
                var panelId = 'accordion-panel-' + i;

                html += '\
                    <div class="accordion__item" data-index="' + i + '">\
                        <h3 class="accordion__header">\
                            <button type="button"\
                                    class="accordion__trigger"\
                                    id="' + headerId + '"\
                                    aria-expanded="false"\
                                    aria-controls="' + panelId + '">\
                                <span class="accordion__titulo">' + item.titulo + '</span>\
                                <span class="accordion__icono" aria-hidden="true">&#9660;</span>\
                            </button>\
                        </h3>\
                        <div class="accordion__panel"\
                             id="' + panelId + '"\
                             role="region"\
                             aria-labelledby="' + headerId + '"\
                             hidden>\
                            <div class="accordion__contenido">\
                                ' + item.contenido + '\
                            </div>\
                        </div>\
                    </div>\
                ';
            }

            html += '</div>';
            return html;
        }

        _initEventos() {
            var self = this;
            var triggers = this.querySelectorAll('.accordion__trigger');

            for (var i = 0; i < triggers.length; i++) {
                (function(trigger, index) {
                    // Click
                    trigger.addEventListener('click', function() {
                        self._toggleItem(index);
                    });

                    // Teclado
                    trigger.addEventListener('keydown', function(e) {
                        self._manejarTeclado(e, index, triggers.length);
                    });
                })(triggers[i], i);
            }
        }

        _manejarTeclado(e, indiceActual, total) {
            var triggers = this.querySelectorAll('.accordion__trigger');
            var nuevoIndice = -1;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    nuevoIndice = (indiceActual + 1) % total;
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    nuevoIndice = (indiceActual - 1 + total) % total;
                    break;

                case 'Home':
                    e.preventDefault();
                    nuevoIndice = 0;
                    break;

                case 'End':
                    e.preventDefault();
                    nuevoIndice = total - 1;
                    break;

                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this._toggleItem(indiceActual);
                    return;
            }

            if (nuevoIndice >= 0 && triggers[nuevoIndice]) {
                triggers[nuevoIndice].focus();
            }
        }

        _toggleItem(indice) {
            var item = this.querySelector('.accordion__item[data-index="' + indice + '"]');
            if (!item) return;

            var trigger = item.querySelector('.accordion__trigger');
            var panel = item.querySelector('.accordion__panel');
            var estaAbierto = trigger.getAttribute('aria-expanded') === 'true';

            if (estaAbierto) {
                this._cerrarItem(indice);
            } else {
                // Si no es multiple, cerrar los demas
                if (!this._config.multiple) {
                    this._cerrarTodos();
                }
                this._abrirItem(indice);
            }
        }

        _abrirItem(indice) {
            var item = this.querySelector('.accordion__item[data-index="' + indice + '"]');
            if (!item) return;

            var trigger = item.querySelector('.accordion__trigger');
            var panel = item.querySelector('.accordion__panel');
            var icono = item.querySelector('.accordion__icono');

            item.classList.add('accordion__item--abierto');
            trigger.setAttribute('aria-expanded', 'true');
            panel.removeAttribute('hidden');
            if (icono) icono.innerHTML = '&#9650;';

            // Emitir evento
            this.dispatchEvent(new CustomEvent('luthier:accordion-open', {
                bubbles: true,
                detail: { indice: indice }
            }));
        }

        _cerrarItem(indice) {
            var item = this.querySelector('.accordion__item[data-index="' + indice + '"]');
            if (!item) return;

            var trigger = item.querySelector('.accordion__trigger');
            var panel = item.querySelector('.accordion__panel');
            var icono = item.querySelector('.accordion__icono');

            item.classList.remove('accordion__item--abierto');
            trigger.setAttribute('aria-expanded', 'false');
            panel.setAttribute('hidden', '');
            if (icono) icono.innerHTML = '&#9660;';

            // Emitir evento
            this.dispatchEvent(new CustomEvent('luthier:accordion-close', {
                bubbles: true,
                detail: { indice: indice }
            }));
        }

        _cerrarTodos() {
            var items = this.querySelectorAll('.accordion__item');
            for (var i = 0; i < items.length; i++) {
                var indice = parseInt(items[i].getAttribute('data-index'), 10);
                this._cerrarItem(indice);
            }
        }

        // API publica
        abrir(indice) {
            this._abrirItem(indice);
        }

        cerrar(indice) {
            this._cerrarItem(indice);
        }

        cerrarTodos() {
            this._cerrarTodos();
        }

        toggle(indice) {
            this._toggleItem(indice);
        }
    }

    if (!customElements.get('luthier-accordion')) {
        customElements.define('luthier-accordion', LuthierAccordion);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierAccordion = LuthierAccordion;

})(typeof window !== 'undefined' ? window : this);
