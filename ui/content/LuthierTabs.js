/**
 * LuthierTabs - Tabs horizontales accesibles
 *
 * Componente de pestanas con:
 * - Navegacion completa por teclado (flechas, Home, End)
 * - Soporte ARIA completo (tablist, tab, tabpanel)
 * - Activacion manual o automatica
 * - Animacion suave de transicion
 *
 * ATRIBUTOS:
 * - activo      : Indice de la tab activa por defecto (ej: "0")
 * - automatico  : Activa el panel al enfocar la tab (sin necesidad de Enter/Space)
 *
 * ESTRUCTURA REQUERIDA:
 * El componente espera elementos con atributos data-tab para el titulo
 * y el contenido del panel como hijos del elemento.
 *
 * @example Uso basico
 * <luthier-tabs>
 *     <div data-tab="Informacion">
 *         <p>Contenido de la primera tab...</p>
 *     </div>
 *     <div data-tab="Detalles">
 *         <p>Contenido de la segunda tab...</p>
 *     </div>
 *     <div data-tab="Contacto">
 *         <p>Contenido de la tercera tab...</p>
 *     </div>
 * </luthier-tabs>
 *
 * @example Con tab activa por defecto
 * <luthier-tabs activo="1">
 *     <div data-tab="Tab 1">Contenido 1</div>
 *     <div data-tab="Tab 2">Contenido 2 (activo)</div>
 * </luthier-tabs>
 */
