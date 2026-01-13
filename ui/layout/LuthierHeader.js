/**
 * LuthierHeader - Cabecera institucional
 *
 * Renderiza la barra superior con:
 * - Logo institucional
 * - Logo secundario (opcional)
 * - Boton de accesibilidad
 * - Skip link para navegacion por teclado
 *
 * CONFIGURACION:
 * Los datos se obtienen de window.LUTHIER_CONFIG.sitio
 *
 * ATRIBUTOS:
 * - logo          : URL del logo (override de config)
 * - nombre        : Nombre corto (override de config)
 * - nombre-completo : Nombre largo (override de config)
 * - variante      : "normal" | "minimal" | "oscuro"
 *
 * @example
 * <luthier-header></luthier-header>
 *
 * @example
 * <luthier-header variante="minimal" nombre="Mi Organizacion"></luthier-header>
 */
(function(global) {
    'use strict';

    class LuthierHeader extends HTMLElement {

        connectedCallback() {
            // Obtener ruta base para file:// protocol
            var _rutaBase = (typeof global._calcularRutaBase === 'function') ? global._calcularRutaBase() : '';

            var config = global.LUTHIER_CONFIG || {};
            var sitio = config.sitio || {};

            // Atributos con fallback a configuracion global
            var logo = this.getAttribute('logo') || sitio.logo || '';
            var nombre = this.getAttribute('nombre') || sitio.nombre || 'Mi Sitio';
            var nombreCompleto = this.getAttribute('nombre-completo') || sitio.nombreCompleto || '';
            var logoSecundario = sitio.logoSecundario || '';
            var variante = this.getAttribute('variante') || 'normal';

            // Anadir clase de variante
            this.classList.add('header-wrapper');
            if (variante !== 'normal') {
                this.classList.add('header-wrapper--' + variante);
            }

            this.innerHTML = this._render({
                rutaBase: _rutaBase,
                logo: logo,
                nombre: nombre,
                nombreCompleto: nombreCompleto,
                logoSecundario: logoSecundario,
                variante: variante
            });
        }

        _render(datos) {
            var rutaBase = datos.rutaBase || '';
            var logo = datos.logo;
            var nombre = datos.nombre;
            var nombreCompleto = datos.nombreCompleto;
            var logoSecundario = datos.logoSecundario;
            var variante = datos.variante;
            var mostrarNombreCompleto = nombreCompleto && nombreCompleto !== nombre;

            return '\
                <header class="header header--' + variante + '" role="banner">\
                    <div class="header__container">\
                        ' + (logoSecundario ? '\
                            <div class="header__logo-secundario">\
                                <img src="' + rutaBase + logoSecundario + '"\
                                     alt=""\
                                     class="header__logo-secundario-img">\
                            </div>\
                        ' : '') + '\
                        <a href="' + rutaBase + 'index.html" class="header__brand">\
                            ' + (logo ? '\
                                <img src="' + rutaBase + logo + '"\
                                     alt="' + nombre + '"\
                                     class="header__logo">\
                            ' : '') + '\
                            <div class="header__titulo">\
                                <span class="header__nombre">' + nombre + '</span>\
                                ' + (mostrarNombreCompleto ? '\
                                    <span class="header__nombre-completo">' + nombreCompleto + '</span>\
                                ' : '') + '\
                            </div>\
                        </a>\
                        <a href="#contenido-principal" class="header__skip-link">\
                            Ir al contenido principal\
                        </a>\
                    </div>\
                </header>\
            ';
        }
    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-header')) {
        customElements.define('luthier-header', LuthierHeader);
    }

    // Exponer para uso externo
    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierHeader = LuthierHeader;

})(typeof window !== 'undefined' ? window : this);
