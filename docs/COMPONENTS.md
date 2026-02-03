# API de Componentes

Los componentes se dividen en dos grupos:

- **Estructura**: `luthier-layout`, `luthier-nav`, `luthier-header`, `luthier-footer`. Centralizan la estructura del sitio.
- **Contenido**: El resto. Opcionales, puedes usar HTML plano en su lugar.

---

## Estructura

### luthier-layout

Contenedor de página. Genera header, nav y footer automáticamente.

**Atributos:**

- `titulo` (string, default: "Sin título") - Título de la página (actualiza document.title)
- `tipo` (string, default: "pagina") - Tipo de layout: pagina, landing, articulo, documentos
- `breadcrumb` (string) - Ruta de breadcrumb (ej: "Inicio > Sección")
- `autor` (string) - Autor (solo para tipo="articulo")
- `fecha` (string) - Fecha ISO (solo para tipo="articulo")
- `manual` (boolean, default: false) - Modo manual (no genera componentes automáticos)
- `sin-header` (boolean, default: false) - Omite header automático
- `sin-nav` (boolean, default: false) - Omite navegación automática
- `sin-footer` (boolean, default: false) - Omite footer automático
- `sin-breadcrumb` (boolean, default: false) - Omite breadcrumb

**Slots:**

- `header` - Reemplaza el header
- `nav` - Reemplaza la navegación
- `breadcrumb` - Reemplaza el breadcrumb
- `contenido` - Contenido principal explícito
- `sidebar` - Barra lateral (activa grid de 2 columnas)
- `footer` - Reemplaza el footer

**Ejemplo:**

```html
<luthier-layout titulo="Mi Página" tipo="articulo" autor="Juan" fecha="2024-01-15">
    <h1>Título del Artículo</h1>
    <p>Contenido...</p>
    <aside slot="sidebar">
        <h3>Relacionados</h3>
        <ul>...</ul>
    </aside>
</luthier-layout>
```

---

### luthier-header

Cabecera institucional con logo, nombre y accesos.

**Atributos:**

- `logo` (string, default: config) - URL del logo
- `nombre` (string, default: config) - Nombre corto
- `nombre-completo` (string, default: config) - Nombre largo
- `variante` (string, default: "normal") - Variante: normal, minimal, oscuro

**Ejemplo:**

```html
<luthier-header variante="minimal" nombre="Mi Organización"></luthier-header>
```

---

### luthier-footer

Pie de página con contacto, enlaces y redes sociales.

**Atributos:**

- `variante` (string, default: "normal") - Variante: normal, minimal, compacto
- `sin-creditos` (boolean, default: false) - Oculta los créditos de Luthier

**Ejemplo:**

```html
<luthier-footer variante="minimal"></luthier-footer>
```

---

### luthier-nav

Menú de navegación. Lee la estructura de `LUTHIER_CONFIG.menu`.

**Atributos:**

- `variante` (string, default: "horizontal") - Variante: horizontal, vertical, minimal
- `datos` (string, default: config) - JSON con menú personalizado

**Ejemplo:**

```html
<luthier-nav variante="vertical"></luthier-nav>
```

---

## Contenido

Componentes opcionales. Puedes usar HTML plano en su lugar.

### Layout Auxiliar

#### luthier-sidebar

Barra lateral colapsable.

**Atributos:**

- `posicion` (string, default: "derecha") - Posición: izquierda, derecha
- `colapsable` (boolean, default: false) - Permite colapsar/expandir
- `colapsado` (boolean, default: false) - Inicia colapsado
- `titulo` (string) - Título del sidebar

**Métodos:**

- `colapsar()` - Colapsa el sidebar
- `expandir()` - Expande el sidebar
- `toggle()` - Alterna estado

**Eventos:**

- `luthier:sidebar-toggle` - Emitido al cambiar estado

**Ejemplo:**

```html
<luthier-sidebar titulo="Menú" posicion="izquierda" colapsable>
    <nav>...</nav>
</luthier-sidebar>
```

---

#### luthier-breadcrumbs

Migas de pan para navegación jerárquica.

**Atributos:**

