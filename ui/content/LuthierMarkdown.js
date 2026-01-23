/**
 * LuthierMarkdown - Renderizador de Markdown a HTML
 *
 * Componente que convierte Markdown a HTML en el navegador.
 * Soporta la sintaxis básica de Markdown y extracción de frontmatter YAML.
 *
 * SEGURIDAD: Este componente está diseñado para contenido controlado
 * por el desarrollador. NO debe usarse con entrada de usuarios no confiables.
 * El HTML se escapa antes de procesarse como Markdown.
 *
 * ATRIBUTOS:
 * - src : URL del archivo .md a cargar (opcional)
 * - extract-frontmatter : Si está presente, extrae metadatos YAML del frontmatter
 *
 * EVENTOS:
 * - luthier:markdown-rendered : Emitido cuando el markdown se ha renderizado
 * - luthier:markdown-loaded : Emitido cuando se carga un archivo con frontmatter
 *   (detail: { frontmatter: Object, body: string, src: string })
 *
 * API PUBLICA:
 * - getFrontmatter() : Retorna el frontmatter extraido o null
 * - cargar(url) : Carga un archivo markdown
 * - renderizar(markdown) : Renderiza un string markdown
 *
 * @example Markdown inline
 * <luthier-markdown>
 * # Título
 *
 * Este es un párrafo con **negrita** y *cursiva*.
 *
 * - Item 1
 * - Item 2
 * </luthier-markdown>
 *
 * @example Cargar desde archivo
 * <luthier-markdown src="posts/noticia.md"></luthier-markdown>
 *
 * @example Con extracción de frontmatter
 * <luthier-markdown src="posts/articulo.md" extract-frontmatter></luthier-markdown>
 * <script>
 *   document.querySelector('luthier-markdown').addEventListener('luthier:markdown-loaded', function(e) {
 *     console.log(e.detail.frontmatter); // { title: "...", date: "...", ... }
 *   });
 * </script>
 */
