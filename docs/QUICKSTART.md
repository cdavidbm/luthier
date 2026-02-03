# Guía de Inicio Rápido

Esta guía te llevará paso a paso desde cero hasta tener un sitio web funcional con Luthier.

---

## Iniciar un Proyecto Web

### Preparar la Estructura de Carpetas

Copia la carpeta `luthier/` a tu proyecto. La estructura recomendada es:

```
mi-sitio-web/
├── index.html               # Página principal
├── config/                  # Configuración (viene con Luthier)
│   ├── sitio.js            # LUTHIER_CONFIG (menú, contacto, etc.)
│   └── pages.js            # LUTHIER_PAGES (registro de páginas)
├── paginas/                 # Tus páginas organizadas por sección
│   ├── nosotros.html
│   ├── contacto.html
│   └── servicios/
│       ├── servicio-a.html
│       └── servicio-b.html
├── styles/                  # CSS de Luthier
│   ├── tokens.css
│   ├── reset.css
│   ├── componentes.css
│   └── utilities.css
├── dist/                    # Bundle de Luthier
│   └── luthier.bundle.js
└── assets/
    ├── img/                 # Tus imágenes
    ├── documentos/          # PDFs y archivos
    └── css/
        └── mi-tema.css      # Personalizaciones (opcional)
```

**Ventaja:** Un cambio en `config/sitio.js` actualiza el menú en TODAS las páginas automáticamente

---

### Crear el Archivo de Configuración

Crea un archivo `config.js` para centralizar la configuración del sitio:

```javascript
window.LUTHIER_CONFIG = {
    sitio: {
        nombre: 'Mi Organización',
        nombreCompleto: 'Sitio Web Oficial de Mi Organización',
        logo: 'assets/logos/logo.png'
    },
    menu: [
        { nombre: 'Inicio', slug: 'index.html' },
        { nombre: 'Nosotros', slug: 'nosotros.html' },
        { nombre: 'Servicios', slug: '#', submenu: [
            { nombre: 'Servicio A', slug: 'servicio-a.html' },
            { nombre: 'Servicio B', slug: 'servicio-b.html' }
        ]},
        { nombre: 'Contacto', slug: 'contacto.html' }
    ],
    contacto: {
        direccion: 'Calle Principal 123',
        ciudad: 'Ciudad, País',
        telefono: '+1 234 567 8900',
        email: 'info@miorganizacion.com'
    },
    redesSociales: [
        { nombre: 'Facebook', url: 'https://facebook.com/miorg' },
        { nombre: 'Twitter', url: 'https://twitter.com/miorg' }
    ],
    enlacesFooter: [
        { nombre: 'Política de Privacidad', slug: 'privacidad.html' },
        { nombre: 'Términos de Uso', slug: 'terminos.html' }
    ]
};
```

---

### Registro de Páginas (Opcional)

Para proyectos grandes, crea un archivo `config/pages.js` que registre todas las páginas del sitio. Esto permite a `<luthier-dev-tools>` detectar:

- Enlaces rotos en el menú
- Páginas huérfanas (sin enlace)
- Páginas pendientes por crear

```javascript
window.LUTHIER_PAGES = [
    {
        slug: 'index.html',
        titulo: 'Inicio',
        descripcion: 'Página principal del sitio',
        enMenu: true
    },
    {
        slug: 'paginas/seccion-a/pagina-1.html',
        titulo: 'Página 1',
        descripcion: 'Descripción de la página',
        enMenu: true
    }
    // Agregar todas las páginas del sitio
];
```

**Campos:**

| Campo | Descripción |
|-------|-------------|
| `slug` | Ruta relativa desde la raíz del sitio |
| `titulo` | Título de la página |
| `descripcion` | Descripción breve (para SEO y validación) |
| `enMenu` | `true` si la página aparece en el menú |

---

### Crear la Página Principal