- `ruta` (string) - Ruta manual: "Inicio > Sección > Página"
- `auto` (boolean, default: false) - Genera ruta desde URL
- `inicio` (string, default: "Inicio") - Texto del primer item
- `inicio-url` (string, default: "index.html") - URL del primer item

**Ejemplo:**

```html
<luthier-breadcrumbs ruta="Inicio > Normativa > Resoluciones"></luthier-breadcrumbs>
```

---

### Contenido

#### luthier-card

Tarjeta genérica de contenido.

**Atributos:**

- `titulo` (string) - Título de la tarjeta
- `imagen` (string) - URL de imagen destacada
- `enlace` (string) - URL de destino
- `variante` (string, default: "default") - Variante: default, horizontal, compacta, destacada
- `clickeable` (boolean, default: false) - Toda la tarjeta es clickeable

**Slots:**

- default - Contenido principal
- `footer` - Pie de tarjeta
- `badge` - Etiqueta flotante

**Ejemplo:**

```html
<luthier-card titulo="Noticia" imagen="foto.jpg" enlace="noticia.html">
    <p>Resumen de la noticia...</p>
    <span slot="badge">Nuevo</span>
    <div slot="footer">Hace 2 horas</div>
</luthier-card>
```

---

#### luthier-loop

Iterador de contenido para listas, grids, etc.

**Atributos:**

- `source` (string) - Nombre de variable global con datos
- `datos` (string) - JSON con datos inline
- `limit` (number, default: 0) - Máximo de items (0 = sin límite)
- `ordenar` (string) - Campo por el que ordenar
- `orden` (string, default: "desc") - Orden: asc, desc
- `template` (string, default: "card") - Template: card, lista, grid
- `vacio` (string, default: "No hay elementos") - Mensaje cuando no hay datos

**Ejemplo:**

```html
<luthier-loop source="ARTICULOS" limit="6" template="card" ordenar="fecha"></luthier-loop>
```

---

#### luthier-accordion

Acordeón accesible con navegación por teclado.

**Atributos:**

- `multiple` (boolean, default: false) - Permite varios items abiertos
- `abierto` (string) - Índice del item abierto por defecto

**Estructura:**

Los hijos deben tener `data-titulo`:

```html
<luthier-accordion>
    <div data-titulo="Sección 1">Contenido 1</div>
    <div data-titulo="Sección 2">Contenido 2</div>
</luthier-accordion>
```

**Métodos:**

- `abrir(indice)` - Abre un item
- `cerrar(indice)` - Cierra un item
- `cerrarTodos()` - Cierra todos los items
- `toggle(indice)` - Alterna un item

**Eventos:**

- `luthier:accordion-open` - Emitido al abrir (detail: { indice })
- `luthier:accordion-close` - Emitido al cerrar (detail: { indice })

**Teclado:**

- Arrow Down/Up - Navegar entre items
- Home/End - Ir al primero/último
- Enter/Space - Abrir/cerrar

---

#### luthier-tabs

Pestañas horizontales accesibles con navegación por teclado completa.

**Atributos:**

- `activo` (number, default: 0) - Índice de la tab activa por defecto
- `automatico` (boolean, default: false) - Activa el panel al enfocar la tab

**Estructura:**

Los hijos deben tener `data-tab` con el título:

```html
<luthier-tabs>
    <div data-tab="Información">Contenido de la primera tab...</div>
    <div data-tab="Detalles">Contenido de la segunda tab...</div>
    <div data-tab="Contacto">Contenido de la tercera tab...</div>
</luthier-tabs>
```

**Atributos adicionales en hijos:**

- `data-icono` - Icono para mostrar junto al título
- `data-deshabilitado` - Deshabilita la tab

**Métodos:**

- `activar(indice)` - Activa una tab y le da foco
- `obtenerActivo()` - Retorna el índice de la tab activa

**Eventos:**

- `luthier:tab-change` - Emitido al cambiar (detail: { indice, titulo })

**Teclado:**

- Arrow Left/Right - Navegar entre tabs
- Home/End - Ir a la primera/última tab
- Enter/Space - Activar tab

---

#### luthier-tabs-vertical

Pestañas verticales accesibles con navegación por teclado.

**Atributos:**

