const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'data/data-mapper.js'), 'utf8');

function createContext() {
    var ctx = { window: {} };
    vm.runInNewContext(src, ctx);
    return ctx.window.LuthierData;
}

var datos = [
    { titulo: 'C', categoria: 'noticias', fecha: '2024-03-01', valor: 30 },
    { titulo: 'A', categoria: 'eventos', fecha: '2024-01-15', valor: 10 },
    { titulo: 'B', categoria: 'noticias', fecha: '2024-02-20', valor: 20 }
];

describe('LuthierData.ordenarPor', function() {
    var data = createContext();

    it('ordena por string ascendente', function() {
        var result = data.ordenarPor(datos, 'titulo', 'asc');
        assert.equal(result[0].titulo, 'A');
        assert.equal(result[2].titulo, 'C');
    });

    it('ordena por string descendente', function() {
        var result = data.ordenarPor(datos, 'titulo', 'desc');
        assert.equal(result[0].titulo, 'C');
    });

    it('ordena por fecha descendente', function() {
        var result = data.ordenarPor(datos, 'fecha', 'desc');
        assert.equal(result[0].fecha, '2024-03-01');
    });

    it('retorna copia sin modificar original', function() {
        var result = data.ordenarPor(datos, 'titulo', 'asc');
        assert.notEqual(result, datos);
        assert.equal(datos[0].titulo, 'C');
    });

    it('retorna array vacio para input invalido', function() {
        assert.equal(data.ordenarPor(null, 'x').length, 0);
    });
});

describe('LuthierData.agruparPor', function() {
    var data = createContext();

    it('agrupa por categoria', function() {
        var result = data.agruparPor(datos, 'categoria');
        assert.equal(result.noticias.length, 2);
        assert.equal(result.eventos.length, 1);
    });

    it('usa sin_categoria para valores null', function() {
        var items = [{ nombre: 'X' }];
        var result = data.agruparPor(items, 'categoria');
        assert.ok(result.sin_categoria);
    });

    it('retorna objeto vacio para input invalido', function() {
        assert.equal(Object.keys(data.agruparPor(null, 'x')).length, 0);
    });
});

describe('LuthierData.filtrar', function() {
    var data = createContext();

    it('filtra por valor exacto', function() {
        var result = data.filtrar(datos, { categoria: 'noticias' });
        assert.equal(result.length, 2);
    });

    it('filtra por funcion', function() {
        var result = data.filtrar(datos, { valor: function(v) { return v > 15; } });
        assert.equal(result.length, 2);
    });

    it('filtra por array de valores', function() {
        var result = data.filtrar(datos, { categoria: ['noticias', 'eventos'] });
        assert.equal(result.length, 3);
    });

    it('retorna copia para criterios vacios', function() {
        var result = data.filtrar(datos, {});
        assert.equal(result.length, 3);
    });
});

describe('LuthierData.paginar', function() {
    var data = createContext();
    var items = [];
    for (var i = 0; i < 25; i++) items.push({ id: i });

    it('pagina correctamente', function() {
        var result = data.paginar(items, 2, 10);
        assert.equal(result.items.length, 10);
        assert.equal(result.items[0].id, 10);
        assert.equal(result.pagina, 2);
        assert.equal(result.totalPaginas, 3);
    });

    it('ultima pagina tiene items restantes', function() {
        var result = data.paginar(items, 3, 10);
        assert.equal(result.items.length, 5);
    });

    it('ajusta pagina si excede total', function() {
        var result = data.paginar(items, 99, 10);
        assert.equal(result.pagina, 3);
    });

    it('maneja input invalido', function() {
        var result = data.paginar(null, 1, 10);
        assert.equal(result.total, 0);
    });
});

describe('LuthierData.valoresUnicos', function() {
    var data = createContext();

    it('extrae valores unicos', function() {
        var result = data.valoresUnicos(datos, 'categoria');
        assert.equal(result.length, 2);
        assert.ok(result.includes('noticias'));
        assert.ok(result.includes('eventos'));
    });
});