Crea tu archivo `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Sitio Web</title>

    <!-- Estilos de Luthier -->
    <link rel="stylesheet" href="styles/tokens.css">
    <link rel="stylesheet" href="styles/reset.css">
    <link rel="stylesheet" href="styles/componentes.css">
    <link rel="stylesheet" href="styles/utilities.css">

    <!-- Configuración (SIEMPRE antes de luthier.bundle.js) -->
    <script src="config/sitio.js"></script>
    <script src="config/pages.js"></script>

    <!-- Luthier -->
    <script src="dist/luthier.bundle.js"></script>
</head>
<body>

    <luthier-layout titulo="Inicio">
        <h1>Bienvenido a Mi Organización</h1>
        <p>Este es el contenido de la página principal.</p>

        <section>
            <h2>Nuestros Servicios</h2>
            <p>Ofrecemos soluciones de calidad.</p>
        </section>
    </luthier-layout>

    <luthier-a11y-widget></luthier-a11y-widget>
    <luthier-dev-tools></luthier-dev-tools>

</body>
</html>
```

**Nota:** Para proyectos simples con un solo `config.js`, usa:

```html
<script src="config.js"></script>
```

---

### Verificar que Funciona

Abre el archivo `index.html` con doble clic (protocolo `file:///`)

Deberías ver tu página con header, navegación y footer generados automáticamente.

---

## Crear una Nueva Página

### Plantilla Base

Para páginas en la raíz del sitio:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título de la Página</title>
    <link rel="stylesheet" href="styles/tokens.css">
    <link rel="stylesheet" href="styles/reset.css">
    <link rel="stylesheet" href="styles/componentes.css">
    <link rel="stylesheet" href="styles/utilities.css">
    <script src="config/sitio.js"></script>
    <script src="config/pages.js"></script>
    <script src="dist/luthier.bundle.js"></script>
</head>
<body>

    <luthier-layout titulo="Título de la Página">
        <!-- Tu contenido aquí -->
    </luthier-layout>

    <luthier-a11y-widget></luthier-a11y-widget>
    <luthier-dev-tools></luthier-dev-tools>

</body>
</html>
```

### Plantilla para Páginas en Subcarpetas

Para páginas en `paginas/seccion/mi-pagina.html`, usa `../../` para subir dos niveles:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página - Mi Sitio</title>
    <link rel="stylesheet" href="../../styles/tokens.css">
    <link rel="stylesheet" href="../../styles/reset.css">
    <link rel="stylesheet" href="../../styles/componentes.css">
    <link rel="stylesheet" href="../../styles/utilities.css">
    <script src="../../config/sitio.js"></script>
    <script src="../../config/pages.js"></script>
    <script src="../../dist/luthier.bundle.js"></script>
</head>
<body>

    <luthier-layout titulo="Mi Página" breadcrumb="Inicio > Sección > Mi Página">
        <h1>Mi Página</h1>
        <p>Contenido de la página...</p>
    </luthier-layout>

    <luthier-a11y-widget></luthier-a11y-widget>
    <luthier-dev-tools></luthier-dev-tools>

</body>
</html>
```

**Rutas relativas según profundidad:**

| Ubicación de la página | Prefijo de rutas |
|------------------------|------------------|
| `index.html` (raíz) | `./` o ninguno |
| `paginas/pagina.html` | `../` |
| `paginas/seccion/pagina.html` | `../../` |
| `paginas/seccion/sub/pagina.html` | `../../../` |

---

### Tipos de Páginas

#### Página Simple

```html
<luthier-layout titulo="Acerca de Nosotros" tipo="pagina">
    <h1>Acerca de Nosotros</h1>
    <p>Somos una organización dedicada a...</p>

    <h2>Nuestra Misión</h2>
    <p>Nuestra misión es...</p>
</luthier-layout>
```

---

#### Artículo o Noticia

**Atributos adicionales:**

- `autor` - Nombre del autor
- `fecha` - Fecha en formato ISO (YYYY-MM-DD)

