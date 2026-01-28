/**
 * LuthierCollections - Cargador de colecciones de contenido
 *
 * Permite cargar multiples archivos Markdown de una carpeta y construir
 * un indice de coleccion. Compatible con protocolo file:///
 *
 * ESTRATEGIA PARA file:///:
 * Como los navegadores no pueden listar directorios localmente, el sistema
 * requiere un archivo de indice (index.json) que liste los archivos
 * de la coleccion.
 *
 * GENERACION DEL INDICE:
 * - Manualmente (para sitios pequenos)
 * - Script Node.js: node tools/generate-index.js content/posts
 * - Automaticamente por el CMS al publicar
 *
 * FORMATO DE index.json:
 * {
 *   "generated": "2026-02-03T10:00:00Z",
 *   "files": ["articulo1.md", "articulo2.md"],
 *   "meta": {
 *     "articulo1.md": { "title": "...", "date": "..." },
 *     "articulo2.md": { "title": "...", "date": "..." }
 *   }
 * }
 *
 * @example
 * LuthierCollections.cargar('content/posts', {
 *     ordenar: 'date',
 *     orden: 'desc',
 *     limite: 5
 * }, function(items, error) {
 *     if (error) { console.error(error); return; }
 *     window.POSTS = items;
 * });
 *
 * @version 1.0.0
 * @license MIT
 */