(function(global) {
    'use strict';

    class LuthierTabs extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                activo: parseInt(this.getAttribute('activo'), 10) || 0,
                automatico: this.hasAttribute('automatico')
            };

            var tabs = this._extraerTabs();

            if (tabs.length === 0) {
                console.warn('LuthierTabs: No se encontraron tabs');
                return;
            }

            this._tabs = tabs;
            this.classList.add('tabs-wrapper');
            this.innerHTML = this._render(tabs);
            this._initEventos();

            // Activar tab por defecto
            var indiceActivo = this._config.activo;
            if (indiceActivo >= 0 && indiceActivo < tabs.length) {
                this._activarTab(indiceActivo);
            } else {
                this._activarTab(0);
            }
        }

        _extraerTabs() {
            var tabs = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                var titulo = hijo.getAttribute('data-tab') || 'Tab ' + (i + 1);
                var contenido = hijo.innerHTML;
                var icono = hijo.getAttribute('data-icono') || '';
                var deshabilitado = hijo.hasAttribute('data-deshabilitado');

                tabs.push({
                    titulo: titulo,
                    contenido: contenido,
                    icono: icono,
                    deshabilitado: deshabilitado
                });
            }

            return tabs;
        }

        _render(tabs) {
            var self = this;
            var tablistId = 'tabs-' + Math.random().toString(36).substr(2, 9);

            var tablistHTML = '<div class="tabs__lista" role="tablist" aria-label="Pestanas">';

            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                var tabId = tablistId + '-tab-' + i;
                var panelId = tablistId + '-panel-' + i;
                var iconoHTML = tab.icono ? '<span class="tabs__icono">' + tab.icono + '</span>' : '';

                tablistHTML += '\
                    <button type="button"\
                            class="tabs__tab"\
                            id="' + tabId + '"\
                            role="tab"\
                            aria-selected="false"\
                            aria-controls="' + panelId + '"\
                            tabindex="-1"\
                            ' + (tab.deshabilitado ? 'disabled aria-disabled="true"' : '') + '>\
                        ' + iconoHTML + '\
                        <span class="tabs__titulo">' + tab.titulo + '</span>\
                    </button>\
                ';
            }

            tablistHTML += '</div>';

            var panelsHTML = '<div class="tabs__paneles">';

            for (var j = 0; j < tabs.length; j++) {
                var panelTab = tabs[j];
                var panelTabId = tablistId + '-tab-' + j;
                var panelPanelId = tablistId + '-panel-' + j;

                panelsHTML += '\
                    <div class="tabs__panel"\
                         id="' + panelPanelId + '"\
                         role="tabpanel"\
                         aria-labelledby="' + panelTabId + '"\
                         tabindex="0"\
                         hidden>\
                        <div class="tabs__contenido">\
                            ' + panelTab.contenido + '\
                        </div>\
                    </div>\
                ';
            }

            panelsHTML += '</div>';

            return '<div class="tabs">' + tablistHTML + panelsHTML + '</div>';
        }

        _initEventos() {
            var self = this;
            var tabs = this.querySelectorAll('.tabs__tab');
            var totalTabs = tabs.length;

            for (var i = 0; i < tabs.length; i++) {
                (function(tab, index) {
                    // Click
                    tab.addEventListener('click', function() {
                        if (!tab.disabled) {
                            self._activarTab(index);
                        }
                    });

                    // Teclado
                    tab.addEventListener('keydown', function(e) {
                        self._manejarTeclado(e, index, totalTabs);
                    });

                    // Focus (para modo automatico)
                    if (self._config.automatico) {
                        tab.addEventListener('focus', function() {
                            if (!tab.disabled) {
                                self._activarTab(index);
                            }
                        });
                    }
                })(tabs[i], i);
            }
        }

        _manejarTeclado(e, indiceActual, total) {
            var tabs = this.querySelectorAll('.tabs__tab');
            var nuevoIndice = -1;

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    nuevoIndice = this._encontrarSiguienteTab(indiceActual, 1, total);
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    nuevoIndice = this._encontrarSiguienteTab(indiceActual, -1, total);
                    break;

                case 'Home':
                    e.preventDefault();
                    nuevoIndice = this._encontrarPrimeraTabHabilitada();
                    break;

                case 'End':
                    e.preventDefault();
                    nuevoIndice = this._encontrarUltimaTabHabilitada();
                    break;

                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this._activarTab(indiceActual);
                    return;
            }

            if (nuevoIndice >= 0 && tabs[nuevoIndice]) {
                tabs[nuevoIndice].focus();
                if (this._config.automatico) {
                    this._activarTab(nuevoIndice);
                }
            }
        }

        _encontrarSiguienteTab(actual, direccion, total) {
            var tabs = this.querySelectorAll('.tabs__tab');
            var intentos = 0;
            var indice = actual;

            while (intentos < total) {
                indice = (indice + direccion + total) % total;
                if (!tabs[indice].disabled) {
                    return indice;
                }
                intentos++;
            }

            return actual;
        }

        _encontrarPrimeraTabHabilitada() {
            var tabs = this.querySelectorAll('.tabs__tab');
            for (var i = 0; i < tabs.length; i++) {
                if (!tabs[i].disabled) {
                    return i;
                }
            }
            return 0;
        }

        _encontrarUltimaTabHabilitada() {
            var tabs = this.querySelectorAll('.tabs__tab');
            for (var i = tabs.length - 1; i >= 0; i--) {
                if (!tabs[i].disabled) {
                    return i;
                }
            }
            return tabs.length - 1;
        }

        _activarTab(indice) {
            var tabs = this.querySelectorAll('.tabs__tab');
            var paneles = this.querySelectorAll('.tabs__panel');

            if (indice < 0 || indice >= tabs.length) return;

            // Desactivar todas las tabs
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].setAttribute('aria-selected', 'false');
                tabs[i].setAttribute('tabindex', '-1');
                tabs[i].classList.remove('tabs__tab--activo');
            }

            // Ocultar todos los paneles
            for (var j = 0; j < paneles.length; j++) {
                paneles[j].setAttribute('hidden', '');
                paneles[j].classList.remove('tabs__panel--activo');
            }

            // Activar tab seleccionada
            tabs[indice].setAttribute('aria-selected', 'true');
            tabs[indice].setAttribute('tabindex', '0');
            tabs[indice].classList.add('tabs__tab--activo');

            // Mostrar panel correspondiente
            paneles[indice].removeAttribute('hidden');
            paneles[indice].classList.add('tabs__panel--activo');

            // Emitir evento
            this.dispatchEvent(new CustomEvent('luthier:tab-change', {
                bubbles: true,
                detail: {
                    indice: indice,
                    titulo: this._tabs[indice].titulo
                }
            }));
        }

        // API publica
        activar(indice) {
            this._activarTab(indice);
            var tabs = this.querySelectorAll('.tabs__tab');
            if (tabs[indice]) {
                tabs[indice].focus();
            }
        }

        obtenerActivo() {
            var tabs = this.querySelectorAll('.tabs__tab');
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].getAttribute('aria-selected') === 'true') {
                    return i;
                }
            }
            return -1;
        }
    }

    if (!customElements.get('luthier-tabs')) {
        customElements.define('luthier-tabs', LuthierTabs);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierTabs = LuthierTabs;

})(typeof window !== 'undefined' ? window : this);