```html
<luthier-layout
    titulo="Nueva Sede Inaugurada"
    tipo="articulo"
    autor="Juan Pérez"
    fecha="2026-01-30">

    <h1>Nueva Sede Inaugurada</h1>
    <p>El pasado lunes inauguramos nuestra nueva sede...</p>

    <figure>
        <img src="assets/imagenes/sede.jpg" alt="Nueva sede">
        <figcaption>Vista frontal de la nueva sede</figcaption>
    </figure>
</luthier-layout>
```

---

#### Página con Sidebar

Usa el slot `sidebar` para agregar una barra lateral:

```html
<luthier-layout titulo="Documentos" tipo="pagina">

    <h1>Centro de Documentos</h1>
    <p>Encuentra aquí todos nuestros documentos oficiales.</p>

    <aside slot="sidebar">
        <h3>Categorías</h3>
        <ul>
            <li><a href="#informes">Informes</a></li>
            <li><a href="#manuales">Manuales</a></li>
            <li><a href="#formularios">Formularios</a></li>
        </ul>
    </aside>

</luthier-layout>
```

---

#### Landing Page

```html
<luthier-layout titulo="Bienvenido" tipo="landing">

    <section class="hero">
        <h1>Transformamos Ideas en Realidad</h1>
        <p>Soluciones innovadoras para tu organización.</p>
        <a href="contacto.html" class="btn btn-primario">Contáctanos</a>
    </section>

    <section>
        <h2>Nuestros Servicios</h2>
        <luthier-card titulo="Consultoría" imagen="assets/imagenes/consultoria.jpg">
            <p>Asesoramiento experto para tu proyecto.</p>
        </luthier-card>
    </section>

</luthier-layout>
```

---

#### Biblioteca de Documentos

Define los documentos en una variable global y usa el componente `luthier-doc-library`:

```html
<script>
    window.DOCUMENTOS = [
        {
            id: 1,
            titulo: 'Informe Anual 2025',
            descripcion: 'Resumen de actividades del año',
            archivo: 'documentos/informe-2025.pdf',
            tipo: 'pdf',
            categoria: 'informes',
            fecha: '2026-01-15',
            tamano: '2.4 MB'
        },
        {
            id: 2,
            titulo: 'Manual de Procedimientos',
            descripcion: 'Guía completa de procesos internos',
            archivo: 'documentos/manual.pdf',
            tipo: 'pdf',
            categoria: 'manuales',
            fecha: '2025-11-20',
            tamano: '5.1 MB'
        }
    ];
</script>
```

```html
<luthier-layout titulo="Biblioteca de Documentos" tipo="documentos">
    <h1>Biblioteca de Documentos</h1>
    <luthier-doc-library></luthier-doc-library>
</luthier-layout>
```

---

### Agregar al Menú

No olvides agregar la nueva página al menú en `config.js`:

```javascript
menu: [
    { nombre: 'Inicio', slug: 'index.html' },
    { nombre: 'Nueva Página', slug: 'nueva-pagina.html' },  // Agregar aquí
    { nombre: 'Contacto', slug: 'contacto.html' }
]
```

---

## Actualizar una Página

### Cambiar Contenido

Edita el HTML dentro de `<luthier-layout>`:

```html
<!-- Antes -->
<luthier-layout titulo="Servicios">
    <h1>Nuestros Servicios</h1>
    <p>Ofrecemos tres servicios principales.</p>
</luthier-layout>

<!-- Después -->
<luthier-layout titulo="Servicios">
    <h1>Nuestros Servicios</h1>
    <p>Ofrecemos cinco servicios principales:</p>
    <ul>
        <li>Consultoría</li>
        <li>Desarrollo</li>
        <li>Capacitación</li>
        <li>Soporte Técnico</li>
        <li>Mantenimiento</li>
    </ul>
</luthier-layout>
```

---

### Cambiar Atributos

**Título:**

```html
<luthier-layout titulo="Nuestros Servicios Profesionales">
```

**Tipo de página:**

