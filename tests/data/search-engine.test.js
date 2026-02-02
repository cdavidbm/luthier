const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const utilsSrc = fs.readFileSync(path.join(ROOT, 'data/utils.js'), 'utf8');
const searchSrc = fs.readFileSync(path.join(ROOT, 'data/search-engine.js'), 'utf8');

function createContext() {
    var ctx = { window: {} };
    vm.runInNewContext(utilsSrc, ctx);
    ctx.LuthierUtils = ctx.window.LuthierUtils;
    vm.runInNewContext(searchSrc, ctx);
    return ctx.window.LuthierSearch;
}

var articulos = [
    { titulo: 'JavaScript moderno', contenido: 'Aprende ES6 y mas', tags: ['javascript', 'web'] },
    { titulo: 'React avanzado', contenido: 'Hooks y patrones', tags: ['react', 'javascript'] },
    { titulo: 'Python para datos', contenido: 'Pandas y NumPy', tags: ['python', 'data'] }
];

describe('LuthierSearch.normalizar', function() {
    var search = createContext();

    it('convierte a minusculas', function() {
        assert.equal(search.normalizar('HOLA'), 'hola');
    });

    it('elimina acentos', function() {
        assert.equal(search.normalizar('cafe'), 'cafe');
    });

    it('retorna vacio para no-string', function() {
        assert.equal(search.normalizar(null), '');
        assert.equal(search.normalizar(42), '');
    });

    it('colapsa espacios multiples', function() {
        assert.equal(search.normalizar('a   b'), 'a b');
    });
});

describe('LuthierSearch.buscar', function() {
    var search = createContext();

    it('encuentra por titulo', function() {
        var result = search.buscar(articulos, 'javascript', ['titulo']);
        assert.equal(result.length, 1);
        assert.equal(result[0].titulo, 'JavaScript moderno');
    });

    it('busca en multiples campos', function() {
        var result = search.buscar(articulos, 'javascript', ['titulo', 'tags']);
        assert.equal(result.length, 2);
    });

    it('retorna todos si termino esta vacio', function() {
        var result = search.buscar(articulos, '', ['titulo']);
        assert.equal(result.length, 3);
    });

    it('busca multiples palabras (AND)', function() {
        var result = search.buscar(articulos, 'python datos', ['titulo', 'contenido']);
        assert.equal(result.length, 1);
    });

    it('retorna array vacio para items invalidos', function() {
        assert.equal(search.buscar(null, 'test', ['titulo']).length, 0);
    });
});

describe('LuthierSearch.buscarConRelevancia', function() {
    var search = createContext();

    it('ordena por relevancia', function() {
        var result = search.buscarConRelevancia(articulos, 'javascript', ['titulo', 'tags']);
        assert.ok(result.length > 0);
        assert.ok(result[0]._relevancia >= result[result.length - 1]._relevancia);
    });

    it('asigna mayor peso a campos con mayor peso', function() {
        var result = search.buscarConRelevancia(
            articulos, 'javascript', ['titulo', 'tags'], { titulo: 3, tags: 1 }
        );
        assert.equal(result[0].titulo, 'JavaScript moderno');
    });

    it('no incluye items sin coincidencias', function() {
        var result = search.buscarConRelevancia(articulos, 'golang', ['titulo', 'tags']);
        assert.equal(result.length, 0);
    });
});

describe('LuthierSearch.resaltar', function() {
    var search = createContext();

    it('envuelve coincidencias con mark', function() {
        var result = search.resaltar('Hola mundo', 'mundo');
        assert.ok(result.includes('<mark>'));
        assert.ok(result.includes('mundo'));
    });

    it('usa tag personalizado', function() {
        var result = search.resaltar('Hola mundo', 'mundo', 'strong');
        assert.ok(result.includes('<strong>'));
    });

    it('escapa HTML del texto fuente', function() {
        var result = search.resaltar('Texto con <b>html</b>', 'texto');
        assert.ok(!result.includes('<b>'));
        assert.ok(result.includes('&lt;b&gt;'));
    });

    it('retorna texto original si termino es vacio', function() {
        assert.equal(search.resaltar('Hola', ''), 'Hola');
    });
});

describe('LuthierSearch.sugerir', function() {
    var search = createContext();

    it('genera sugerencias basadas en termino', function() {
        var result = search.sugerir(articulos, 'java', 'titulo');
        assert.ok(result.length > 0);
        assert.ok(result[0].includes('JavaScript'));
    });

    it('respeta limite', function() {
        var result = search.sugerir(articulos, 'a', 'titulo', 1);
        assert.ok(result.length <= 1);
    });

    it('retorna array vacio sin parametros', function() {
        assert.equal(search.sugerir([], '', 'titulo').length, 0);
    });
});
