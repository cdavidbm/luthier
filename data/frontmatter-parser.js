/**
 * LuthierFrontmatter - Parser de frontmatter YAML
 *
 * Extrae metadatos YAML delimitados por --- de archivos Markdown.
 * Parser YAML minimo para casos de uso comunes (sin dependencias externas).
 *
 * LIMITACIONES INTENCIONALES:
 * - Solo soporta YAML simple (strings, numeros, booleanos, arrays, objetos de un nivel)
 * - No soporta YAML multilinea complejo, referencias (&, *), ni anchors
 * - Disenado para frontmatter tipico de blogs/CMS
 *
 * FORMATO ESPERADO:
 * ---
 * title: Mi Articulo
 * date: 2026-01-15
 * tags: [ciencia, tecnologia]
 * draft: false
 * ---
 * # Contenido Markdown aqui...
 *
 * @example
 * var resultado = LuthierFrontmatter.parse(contenidoMD);
 * console.log(resultado.frontmatter); // { title: "Mi Articulo", ... }
 * console.log(resultado.body);        // "# Contenido Markdown aqui..."
 *
 * @version 1.0.0
 * @license MIT
 */
(function(global) {
    'use strict';

    var LuthierFrontmatter = {

        /**
         * Extrae frontmatter y contenido de un string Markdown
         * @param {string} contenido - Contenido completo del archivo .md
         * @returns {Object} { frontmatter: Object|null, body: string, raw: string }
         */
        parse: function(contenido) {
            if (!contenido || typeof contenido !== 'string') {
                return {
                    frontmatter: null,
                    body: contenido || '',
                    raw: ''
                };
            }

            // Normalizar saltos de linea
            var texto = contenido.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // Detectar frontmatter delimitado por ---
            // Debe comenzar exactamente con --- en la primera linea
            if (!texto.startsWith('---')) {
                return {
                    frontmatter: null,
                    body: contenido,
                    raw: ''
                };
            }

            // Buscar el cierre del frontmatter
            var cierreIndex = texto.indexOf('\n---', 3);
            if (cierreIndex === -1) {
                // No hay cierre valido, retornar contenido sin frontmatter
                return {
                    frontmatter: null,
                    body: contenido,
                    raw: ''
                };
            }

            // Extraer YAML (sin los delimitadores)
            var yamlRaw = texto.substring(4, cierreIndex).trim();

            // Extraer body (despues del cierre ---)
            var body = texto.substring(cierreIndex + 4).trim();

            // Parsear YAML
            var frontmatter = this._parseYAML(yamlRaw);

            return {
                frontmatter: frontmatter,
                body: body,
                raw: yamlRaw
            };
        },

        /**
         * Parser YAML minimo para frontmatter
         * @param {string} yaml - String YAML sin delimitadores
         * @returns {Object} Objeto con propiedades parseadas
         */
        _parseYAML: function(yaml) {
            if (!yaml || typeof yaml !== 'string') {
                return {};
            }

            var resultado = {};
            var lineas = yaml.split('\n');
            var i = 0;
            var lineaActual;
            var match;

            while (i < lineas.length) {
                lineaActual = lineas[i];

                // Saltar lineas vacias o comentarios
                if (lineaActual.trim() === '' || lineaActual.trim().startsWith('#')) {
                    i++;
                    continue;
                }

                // Detectar key: value
                match = lineaActual.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
                if (match) {
                    var key = match[1];
                    var valorRaw = match[2].trim();

                    // Caso 1: Array inline [a, b, c]
                    if (valorRaw.startsWith('[') && valorRaw.endsWith(']')) {
                        resultado[key] = this._parseArrayInline(valorRaw);
                        i++;
                        continue;
                    }

                    // Caso 2: Array multilinea (siguiente linea empieza con -)
                    if (valorRaw === '' && i + 1 < lineas.length && lineas[i + 1].trim().startsWith('-')) {
                        var arrayItems = [];
                        i++;
                        while (i < lineas.length && lineas[i].trim().startsWith('-')) {
                            var item = lineas[i].trim().substring(1).trim();
                            arrayItems.push(this._parseValor(item));
                            i++;
                        }
                        resultado[key] = arrayItems;
                        continue;
                    }

                    // Caso 3: Objeto anidado (siguiente linea tiene mas indentacion)
                    if (valorRaw === '' && i + 1 < lineas.length) {
                        var nextLine = lineas[i + 1];
                        var currentIndent = this._getIndent(lineaActual);
                        var nextIndent = this._getIndent(nextLine);

                        if (nextIndent > currentIndent && !nextLine.trim().startsWith('-')) {
                            var objetoAnidado = {};
                            i++;
                            while (i < lineas.length) {
                                var lineaObj = lineas[i];
                                var indentObj = this._getIndent(lineaObj);

                                if (lineaObj.trim() === '' || lineaObj.trim().startsWith('#')) {
                                    i++;
                                    continue;
                                }

                                if (indentObj <= currentIndent) {
                                    break;
                                }

                                var matchObj = lineaObj.trim().match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
                                if (matchObj) {
                                    objetoAnidado[matchObj[1]] = this._parseValor(matchObj[2].trim());
                                }
                                i++;
                            }
                            resultado[key] = objetoAnidado;
                            continue;
                        }
                    }

                    // Caso 4: Valor simple
                    resultado[key] = this._parseValor(valorRaw);
                    i++;
                    continue;
                }

                // Linea no reconocida, saltar
                i++;
            }

            return resultado;
        },

        /**
         * Parsea un array inline [a, b, c]
         * @param {string} str - String del array con corchetes
         * @returns {Array}
         */
        _parseArrayInline: function(str) {
            // Remover corchetes
            var contenido = str.substring(1, str.length - 1).trim();

            if (contenido === '') {
                return [];
            }

            var items = [];
            var buffer = '';
            var enComillas = false;
            var tipoComilla = '';

            for (var i = 0; i < contenido.length; i++) {
                var char = contenido[i];

                // Manejar comillas
                if ((char === '"' || char === "'") && !enComillas) {
                    enComillas = true;
                    tipoComilla = char;
                    continue;
                }
                if (char === tipoComilla && enComillas) {
                    enComillas = false;
                    continue;
                }

                // Separador fuera de comillas
                if (char === ',' && !enComillas) {
                    items.push(this._parseValor(buffer.trim()));
                    buffer = '';
                    continue;
                }

                buffer += char;
            }

            // Ultimo item
            if (buffer.trim() !== '') {
                items.push(this._parseValor(buffer.trim()));
            }

            return items;
        },

        /**
         * Parsea un valor individual (string, numero, booleano, null)
         * @param {string} valor - Valor a parsear
         * @returns {*} Valor parseado
         */
        _parseValor: function(valor) {
            if (valor === '' || valor === '~' || valor === 'null' || valor === 'Null' || valor === 'NULL') {
                return null;
            }

            // Booleanos
            if (valor === 'true' || valor === 'True' || valor === 'TRUE' || valor === 'yes' || valor === 'Yes' || valor === 'YES') {
                return true;
            }
            if (valor === 'false' || valor === 'False' || valor === 'FALSE' || valor === 'no' || valor === 'No' || valor === 'NO') {
                return false;
            }

            // Numeros
            if (/^-?\d+$/.test(valor)) {
                return parseInt(valor, 10);
            }
            if (/^-?\d+\.\d+$/.test(valor)) {
                return parseFloat(valor);
            }

            // Remover comillas si las tiene
            if ((valor.startsWith('"') && valor.endsWith('"')) ||
                (valor.startsWith("'") && valor.endsWith("'"))) {
                return valor.substring(1, valor.length - 1);
            }

            // String simple
            return valor;
        },

        /**
         * Obtiene el nivel de indentacion de una linea
         * @param {string} linea
         * @returns {number}
         */
        _getIndent: function(linea) {
            var match = linea.match(/^(\s*)/);
            return match ? match[1].length : 0;
        },

        /**
         * Verifica si un string tiene frontmatter valido
         * @param {string} contenido
         * @returns {boolean}
         */
        hasFrontmatter: function(contenido) {
            if (!contenido || typeof contenido !== 'string') {
                return false;
            }
            var texto = contenido.replace(/\r\n/g, '\n');
            if (!texto.startsWith('---')) {
                return false;
            }
            return texto.indexOf('\n---', 3) !== -1;
        },

        /**
         * Serializa un objeto a YAML simple (para generacion de frontmatter)
         * @param {Object} obj - Objeto a serializar
         * @returns {string} String YAML con delimitadores ---
         */
        stringify: function(obj) {
            if (!obj || typeof obj !== 'object') {
                return '';
            }

            var lineas = ['---'];

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var valor = obj[key];
                    lineas.push(this._stringifyPar(key, valor));
                }
            }

            lineas.push('---');
            return lineas.join('\n');
        },

        /**
         * Serializa un par key-value a YAML
         * @param {string} key
         * @param {*} valor
         * @returns {string}
         */
        _stringifyPar: function(key, valor) {
            if (valor === null || valor === undefined) {
                return key + ': null';
            }

            if (typeof valor === 'boolean') {
                return key + ': ' + (valor ? 'true' : 'false');
            }

            if (typeof valor === 'number') {
                return key + ': ' + valor;
            }

            if (Array.isArray(valor)) {
                if (valor.length === 0) {
                    return key + ': []';
                }
                // Usar formato inline para arrays simples
                var itemsStr = valor.map(function(item) {
                    if (typeof item === 'string') {
                        // Escapar si tiene caracteres especiales
                        if (/[,\[\]{}:'"#]/.test(item)) {
                            return '"' + item.replace(/"/g, '\\"') + '"';
                        }
                        return item;
                    }
                    return String(item);
                }).join(', ');
                return key + ': [' + itemsStr + ']';
            }

            if (typeof valor === 'object') {
                var sublineas = [key + ':'];
                for (var subkey in valor) {
                    if (valor.hasOwnProperty(subkey)) {
                        sublineas.push('  ' + this._stringifyPar(subkey, valor[subkey]));
                    }
                }
                return sublineas.join('\n');
            }

            // String
            var str = String(valor);
            // Escapar si tiene caracteres especiales
            if (/[:\[\]{}#'"&*!|>%@`]/.test(str) || str.indexOf('\n') !== -1) {
                return key + ': "' + str.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
            }
            return key + ': ' + str;
        }
    };

    // Exportar globalmente
    global.LuthierFrontmatter = LuthierFrontmatter;

})(typeof window !== 'undefined' ? window : this);
