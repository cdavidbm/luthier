const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'data/frontmatter-parser.js'), 'utf8');

function createContext() {
    var ctx = { window: {} };
    vm.runInNewContext(src, ctx);
    return ctx.window.LuthierFrontmatter;
}

describe('LuthierFrontmatter.parse', function() {
    var fm = createContext();

    it('extrae frontmatter basico', function() {
        var input = '---\ntitle: Hola Mundo\ndate: 2024-01-15\n---\n# Contenido';
        var result = fm.parse(input);
        assert.equal(result.frontmatter.title, 'Hola Mundo');
        assert.equal(result.frontmatter.date, '2024-01-15');
        assert.equal(result.body, '# Contenido');
    });

    it('parsea booleanos', function() {
        var input = '---\ndraft: true\npublished: false\n---\nBody';
        var result = fm.parse(input);
        assert.equal(result.frontmatter.draft, true);
        assert.equal(result.frontmatter.published, false);
    });

    it('parsea numeros', function() {
        var input = '---\norden: 42\nprecio: 9.99\n---\nBody';
        var result = fm.parse(input);
        assert.equal(result.frontmatter.orden, 42);
        assert.equal(result.frontmatter.precio, 9.99);
    });

    it('parsea arrays inline', function() {
        var input = '---\ntags: [ciencia, tecnologia, web]\n---\nBody';
        var result = fm.parse(input);
        var tags = result.frontmatter.tags;
        assert.equal(tags.length, 3);
        assert.equal(tags[0], 'ciencia');
        assert.equal(tags[1], 'tecnologia');
        assert.equal(tags[2], 'web');
    });

    it('parsea arrays multilinea', function() {
        var input = '---\ntags:\n- ciencia\n- web\n---\nBody';
        var result = fm.parse(input);
        var tags = result.frontmatter.tags;
        assert.equal(tags.length, 2);
        assert.equal(tags[0], 'ciencia');
        assert.equal(tags[1], 'web');
    });

    it('parsea null/YAML null', function() {
        var input = '---\nvalor: null\notro: ~\n---\nBody';
        var result = fm.parse(input);
        assert.equal(result.frontmatter.valor, null);
        assert.equal(result.frontmatter.otro, null);
    });

    it('retorna null frontmatter si no hay delimitadores', function() {
        var result = fm.parse('Sin frontmatter aqui');
        assert.equal(result.frontmatter, null);
        assert.equal(result.body, 'Sin frontmatter aqui');
    });

    it('retorna null frontmatter si no cierra ---', function() {
        var result = fm.parse('---\ntitle: Test\nSin cierre');
        assert.equal(result.frontmatter, null);
    });

    it('maneja input vacio', function() {
        var result = fm.parse('');
        assert.equal(result.frontmatter, null);
        assert.equal(result.body, '');
    });

    it('maneja input null', function() {
        var result = fm.parse(null);
        assert.equal(result.frontmatter, null);
    });
});

describe('LuthierFrontmatter.hasFrontmatter', function() {
    var fm = createContext();

    it('detecta frontmatter valido', function() {
        assert.ok(fm.hasFrontmatter('---\ntitle: X\n---\nBody'));
    });

    it('rechaza sin delimitadores', function() {
        assert.ok(!fm.hasFrontmatter('Sin frontmatter'));
    });

    it('rechaza input vacio', function() {
        assert.ok(!fm.hasFrontmatter(''));
        assert.ok(!fm.hasFrontmatter(null));
    });
});

describe('LuthierFrontmatter.stringify', function() {
    var fm = createContext();

    it('serializa objeto basico', function() {
        var result = fm.stringify({ title: 'Test', draft: false });
        assert.ok(result.startsWith('---'));
        assert.ok(result.endsWith('---'));
        assert.ok(result.includes('title: Test'));
        assert.ok(result.includes('draft: false'));
    });

    it('serializa arrays', function() {
        var result = fm.stringify({ tags: ['a', 'b'] });
        assert.ok(result.includes('[a, b]'));
    });

    it('serializa null', function() {
        var result = fm.stringify({ valor: null });
        assert.ok(result.includes('valor: null'));
    });

    it('retorna vacio para input invalido', function() {
        assert.equal(fm.stringify(null), '');
    });
});
