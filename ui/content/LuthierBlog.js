/**
 * LuthierBlog - Lista de posts con paginación
 *
 * Componente para mostrar una lista de artículos de blog con paginación.
 *
 * ATRIBUTOS:
 * - por-pagina : Número de posts por página (default: 6)
 * - columnas   : Número de columnas en vista grid (default: 2)
 * - vista      : Tipo de vista: grid, lista (default: grid)
 * - ordenar    : Campo para ordenar: fecha, titulo (default: fecha)
 * - orden      : Dirección: asc, desc (default: desc)
 *
 * ESTRUCTURA REQUERIDA:
 * Los hijos deben tener data-titulo, data-fecha y opcionalmente otros atributos.
 *
 * @example Uso básico
 * <luthier-blog por-pagina="4">
 *     <article data-titulo="Mi primer post"
 *              data-fecha="2024-01-15"
 *              data-imagen="img/post1.jpg"
 *              data-resumen="Este es el resumen del post..."
 *              data-url="posts/mi-primer-post.html"
 *              data-categoria="Noticias">
 *     </article>
 *     <article data-titulo="Segundo post"
 *              data-fecha="2024-01-20"
 *              data-resumen="Otro resumen aquí..."
 *              data-url="posts/segundo-post.html">
 *     </article>
 * </luthier-blog>
 */
