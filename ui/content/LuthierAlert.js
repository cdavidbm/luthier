/**
 * LuthierAlert - Banners de aviso/alerta
 *
 * Componente para mostrar mensajes de alerta, información, éxito o advertencia.
 *
 * ATRIBUTOS:
 * - tipo       : Tipo de alerta: info, exito, advertencia, error (default: info)
 * - titulo     : Título opcional del mensaje
 * - descartable: Permite cerrar la alerta
 * - icono      : Icono personalizado (emoji o carácter)
 *
 * @example Uso básico
 * <luthier-alert tipo="info">
 *     Este es un mensaje informativo.
 * </luthier-alert>
 *
 * @example Con título y descartable
 * <luthier-alert tipo="advertencia" titulo="Atención" descartable>
 *     Por favor revise los datos antes de continuar.
 * </luthier-alert>
 */
(function(global) {
    'use strict';

    var ICONOS_DEFAULT = {
        info: 'ℹ',
        exito: '✓',
        advertencia: '⚠',
        error: '✕'
    };

    var ROLES = {
        info: 'status',
        exito: 'status',
        advertencia: 'alert',
        error: 'alert'
    };

    class LuthierAlert extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        _init() {
            this._config = {
                tipo: this.getAttribute('tipo') || 'info',
                titulo: this.getAttribute('titulo') || '',
                descartable: this.hasAttribute('descartable'),
                icono: this.getAttribute('icono') || ''
            };

            // Validar tipo
            if (!ICONOS_DEFAULT[this._config.tipo]) {
                this._config.tipo = 'info';
            }

            this._contenidoOriginal = this.cloneNode(true);
            this._construirDOM();
        }

        _construirDOM() {
            var contenido = this._contenidoOriginal;
            this.textContent = '';

            this.classList.add('alert-wrapper');
            this.classList.add('alert--' + this._config.tipo);
            this.setAttribute('role', ROLES[this._config.tipo]);

            var alert = document.createElement('div');
            alert.className = 'alert';

            // Icono
            var iconoContainer = document.createElement('div');
            iconoContainer.className = 'alert__icono';
            iconoContainer.textContent = this._config.icono || ICONOS_DEFAULT[this._config.tipo];
            iconoContainer.setAttribute('aria-hidden', 'true');
            alert.appendChild(iconoContainer);

            // Contenido
            var contenidoDiv = document.createElement('div');
            contenidoDiv.className = 'alert__contenido';

            // Título
            if (this._config.titulo) {
                var titulo = document.createElement('strong');
                titulo.className = 'alert__titulo';
                titulo.textContent = this._config.titulo;
                contenidoDiv.appendChild(titulo);
            }

            // Mensaje
            var mensaje = document.createElement('div');
            mensaje.className = 'alert__mensaje';
            while (contenido.firstChild) {
                mensaje.appendChild(contenido.firstChild);
            }
            contenidoDiv.appendChild(mensaje);

            alert.appendChild(contenidoDiv);

            // Botón cerrar
            if (this._config.descartable) {
                var btnCerrar = document.createElement('button');
                btnCerrar.className = 'alert__cerrar';
                btnCerrar.setAttribute('aria-label', 'Cerrar alerta');
                btnCerrar.textContent = '×';

                var self = this;
                btnCerrar.addEventListener('click', function() {
                    self._cerrar();
                });

                alert.appendChild(btnCerrar);
            }

            this.appendChild(alert);
        }

        _cerrar() {
            var self = this;
            this.classList.add('alert--cerrando');

            setTimeout(function() {
                self.style.display = 'none';
                self.dispatchEvent(new CustomEvent('luthier:alert-cerrada', {
                    bubbles: true
                }));
            }, 300);
        }

        // API pública
        mostrar() {
            this.style.display = 'block';
            this.classList.remove('alert--cerrando');
        }

        cerrar() {
            this._cerrar();
        }
    }

    if (!customElements.get('luthier-alert')) {
        customElements.define('luthier-alert', LuthierAlert);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierAlert = LuthierAlert;

})(typeof window !== 'undefined' ? window : this);
