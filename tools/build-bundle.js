#!/usr/bin/env node
/**
 * build-bundle.js - Generador de bundle para Luthier
 *
 * Combina todos los componentes en un solo archivo para producción.
 *
 * USO:
 *   node tools/build-bundle.js
 *
 * SALIDA:
 *   dist/luthier.bundle.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'dist', 'luthier.bundle.js');
const OUTPUT_MIN = path.join(ROOT, 'dist', 'luthier.bundle.min.js');
const VERSION = '1.4.0';

// Orden de archivos a incluir (importante para dependencias)
const SOURCE_FILES = [
    // Data helpers primero
    'data/utils.js',
    'data/data-mapper.js',
    'data/date-formatter.js',
    'data/search-engine.js',
    'data/frontmatter-parser.js',
    'data/collection-loader.js',
    // Componentes de layout
    'ui/layout/LuthierHeader.js',
    'ui/layout/LuthierFooter.js',
    'ui/layout/LuthierSidebar.js',
    'ui/layout/LuthierLayout.js',
    // Navegación
    'ui/navigation/LuthierNav.js',
    'ui/navigation/LuthierBreadcrumbs.js',
    // Contenido
    'ui/content/LuthierCard.js',
    'ui/content/LuthierLoop.js',
    'ui/content/LuthierAccordion.js',
    'ui/content/LuthierTabs.js',
    'ui/content/LuthierTabsVertical.js',
    'ui/content/LuthierCarousel.js',
    'ui/content/LuthierMarkdown.js',
    'ui/content/LuthierTimeline.js',
    'ui/content/LuthierGallery.js',
    'ui/content/LuthierTeam.js',
    'ui/content/LuthierToc.js',
    'ui/content/LuthierAlert.js',
    'ui/content/LuthierBackToTop.js',
    'ui/content/LuthierStats.js',
    'ui/content/LuthierQuote.js',
    'ui/content/LuthierEmbed.js',
    'ui/content/LuthierBlog.js',
    'ui/content/LuthierSearch.js',
    'ui/content/LuthierContent.js',
    // Documentos
    'ui/documents/LuthierDocLibrary.js',
    'ui/documents/LuthierDocCard.js',
    // Accesibilidad
    'ui/accessibility/LuthierA11yWidget.js'
];

/**
 * Extrae el contenido de un archivo sin el wrapper IIFE
 */