(function(global) {
    'use strict';

    class LuthierBlog extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                porPagina: parseInt(this.getAttribute('por-pagina'), 10) || 6,
                columnas: parseInt(this.getAttribute('columnas'), 10) || 2,
                vista: this.getAttribute('vista') || 'grid',
                ordenar: this.getAttribute('ordenar') || 'fecha',
                orden: this.getAttribute('orden') || 'desc'
            };

            this._posts = this._extraerPosts();
            this._paginaActual = 1;

            if (this._posts.length === 0) {
                console.warn('LuthierBlog: No se encontraron posts');
                return;
            }

            this._ordenarPosts();
            this._construirDOM();
        }

        _extraerPosts() {
            var posts = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                posts.push({
                    titulo: hijo.getAttribute('data-titulo') || 'Sin título',
                    fecha: hijo.getAttribute('data-fecha') || '',
                    imagen: hijo.getAttribute('data-imagen') || '',
                    resumen: hijo.getAttribute('data-resumen') || '',
                    url: hijo.getAttribute('data-url') || '#',
                    categoria: hijo.getAttribute('data-categoria') || '',
                    autor: hijo.getAttribute('data-autor') || ''
                });
            }

            return posts;
        }

        _ordenarPosts() {
            if (typeof LuthierData !== 'undefined') {
                this._posts = LuthierData.ordenarPor(this._posts, this._config.ordenar, this._config.orden);
            }
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('blog-wrapper');
            this.classList.add('blog--' + this._config.vista);

            var container = document.createElement('div');
            container.className = 'blog';

            // Grid de posts
            this._gridPosts = document.createElement('div');
            this._gridPosts.className = 'blog__grid';
            if (this._config.vista === 'grid') {
                this._gridPosts.style.display = 'grid';
                this._gridPosts.style.gridTemplateColumns = 'repeat(' + this._config.columnas + ', 1fr)';
                this._gridPosts.style.gap = '2rem';
            }
            container.appendChild(this._gridPosts);

            // Paginación
            this._paginacion = document.createElement('nav');
            this._paginacion.className = 'blog__paginacion';
            this._paginacion.setAttribute('aria-label', 'Paginación');
            container.appendChild(this._paginacion);

            this.appendChild(container);
            this._renderizarPagina();
        }

        _renderizarPagina() {
            var self = this;
            var inicio = (this._paginaActual - 1) * this._config.porPagina;
            var fin = inicio + this._config.porPagina;
            var postsEnPagina = this._posts.slice(inicio, fin);

            // Limpiar grid
            this._gridPosts.textContent = '';

            // Renderizar posts
            for (var i = 0; i < postsEnPagina.length; i++) {
                var postCard = this._crearPostCard(postsEnPagina[i]);
                this._gridPosts.appendChild(postCard);
            }

            // Renderizar paginación
            this._renderizarPaginacion();
        }

        _crearPostCard(post) {
            var article = document.createElement('article');
            article.className = 'blog__post';

            // Imagen
            if (post.imagen) {
                var imgContainer = document.createElement('div');
                imgContainer.className = 'blog__post-imagen';

                var enlaceImg = document.createElement('a');
                enlaceImg.href = post.url;

                var img = document.createElement('img');
                img.src = post.imagen;
                img.alt = post.titulo;
                img.setAttribute('loading', 'lazy');

                enlaceImg.appendChild(img);
                imgContainer.appendChild(enlaceImg);
                article.appendChild(imgContainer);
            }

            // Contenido
            var contenido = document.createElement('div');
            contenido.className = 'blog__post-contenido';

            // Categoría
            if (post.categoria) {
                var categoria = document.createElement('span');
                categoria.className = 'blog__post-categoria';
                categoria.textContent = post.categoria;
                contenido.appendChild(categoria);
            }

            // Título
            var titulo = document.createElement('h3');
            titulo.className = 'blog__post-titulo';

            var enlaceTitulo = document.createElement('a');
            enlaceTitulo.href = post.url;
            enlaceTitulo.textContent = post.titulo;

            titulo.appendChild(enlaceTitulo);
            contenido.appendChild(titulo);

            // Meta (fecha y autor)
            var meta = document.createElement('div');
            meta.className = 'blog__post-meta';

            if (post.fecha) {
                var fecha = document.createElement('time');
                fecha.className = 'blog__post-fecha';
                fecha.setAttribute('datetime', post.fecha);
                fecha.textContent = LuthierDate.formatoLargo(post.fecha);
                meta.appendChild(fecha);
            }

            if (post.autor) {
                var autor = document.createElement('span');
                autor.className = 'blog__post-autor';
                autor.textContent = post.autor;
                meta.appendChild(autor);
            }

            if (meta.childNodes.length > 0) {
                contenido.appendChild(meta);
            }

            // Resumen
            if (post.resumen) {
                var resumen = document.createElement('p');
                resumen.className = 'blog__post-resumen';
                resumen.textContent = post.resumen;
                contenido.appendChild(resumen);
            }

            // Leer más
            var leerMas = document.createElement('a');
            leerMas.href = post.url;
            leerMas.className = 'blog__post-leer-mas';
            leerMas.textContent = 'Leer más →';
            contenido.appendChild(leerMas);

            article.appendChild(contenido);
            return article;
        }

        _renderizarPaginacion() {
            var self = this;
            var totalPaginas = Math.ceil(this._posts.length / this._config.porPagina);

            this._paginacion.textContent = '';

            if (totalPaginas <= 1) return;

            // Anterior
            var btnAnterior = document.createElement('button');
            btnAnterior.className = 'blog__pag-btn';
            btnAnterior.textContent = '← Anterior';
            btnAnterior.disabled = this._paginaActual === 1;
            btnAnterior.addEventListener('click', function() {
                if (self._paginaActual > 1) {
                    self._paginaActual--;
                    self._renderizarPagina();
                }
            });
            this._paginacion.appendChild(btnAnterior);

            // Números
            var numeros = document.createElement('span');
            numeros.className = 'blog__pag-numeros';
            numeros.textContent = this._paginaActual + ' / ' + totalPaginas;
            this._paginacion.appendChild(numeros);

            // Siguiente
            var btnSiguiente = document.createElement('button');
            btnSiguiente.className = 'blog__pag-btn';
            btnSiguiente.textContent = 'Siguiente →';
            btnSiguiente.disabled = this._paginaActual === totalPaginas;
            btnSiguiente.addEventListener('click', function() {
                if (self._paginaActual < totalPaginas) {
                    self._paginaActual++;
                    self._renderizarPagina();
                }
            });
            this._paginacion.appendChild(btnSiguiente);
        }

        // API pública
        irAPagina(pagina) {
            var totalPaginas = Math.ceil(this._posts.length / this._config.porPagina);
            if (pagina >= 1 && pagina <= totalPaginas) {
                this._paginaActual = pagina;
                this._renderizarPagina();
            }
        }
    }

    if (!customElements.get('luthier-blog')) {
        customElements.define('luthier-blog', LuthierBlog);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierBlog = LuthierBlog;

})(typeof window !== 'undefined' ? window : this);
