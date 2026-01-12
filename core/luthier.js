/**
 * Luthier - Toolkit de Web Components para sitios estaticos
 *
 * Archivo principal que carga todos los componentes de forma secuencial.
 * Compatible con protocolo file:/// (sin servidor).
 *
 * USO:
 * 1. Definir window.LUTHIER_CONFIG antes de cargar este archivo
 * 2. Cargar este archivo con <script src="core/luthier.js"></script>
 *
 * NOTA: Este archivo usa document.write() para cargar componentes
 * de forma sincrona y garantizar compatibilidad con file:///.
 * Para produccion, usar el bundle: dist/luthier.bundle.js
 *
 * @version 1.0.0
 * @license MIT
 */
(function(global) {
    'use strict';

    // =========================================================================
    // CONFIGURACION POR DEFECTO
    // =========================================================================

    global.LUTHIER_CONFIG = global.LUTHIER_CONFIG || {
        sitio: {
            nombre: 'Mi Sitio',
            nombreCompleto: '',
            logo: '',
            logoSecundario: ''
        },
        menu: [],
        contacto: {},
        redesSociales: [],
        enlacesFooter: []
    };

    // =========================================================================
    // INYECCION DE FAVICON
    // =========================================================================

    (function inyectarFavicon() {
        var config = global.LUTHIER_CONFIG;
        if (!config || !config.sitio || !config.sitio.favicon) return;
        if (document.querySelector('link[rel="icon"]')) return;

        var link = document.createElement('link');
        link.rel = 'icon';
        link.href = config.sitio.favicon;

        var head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(link);
    })();

    // =========================================================================
    // PREVENCION DE FOUC (Flash of Unstyled Content)
    // =========================================================================

    (function inyectarFOUC() {
        if (document.getElementById('luthier-fouc-style')) return;

        var style = document.createElement('style');
        style.id = 'luthier-fouc-style';
        style.textContent = [
            '/* Luthier: Ocultar componentes hasta que esten definidos */',
            ':not(:defined) {',
            '    visibility: hidden;',
            '}'
        ].join('\n');

        // Insertar lo antes posible
        var head = document.head || document.getElementsByTagName('head')[0];
        if (head.firstChild) {
            head.insertBefore(style, head.firstChild);
        } else {
            head.appendChild(style);
        }
    })();

    // =========================================================================
    // DETECCION DE RUTA BASE
    // =========================================================================

    var scriptActual = document.currentScript;
    var rutaBase = '';

    if (scriptActual && scriptActual.src) {
        // Obtener la ruta del directorio donde esta luthier.js
        var partes = scriptActual.src.split('/');
        partes.pop(); // Quitar "luthier.js"
        partes.pop(); // Quitar "core"
        rutaBase = partes.join('/') + '/';
    }

    // =========================================================================
    // CARGA DE DATA HELPERS
    // =========================================================================

    var dataHelpers = [
        'data/utils.js',
        'data/data-mapper.js',
        'data/search-engine.js',
        'data/date-formatter.js',
        'data/frontmatter-parser.js',
        'data/collection-loader.js'
    ];

    // Cargar helpers de forma sincrona
    // document.write es necesario para carga sincrona (compatibilidad file:///)
    // Las rutas vienen de un array constante, no de input del usuario
    dataHelpers.forEach(function(helper) {
        var src = rutaBase + helper;
        // Carga sincrona requerida para file:///
        document.write('<script src="' + src + '"><\/script>');
    });

    // =========================================================================
    // CARGA DE COMPONENTES
    // =========================================================================

    var componentes = [
        // Layout
        'ui/layout/LuthierHeader.js',
        'ui/layout/LuthierFooter.js',
        'ui/layout/LuthierSidebar.js',
        'ui/layout/LuthierLayout.js',
        // Navegacion
        'ui/navigation/LuthierNav.js',
        'ui/navigation/LuthierBreadcrumbs.js',
        // Contenido
        'ui/content/LuthierCard.js',
        'ui/content/LuthierLoop.js',
        'ui/content/LuthierAccordion.js',
        'ui/content/LuthierContent.js',
        // Documentos
        'ui/documents/LuthierDocLibrary.js',
        'ui/documents/LuthierDocCard.js',
        // Accesibilidad
        'ui/accessibility/LuthierA11yWidget.js'
    ];

    // Cargar cada componente de forma sincrona
    componentes.forEach(function(componente) {
        var src = rutaBase + componente;
        // Carga sincrona requerida para file:///
        document.write('<script src="' + src + '"><\/script>');
    });

    // =========================================================================
    // MENSAJE DE CONFIRMACION
    // =========================================================================

    // Registrar que Luthier se cargo correctamente
    global.LUTHIER_LOADED = true;
    global.LUTHIER_VERSION = '1.0.0';

    // Log en consola (solo en desarrollo)
    if (global.console && global.console.log) {
        global.addEventListener('DOMContentLoaded', function() {
            console.log('%c\uD83C\uDFB8 Luthier v' + global.LUTHIER_VERSION + ' cargado correctamente', 'color: #3366cc; font-weight: bold;');
        });
    }

})(typeof window !== 'undefined' ? window : this);
