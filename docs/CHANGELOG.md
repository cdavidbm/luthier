# Changelog

Todos los cambios notables de este proyecto se documentan aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.4.1] - 2026-02-01

### Agregado

#### Integración con CMS Headless

- `luthier-content` - Componente para cargar contenido desde archivos Markdown
  - Modo individual (`src`) para cargar un archivo
  - Modo colección (`collection`) para cargar múltiples archivos
  - Soporte para filtros, ordenamiento y paginación
  - Exporta datos a variable global para uso con `luthier-loop`

- `LuthierFrontmatter` - Parser de frontmatter YAML para archivos Markdown
  - Extrae metadatos YAML del encabezado de archivos .md
  - Soporta strings, números, booleanos, arrays y objetos anidados
  - Método `stringify()` para serializar de vuelta a YAML

- `LuthierCollections` - Cargador de colecciones de archivos
  - Carga múltiples archivos .md desde una carpeta
  - Usa `index.json` para compatibilidad con `file:///`
  - Integración con LuthierData para procesamiento

- `tools/generate-index.js` - Generador de índices para colecciones
  - Script Node.js para generar `index.json` automáticamente
  - Extrae frontmatter de todos los archivos .md en una carpeta
  - Validación de rutas para prevenir path traversal

- Documentación completa de integración CMS (`docs/CMS-INTEGRATION.md`)

- Ejemplo funcional con configuración de Sveltia CMS

#### Mejoras a Componentes Existentes

- `luthier-markdown` - Nuevo atributo `extract-frontmatter`
  - Evento `luthier:markdown-loaded` con frontmatter y body
  - Métodos `getFrontmatter()`, `getBody()`, `getSrc()`

### Cambiado

#### Seguridad

- `luthier-loop` - Reescrito completamente con DOM APIs
  - Usa `createElement` y `textContent` en lugar de innerHTML
  - Previene vulnerabilidades XSS en datos dinámicos
  - Nueva función `_sanitizarURL()` para prevenir javascript: injection

- `luthier-nav` - Agregado `disconnectedCallback()`
  - Limpia event listeners al desmontar componente
  - Previene memory leaks en navegación SPA

### Corregido

- Documentación: Corregidos errores ortográficos en CMS-INTEGRATION.md
- Documentación: Agregados hashes SRI reales para Sveltia CMS en ejemplos

---

## [1.4.0] - 2026-01-28

### Agregado

#### 12 Nuevos Componentes de Contenido

- `luthier-markdown` - Renderizador de Markdown a HTML en el navegador
  - Soporta encabezados, listas, enlaces, imágenes, código, blockquotes
  - Puede cargar archivos .md externos vía atributo `src`
  - Métodos públicos: `cargar(url)`, `renderizar(markdown)`

- `luthier-timeline` - Línea de tiempo vertical para eventos cronológicos
  - Soporta modo normal (alternando lados) y compacto
  - Formatea fechas automáticamente en español

- `luthier-gallery` - Galería de imágenes con lightbox
  - Grid configurable de columnas
  - Navegación con teclado y gestos táctiles
  - Contador de imágenes en lightbox

- `luthier-team` - Tarjetas de equipo/personal
  - Muestra foto, nombre, cargo y biografía
  - Soporte para redes sociales (email, LinkedIn, Twitter, GitHub)

- `luthier-toc` - Tabla de contenidos automática
  - Genera desde encabezados de la página
  - Scroll spy para resaltar sección activa
  - Opciones sticky y colapsable

- `luthier-alert` - Banners de aviso/alerta
  - Tipos: info, éxito, advertencia, error
  - Opción de cerrar/descartar
  - Animación de cierre

- `luthier-back-to-top` - Botón flotante para volver arriba
  - Aparece al hacer scroll
  - Scroll suave configurable

- `luthier-stats` - Contadores animados
  - Animación al entrar en viewport
  - Soporte para prefijos, sufijos e iconos
  - Separador de miles configurable

- `luthier-quote` - Citas y testimonios
  - Tres estilos: simple, tarjeta, destacado
  - Soporte para foto del autor

- `luthier-embed` - Videos responsivos
  - Soporta YouTube, Vimeo e iframes genéricos
  - Ratios configurables (16:9, 4:3, 1:1, 21:9)
  - Carga diferida por defecto

- `luthier-blog` - Lista de posts con paginación
  - Vistas grid y lista
  - Ordenación por fecha o título
  - Paginación integrada

