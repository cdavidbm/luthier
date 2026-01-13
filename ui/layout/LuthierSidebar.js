/**
 * LuthierSidebar - Barra lateral colapsable
 *
 * Componente de barra lateral con soporte para:
 * - Posicionamiento izquierda/derecha
 * - Colapso/expansion
 * - Titulo opcional
 * - Navegacion por teclado
 *
 * ATRIBUTOS:
 * - posicion   : "izquierda" | "derecha" (default: "derecha")
 * - colapsable : Si esta presente, permite colapsar/expandir
 * - colapsado  : Si esta presente, inicia colapsado
 * - titulo     : Titulo del sidebar (opcional)
 *
 * SLOTS:
 * - default: Contenido del sidebar
 *
 * @example
 * <luthier-sidebar titulo="Menu" posicion="izquierda" colapsable>
 *     <ul>
 *         <li><a href="#">Enlace 1</a></li>
 *         <li><a href="#">Enlace 2</a></li>
 *     </ul>
 * </luthier-sidebar>
 */
(function(global) {
    'use strict';

    class LuthierSidebar extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            var config = {
                posicion: this.getAttribute('posicion') || 'derecha',
                colapsable: this.hasAttribute('colapsable'),
                colapsado: this.hasAttribute('colapsado'),
                titulo: this.getAttribute('titulo') || ''
            };

            // Guardar contenido original
            var contenidoOriginal = this.innerHTML;

            // Aplicar clases
            this.classList.add('sidebar-wrapper');
            this.classList.add('sidebar-wrapper--' + config.posicion);
            if (config.colapsable) {
                this.classList.add('sidebar-wrapper--colapsable');
            }
            if (config.colapsado) {
                this.classList.add('sidebar-wrapper--colapsado');
            }

            this.innerHTML = this._render(config, contenidoOriginal);
            this._initEventos(config);
        }

        _render(config, contenido) {
            var botonToggle = '';

            if (config.colapsable) {
                botonToggle = '\
                    <button type="button"\
                            class="sidebar__toggle"\
                            aria-expanded="' + (!config.colapsado) + '"\
                            aria-controls="sidebar-contenido"\
                            aria-label="' + (config.colapsado ? 'Expandir' : 'Colapsar') + ' barra lateral">\
                        <span class="sidebar__toggle-icono" aria-hidden="true">' + (config.colapsado ? '&#9654;' : '&#9664;') + '</span>\
                    </button>\
                ';
            }

            return '\
                <aside class="sidebar sidebar--' + config.posicion + '" role="complementary">\
                    ' + (config.titulo || config.colapsable ? '\
                        <div class="sidebar__cabecera">\
                            ' + (config.titulo ? '<h2 class="sidebar__titulo">' + config.titulo + '</h2>' : '') + '\
                            ' + botonToggle + '\
                        </div>\
                    ' : '') + '\
                    <div class="sidebar__contenido" id="sidebar-contenido">\
                        ' + contenido + '\
                    </div>\
                </aside>\
            ';
        }

        _initEventos(config) {
            if (!config.colapsable) return;

            var self = this;
            var btnToggle = this.querySelector('.sidebar__toggle');
            var contenido = this.querySelector('.sidebar__contenido');
            var icono = this.querySelector('.sidebar__toggle-icono');

            if (btnToggle) {
                btnToggle.addEventListener('click', function() {
                    var estaColapsado = self.classList.contains('sidebar-wrapper--colapsado');

                    self.classList.toggle('sidebar-wrapper--colapsado');
                    btnToggle.setAttribute('aria-expanded', String(estaColapsado));
                    btnToggle.setAttribute('aria-label', estaColapsado ? 'Colapsar barra lateral' : 'Expandir barra lateral');

                    if (icono) {
                        icono.innerHTML = estaColapsado ? '&#9664;' : '&#9654;';
                    }

                    // Emitir evento
                    self.dispatchEvent(new CustomEvent('luthier:sidebar-toggle', {
                        bubbles: true,
                        detail: { colapsado: !estaColapsado }
                    }));
                });
            }
        }

        // API publica
        colapsar() {
            this.classList.add('sidebar-wrapper--colapsado');
            var btn = this.querySelector('.sidebar__toggle');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        }

        expandir() {
            this.classList.remove('sidebar-wrapper--colapsado');
            var btn = this.querySelector('.sidebar__toggle');
            if (btn) btn.setAttribute('aria-expanded', 'true');
        }

        toggle() {
            if (this.classList.contains('sidebar-wrapper--colapsado')) {
                this.expandir();
            } else {
                this.colapsar();
            }
        }
    }

    if (!customElements.get('luthier-sidebar')) {
        customElements.define('luthier-sidebar', LuthierSidebar);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierSidebar = LuthierSidebar;

})(typeof window !== 'undefined' ? window : this);
