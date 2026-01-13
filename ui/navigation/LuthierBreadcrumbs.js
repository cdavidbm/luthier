/**
 * LuthierBreadcrumbs - Migas de pan para navegacion
 *
 * Muestra la ruta de navegacion jerarquica.
 * Puede recibir la ruta manualmente o generarla desde la URL.
 *
 * ATRIBUTOS:
 * - ruta : Ruta manual separada por ">" (ej: "Inicio > Seccion > Pagina")
 * - auto : Si es "true", genera la ruta automaticamente desde la URL
 * - inicio : Texto para el primer elemento (default: "Inicio")
 * - inicio-url : URL del primer elemento (default: "index.html")
 *
 * @example Ruta manual
 * <luthier-breadcrumbs ruta="Inicio > Normativa > Resoluciones"></luthier-breadcrumbs>
 *
 * @example Ruta automatica
 * <luthier-breadcrumbs auto="true"></luthier-breadcrumbs>
 *
 * @example Personalizado
 * <luthier-breadcrumbs auto="true" inicio="Home" inicio-url="index.html"></luthier-breadcrumbs>
 */
(function(global) {
    'use strict';

    class LuthierBreadcrumbs extends HTMLElement {

        connectedCallback() {
            var rutaManual = this.getAttribute('ruta');
            var auto = this.getAttribute('auto') === 'true';
            var textoInicio = this.getAttribute('inicio') || 'Inicio';
            var urlInicio = this.getAttribute('inicio-url') || 'index.html';

            var items = [];

            if (rutaManual) {
                // Ruta definida manualmente: "Inicio > Seccion > Pagina"
                items = this._parsearRutaManual(rutaManual);
            } else if (auto) {
                // Generar automaticamente desde la URL
                items = this._generarDesdeURL(textoInicio, urlInicio);
            }

            // Si no hay items o solo hay uno, no mostrar
            if (items.length <= 1) {
                this.style.display = 'none';
                return;
            }

            this.classList.add('breadcrumb-wrapper');
            this.innerHTML = this._render(items);
        }

        _parsearRutaManual(ruta) {
            var partes = ruta.split('>');
            var items = [];

            for (var i = 0; i < partes.length; i++) {
                var texto = partes[i].trim();
                items.push({
                    texto: texto,
                    url: i < partes.length - 1 ? '#' : null, // Ultimo sin enlace
                    esActual: i === partes.length - 1
                });
            }

            return items;
        }

        _generarDesdeURL(textoInicio, urlInicio) {
            var pathname = global.location ? global.location.pathname : '/';
            var segmentos = pathname.split('/').filter(Boolean);

            // Empezar con inicio
            var items = [{
                texto: textoInicio,
                url: urlInicio,
                esActual: segmentos.length === 0
            }];

            // Construir ruta acumulativa
            var rutaAcumulada = '';

            for (var i = 0; i < segmentos.length; i++) {
                var segmento = segmentos[i];
                // Quitar extension .html si existe
                var nombre = segmento.replace(/\.html$/i, '');

                // Convertir slug a texto legible
                var palabras = nombre.split('-');
                var textoLegible = '';
                for (var j = 0; j < palabras.length; j++) {
                    var palabra = palabras[j];
                    textoLegible += palabra.charAt(0).toUpperCase() + palabra.slice(1);
                    if (j < palabras.length - 1) textoLegible += ' ';
                }

                rutaAcumulada += '/' + segmento;

                items.push({
                    texto: textoLegible,
                    url: i < segmentos.length - 1 ? rutaAcumulada : null,
                    esActual: i === segmentos.length - 1
                });
            }

            return items;
        }

        _render(items) {
            var html = '';

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var esUltimo = item.esActual || i === items.length - 1;

                var textoSeguro = LuthierUtils.escaparHTML(item.texto);
                var urlSegura = LuthierUtils.sanitizarURL(item.url || '#');
                var contenido = esUltimo
                    ? '<span aria-current="page">' + textoSeguro + '</span>'
                    : '<a href="' + urlSegura + '">' + textoSeguro + '</a>';

                var separador = !esUltimo
                    ? '<span class="breadcrumb__separador" aria-hidden="true">&#8250;</span>'
                    : '';

                html += '\
                    <li class="breadcrumb__item ' + (esUltimo ? 'breadcrumb__item--actual' : '') + '">\
                        ' + contenido + '\
                        ' + separador + '\
                    </li>\
                ';
            }

            return '\
                <nav class="breadcrumb" aria-label="Ruta de navegacion">\
                    <ol class="breadcrumb__lista">\
                        ' + html + '\
                    </ol>\
                </nav>\
            ';
        }
    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-breadcrumbs')) {
        customElements.define('luthier-breadcrumbs', LuthierBreadcrumbs);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierBreadcrumbs = LuthierBreadcrumbs;

})(typeof window !== 'undefined' ? window : this);