```html
<luthier-layout titulo="Blog" tipo="articulo" autor="María García" fecha="2026-02-01">
```

**Breadcrumbs:**

```html
<luthier-layout titulo="Servicio A" breadcrumb="Inicio > Servicios > Servicio A">
```

---

### Agregar Componentes

#### Tarjetas

```html
<div class="grid">
    <luthier-card
        titulo="Juan Pérez"
        imagen="assets/imagenes/juan.jpg"
        enlace="equipo/juan.html">
        <p>Director General</p>
        <span slot="badge">CEO</span>
    </luthier-card>

    <luthier-card
        titulo="María García"
        imagen="assets/imagenes/maria.jpg"
        enlace="equipo/maria.html">
        <p>Directora de Operaciones</p>
        <span slot="badge">COO</span>
    </luthier-card>
</div>
```

---

#### Acordeón (FAQ)

```html
<luthier-accordion>
    <div data-titulo="¿Cómo puedo contactarlos?">
        <p>Puede contactarnos por email a info@ejemplo.com
           o llamando al +1 234 567 8900.</p>
    </div>

    <div data-titulo="¿Cuál es el horario de atención?">
        <p>Nuestro horario es de lunes a viernes,
           de 8:00 AM a 5:00 PM.</p>
    </div>

    <div data-titulo="¿Ofrecen servicios en línea?">
        <p>Sí, ofrecemos todos nuestros servicios
           tanto presencial como en línea.</p>
    </div>
</luthier-accordion>
```

---

#### Pestañas

```html
<luthier-tabs>
    <div data-tab="Software">
        <h2>Soluciones de Software</h2>
        <p>Desarrollamos aplicaciones a medida...</p>
    </div>

    <div data-tab="Hardware">
        <h2>Equipos y Hardware</h2>
        <p>Ofrecemos equipos de alta calidad...</p>
    </div>

    <div data-tab="Servicios">
        <h2>Servicios Profesionales</h2>
        <p>Nuestro equipo de expertos...</p>
    </div>
</luthier-tabs>
```

---

### Cambiar Configuración Global

Edita `config.js` para cambios que afectan todo el sitio:

**Cambiar logo:**

```javascript
sitio: {
    nombre: 'Mi Organización',
    logo: 'assets/logos/nuevo-logo.png'
}
```

**Agregar item al menú:**

```javascript
menu: [
    { nombre: 'Inicio', slug: 'index.html' },
    { nombre: 'Blog', slug: 'blog.html' },  // Nuevo
    { nombre: 'Contacto', slug: 'contacto.html' }
]
```

**Agregar submenú:**

```javascript
menu: [
    { nombre: 'Inicio', slug: 'index.html' },
    { nombre: 'Servicios', slug: '#', submenu: [
        { nombre: 'Consultoría', slug: 'consultoria.html' },
        { nombre: 'Desarrollo', slug: 'desarrollo.html' },
        { nombre: 'Soporte', slug: 'soporte.html' }
    ]},
    { nombre: 'Contacto', slug: 'contacto.html' }
]
```

---

## Ejemplo Completo

### Estructura del Proyecto

```
mi-empresa/
├── index.html
├── servicios.html
├── nosotros.html
├── contacto.html
├── config.js
├── luthier/
└── assets/
    ├── imagenes/
    └── logos/
```

---

### config.js

