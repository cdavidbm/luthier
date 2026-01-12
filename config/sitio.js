/**
 * Configuracion del sitio
 *
 * Este archivo contiene la configuracion global que se aplica
 * a todas las paginas del sitio.
 *
 * IMPORTANTE: Cargar ANTES de luthier.bundle.js
 */
window.LUTHIER_CONFIG = {

    // === Informacion del Sitio ===
    sitio: {
        nombre: 'Mi Sitio',
        nombreCompleto: 'Nombre Completo de Mi Sitio',
        logo: 'assets/img/logo.png'
        // logoSecundario: 'assets/img/logo-secundario.png' // Opcional
        // favicon: 'assets/img/favicon.ico'               // Opcional
    },

    // === Menu de Navegacion ===
    menu: [
        { nombre: 'Inicio', slug: 'index.html' },
        { nombre: 'Nosotros', slug: 'paginas/nosotros.html' },
        { nombre: 'Servicios', slug: '#', submenu: [
            { nombre: 'Servicio A', slug: 'paginas/servicios/servicio-a.html' },
            { nombre: 'Servicio B', slug: 'paginas/servicios/servicio-b.html' }
        ]},
        { nombre: 'Contacto', slug: 'paginas/contacto.html' }
        // Para enlaces externos usar: { nombre: 'Externo', url: 'https://ejemplo.com', externo: true }
    ],

    // === Informacion de Contacto ===
    contacto: {
        // Ubicacion
        direccion: 'Calle Principal 123',
        ciudad: 'Ciudad, Pais',
        codigoPostal: '00000',                    // Opcional

        // Telefonos
        telefono: '+1 234 567 8900',
        telefonoSecundario: '',                   // Opcional: linea adicional, soporte, etc.
        whatsapp: '',                             // Opcional: numero con codigo de pais

        // Digital
        email: 'contacto@misitio.com',
        emailSoporte: '',                         // Opcional

        // Horarios
        horario: 'Lunes a Viernes 8am - 5pm',
        horarioFinesDesemana: ''                  // Opcional
    },

    // === Informacion Legal (opcional) ===
    // legal: {
    //     nombreLegal: 'Razon Social Completa S.A.',
    //     identificacion: '123456789-0',           // NIT, RUC, RFC, CUIT, etc.
    //     registroMercantil: '',
    //     licencia: ''
    // },

    // === Redes Sociales ===
    redesSociales: [
        { nombre: 'Facebook', url: 'https://facebook.com/misitio' },
        { nombre: 'Twitter', url: 'https://twitter.com/misitio' },
        { nombre: 'Instagram', url: 'https://instagram.com/misitio' }
        // { nombre: 'LinkedIn', url: '' },
        // { nombre: 'YouTube', url: '' },
        // { nombre: 'TikTok', url: '' }
    ],

    // === Enlaces del Footer ===
    enlacesFooter: [
        { nombre: 'Politica de Privacidad', slug: 'paginas/privacidad.html' },
        { nombre: 'Terminos de Uso', slug: 'paginas/terminos.html' },
        { nombre: 'Mapa del Sitio', slug: 'mapa-del-sitio.html' }
    ]

    // === Texto de Copyright (opcional) ===
    // copyright: '© 2026 Mi Organizacion. Todos los derechos reservados.'

    // === Metadatos SEO (opcional) ===
    // seo: {
    //     descripcion: 'Descripcion del sitio para motores de busqueda',
    //     palabrasClave: 'palabra1, palabra2, palabra3',
    //     autor: 'Nombre del autor o organizacion',
    //     idioma: 'es'
    // }
};
