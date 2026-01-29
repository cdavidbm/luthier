#!/usr/bin/env node
/**
 * Patch LuthierHeader to use _rutaBase for paths
 * This fixes logo and index.html links on subpages
 */

const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'dist', 'luthier.bundle.js');

console.log('Reading bundle from:', bundlePath);
let content = fs.readFileSync(bundlePath, 'utf8');

// Check if already patched
if (content.includes('var _rutaBase = _calcularRutaBase();')) {
    console.log('Bundle already patched, skipping.');
    process.exit(0);
}

// Patch 1: Add _rutaBase at the beginning of LuthierHeader.connectedCallback
const originalConnectedCallback = `class LuthierHeader extends HTMLElement {
        connectedCallback() {
            var config = global.LUTHIER_CONFIG || {};`;

const patchedConnectedCallback = `class LuthierHeader extends HTMLElement {
        connectedCallback() {
            var _rutaBase = _calcularRutaBase();
            var config = global.LUTHIER_CONFIG || {};`;

if (!content.includes(originalConnectedCallback)) {
    console.error('ERROR: Could not find LuthierHeader.connectedCallback pattern');
    process.exit(1);
}

content = content.replace(originalConnectedCallback, patchedConnectedCallback);
console.log('Patch 1 applied: Added _rutaBase variable');

// Patch 2: Fix index.html href
const originalIndexHref = `<a href="index.html" class="header__brand">`;
const patchedIndexHref = `<a href="' + _rutaBase + 'index.html" class="header__brand">`;

if (!content.includes(originalIndexHref)) {
    console.error('ERROR: Could not find index.html href pattern');
    process.exit(1);
}

content = content.replace(originalIndexHref, patchedIndexHref);
console.log('Patch 2 applied: Fixed index.html href');

// Patch 3: Fix logo src
const originalLogoSrc = `\' + (logo ? \'<img src="\' + logo + \'" alt="`;
const patchedLogoSrc = `\' + (logo ? \'<img src="\' + _rutaBase + logo + \'" alt="`;

if (!content.includes(originalLogoSrc)) {
    console.error('ERROR: Could not find logo src pattern');
    process.exit(1);
}

content = content.replace(originalLogoSrc, patchedLogoSrc);
console.log('Patch 3 applied: Fixed logo src');

// Patch 4: Fix logoSecundario src
const originalLogoSecSrc = `<img src="\' + logoSecundario + \'" alt="" class="header__logo-secundario-img">`;
const patchedLogoSecSrc = `<img src="\' + _rutaBase + logoSecundario + \'" alt="" class="header__logo-secundario-img">`;

if (content.includes(originalLogoSecSrc)) {
    content = content.replace(originalLogoSecSrc, patchedLogoSecSrc);
    console.log('Patch 4 applied: Fixed logoSecundario src');
} else {
    console.log('Patch 4 skipped: logoSecundario pattern not found (may be already patched)');
}

// Validate JavaScript syntax by parsing
try {
    new Function(content);
    console.log('Syntax validation: PASSED');
} catch (e) {
    console.error('SYNTAX ERROR:', e.message);
    console.error('Aborting patch to prevent corruption');
    process.exit(1);
}

// Write patched content
fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Bundle patched successfully!');
