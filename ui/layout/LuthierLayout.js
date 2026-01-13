/**
 * LuthierLayout - Componente maestro de maquetacion
 *
 * Orquesta la estructura completa de una pagina con soporte para tres modos:
 *
 * 1. MODO AUTOMATICO (por defecto):
 *    El layout genera header, nav y footer automaticamente.
 *
 * 2. MODO PARCIAL (override selectivo con slots):
 *    Reemplaza secciones especificas usando slots nombrados.
 *
 * 3. MODO MANUAL (control total):
 *    Con el atributo "manual", no genera nada automaticamente.
 *
 * SLOTS DISPONIBLES:
 * - slot="header"     : Reemplaza el header por defecto
 * - slot="nav"        : Reemplaza la navegacion por defecto
 * - slot="breadcrumb" : Reemplaza el breadcrumb por defecto
 * - slot="contenido"  : Contenido principal explicito
 * - slot="sidebar"    : Barra lateral (activa grid de 2 columnas)
 * - slot="footer"     : Reemplaza el footer por defecto
 *
 * ATRIBUTOS:
 * - titulo      : Titulo de la pagina (actualiza document.title)
 * - tipo        : Tipo de layout (pagina, landing, articulo, documentos)
 * - breadcrumb  : Ruta del breadcrumb (ej: "Inicio > Seccion > Pagina")
 * - autor       : Autor del articulo (solo para tipo="articulo")
 * - fecha       : Fecha de publicacion ISO (solo para tipo="articulo")
 * - manual      : Modo manual (no genera componentes automaticos)
 * - sin-header  : Omite el header automatico
 * - sin-nav     : Omite la navegacion automatica
 * - sin-footer  : Omite el footer automatico
 * - sin-breadcrumb : Omite el breadcrumb aunque este definido
 *
 * @example Modo automatico
 * <luthier-layout titulo="Mi Pagina">
 *     <h1>Contenido</h1>
 * </luthier-layout>
 *
 * @example Modo parcial con sidebar
 * <luthier-layout titulo="Articulo" tipo="articulo">
 *     <h1>Titulo</h1>
 *     <p>Contenido...</p>
 *     <aside slot="sidebar">Widgets...</aside>
 * </luthier-layout>
 *
 * @example Modo manual
 * <luthier-layout titulo="Landing" manual>
 *     <luthier-header slot="header"></luthier-header>
 *     <main slot="contenido">...</main>
 * </luthier-layout>
 */