- `luthier-search` - Búsqueda global del sitio
  - Funciona sin servidor (compatible con file://)
  - Búsqueda por relevancia
  - Navegación por teclado en resultados

### Cambiado

- Versión del bundle actualizada a 1.4.0
- Documentación expandida con API de todos los nuevos componentes
- Estilos CSS actualizados con soporte para todos los nuevos componentes

---

## [1.3.1] - 2026-01-15

### Corregido

#### Rutas en GitHub Pages
- `_calcularRutaBase()` ahora detecta `github.io` en el hostname
- Excluye automáticamente el nombre del repositorio del cálculo de niveles
- Resuelve problema de enlaces rotos en despliegues de GitHub Pages

### Agregado

#### Script de Build
- `tools/build-bundle.js` - Generador automático de bundle
- Combina todos los componentes en un único archivo
- Orden de dependencias correcto
- Uso: `node tools/build-bundle.js`

### Cambiado
- Documentación actualizada con sección de herramientas
- Estructura de archivos actualizada en README y ARCHITECTURE

---

## [1.3.0] - 2025-12-18

### Agregado

#### Sistema de Temas Predefinidos
- Nueva carpeta `themes/` con temas listos para usar
- `profesional.css` - Paleta elegante navy/dorado para sitios formales
- `corporativo.css` - Paleta moderna azul/naranja para empresas tecnológicas
- `natural.css` - Paleta orgánica verde/tierra para proyectos sostenibles
- Todos los temas incluyen variante oscura (`.tema-oscuro`)
- `themes/README.md` - Documentación de uso y personalización

#### LuthierData - Nuevas Funciones Temporales
- `agruparPorPeriodo(items, campoFecha, periodo)` - Agrupa items por año, mes, trimestre o semana
  - Periodos: `'anio'`, `'mes'`, `'mes_nombre'`, `'trimestre'`, `'semana'`
  - Ordenamiento descendente automático (más reciente primero)
- `etiquetaPeriodo(clave, periodo)` - Convierte claves de periodo en etiquetas legibles
  - `'2024-01'` -> `'Enero 2024'`
  - `'2024-T2'` -> `'2do Trimestre 2024'`

#### Template de Configuración Extendido
- Nuevos campos en `contacto`: `codigoPostal`, `telefonoSecundario`, `whatsapp`, `emailSoporte`, `horarioFinesDesemana`
- Nueva sección opcional `legal`: `nombreLegal`, `identificacion`, `registroMercantil`, `licencia`
- Nueva sección opcional `seo`: `descripcion`, `palabrasClave`, `autor`, `idioma`
- Más redes sociales sugeridas: LinkedIn, YouTube, TikTok

---

## [1.2.0] - 2025-12-05

### Corregido

#### LuthierHeader - Rutas rotas en subpáginas
- Ahora usa `_rutaBase` para logo e index.html, funcionando correctamente en subdirectorios

#### LuthierLayout - Slots anidados capturados incorrectamente
- Cambiado `querySelectorAll('[slot]')` por `this.children` para solo detectar slots directos
- Corrige el problema donde `slot="footer"` en cards impedía que apareciera el footer de página

#### LuthierNav - Múltiples items marcados como activos
- Comparación de rutas completas en lugar de solo nombres de archivo
- Evita que múltiples `index.html` se marquen como activos simultáneamente

#### LuthierFooter - Barra de copyright removida
- Eliminada la sección `footer__barra` con copyright y créditos

### Cambiado

#### luthier-dev-tools
- Nueva posición por defecto: `centro-izquierda`
- Nueva opción de posición: `centro-izquierda` (centrado verticalmente a la izquierda)

### Mejorado

#### Accesibilidad
- Skip link ahora oculto visualmente pero accesible para lectores de pantalla
- Solo visible cuando recibe foco con Tab

---

## [1.1.0] - 2025-11-28

### Agregado

#### Componentes Nuevos
- `luthier-tabs` - Pestañas horizontales accesibles con navegación por teclado (ArrowLeft/Right, Home, End)
- `luthier-tabs-vertical` - Pestañas verticales con soporte para posición izquierda/derecha y responsive
- `luthier-carousel` - Carrusel para banners con autoplay, controles, indicadores y soporte touch/swipe

#### Características
- Navegación completa por teclado en todos los nuevos componentes
- Soporte ARIA completo (tablist, tab, tabpanel, roledescription)
- Responsive: tabs verticales se convierten a horizontales en móviles
- Touch/swipe en carousel para dispositivos móviles
- Autoplay con pausa automática al hover/focus en carousel

#### Sistema de Prevención de Páginas Huérfanas
- `LuthierSitemapRegistry` - Registro centralizado de páginas para validación
- `luthier-dev-tools` - Widget de desarrollo que muestra errores y advertencias
- `tools/validate-site.js` - CLI para validar sitios desde terminal
- Detección de páginas no enlazadas en el menú
- Detección de items de menú sin página correspondiente
- Generación automática de pages.js con --fix

### Cambiado
- Actualizado `luthier.bundle.js` con los nuevos componentes
- Expandido `componentes.css` con estilos para tabs y carousel

---

## [1.0.0] - 2025-11-10

### Agregado

#### Nueva Estructura
- Reorganización completa de carpetas: `/core/`, `/ui/`, `/data/`, `/styles/`, `/docs/`
- Sistema modular con subcarpetas por categoría: layout, navigation, content, documents, accessibility

#### Componentes Nuevos
- `luthier-sidebar` - Barra lateral colapsable con soporte de posicionamiento
- `luthier-card` - Tarjeta genérica con slots (footer, badge)
- `luthier-loop` - Iterador de contenido con templates (card, lista, grid)
- `luthier-accordion` - Acordeón accesible con navegación por teclado completa
- `luthier-doc-library` - Biblioteca de documentos con filtros y búsqueda
- `luthier-doc-card` - Tarjeta individual de documento
- `luthier-a11y-widget` - Widget flotante de accesibilidad

#### Data Helpers
- `LuthierData` - Utilidades para agrupar, ordenar, filtrar y paginar datos
- `LuthierSearch` - Motor de búsqueda con soporte para relevancia
- `LuthierDate` - Formateador de fechas en español

#### Estilos
- `utilities.css` - Clases utilitarias (padding, bordes, sombras, etc)
- Estilos para todos los componentes nuevos en `componentes.css`
- Soporte para modo alto contraste y escala de grises

#### Documentación
- `README.md` - Guía de inicio rápido
- `MANIFESTO.md` - Filosofía del proyecto
- `ARCHITECTURE.md` - Arquitectura técnica
- `COMPONENTS.md` - API completa de componentes
- `SECURITY.md` - Análisis de seguridad OWASP
- `CHANGELOG.md` - Este archivo

### Cambiado

#### Nomenclatura
- Todos los componentes renombrados de `mi-*` a `luthier-*`:
  - `mi-header` -> `luthier-header`
  - `mi-nav` -> `luthier-nav`
  - `mi-footer` -> `luthier-footer`
  - `mi-breadcrumb` -> `luthier-breadcrumbs`
  - `mi-layout` -> `luthier-layout`
  - `mi-galeria-documentos` -> `luthier-doc-library`

#### Core
- `luthier.js` movido a `/core/`
- Actualizado para cargar desde nueva estructura de carpetas
- Incluye carga de data helpers

#### Estilos
- Estilos movidos a `/styles/`
- Agregados selectores para nuevos componentes
- Mantenida retrocompatibilidad con `mi-*`

### Eliminado
- Nada (se mantiene retrocompatibilidad con v0.1.0)

### Seguridad
- Todos los enlaces externos usan `rel="noopener noreferrer"`
- Sin uso de `eval()` o `new Function()`
- Modo estricto (`'use strict'`) en todo el código

---

## [0.1.0] - 2025-10-15

### Agregado
- Versión inicial del toolkit
- Componentes base: `mi-header`, `mi-nav`, `mi-footer`, `mi-breadcrumb`, `mi-layout`
- Sistema de estilos con tokens CSS
- Compatibilidad con protocolo `file:///`
- Soporte para slots en `mi-layout`
- Navegación responsive con menú hamburguesa
- Submenús multinivel
- Skip links para accesibilidad
- Ejemplos: blog simple, galería de documentos, blog dinámico

---

## Guía de Migración

### De 0.1.0 a 1.0.0

1. **Actualizar tags HTML:**
```html
<!-- Antes -->
<mi-layout>...</mi-layout>
<mi-header></mi-header>
<mi-nav></mi-nav>
<mi-footer></mi-footer>
<mi-breadcrumb></mi-breadcrumb>
<mi-galeria-documentos></mi-galeria-documentos>

<!-- Después -->
<luthier-layout>...</luthier-layout>
<luthier-header></luthier-header>
<luthier-nav></luthier-nav>
<luthier-footer></luthier-footer>
<luthier-breadcrumbs></luthier-breadcrumbs>
<luthier-doc-library></luthier-doc-library>
```

2. **Actualizar rutas de CSS:**
```html
<!-- Antes -->
<link rel="stylesheet" href="../../src/styles/tokens.css">
<link rel="stylesheet" href="../../src/styles/reset.css">
<link rel="stylesheet" href="../../src/styles/componentes.css">

<!-- Después -->
<link rel="stylesheet" href="../../styles/tokens.css">
<link rel="stylesheet" href="../../styles/reset.css">
<link rel="stylesheet" href="../../styles/componentes.css">
```

3. **Usar el nuevo bundle:**
```html
<!-- El bundle sigue en el mismo lugar -->
<script src="../../dist/luthier.bundle.js"></script>
```

4. **Opcional: Agregar widget de accesibilidad:**
```html
<luthier-a11y-widget></luthier-a11y-widget>
```

### Retrocompatibilidad

Los componentes `mi-*` siguen funcionando si usas el bundle anterior.
Sin embargo, se recomienda migrar a `luthier-*` para futuras actualizaciones.
