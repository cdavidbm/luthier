/**
 * LuthierStats - Contadores animados
 *
 * Muestra estadísticas con animación de conteo cuando entran en viewport.
 *
 * ATRIBUTOS:
 * - columnas  : Número de columnas (default: 4)
 * - duracion  : Duración de la animación en ms (default: 2000)
 * - separador : Separador de miles (default: ,)
 *
 * ESTRUCTURA REQUERIDA:
 * Los hijos deben tener data-valor y opcionalmente data-etiqueta, data-prefijo, data-sufijo.
 *
 * @example Uso básico
 * <luthier-stats>
 *     <div data-valor="1500" data-etiqueta="Clientes" data-sufijo="+"></div>
 *     <div data-valor="98" data-etiqueta="Satisfacción" data-sufijo="%"></div>
 *     <div data-valor="50" data-etiqueta="Empleados"></div>
 *     <div data-valor="10" data-etiqueta="Años" data-prefijo="+"></div>
 * </luthier-stats>
 */
(function(global) {
    'use strict';

    class LuthierStats extends HTMLElement {

        connectedCallback() {
            setTimeout(this._init.bind(this), 0);
        }

        disconnectedCallback() {
            this._removerObservador();
        }

        _init() {
            this._config = {
                columnas: parseInt(this.getAttribute('columnas'), 10) || 4,
                duracion: parseInt(this.getAttribute('duracion'), 10) || 2000,
                separador: this.getAttribute('separador') || ','
            };

            this._stats = this._extraerStats();
            this._animado = false;

            if (this._stats.length === 0) {
                console.warn('LuthierStats: No se encontraron estadísticas');
                return;
            }

            this._construirDOM();
            this._observarVisibilidad();
        }

        _extraerStats() {
            var stats = [];
            var hijos = this.children;

            for (var i = 0; i < hijos.length; i++) {
                var hijo = hijos[i];
                var valor = hijo.getAttribute('data-valor');
                if (valor) {
                    stats.push({
                        valor: parseFloat(valor),
                        etiqueta: hijo.getAttribute('data-etiqueta') || '',
                        prefijo: hijo.getAttribute('data-prefijo') || '',
                        sufijo: hijo.getAttribute('data-sufijo') || '',
                        icono: hijo.getAttribute('data-icono') || '',
                        decimales: (valor.indexOf('.') !== -1) ? (valor.split('.')[1] || '').length : 0
                    });
                }
            }

            return stats;
        }

        _construirDOM() {
            this.textContent = '';
            this.classList.add('stats-wrapper');

            var grid = document.createElement('div');
            grid.className = 'stats__grid';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(' + this._config.columnas + ', 1fr)';
            grid.style.gap = '2rem';

            this._elementos = [];

            for (var i = 0; i < this._stats.length; i++) {
                var stat = this._stats[i];
                var item = this._crearItem(stat);
                grid.appendChild(item.elemento);
                this._elementos.push(item);
            }

            this.appendChild(grid);
        }

        _crearItem(stat) {
            var item = document.createElement('div');
            item.className = 'stats__item';

            // Icono
            if (stat.icono) {
                var icono = document.createElement('div');
                icono.className = 'stats__icono';
                icono.textContent = stat.icono;
                item.appendChild(icono);
            }

            // Valor
            var valorContainer = document.createElement('div');
            valorContainer.className = 'stats__valor';

            var prefijo = document.createElement('span');
            prefijo.className = 'stats__prefijo';
            prefijo.textContent = stat.prefijo;
            valorContainer.appendChild(prefijo);

            var numero = document.createElement('span');
            numero.className = 'stats__numero';
            numero.textContent = '0';
            valorContainer.appendChild(numero);

            var sufijo = document.createElement('span');
            sufijo.className = 'stats__sufijo';
            sufijo.textContent = stat.sufijo;
            valorContainer.appendChild(sufijo);

            item.appendChild(valorContainer);

            // Etiqueta
            if (stat.etiqueta) {
                var etiqueta = document.createElement('div');
                etiqueta.className = 'stats__etiqueta';
                etiqueta.textContent = stat.etiqueta;
                item.appendChild(etiqueta);
            }

            return {
                elemento: item,
                numero: numero,
                stat: stat
            };
        }

        _observarVisibilidad() {
            var self = this;

            if ('IntersectionObserver' in window) {
                this._observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting && !self._animado) {
                            self._animado = true;
                            self._iniciarAnimacion();
                        }
                    });
                }, { threshold: 0.2 });

                this._observer.observe(this);
            } else {
                // Fallback: animar inmediatamente
                this._iniciarAnimacion();
            }
        }

        _removerObservador() {
            if (this._observer) {
                this._observer.disconnect();
            }
        }

        _iniciarAnimacion() {
            var self = this;

            for (var i = 0; i < this._elementos.length; i++) {
                (function(elem) {
                    self._animarNumero(elem.numero, elem.stat.valor, elem.stat.decimales);
                })(this._elementos[i]);
            }
        }

        _animarNumero(elemento, valorFinal, decimales) {
            var self = this;
            var inicio = 0;
            var duracion = this._config.duracion;
            var inicioTiempo = null;

            function paso(timestamp) {
                if (!inicioTiempo) inicioTiempo = timestamp;
                var progreso = Math.min((timestamp - inicioTiempo) / duracion, 1);

                // Easing: ease-out
                var valorActual = inicio + (valorFinal - inicio) * (1 - Math.pow(1 - progreso, 3));

                elemento.textContent = self._formatearNumero(valorActual, decimales);

                if (progreso < 1) {
                    requestAnimationFrame(paso);
                } else {
                    elemento.textContent = self._formatearNumero(valorFinal, decimales);
                }
            }

            requestAnimationFrame(paso);
        }

        _formatearNumero(numero, decimales) {
            var partes = numero.toFixed(decimales).split('.');
            var entero = partes[0];
            var decimal = partes[1];

            // Agregar separador de miles
            var resultado = '';
            var contador = 0;
            for (var i = entero.length - 1; i >= 0; i--) {
                if (contador > 0 && contador % 3 === 0) {
                    resultado = this._config.separador + resultado;
                }
                resultado = entero[i] + resultado;
                contador++;
            }

            return decimal ? resultado + '.' + decimal : resultado;
        }
    }

    if (!customElements.get('luthier-stats')) {
        customElements.define('luthier-stats', LuthierStats);
    }

    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierStats = LuthierStats;

})(typeof window !== 'undefined' ? window : this);
