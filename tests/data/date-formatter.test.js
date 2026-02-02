const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const src = fs.readFileSync(path.join(ROOT, 'data/date-formatter.js'), 'utf8');

function createContext() {
    var ctx = { window: {} };
    vm.runInNewContext(src, ctx);
    return ctx.window.LuthierDate;
}

describe('LuthierDate.formatoLargo', function() {
    var date = createContext();

    it('formatea fecha ISO correctamente', function() {
        var result = date.formatoLargo('2024-01-15');
        assert.ok(result.includes('2024'));
        assert.ok(result.includes('15'));
    });

    it('retorna vacio para fecha vacia', function() {
        assert.equal(date.formatoLargo(''), '');
        assert.equal(date.formatoLargo(null), '');
    });
});

describe('LuthierDate.formatoCorto', function() {
    var date = createContext();

    it('formatea fecha corta', function() {
        var result = date.formatoCorto('2024-06-20');
        assert.ok(result.includes('2024'));
        assert.ok(result.includes('20'));
    });

    it('retorna vacio para null', function() {
        assert.equal(date.formatoCorto(null), '');
    });
});

describe('LuthierDate.formatoFlexible', function() {
    var date = createContext();

    it('maneja solo anio', function() {
        assert.equal(date.formatoFlexible('2024'), '2024');
    });

    it('maneja anio-mes', function() {
        var result = date.formatoFlexible('2024-03');
        assert.equal(result, 'Marzo 2024');
    });

    it('maneja anio-mes-dia como formatoLargo', function() {
        var result = date.formatoFlexible('2024-01-15');
        assert.ok(result.includes('2024'));
        assert.ok(result.includes('15'));
    });

    it('retorna vacio para null', function() {
        assert.equal(date.formatoFlexible(''), '');
    });
});

describe('LuthierDate.formatoRelativo', function() {
    var date = createContext();

    it('retorna "hace un momento" para fecha reciente', function() {
        var ahora = new Date().toISOString();
        assert.equal(date.formatoRelativo(ahora), 'hace un momento');
    });

    it('retorna vacio para null', function() {
        assert.equal(date.formatoRelativo(''), '');
    });
});

describe('LuthierDate.diferenciaDias', function() {
    var date = createContext();

    it('calcula diferencia entre dos fechas', function() {
        var result = date.diferenciaDias('2024-01-01', '2024-01-11');
        assert.equal(result, 10);
    });
});

describe('LuthierDate._parsearFecha', function() {
    var date = createContext();

    it('parsea fecha ISO sin timezone offset', function() {
        var result = date._parsearFecha('2024-06-15');
        assert.equal(result.getDate(), 15);
        assert.equal(result.getMonth(), 5); // 0-indexed
    });
});