- `activo` (number, default: 0) - Índice de la tab activa por defecto
- `automatico` (boolean, default: false) - Activa el panel al enfocar la tab
- `posicion` (string, default: "izquierda") - Posición de la lista: izquierda, derecha

**Estructura:**

```html
<luthier-tabs-vertical>
    <div data-tab="Perfil">Contenido del perfil...</div>
    <div data-tab="Configuración">Opciones de configuración...</div>
    <div data-tab="Notificaciones">Preferencias de notificaciones...</div>
</luthier-tabs-vertical>
```

**Atributos adicionales en hijos:**

- `data-icono` - Icono para mostrar junto al título
- `data-descripcion` - Descripción secundaria bajo el título
- `data-deshabilitado` - Deshabilita la tab

**Métodos:**

- `activar(indice)` - Activa una tab y le da foco
- `obtenerActivo()` - Retorna el índice de la tab activa

**Eventos:**

- `luthier:tab-change` - Emitido al cambiar (detail: { indice, titulo })

**Teclado:**

- Arrow Up/Down - Navegar entre tabs
- Home/End - Ir a la primera/última tab
- Enter/Space - Activar tab

**Responsive:**

En pantallas menores a 768px, se convierte automáticamente a layout horizontal.

---

#### luthier-carousel

Carrusel accesible para banners y contenido rotativo.

**Atributos:**

- `autoplay` (boolean, default: false) - Activa la reproducción automática
- `intervalo` (number, default: 5000) - Tiempo entre slides en milisegundos
- `sin-loop` (boolean, default: false) - Desactiva el loop infinito
- `sin-pausar-hover` (boolean, default: false) - No pausar al pasar el mouse
- `sin-controles` (boolean, default: false) - Oculta botones anterior/siguiente
- `sin-indicadores` (boolean, default: false) - Oculta indicadores de posición

**Atributos de slides:**

- `data-titulo` (string) - Título del slide (opcional)
- `data-enlace` (string) - URL de destino al hacer clic (opcional)

**Estructura:**

```html
<luthier-carousel autoplay intervalo="4000">
    <div data-slide data-titulo="Bienvenido" data-enlace="pagina.html">
        <img src="banner1.jpg" alt="Banner 1">
        <div class="carousel-caption">
            <h2>Título del Banner</h2>
            <p>Descripción...</p>
        </div>
    </div>
    <div data-slide>
        <img src="banner2.jpg" alt="Banner 2">
    </div>
</luthier-carousel>
```

**Métodos:**

- `siguiente()` - Avanza al siguiente slide
- `anterior()` - Retrocede al slide anterior
- `irA(indice)` - Va a un slide específico
- `pausar()` - Pausa el autoplay
- `reanudar()` - Reanuda el autoplay
- `obtenerIndice()` - Retorna el índice actual
- `obtenerTotal()` - Retorna el total de slides

**Eventos:**

- `luthier:carousel-change` - Emitido al cambiar slide (detail: { indice, total })
- `luthier:carousel-pausa` - Emitido al pausar/reanudar (detail: { pausado })

**Teclado:**

- Arrow Left/Right - Navegar entre slides
- Home/End - Ir al primer/último slide
- Space - Pausar/reanudar autoplay

**Touch:**

Soporta gestos swipe en dispositivos móviles.

---

#### luthier-markdown

Renderizador de Markdown a HTML en el navegador. Soporta sintaxis básica de Markdown.

**Seguridad:** Este componente está diseñado para contenido controlado por el desarrollador. NO debe usarse con entrada de usuarios no confiables.

**Atributos:**

- `src` (string) - URL del archivo .md a cargar (opcional)

**Sintaxis soportada:**

