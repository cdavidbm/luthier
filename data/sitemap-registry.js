/**
 * LuthierSitemapRegistry - Registro centralizado de paginas
 *
 * Sistema para registrar todas las paginas del sitio y validar
 * que no existan paginas huerfanas o enlaces rotos.
 *
 * FUNCIONALIDADES:
 * - Registro de todas las paginas del sitio
 * - Validacion de que las paginas esten en el menu
 * - Deteccion de enlaces rotos
 * - Generacion automatica de sitemap
 * - Reporte de paginas huerfanas
 *
 * @example Configuracion en sitio.js
 * window.LUTHIER_PAGES = [
 *     {
 *         slug: 'index.html',
 *         titulo: 'Inicio',
 *         descripcion: 'Pagina principal',
 *         enMenu: true,
 *         breadcrumb: 'Inicio'
 *     },
 *     {
 *         slug: 'paginas/agencia/mision-vision.html',
 *         titulo: 'Mision y Vision',
 *         descripcion: 'Mision, Vision y Proposito Estrategico',
 *         enMenu: true,
 *         breadcrumb: 'Inicio > Agencia > Mision y Vision'
 *     }
 * ];
 */
(function(global) {
    'use strict';

    var LuthierSitemapRegistry = {

        _paginas: [],
        _menuItems: [],
        _validado: false,
        _errores: [],
        _advertencias: [],

        /**
         * Inicializa el registro con las paginas definidas
         */
        init: function() {
            var self = this;

            // Cargar paginas desde LUTHIER_PAGES
            if (global.LUTHIER_PAGES && Array.isArray(global.LUTHIER_PAGES)) {
                this._paginas = global.LUTHIER_PAGES.slice();
            }

            // Extraer items del menu desde LUTHIER_CONFIG
            if (global.LUTHIER_CONFIG && global.LUTHIER_CONFIG.menu) {
                this._menuItems = this._extraerMenuItems(global.LUTHIER_CONFIG.menu);
            }

            return this;
        },

        /**
         * Extrae todos los items del menu recursivamente
         */
        _extraerMenuItems: function(menu, items) {
            items = items || [];
            var self = this;

            for (var i = 0; i < menu.length; i++) {
                var item = menu[i];

                if (item.slug && item.slug !== '#') {
                    items.push({
                        nombre: item.nombre,
                        slug: this._normalizarSlug(item.slug),
                        externo: !!item.externo
                    });
                }

                if (item.url && item.externo) {
                    items.push({
                        nombre: item.nombre,
                        url: item.url,
                        externo: true
                    });
                }

                if (item.submenu && Array.isArray(item.submenu)) {
                    this._extraerMenuItems(item.submenu, items);
                }
            }

            return items;
        },

        /**
         * Normaliza un slug para comparacion
         */
        _normalizarSlug: function(slug) {
            if (!slug) return '';
            // Remover / inicial y normalizar
            return slug.replace(/^\/+/, '').replace(/\/+$/, '');
        },

        /**
         * Registra una pagina en el sistema
         */
        registrar: function(config) {
            if (!config || !config.slug) {
                console.warn('LuthierSitemapRegistry: Se requiere un slug para registrar la pagina');
                return this;
            }

            var pagina = {
                slug: this._normalizarSlug(config.slug),
                titulo: config.titulo || 'Sin titulo',
                descripcion: config.descripcion || '',
                enMenu: config.enMenu !== false,
                breadcrumb: config.breadcrumb || '',
                ultimaModificacion: config.ultimaModificacion || new Date().toISOString().split('T')[0]
            };

            // Evitar duplicados
            var existe = false;
            for (var i = 0; i < this._paginas.length; i++) {
                if (this._paginas[i].slug === pagina.slug) {
                    existe = true;
                    this._paginas[i] = pagina;
                    break;
                }
            }

            if (!existe) {
                this._paginas.push(pagina);
            }

            this._validado = false;
            return this;
        },

        /**
         * Registra la pagina actual automaticamente
         */
        registrarPaginaActual: function() {
            var slug = this._obtenerSlugActual();
            var titulo = document.title || 'Sin titulo';
            var descripcion = '';
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                descripcion = metaDesc.getAttribute('content') || '';
            }

            return this.registrar({
                slug: slug,
                titulo: titulo,
                descripcion: descripcion
            });
        },

        /**
         * Obtiene el slug de la pagina actual
         */
        _obtenerSlugActual: function() {
            var path = global.location.pathname;

            // Para file:/// extraer desde la ruta
            if (global.location.protocol === 'file:') {
                // Buscar el directorio base del sitio
                var partes = path.split('/');
                // Intentar encontrar index.html o similar
                for (var i = partes.length - 1; i >= 0; i--) {
                    if (partes[i].endsWith('.html')) {
                        // Construir ruta relativa
                        var rutaRelativa = partes.slice(i).join('/');
                        return this._normalizarSlug(rutaRelativa);
                    }
                }
            }

            return this._normalizarSlug(path);
        },

        /**
         * Valida el registro completo
         */
        validar: function() {
            this._errores = [];
            this._advertencias = [];

            // 1. Verificar paginas huerfanas (no en menu)
            this._validarPaginasHuerfanas();

            // 2. Verificar items de menu sin pagina
            this._validarMenuSinPagina();

            // 3. Verificar pagina actual
            this._validarPaginaActual();

            this._validado = true;

            return {
                valido: this._errores.length === 0,
                errores: this._errores.slice(),
                advertencias: this._advertencias.slice()
            };
        },

        /**
         * Detecta paginas que no estan en el menu
         */
        _validarPaginasHuerfanas: function() {
            var self = this;

            for (var i = 0; i < this._paginas.length; i++) {
                var pagina = this._paginas[i];

                if (pagina.enMenu === false) continue; // Explicitamente excluida

                var enMenu = false;
                for (var j = 0; j < this._menuItems.length; j++) {
                    if (this._menuItems[j].slug === pagina.slug) {
                        enMenu = true;
                        break;
                    }
                }

                if (!enMenu) {
                    this._advertencias.push({
                        tipo: 'pagina-huerfana',
                        mensaje: 'Pagina no encontrada en el menu: ' + pagina.slug,
                        pagina: pagina
                    });
                }
            }
        },

        /**
         * Detecta items del menu que no tienen pagina registrada
         */
        _validarMenuSinPagina: function() {
            var self = this;

            for (var i = 0; i < this._menuItems.length; i++) {
                var item = this._menuItems[i];

                if (item.externo) continue; // Links externos no necesitan pagina

                var tienePagina = false;
                for (var j = 0; j < this._paginas.length; j++) {
                    if (this._paginas[j].slug === item.slug) {
                        tienePagina = true;
                        break;
                    }
                }

                if (!tienePagina) {
                    this._errores.push({
                        tipo: 'menu-sin-pagina',
                        mensaje: 'Item del menu sin pagina registrada: ' + item.nombre + ' (' + item.slug + ')',
                        item: item
                    });
                }
            }
        },

        /**
         * Valida que la pagina actual este registrada
         */
        _validarPaginaActual: function() {
            var slugActual = this._obtenerSlugActual();
            var encontrada = false;

            for (var i = 0; i < this._paginas.length; i++) {
                if (this._paginas[i].slug === slugActual) {
                    encontrada = true;
                    break;
                }
            }

            if (!encontrada && slugActual) {
                this._advertencias.push({
                    tipo: 'pagina-no-registrada',
                    mensaje: 'La pagina actual no esta registrada: ' + slugActual,
                    slug: slugActual
                });
            }
        },

        /**
         * Obtiene todas las paginas registradas
         */
        obtenerPaginas: function() {
            return this._paginas.slice();
        },

        /**
         * Obtiene paginas huerfanas
         */
        obtenerHuerfanas: function() {
            if (!this._validado) {
                this.validar();
            }

            var huerfanas = [];
            for (var i = 0; i < this._advertencias.length; i++) {
                if (this._advertencias[i].tipo === 'pagina-huerfana') {
                    huerfanas.push(this._advertencias[i].pagina);
                }
            }
            return huerfanas;
        },

        /**
         * Genera un sitemap en formato objeto
         */
        generarSitemap: function() {
            var baseUrl = global.LUTHIER_CONFIG && global.LUTHIER_CONFIG.sitio && global.LUTHIER_CONFIG.sitio.url
                ? global.LUTHIER_CONFIG.sitio.url
                : '';

            var sitemap = {
                generado: new Date().toISOString(),
                baseUrl: baseUrl,
                paginas: []
            };

            for (var i = 0; i < this._paginas.length; i++) {
                var pagina = this._paginas[i];
                sitemap.paginas.push({
                    loc: baseUrl + '/' + pagina.slug,
                    lastmod: pagina.ultimaModificacion,
                    titulo: pagina.titulo,
                    descripcion: pagina.descripcion
                });
            }

            return sitemap;
        },

        /**
         * Genera sitemap en formato XML
         */
        generarSitemapXML: function() {
            var sitemap = this.generarSitemap();
            var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

            for (var i = 0; i < sitemap.paginas.length; i++) {
                var pagina = sitemap.paginas[i];
                xml += '  <url>\n';
                xml += '    <loc>' + this._escaparXML(pagina.loc) + '</loc>\n';
                xml += '    <lastmod>' + pagina.lastmod + '</lastmod>\n';
                xml += '  </url>\n';
            }

            xml += '</urlset>';
            return xml;
        },

        /**
         * Escapa caracteres especiales para XML
         */
        _escaparXML: function(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        },

        /**
         * Imprime reporte en consola
         */
        imprimirReporte: function() {
            var resultado = this.validar();

            console.group('[Luthier Sitemap Registry] Reporte de Validacion');

            console.log('Total de paginas registradas:', this._paginas.length);
            console.log('Items en menu:', this._menuItems.length);

            if (resultado.errores.length > 0) {
                console.group('Errores:', resultado.errores.length);
                for (var i = 0; i < resultado.errores.length; i++) {
                    console.error(resultado.errores[i].mensaje);
                }
                console.groupEnd();
            }

            if (resultado.advertencias.length > 0) {
                console.group('Advertencias:', resultado.advertencias.length);
                for (var j = 0; j < resultado.advertencias.length; j++) {
                    console.warn(resultado.advertencias[j].mensaje);
                }
                console.groupEnd();
            }

            if (resultado.valido && resultado.advertencias.length === 0) {
                console.log('Todas las paginas estan correctamente registradas y enlazadas');
            }

            console.groupEnd();

            return resultado;
        }
    };

    // Inicializar automaticamente cuando el DOM este listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LuthierSitemapRegistry.init();
        });
    } else {
        LuthierSitemapRegistry.init();
    }

    // Exponer globalmente
    global.LuthierSitemapRegistry = LuthierSitemapRegistry;

})(typeof window !== 'undefined' ? window : this);
