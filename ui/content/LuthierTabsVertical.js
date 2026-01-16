/**
 * LuthierTabsVertical - Tabs verticales accesibles
 *
 * Componente de pestanas verticales con:
 * - Navegacion completa por teclado (flechas arriba/abajo, Home, End)
 * - Soporte ARIA completo (tablist con orientacion vertical)
 * - Layout lateral con tabs a la izquierda y contenido a la derecha
 * - Responsive: se convierte a horizontal en moviles
 *
 * ATRIBUTOS:
 * - activo      : Indice de la tab activa por defecto (ej: "0")
 * - automatico  : Activa el panel al enfocar la tab
 * - posicion    : "izquierda" (default) | "derecha" - Posicion de la lista de tabs
 *
 * ESTRUCTURA REQUERIDA:
 * El componente espera elementos con atributos data-tab para el titulo.
 *
 * @example Uso basico
 * <luthier-tabs-vertical>
 *     <div data-tab="Perfil">
 *         <h3>Mi Perfil</h3>
 *         <p>Informacion del usuario...</p>
 *     </div>
 *     <div data-tab="Configuracion">
 *         <h3>Configuracion</h3>
 *         <p>Opciones de configuracion...</p>
 *     </div>
 *     <div data-tab="Notificaciones">
 *         <h3>Notificaciones</h3>
 *         <p>Preferencias de notificaciones...</p>
 *     </div>
 * </luthier-tabs-vertical>
 *
 * @example Tabs a la derecha
 * <luthier-tabs-vertical posicion="derecha">
 *     <div data-tab="Tab 1">Contenido 1</div>
 *     <div data-tab="Tab 2">Contenido 2</div>
 * </luthier-tabs-vertical>
 */
(function(global) {
    'use strict';

    class LuthierTabsVertical extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                activo: parseInt(this.getAttribute('activo'), 10) || 0,
                automatico: this.hasAttribute('automatico'),
                posicion: this.getAttribute('posicion') || 'izquierda'
            };

            // Obtener tabs del contenido original
            var tabs = this._extraerTabs();

            if (tabs.length === 0) {
                console.warn('LuthierTabsVertical: No se encontraron tabs');
                return;
            }

            this._tabs = tabs;
            this.classList.add('tabs-vertical-wrapper');
            if (this._config.posicion === 'derecha') {
                this.classList.add('tabs-vertical-wrapper--derecha');
            }
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
                var descripcion = hijo.getAttribute('data-descripcion') || '';
                var deshabilitado = hijo.hasAttribute('data-deshabilitado');

                tabs.push({
                    titulo: titulo,
                    contenido: contenido,
                    icono: icono,
                    descripcion: descripcion,
                    deshabilitado: deshabilitado
                });
            }

            return tabs;
        }

        _render(tabs) {
            var self = this;
            var tablistId = 'tabs-v-' + Math.random().toString(36).substr(2, 9);

            // Crear lista de tabs
            var tablistHTML = '<div class="tabs-vertical__lista" role="tablist" aria-label="Pestanas" aria-orientation="vertical">';

            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                var tabId = tablistId + '-tab-' + i;
                var panelId = tablistId + '-panel-' + i;
                var iconoHTML = tab.icono ? '<span class="tabs-vertical__icono">' + tab.icono + '</span>' : '';
                var descripcionHTML = tab.descripcion ? '<span class="tabs-vertical__descripcion">' + tab.descripcion + '</span>' : '';

                tablistHTML += '\
                    <button type="button"\
                            class="tabs-vertical__tab"\
                            id="' + tabId + '"\
                            role="tab"\
                            aria-selected="false"\
                            aria-controls="' + panelId + '"\
                            tabindex="-1"\
                            ' + (tab.deshabilitado ? 'disabled aria-disabled="true"' : '') + '>\
                        ' + iconoHTML + '\
                        <span class="tabs-vertical__texto">\
                            <span class="tabs-vertical__titulo">' + tab.titulo + '</span>\
                            ' + descripcionHTML + '\
                        </span>\
                    </button>\
                ';
            }

            tablistHTML += '</div>';

            // Crear paneles
            var panelsHTML = '<div class="tabs-vertical__paneles">';

            for (var j = 0; j < tabs.length; j++) {
                var panelTab = tabs[j];
                var panelTabId = tablistId + '-tab-' + j;
                var panelPanelId = tablistId + '-panel-' + j;

                panelsHTML += '\
                    <div class="tabs-vertical__panel"\
                         id="' + panelPanelId + '"\
                         role="tabpanel"\
                         aria-labelledby="' + panelTabId + '"\
                         tabindex="0"\
                         hidden>\
                        <div class="tabs-vertical__contenido">\
                            ' + panelTab.contenido + '\
                        </div>\
                    </div>\
                ';
            }

            panelsHTML += '</div>';

            // Ordenar segun posicion
            if (this._config.posicion === 'derecha') {
                return '<div class="tabs-vertical">' + panelsHTML + tablistHTML + '</div>';
            }
            return '<div class="tabs-vertical">' + tablistHTML + panelsHTML + '</div>';
        }

        _initEventos() {
            var self = this;
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
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
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            var nuevoIndice = -1;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    nuevoIndice = this._encontrarSiguienteTab(indiceActual, 1, total);
                    break;

                case 'ArrowUp':
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
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
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
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            for (var i = 0; i < tabs.length; i++) {
                if (!tabs[i].disabled) {
                    return i;
                }
            }
            return 0;
        }

        _encontrarUltimaTabHabilitada() {
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            for (var i = tabs.length - 1; i >= 0; i--) {
                if (!tabs[i].disabled) {
                    return i;
                }
            }
            return tabs.length - 1;
        }

        _activarTab(indice) {
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            var paneles = this.querySelectorAll('.tabs-vertical__panel');

            if (indice < 0 || indice >= tabs.length) return;

            // Desactivar todas las tabs
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].setAttribute('aria-selected', 'false');
                tabs[i].setAttribute('tabindex', '-1');
                tabs[i].classList.remove('tabs-vertical__tab--activo');
            }

            // Ocultar todos los paneles
            for (var j = 0; j < paneles.length; j++) {
                paneles[j].setAttribute('hidden', '');
                paneles[j].classList.remove('tabs-vertical__panel--activo');
            }

            // Activar tab seleccionada
            tabs[indice].setAttribute('aria-selected', 'true');
            tabs[indice].setAttribute('tabindex', '0');
            tabs[indice].classList.add('tabs-vertical__tab--activo');

            // Mostrar panel correspondiente
            paneles[indice].removeAttribute('hidden');
            paneles[indice].classList.add('tabs-vertical__panel--activo');

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
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            if (tabs[indice]) {
                tabs[indice].focus();
            }
        }

        obtenerActivo() {
            var tabs = this.querySelectorAll('.tabs-vertical__tab');
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].getAttribute('aria-selected') === 'true') {
                    return i;
                }
            }
            return -1;
        }
    }

    if (!customElements.get('luthier-tabs-vertical')) {
        customElements.define('luthier-tabs-vertical', LuthierTabsVertical);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierTabsVertical = LuthierTabsVertical;

})(typeof window !== 'undefined' ? window : this);
