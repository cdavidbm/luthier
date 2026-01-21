/**
 * LuthierTimeline - Línea de tiempo
 *
 * Componente para mostrar eventos cronológicos en una línea de tiempo vertical.
 *
 * ATRIBUTOS:
 * - invertido : Alterna los items de lado (izquierda/derecha)
 * - compacto  : Versión más compacta sin alternar lados
 *
 * ESTRUCTURA REQUERIDA:
 * Los hijos deben tener data-fecha y opcionalmente data-titulo.
 *
 * @example Uso básico
 * <luthier-timeline>
 *     <div data-fecha="2020-01" data-titulo="Fundación">
 *         <p>Se funda la organización.</p>
 *     </div>
 *     <div data-fecha="2022-06" data-titulo="Nueva sede">
 *         <p>Inauguramos nuestra nueva sede.</p>
 *     </div>
 * </luthier-timeline>
 */
(function(global) {
    'use strict';

    class LuthierTimeline extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                invertido: this.hasAttribute('invertido'),
                compacto: this.hasAttribute('compacto')
            };

            var items = this._extraerItems();

            if (items.length === 0) {
                console.warn('LuthierTimeline: No se encontraron items');
                return;
            }

            this.classList.add('timeline-wrapper');
            if (this._config.compacto) {
                this.classList.add('timeline--compacto');
            }

            this._construirDOM(items);
        }

        _extraerItems() {
            var items = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                items.push({
                    fecha: hijo.getAttribute('data-fecha') || '',
                    titulo: hijo.getAttribute('data-titulo') || '',
                    icono: hijo.getAttribute('data-icono') || '',
                    contenidoHTML: hijo.cloneNode(true)
                });
            }

            return items;
        }

        _construirDOM(items) {
            // Limpiar contenido
            this.textContent = '';

            var timeline = document.createElement('div');
            timeline.className = 'timeline';
            timeline.setAttribute('role', 'list');

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var esIzquierda = this._config.compacto ? false : (i % 2 === 0);
                if (this._config.invertido) {
                    esIzquierda = !esIzquierda;
                }

                var itemDiv = document.createElement('div');
                itemDiv.className = 'timeline__item' + (esIzquierda ? ' timeline__item--izquierda' : ' timeline__item--derecha');
                itemDiv.setAttribute('role', 'listitem');

                // Marcador
                var marcador = document.createElement('div');
                marcador.className = 'timeline__marcador';
                if (item.icono) {
                    marcador.textContent = item.icono;
                }
                itemDiv.appendChild(marcador);

                // Contenido
                var contenido = document.createElement('div');
                contenido.className = 'timeline__contenido';

                // Fecha
                if (item.fecha) {
                    var fecha = document.createElement('time');
                    fecha.className = 'timeline__fecha';
                    fecha.setAttribute('datetime', item.fecha);
                    fecha.textContent = LuthierDate.formatoFlexible(item.fecha);
                    contenido.appendChild(fecha);
                }

                // Título
                if (item.titulo) {
                    var titulo = document.createElement('h3');
                    titulo.className = 'timeline__titulo';
                    titulo.textContent = item.titulo;
                    contenido.appendChild(titulo);
                }

                // Cuerpo
                var cuerpo = document.createElement('div');
                cuerpo.className = 'timeline__cuerpo';
                // Mover el contenido original (ya clonado)
                while (item.contenidoHTML.firstChild) {
                    cuerpo.appendChild(item.contenidoHTML.firstChild);
                }
                contenido.appendChild(cuerpo);

                itemDiv.appendChild(contenido);
                timeline.appendChild(itemDiv);
            }

            this.appendChild(timeline);
        }

    }

    if (!customElements.get('luthier-timeline')) {
        customElements.define('luthier-timeline', LuthierTimeline);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierTimeline = LuthierTimeline;

})(typeof window !== 'undefined' ? window : this);
