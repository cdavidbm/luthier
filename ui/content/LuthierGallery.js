/**
 * LuthierGallery - Galería de imágenes con lightbox
 *
 * Componente para mostrar una galería de imágenes con vista ampliada.
 *
 * ATRIBUTOS:
 * - columnas : Número de columnas (default: 3)
 * - gap      : Espacio entre imágenes en rem (default: 1)
 *
 * ESTRUCTURA REQUERIDA:
 * Los hijos deben ser elementos con data-src y opcionalmente data-alt, data-titulo.
 *
 * @example Uso básico
 * <luthier-gallery columnas="4">
 *     <div data-src="img/foto1.jpg" data-alt="Descripción 1"></div>
 *     <div data-src="img/foto2.jpg" data-alt="Descripción 2" data-titulo="Mi foto"></div>
 * </luthier-gallery>
 */
(function(global) {
    'use strict';

    class LuthierGallery extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        disconnectedCallback() {
            this._removerEventos();
        }

        _init() {
            this._config = {
                columnas: parseInt(this.getAttribute('columnas'), 10) || 3,
                gap: parseFloat(this.getAttribute('gap')) || 1
            };

            this._imagenes = this._extraerImagenes();
            this._indiceActual = 0;
            this._lightbox = null;

            if (this._imagenes.length === 0) {
                console.warn('LuthierGallery: No se encontraron imágenes');
                return;
            }

            this._construirDOM();
            this._agregarEventos();
        }

        _extraerImagenes() {
            var imagenes = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                var src = hijo.getAttribute('data-src');
                if (src) {
                    imagenes.push({
                        src: src,
                        alt: hijo.getAttribute('data-alt') || '',
                        titulo: hijo.getAttribute('data-titulo') || ''
                    });
                }
            }

            return imagenes;
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('gallery-wrapper');

            var grid = document.createElement('div');
            grid.className = 'gallery__grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(' + this._config.columnas + ', 1fr)';
            grid.style.gap = this._config.gap + 'rem';

            for (var i = 0; i < this._imagenes.length; i++) {
                var item = this._crearItem(this._imagenes[i], i);
                grid.appendChild(item);
            }

            this.appendChild(grid);
            this._crearLightbox();
        }

        _crearItem(imagen, indice) {
            var item = document.createElement('div');
            item.className = 'gallery__item';
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', imagen.alt || 'Imagen ' + (indice + 1));

            var img = document.createElement('img');
            img.src = imagen.src;
            img.alt = imagen.alt;
            img.setAttribute('loading', 'lazy');
            img.className = 'gallery__imagen';

            item.appendChild(img);

            var self = this;
            item.addEventListener('click', function() {
                self._abrirLightbox(indice);
            });
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    self._abrirLightbox(indice);
                }
            });

            return item;
        }

        _crearLightbox() {
            var lightbox = document.createElement('div');
            lightbox.className = 'gallery__lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Visor de imágenes');
            lightbox.style.display = 'none';

            // Overlay
            var overlay = document.createElement('div');
            overlay.className = 'gallery__lightbox-overlay';
            lightbox.appendChild(overlay);

            // Contenedor
            var contenedor = document.createElement('div');
            contenedor.className = 'gallery__lightbox-contenedor';

            // Botón cerrar
            var btnCerrar = document.createElement('button');
            btnCerrar.className = 'gallery__lightbox-cerrar';
            btnCerrar.setAttribute('aria-label', 'Cerrar');
            btnCerrar.textContent = '×';
            contenedor.appendChild(btnCerrar);

            // Imagen
            var img = document.createElement('img');
            img.className = 'gallery__lightbox-imagen';
            img.alt = '';
            contenedor.appendChild(img);

            // Título
            var titulo = document.createElement('div');
            titulo.className = 'gallery__lightbox-titulo';
            contenedor.appendChild(titulo);

            // Navegación
            var navPrev = document.createElement('button');
            navPrev.className = 'gallery__lightbox-nav gallery__lightbox-prev';
            navPrev.setAttribute('aria-label', 'Anterior');
            navPrev.textContent = '‹';
            contenedor.appendChild(navPrev);

            var navNext = document.createElement('button');
            navNext.className = 'gallery__lightbox-nav gallery__lightbox-next';
            navNext.setAttribute('aria-label', 'Siguiente');
            navNext.textContent = '›';
            contenedor.appendChild(navNext);

            // Contador
            var contador = document.createElement('div');
            contador.className = 'gallery__lightbox-contador';
            contenedor.appendChild(contador);

            lightbox.appendChild(contenedor);
            this.appendChild(lightbox);

            this._lightbox = {
                elemento: lightbox,
                imagen: img,
                titulo: titulo,
                contador: contador,
                btnCerrar: btnCerrar,
                navPrev: navPrev,
                navNext: navNext,
                overlay: overlay
            };
        }

        _agregarEventos() {
            var self = this;

            this._lightbox.btnCerrar.addEventListener('click', function() {
                self._cerrarLightbox();
            });

            this._lightbox.overlay.addEventListener('click', function() {
                self._cerrarLightbox();
            });

            this._lightbox.navPrev.addEventListener('click', function() {
                self._navegar(-1);
            });

            this._lightbox.navNext.addEventListener('click', function() {
                self._navegar(1);
            });

            this._keydownHandler = function(e) {
                if (self._lightbox.elemento.style.display === 'none') return;

                if (e.key === 'Escape') {
                    self._cerrarLightbox();
                } else if (e.key === 'ArrowLeft') {
                    self._navegar(-1);
                } else if (e.key === 'ArrowRight') {
                    self._navegar(1);
                }
            };

            document.addEventListener('keydown', this._keydownHandler);
        }

        _removerEventos() {
            if (this._keydownHandler) {
                document.removeEventListener('keydown', this._keydownHandler);
            }
        }

        _abrirLightbox(indice) {
            this._indiceActual = indice;
            this._actualizarLightbox();
            this._lightbox.elemento.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this._lightbox.btnCerrar.focus();
        }

        _cerrarLightbox() {
            this._lightbox.elemento.style.display = 'none';
            document.body.style.overflow = '';
        }

        _navegar(direccion) {
            this._indiceActual += direccion;
            if (this._indiceActual < 0) {
                this._indiceActual = this._imagenes.length - 1;
            } else if (this._indiceActual >= this._imagenes.length) {
                this._indiceActual = 0;
            }
            this._actualizarLightbox();
        }

        _actualizarLightbox() {
            var imagen = this._imagenes[this._indiceActual];
            this._lightbox.imagen.src = imagen.src;
            this._lightbox.imagen.alt = imagen.alt;
            this._lightbox.titulo.textContent = imagen.titulo || imagen.alt;
            this._lightbox.contador.textContent = (this._indiceActual + 1) + ' / ' + this._imagenes.length;
        }
    }

    if (!customElements.get('luthier-gallery')) {
        customElements.define('luthier-gallery', LuthierGallery);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierGallery = LuthierGallery;

})(typeof window !== 'undefined' ? window : this);
