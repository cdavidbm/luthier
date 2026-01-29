#!/usr/bin/env node
/**
 * Luthier Site Validator - Script CLI para validar sitios Luthier
 *
 * NOTA DE SEGURIDAD: Este script se ejecuta localmente por el desarrollador
 * y opera unicamente sobre archivos en el directorio especificado.
 * Los warnings de path traversal son falsos positivos dado que:
 * 1. Es una herramienta CLI local, no un servidor web
 * 2. El usuario ejecuta el script intencionalmente
 * 3. Se implementan validaciones de directorio base
 *
 * USO:
 *   node validate-site.js [directorio] [opciones]
 *
 * OPCIONES:
 *   --config <archivo>  Archivo de configuracion (default: config/sitio.js)
 *   --fix               Genera archivo pages.js con paginas encontradas
 *   --json              Salida en formato JSON
 *   --quiet             Solo muestra errores
 */

var fs = require('fs');
var path = require('path');

// Colores para consola
var colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Configuracion
var config = {
    directorio: '.',
    archivoConfig: 'config/sitio.js',
    fix: false,
    json: false,
    quiet: false
};

// Parsear argumentos
var args = process.argv.slice(2);
for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--config' && args[i + 1]) {
        config.archivoConfig = args[++i];
    } else if (arg === '--fix') {
        config.fix = true;
    } else if (arg === '--json') {
        config.json = true;
    } else if (arg === '--quiet') {
        config.quiet = true;
    } else if (!arg.startsWith('-')) {
        config.directorio = arg;
    }
}

// Directorio base (resuelto una vez, usado para validacion)
var DIRECTORIO_BASE = path.resolve(config.directorio);

// Resultado
var resultado = {
    directorio: DIRECTORIO_BASE,
    timestamp: new Date().toISOString(),
    archivosHTML: [],
    menuItems: [],
    errores: [],
    advertencias: [],
    enlacesRotos: [],
    paginasHuerfanas: []
};

/**
 * Verifica que una ruta este dentro del directorio base
 */
function estaEnDirectorioBase(rutaAbsoluta) {
    var normalizada = path.normalize(rutaAbsoluta);
    return normalizada.startsWith(DIRECTORIO_BASE + path.sep) || normalizada === DIRECTORIO_BASE;
}

/**
 * Construye ruta segura dentro del directorio base
 */
function construirRutaSegura(partes) {
    // Filtrar componentes peligrosos
    var partesLimpias = partes.filter(function(p) {
        return p && p !== '..' && !p.startsWith('/') && !p.startsWith('\\');
    });

    var ruta = DIRECTORIO_BASE;
    for (var i = 0; i < partesLimpias.length; i++) {
        ruta = path.join(ruta, partesLimpias[i]);
    }

    // Verificar que sigue dentro del base
    if (!estaEnDirectorioBase(ruta)) {
        return null;
    }
    return ruta;
}

function log(mensaje, color) {
    if (config.quiet && color !== 'red') return;
    if (config.json) return;
    var c = colors[color] || '';
    console.log(c + mensaje + colors.reset);
}

/**
 * Busca archivos HTML
 */
function buscarArchivosHTML(directorio, lista, nivel) {
    lista = lista || [];
    nivel = nivel || 0;

    if (nivel > 10) return lista;
    if (!estaEnDirectorioBase(directorio)) return lista;

    try {
        var archivos = fs.readdirSync(directorio);

        for (var i = 0; i < archivos.length; i++) {
            var nombre = archivos[i];

            // Ignorar nombres peligrosos
            if (!nombre || nombre === '..' || nombre.includes('..')) continue;
            if (nombre === 'node_modules' || nombre === '.git' || nombre === 'dist') continue;

            var rutaCompleta = path.join(directorio, nombre);
            if (!estaEnDirectorioBase(rutaCompleta)) continue;

            try {
                var stat = fs.statSync(rutaCompleta);

                if (stat.isDirectory()) {
                    buscarArchivosHTML(rutaCompleta, lista, nivel + 1);
                } else if (nombre.endsWith('.html')) {
                    lista.push({
                        ruta: rutaCompleta,
                        slug: path.relative(DIRECTORIO_BASE, rutaCompleta).replace(/\\/g, '/'),
                        titulo: extraerTitulo(rutaCompleta)
                    });
                }
            } catch (e) { /* ignorar */ }
        }
    } catch (e) {
        resultado.errores.push({ tipo: 'error-lectura', mensaje: 'No se pudo leer: ' + directorio });
    }

    return lista;
}

