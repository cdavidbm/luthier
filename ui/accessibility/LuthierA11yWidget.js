/**
 * LuthierA11yWidget - Widget flotante de accesibilidad
 *
 * Panel de opciones de accesibilidad que permite:
 * - Ajustar tamano de fuente
 * - Activar alto contraste
 * - Activar escala de grises
 * - Ajustar espaciado de linea
 *
 * Las preferencias se guardan en localStorage.
 *
 * ATRIBUTOS:
 * - posicion  : "izquierda" | "derecha" (default: "derecha")
 * - compacto  : Si esta presente, muestra version compacta
 *
 * VARIABLES CSS MANIPULADAS:
 * - --l-a11y-escala-fuente: Escala de fuente (1 = 100%)
 * - --l-a11y-espaciado-linea: Factor de espaciado de linea
 *
 * CLASES CSS APLICADAS AL BODY:
 * - alto-contraste: Modo alto contraste
 * - escala-grises: Modo escala de grises
 *
 * EVENTOS:
 * El widget responde al evento 'luthier:toggle-accesibilidad'
 * emitido por el boton del header.
 *
 * @example
 * <luthier-a11y-widget></luthier-a11y-widget>
 *
 * @example Posicion izquierda
 * <luthier-a11y-widget posicion="izquierda"></luthier-a11y-widget>
 */
