const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'data/utils.js'), 'utf8');

function createContext() {
    var ctx = { window: {} };
    vm.runInNewContext(src, ctx);
    return ctx.window.LuthierUtils;
}

describe('LuthierUtils.escaparHTML', function() {
    var utils = createContext();

    it('escapa caracteres HTML basicos', function() {
        assert.equal(utils.escaparHTML('<script>alert("xss")</script>'),
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('escapa ampersand', function() {
        assert.equal(utils.escaparHTML('a & b'), 'a &amp; b');
    });

    it('escapa comillas simples', function() {
        assert.equal(utils.escaparHTML("it's"), 'it&#39;s');
    });

    it('retorna string vacio para null/undefined', function() {
        assert.equal(utils.escaparHTML(null), '');
        assert.equal(utils.escaparHTML(undefined), '');
    });

    it('convierte numeros a string', function() {
        assert.equal(utils.escaparHTML(42), '42');
    });

    it('maneja arrays', function() {
        var result = utils.escaparHTML(['<b>', 'ok']);
        assert.equal(result, '&lt;b&gt;, ok');
    });
});

describe('LuthierUtils.sanitizarURL', function() {
    var utils = createContext();

    it('bloquea javascript: URLs', function() {
        assert.equal(utils.sanitizarURL('javascript:alert(1)'), '#');
    });

    it('bloquea javascript: con mayusculas', function() {
        assert.equal(utils.sanitizarURL('JavaScript:alert(1)'), '#');
    });

    it('bloquea data:text/html', function() {
        assert.equal(utils.sanitizarURL('data:text/html,<script>alert(1)</script>'), '#');
    });

    it('permite URLs http normales', function() {
        assert.equal(utils.sanitizarURL('https://example.com'), 'https://example.com');
    });

    it('permite rutas relativas', function() {
        assert.equal(utils.sanitizarURL('docs/archivo.pdf'), 'docs/archivo.pdf');
    });

    it('retorna # para valores vacios', function() {
        assert.equal(utils.sanitizarURL(''), '#');
        assert.equal(utils.sanitizarURL(null), '#');
    });
});

describe('LuthierUtils.obtenerIconoDocumento', function() {
    var utils = createContext();

    it('retorna icono correcto para PDF', function() {
        var result = utils.obtenerIconoDocumento('pdf');
        assert.equal(result.clase, 'pdf');
    });

    it('retorna icono correcto para XLSX', function() {
        var result = utils.obtenerIconoDocumento('xlsx');
        assert.equal(result.clase, 'xlsx');
    });

    it('normaliza tipo a minusculas', function() {
        var result = utils.obtenerIconoDocumento('PDF');
        assert.equal(result.clase, 'pdf');
    });

    it('retorna default para tipo desconocido', function() {
        var result = utils.obtenerIconoDocumento('xyz');
        assert.equal(result.clase, 'default');
    });

    it('maneja tipo vacio', function() {
        var result = utils.obtenerIconoDocumento('');
        assert.equal(result.clase, 'default');
    });
});