(function(global) {
    'use strict';

    class LuthierLayout extends HTMLElement {

        connectedCallback() {
            // Esperar a que el contenido interno este disponible
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            // Leer configuracion de atributos
            var config = {
                titulo: this.getAttribute('titulo') || 'Sin titulo',
                tipo: this.getAttribute('tipo') || 'pagina',
                breadcrumb: this.getAttribute('breadcrumb') || '',
                autor: this.getAttribute('autor') || '',
                fecha: this.getAttribute('fecha') || '',
                manual: this.hasAttribute('manual'),
                sinHeader: this.hasAttribute('sin-header'),
                sinNav: this.hasAttribute('sin-nav'),
                sinFooter: this.hasAttribute('sin-footer'),
                sinBreadcrumb: this.hasAttribute('sin-breadcrumb')
            };

            // Actualizar titulo del documento
            if (global.document) {
                global.document.title = config.titulo;
            }

            // Detectar slots proporcionados por el usuario
            var slots = this._detectarSlots();

            // Obtener contenido que no esta en slots
            var contenidoSuelto = this._obtenerContenidoSuelto(slots);

            // Anadir clases al componente
            this.classList.add('layout-wrapper');
            this.classList.add('layout-wrapper--' + config.tipo);
            if (config.manual) {
                this.classList.add('layout-wrapper--manual');
            }

            // Renderizar
            this._renderizar(config, slots, contenidoSuelto);
        }

        _detectarSlots() {
            var slots = {
                header: null,
                nav: null,
                breadcrumb: null,
                contenido: null,
                sidebar: null,
                footer: null
            };

            // IMPORTANTE: Solo buscar slots en hijos DIRECTOS del layout,
            // no en elementos anidados (como slots de cards internas)
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var el = hijos[i];
                var nombreSlot = el.getAttribute('slot');

                if (nombreSlot && nombreSlot in slots) {
                    slots[nombreSlot] = el.outerHTML;
                    el.parentNode.removeChild(el); // Remover para no duplicar
                }
            }

            return slots;
        }

        _obtenerContenidoSuelto(slots) {
            // Si hay slot="contenido" explicito, el contenido suelto se ignora
            if (slots.contenido) {
                return '';
            }
            // De lo contrario, todo lo que queda es el contenido
            return this.innerHTML.trim();
        }

        _renderizar(config, slots, contenidoSuelto) {
            var tipo = config.tipo;
            var manual = config.manual;

            // En modo manual, solo renderizar los slots proporcionados
            if (manual) {
                this.innerHTML = this._renderManual(config, slots, contenidoSuelto);
                return;
            }

            // Modo automatico/parcial
            this.innerHTML = this._renderAutomatico(config, slots, contenidoSuelto);
        }

        _renderManual(config, slots, contenidoSuelto) {
            var tipo = config.tipo;
            var tieneSidebar = !!slots.sidebar;

            return '\
                <div class="layout layout--' + tipo + ' layout--manual">\
                    ' + (slots.header || '') + '\
                    ' + (slots.nav || '') + '\
                    ' + (slots.breadcrumb || '') + '\
                    <main class="layout__main" role="main" id="contenido-principal">\
                        ' + (tieneSidebar ? '<div class="layout__grid">' : '') + '\
                        <div class="layout__contenido">\
                            ' + (slots.contenido || contenidoSuelto) + '\
                        </div>\
                        ' + (tieneSidebar ? '\
                            <aside class="layout__sidebar">\
                                ' + slots.sidebar + '\
                            </aside>\
                        ' : '') + '\
                        ' + (tieneSidebar ? '</div>' : '') + '\
                    </main>\
                    ' + (slots.footer || '') + '\
                </div>\
            ';
        }

        _renderAutomatico(config, slots, contenidoSuelto) {
            var tipo = config.tipo;
            var tieneSidebar = !!slots.sidebar;

            // Determinar que componentes renderizar
            var headerHTML = slots.header || (config.sinHeader ? '' : '<luthier-header></luthier-header>');
            var navHTML = slots.nav || (config.sinNav ? '' : '<luthier-nav></luthier-nav>');
            var footerHTML = slots.footer || (config.sinFooter ? '' : '<luthier-footer></luthier-footer>');

            // Breadcrumb
            var breadcrumbHTML = '';
            if (slots.breadcrumb) {
                breadcrumbHTML = slots.breadcrumb;
            } else if (config.breadcrumb && !config.sinBreadcrumb) {
                breadcrumbHTML = '<luthier-breadcrumbs ruta="' + config.breadcrumb + '"></luthier-breadcrumbs>';
            }

            // Contenido principal
            var contenidoPrincipal = slots.contenido || contenidoSuelto;

            // Meta de articulo (autor, fecha)
            var metaArticulo = this._renderMetaArticulo(config);

            var mainContent = '';
            if (tieneSidebar) {
                mainContent = '\
                    <div class="layout__grid">\
                        <div class="layout__contenido">\
                            ' + contenidoPrincipal + '\
                        </div>\
                        <aside class="layout__sidebar">\
                            ' + slots.sidebar + '\
                        </aside>\
                    </div>\
                ';
            } else {
                mainContent = '\
                    <div class="layout__contenido">\
                        ' + contenidoPrincipal + '\
                    </div>\
                ';
            }

            return '\
                <div class="layout layout--' + tipo + '">\
                    ' + headerHTML + '\
                    ' + navHTML + '\
                    ' + (breadcrumbHTML ? '\
                        <div class="layout__breadcrumb-wrapper">\
                            ' + breadcrumbHTML + '\
                        </div>\
                    ' : '') + '\
                    <main class="layout__main" role="main" id="contenido-principal">\
                        ' + metaArticulo + '\
                        ' + mainContent + '\
                    </main>\
                    ' + footerHTML + '\
                </div>\
            ';
        }

        _renderMetaArticulo(config) {
            // Solo para tipo="articulo" y si hay autor o fecha
            if (config.tipo !== 'articulo') return '';
            if (!config.autor && !config.fecha) return '';

            var fechaFormateada = config.fecha ? LuthierDate.formatoLargo(config.fecha) : '';

            return '\
                <div class="articulo__meta">\
                    ' + (config.autor ? '\
                        <span class="articulo__autor">\
                            <span class="articulo__meta-label">Por:</span>\
                            ' + config.autor + '\
                        </span>\
                    ' : '') + '\
                    ' + (config.fecha ? '\
                        <time class="articulo__fecha" datetime="' + config.fecha + '">\
                            <span class="articulo__meta-label">Publicado:</span>\
                            ' + fechaFormateada + '\
                        </time>\
                    ' : '') + '\
                </div>\
            ';
        }

    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-layout')) {
        customElements.define('luthier-layout', LuthierLayout);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierLayout = LuthierLayout;

})(typeof window !== 'undefined' ? window : this);