(function(global) {
    'use strict';

    class LuthierMarkdown extends HTMLElement {

        connectedCallback() {
            this._frontmatter = null;
            this._body = null;
            this._src = null;

            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            var src = this.getAttribute('src');

            if (src) {
                this._cargarArchivo(src);
            } else {
                var contenido = this._obtenerContenidoOriginal();
                this._renderizar(contenido);
            }
        }

        _obtenerContenidoOriginal() {
            var contenido = this.textContent || '';
            return this._limpiarIndentacion(contenido);
        }

        _limpiarIndentacion(texto) {
            var lineas = texto.split('\n');

            while (lineas.length > 0 && lineas[0].trim() === '') {
                lineas.shift();
            }
            while (lineas.length > 0 && lineas[lineas.length - 1].trim() === '') {
                lineas.pop();
            }

            if (lineas.length === 0) return '';

            var minIndent = Infinity;
            for (var i = 0; i < lineas.length; i++) {
                if (lineas[i].trim() !== '') {
                    var indent = lineas[i].match(/^(\s*)/)[1].length;
                    if (indent < minIndent) {
                        minIndent = indent;
                    }
                }
            }

            if (minIndent > 0 && minIndent !== Infinity) {
                for (var j = 0; j < lineas.length; j++) {
                    lineas[j] = lineas[j].substring(minIndent);
                }
            }

            return lineas.join('\n');
        }

        _cargarArchivo(url) {
            var self = this;
            this._src = url;

            // Mostrar estado de carga usando DOM seguro
            var loadingDiv = document.createElement('div');
            loadingDiv.className = 'markdown-loading';
            loadingDiv.textContent = 'Cargando...';
            this.textContent = '';
            this.appendChild(loadingDiv);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200 || xhr.status === 0) {
                        // Verificar si debe extraer frontmatter
                        var extractFrontmatter = self.hasAttribute('extract-frontmatter');

                        if (extractFrontmatter && global.LuthierFrontmatter) {
                            // Parsear frontmatter
                            var parseado = global.LuthierFrontmatter.parse(xhr.responseText);
                            self._frontmatter = parseado.frontmatter;
                            self._body = parseado.body;

                            // Emitir evento con datos completos
                            self.dispatchEvent(new CustomEvent('luthier:markdown-loaded', {
                                bubbles: true,
                                detail: {
                                    frontmatter: self._frontmatter,
                                    body: self._body,
                                    src: url,
                                    raw: parseado.raw
                                }
                            }));

                            // Renderizar solo el body (sin frontmatter)
                            self._renderizar(parseado.body);
                        } else {
                            // Comportamiento original: renderizar todo
                            self._renderizar(xhr.responseText);
                        }
                    } else {
                        self._mostrarError('Error al cargar: ' + url);
                    }
                }
            };
            xhr.onerror = function() {
                self._mostrarError('Error de red al cargar: ' + url);
            };
            xhr.send();
        }

        _mostrarError(mensaje) {
            var errorDiv = document.createElement('div');
            errorDiv.className = 'markdown-error';
            errorDiv.textContent = mensaje;
            this.textContent = '';
            this.appendChild(errorDiv);
        }

        _renderizar(markdown) {
            // Crear contenedor
            var container = document.createElement('div');
            container.className = 'markdown-content';

            // Convertir markdown a estructura DOM segura
            this._construirDOM(container, markdown);

            // Reemplazar contenido
            this.textContent = '';
            this.appendChild(container);
            this.classList.add('markdown-rendered');

            this.dispatchEvent(new CustomEvent('luthier:markdown-rendered', {
                bubbles: true
            }));
        }

        _construirDOM(container, md) {
            var lineas = md.split('\n');
            var i = 0;

            while (i < lineas.length) {
                var linea = lineas[i];

                // Bloque de código
                if (linea.trim().startsWith('```')) {
                    var lang = linea.trim().substring(3);
                    var codeLines = [];
                    i++;
                    while (i < lineas.length && !lineas[i].trim().startsWith('```')) {
                        codeLines.push(lineas[i]);
                        i++;
                    }
                    var pre = document.createElement('pre');
                    var code = document.createElement('code');
                    if (lang) {
                        code.className = 'language-' + this._sanitizarClase(lang);
                    }
                    code.textContent = codeLines.join('\n');
                    pre.appendChild(code);
                    container.appendChild(pre);
                    i++;
                    continue;
                }

                // Encabezados
                var headerMatch = linea.match(/^(#{1,6})\s+(.+)$/);
                if (headerMatch) {
                    var level = headerMatch[1].length;
                    var header = document.createElement('h' + level);
                    this._procesarInline(header, headerMatch[2]);
                    container.appendChild(header);
                    i++;
                    continue;
                }

                // Línea horizontal
                if (/^(-{3,}|_{3,}|\*{3,})$/.test(linea.trim())) {
                    container.appendChild(document.createElement('hr'));
                    i++;
                    continue;
                }

                // Blockquote
                if (linea.trim().startsWith('> ')) {
                    var blockquote = document.createElement('blockquote');
                    var quoteLines = [];
                    while (i < lineas.length && lineas[i].trim().startsWith('> ')) {
                        quoteLines.push(lineas[i].trim().substring(2));
                        i++;
                    }
                    var quoteP = document.createElement('p');
                    this._procesarInline(quoteP, quoteLines.join(' '));
                    blockquote.appendChild(quoteP);
                    container.appendChild(blockquote);
                    continue;
                }

                // Lista no ordenada
                if (/^[\*\-\+]\s+/.test(linea.trim())) {
                    var ul = document.createElement('ul');
                    while (i < lineas.length && /^[\*\-\+]\s+/.test(lineas[i].trim())) {
                        var li = document.createElement('li');
                        this._procesarInline(li, lineas[i].trim().substring(2));
                        ul.appendChild(li);
                        i++;
                    }
                    container.appendChild(ul);
                    continue;
                }

                // Lista ordenada
                if (/^\d+\.\s+/.test(linea.trim())) {
                    var ol = document.createElement('ol');
                    while (i < lineas.length && /^\d+\.\s+/.test(lineas[i].trim())) {
                        var liOrd = document.createElement('li');
                        var textoLi = lineas[i].trim().replace(/^\d+\.\s+/, '');
                        this._procesarInline(liOrd, textoLi);
                        ol.appendChild(liOrd);
                        i++;
                    }
                    container.appendChild(ol);
                    continue;
                }

                // Línea vacía
                if (linea.trim() === '') {
                    i++;
                    continue;
                }

                // Párrafo
                var parrafoLineas = [];
                while (i < lineas.length && lineas[i].trim() !== '' &&
                       !lineas[i].trim().startsWith('#') &&
                       !lineas[i].trim().startsWith('```') &&
                       !lineas[i].trim().startsWith('> ') &&
                       !/^[\*\-\+]\s+/.test(lineas[i].trim()) &&
                       !/^\d+\.\s+/.test(lineas[i].trim()) &&
                       !/^(-{3,}|_{3,}|\*{3,})$/.test(lineas[i].trim())) {
                    parrafoLineas.push(lineas[i]);
                    i++;
                }
                if (parrafoLineas.length > 0) {
                    var p = document.createElement('p');
                    this._procesarInline(p, parrafoLineas.join(' '));
                    container.appendChild(p);
                }
            }
        }

        _procesarInline(elemento, texto) {
            // Procesar formato inline de forma segura
            var fragmento = document.createDocumentFragment();
            var regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|!\[([^\]]*)\]\(([^)]+)\)|~~(.+?)~~)/g;
            var ultimoIndice = 0;
            var match;

            while ((match = regex.exec(texto)) !== null) {
                // Añadir texto antes del match
                if (match.index > ultimoIndice) {
                    fragmento.appendChild(document.createTextNode(texto.substring(ultimoIndice, match.index)));
                }

                if (match[2]) {
                    // ***texto*** - negrita cursiva
                    var strongEm = document.createElement('strong');
                    var em = document.createElement('em');
                    em.textContent = match[2];
                    strongEm.appendChild(em);
                    fragmento.appendChild(strongEm);
                } else if (match[3]) {
                    // **texto** - negrita
                    var strong = document.createElement('strong');
                    strong.textContent = match[3];
                    fragmento.appendChild(strong);
                } else if (match[4]) {
                    // *texto* - cursiva
                    var emSingle = document.createElement('em');
                    emSingle.textContent = match[4];
                    fragmento.appendChild(emSingle);
                } else if (match[5]) {
                    // `código`
                    var code = document.createElement('code');
                    code.textContent = match[5];
                    fragmento.appendChild(code);
                } else if (match[6] && match[7]) {
                    // [texto](url) - enlace
                    var a = document.createElement('a');
                    a.href = this._sanitizarURL(match[7]);
                    a.textContent = match[6];
                    if (a.href.startsWith('http')) {
                        a.setAttribute('rel', 'noopener noreferrer');
                    }
                    fragmento.appendChild(a);
                } else if (match[8] !== undefined && match[9]) {
                    // ![alt](src) - imagen
                    var img = document.createElement('img');
                    img.src = this._sanitizarURL(match[9]);
                    img.alt = match[8] || '';
                    img.setAttribute('loading', 'lazy');
                    fragmento.appendChild(img);
                } else if (match[10]) {
                    // ~~texto~~ - tachado
                    var del = document.createElement('del');
                    del.textContent = match[10];
                    fragmento.appendChild(del);
                }

                ultimoIndice = regex.lastIndex;
            }

            // Añadir texto restante
            if (ultimoIndice < texto.length) {
                fragmento.appendChild(document.createTextNode(texto.substring(ultimoIndice)));
            }

            elemento.appendChild(fragmento);
        }

        _sanitizarClase(clase) {
            // Solo permitir caracteres alfanuméricos y guiones
            return clase.replace(/[^a-zA-Z0-9-]/g, '');
        }

        _sanitizarURL(url) {
            return LuthierUtils.sanitizarURL(url);
        }

        // API pública

        /**
         * Carga un archivo markdown desde una URL
         * @param {string} url - URL del archivo .md
         */
        cargar(url) {
            this._cargarArchivo(url);
        }

        /**
         * Renderiza un string markdown directamente
         * @param {string} markdown - Contenido markdown
         */
        renderizar(markdown) {
            this._renderizar(markdown);
        }

        /**
         * Retorna el frontmatter extraido del archivo cargado
         * @returns {Object|null} Objeto con metadatos o null si no hay frontmatter
         */
        getFrontmatter() {
            return this._frontmatter;
        }

        /**
         * Retorna el body (contenido sin frontmatter) del archivo cargado
         * @returns {string|null} Contenido markdown sin frontmatter
         */
        getBody() {
            return this._body;
        }

        /**
         * Retorna la URL del archivo cargado
         * @returns {string|null} URL del archivo o null si no se ha cargado
         */
        getSrc() {
            return this._src;
        }
    }

    if (!customElements.get('luthier-markdown')) {
        customElements.define('luthier-markdown', LuthierMarkdown);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierMarkdown = LuthierMarkdown;

})(typeof window !== 'undefined' ? window : this);
