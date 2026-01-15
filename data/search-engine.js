/**
 * LuthierSearch - Motor de busqueda simple
 *
 * Funciones para buscar texto en colecciones de datos
 * con soporte para busqueda por relevancia.
 *
 * @example
 * var resultados = LuthierSearch.buscar(articulos, 'javascript', ['titulo', 'contenido']);
 * var conRelevancia = LuthierSearch.buscarConRelevancia(articulos, 'react', ['titulo', 'tags']);
 */
(function(global) {
    'use strict';

    var LuthierSearch = {

        /**
         * Normaliza texto para busqueda
         * - Convierte a minusculas
         * - Elimina acentos
         * - Elimina caracteres especiales
         * @param {string} texto - Texto a normalizar
         * @returns {string} Texto normalizado
         */
        normalizar: function(texto) {
            if (typeof texto !== 'string') return '';

            return texto
                .toLowerCase()
                // Eliminar acentos
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                // Eliminar caracteres especiales excepto espacios
                .replace(/[^\w\s]/g, ' ')
                // Colapsar espacios multiples
                .replace(/\s+/g, ' ')
                .trim();
        },

        /**
         * Busca termino en array de items
         * @param {Array} items - Array de objetos
         * @param {string} termino - Termino de busqueda
         * @param {Array} campos - Campos donde buscar
         * @returns {Array} Items que coinciden
         */
        buscar: function(items, termino, campos) {
            if (!Array.isArray(items)) return [];
            if (!termino || typeof termino !== 'string') return items.slice();
            if (!Array.isArray(campos) || campos.length === 0) {
                campos = ['titulo', 'nombre', 'descripcion', 'contenido'];
            }

            var terminoNorm = this.normalizar(termino);
            if (!terminoNorm) return items.slice();

            var self = this;
            var palabras = terminoNorm.split(' ').filter(Boolean);

            return items.filter(function(item) {
                // Concatenar todos los campos en un solo texto
                var textoItem = '';
                for (var i = 0; i < campos.length; i++) {
                    var valor = item[campos[i]];
                    if (typeof valor === 'string') {
                        textoItem += ' ' + valor;
                    } else if (Array.isArray(valor)) {
                        textoItem += ' ' + valor.join(' ');
                    }
                }

                textoItem = self.normalizar(textoItem);

                // Verificar que todas las palabras esten presentes
                for (var j = 0; j < palabras.length; j++) {
                    if (textoItem.indexOf(palabras[j]) === -1) {
                        return false;
                    }
                }

                return true;
            });
        },

        /**
         * Busca con puntuacion de relevancia
         * @param {Array} items - Array de objetos
         * @param {string} termino - Termino de busqueda
         * @param {Array} campos - Campos donde buscar (pueden tener pesos)
         * @param {Object} pesos - Objeto con peso por campo (default 1)
         * @returns {Array} Items ordenados por relevancia con propiedad _relevancia
         */
        buscarConRelevancia: function(items, termino, campos, pesos) {
            if (!Array.isArray(items)) return [];
            if (!termino || typeof termino !== 'string') return items.slice();
            if (!Array.isArray(campos) || campos.length === 0) {
                campos = ['titulo', 'nombre', 'descripcion'];
            }

            pesos = pesos || {};
            var self = this;
            var terminoNorm = this.normalizar(termino);
            if (!terminoNorm) return items.slice();

            var palabras = terminoNorm.split(' ').filter(Boolean);
            var resultados = [];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var puntuacion = 0;
                var coincidencias = 0;

                for (var j = 0; j < campos.length; j++) {
                    var campo = campos[j];
                    var peso = pesos[campo] || 1;
                    var valor = item[campo];
                    var textoNorm = '';

                    if (typeof valor === 'string') {
                        textoNorm = self.normalizar(valor);
                    } else if (Array.isArray(valor)) {
                        textoNorm = self.normalizar(valor.join(' '));
                    }

                    if (!textoNorm) continue;

                    // Calcular puntuacion por palabra
                    for (var k = 0; k < palabras.length; k++) {
                        var palabra = palabras[k];

                        if (textoNorm.indexOf(palabra) !== -1) {
                            coincidencias++;
                            puntuacion += peso;

                            // Bonus si la palabra esta al inicio
                            if (textoNorm.indexOf(palabra) === 0) {
                                puntuacion += peso * 0.5;
                            }

                            // Bonus si es coincidencia exacta de palabra
                            var regex = new RegExp('\\b' + palabra + '\\b');
                            if (regex.test(textoNorm)) {
                                puntuacion += peso * 0.3;
                            }
                        }
                    }
                }

                // Solo incluir si hay al menos una coincidencia
                if (coincidencias > 0) {
                    var itemConRelevancia = {};
                    for (var prop in item) {
                        if (item.hasOwnProperty(prop)) {
                            itemConRelevancia[prop] = item[prop];
                        }
                    }
                    itemConRelevancia._relevancia = puntuacion;
                    resultados.push(itemConRelevancia);
                }
            }

            // Ordenar por relevancia descendente
            resultados.sort(function(a, b) {
                return b._relevancia - a._relevancia;
            });

            return resultados;
        },

        /**
         * Resalta coincidencias en texto
         * @param {string} texto - Texto original
         * @param {string} termino - Termino a resaltar
         * @param {string} tag - Tag HTML para resaltar (default: 'mark')
         * @returns {string} Texto con coincidencias resaltadas
         */
        resaltar: function(texto, termino, tag) {
            if (typeof texto !== 'string' || !termino) return texto;

            tag = tag || 'mark';

            // Escapar HTML del texto fuente para prevenir XSS
            var textoSeguro = (typeof LuthierUtils !== 'undefined')
                ? LuthierUtils.escaparHTML(texto) : texto;

            var terminoNorm = this.normalizar(termino);
            var palabras = terminoNorm.split(' ').filter(Boolean);

            var resultado = textoSeguro;

            for (var i = 0; i < palabras.length; i++) {
                var palabra = palabras[i];
                var regex = new RegExp('(' + this._escaparRegex(palabra) + ')', 'gi');
                resultado = resultado.replace(regex, '<' + tag + '>$1</' + tag + '>');
            }

            return resultado;
        },

        /**
         * Escapa caracteres especiales de regex
         * @private
         */
        _escaparRegex: function(str) {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },

        /**
         * Genera sugerencias basadas en termino parcial
         * @param {Array} items - Array de objetos
         * @param {string} termino - Termino parcial
         * @param {string} campo - Campo de donde extraer sugerencias
         * @param {number} limite - Maximo de sugerencias (default: 5)
         * @returns {Array} Array de sugerencias
         */
        sugerir: function(items, termino, campo, limite) {
            if (!Array.isArray(items) || !termino || !campo) return [];

            limite = limite || 5;
            var terminoNorm = this.normalizar(termino);
            var self = this;
            var sugerencias = {};

            for (var i = 0; i < items.length; i++) {
                var valor = items[i][campo];
                if (typeof valor !== 'string') continue;

                var valorNorm = self.normalizar(valor);
                if (valorNorm.indexOf(terminoNorm) !== -1) {
                    sugerencias[valor] = (sugerencias[valor] || 0) + 1;
                }
            }

            // Convertir a array y ordenar por frecuencia
            var resultado = [];
            for (var key in sugerencias) {
                if (sugerencias.hasOwnProperty(key)) {
                    resultado.push({ texto: key, frecuencia: sugerencias[key] });
                }
            }

            resultado.sort(function(a, b) {
                return b.frecuencia - a.frecuencia;
            });

            return resultado.slice(0, limite).map(function(item) {
                return item.texto;
            });
        }
    };

    // Exponer globalmente
    global.LuthierSearch = LuthierSearch;

})(typeof window !== 'undefined' ? window : this);
