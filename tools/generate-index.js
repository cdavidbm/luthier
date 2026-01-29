#!/usr/bin/env node
/**
 * generate-index.js - Genera indices para colecciones de contenido
 *
 * Este script escanea carpetas con archivos Markdown y genera un archivo
 * index.json con la lista de archivos y sus metadatos (frontmatter).
 *
 * USO:
 *   node tools/generate-index.js [carpeta]
 *   node tools/generate-index.js content/posts
 *   node tools/generate-index.js                  # Escanea todas las carpetas en content/
 *
 * SALIDA:
 *   content/posts/index.json
 *   content/noticias/index.json
 *   etc.
 *
 * FORMATO DEL INDICE:
 *   {
 *     "generated": "2026-02-03T10:00:00Z",
 *     "generator": "luthier-generate-index",
 *     "version": "1.0.0",
 *     "count": 5,
 *     "files": ["articulo1.md", "articulo2.md", ...],
 *     "meta": {
 *       "articulo1.md": { "title": "...", "date": "...", ... },
 *       "articulo2.md": { "title": "...", "date": "...", ... }
 *     }
 *   }
 *
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');

// Configuracion
const VERSION = '1.0.0';
const ROOT = process.cwd();

/**
 * Valida y sanitiza una ruta para prevenir path traversal
 * @param {string} inputPath - Ruta a validar
 * @returns {string|null} Ruta segura o null si es invalida
 */
function sanitizePath(inputPath) {
    if (!inputPath || typeof inputPath !== 'string') {
        return null;
    }

    // Rechazar rutas con patrones peligrosos
    if (inputPath.includes('..') ||
        inputPath.includes('\0') ||
        path.isAbsolute(inputPath)) {
        console.error('  ✗ Ruta invalida (posible path traversal): ' + inputPath);
        return null;
    }

    // Normalizar y resolver la ruta
    const normalizedInput = path.normalize(inputPath);

    // Verificar que no contenga .. despues de normalizar
    if (normalizedInput.includes('..')) {
        console.error('  ✗ Ruta invalida despues de normalizar: ' + inputPath);
        return null;
    }

    // Construir ruta absoluta y verificar que este dentro de ROOT
    const absolutePath = path.join(ROOT, normalizedInput);
    const resolvedPath = path.resolve(absolutePath);
    const resolvedRoot = path.resolve(ROOT);

    if (!resolvedPath.startsWith(resolvedRoot + path.sep) && resolvedPath !== resolvedRoot) {
        console.error('  ✗ Ruta fuera del directorio del proyecto: ' + inputPath);
        return null;
    }

    return resolvedPath;
}

/**
 * Parser basico de frontmatter YAML
 * (Replica simplificada del parser del navegador)
 */
function parseYAMLFrontmatter(content) {
    if (!content || typeof content !== 'string') {
        return null;
    }

    const texto = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    if (!texto.startsWith('---')) {
        return null;
    }

    const cierreIndex = texto.indexOf('\n---', 3);
    if (cierreIndex === -1) {
        return null;
    }

    const yamlRaw = texto.substring(4, cierreIndex).trim();
    return parseYAML(yamlRaw);
}

/**
 * Parser YAML simple
 */
function parseYAML(yaml) {
    if (!yaml) return {};

    const resultado = {};
    const lineas = yaml.split('\n');
    let i = 0;

    while (i < lineas.length) {
        const linea = lineas[i];

        // Saltar lineas vacias o comentarios
        if (linea.trim() === '' || linea.trim().startsWith('#')) {
            i++;
            continue;
        }

        // Detectar key: value
        const match = linea.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
        if (match) {
            const key = match[1];
            let valorRaw = match[2].trim();

            // Array inline [a, b, c]
            if (valorRaw.startsWith('[') && valorRaw.endsWith(']')) {
                resultado[key] = parseArrayInline(valorRaw);
                i++;
                continue;
            }

            // Array multilinea
            if (valorRaw === '' && i + 1 < lineas.length && lineas[i + 1].trim().startsWith('-')) {
                const arrayItems = [];
                i++;
                while (i < lineas.length && lineas[i].trim().startsWith('-')) {
                    const item = lineas[i].trim().substring(1).trim();
                    arrayItems.push(parseValor(item));
                    i++;
                }
                resultado[key] = arrayItems;
                continue;
            }

            // Valor simple
            resultado[key] = parseValor(valorRaw);
            i++;
            continue;
        }

        i++;
    }

    return resultado;
}

/**
 * Parsea array inline [a, b, c]
 */
function parseArrayInline(str) {
    const contenido = str.substring(1, str.length - 1).trim();
    if (contenido === '') return [];

    const items = [];
    let buffer = '';
    let enComillas = false;
    let tipoComilla = '';

    for (let i = 0; i < contenido.length; i++) {
        const char = contenido[i];

        if ((char === '"' || char === "'") && !enComillas) {
            enComillas = true;
            tipoComilla = char;
            continue;
        }
        if (char === tipoComilla && enComillas) {
            enComillas = false;
            continue;
        }

        if (char === ',' && !enComillas) {
            items.push(parseValor(buffer.trim()));
            buffer = '';
            continue;
        }

        buffer += char;
    }

    if (buffer.trim() !== '') {
        items.push(parseValor(buffer.trim()));
    }

    return items;
}

/**
 * Parsea un valor individual
 */
function parseValor(valor) {
    if (valor === '' || valor === '~' || valor === 'null') return null;
    if (valor === 'true' || valor === 'yes') return true;
    if (valor === 'false' || valor === 'no') return false;
    if (/^-?\d+$/.test(valor)) return parseInt(valor, 10);
    if (/^-?\d+\.\d+$/.test(valor)) return parseFloat(valor);

    // Remover comillas
    if ((valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))) {
        return valor.substring(1, valor.length - 1);
    }

    return valor;
}