```javascript
window.LUTHIER_CONFIG = {
    sitio: {
        nombre: 'Mi Empresa',
        nombreCompleto: 'Mi Empresa S.A. - Soluciones Tecnológicas',
        logo: 'assets/logos/logo.png'
    },
    menu: [
        { nombre: 'Inicio', slug: 'index.html' },
        { nombre: 'Servicios', slug: 'servicios.html' },
        { nombre: 'Nosotros', slug: 'nosotros.html' },
        { nombre: 'Contacto', slug: 'contacto.html' }
    ],
    contacto: {
        direccion: 'Av. Tecnología 456',
        ciudad: 'Ciudad Tech, CT 12345',
        telefono: '+1 800 123 4567',
        email: 'hola@miempresa.com',
        horario: 'Lun-Vie 9am-6pm'
    },
    redesSociales: [
        { nombre: 'LinkedIn', url: 'https://linkedin.com/company/miempresa' },
        { nombre: 'Twitter', url: 'https://twitter.com/miempresa' },
        { nombre: 'GitHub', url: 'https://github.com/miempresa' }
    ],
    enlacesFooter: [
        { nombre: 'Privacidad', slug: 'privacidad.html' },
        { nombre: 'Términos', slug: 'terminos.html' }
    ]
};
```

---

### index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Empresa - Inicio</title>
    <link rel="stylesheet" href="luthier/styles/tokens.css">
    <link rel="stylesheet" href="luthier/styles/reset.css">
    <link rel="stylesheet" href="luthier/styles/componentes.css">
    <script src="config.js"></script>
    <script src="luthier/dist/luthier.bundle.js"></script>
</head>
<body>
    <luthier-layout titulo="Inicio" tipo="landing">
        <h1>Bienvenido a Mi Empresa</h1>
        <p>Somos líderes en soluciones tecnológicas.</p>

        <section>
            <h2>Lo que Hacemos</h2>
            <div class="grid">
                <luthier-card titulo="Desarrollo Web" enlace="servicios.html#web">
                    <p>Creamos sitios web modernos y accesibles.</p>
                </luthier-card>
                <luthier-card titulo="Consultoría" enlace="servicios.html#consultoria">
                    <p>Asesoramos en transformación digital.</p>
                </luthier-card>
            </div>
        </section>
    </luthier-layout>
    <luthier-a11y-widget></luthier-a11y-widget>
</body>
</html>
```

---

### servicios.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servicios - Mi Empresa</title>
    <link rel="stylesheet" href="luthier/styles/tokens.css">
    <link rel="stylesheet" href="luthier/styles/reset.css">
    <link rel="stylesheet" href="luthier/styles/componentes.css">
    <script src="config.js"></script>
    <script src="luthier/dist/luthier.bundle.js"></script>
</head>
<body>
    <luthier-layout titulo="Servicios" breadcrumb="Inicio > Servicios">
        <h1>Nuestros Servicios</h1>

        <luthier-tabs>
            <div data-tab="Desarrollo">
                <h2 id="web">Desarrollo Web</h2>
                <p>Creamos sitios web responsivos y accesibles.</p>
                <ul>
                    <li>Sitios corporativos</li>
                    <li>Portales institucionales</li>
                    <li>Bibliotecas digitales</li>
                </ul>
            </div>

            <div data-tab="Consultoría">
                <h2 id="consultoria">Consultoría TI</h2>
                <p>Asesoramos en la mejor estrategia tecnológica.</p>
            </div>

            <div data-tab="Soporte">
                <h2>Soporte Técnico</h2>
                <p>Mantenemos tus sistemas funcionando.</p>
            </div>
        </luthier-tabs>
    </luthier-layout>
    <luthier-a11y-widget></luthier-a11y-widget>
</body>
</html>
```

---

### nosotros.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nosotros - Mi Empresa</title>
    <link rel="stylesheet" href="luthier/styles/tokens.css">
    <link rel="stylesheet" href="luthier/styles/reset.css">
    <link rel="stylesheet" href="luthier/styles/componentes.css">
    <script src="config.js"></script>
    <script src="luthier/dist/luthier.bundle.js"></script>
</head>
<body>
    <luthier-layout titulo="Nosotros" breadcrumb="Inicio > Nosotros">
        <h1>Sobre Nosotros</h1>

        <section>
            <h2>Nuestra Historia</h2>
            <p>Fundados en 2020, hemos crecido hasta convertirnos
               en referentes del sector tecnológico.</p>
        </section>

        <section>
            <h2>Nuestro Equipo</h2>
            <div class="grid">
                <luthier-card titulo="Ana Martínez" imagen="assets/imagenes/ana.jpg">
                    <p>CEO y Fundadora</p>
                </luthier-card>
                <luthier-card titulo="Carlos López" imagen="assets/imagenes/carlos.jpg">
                    <p>Director Técnico</p>
                </luthier-card>
            </div>
        </section>
    </luthier-layout>
    <luthier-a11y-widget></luthier-a11y-widget>