(function(global) {
    'use strict';

    var STORAGE_KEY = 'luthier-a11y-preferences';

    class LuthierA11yWidget extends HTMLElement {

        connectedCallback() {
            this._config = {
                posicion: this.getAttribute('posicion') || 'derecha',
                compacto: this.hasAttribute('compacto')
            };

            // Cargar preferencias guardadas
            this._preferencias = this._cargarPreferencias();

            // Aplicar preferencias inmediatamente
            this._aplicarPreferencias();

            this.classList.add('a11y-widget-wrapper');
            this.classList.add('a11y-widget-wrapper--' + this._config.posicion);
            if (this._config.compacto) {
                this.classList.add('a11y-widget-wrapper--compacto');
            }

            this.innerHTML = this._render();
            this._initEventos();
        }

        _cargarPreferencias() {
            var defaults = {
                escalaFuente: 1,
                espaciadoLinea: 1,
                altoContraste: false,
                escalaGrises: false,
                panelAbierto: false
            };

            try {
                var guardado = global.localStorage.getItem(STORAGE_KEY);
                if (guardado) {
                    var parsed = JSON.parse(guardado);
                    return Object.assign({}, defaults, parsed);
                }
            } catch (e) {
                console.warn('LuthierA11yWidget: No se pudieron cargar preferencias', e);
            }

            return defaults;
        }

        _guardarPreferencias() {
            try {
                global.localStorage.setItem(STORAGE_KEY, JSON.stringify(this._preferencias));
            } catch (e) {
                console.warn('LuthierA11yWidget: No se pudieron guardar preferencias', e);
            }
        }

        _aplicarPreferencias() {
            var prefs = this._preferencias;
            var root = document.documentElement;
            var body = document.body;

            // Escala de fuente
            root.style.setProperty('--l-a11y-escala-fuente', prefs.escalaFuente);

            // Espaciado de linea
            root.style.setProperty('--l-a11y-espaciado-linea', prefs.espaciadoLinea);

            // Alto contraste
            if (prefs.altoContraste) {
                body.classList.add('alto-contraste');
            } else {
                body.classList.remove('alto-contraste');
            }

            // Escala de grises
            if (prefs.escalaGrises) {
                body.classList.add('escala-grises');
            } else {
                body.classList.remove('escala-grises');
            }
        }

        _render() {
            var prefs = this._preferencias;
            var escalaFuentePorcentaje = Math.round(prefs.escalaFuente * 100);

            return '\
                <div class="a11y-widget ' + (prefs.panelAbierto ? 'a11y-widget--abierto' : '') + '">\
                    <button type="button"\
                            class="a11y-widget__boton-toggle"\
                            aria-expanded="' + prefs.panelAbierto + '"\
                            aria-controls="a11y-panel"\
                            aria-label="Opciones de accesibilidad"\
                            title="Opciones de accesibilidad">\
                        <span aria-hidden="true">&#9855;</span>\
                    </button>\
                    <div class="a11y-widget__panel" id="a11y-panel" ' + (prefs.panelAbierto ? '' : 'hidden') + '>\
                        <div class="a11y-widget__cabecera">\
                            <h2 class="a11y-widget__titulo">Accesibilidad</h2>\
                            <button type="button" class="a11y-widget__cerrar" aria-label="Cerrar panel">&#10005;</button>\
                        </div>\
                        <div class="a11y-widget__contenido">\
                            <!-- Tamano de fuente -->\
                            <div class="a11y-widget__opcion">\
                                <label class="a11y-widget__label">Tamano de texto</label>\
                                <div class="a11y-widget__controles">\
                                    <button type="button" class="a11y-widget__btn-control" data-action="fuente-menos" aria-label="Reducir tamano de texto">\
                                        A-\
                                    </button>\
                                    <span class="a11y-widget__valor" id="a11y-valor-fuente">' + escalaFuentePorcentaje + '%</span>\
                                    <button type="button" class="a11y-widget__btn-control" data-action="fuente-mas" aria-label="Aumentar tamano de texto">\
                                        A+\
                                    </button>\
                                </div>\
                            </div>\
                            <!-- Espaciado de linea -->\
                            <div class="a11y-widget__opcion">\
                                <label class="a11y-widget__label">Espaciado de linea</label>\
                                <div class="a11y-widget__controles">\
                                    <button type="button" class="a11y-widget__btn-control" data-action="espaciado-menos" aria-label="Reducir espaciado">\
                                        -\
                                    </button>\
                                    <span class="a11y-widget__valor" id="a11y-valor-espaciado">' + prefs.espaciadoLinea.toFixed(1) + '</span>\
                                    <button type="button" class="a11y-widget__btn-control" data-action="espaciado-mas" aria-label="Aumentar espaciado">\
                                        +\
                                    </button>\
                                </div>\
                            </div>\
                            <!-- Alto contraste -->\
                            <div class="a11y-widget__opcion">\
                                <label class="a11y-widget__label" for="a11y-contraste">Alto contraste</label>\
                                <div class="a11y-widget__toggle">\
                                    <input type="checkbox" id="a11y-contraste" ' + (prefs.altoContraste ? 'checked' : '') + '>\
                                    <span class="a11y-widget__toggle-slider"></span>\
                                </div>\
                            </div>\
                            <!-- Escala de grises -->\
                            <div class="a11y-widget__opcion">\
                                <label class="a11y-widget__label" for="a11y-grises">Escala de grises</label>\
                                <div class="a11y-widget__toggle">\
                                    <input type="checkbox" id="a11y-grises" ' + (prefs.escalaGrises ? 'checked' : '') + '>\
                                    <span class="a11y-widget__toggle-slider"></span>\
                                </div>\
                            </div>\
                            <!-- Restablecer -->\
                            <div class="a11y-widget__opcion a11y-widget__opcion--restablecer">\
                                <button type="button" class="a11y-widget__btn-restablecer" data-action="restablecer">\
                                    Restablecer valores\
                                </button>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ';
        }

        _initEventos() {
            var self = this;
            var widget = this.querySelector('.a11y-widget');
            var panel = this.querySelector('.a11y-widget__panel');
            var btnToggle = this.querySelector('.a11y-widget__boton-toggle');
            var btnCerrar = this.querySelector('.a11y-widget__cerrar');

            // Toggle panel
            btnToggle.addEventListener('click', function() {
                self._togglePanel();
            });

            btnCerrar.addEventListener('click', function() {
                self._cerrarPanel();
            });

            // Escuchar evento del header
            document.addEventListener('luthier:toggle-accesibilidad', function() {
                self._togglePanel();
            });

            // Controles de fuente
            this.querySelector('[data-action="fuente-menos"]').addEventListener('click', function() {
                self._ajustarFuente(-0.1);
            });
            this.querySelector('[data-action="fuente-mas"]').addEventListener('click', function() {
                self._ajustarFuente(0.1);
            });

            // Controles de espaciado
            this.querySelector('[data-action="espaciado-menos"]').addEventListener('click', function() {
                self._ajustarEspaciado(-0.1);
            });
            this.querySelector('[data-action="espaciado-mas"]').addEventListener('click', function() {
                self._ajustarEspaciado(0.1);
            });

            // Checkboxes
            this.querySelector('#a11y-contraste').addEventListener('change', function(e) {
                self._preferencias.altoContraste = e.target.checked;
                self._aplicarPreferencias();
                self._guardarPreferencias();
            });

            this.querySelector('#a11y-grises').addEventListener('change', function(e) {
                self._preferencias.escalaGrises = e.target.checked;
                self._aplicarPreferencias();
                self._guardarPreferencias();
            });

            // Restablecer
            this.querySelector('[data-action="restablecer"]').addEventListener('click', function() {
                self._restablecer();
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (!self.contains(e.target) && self._preferencias.panelAbierto) {
                    self._cerrarPanel();
                }
            });

            // Teclado: Escape para cerrar
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && self._preferencias.panelAbierto) {
                    self._cerrarPanel();
                    btnToggle.focus();
                }
            });
        }

        _togglePanel() {
            if (this._preferencias.panelAbierto) {
                this._cerrarPanel();
            } else {
                this._abrirPanel();
            }
        }

        _abrirPanel() {
            var widget = this.querySelector('.a11y-widget');
            var panel = this.querySelector('.a11y-widget__panel');
            var btnToggle = this.querySelector('.a11y-widget__boton-toggle');

            widget.classList.add('a11y-widget--abierto');
            panel.removeAttribute('hidden');
            btnToggle.setAttribute('aria-expanded', 'true');

            this._preferencias.panelAbierto = true;
            this._guardarPreferencias();

            // Focus al primer control
            var primerControl = panel.querySelector('button, input');
            if (primerControl) primerControl.focus();
        }

        _cerrarPanel() {
            var widget = this.querySelector('.a11y-widget');
            var panel = this.querySelector('.a11y-widget__panel');
            var btnToggle = this.querySelector('.a11y-widget__boton-toggle');

            widget.classList.remove('a11y-widget--abierto');
            panel.setAttribute('hidden', '');
            btnToggle.setAttribute('aria-expanded', 'false');

            this._preferencias.panelAbierto = false;
            this._guardarPreferencias();
        }

        _ajustarFuente(delta) {
            var nueva = Math.max(0.8, Math.min(1.5, this._preferencias.escalaFuente + delta));
            this._preferencias.escalaFuente = Math.round(nueva * 10) / 10;

            this._aplicarPreferencias();
            this._guardarPreferencias();

            // Actualizar UI
            var valorEl = this.querySelector('#a11y-valor-fuente');
            if (valorEl) {
                valorEl.textContent = Math.round(this._preferencias.escalaFuente * 100) + '%';
            }
        }

        _ajustarEspaciado(delta) {
            var nuevo = Math.max(1, Math.min(2, this._preferencias.espaciadoLinea + delta));
            this._preferencias.espaciadoLinea = Math.round(nuevo * 10) / 10;

            this._aplicarPreferencias();
            this._guardarPreferencias();

            // Actualizar UI
            var valorEl = this.querySelector('#a11y-valor-espaciado');
            if (valorEl) {
                valorEl.textContent = this._preferencias.espaciadoLinea.toFixed(1);
            }
        }

        _restablecer() {
            this._preferencias = {
                escalaFuente: 1,
                espaciadoLinea: 1,
                altoContraste: false,
                escalaGrises: false,
                panelAbierto: this._preferencias.panelAbierto
            };

            this._aplicarPreferencias();
            this._guardarPreferencias();

            // Actualizar UI
            this.querySelector('#a11y-valor-fuente').textContent = '100%';
            this.querySelector('#a11y-valor-espaciado').textContent = '1.0';
            this.querySelector('#a11y-contraste').checked = false;
            this.querySelector('#a11y-grises').checked = false;
        }
    }

    if (!customElements.get('luthier-a11y-widget')) {
        customElements.define('luthier-a11y-widget', LuthierA11yWidget);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierA11yWidget = LuthierA11yWidget;

})(typeof window !== 'undefined' ? window : this);
