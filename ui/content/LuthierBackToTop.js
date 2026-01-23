/**
 * LuthierBackToTop - Botón flotante para volver arriba
 *
 * Muestra un botón flotante cuando el usuario hace scroll hacia abajo.
 *
 * ATRIBUTOS:
 * - umbral   : Píxeles de scroll para mostrar el botón (default: 300)
 * - suave    : Usa scroll suave (default: true)
 * - posicion : Posición del botón: derecha, izquierda (default: derecha)
 * - texto    : Texto o emoji del botón (default: ↑)
 *
 * @example Uso básico
 * <luthier-back-to-top></luthier-back-to-top>
 *
 * @example Personalizado
 * <luthier-back-to-top umbral="500" posicion="izquierda" texto="⬆"></luthier-back-to-top>
 */
(function(global) {
    'use strict';

    class LuthierBackToTop extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        disconnectedCallback() {
            this._removerEventos();
        }

        _init() {
            this._config = {
                umbral: parseInt(this.getAttribute('umbral'), 10) || 300,
                suave: this.getAttribute('suave') !== 'false',
                posicion: this.getAttribute('posicion') || 'derecha',
                texto: this.getAttribute('texto') || '↑'
            };

            this._construirDOM();
            this._agregarEventos();
            this._verificarVisibilidad();
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('back-to-top-wrapper');
            this.classList.add('back-to-top--' + this._config.posicion);

            var boton = document.createElement('button');
            boton.className = 'back-to-top';
            boton.setAttribute('aria-label', 'Volver arriba');
            boton.setAttribute('title', 'Volver arriba');
            boton.textContent = this._config.texto;

            this.appendChild(boton);
            this._boton = boton;

            // Inicialmente oculto
            this.style.opacity = '0';
            this.style.visibility = 'hidden';
        }

        _agregarEventos() {
            var self = this;

            this._boton.addEventListener('click', function() {
                self._irArriba();
            });

            this._scrollHandler = function() {
                self._verificarVisibilidad();
            };

            window.addEventListener('scroll', this._scrollHandler, { passive: true });
        }

        _removerEventos() {
            if (this._scrollHandler) {
                window.removeEventListener('scroll', this._scrollHandler);
            }
        }

        _verificarVisibilidad() {
            var scrollY = window.scrollY || window.pageYOffset;

            if (scrollY > this._config.umbral) {
                this.style.opacity = '1';
                this.style.visibility = 'visible';
            } else {
                this.style.opacity = '0';
                this.style.visibility = 'hidden';
            }
        }

        _irArriba() {
            if (this._config.suave && 'scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                window.scrollTo(0, 0);
            }
        }
    }

    if (!customElements.get('luthier-back-to-top')) {
        customElements.define('luthier-back-to-top', LuthierBackToTop);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierBackToTop = LuthierBackToTop;

})(typeof window !== 'undefined' ? window : this);