- Encabezados (# h1, ## h2, etc.)
- Negrita (**texto**), cursiva (*texto*), tachado (~~texto~~)
- Listas ordenadas y no ordenadas
- Enlaces [texto](url) e imágenes ![alt](src)
- Bloques de código con \`\`\`lenguaje
- Blockquotes (> cita)
- Líneas horizontales (---, ___, ***)
- Código inline \`código\`

**Métodos:**

- `cargar(url)` - Carga un archivo .md desde URL
- `renderizar(markdown)` - Renderiza una cadena de Markdown

**Eventos:**

- `luthier:markdown-rendered` - Emitido al terminar de renderizar

**Ejemplo inline:**

```html
<luthier-markdown>
# Título

Este es un párrafo con **negrita** y *cursiva*.

- Item 1
- Item 2
</luthier-markdown>
```

**Ejemplo desde archivo:**

```html
<luthier-markdown src="posts/noticia.md"></luthier-markdown>
```

---

#### luthier-timeline

Línea de tiempo vertical para mostrar eventos cronológicos.

**Atributos:**

- `invertido` (boolean) - Alterna los items de lado (izquierda/derecha)
- `compacto` (boolean) - Versión compacta sin alternar lados

**Estructura:**

Los hijos deben tener `data-fecha` y opcionalmente `data-titulo`, `data-icono`:

```html
<luthier-timeline>
    <div data-fecha="2020-01" data-titulo="Fundación">
        <p>Se funda la organización.</p>
    </div>
    <div data-fecha="2022-06" data-titulo="Nueva sede" data-icono="🏢">
        <p>Inauguramos nuestra nueva sede.</p>
    </div>
</luthier-timeline>
```

**Formatos de fecha soportados:**

- `YYYY` - Solo año (ej: "2024")
- `YYYY-MM` - Año y mes (ej: "2024-01" → "Enero 2024")
- `YYYY-MM-DD` - Fecha completa (ej: "2024-01-15" → "15 de Enero de 2024")

---

#### luthier-gallery

Galería de imágenes con lightbox integrado.

**Atributos:**

- `columnas` (number, default: 3) - Número de columnas en el grid
- `gap` (number, default: 1) - Espacio entre imágenes en rem

**Estructura:**

```html
<luthier-gallery columnas="4">
    <div data-src="img/foto1.jpg" data-alt="Descripción 1"></div>
    <div data-src="img/foto2.jpg" data-alt="Descripción 2" data-titulo="Mi foto"></div>
</luthier-gallery>
```

**Atributos de imágenes:**

- `data-src` (string, requerido) - URL de la imagen
- `data-alt` (string) - Texto alternativo
- `data-titulo` (string) - Título en el lightbox

**Teclado en lightbox:**

- Escape - Cerrar
- Arrow Left/Right - Navegar
- Enter/Space - Abrir imagen

---

#### luthier-team

Muestra miembros de un equipo con foto, nombre, cargo y redes sociales.

**Atributos:**

- `columnas` (number, default: 3) - Número de columnas
- `centrado` (boolean) - Centra las tarjetas si hay menos que columnas

**Estructura:**

```html
<luthier-team columnas="4">
    <div data-nombre="Ana García"
         data-cargo="Directora"
         data-foto="img/ana.jpg"
         data-email="ana@ejemplo.com"
         data-linkedin="https://linkedin.com/in/ana">
        <p>Breve biografía de Ana.</p>
    </div>
</luthier-team>
```

**Atributos de miembros:**

- `data-nombre` (string) - Nombre del miembro
- `data-cargo` (string) - Cargo o título
- `data-foto` (string) - URL de la foto
- `data-email` (string) - Email
- `data-linkedin` (string) - URL de LinkedIn
- `data-twitter` (string) - URL de Twitter/X
- `data-github` (string) - URL de GitHub

---

#### luthier-toc

Tabla de contenidos generada automáticamente basada en los encabezados de la página.

**Atributos:**

- `selector` (string, default: "main") - Selector CSS del contenedor a analizar
- `niveles` (string, default: "h2,h3") - Niveles de encabezados a incluir
- `titulo` (string, default: "Contenido") - Título de la tabla
- `colapsable` (boolean) - Permite colapsar/expandir
- `sticky` (boolean) - Hace que la tabla sea sticky al hacer scroll

**Funcionalidades:**

- Genera automáticamente IDs para encabezados sin ID
- Scroll spy: resalta el enlace activo según la posición de scroll
- Soporte para encabezados anidados (niveles 1, 2, 3)

**Ejemplo:**

```html
<luthier-toc selector=".articulo" niveles="h2,h3,h4" titulo="En esta página" colapsable sticky></luthier-toc>
```

---

#### luthier-alert

Banners de aviso, información, éxito, advertencia o error.

**Atributos:**

- `tipo` (string, default: "info") - Tipo: info, exito, advertencia, error
- `titulo` (string) - Título opcional del mensaje
- `descartable` (boolean) - Permite cerrar la alerta
- `icono` (string) - Icono personalizado (emoji o carácter)

**Métodos:**

- `mostrar()` - Muestra la alerta
- `cerrar()` - Cierra la alerta

**Eventos:**

- `luthier:alert-cerrada` - Emitido al cerrar la alerta

**Ejemplo:**

```html
<luthier-alert tipo="advertencia" titulo="Atención" descartable>
    Por favor revise los datos antes de continuar.
</luthier-alert>
```

---

#### luthier-back-to-top

Botón flotante que aparece al hacer scroll para volver al inicio de la página.

**Atributos:**

- `umbral` (number, default: 300) - Píxeles de scroll para mostrar el botón
- `suave` (boolean, default: true) - Usa scroll suave
- `posicion` (string, default: "derecha") - Posición: derecha, izquierda
- `texto` (string, default: "↑") - Texto o emoji del botón

**Ejemplo:**

```html
<luthier-back-to-top umbral="500" posicion="izquierda" texto="⬆"></luthier-back-to-top>
```

---

#### luthier-stats

Contadores animados que se activan cuando entran en el viewport.

**Atributos:**

- `columnas` (number, default: 4) - Número de columnas
- `duracion` (number, default: 2000) - Duración de la animación en ms
- `separador` (string, default: ",") - Separador de miles

**Estructura:**

```html
<luthier-stats>
    <div data-valor="1500" data-etiqueta="Clientes" data-sufijo="+"></div>
    <div data-valor="98" data-etiqueta="Satisfacción" data-sufijo="%"></div>
    <div data-valor="50" data-etiqueta="Empleados"></div>
    <div data-valor="10" data-etiqueta="Años" data-prefijo="+"></div>
</luthier-stats>
```

**Atributos de estadísticas:**

- `data-valor` (number, requerido) - Valor numérico
- `data-etiqueta` (string) - Etiqueta descriptiva
- `data-prefijo` (string) - Texto antes del número
- `data-sufijo` (string) - Texto después del número
- `data-icono` (string) - Icono (emoji o carácter)

---

#### luthier-quote

Citas, testimonios o reseñas destacadas.

**Atributos:**

- `autor` (string) - Nombre del autor
- `cargo` (string) - Cargo o título del autor
- `foto` (string) - URL de la foto del autor
- `empresa` (string) - Empresa u organización
- `estilo` (string, default: "simple") - Estilo: simple, tarjeta, destacado

**Ejemplo:**

```html
<luthier-quote autor="María López" cargo="CEO" empresa="TechCorp" foto="img/maria.jpg" estilo="tarjeta">
    Este producto cambió completamente nuestra forma de trabajar.
</luthier-quote>
```

---

#### luthier-embed

Videos y contenido embebido responsivo. Soporta YouTube, Vimeo y iframes genéricos.

**Atributos:**

- `src` (string, requerido) - URL del video o iframe
- `ratio` (string, default: "16:9") - Proporción: 16:9, 4:3, 1:1, 21:9
- `titulo` (string) - Título para accesibilidad
- `autoplay` (boolean) - Autoplay del video
- `lazy` (boolean, default: true) - Carga diferida

**URLs soportadas:**

- YouTube: `https://www.youtube.com/watch?v=VIDEO_ID` o `https://youtu.be/VIDEO_ID`
- Vimeo: `https://vimeo.com/VIDEO_ID`
- Cualquier URL de iframe genérico

**Métodos:**

- `cargar(url)` - Carga un nuevo video

**Ejemplo:**

```html
<luthier-embed src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" titulo="Mi video" ratio="16:9"></luthier-embed>
```

---

#### luthier-blog

Lista de posts con paginación para blogs o noticias.

**Atributos:**

- `por-pagina` (number, default: 6) - Posts por página
- `columnas` (number, default: 2) - Columnas en vista grid
- `vista` (string, default: "grid") - Tipo de vista: grid, lista
- `ordenar` (string, default: "fecha") - Campo para ordenar: fecha, titulo
- `orden` (string, default: "desc") - Dirección: asc, desc

**Estructura:**

```html
<luthier-blog por-pagina="4">
    <article data-titulo="Mi primer post"
             data-fecha="2024-01-15"
             data-imagen="img/post1.jpg"
             data-resumen="Este es el resumen del post..."
             data-url="posts/mi-primer-post.html"
             data-categoria="Noticias"
             data-autor="Juan Pérez">
    </article>
</luthier-blog>
```

**Atributos de posts:**

- `data-titulo` (string) - Título del post
- `data-fecha` (string) - Fecha en formato ISO
- `data-imagen` (string) - URL de imagen destacada
- `data-resumen` (string) - Resumen o extracto
- `data-url` (string) - URL del post completo
- `data-categoria` (string) - Categoría
- `data-autor` (string) - Autor

**Métodos:**

- `irAPagina(numero)` - Navega a una página específica

---

#### luthier-search

Búsqueda global del sitio. Funciona con protocolo file:/// ya que no requiere servidor.

**Atributos:**

- `datos` (string, default: "LUTHIER_SEARCH_DATA") - Nombre de la variable global con los datos
- `placeholder` (string, default: "Buscar...") - Texto del placeholder
- `min-chars` (number, default: 2) - Mínimo de caracteres para buscar
- `max-resultados` (number, default: 10) - Máximo de resultados a mostrar
- `campos` (string, default: "titulo,contenido") - Campos a buscar

**Estructura de datos:**

```javascript
window.LUTHIER_SEARCH_DATA = [
    { titulo: 'Página 1', contenido: 'Texto...', url: 'pagina1.html', categoria: 'Blog' },
    { titulo: 'Página 2', contenido: 'Texto...', url: 'pagina2.html', categoria: 'Docs' }
];
```

**Métodos:**

- `setDatos(array)` - Establece los datos de búsqueda
- `focus()` - Da foco al input

**Teclado:**

- Arrow Up/Down - Navegar entre resultados
- Enter - Ir al resultado seleccionado
- Escape - Cerrar resultados

**Ejemplo:**

```html
<luthier-search placeholder="¿Qué buscas?" max-resultados="5"></luthier-search>
```

---

### Documentos

#### luthier-doc-library

Biblioteca de documentos con filtros y búsqueda.

**Atributos:**

- `source` (string, default: "DOCUMENTOS") - Variable global con datos
- `sin-filtros` (boolean, default: false) - Oculta filtros
- `sin-busqueda` (boolean, default: false) - Oculta búsqueda
- `sin-contador` (boolean, default: false) - Oculta contador
- `categorias` (string) - Categorías personalizadas (formato: "valor:Nombre,valor2:Nombre2")
- `tipos` (string) - Tipos personalizados

**Estructura de datos esperada:**

```javascript
window.DOCUMENTOS = [
    {
        titulo: "Informe 2024",
        descripcion: "Informe anual de gestión",
        archivo: "docs/informe-2024.pdf",
        tipo: "pdf",
        categoria: "informes",
        fecha: "2024-01-15",
        tamano: "2.3 MB"
    }
];
```

**Ejemplo:**

```html
<luthier-doc-library sin-filtros></luthier-doc-library>
```

---

#### luthier-doc-card

Tarjeta individual de documento.

**Atributos:**

- `titulo` (string, default: "Documento") - Título del documento
- `archivo` (string, default: "#") - URL del archivo
- `tipo` (string, default: "pdf") - Tipo: pdf, xlsx, docx, etc
- `fecha` (string) - Fecha ISO
- `tamano` (string) - Tamaño del archivo
- `descripcion` (string) - Descripción breve

**Ejemplo:**

```html
<luthier-doc-card
    titulo="Plan Anual 2024"
    archivo="docs/plan-2024.xlsx"
    tipo="xlsx"
    fecha="2024-01-10"
    tamano="156 KB">
</luthier-doc-card>
```

---

### Accesibilidad

#### luthier-a11y-widget

Widget flotante de opciones de accesibilidad.

**Atributos:**

- `posicion` (string, default: "derecha") - Posición: izquierda, derecha
- `compacto` (boolean, default: false) - Versión compacta

**Funcionalidades:**

- Ajuste de tamaño de fuente (80% - 150%)
- Ajuste de espaciado de línea (1.0 - 2.0)
- Alto contraste
- Escala de grises
- Persistencia en localStorage

**Variables CSS manipuladas:**

- `--l-a11y-escala-fuente`
- `--l-a11y-espaciado-linea`

**Clases CSS aplicadas al body:**

- `alto-contraste`
- `escala-grises`

**Eventos:**

Responde a `luthier:toggle-accesibilidad` (emitido por el botón del header).

**Ejemplo:**

```html
<luthier-a11y-widget posicion="izquierda"></luthier-a11y-widget>
```

---

### Desarrollo y Validación

#### luthier-dev-tools

Widget flotante de desarrollo que muestra advertencias y errores en tiempo real. Solo se muestra en entornos de desarrollo (protocolo file:// o localhost).

**Atributos:**

- `posicion` (string, default: "inferior-derecha") - Posición del widget: inferior-derecha, inferior-izquierda, superior-derecha, superior-izquierda
- `expandido` (boolean, default: false) - Inicia con el panel expandido
- `sin-escaneo` (boolean, default: false) - Desactiva el escaneo automático de páginas

**Funcionalidades:**

- Detecta páginas no registradas en LUTHIER_PAGES
- Muestra items del menú sin página correspondiente
- Valida contra LuthierSitemapRegistry
- Badge con contador de problemas
- Panel desplegable con errores y advertencias

**Visibilidad:**

Solo se muestra cuando:
- Protocolo es `file://`
- Hostname es `localhost` o `127.0.0.1`
- Existe atributo `data-luthier-dev` en `<html>` o `<body>`

**Ejemplo:**

```html
<luthier-dev-tools></luthier-dev-tools>

<!-- Expandido por defecto -->
<luthier-dev-tools expandido></luthier-dev-tools>
```

---

---

## Utilidades

### LuthierSitemapRegistry

Objeto global para registro y validación centralizada de páginas del sitio.

**Métodos:**

- `init()` - Inicializa el registro (se ejecuta automáticamente)
- `registrar(config)` - Registra una página manualmente
- `validar()` - Ejecuta validación y retorna {valido, errores, advertencias}
- `obtenerPaginas()` - Retorna array de páginas registradas
- `imprimirReporte()` - Imprime reporte en consola

**Configuración:**

Definir `window.LUTHIER_PAGES` antes de cargar el bundle:

```javascript
window.LUTHIER_PAGES = [
    { slug: 'index.html', titulo: 'Inicio' },
    { slug: 'paginas/contacto.html', titulo: 'Contacto', enMenu: true }
];
```

**Campos de página:**

- `slug` (string, requerido) - Ruta relativa del archivo HTML
- `titulo` (string) - Título de la página
- `descripcion` (string) - Descripción meta
- `enMenu` (boolean, default: true) - Si debe estar en el menú
- `ultimaModificacion` (string) - Fecha ISO de última modificación

**Ejemplo de uso:**

```javascript
// Validar sitio
var resultado = LuthierSitemapRegistry.validar();
if (!resultado.valido) {
    console.error('Errores encontrados:', resultado.errores);
}

// Ver reporte completo
LuthierSitemapRegistry.imprimirReporte();
```

---

## CLI: validate-site.js

Herramienta de línea de comandos para validar sitios Luthier.

**Ubicación:** `tools/validate-site.js`

**Uso:**

```bash
node tools/validate-site.js [directorio] [opciones]
```

**Opciones:**

- `--config <archivo>` - Archivo de configuración (default: config/sitio.js)
- `--fix` - Genera archivo config/pages.js con páginas encontradas
- `--json` - Salida en formato JSON
- `--quiet` - Solo muestra errores

**Funcionalidades:**

- Escanea todos los archivos HTML del directorio
- Valida que los items del menú tengan archivos correspondientes
- Detecta enlaces rotos internos
- Identifica páginas huérfanas (no enlazadas)
- Genera automáticamente registro de páginas con `--fix`

**Ejemplo:**

```bash
# Validar sitio en directorio actual
node tools/validate-site.js .

# Validar con salida JSON
node tools/validate-site.js ./mi-sitio --json

# Generar pages.js automáticamente
node tools/validate-site.js ./mi-sitio --fix
```