function extraerTitulo(ruta) {
    if (!estaEnDirectorioBase(ruta)) return 'Sin titulo';
    try {
        var contenido = fs.readFileSync(ruta, 'utf8');
        var match = contenido.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match ? match[1].trim() : path.basename(ruta, '.html');
    } catch (e) {
        return path.basename(ruta, '.html');
    }
}

function cargarConfiguracion() {
    var rutaConfig = construirRutaSegura([config.archivoConfig]);

    if (!rutaConfig || !fs.existsSync(rutaConfig)) {
        resultado.advertencias.push({ tipo: 'sin-config', mensaje: 'No se encontro: ' + config.archivoConfig });
        return null;
    }

    try {
        var vm = require('vm');
        var contenido = fs.readFileSync(rutaConfig, 'utf8');
        var contexto = { window: { LUTHIER_CONFIG: null, LUTHIER_PAGES: null } };
        vm.runInNewContext(contenido, contexto);
        return { config: contexto.window.LUTHIER_CONFIG, pages: contexto.window.LUTHIER_PAGES };
    } catch (e) {
        resultado.errores.push({ tipo: 'error-config', mensaje: 'Error en config: ' + e.message });
        return null;
    }
}

function extraerMenuItems(menu, items) {
    items = items || [];
    if (!menu || !Array.isArray(menu)) return items;

    for (var i = 0; i < menu.length; i++) {
        var item = menu[i];
        if (item.slug && item.slug !== '#') {
            items.push({ nombre: item.nombre, slug: item.slug.replace(/^\//, ''), externo: !!item.externo });
        }
        if (item.submenu) extraerMenuItems(item.submenu, items);
    }
    return items;
}

function extraerEnlaces(ruta) {
    var enlaces = [];
    if (!estaEnDirectorioBase(ruta)) return enlaces;

    try {
        var contenido = fs.readFileSync(ruta, 'utf8');
        var regex = /href=["']([^"']+)["']/gi;
        var match;

        while ((match = regex.exec(contenido)) !== null) {
            var href = match[1];
            if (href.startsWith('http') || href.startsWith('#') ||
                href.startsWith('javascript:') || href.startsWith('mailto:') ||
                href.startsWith('tel:') || href.includes('..')) continue;
            enlaces.push(href);
        }
    } catch (e) { /* ignorar */ }
    return enlaces;
}

function validarEnlaces() {
    for (var i = 0; i < resultado.archivosHTML.length; i++) {
        var archivo = resultado.archivosHTML[i];
        var enlaces = extraerEnlaces(archivo.ruta);
        var dir = path.dirname(archivo.ruta);

        for (var j = 0; j < enlaces.length; j++) {
            var enlace = enlaces[j];
            var ruta;

            if (enlace.startsWith('/')) {
                ruta = construirRutaSegura([enlace.substring(1)]);
            } else {
                ruta = path.join(dir, enlace);
                if (!estaEnDirectorioBase(ruta)) continue;
            }

            if (!ruta) continue;
            ruta = ruta.split('?')[0].split('#')[0];

            if (!fs.existsSync(ruta)) {
                resultado.enlacesRotos.push({
                    archivo: archivo.slug,
                    enlace: enlace,
                    rutaEsperada: path.relative(DIRECTORIO_BASE, ruta)
                });
            }
        }
    }
}

function detectarHuerfanas() {
    var enlacesEnSitio = new Set();

    for (var i = 0; i < resultado.menuItems.length; i++) {
        enlacesEnSitio.add(resultado.menuItems[i].slug);
    }

    for (var j = 0; j < resultado.archivosHTML.length; j++) {
        var archivo = resultado.archivosHTML[j];
        var enlaces = extraerEnlaces(archivo.ruta);
        var dir = path.dirname(archivo.ruta);

        for (var k = 0; k < enlaces.length; k++) {
            var enlace = enlaces[k];
            var rutaRel;

            if (enlace.startsWith('/')) {
                rutaRel = enlace.substring(1);
            } else {
                var rutaAbs = path.join(dir, enlace);
                if (!estaEnDirectorioBase(rutaAbs)) continue;
                rutaRel = path.relative(DIRECTORIO_BASE, rutaAbs);
            }

            enlacesEnSitio.add(rutaRel.replace(/\\/g, '/').split('?')[0].split('#')[0]);
        }
    }

    for (var m = 0; m < resultado.archivosHTML.length; m++) {
        var arch = resultado.archivosHTML[m];
        if (arch.slug === 'index.html') continue;
        if (!enlacesEnSitio.has(arch.slug)) {
            resultado.paginasHuerfanas.push(arch);
        }
    }
}

function validarMenu() {
    var archivos = new Set();
    for (var i = 0; i < resultado.archivosHTML.length; i++) {
        archivos.add(resultado.archivosHTML[i].slug);
    }

    for (var j = 0; j < resultado.menuItems.length; j++) {
        var item = resultado.menuItems[j];
        if (item.externo) continue;
        if (!archivos.has(item.slug)) {
            resultado.errores.push({
                tipo: 'menu-sin-archivo',
                mensaje: 'Menu sin archivo: ' + item.nombre,
                slug: item.slug
            });
        }
    }
}

function generarPages() {
    var lineas = ['/**', ' * Registro de paginas - Generado automaticamente', ' */', 'window.LUTHIER_PAGES = ['];

    for (var i = 0; i < resultado.archivosHTML.length; i++) {
        var a = resultado.archivosHTML[i];
        var coma = i < resultado.archivosHTML.length - 1 ? ',' : '';
        lineas.push('    { slug: \'' + a.slug + '\', titulo: \'' + a.titulo.replace(/'/g, "\\'") + '\' }' + coma);
    }
    lineas.push('];');

    var ruta = construirRutaSegura(['config', 'pages.js']);
    if (!ruta) {
        resultado.errores.push({ tipo: 'error', mensaje: 'No se pudo crear pages.js' });
        return;
    }

    try {
        var dir = path.dirname(ruta);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(ruta, lineas.join('\n'), 'utf8');
        log('Generado: ' + ruta, 'green');
    } catch (e) {
        resultado.errores.push({ tipo: 'error', mensaje: 'Error escribiendo: ' + e.message });
    }
}

function imprimirReporte() {
    if (config.json) {
        console.log(JSON.stringify(resultado, null, 2));
        return;
    }

    console.log('');
    log('='.repeat(50), 'cyan');
    log('  LUTHIER SITE VALIDATOR', 'bold');
    log('='.repeat(50), 'cyan');
    log('Directorio: ' + DIRECTORIO_BASE, 'blue');
    log('HTML: ' + resultado.archivosHTML.length + ' | Menu: ' + resultado.menuItems.length);
    console.log('');

    if (resultado.errores.length > 0) {
        log('ERRORES (' + resultado.errores.length + '):', 'red');
        resultado.errores.forEach(function(e) { log('  - ' + e.mensaje + (e.slug ? ' [' + e.slug + ']' : ''), 'red'); });
        console.log('');
    }

    if (resultado.enlacesRotos.length > 0) {
        log('ENLACES ROTOS (' + resultado.enlacesRotos.length + '):', 'yellow');
        resultado.enlacesRotos.forEach(function(e) { log('  - ' + e.archivo + ': ' + e.enlace, 'yellow'); });
        console.log('');
    }

    if (resultado.paginasHuerfanas.length > 0) {
        log('HUERFANAS (' + resultado.paginasHuerfanas.length + '):', 'yellow');
        resultado.paginasHuerfanas.forEach(function(h) { log('  - ' + h.slug, 'yellow'); });
        console.log('');
    }

    var total = resultado.errores.length + resultado.enlacesRotos.length + resultado.paginasHuerfanas.length;
    log(total === 0 ? 'OK - Sin problemas' : total + ' problemas encontrados', total === 0 ? 'green' : 'red');
}

// === EJECUCION ===
log('Escaneando: ' + DIRECTORIO_BASE, 'blue');

resultado.archivosHTML = buscarArchivosHTML(DIRECTORIO_BASE);

var cfg = cargarConfiguracion();
if (cfg && cfg.config && cfg.config.menu) {
    resultado.menuItems = extraerMenuItems(cfg.config.menu);
}

validarMenu();
validarEnlaces();
detectarHuerfanas();

if (config.fix) generarPages();

imprimirReporte();
process.exit(resultado.errores.length > 0 ? 1 : 0);
