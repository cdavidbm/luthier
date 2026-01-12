/**
 * Registro de paginas del sitio
 *
 * LuthierDevTools usa esta lista para validar enlaces rotos
 * y detectar paginas huerfanas (sin enlace en el menu).
 *
 * Mantener actualizado al agregar nuevas paginas.
 */
window.LUTHIER_PAGES = [
    { slug: 'index.html', titulo: 'Inicio', enMenu: true },
    { slug: 'paginas/nosotros.html', titulo: 'Nosotros', enMenu: true },
    { slug: 'paginas/servicios/servicio-a.html', titulo: 'Servicio A', enMenu: true },
    { slug: 'paginas/servicios/servicio-b.html', titulo: 'Servicio B', enMenu: true },
    { slug: 'paginas/contacto.html', titulo: 'Contacto', enMenu: true },
    { slug: 'paginas/privacidad.html', titulo: 'Politica de Privacidad', enMenu: false },
    { slug: 'paginas/terminos.html', titulo: 'Terminos de Uso', enMenu: false },
    { slug: 'mapa-del-sitio.html', titulo: 'Mapa del Sitio', enMenu: false }
];
