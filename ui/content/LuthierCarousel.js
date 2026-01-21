/**
 * LuthierCarousel - Carrusel accesible para banners y contenido
 *
 * Componente de carrusel con:
 * - Navegacion por teclado completa
 * - Soporte ARIA para lectores de pantalla
 * - Autoplay con pausa al hover/focus
 * - Indicadores de posicion clickeables
 * - Controles de navegacion (anterior/siguiente)
 * - Soporte para touch/swipe en moviles
 *
 * ATRIBUTOS:
 * - autoplay    : Activa la reproduccion automatica
 * - intervalo   : Tiempo entre slides en ms (default: 5000)
 * - loop        : Vuelve al inicio al llegar al final (default: true)
 * - pausar-hover: Pausa autoplay al pasar el mouse (default: true)
 * - sin-controles: Oculta los botones anterior/siguiente
 * - sin-indicadores: Oculta los indicadores de posicion
 *
 * ESTRUCTURA REQUERIDA:
 * El componente espera elementos hijos como slides.
 *
 * @example Uso basico
 * <luthier-carousel>
 *     <div data-slide>
 *         <img src="banner1.jpg" alt="Banner 1">
 *         <div class="carousel-caption">
 *             <h2>Titulo del Banner</h2>
 *             <p>Descripcion...</p>
 *         </div>
 *     </div>
 *     <div data-slide>
 *         <img src="banner2.jpg" alt="Banner 2">
 *     </div>
 * </luthier-carousel>
 *
 * @example Con autoplay
 * <luthier-carousel autoplay intervalo="4000">
 *     <div data-slide>Slide 1</div>
 *     <div data-slide>Slide 2</div>
 *     <div data-slide>Slide 3</div>
 * </luthier-carousel>
 */
