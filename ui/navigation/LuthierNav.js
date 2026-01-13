/**
 * LuthierNav - Navegacion principal
 *
 * Renderiza el menu de navegacion con:
 * - Soporte para submenus multinivel
 * - Estado activo automatico segun URL actual
 * - Menu colapsable en movil (hamburguesa)
 * - Indicador de enlaces externos
 *
 * SEGURIDAD:
 * Este componente usa innerHTML con datos de LUTHIER_CONFIG.menu que son
 * controlados por el desarrollador (configuración del sitio), NO input de usuario.
 * Los nombres de menú vienen de archivos de configuración locales.
 *
 * CONFIGURACION:
 * Los datos del menu se obtienen de window.LUTHIER_CONFIG.menu
 *
 * ATRIBUTOS:
 * - variante : "horizontal" | "vertical" | "minimal"
 * - datos    : JSON string con menu personalizado (override de config)
 *
 * ESTRUCTURA DEL MENU:
 * [
 *   { nombre: "Inicio", slug: "/" },
 *   { nombre: "Seccion", slug: "/seccion", submenu: [...] },
 *   { nombre: "Externo", url: "https://...", externo: true }
 * ]
 *
 * @example
 * <luthier-nav></luthier-nav>
 *
 * @example
 * <luthier-nav variante="vertical"></luthier-nav>
 */
