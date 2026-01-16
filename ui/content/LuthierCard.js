/**
 * LuthierCard - Tarjeta generica de contenido
 *
 * Componente de tarjeta versatil para mostrar contenido variado:
 * noticias, productos, perfiles, etc.
 *
 * ATRIBUTOS:
 * - titulo   : Titulo de la tarjeta
 * - imagen   : URL de imagen destacada (opcional)
 * - enlace   : URL de destino al hacer clic (opcional)
 * - variante : "default" | "horizontal" | "compacta" | "destacada"
 *
 * SLOTS:
 * - default : Contenido principal de la tarjeta
 * - footer  : Contenido del pie de tarjeta (botones, meta, etc)
 * - badge   : Badge/etiqueta flotante
 *
 * @example Tarjeta simple
 * <luthier-card titulo="Mi Tarjeta">
 *     <p>Contenido de la tarjeta...</p>
 * </luthier-card>
 *
 * @example Tarjeta con imagen y enlace
 * <luthier-card titulo="Noticia" imagen="foto.jpg" enlace="noticia.html">
 *     <p>Resumen de la noticia...</p>
 *     <span slot="badge">Nuevo</span>
 *     <div slot="footer">
 *         <span>Hace 2 horas</span>
 *     </div>
 * </luthier-card>
 */
(function(global) {
    'use strict';

    class LuthierCard extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            var config = {
                titulo: this.getAttribute('titulo') || '',
                imagen: this.getAttribute('imagen') || '',
                enlace: this.getAttribute('enlace') || '',
                variante: this.getAttribute('variante') || 'default'
            };

            // Extraer slots
            var slots = this._extraerSlots();

            // Contenido restante
            var contenido = this.innerHTML.trim();

            // Aplicar clases
            this.classList.add('card-wrapper');
            this.classList.add('card-wrapper--' + config.variante);

            this.innerHTML = this._render(config, slots, contenido);
            this._initEventos(config);
        }

        _extraerSlots() {
            var slots = {
                footer: null,
                badge: null
            };

            var elementosConSlot = this.querySelectorAll('[slot]');

            for (var i = 0; i < elementosConSlot.length; i++) {
                var el = elementosConSlot[i];
                var nombreSlot = el.getAttribute('slot');

                if (nombreSlot in slots) {
                    slots[nombreSlot] = el.outerHTML;
                    el.parentNode.removeChild(el);
                }
            }

            return slots;
        }

        _render(config, slots, contenido) {
            var tituloHTML = '';
            if (config.titulo) {
                if (config.enlace) {
                    tituloHTML = '<h3 class="card__titulo"><a href="' + config.enlace + '">' + config.titulo + '</a></h3>';
                } else {
                    tituloHTML = '<h3 class="card__titulo">' + config.titulo + '</h3>';
                }
            }

            var imagenHTML = '';
            if (config.imagen) {
                imagenHTML = '\
                    <div class="card__imagen">\
                        ' + (config.enlace ? '<a href="' + config.enlace + '">' : '') + '\
                        <img src="' + config.imagen + '" alt="' + (config.titulo || 'Imagen') + '" loading="lazy">\
                        ' + (config.enlace ? '</a>' : '') + '\
                        ' + (slots.badge ? '<div class="card__badge">' + slots.badge + '</div>' : '') + '\
                    </div>\
                ';
            } else if (slots.badge) {
                // Badge sin imagen
                imagenHTML = '<div class="card__badge card__badge--sin-imagen">' + slots.badge + '</div>';
            }

            return '\
                <article class="card card--' + config.variante + '">\
                    ' + imagenHTML + '\
                    <div class="card__cuerpo">\
                        ' + tituloHTML + '\
                        <div class="card__contenido">\
                            ' + contenido + '\
                        </div>\
                    </div>\
                    ' + (slots.footer ? '\
                        <footer class="card__footer">\
                            ' + slots.footer + '\
                        </footer>\
                    ' : '') + '\
                </article>\
            ';
        }

        _initEventos(config) {
            // Si la tarjeta completa es clickeable
            if (config.enlace && this.hasAttribute('clickeable')) {
                var self = this;
                this.style.cursor = 'pointer';
                this.addEventListener('click', function(e) {
                    // Evitar doble navegacion si se clickeo un enlace interno
                    if (e.target.tagName !== 'A') {
                        global.location.href = config.enlace;
                    }
                });
            }
        }
    }

    if (!customElements.get('luthier-card')) {
        customElements.define('luthier-card', LuthierCard);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierCard = LuthierCard;

})(typeof window !== 'undefined' ? window : this);
