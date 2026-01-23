/**
 * LuthierEmbed - Videos y contenido embebido responsivo
 *
 * Componente para embeber videos de YouTube, Vimeo u otros iframes de forma responsiva.
 *
 * ATRIBUTOS:
 * - src       : URL del video o iframe
 * - ratio     : Proporción del video: 16:9, 4:3, 1:1, 21:9 (default: 16:9)
 * - titulo    : Título para accesibilidad
 * - autoplay  : Autoplay del video (default: false)
 * - lazy      : Carga diferida (default: true)
 *
 * @example YouTube
 * <luthier-embed src="https://www.youtube.com/watch?v=VIDEO_ID" titulo="Mi video"></luthier-embed>
 *
 * @example Vimeo
 * <luthier-embed src="https://vimeo.com/VIDEO_ID" ratio="4:3"></luthier-embed>
 *
 * @example Iframe genérico
 * <luthier-embed src="https://ejemplo.com/embed" ratio="1:1"></luthier-embed>
 */
(function(global) {
    'use strict';

    var RATIOS = {
        '16:9': 56.25,
        '4:3': 75,
        '1:1': 100,
        '21:9': 42.86
    };

    class LuthierEmbed extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                src: this.getAttribute('src') || '',
                ratio: this.getAttribute('ratio') || '16:9',
                titulo: this.getAttribute('titulo') || 'Video embebido',
                autoplay: this.hasAttribute('autoplay'),
                lazy: this.getAttribute('lazy') !== 'false'
            };

            if (!this._config.src) {
                console.warn('LuthierEmbed: Se requiere el atributo src');
                return;
            }

            this._construirDOM();
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('embed-wrapper');

            var container = document.createElement('div');
            container.className = 'embed';

            var paddingBottom = RATIOS[this._config.ratio] || RATIOS['16:9'];
            container.style.paddingBottom = paddingBottom + '%';

            var iframe = document.createElement('iframe');
            iframe.className = 'embed__iframe';
            iframe.src = this._procesarURL(this._config.src);
            iframe.title = this._config.titulo;
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('frameborder', '0');

            if (this._config.lazy) {
                iframe.setAttribute('loading', 'lazy');
            }

            container.appendChild(iframe);
            this.appendChild(container);
        }

        _procesarURL(url) {
            // YouTube
            var youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (youtubeMatch) {
                var params = this._config.autoplay ? '?autoplay=1' : '';
                return 'https://www.youtube.com/embed/' + youtubeMatch[1] + params;
            }

            // Vimeo
            var vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
            if (vimeoMatch) {
                var vimeoParams = this._config.autoplay ? '?autoplay=1' : '';
                return 'https://player.vimeo.com/video/' + vimeoMatch[1] + vimeoParams;
            }

            // URL genérica (ya es embed o iframe)
            return url;
        }

        // API pública
        cargar(url) {
            this._config.src = url;
            this._construirDOM();
        }
    }

    if (!customElements.get('luthier-embed')) {
        customElements.define('luthier-embed', LuthierEmbed);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierEmbed = LuthierEmbed;

})(typeof window !== 'undefined' ? window : this);
