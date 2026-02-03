# Luthier v1.4.1

Toolkit de Web Components para sitios estáticos. Compatible con protocolo `file:///`.

## Características

- **Sin servidor**: Funciona con doble clic en el archivo HTML
- **Sin dependencias**: Cero npm, cero bundlers
- **Sin build step**: Solo HTML, CSS y JavaScript vanilla
- **Accesible**: ARIA, navegación por teclado, alto contraste
- **Personalizable**: Sistema de variables CSS

## Instalación

1. Descarga o clona el [repositorio](https://github.com/cdavidbm/luthier)
2. Copia la carpeta `luthier/` a tu proyecto
3. Listo para usar

## Uso Básico

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Estilos de Luthier -->
    <link rel="stylesheet" href="luthier/styles/tokens.css">
    <link rel="stylesheet" href="luthier/styles/reset.css">
    <link rel="stylesheet" href="luthier/styles/componentes.css">

    <!-- Configuración del sitio (ANTES de cargar Luthier) -->
    <script>
        window.LUTHIER_CONFIG = {
            sitio: {
                nombre: 'Mi Sitio',
                nombreCompleto: 'Descripción de mi sitio'
            },
            menu: [
                { nombre: 'Inicio', slug: 'index.html' },
                { nombre: 'Acerca', slug: 'acerca.html' }
            ],
            contacto: {
                email: 'contacto@ejemplo.com'
            }
        };
    </script>

    <!-- Luthier Bundle -->
    <script src="luthier/dist/luthier.bundle.js"></script>
</head>
<body>

    <luthier-layout titulo="Mi Página">
        <h1>Bienvenido</h1>
        <p>Contenido de la página...</p>
    </luthier-layout>

</body>
</html>
```

## Estructura de Archivos

```
luthier/
├── config/             # Plantillas de configuración
│   ├── sitio.js        # LUTHIER_CONFIG (menú, contacto, redes)
│   └── pages.js        # LUTHIER_PAGES (registro de páginas)
├── core/               # Cargador principal
│   └── luthier.js
├── ui/                 # Componentes
│   ├── layout/         # LuthierHeader, LuthierFooter, LuthierLayout, LuthierSidebar
│   ├── navigation/     # LuthierNav, LuthierBreadcrumbs
│   ├── content/        # LuthierCard, LuthierLoop, LuthierAccordion, LuthierTabs, LuthierCarousel, LuthierMarkdown, LuthierTimeline, LuthierGallery, LuthierTeam, LuthierToc, LuthierAlert, LuthierBackToTop, LuthierStats, LuthierQuote, LuthierEmbed, LuthierBlog, LuthierSearch
│   ├── documents/      # LuthierDocLibrary, LuthierDocCard
│   └── accessibility/  # LuthierA11yWidget
├── data/               # Utilidades de datos
│   ├── data-mapper.js
│   ├── search-engine.js
│   └── date-formatter.js
├── styles/             # CSS
│   ├── tokens.css      # Variables CSS
│   ├── reset.css       # Normalización
│   ├── componentes.css # Estilos de componentes
│   └── utilities.css   # Clases utilitarias
├── dist/               # Bundle para producción
│   └── luthier.bundle.js
├── tools/              # Herramientas de desarrollo
│   ├── build-bundle.js # Generador de bundle
│   └── validate-site.js
├── themes/             # Temas predefinidos
├── ejemplos/           # Ejemplos de uso
└── docs/               # Documentación
```

## Componentes

Luthier tiene dos tipos de componentes: los que estructuran el sitio y los que presentan contenido.

### Estructura (requeridos)

Estos componentes evitan repetir código entre archivos HTML:

- `<luthier-layout>` - Contenedor de página. Genera header, nav y footer automáticamente.
- `<luthier-nav>` - Menú de navegación. Lee de `LUTHIER_CONFIG.menu`.
- `<luthier-header>` - Cabecera con logo y nombre.
- `<luthier-footer>` - Pie con contacto y enlaces.

Layout y Nav son los más importantes: centralizan lo que de otro modo habría que duplicar en cada archivo.

### Contenido (opcionales)

Componentes para presentar información. Puedes usar HTML plano en su lugar.

- `<luthier-card>` - Tarjeta
- `<luthier-loop>` - Iterador de listas
- `<luthier-accordion>` - Acordeón
- `<luthier-tabs>` - Pestañas horizontales
- `<luthier-tabs-vertical>` - Pestañas verticales
- `<luthier-carousel>` - Carrusel
- `<luthier-markdown>` - Renderizador de Markdown
- `<luthier-timeline>` - Línea de tiempo
- `<luthier-gallery>` - Galería con lightbox
- `<luthier-team>` - Equipo/personal
- `<luthier-toc>` - Tabla de contenidos
- `<luthier-alert>` - Alertas y avisos
- `<luthier-back-to-top>` - Botón volver arriba
- `<luthier-stats>` - Contadores animados
- `<luthier-quote>` - Citas/testimonios
- `<luthier-embed>` - Videos responsivos
- `<luthier-blog>` - Lista de posts
- `<luthier-search>` - Búsqueda del sitio
- `<luthier-doc-library>` - Biblioteca de documentos
- `<luthier-doc-card>` - Tarjeta de documento
- `<luthier-sidebar>` - Barra lateral
- `<luthier-breadcrumbs>` - Migas de pan
- `<luthier-a11y-widget>` - Opciones de accesibilidad

## Configuración

La configuración se define en `window.LUTHIER_CONFIG`:

```javascript
window.LUTHIER_CONFIG = {
    sitio: {
        nombre: 'Nombre Corto',
        nombreCompleto: 'Nombre Completo del Sitio',
        logo: 'ruta/al/logo.png',
        logoSecundario: 'ruta/al/logo-secundario.png' // Opcional, logo adicional
    },
    menu: [
        { nombre: 'Inicio', slug: 'index.html' },
        { nombre: 'Sección', slug: '#', submenu: [
            { nombre: 'Subsección 1', slug: 'sub1.html' },
            { nombre: 'Subsección 2', slug: 'sub2.html' }
        ]},
        { nombre: 'Externo', url: 'https://ejemplo.com', externo: true }
    ],
    contacto: {
        direccion: 'Av. Principal 123',
        ciudad: 'Ciudad, País',
        telefono: '+00 123 456 7890',
        email: 'contacto@ejemplo.com',
        horario: 'Lun-Vie 8am-5pm'
    },
    redesSociales: [
        { nombre: 'Twitter', url: 'https://twitter.com/ejemplo' },
        { nombre: 'Facebook', url: 'https://facebook.com/ejemplo' }
    ],
    enlacesFooter: [
        { nombre: 'Política de Privacidad', slug: 'privacidad.html' },
        { nombre: 'Términos', slug: 'terminos.html' }
    ]
};
```

## Personalización

Sobrescribe las variables CSS en tu archivo de tema:

```css
:root {
    --l-color-primario: #your-color;
    --l-color-secundario: #another-color;
    --l-fuente-principal: 'Tu Fuente', sans-serif;
}
```

Ver `styles/tokens.css` para todas las variables disponibles.

## Compatibilidad

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Licencia

MIT
