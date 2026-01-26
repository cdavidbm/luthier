/**
 * LuthierDevTools - Herramientas de desarrollo para Luthier
 *
 * Widget flotante que muestra advertencias y errores durante el desarrollo:
 * - Paginas no registradas en LUTHIER_PAGES
 * - Paginas huerfanas (no enlazadas desde el menu)
 * - Enlaces rotos en la pagina actual
 * - Items del menu sin pagina correspondiente
 *
 * SOLO SE MUESTRA EN:
 * - Protocolo file:///
 * - localhost
 * - Cuando existe el atributo data-luthier-dev en <html> o <body>
 *
 * ATRIBUTOS:
 * - posicion     : "inferior-derecha" (default) | "inferior-izquierda" | "superior-derecha" | "superior-izquierda"
 * - expandido    : Inicia expandido (default: false)
 * - sin-escaneo  : No escanea enlaces automaticamente
 *
 * @example Uso basico
 * <luthier-dev-tools></luthier-dev-tools>
 *
 * @example Expandido por defecto
 * <luthier-dev-tools expandido></luthier-dev-tools>
 */
(function(global) {
    'use strict';

    var LuthierDevTools = (function() {

        function LuthierDevToolsElement() {
            // Constructor vacio para ES5
        }

        // Heredar de HTMLElement
        if (typeof HTMLElement !== 'undefined') {
            LuthierDevToolsElement.prototype = Object.create(HTMLElement.prototype);
            LuthierDevToolsElement.prototype.constructor = LuthierDevToolsElement;
        }

        LuthierDevToolsElement.prototype.connectedCallback = function() {
            var self = this;

            // Verificar si debe mostrarse
            if (!this._debeMotrarse()) {
                this.style.display = 'none';
                return;
            }

            setTimeout(function() {
                self._init();
            }, 100);
        };

        LuthierDevToolsElement.prototype._debeMotrarse = function() {
            // Mostrar en file:// o localhost
            var protocol = global.location.protocol;
            var hostname = global.location.hostname;

            if (protocol === 'file:') return true;
            if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

            // Mostrar si existe atributo data-luthier-dev
            if (document.documentElement.hasAttribute('data-luthier-dev')) return true;
            if (document.body && document.body.hasAttribute('data-luthier-dev')) return true;

            return false;
        };

        LuthierDevToolsElement.prototype._init = function() {
            this._config = {
                posicion: this.getAttribute('posicion') || 'inferior-derecha',
                expandido: this.hasAttribute('expandido'),
                escanearEnlaces: !this.hasAttribute('sin-escaneo')
            };

            this._errores = [];
            this._advertencias = [];
            this._enlacesRotos = [];

            // Ejecutar validaciones
            this._validar();

            // Renderizar usando DOM
            this._render();

            // Eventos
            this._initEventos();
        };

        LuthierDevToolsElement.prototype._validar = function() {
            var self = this;

            // 1. Validar con SitemapRegistry si existe
            if (global.LuthierSitemapRegistry) {
                var resultado = global.LuthierSitemapRegistry.validar();
                this._errores = resultado.errores;
                this._advertencias = resultado.advertencias;
            } else {
                // Si no hay registro, advertir que la pagina actual no esta registrada
                this._advertencias.push({
                    tipo: 'sin-registro',
                    mensaje: 'LuthierSitemapRegistry no esta configurado. Defina LUTHIER_PAGES para validar el sitio.'
                });
            }

            // 2. Escanear enlaces en la pagina actual
            if (this._config.escanearEnlaces) {
                this._escanearEnlaces();
            }

            // 3. Verificar atributo data-luthier-page
            this._verificarAtributoPagina();
        };

        LuthierDevToolsElement.prototype._escanearEnlaces = function() {
            var self = this;
            var enlaces = document.querySelectorAll('a[href]');

            for (var i = 0; i < enlaces.length; i++) {
                var enlace = enlaces[i];
                var href = enlace.getAttribute('href');

                // Ignorar enlaces externos, anclas, javascript, mailto, tel
                if (!href) continue;
                if (href.startsWith('http://') || href.startsWith('https://')) continue;
                if (href.startsWith('#')) continue;
                if (href.startsWith('javascript:')) continue;
                if (href.startsWith('mailto:')) continue;
                if (href.startsWith('tel:')) continue;

                // Para file:// verificar contra LUTHIER_PAGES si existe
                if (global.location.protocol === 'file:' && global.LUTHIER_PAGES) {
                    var encontrado = false;
                    var hrefNormalizado = href.replace(/^\.\//, '').replace(/^\//, '');

                    for (var j = 0; j < global.LUTHIER_PAGES.length; j++) {
                        var pagina = global.LUTHIER_PAGES[j];
                        if (pagina.slug === hrefNormalizado || pagina.slug.endsWith(hrefNormalizado)) {
                            encontrado = true;
                            break;
                        }
                    }

                    if (!encontrado && hrefNormalizado.endsWith('.html')) {
                        this._enlacesRotos.push({
                            href: href,
                            texto: enlace.textContent.trim().substring(0, 50),
                            elemento: enlace
                        });
                    }
                }
            }

            if (this._enlacesRotos.length > 0) {
                this._advertencias.push({
                    tipo: 'enlaces-no-registrados',
                    mensaje: this._enlacesRotos.length + ' enlaces apuntan a paginas no registradas',
                    enlaces: this._enlacesRotos
                });
            }
        };

        LuthierDevToolsElement.prototype._verificarAtributoPagina = function() {
            var layout = document.querySelector('luthier-layout');

            if (layout && !layout.hasAttribute('data-luthier-page')) {
                this._advertencias.push({
                    tipo: 'sin-atributo-pagina',
                    mensaje: 'El elemento luthier-layout no tiene atributo data-luthier-page'
                });
            }
        };

        LuthierDevToolsElement.prototype._render = function() {
            var self = this;
            var totalProblemas = this._errores.length + this._advertencias.length;
            var tieneErrores = this._errores.length > 0;
            var tieneAdvertencias = this._advertencias.length > 0;

            // Limpiar contenido anterior
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            // Crear estilos
            var style = document.createElement('style');
            style.textContent = this._getCSS();
            this.appendChild(style);

            // Crear contenedor principal
            var container = document.createElement('div');
            container.className = 'dev-tools dev-tools--' + this._config.posicion;
            if (tieneErrores) {
                container.classList.add('dev-tools--error');
            } else if (tieneAdvertencias) {
                container.classList.add('dev-tools--advertencia');
            } else {
                container.classList.add('dev-tools--ok');
            }
            if (this._config.expandido) {
                container.classList.add('dev-tools--expandido');
            }

            // Boton toggle
            var toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'dev-tools__toggle';
            toggle.setAttribute('aria-label', 'Herramientas de desarrollo');

            var iconSpan = document.createElement('span');
            if (tieneErrores) {
                iconSpan.textContent = '!';
            } else if (tieneAdvertencias) {
                iconSpan.textContent = '?';
            } else {
                iconSpan.textContent = '\u2713'; // checkmark
            }
            toggle.appendChild(iconSpan);

            if (totalProblemas > 0) {
                var badge = document.createElement('span');
                badge.className = 'dev-tools__badge';
                badge.textContent = String(totalProblemas);
                toggle.appendChild(badge);
            }

            container.appendChild(toggle);

            // Panel
            var panel = document.createElement('div');
            panel.className = 'dev-tools__panel';

            // Header del panel
            var header = document.createElement('div');
            header.className = 'dev-tools__header';

            var headerTitle = document.createElement('span');
            headerTitle.textContent = 'Luthier Dev Tools';
            header.appendChild(headerTitle);

            var closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'dev-tools__close';
            closeBtn.setAttribute('aria-label', 'Cerrar');
            closeBtn.textContent = '\u00D7'; // x
            header.appendChild(closeBtn);

            panel.appendChild(header);

            // Contenido
            var content = document.createElement('div');
            content.className = 'dev-tools__content';
            this._renderContenido(content);
            panel.appendChild(content);

            // Acciones
            var actions = document.createElement('div');
            actions.className = 'dev-tools__actions';

            var btnReporte = document.createElement('button');
            btnReporte.type = 'button';
            btnReporte.className = 'dev-tools__btn';
            btnReporte.setAttribute('data-action', 'reporte');
            btnReporte.textContent = 'Ver en consola';
            actions.appendChild(btnReporte);

            var btnReescanear = document.createElement('button');
            btnReescanear.type = 'button';
            btnReescanear.className = 'dev-tools__btn';
            btnReescanear.setAttribute('data-action', 'reescanear');
            btnReescanear.textContent = 'Reescanear';
            actions.appendChild(btnReescanear);

            panel.appendChild(actions);
            container.appendChild(panel);
            this.appendChild(container);
        };

        LuthierDevToolsElement.prototype._getCSS = function() {
            return '\
                .dev-tools {\
                    position: fixed;\
                    z-index: 99999;\
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
                    font-size: 14px;\
                }\
                .dev-tools--inferior-derecha { bottom: 20px; right: 20px; }\
                .dev-tools--inferior-izquierda { bottom: 20px; left: 20px; }\
                .dev-tools--superior-derecha { top: 20px; right: 20px; }\
                .dev-tools--superior-izquierda { top: 20px; left: 20px; }\
                .dev-tools__toggle {\
                    width: 48px;\
                    height: 48px;\
                    border-radius: 50%;\
                    border: none;\
                    cursor: pointer;\
                    display: flex;\
                    align-items: center;\
                    justify-content: center;\
                    font-size: 20px;\
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);\
                    transition: transform 0.2s;\
                    position: relative;\
                }\
                .dev-tools__toggle:hover { transform: scale(1.1); }\
                .dev-tools--error .dev-tools__toggle { background: #c53030; color: white; }\
                .dev-tools--advertencia .dev-tools__toggle { background: #dd6b20; color: white; }\
                .dev-tools--ok .dev-tools__toggle { background: #38a169; color: white; }\
                .dev-tools__badge {\
                    position: absolute;\
                    top: -5px;\
                    right: -5px;\
                    background: #1a202c;\
                    color: white;\
                    font-size: 11px;\
                    padding: 2px 6px;\
                    border-radius: 10px;\
                    font-weight: bold;\
                }\
                .dev-tools__panel {\
                    display: none;\
                    position: absolute;\
                    bottom: 60px;\
                    right: 0;\
                    width: 400px;\
                    max-height: 500px;\
                    background: white;\
                    border-radius: 8px;\
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);\
                    overflow: hidden;\
                }\
                .dev-tools--superior-derecha .dev-tools__panel,\
                .dev-tools--superior-izquierda .dev-tools__panel {\
                    bottom: auto;\
                    top: 60px;\
                }\
                .dev-tools--inferior-izquierda .dev-tools__panel,\
                .dev-tools--superior-izquierda .dev-tools__panel {\
                    right: auto;\
                    left: 0;\
                }\
                .dev-tools--expandido .dev-tools__panel { display: block; }\
                .dev-tools__header {\
                    padding: 12px 16px;\
                    background: #1a202c;\
                    color: white;\
                    font-weight: 600;\
                    display: flex;\
                    justify-content: space-between;\
                    align-items: center;\
                }\
                .dev-tools__close {\
                    background: none;\
                    border: none;\
                    color: white;\
                    cursor: pointer;\
                    font-size: 18px;\
                    padding: 0;\
                    line-height: 1;\
                }\
                .dev-tools__content {\
                    max-height: 400px;\
                    overflow-y: auto;\
                    padding: 0;\
                }\
                .dev-tools__section {\
                    border-bottom: 1px solid #e2e8f0;\
                }\
                .dev-tools__section:last-child { border-bottom: none; }\
                .dev-tools__section-header {\
                    padding: 10px 16px;\
                    font-weight: 600;\
                    display: flex;\
                    align-items: center;\
                    gap: 8px;\
                }\
                .dev-tools__section--error .dev-tools__section-header { color: #c53030; }\
                .dev-tools__section--advertencia .dev-tools__section-header { color: #dd6b20; }\
                .dev-tools__section--ok .dev-tools__section-header { color: #38a169; }\
                .dev-tools__list {\
                    list-style: none;\
                    margin: 0;\
                    padding: 0 16px 12px;\
                }\
                .dev-tools__list li {\
                    padding: 6px 0;\
                    font-size: 13px;\
                    color: #4a5568;\
                    border-bottom: 1px solid #f0f0f0;\
                }\
                .dev-tools__list li:last-child { border-bottom: none; }\
                .dev-tools__empty {\
                    padding: 20px;\
                    text-align: center;\
                    color: #38a169;\
                }\
                .dev-tools__actions {\
                    padding: 12px 16px;\
                    background: #f7fafc;\
                    border-top: 1px solid #e2e8f0;\
                }\
                .dev-tools__btn {\
                    background: #1a202c;\
                    color: white;\
                    border: none;\
                    padding: 8px 16px;\
                    border-radius: 4px;\
                    cursor: pointer;\
                    font-size: 13px;\
                    margin-right: 8px;\
                }\
                .dev-tools__btn:hover { background: #2d3748; }\
            ';
        };

        LuthierDevToolsElement.prototype._renderContenido = function(container) {
            var i, li;

            if (this._errores.length === 0 && this._advertencias.length === 0) {
                var empty = document.createElement('div');
                empty.className = 'dev-tools__empty';
                empty.textContent = '\u2713 Todo en orden';
                container.appendChild(empty);
                return;
            }

            // Errores
            if (this._errores.length > 0) {
                var errorSection = document.createElement('div');
                errorSection.className = 'dev-tools__section dev-tools__section--error';

                var errorHeader = document.createElement('div');
                errorHeader.className = 'dev-tools__section-header';
                errorHeader.textContent = '\u26A0 Errores (' + this._errores.length + ')';
                errorSection.appendChild(errorHeader);

                var errorList = document.createElement('ul');
                errorList.className = 'dev-tools__list';
                for (i = 0; i < this._errores.length; i++) {
                    li = document.createElement('li');
                    li.textContent = this._errores[i].mensaje;
                    errorList.appendChild(li);
                }
                errorSection.appendChild(errorList);
                container.appendChild(errorSection);
            }

            // Advertencias
            if (this._advertencias.length > 0) {
                var warnSection = document.createElement('div');
                warnSection.className = 'dev-tools__section dev-tools__section--advertencia';

                var warnHeader = document.createElement('div');
                warnHeader.className = 'dev-tools__section-header';
                warnHeader.textContent = '\u26A0 Advertencias (' + this._advertencias.length + ')';
                warnSection.appendChild(warnHeader);

                var warnList = document.createElement('ul');
                warnList.className = 'dev-tools__list';
                for (i = 0; i < this._advertencias.length; i++) {
                    li = document.createElement('li');
                    li.textContent = this._advertencias[i].mensaje;
                    warnList.appendChild(li);
                }
                warnSection.appendChild(warnList);
                container.appendChild(warnSection);
            }
        };

        LuthierDevToolsElement.prototype._initEventos = function() {
            var self = this;
            var toggle = this.querySelector('.dev-tools__toggle');
            var close = this.querySelector('.dev-tools__close');
            var container = this.querySelector('.dev-tools');

            if (toggle) {
                toggle.addEventListener('click', function() {
                    container.classList.toggle('dev-tools--expandido');
                });
            }

            if (close) {
                close.addEventListener('click', function() {
                    container.classList.remove('dev-tools--expandido');
                });
            }

            // Botones de accion
            var btnReporte = this.querySelector('[data-action="reporte"]');
            var btnReescanear = this.querySelector('[data-action="reescanear"]');

            if (btnReporte) {
                btnReporte.addEventListener('click', function() {
                    if (global.LuthierSitemapRegistry) {
                        global.LuthierSitemapRegistry.imprimirReporte();
                    }
                    self._imprimirEnlacesRotos();
                });
            }

            if (btnReescanear) {
                btnReescanear.addEventListener('click', function() {
                    self._errores = [];
                    self._advertencias = [];
                    self._enlacesRotos = [];
                    self._validar();
                    self._render();
                    self._initEventos();
                });
            }
        };

        LuthierDevToolsElement.prototype._imprimirEnlacesRotos = function() {
            if (this._enlacesRotos.length === 0) return;

            console.group('[Luthier Dev Tools] Enlaces no registrados');
            for (var i = 0; i < this._enlacesRotos.length; i++) {
                var enlace = this._enlacesRotos[i];
                console.warn('Enlace:', enlace.href, '- Texto:', enlace.texto);
            }
            console.groupEnd();
        };

        return LuthierDevToolsElement;
    })();

    // Registrar como Custom Element
    if (typeof customElements !== 'undefined' && !customElements.get('luthier-dev-tools')) {
        var LuthierDevToolsClass = function() {
            return Reflect.construct(HTMLElement, [], LuthierDevToolsClass);
        };
        LuthierDevToolsClass.prototype = Object.create(HTMLElement.prototype);
        LuthierDevToolsClass.prototype.constructor = LuthierDevToolsClass;

        // Copiar metodos del prototipo
        var proto = LuthierDevTools.prototype;
        for (var method in proto) {
            if (proto.hasOwnProperty(method)) {
                LuthierDevToolsClass.prototype[method] = proto[method];
            }
        }

        customElements.define('luthier-dev-tools', LuthierDevToolsClass);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierDevTools = LuthierDevTools;

})(typeof window !== 'undefined' ? window : this);
