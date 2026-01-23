/**
 * LuthierQuote - Citas y testimonios
 *
 * Componente para mostrar citas, testimonios o reseñas destacadas.
 *
 * ATRIBUTOS:
 * - autor   : Nombre del autor de la cita
 * - cargo   : Cargo o título del autor
 * - foto    : URL de la foto del autor
 * - empresa : Empresa u organización del autor
 * - estilo  : Estilo visual: simple, tarjeta, destacado (default: simple)
 *
 * @example Uso básico
 * <luthier-quote autor="María López" cargo="CEO" empresa="TechCorp">
 *     Este producto cambió completamente nuestra forma de trabajar.
 * </luthier-quote>
 *
 * @example Con foto y estilo tarjeta
 * <luthier-quote autor="Juan Pérez" foto="img/juan.jpg" estilo="tarjeta">
 *     Excelente servicio y atención al cliente.
 * </luthier-quote>
 */
(function(global) {
    'use strict';

    class LuthierQuote extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                autor: this.getAttribute('autor') || '',
                cargo: this.getAttribute('cargo') || '',
                foto: this.getAttribute('foto') || '',
                empresa: this.getAttribute('empresa') || '',
                estilo: this.getAttribute('estilo') || 'simple'
            };

            this._contenidoOriginal = this.cloneNode(true);
            this._construirDOM();
        }

        _construirDOM() {
            var contenido = this._contenidoOriginal;
            this.textContent = '';

            this.classList.add('quote-wrapper');
            this.classList.add('quote--' + this._config.estilo);

            var figure = document.createElement('figure');
            figure.className = 'quote';

            // Icono de comillas
            var comillas = document.createElement('div');
            comillas.className = 'quote__comillas';
            comillas.setAttribute('aria-hidden', 'true');
            comillas.textContent = '"';
            figure.appendChild(comillas);

            // Cita
            var blockquote = document.createElement('blockquote');
            blockquote.className = 'quote__texto';
            while (contenido.firstChild) {
                blockquote.appendChild(contenido.firstChild);
            }
            figure.appendChild(blockquote);

            // Footer con autor
            if (this._config.autor || this._config.foto) {
                var figcaption = document.createElement('figcaption');
                figcaption.className = 'quote__autor';

                // Foto
                if (this._config.foto) {
                    var fotoContainer = document.createElement('div');
                    fotoContainer.className = 'quote__foto-container';

                    var foto = document.createElement('img');
                    foto.src = this._config.foto;
                    foto.alt = this._config.autor;
                    foto.className = 'quote__foto';
                    foto.setAttribute('loading', 'lazy');

                    fotoContainer.appendChild(foto);
                    figcaption.appendChild(fotoContainer);
                }

                // Info del autor
                var info = document.createElement('div');
                info.className = 'quote__info';

                if (this._config.autor) {
                    var nombre = document.createElement('cite');
                    nombre.className = 'quote__nombre';
                    nombre.textContent = this._config.autor;
                    info.appendChild(nombre);
                }

                if (this._config.cargo || this._config.empresa) {
                    var detalle = document.createElement('span');
                    detalle.className = 'quote__detalle';

                    var textoDetalle = '';
                    if (this._config.cargo) {
                        textoDetalle += this._config.cargo;
                    }
                    if (this._config.empresa) {
                        if (textoDetalle) textoDetalle += ', ';
                        textoDetalle += this._config.empresa;
                    }
                    detalle.textContent = textoDetalle;
                    info.appendChild(detalle);
                }

                figcaption.appendChild(info);
                figure.appendChild(figcaption);
            }

            this.appendChild(figure);
        }
    }

    if (!customElements.get('luthier-quote')) {
        customElements.define('luthier-quote', LuthierQuote);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierQuote = LuthierQuote;

})(typeof window !== 'undefined' ? window : this);
