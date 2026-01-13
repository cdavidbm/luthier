/**
 * LuthierFooter - Pie de pagina institucional
 *
 * Renderiza el footer con:
 * - Informacion institucional
 * - Datos de contacto
 * - Enlaces rapidos
 * - Redes sociales
 * - Copyright y creditos
 *
 * CONFIGURACION:
 * Los datos se obtienen de window.LUTHIER_CONFIG:
 * - sitio: { nombre, nombreCompleto }
 * - contacto: { direccion, ciudad, telefono, email, horario }
 * - redesSociales: [{ nombre, url }]
 * - enlacesFooter: [{ nombre, slug|url, externo }]
 *
 * ATRIBUTOS:
 * - variante : "normal" | "minimal" | "compacto"
 * - sin-creditos : Oculta la linea "Desarrollado con Luthier"
 *
 * @example
 * <luthier-footer></luthier-footer>
 *
 * @example
 * <luthier-footer variante="minimal" sin-creditos></luthier-footer>
 */
(function(global) {
    'use strict';

    class LuthierFooter extends HTMLElement {

        connectedCallback() {
            var config = global.LUTHIER_CONFIG || {};
            var variante = this.getAttribute('variante') || 'normal';
            var sinCreditos = this.hasAttribute('sin-creditos');

            var datos = {
                sitio: config.sitio || {},
                contacto: config.contacto || {},
                redesSociales: config.redesSociales || [],
                enlacesFooter: config.enlacesFooter || []
            };

            this.classList.add('footer-wrapper');
            this.classList.add('footer-wrapper--' + variante);

            this.innerHTML = this._render(datos, variante, sinCreditos);
        }

        _render(datos, variante, sinCreditos) {
            var sitio = datos.sitio;
            var contacto = datos.contacto;
            var redesSociales = datos.redesSociales;
            var enlacesFooter = datos.enlacesFooter;
            var anioActual = new Date().getFullYear();
            var nombreSitio = sitio.nombre || 'Mi Sitio';
            var self = this;

            // Variante minimal: solo copyright
            if (variante === 'minimal') {
                return '\
                    <footer class="footer footer--minimal" role="contentinfo">\
                        <div class="footer__barra">\
                            <p class="footer__copyright">\
                                &copy; ' + anioActual + ' ' + nombreSitio + '\
                            </p>\
                        </div>\
                    </footer>\
                ';
            }

            // Variante normal o compacto
            var tieneContacto = contacto.direccion || contacto.telefono || contacto.email;
            var tieneRedes = redesSociales.length > 0;
            var tieneEnlaces = enlacesFooter.length > 0;

            return '\
                <footer class="footer footer--' + variante + '" role="contentinfo">\
                    <div class="footer__container">\
                        <div class="footer__columna footer__columna--info">\
                            <h3 class="footer__titulo">' + nombreSitio + '</h3>\
                            ' + (sitio.nombreCompleto ? '\
                                <p class="footer__descripcion">' + sitio.nombreCompleto + '</p>\
                            ' : '') + '\
                        </div>\
                        ' + (tieneContacto ? self._renderContacto(contacto) : '') + '\
                        ' + (tieneEnlaces ? self._renderEnlaces(enlacesFooter) : '') + '\
                        ' + (tieneRedes ? self._renderRedes(redesSociales) : '') + '\
                    </div>\
                    <div class="footer__barra">\
                        <p class="footer__copyright">\
                            &copy; ' + anioActual + ' ' + nombreSitio + '. Todos los derechos reservados.\
                        </p>\
                        ' + (!sinCreditos ? '\
                            <p class="footer__creditos">\
                                Desarrollado con\
                                <a href="https://github.com/cdavidbm/luthier"\
                                   target="_blank"\
                                   rel="noopener noreferrer">\
                                    Luthier\
                                </a>\
                            </p>\
                        ' : '') + '\
                    </div>\
                </footer>\
            ';
        }

        _renderContacto(contacto) {
            return '\
                <div class="footer__columna footer__columna--contacto">\
                    <h3 class="footer__titulo">Contacto</h3>\
                    <ul class="footer__lista">\
                        ' + (contacto.direccion ? '\
                            <li class="footer__item">\
                                <span class="footer__icono" aria-hidden="true">&#128205;</span>\
                                <span>' + contacto.direccion + '</span>\
                            </li>\
                        ' : '') + '\
                        ' + (contacto.ciudad ? '\
                            <li class="footer__item">\
                                <span class="footer__icono" aria-hidden="true">&#127961;</span>\
                                <span>' + contacto.ciudad + '</span>\
                            </li>\
                        ' : '') + '\
                        ' + (contacto.telefono ? '\
                            <li class="footer__item">\
                                <span class="footer__icono" aria-hidden="true">&#128222;</span>\
                                <a href="tel:' + contacto.telefono.replace(/\\s/g, '') + '">' + contacto.telefono + '</a>\
                            </li>\
                        ' : '') + '\
                        ' + (contacto.email ? '\
                            <li class="footer__item">\
                                <span class="footer__icono" aria-hidden="true">&#9993;</span>\
                                <a href="mailto:' + contacto.email + '">' + contacto.email + '</a>\
                            </li>\
                        ' : '') + '\
                        ' + (contacto.horario ? '\
                            <li class="footer__item">\
                                <span class="footer__icono" aria-hidden="true">&#128336;</span>\
                                <span>' + contacto.horario + '</span>\
                            </li>\
                        ' : '') + '\
                    </ul>\
                </div>\
            ';
        }

        _renderEnlaces(enlaces) {
            var html = '<div class="footer__columna footer__columna--enlaces">\
                <h3 class="footer__titulo">Enlaces</h3>\
                <ul class="footer__lista">';

            for (var i = 0; i < enlaces.length; i++) {
                var enlace = enlaces[i];
                var href = enlace.url || enlace.slug || '#';
                var esExterno = enlace.externo === true;
                var attrTarget = esExterno ? ' target="_blank"' : '';
                var attrRel = esExterno ? ' rel="noopener noreferrer"' : '';

                html += '<li class="footer__item">\
                    <a href="' + href + '"' + attrTarget + attrRel + '>\
                        ' + enlace.nombre + '\
                        ' + (esExterno ? '<span class="footer__externo" aria-label="(externo)">&#8599;</span>' : '') + '\
                    </a>\
                </li>';
            }

            html += '</ul></div>';
            return html;
        }

        _renderRedes(redes) {
            var self = this;
            var html = '<div class="footer__columna footer__columna--redes">\
                <h3 class="footer__titulo">Siguenos</h3>\
                <ul class="footer__redes">';

            for (var i = 0; i < redes.length; i++) {
                var red = redes[i];
                var icono = self._obtenerIconoRed(red.nombre);
                html += '<li class="footer__red-item">\
                    <a href="' + red.url + '"\
                       target="_blank"\
                       rel="noopener noreferrer"\
                       aria-label="Siguenos en ' + red.nombre + '"\
                       title="' + red.nombre + '"\
                       class="footer__red-enlace">\
                        <span aria-hidden="true">' + icono + '</span>\
                    </a>\
                </li>';
            }

            html += '</ul></div>';
            return html;
        }

        _obtenerIconoRed(nombre) {
            // Iconos de Font Awesome (fa-brands)
            var iconos = {
                'facebook': '<i class="fa-brands fa-facebook-f"></i>',
                'twitter': '<i class="fa-brands fa-x-twitter"></i>',
                'x': '<i class="fa-brands fa-x-twitter"></i>',
                'instagram': '<i class="fa-brands fa-instagram"></i>',
                'youtube': '<i class="fa-brands fa-youtube"></i>',
                'linkedin': '<i class="fa-brands fa-linkedin-in"></i>',
                'tiktok': '<i class="fa-brands fa-tiktok"></i>',
                'github': '<i class="fa-brands fa-github"></i>',
                'whatsapp': '<i class="fa-brands fa-whatsapp"></i>'
            };

            var nombreLower = (nombre || '').toLowerCase();
            return iconos[nombreLower] || '<i class="fa-solid fa-link"></i>';
        }
    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-footer')) {
        customElements.define('luthier-footer', LuthierFooter);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierFooter = LuthierFooter;

})(typeof window !== 'undefined' ? window : this);