(function(global) {
    'use strict';

    var LuthierCollections = {

        /**
         * Cache de colecciones cargadas
         * @private
         */
        _cache: {},

        /**
         * Indica si el cache esta habilitado
         */
        cacheEnabled: true,

        /**
         * Carga una coleccion desde una carpeta
         * @param {string} carpeta - Ruta a la carpeta (ej: "content/posts")
         * @param {Object} opciones - Opciones de carga y procesamiento
         * @param {string} [opciones.ordenar] - Campo por el cual ordenar
         * @param {string} [opciones.orden='desc'] - Direccion: 'asc' o 'desc'
         * @param {number} [opciones.limite=0] - Limite de items (0 = sin limite)
         * @param {Object} [opciones.filtro] - Criterios de filtrado
         * @param {boolean} [opciones.cargarContenido=false] - Cargar contenido completo de cada MD
         * @param {Function} callback - function(items, error)
         */
        cargar: function(carpeta, opciones, callback) {
            var self = this;
            opciones = opciones || {};

            // Normalizar ruta (remover / final si existe)
            carpeta = carpeta.replace(/\/+$/, '');

            // Verificar cache
            var cacheKey = carpeta + JSON.stringify(opciones);
            if (this.cacheEnabled && this._cache[cacheKey]) {
                setTimeout(function() {
                    callback(self._cache[cacheKey], null);
                }, 0);
                return;
            }

            // Cargar index.json de la carpeta
            var indexUrl = carpeta + '/index.json';
            this._cargarJSON(indexUrl, function(indice, error) {
                if (error) {
                    callback([], {
                        message: 'No se pudo cargar el indice de la coleccion',
                        url: indexUrl,
                        detail: error
                    });
                    return;
                }

                // Validar estructura del indice
                if (!indice || !indice.files || !Array.isArray(indice.files)) {
                    callback([], {
                        message: 'Formato de indice invalido',
                        url: indexUrl
                    });
                    return;
                }

                // Si el indice tiene metadatos pre-cargados y no necesitamos contenido
                if (indice.meta && !opciones.cargarContenido) {
                    var items = self._construirItemsDesdeMetadata(carpeta, indice);
                    var procesados = self._procesarItems(items, opciones);

                    if (self.cacheEnabled) {
                        self._cache[cacheKey] = procesados;
                    }

                    callback(procesados, null);
                    return;
                }

                // Cargar archivos MD individualmente
                self._cargarArchivos(carpeta, indice.files, function(items) {
                    var procesados = self._procesarItems(items, opciones);

                    if (self.cacheEnabled) {
                        self._cache[cacheKey] = procesados;
                    }

                    callback(procesados, null);
                });
            });
        },

        /**
         * Construye items desde los metadatos del indice (sin cargar archivos MD)
         * @private
         */
        _construirItemsDesdeMetadata: function(carpeta, indice) {
            var items = [];
            var files = indice.files;
            var meta = indice.meta || {};

            for (var i = 0; i < files.length; i++) {
                var archivo = files[i];
                var metadatos = meta[archivo] || {};

                // Crear item con metadatos
                var item = {};
                for (var key in metadatos) {
                    if (metadatos.hasOwnProperty(key)) {
                        item[key] = metadatos[key];
                    }
                }

                // Agregar campos de sistema
                item._filename = archivo;
                item._path = carpeta + '/' + archivo;
                item._slug = archivo.replace(/\.md$/i, '');

                items.push(item);
            }

            return items;
        },

        /**
         * Carga multiples archivos MD
         * @private
         */
        _cargarArchivos: function(carpeta, archivos, callback) {
            var self = this;
            var items = [];
            var pendientes = archivos.length;

            if (pendientes === 0) {
                callback([]);
                return;
            }

            for (var i = 0; i < archivos.length; i++) {
                (function(archivo, indice) {
                    var url = carpeta + '/' + archivo;
                    self._cargarMD(url, function(item) {
                        if (item) {
                            item._filename = archivo;
                            item._path = url;
                            item._slug = archivo.replace(/\.md$/i, '');
                            item._index = indice; // Para mantener orden original
                            items.push(item);
                        }
                        pendientes--;
                        if (pendientes === 0) {
                            // Ordenar por indice original antes de procesar
                            items.sort(function(a, b) {
                                return a._index - b._index;
                            });
                            callback(items);
                        }
                    });
                })(archivos[i], i);
            }
        },

        /**
         * Carga un archivo MD y extrae su frontmatter
         * @private
         */
        _cargarMD: function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        // Verificar si LuthierFrontmatter esta disponible
                        if (global.LuthierFrontmatter) {
                            var parseado = global.LuthierFrontmatter.parse(xhr.responseText);
                            var item = parseado.frontmatter || {};
                            item._body = parseado.body;
                            item._raw = xhr.responseText;
                            callback(item);
                        } else {
                            // Sin parser, retornar contenido como body
                            callback({
                                _body: xhr.responseText,
                                _raw: xhr.responseText
                            });
                        }
                    } else {
                        callback(null);
                    }
                }
            };
            xhr.onerror = function() {
                callback(null);
            };
            xhr.send();
        },

        /**
         * Carga un archivo JSON
         * @private
         */
        _cargarJSON: function(url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        try {
                            var datos = JSON.parse(xhr.responseText);
                            callback(datos, null);
                        } catch (e) {
                            callback(null, 'Error al parsear JSON: ' + e.message);
                        }
                    } else {
                        callback(null, 'HTTP ' + xhr.status);
                    }
                }
            };
            xhr.onerror = function() {
                callback(null, 'Error de red');
            };
            xhr.send();
        },

        /**
         * Procesa items aplicando filtros, ordenamiento y limite
         * @private
         */
        _procesarItems: function(items, opciones) {
            var resultado = items.slice();

            // Filtrar (excluir borradores por defecto)
            if (opciones.filtro) {
                if (global.LuthierData && global.LuthierData.filtrar) {
                    resultado = global.LuthierData.filtrar(resultado, opciones.filtro);
                } else {
                    resultado = this._filtrarSimple(resultado, opciones.filtro);
                }
            }

            // Excluir borradores por defecto
            if (opciones.incluirBorradores !== true) {
                resultado = resultado.filter(function(item) {
                    return item.draft !== true && item.borrador !== true;
                });
            }

            // Ordenar
            if (opciones.ordenar) {
                if (global.LuthierData && global.LuthierData.ordenarPor) {
                    resultado = global.LuthierData.ordenarPor(
                        resultado,
                        opciones.ordenar,
                        opciones.orden || 'desc'
                    );
                } else {
                    resultado = this._ordenarSimple(resultado, opciones.ordenar, opciones.orden);
                }
            }

            // Limitar
            if (opciones.limite && opciones.limite > 0) {
                resultado = resultado.slice(0, opciones.limite);
            }

            return resultado;
        },

        /**
         * Filtrado simple sin LuthierData
         * @private
         */
        _filtrarSimple: function(items, criterios) {
            return items.filter(function(item) {
                for (var key in criterios) {
                    if (criterios.hasOwnProperty(key)) {
                        if (item[key] !== criterios[key]) {
                            return false;
                        }
                    }
                }
                return true;
            });
        },

        /**
         * Ordenamiento simple sin LuthierData
         * @private
         */
        _ordenarSimple: function(items, campo, orden) {
            var direccion = (orden === 'asc') ? 1 : -1;
            return items.slice().sort(function(a, b) {
                var valA = a[campo];
                var valB = b[campo];

                // Intentar comparar como fechas si parecen fechas
                if (typeof valA === 'string' && /^\d{4}-\d{2}-\d{2}/.test(valA)) {
                    valA = new Date(valA).getTime();
                    valB = new Date(valB).getTime();
                }

                if (valA < valB) return -1 * direccion;
                if (valA > valB) return 1 * direccion;
                return 0;
            });
        },

        /**
         * Limpia el cache de colecciones
         */
        limpiarCache: function() {
            this._cache = {};
        },

        /**
         * Obtiene una coleccion del cache (si existe)
         * @param {string} carpeta
         * @returns {Array|null}
         */
        obtenerDelCache: function(carpeta) {
            // Buscar en cache por carpeta (sin opciones)
            for (var key in this._cache) {
                if (key.indexOf(carpeta) === 0) {
                    return this._cache[key];
                }
            }
            return null;
        },

        /**
         * Carga un item individual por su slug
         * @param {string} carpeta - Carpeta de la coleccion
         * @param {string} slug - Slug del item (sin .md)
         * @param {Function} callback - function(item, error)
         */
        cargarItem: function(carpeta, slug, callback) {
            var url = carpeta + '/' + slug + '.md';
            this._cargarMD(url, function(item) {
                if (item) {
                    item._filename = slug + '.md';
                    item._path = url;
                    item._slug = slug;
                    callback(item, null);
                } else {
                    callback(null, {
                        message: 'No se pudo cargar el item',
                        url: url
                    });
                }
            });
        }
    };

    // Exportar globalmente
    global.LuthierCollections = LuthierCollections;

})(typeof window !== 'undefined' ? window : this);
