/**
 * LuthierDate - Utilidades para formateo de fechas
 *
 * Formatea fechas ISO a formatos legibles en espanol.
 *
 * @example
 * LuthierDate.formatoLargo('2024-01-15')   // "15 de enero de 2024"
 * LuthierDate.formatoCorto('2024-01-15')  // "15 ene 2024"
 * LuthierDate.formatoRelativo('2024-01-15') // "hace 3 dias"
 */
(function(global) {
    'use strict';

    var LuthierDate = {

        /**
         * Formatea una fecha ISO con las opciones de locale dadas.
         * Centraliza el try/catch para todos los formatos basados en toLocaleDateString.
         * @private
         */
        _formatearConLocale: function(fechaISO, opciones) {
            if (!fechaISO) return '';
            try {
                var fecha = this._parsearFecha(fechaISO);
                return fecha.toLocaleDateString('es-CO', opciones);
            } catch (e) {
                return fechaISO;
            }
        },

        /** Formato largo: "15 de enero de 2024" */
        formatoLargo: function(fechaISO) {
            return this._formatearConLocale(fechaISO, { year: 'numeric', month: 'long', day: 'numeric' });
        },

        /** Formato corto: "15 ene 2024" */
        formatoCorto: function(fechaISO) {
            return this._formatearConLocale(fechaISO, { year: 'numeric', month: 'short', day: 'numeric' });
        },

        /** Formato numerico: "15/01/2024" */
        formatoNumerico: function(fechaISO) {
            return this._formatearConLocale(fechaISO, { year: 'numeric', month: '2-digit', day: '2-digit' });
        },

        /**
         * Formato relativo: "hace 3 dias", "hace 2 semanas"
         * @param {string} fechaISO - Fecha en formato ISO
         * @returns {string} Fecha relativa
         */
        formatoRelativo: function(fechaISO) {
            if (!fechaISO) return '';

            try {
                var fecha = this._parsearFecha(fechaISO);
                var ahora = new Date();
                var diff = ahora.getTime() - fecha.getTime();

                // Diferencias en milisegundos
                var segundos = Math.floor(diff / 1000);
                var minutos = Math.floor(segundos / 60);
                var horas = Math.floor(minutos / 60);
                var dias = Math.floor(horas / 24);
                var semanas = Math.floor(dias / 7);
                var meses = Math.floor(dias / 30);
                var anios = Math.floor(dias / 365);

                // Futuro
                if (diff < 0) {
                    return this.formatoCorto(fechaISO);
                }

                // Pasado
                if (segundos < 60) {
                    return 'hace un momento';
                } else if (minutos < 60) {
                    return 'hace ' + minutos + (minutos === 1 ? ' minuto' : ' minutos');
                } else if (horas < 24) {
                    return 'hace ' + horas + (horas === 1 ? ' hora' : ' horas');
                } else if (dias < 7) {
                    return 'hace ' + dias + (dias === 1 ? ' dia' : ' dias');
                } else if (semanas < 4) {
                    return 'hace ' + semanas + (semanas === 1 ? ' semana' : ' semanas');
                } else if (meses < 12) {
                    return 'hace ' + meses + (meses === 1 ? ' mes' : ' meses');
                } else {
                    return 'hace ' + anios + (anios === 1 ? ' ano' : ' anos');
                }
            } catch (e) {
                return fechaISO;
            }
        },

        /** Formato con dia de la semana: "lunes, 15 de enero de 2024" */
        formatoConDia: function(fechaISO) {
            return this._formatearConLocale(fechaISO, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        },

        /**
         * Solo hora: "14:30"
         * @param {string} fechaISO - Fecha/hora en formato ISO
         * @returns {string} Hora formateada
         */
        formatoHora: function(fechaISO) {
            if (!fechaISO) return '';

            try {
                var fecha = new Date(fechaISO);

                return fecha.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return '';
            }
        },

        /**
         * Fecha y hora: "15 ene 2024, 14:30"
         * @param {string} fechaISO - Fecha/hora en formato ISO
         * @returns {string} Fecha y hora formateadas
         */
        formatoFechaHora: function(fechaISO) {
            if (!fechaISO) return '';

            try {
                var fecha = new Date(fechaISO);

                return fecha.toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return fechaISO;
            }
        },

        /**
         * Diferencia entre dos fechas en dias
         * @param {string} fecha1 - Primera fecha ISO
         * @param {string} fecha2 - Segunda fecha ISO (default: hoy)
         * @returns {number} Diferencia en dias
         */
        diferenciaDias: function(fecha1, fecha2) {
            try {
                var d1 = this._parsearFecha(fecha1);
                var d2 = fecha2 ? this._parsearFecha(fecha2) : new Date();

                var diff = d2.getTime() - d1.getTime();
                return Math.floor(diff / (1000 * 60 * 60 * 24));
            } catch (e) {
                return 0;
            }
        },

        /**
         * Verifica si una fecha es hoy
         * @param {string} fechaISO - Fecha en formato ISO
         * @returns {boolean}
         */
        esHoy: function(fechaISO) {
            try {
                var fecha = this._parsearFecha(fechaISO);
                var hoy = new Date();

                return fecha.getDate() === hoy.getDate() &&
                       fecha.getMonth() === hoy.getMonth() &&
                       fecha.getFullYear() === hoy.getFullYear();
            } catch (e) {
                return false;
            }
        },

        /**
         * Verifica si una fecha es de este ano
         * @param {string} fechaISO - Fecha en formato ISO
         * @returns {boolean}
         */
        esEsteAno: function(fechaISO) {
            try {
                var fecha = this._parsearFecha(fechaISO);
                var hoy = new Date();

                return fecha.getFullYear() === hoy.getFullYear();
            } catch (e) {
                return false;
            }
        },

        /**
         * Formato flexible para fechas parciales: YYYY, YYYY-MM o YYYY-MM-DD
         * @param {string} fechaStr - Fecha completa o parcial
         * @returns {string} Fecha formateada
         */
        formatoFlexible: function(fechaStr) {
            if (!fechaStr) return '';

            var partes = String(fechaStr).split('-');
            var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                         'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

            if (partes.length === 1) {
                return partes[0];
            } else if (partes.length === 2) {
                var mes = parseInt(partes[1], 10) - 1;
                return meses[mes] + ' ' + partes[0];
            }

            return this.formatoLargo(fechaStr);
        },

        /**
         * Parsea fecha ISO evitando problemas de timezone
         * @private
         */
        _parsearFecha: function(fechaISO) {
            // Si es solo fecha (YYYY-MM-DD), agregar T00:00:00 para evitar
            // que se interprete como UTC
            if (/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) {
                return new Date(fechaISO + 'T00:00:00');
            }
            return new Date(fechaISO);
        }
    };

    // Exponer globalmente
    global.LuthierDate = LuthierDate;

})(typeof window !== 'undefined' ? window : this);
