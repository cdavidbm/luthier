/**
 * LuthierData - Utilidades para manipulacion de datos
 *
 * Funciones helper para agrupar, ordenar, filtrar y paginar
 * colecciones de datos. Utiles para componentes como LuthierLoop.
 *
 * @example
 * var agrupados = LuthierData.agruparPor(articulos, 'categoria');
 * var ordenados = LuthierData.ordenarPor(articulos, 'fecha', 'desc');
 * var filtrados = LuthierData.filtrar(articulos, { categoria: 'noticias' });
 * var pagina = LuthierData.paginar(articulos, 2, 10);
 */
(function(global) {
    'use strict';

    var LuthierData = {

        /**
         * Agrupa items por un campo
         * @param {Array} items - Array de objetos
         * @param {string} key - Campo por el que agrupar
         * @returns {Object} Objeto con grupos
         */
        agruparPor: function(items, key) {
            if (!Array.isArray(items)) return {};

            var grupos = {};

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var valor = item[key];

                if (valor === undefined || valor === null) {
                    valor = 'sin_categoria';
                }

                if (!grupos[valor]) {
                    grupos[valor] = [];
                }

                grupos[valor].push(item);
            }

            return grupos;
        },

        /**
         * Ordena items por un campo
         * @param {Array} items - Array de objetos
         * @param {string} key - Campo por el que ordenar
         * @param {string} orden - 'asc' o 'desc' (default: 'asc')
         * @returns {Array} Array ordenado (nueva copia)
         */
        ordenarPor: function(items, key, orden) {
            if (!Array.isArray(items)) return [];

            orden = orden || 'asc';
            var copia = items.slice();

            copia.sort(function(a, b) {
                var valorA = a[key];
                var valorB = b[key];

                // Manejar undefined/null
                if (valorA === undefined || valorA === null) valorA = '';
                if (valorB === undefined || valorB === null) valorB = '';

                // Intentar comparar como fechas si el campo parece fecha
                if (key === 'fecha' || key === 'date' || key === 'createdAt' || key === 'updatedAt') {
                    valorA = new Date(valorA).getTime() || 0;
                    valorB = new Date(valorB).getTime() || 0;
                }
                // Comparar como numeros si ambos son numericos
                else if (typeof valorA === 'number' && typeof valorB === 'number') {
                    // Ya son numeros
                }
                // Comparar como strings
                else {
                    valorA = String(valorA).toLowerCase();
                    valorB = String(valorB).toLowerCase();
                }

                var resultado = 0;
                if (valorA < valorB) resultado = -1;
                if (valorA > valorB) resultado = 1;

                return orden === 'desc' ? -resultado : resultado;
            });

            return copia;
        },

        /**
         * Filtra items por criterios
         * @param {Array} items - Array de objetos
         * @param {Object} criterios - Objeto con campo:valor
         * @returns {Array} Array filtrado
         */
        filtrar: function(items, criterios) {
            if (!Array.isArray(items)) return [];
            if (!criterios || typeof criterios !== 'object') return items.slice();

            return items.filter(function(item) {
                for (var key in criterios) {
                    if (criterios.hasOwnProperty(key)) {
                        var criterio = criterios[key];
                        var valor = item[key];

                        // Si el criterio es una funcion, usarla
                        if (typeof criterio === 'function') {
                            if (!criterio(valor, item)) return false;
                        }
                        // Si es un array, verificar inclusion
                        else if (Array.isArray(criterio)) {
                            if (criterio.indexOf(valor) === -1) return false;
                        }
                        // Comparacion directa
                        else {
                            if (valor !== criterio) return false;
                        }
                    }
                }
                return true;
            });
        },

        /**
         * Pagina items
         * @param {Array} items - Array de objetos
         * @param {number} pagina - Numero de pagina (1-based)
         * @param {number} porPagina - Items por pagina
         * @returns {Object} { items, pagina, porPagina, total, totalPaginas }
         */
        paginar: function(items, pagina, porPagina) {
            if (!Array.isArray(items)) {
                return {
                    items: [],
                    pagina: 1,
                    porPagina: porPagina || 10,
                    total: 0,
                    totalPaginas: 0
                };
            }

            pagina = Math.max(1, parseInt(pagina, 10) || 1);
            porPagina = Math.max(1, parseInt(porPagina, 10) || 10);

            var total = items.length;
            var totalPaginas = Math.ceil(total / porPagina);

            // Ajustar pagina si excede
            if (pagina > totalPaginas && totalPaginas > 0) {
                pagina = totalPaginas;
            }

            var inicio = (pagina - 1) * porPagina;
            var fin = inicio + porPagina;

            return {
                items: items.slice(inicio, fin),
                pagina: pagina,
                porPagina: porPagina,
                total: total,
                totalPaginas: totalPaginas,
                hayAnterior: pagina > 1,
                haySiguiente: pagina < totalPaginas
            };
        },

        /**
         * Obtiene valores unicos de un campo
         * @param {Array} items - Array de objetos
         * @param {string} key - Campo del que extraer valores
         * @returns {Array} Array de valores unicos
         */
        valoresUnicos: function(items, key) {
            if (!Array.isArray(items)) return [];

            var vistos = {};
            var unicos = [];

            for (var i = 0; i < items.length; i++) {
                var valor = items[i][key];
                if (valor !== undefined && valor !== null && !vistos[valor]) {
                    vistos[valor] = true;
                    unicos.push(valor);
                }
            }

            return unicos;
        },

        /**
         * Cuenta items por valor de un campo
         * @param {Array} items - Array de objetos
         * @param {string} key - Campo por el que contar
         * @returns {Object} Objeto con conteos
         */
        contarPor: function(items, key) {
            if (!Array.isArray(items)) return {};

            var conteos = {};

            for (var i = 0; i < items.length; i++) {
                var valor = items[i][key];
                if (valor === undefined || valor === null) {
                    valor = 'sin_valor';
                }
                conteos[valor] = (conteos[valor] || 0) + 1;
            }

            return conteos;
        },

        /**
         * Agrupa items por periodo de tiempo (año, mes, trimestre)
         * @param {Array} items - Array de objetos con campo de fecha
         * @param {string} campoFecha - Nombre del campo que contiene la fecha
         * @param {string} periodo - 'anio', 'mes', 'trimestre', 'semana' (default: 'anio')
         * @returns {Object} Objeto con grupos por periodo, ordenados descendentemente
         *
         * @example
         * var porAnio = LuthierData.agruparPorPeriodo(docs, 'fecha', 'anio');
         * // { '2024': [...], '2023': [...] }
         *
         * var porMes = LuthierData.agruparPorPeriodo(docs, 'fecha', 'mes');
         * // { '2024-01': [...], '2024-02': [...] }
         */
        agruparPorPeriodo: function(items, campoFecha, periodo) {
            if (!Array.isArray(items)) return {};

            periodo = periodo || 'anio';
            var grupos = {};
            var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var fechaStr = item[campoFecha];
                var clave = 'sin_fecha';

                if (fechaStr) {
                    var fecha = new Date(fechaStr);

                    if (!isNaN(fecha.getTime())) {
                        var anio = fecha.getFullYear();
                        var mes = fecha.getMonth(); // 0-11
                        var trimestre = Math.floor(mes / 3) + 1;

                        switch (periodo) {
                            case 'anio':
                                clave = String(anio);
                                break;
                            case 'mes':
                                clave = anio + '-' + String(mes + 1).padStart(2, '0');
                                break;
                            case 'mes_nombre':
                                clave = meses[mes] + ' ' + anio;
                                break;
                            case 'trimestre':
                                clave = anio + '-T' + trimestre;
                                break;
                            case 'semana':
                                var inicioAnio = new Date(anio, 0, 1);
                                var dias = Math.floor((fecha - inicioAnio) / (24 * 60 * 60 * 1000));
                                var semana = Math.ceil((dias + inicioAnio.getDay() + 1) / 7);
                                clave = anio + '-S' + String(semana).padStart(2, '0');
                                break;
                            default:
                                clave = String(anio);
                        }
                    }
                }

                if (!grupos[clave]) {
                    grupos[clave] = [];
                }
                grupos[clave].push(item);
            }

            // Ordenar claves descendentemente (mas reciente primero)
            var clavesOrdenadas = Object.keys(grupos).sort(function(a, b) {
                if (a === 'sin_fecha') return 1;
                if (b === 'sin_fecha') return -1;
                return b.localeCompare(a);
            });

            var resultado = {};
            for (var j = 0; j < clavesOrdenadas.length; j++) {
                resultado[clavesOrdenadas[j]] = grupos[clavesOrdenadas[j]];
            }

            return resultado;
        },

        /**
         * Obtiene etiqueta legible para un periodo
         * @param {string} clave - Clave del periodo (ej: '2024-01', '2024-T1')
         * @param {string} periodo - Tipo de periodo usado
         * @returns {string} Etiqueta legible
         *
         * @example
         * LuthierData.etiquetaPeriodo('2024-01', 'mes'); // "Enero 2024"
         * LuthierData.etiquetaPeriodo('2024-T2', 'trimestre'); // "2do Trimestre 2024"
         */
        etiquetaPeriodo: function(clave, periodo) {
            if (!clave || clave === 'sin_fecha') return 'Sin fecha';

            var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            var trimestres = ['1er', '2do', '3er', '4to'];

            switch (periodo) {
                case 'anio':
                    return clave;
                case 'mes':
                    var partesMes = clave.split('-');
                    if (partesMes.length === 2) {
                        var mesIdx = parseInt(partesMes[1], 10) - 1;
                        return meses[mesIdx] + ' ' + partesMes[0];
                    }
                    return clave;
                case 'mes_nombre':
                    return clave;
                case 'trimestre':
                    var partesTrim = clave.split('-T');
                    if (partesTrim.length === 2) {
                        var trimIdx = parseInt(partesTrim[1], 10) - 1;
                        return trimestres[trimIdx] + ' Trimestre ' + partesTrim[0];
                    }
                    return clave;
                case 'semana':
                    var partesSem = clave.split('-S');
                    if (partesSem.length === 2) {
                        return 'Semana ' + parseInt(partesSem[1], 10) + ' de ' + partesSem[0];
                    }
                    return clave;
                default:
                    return clave;
            }
        }
    };

    // Exponer globalmente
    global.LuthierData = LuthierData;

})(typeof window !== 'undefined' ? window : this);
