/**
 * LuthierToc - Tabla de contenidos automática
 *
 * Genera automáticamente una tabla de contenidos basada en los encabezados de la página.
 *
 * ATRIBUTOS:
 * - selector  : Selector CSS del contenedor a analizar (default: 'main')
 * - niveles   : Niveles de encabezados a incluir, separados por coma (default: 'h2,h3')
 * - titulo    : Título de la tabla de contenidos (default: 'Contenido')
 * - colapsable: Permite colapsar/expandir la tabla
 * - sticky    : Hace que la tabla sea sticky al hacer scroll
 *
 * @example Uso básico
 * <luthier-toc></luthier-toc>
 *
 * @example Con opciones
 * <luthier-toc selector=".articulo" niveles="h2,h3,h4" titulo="En esta página" colapsable sticky></luthier-toc>
 */
(function(global) {
    'use strict';

    class LuthierToc extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        disconnectedCallback() {
            this._removerEventos();
        }

        _init() {
            this._config = {
                selector: this.getAttribute('selector') || 'main',
                niveles: (this.getAttribute('niveles') || 'h2,h3').split(',').map(function(n) { return n.trim(); }),
                titulo: this.getAttribute('titulo') || 'Contenido',
                colapsable: this.hasAttribute('colapsable'),
                sticky: this.hasAttribute('sticky')
            };

            this._encabezados = this._buscarEncabezados();

            if (this._encabezados.length === 0) {
                this.style.display = 'none';
                return;
            }

            this._asignarIds();
            this._construirDOM();
            this._agregarEventos();
        }

        _buscarEncabezados() {
            var contenedor = document.querySelector(this._config.selector);
            if (!contenedor) {
                console.warn('LuthierToc: No se encontró el contenedor "' + this._config.selector + '"');
                return [];
            }

            var selectorNiveles = this._config.niveles.join(',');
            var elementos = contenedor.querySelectorAll(selectorNiveles);
            var encabezados = [];

            for (var i = 0; i < elementos.length; i++) {
                var el = elementos[i];
                encabezados.push({
                    elemento: el,
                    texto: el.textContent.trim(),
                    nivel: parseInt(el.tagName.charAt(1), 10),
                    id: el.id || ''
                });
            }

            return encabezados;
        }

        _asignarIds() {
            for (var i = 0; i < this._encabezados.length; i++) {
                var enc = this._encabezados[i];
                if (!enc.id) {
                    enc.id = this._generarId(enc.texto, i);
                    enc.elemento.id = enc.id;
                }
            }
        }

        _generarId(texto, indice) {
            var id = texto
                .toLowerCase()
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/ñ/g, 'n')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            return id || 'seccion-' + indice;
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('toc-wrapper');

            if (this._config.sticky) {
                this.classList.add('toc--sticky');
            }

            var nav = document.createElement('nav');
            nav.className = 'toc';
            nav.setAttribute('aria-label', 'Tabla de contenidos');

            // Header con título
            var header = document.createElement('div');
            header.className = 'toc__header';

            var titulo = document.createElement('span');
            titulo.className = 'toc__titulo';
            titulo.textContent = this._config.titulo;
            header.appendChild(titulo);

            if (this._config.colapsable) {
                var btnToggle = document.createElement('button');
                btnToggle.className = 'toc__toggle';
                btnToggle.setAttribute('aria-expanded', 'true');
                btnToggle.setAttribute('aria-label', 'Colapsar tabla de contenidos');
                btnToggle.textContent = '−';
                header.appendChild(btnToggle);
                this._btnToggle = btnToggle;
            }

            nav.appendChild(header);

            // Lista de enlaces
            var lista = document.createElement('ul');
            lista.className = 'toc__lista';

            var nivelBase = Math.min.apply(null, this._encabezados.map(function(e) { return e.nivel; }));

            for (var i = 0; i < this._encabezados.length; i++) {
                var enc = this._encabezados[i];
                var li = document.createElement('li');
                li.className = 'toc__item toc__item--nivel-' + (enc.nivel - nivelBase + 1);

                var enlace = document.createElement('a');
                enlace.href = '#' + enc.id;
                enlace.className = 'toc__enlace';
                enlace.textContent = enc.texto;

                li.appendChild(enlace);
                lista.appendChild(li);
            }

            nav.appendChild(lista);
            this._lista = lista;
            this.appendChild(nav);
        }

        _agregarEventos() {
            var self = this;

            // Toggle colapsable
            if (this._btnToggle) {
                this._btnToggle.addEventListener('click', function() {
                    var expandido = self._btnToggle.getAttribute('aria-expanded') === 'true';
                    self._btnToggle.setAttribute('aria-expanded', String(!expandido));
                    self._btnToggle.textContent = expandido ? '+' : '−';
                    self._lista.style.display = expandido ? 'none' : 'block';
                });
            }

            // Scroll spy
            this._scrollHandler = function() {
                self._actualizarActivo();
            };

            window.addEventListener('scroll', this._scrollHandler, { passive: true });
            this._actualizarActivo();
        }

        _removerEventos() {
            if (this._scrollHandler) {
                window.removeEventListener('scroll', this._scrollHandler);
            }
        }

        _actualizarActivo() {
            var scrollPos = window.scrollY + 100;
            var activo = null;

            for (var i = 0; i < this._encabezados.length; i++) {
                var enc = this._encabezados[i];
                if (enc.elemento.offsetTop <= scrollPos) {
                    activo = enc.id;
                }
            }

            var enlaces = this._lista.querySelectorAll('.toc__enlace');
            for (var j = 0; j < enlaces.length; j++) {
                var enlace = enlaces[j];
                if (enlace.getAttribute('href') === '#' + activo) {
                    enlace.classList.add('toc__enlace--activo');
                } else {
                    enlace.classList.remove('toc__enlace--activo');
                }
            }
        }
    }

    if (!customElements.get('luthier-toc')) {
        customElements.define('luthier-toc', LuthierToc);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierToc = LuthierToc;

})(typeof window !== 'undefined' ? window : this);