function extractContent(filePath) {
    // Validar que el path no contenga traversal
    if (filePath.includes('..') || path.isAbsolute(filePath)) {
        console.warn(`  ⚠ Path invalido (posible traversal): ${filePath}`);
        return null;
    }

    const fullPath = path.join(ROOT, filePath);

    // Verificar que el path resultante sigue dentro de ROOT
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(ROOT))) {
        console.warn(`  ⚠ Path fuera del directorio raiz: ${filePath}`);
        return null;
    }

    if (!fs.existsSync(fullPath)) {
        console.warn(`  ⚠ Archivo no encontrado: ${filePath}`);
        return null;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Remover el wrapper IIFE: (function(global) { ... })(window);
    // Patrón: empieza con comentario o (function(global)
    content = content
        // Remover comentarios de cabecera del archivo
        .replace(/^\/\*\*[\s\S]*?\*\/\s*/m, '')
        // Remover el inicio del IIFE
        .replace(/^\s*\(function\s*\(\s*global\s*\)\s*\{\s*['"]use strict['"];\s*/m, '')
        // Remover el final del IIFE
        .replace(/\}\s*\)\s*\(\s*typeof\s+window\s*!==\s*['"]undefined['"]\s*\?\s*window\s*:\s*this\s*\)\s*;?\s*$/m, '')
        .trim();

    return content;
}

/**
 * Genera el header del bundle
 */
function generateHeader() {
    return `/**
 * Luthier Bundle v${VERSION}
 *
 * Toolkit de Web Components para sitios estaticos.
 * Compatible con protocolo file:/// (sin servidor).
 *
 * Generado automaticamente por build-bundle.js
 * Fecha: ${new Date().toISOString().split('T')[0]}
 *
 * USO:
 * <script src="luthier.bundle.js"></script>
 *
 * @license MIT
 */
(function(global) {
    'use strict';

    // ==========================================================================
    // CONFIGURACION GLOBAL
    // ==========================================================================

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

    // ==========================================================================
    // INYECCION DE FAVICON
    // ==========================================================================

    (function() {
        var config = global.LUTHIER_CONFIG;
        if (!config || !config.sitio || !config.sitio.favicon) return;
        if (document.querySelector('link[rel="icon"]')) return;

        var link = document.createElement('link');
        link.rel = 'icon';
        link.href = config.sitio.favicon;
        document.head.appendChild(link);
    })();

    // ==========================================================================
    // PREVENCION DE FOUC
    // ==========================================================================

    (function() {
        if (document.getElementById('luthier-fouc')) return;
        var style = document.createElement('style');
        style.id = 'luthier-fouc';
        style.textContent = ':not(:defined) { visibility: hidden; }';
        document.head.appendChild(style);
    })();

    // ==========================================================================
    // UTILIDAD: Calculo de ruta base
    // ==========================================================================

    function _calcularRutaBase() {
        if (typeof global.location === 'undefined') return '';
        var path = global.location.pathname || '';
        var hostname = global.location.hostname || '';
        var protocol = global.location.protocol || '';

        // Detectar si estamos en GitHub Pages
        var isGitHubPages = hostname.indexOf('github.io') !== -1;

        // Para servidores web (HTTP/HTTPS)
        if (protocol === 'http:' || protocol === 'https:') {
            var partes = path.split('/').filter(function(p) { return p.length > 0; });

            // Si la ultima parte tiene extension .html, es un archivo
            if (partes.length > 0 && partes[partes.length - 1].indexOf('.html') !== -1) {
                partes.pop();
            }

            // En GitHub Pages, la primera parte es el nombre del repo - no contar ese nivel
            if (isGitHubPages && partes.length > 0) {
                partes.shift();
            }

            // Calcular niveles de profundidad
            var niveles = partes.length;
            if (niveles === 0) return '';

            var prefix = '';
            for (var i = 0; i < niveles; i++) {
                prefix += '../';
            }
            return prefix;
        }

        // Para file:// en Windows
        if (protocol === 'file:') {
            var partesFile = path.split('/').filter(function(p) { return p && !p.match(/^[A-Z]:$/i); });
            if (partesFile.length > 0 && partesFile[partesFile.length - 1].endsWith('.html')) {
                partesFile.pop();
            }
            var nivelesFile = 0;
            for (var j = partesFile.length - 1; j >= 0; j--) {
                if (partesFile[j] === 'paginas' || partesFile[j] === 'pages') {
                    nivelesFile = partesFile.length - j;
                    break;
                }
            }
            if (nivelesFile === 0) return '';
            var prefixFile = '';
            for (var k = 0; k < nivelesFile; k++) {
                prefixFile += '../';
            }
            return prefixFile;
        }

        return '';
    }

    // Exponer globalmente para componentes
    global._calcularRutaBase = _calcularRutaBase;

`;
}

/**
 * Minifica código JavaScript (básico, sin dependencias)
 */
function minify(code) {
    return code
        // Remover comentarios de bloque (pero preservar /*! licencias */)
        .replace(/\/\*(?!\!)[\s\S]*?\*\//g, '')
        // Remover comentarios de línea
        .replace(/([^:])\/\/.*$/gm, '$1')
        // Remover líneas vacías múltiples
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Remover espacios al inicio de línea (preservar indentación mínima)
        .replace(/^[ \t]+/gm, '')
        // Remover espacios antes de { y (
        .replace(/\s+([{(])/g, '$1')
        // Remover espacios después de { y (
        .replace(/([{(])\s+/g, '$1')
        // Remover espacios antes de } y )
        .replace(/\s+([})])/g, '$1')
        // Remover espacios alrededor de operadores
        .replace(/\s*([=+\-*/<>!&|,;:])\s*/g, '$1')
        // Restaurar espacios necesarios después de keywords
        .replace(/\b(var|let|const|function|return|if|else|for|while|new|typeof|instanceof)\b/g, '$1 ')
        // Remover líneas vacías
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
}

/**
 * Genera el footer del bundle
 */
function generateFooter() {
    return `

    // ==========================================================================
    // REGISTRO DE VERSION
    // ==========================================================================

    global.LUTHIER_LOADED = true;
    global.LUTHIER_VERSION = '${VERSION}';

    if (global.console && global.console.log) {
        global.addEventListener('DOMContentLoaded', function() {
            console.log('%c🎸 Luthier v' + global.LUTHIER_VERSION + ' cargado', 'color: #3366cc; font-weight: bold;');
        });
    }

})(typeof window !== 'undefined' ? window : this);
`;
}

/**
 * Función principal
 */
function build() {
    console.log('🎸 Luthier Bundle Builder v' + VERSION);
    console.log('━'.repeat(50));

    let bundle = generateHeader();
    let includedCount = 0;

    for (const file of SOURCE_FILES) {
        process.stdout.write(`  📦 ${file}...`);
        const content = extractContent(file);

        if (content) {
            const componentName = path.basename(file, '.js');
            bundle += `
    // ==========================================================================
    // COMPONENTE: ${componentName}
    // ==========================================================================

${content}

`;
            console.log(' ✓');
            includedCount++;
        } else {
            console.log(' ✗');
        }
    }

    bundle += generateFooter();

    // Asegurar que existe el directorio dist
    const distDir = path.dirname(OUTPUT);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    // Escribir el bundle completo
    fs.writeFileSync(OUTPUT, bundle, 'utf8');
    const stats = fs.statSync(OUTPUT);
    const sizeKB = (stats.size / 1024).toFixed(1);

    // Escribir el bundle minificado
    const minified = minify(bundle);
    fs.writeFileSync(OUTPUT_MIN, minified, 'utf8');
    const statsMin = fs.statSync(OUTPUT_MIN);
    const sizeMinKB = (statsMin.size / 1024).toFixed(1);

    console.log('━'.repeat(50));
    console.log(`✅ Bundle generado:`);
    console.log(`   dist/luthier.bundle.js     ${sizeKB} KB (desarrollo)`);
    console.log(`   dist/luthier.bundle.min.js ${sizeMinKB} KB (producción)`);
    console.log(`   Componentes: ${includedCount}/${SOURCE_FILES.length}`);
}

// Ejecutar
build();