/**
 * Genera el indice para una carpeta
 * @param {string} carpetaRelativa - Ruta relativa de la carpeta
 */
function generateIndex(carpetaRelativa) {
    // Sanitizar y validar la ruta
    const carpetaAbs = sanitizePath(carpetaRelativa);
    if (!carpetaAbs) {
        return false;
    }

    if (!fs.existsSync(carpetaAbs)) {
        console.error('  ✗ Carpeta no existe: ' + carpetaRelativa);
        return false;
    }

    // Verificar que es un directorio
    if (!fs.statSync(carpetaAbs).isDirectory()) {
        console.error('  ✗ No es un directorio: ' + carpetaRelativa);
        return false;
    }

    // Obtener archivos .md (excluyendo los que empiezan con _)
    // Solo nombres de archivo, sin rutas
    const archivos = fs.readdirSync(carpetaAbs)
        .filter(f => {
            // Validar que es un nombre de archivo simple (sin rutas)
            if (f.includes('/') || f.includes('\\') || f.includes('..')) {
                return false;
            }
            return f.endsWith('.md') && !f.startsWith('_');
        })
        .sort();

    if (archivos.length === 0) {
        console.log('  ⚠ Sin archivos .md en: ' + carpetaRelativa);
        return false;
    }

    // Extraer metadatos de cada archivo
    const meta = {};
    for (const archivo of archivos) {
        // El archivo ya esta validado como nombre simple sin path
        const filePath = path.join(carpetaAbs, archivo);

        // Verificar que sigue dentro de la carpeta
        const resolvedFile = path.resolve(filePath);
        if (!resolvedFile.startsWith(carpetaAbs)) {
            console.warn('  ⚠ Archivo fuera de carpeta, omitiendo: ' + archivo);
            continue;
        }

        const content = fs.readFileSync(resolvedFile, 'utf8');
        const frontmatter = parseYAMLFrontmatter(content);

        if (frontmatter) {
            // Excluir campos internos o muy largos
            const metaLimpio = {};
            for (const key in frontmatter) {
                if (frontmatter.hasOwnProperty(key)) {
                    const valor = frontmatter[key];
                    // No incluir contenido largo o campos privados
                    if (key !== 'body' && key !== '_body' && !key.startsWith('_')) {
                        if (typeof valor === 'string' && valor.length > 500) {
                            metaLimpio[key] = valor.substring(0, 500) + '...';
                        } else {
                            metaLimpio[key] = valor;
                        }
                    }
                }
            }
            meta[archivo] = metaLimpio;
        } else {
            // Sin frontmatter, solo registrar el archivo
            meta[archivo] = {};
        }
    }

    // Construir indice
    const index = {
        generated: new Date().toISOString(),
        generator: 'luthier-generate-index',
        version: VERSION,
        count: archivos.length,
        files: archivos,
        meta: meta
    };

    // Escribir index.json (dentro de la carpeta ya validada)
    const indexPath = path.join(carpetaAbs, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

    console.log('  ✓ ' + carpetaRelativa + '/index.json (' + archivos.length + ' archivos)');
    return true;
}

/**
 * Escanea todas las subcarpetas de content/
 */
function scanContentFolder() {
    const contentPath = sanitizePath('content');

    if (!contentPath || !fs.existsSync(contentPath)) {
        console.error('✗ No existe carpeta content/');
        console.log('  Crea la carpeta content/ con subcarpetas para tus colecciones');
        console.log('  Ejemplo: content/posts/, content/noticias/');
        return;
    }

    // Obtener subcarpetas (solo nombres simples)
    const subcarpetas = fs.readdirSync(contentPath)
        .filter(f => {
            // Validar nombre simple sin path traversal
            if (f.includes('/') || f.includes('\\') || f.includes('..') || f.startsWith('.')) {
                return false;
            }
            const fullPath = path.join(contentPath, f);
            return fs.statSync(fullPath).isDirectory();
        });

    if (subcarpetas.length === 0) {
        console.log('⚠ No hay subcarpetas en content/');
        return;
    }

    console.log('Generando indices para ' + subcarpetas.length + ' colecciones:\n');

    let exitosos = 0;
    for (const sub of subcarpetas) {
        // Construir ruta relativa segura
        const rutaRelativa = 'content/' + sub;
        if (generateIndex(rutaRelativa)) {
            exitosos++;
        }
    }

    console.log('\n✓ ' + exitosos + '/' + subcarpetas.length + ' indices generados');
}

/**
 * Funcion principal
 */
function main() {
    console.log('🎸 Luthier - Generador de Indices v' + VERSION);
    console.log('━'.repeat(50) + '\n');

    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Sin argumentos: escanear content/
        scanContentFolder();
    } else if (args[0] === '--help' || args[0] === '-h') {
        console.log('USO:');
        console.log('  node tools/generate-index.js              # Escanea content/');
        console.log('  node tools/generate-index.js [carpeta]    # Genera indice para carpeta');
        console.log('');
        console.log('EJEMPLOS:');
        console.log('  node tools/generate-index.js content/posts');
        console.log('  node tools/generate-index.js content/noticias');
        console.log('');
        console.log('SEGURIDAD:');
        console.log('  - Solo se permiten rutas relativas dentro del proyecto');
        console.log('  - Las rutas con ".." o absolutas son rechazadas');
    } else {
        // Con argumento: generar para carpeta especifica
        const carpeta = args[0];
        console.log('Generando indice para: ' + carpeta + '\n');
        generateIndex(carpeta);
    }
}

// Ejecutar
main();