(function(global) {
    'use strict';

    class LuthierNav extends HTMLElement {

        connectedCallback() {
            var self = this;
            var config = global.LUTHIER_CONFIG || {};
            var variante = this.getAttribute('variante') || 'horizontal';

            // Guardar referencia al handler para poder removerlo después
            this._documentClickHandler = function(e) {
                self._handleDocumentClick(e);
            };

            // Intentar parsear datos personalizados o usar config global
            var menu = config.menu || [];
            var datosAttr = this.getAttribute('datos');
            if (datosAttr) {
                try {
                    menu = JSON.parse(datosAttr);
                } catch (e) {
                    console.warn('LuthierNav: Error parseando atributo "datos"', e);
                }
            }

            this.classList.add('nav-wrapper');
            this.classList.add('nav-wrapper--' + variante);

            // Datos vienen de LUTHIER_CONFIG (configuración del desarrollador), no de usuario
            this.innerHTML = this._render(menu, variante);
            this._initEventos();
        }

        disconnectedCallback() {
            // Limpiar event listeners para prevenir memory leaks
            if (this._documentClickHandler) {
                document.removeEventListener('click', this._documentClickHandler);
            }
        }

        _render(menu, variante) {
            if (!menu || menu.length === 0) {
                return '<nav class="nav nav--vacio"><p>No hay menu configurado</p></nav>';
            }

            return '\
                <nav class="nav nav--' + variante + '" role="navigation" aria-label="Menu principal">\
                    <button type="button"\
                            class="nav__toggle"\
                            aria-expanded="false"\
                            aria-controls="menu-principal-lista"\
                            aria-label="Abrir menu de navegacion">\
                        <span class="nav__toggle-icon" aria-hidden="true"></span>\
                        <span class="nav__toggle-texto">Menu</span>\
                    </button>\
                    <ul class="nav__lista" id="menu-principal-lista" role="menubar">\
                        ' + this._renderItems(menu, 0) + '\
                    </ul>\
                </nav>\
            ';
        }

        _renderItems(items, nivel) {
            var rutaActual = global.location ? global.location.pathname : '/';
            var self = this;
            var html = '';

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var tieneHijos = item.submenu && item.submenu.length > 0;
                var esExterno = item.externo === true;
                var href = item.url || item.slug || '#';
                var esActivo = self._esRutaActiva(href, rutaActual);

                // Construir clases
                var clases = ['nav__item'];
                if (tieneHijos) clases.push('nav__item--tiene-hijos');
                if (esActivo) clases.push('nav__item--activo');
                if (nivel > 0) clases.push('nav__item--hijo');

                // Atributos del enlace
                var attrTarget = esExterno ? ' target="_blank"' : '';
                var attrRel = esExterno ? ' rel="noopener noreferrer"' : '';
                var attrAria = tieneHijos ? ' aria-haspopup="true" aria-expanded="false"' : '';

                html += '\
                    <li class="' + clases.join(' ') + '" role="none">\
                        <a href="' + href + '"\
                           class="nav__enlace"\
                           role="menuitem"' + attrTarget + attrRel + attrAria + '>\
                            <span class="nav__enlace-texto">' + item.nombre + '</span>\
                            ' + (tieneHijos ? '<span class="nav__flecha" aria-hidden="true">&#9660;</span>' : '') + '\
                            ' + (esExterno ? '<span class="nav__icono-externo" aria-label="(enlace externo)" title="Enlace externo">&#8599;</span>' : '') + '\
                        </a>\
                        ' + (tieneHijos ? '\
                            <ul class="nav__submenu" role="menu">\
                                ' + self._renderItems(item.submenu, nivel + 1) + '\
                            </ul>\
                        ' : '') + '\
                    </li>\
                ';
            }

            return html;
        }

        _esRutaActiva(href, rutaActual) {
            if (!href || href === '#') return false;

            // Normalizar rutas (quitar trailing slash, lowercase)
            var normalizar = function(ruta) {
                return ruta.replace(/\/$/, '').replace(/\.html$/, '').toLowerCase();
            };

            var hrefNorm = normalizar(href);
            var actualNorm = normalizar(rutaActual);

            // Comparar solo el nombre del archivo para compatibilidad file:///
            var nombreHref = hrefNorm.split('/').pop();
            var nombreActual = actualNorm.split('/').pop();

            // Coincidencia exacta
            if (nombreActual === nombreHref) return true;

            // Es prefijo (para secciones padre)
            if (hrefNorm !== '/' && hrefNorm !== 'index' && actualNorm.indexOf(hrefNorm + '/') === 0) return true;

            return false;
        }

        _initEventos() {
            var self = this;
            var btnToggle = this.querySelector('.nav__toggle');
            var menuLista = this.querySelector('.nav__lista');

            // Toggle menu movil
            if (btnToggle && menuLista) {
                btnToggle.addEventListener('click', function() {
                    var expandido = btnToggle.getAttribute('aria-expanded') === 'true';
                    btnToggle.setAttribute('aria-expanded', String(!expandido));
                    menuLista.classList.toggle('nav__lista--abierto');
                    btnToggle.classList.toggle('nav__toggle--activo');
                });
            }

            // Submenus: hover en desktop, click en movil
            var itemsConHijos = this.querySelectorAll('.nav__item--tiene-hijos');

            for (var i = 0; i < itemsConHijos.length; i++) {
                (function(item) {
                    var enlace = item.querySelector(':scope > .nav__enlace');

                    if (enlace) {
                        enlace.addEventListener('click', function(e) {
                            // En movil (< 768px), el click abre/cierra el submenu
                            if (global.innerWidth <= 768) {
                                e.preventDefault();
                                var estaAbierto = item.classList.contains('nav__item--submenu-abierto');

                                // Cerrar otros submenus del mismo nivel
                                var hermanos = item.parentElement.querySelectorAll('.nav__item--submenu-abierto');
                                for (var j = 0; j < hermanos.length; j++) {
                                    if (hermanos[j] !== item) {
                                        hermanos[j].classList.remove('nav__item--submenu-abierto');
                                        var link = hermanos[j].querySelector(':scope > .nav__enlace');
                                        if (link) link.setAttribute('aria-expanded', 'false');
                                    }
                                }

                                // Toggle actual
                                item.classList.toggle('nav__item--submenu-abierto');
                                enlace.setAttribute('aria-expanded', String(!estaAbierto));
                            }
                        });
                    }
                })(itemsConHijos[i]);
            }

            // Cerrar menu al hacer click fuera - usar handler guardado para poder removerlo
            document.addEventListener('click', this._documentClickHandler);
        }

        /**
         * Maneja clicks fuera del menú para cerrarlo
         * @param {Event} e - Evento de click
         */
        _handleDocumentClick(e) {
            var btnToggle = this.querySelector('.nav__toggle');
            var menuLista = this.querySelector('.nav__lista');

            if (!this.contains(e.target) && menuLista) {
                menuLista.classList.remove('nav__lista--abierto');
                if (btnToggle) {
                    btnToggle.setAttribute('aria-expanded', 'false');
                    btnToggle.classList.remove('nav__toggle--activo');
                }
            }
        }
    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-nav')) {
        customElements.define('luthier-nav', LuthierNav);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierNav = LuthierNav;

})(typeof window !== 'undefined' ? window : this);
