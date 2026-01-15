/**
 * LuthierUtils - Funciones utilitarias compartidas
 * Sanitizacion HTML, validacion de URLs y helpers comunes
 */
(function(global) {
    'use strict';

    var LuthierUtils = {

        /**
         * Escapa caracteres HTML para prevenir XSS
         * @param {*} valor - Valor a escapar
         * @returns {string} Valor escapado
         */
        escaparHTML: function(valor) {
            if (typeof valor === 'string') {
                return valor
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            } else if (Array.isArray(valor)) {
                var self = this;
                return valor.map(function(v) {
                    return self.escaparHTML(String(v));
                }).join(', ');
            } else if (valor === null || valor === undefined) {
                return '';
            }
            return String(valor);
        },

        /**
         * Sanitiza URLs para prevenir javascript: y data: injection
         * @param {string} url - URL a sanitizar
         * @returns {string} URL segura o '#' si es peligrosa
         */
        sanitizarURL: function(url) {
            if (!url || typeof url !== 'string') return '#';
            var urlLower = url.toLowerCase().trim();
            if (urlLower.startsWith('javascript:') || urlLower.startsWith('data:text/html')) {
                return '#';
            }
            return url;
        },

        /**
         * Retorna icono y metadatos visuales segun tipo de documento
         * @param {string} tipo - Extension del archivo (pdf, xlsx, docx, etc.)
         * @returns {Object} { icono, clase, color }
         */
        obtenerIconoDocumento: function(tipo) {
            var iconos = {
                'pdf': { icono: '&#128196;', clase: 'pdf', color: '#dc3545' },
                'xlsx': { icono: '&#128200;', clase: 'xlsx', color: '#28a745' },
                'xls': { icono: '&#128200;', clase: 'xls', color: '#28a745' },
                'docx': { icono: '&#128221;', clase: 'docx', color: '#0d6efd' },
                'doc': { icono: '&#128221;', clase: 'doc', color: '#0d6efd' },
                'pptx': { icono: '&#128253;', clase: 'pptx', color: '#fd7e14' },
                'ppt': { icono: '&#128253;', clase: 'ppt', color: '#fd7e14' }
            };
            var tipoNorm = (tipo || '').toLowerCase();
            return iconos[tipoNorm] || { icono: '&#128193;', clase: 'default', color: '#6c757d' };
        }
    };

    global.LuthierUtils = LuthierUtils;

})(typeof window !== 'undefined' ? window : this);