(function(global) {
    'use strict';

    class LuthierCarousel extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        disconnectedCallback() {
            this._detenerAutoplay();
        }

        _init() {
            this._config = {
                autoplay: this.hasAttribute('autoplay'),
                intervalo: parseInt(this.getAttribute('intervalo'), 10) || 5000,
                loop: !this.hasAttribute('sin-loop'),
                pausarHover: !this.hasAttribute('sin-pausar-hover'),
                mostrarControles: !this.hasAttribute('sin-controles'),
                mostrarIndicadores: !this.hasAttribute('sin-indicadores')
            };

            // Estado
            this._indiceActual = 0;
            this._autoplayId = null;
            this._pausado = false;
            this._touchStartX = 0;
            this._touchEndX = 0;

            // Obtener slides
            var slides = this._extraerSlides();

            if (slides.length === 0) {
                console.warn('LuthierCarousel: No se encontraron slides');
                return;
            }

            this._slides = slides;
            this._totalSlides = slides.length;
            this.classList.add('carousel-wrapper');
            this.innerHTML = this._render(slides);
            this._initEventos();

            // Mostrar primer slide
            this._irASlide(0, false);

            // Iniciar autoplay si esta habilitado
            if (this._config.autoplay) {
                this._iniciarAutoplay();
            }
        }

        _extraerSlides() {
            var slides = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                var contenido = hijo.outerHTML;
                var titulo = hijo.getAttribute('data-titulo') || '';
                var enlace = hijo.getAttribute('data-enlace') || '';

                slides.push({
                    contenido: hijo.innerHTML,
                    titulo: titulo,
                    enlace: enlace
                });
            }

            return slides;
        }

        _render(slides) {
            var carouselId = 'carousel-' + Math.random().toString(36).substr(2, 9);

            var html = '\
                <div class="carousel" \
                     role="region" \
                     aria-roledescription="carrusel" \
                     aria-label="Carrusel de contenido">\
                    <div class="carousel__anuncio sr-only" aria-live="polite" aria-atomic="true"></div>\
                    <div class="carousel__viewport">\
                        <div class="carousel__pista">\
            ';

            // Slides
            for (var i = 0; i < slides.length; i++) {
                var slide = slides[i];
                var slideId = carouselId + '-slide-' + i;

                html += '\
                    <div class="carousel__slide" \
                         id="' + slideId + '" \
                         role="group" \
                         aria-roledescription="slide" \
                         aria-label="' + (i + 1) + ' de ' + slides.length + '">\
                        <div class="carousel__slide-contenido">\
                            ' + slide.contenido + '\
                        </div>\
                    </div>\
                ';
            }

            html += '</div></div>';

            // Controles
            if (this._config.mostrarControles) {
                html += '\
                    <div class="carousel__controles">\
                        <button type="button" \
                                class="carousel__btn carousel__btn--anterior" \
                                aria-label="Slide anterior">\
                            <span aria-hidden="true">&#10094;</span>\
                        </button>\
                        <button type="button" \
                                class="carousel__btn carousel__btn--siguiente" \
                                aria-label="Slide siguiente">\
                            <span aria-hidden="true">&#10095;</span>\
                        </button>\
                    </div>\
                ';
            }

            // Indicadores
            if (this._config.mostrarIndicadores) {
                html += '<div class="carousel__indicadores" role="tablist" aria-label="Seleccionar slide">';

                for (var j = 0; j < slides.length; j++) {
                    html += '\
                        <button type="button" \
                                class="carousel__indicador" \
                                role="tab" \
                                aria-selected="' + (j === 0 ? 'true' : 'false') + '" \
                                aria-label="Ir a slide ' + (j + 1) + '" \
                                data-indice="' + j + '">\
                        </button>\
                    ';
                }

                html += '</div>';
            }

            // Boton de pausa (si hay autoplay)
            if (this._config.autoplay) {
                html += '\
                    <button type="button" \
                            class="carousel__pausar" \
                            aria-label="Pausar carrusel">\
                        <span class="carousel__pausar-icono" aria-hidden="true">&#10074;&#10074;</span>\
                    </button>\
                ';
            }

            html += '</div>';

            return html;
        }

        _initEventos() {
            var self = this;

            // Controles anterior/siguiente
            var btnAnterior = this.querySelector('.carousel__btn--anterior');
            var btnSiguiente = this.querySelector('.carousel__btn--siguiente');

            if (btnAnterior) {
                btnAnterior.addEventListener('click', function() {
                    self.anterior();
                });
            }

            if (btnSiguiente) {
                btnSiguiente.addEventListener('click', function() {
                    self.siguiente();
                });
            }

            // Indicadores
            var indicadores = this.querySelectorAll('.carousel__indicador');
            for (var i = 0; i < indicadores.length; i++) {
                (function(indicador, indice) {
                    indicador.addEventListener('click', function() {
                        self._irASlide(indice);
                    });
                })(indicadores[i], i);
            }

            // Boton de pausa
            var btnPausar = this.querySelector('.carousel__pausar');
            if (btnPausar) {
                btnPausar.addEventListener('click', function() {
                    self._togglePausa();
                });
            }

            // Pausar al hover
            if (this._config.pausarHover && this._config.autoplay) {
                var carousel = this.querySelector('.carousel');

                carousel.addEventListener('mouseenter', function() {
                    self._pausarAutoplay();
                });

                carousel.addEventListener('mouseleave', function() {
                    if (!self._pausado) {
                        self._reanudarAutoplay();
                    }
                });

                // Pausar al focus
                carousel.addEventListener('focusin', function() {
                    self._pausarAutoplay();
                });

                carousel.addEventListener('focusout', function(e) {
                    if (!carousel.contains(e.relatedTarget) && !self._pausado) {
                        self._reanudarAutoplay();
                    }
                });
            }

            // Teclado
            this.addEventListener('keydown', function(e) {
                self._manejarTeclado(e);
            });

            // Touch/Swipe
            this._initEventosTactiles();
        }

        _initEventosTactiles() {
            var self = this;
            var viewport = this.querySelector('.carousel__viewport');

            if (!viewport) return;

            viewport.addEventListener('touchstart', function(e) {
                self._touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            viewport.addEventListener('touchend', function(e) {
                self._touchEndX = e.changedTouches[0].screenX;
                self._manejarSwipe();
            }, { passive: true });
        }


        _manejarSwipe() {
            var diferencia = this._touchStartX - this._touchEndX;
            var umbral = 50; // Minimo de pixeles para considerar swipe

            if (Math.abs(diferencia) < umbral) return;

            if (diferencia > 0) {
                // Swipe izquierda -> siguiente
                this.siguiente();
            } else {
                // Swipe derecha -> anterior
                this.anterior();
            }
        }

        _manejarTeclado(e) {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.anterior();
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    this.siguiente();
                    break;

                case 'Home':
                    e.preventDefault();
                    this._irASlide(0);
                    break;

                case 'End':
                    e.preventDefault();
                    this._irASlide(this._totalSlides - 1);
                    break;

                case ' ':
                    if (this._config.autoplay) {
                        e.preventDefault();
                        this._togglePausa();
                    }
                    break;
            }
        }

        _irASlide(indice, animar) {
            if (animar === undefined) animar = true;

            if (indice < 0) {
                indice = this._config.loop ? this._totalSlides - 1 : 0;
            } else if (indice >= this._totalSlides) {
                indice = this._config.loop ? 0 : this._totalSlides - 1;
            }

            this._indiceActual = indice;

            var pista = this.querySelector('.carousel__pista');
            if (pista) {
                var desplazamiento = -indice * 100;
                pista.style.transition = animar ? 'transform var(--l-transicion-normal, 250ms ease)' : 'none';
                pista.style.transform = 'translateX(' + desplazamiento + '%)';
            }

            var slides = this.querySelectorAll('.carousel__slide');
            for (var i = 0; i < slides.length; i++) {
                slides[i].classList.toggle('carousel__slide--activo', i === indice);
                slides[i].setAttribute('aria-hidden', i !== indice ? 'true' : 'false');
            }

            var indicadores = this.querySelectorAll('.carousel__indicador');
            for (var j = 0; j < indicadores.length; j++) {
                indicadores[j].classList.toggle('carousel__indicador--activo', j === indice);
                indicadores[j].setAttribute('aria-selected', j === indice ? 'true' : 'false');
            }

            // Anunciar para lectores de pantalla
            var anuncio = this.querySelector('.carousel__anuncio');
            if (anuncio) {
                anuncio.textContent = 'Mostrando slide ' + (indice + 1) + ' de ' + this._totalSlides;
            }

            // Emitir evento
            this.dispatchEvent(new CustomEvent('luthier:carousel-change', {
                bubbles: true,
                detail: {
                    indice: indice,
                    total: this._totalSlides
                }
            }));
        }

        _iniciarAutoplay() {
            var self = this;
            this._autoplayId = setInterval(function() {
                self.siguiente();
            }, this._config.intervalo);
        }

        _detenerAutoplay() {
            if (this._autoplayId) {
                clearInterval(this._autoplayId);
                this._autoplayId = null;
            }
        }

        _pausarAutoplay() {
            this._detenerAutoplay();
        }

        _reanudarAutoplay() {
            if (this._config.autoplay && !this._pausado) {
                this._iniciarAutoplay();
            }
        }

        _togglePausa() {
            this._pausado = !this._pausado;

            var btnPausar = this.querySelector('.carousel__pausar');
            var icono = btnPausar ? btnPausar.querySelector('.carousel__pausar-icono') : null;

            if (this._pausado) {
                this._detenerAutoplay();
                if (btnPausar) {
                    btnPausar.setAttribute('aria-label', 'Reanudar carrusel');
                }
                if (icono) {
                    icono.innerHTML = '&#9658;'; // Play
                }
            } else {
                this._iniciarAutoplay();
                if (btnPausar) {
                    btnPausar.setAttribute('aria-label', 'Pausar carrusel');
                }
                if (icono) {
                    icono.innerHTML = '&#10074;&#10074;'; // Pause
                }
            }

            // Emitir evento
            this.dispatchEvent(new CustomEvent('luthier:carousel-pausa', {
                bubbles: true,
                detail: { pausado: this._pausado }
            }));
        }

        // API publica
        siguiente() {
            this._irASlide(this._indiceActual + 1);
        }

        anterior() {
            this._irASlide(this._indiceActual - 1);
        }

        irA(indice) {
            this._irASlide(indice);
        }

        pausar() {
            if (!this._pausado) {
                this._togglePausa();
            }
        }

        reanudar() {
            if (this._pausado) {
                this._togglePausa();
            }
        }

        obtenerIndice() {
            return this._indiceActual;
        }

        obtenerTotal() {
            return this._totalSlides;
        }
    }

    if (!customElements.get('luthier-carousel')) {
        customElements.define('luthier-carousel', LuthierCarousel);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierCarousel = LuthierCarousel;

})(typeof window !== 'undefined' ? window : this);