</body>
</html>
```

---

### contacto.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contacto - Mi Empresa</title>
    <link rel="stylesheet" href="luthier/styles/tokens.css">
    <link rel="stylesheet" href="luthier/styles/reset.css">
    <link rel="stylesheet" href="luthier/styles/componentes.css">
    <script src="config.js"></script>
    <script src="luthier/dist/luthier.bundle.js"></script>
</head>
<body>
    <luthier-layout titulo="Contacto" breadcrumb="Inicio > Contacto">
        <h1>Contáctenos</h1>

        <section>
            <h2>Información de Contacto</h2>
            <ul>
                <li><strong>Email:</strong> hola@miempresa.com</li>
                <li><strong>Teléfono:</strong> +1 800 123 4567</li>
                <li><strong>Dirección:</strong> Av. Tecnología 456</li>
            </ul>
        </section>

        <section>
            <h2>Horario de Atención</h2>
            <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            <p>Sábados: 9:00 AM - 1:00 PM</p>
        </section>

        <aside slot="sidebar">
            <h3>Redes Sociales</h3>
            <ul>
                <li><a href="https://linkedin.com/company/miempresa">LinkedIn</a></li>
                <li><a href="https://twitter.com/miempresa">Twitter</a></li>
                <li><a href="https://github.com/miempresa">GitHub</a></li>
            </ul>
        </aside>
    </luthier-layout>
    <luthier-a11y-widget></luthier-a11y-widget>
</body>
</html>
```

---

## Recursos Adicionales

- [Componentes](COMPONENTS.md) - Referencia de todos los componentes
- [Arquitectura](ARCHITECTURE.md) - Detalles técnicos del toolkit
- [Variables CSS](https://github.com/cdavidbm/luthier/blob/main/styles/tokens.css) - Personalización de estilos

---

## Consejos

1. **Usa un archivo `config.js` separado** para no repetir la configuración
2. **Mantén la estructura de carpetas organizada** (assets, documentos, etc.)
3. **Prueba siempre con doble clic** antes de subir a producción
4. **Personaliza los colores** en un archivo `css/tema.css` después de `tokens.css`
5. **El widget de accesibilidad es opcional** pero muy recomendado

---

## Sitio CMS-Ready (Opcional)

Si necesitas que editores no-técnicos puedan gestionar el contenido, puedes integrar un CMS Headless como Sveltia CMS.

### Estructura para CMS

```
mi-sitio/
├── index.html
├── articulo.html           # Template para artículos
├── admin/
│   ├── index.html          # Cargador del CMS
│   └── config.yml          # Configuración de colecciones
└── content/
    ├── posts/
    │   ├── index.json      # Índice (necesario para file:///)
    │   ├── articulo-1.md
    │   └── articulo-2.md
    └── paginas/
        └── acerca.md
```

### Cargar Contenido Markdown

```html
<!-- Cargar colección de posts -->
<luthier-content
    collection="content/posts"
    ordenar="date"
    orden="desc"
    export-to="POSTS">
</luthier-content>

<!-- Iterar y mostrar -->
<luthier-loop source="POSTS" template="card"></luthier-loop>
```

### Generar Índice

Para que el sitio funcione con `file:///`, cada carpeta de contenido necesita un `index.json`:

```bash
node tools/generate-index.js content/posts
```

### Documentación Completa

Ver [CMS-INTEGRATION.md](CMS-INTEGRATION.md) para la guía completa.

### Ejemplo Funcional

Ver la carpeta `ejemplos/` para sitios completos de referencia.
