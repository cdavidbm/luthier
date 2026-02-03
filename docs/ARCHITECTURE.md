# Arquitectura de Luthier

## Tipos de Componentes

Luthier distingue entre componentes de estructura y de contenido.

### Estructura

Cuatro componentes centralizan lo que de otro modo habría que repetir en cada archivo:

```
luthier-layout
├── luthier-header   (logo, nombre)
├── luthier-nav      (menú, lee de LUTHIER_CONFIG.menu)
├── [contenido]
└── luthier-footer   (contacto, enlaces)
```

`luthier-layout` genera los otros tres automáticamente. Si no usas estos componentes, tendrías que copiar el menú y la cabecera en cada HTML.

### Contenido

Los demás componentes (`luthier-card`, `luthier-accordion`, `luthier-tabs`, etc.) son opcionales. Sirven para reducir repetición y garantizar accesibilidad, pero puedes usar HTML plano:

```html
<luthier-layout titulo="Mi Página">
    <h1>Título</h1>
    <p>Contenido...</p>
</luthier-layout>
```

---

## Estructura General

```
luthier/
├── core/               # Núcleo del toolkit
├── ui/                 # Componentes de interfaz
│   ├── layout/
│   ├── navigation/
│   ├── content/
│   ├── documents/
│   └── accessibility/
├── data/               # Utilidades de datos
├── styles/             # Sistema de estilos
├── dist/               # Bundle de producción
├── tools/              # Herramientas de desarrollo
├── themes/             # Temas predefinidos
├── ejemplos/           # Demostraciones
└── docs/               # Documentación
```

## Patrón de Diseño: IIFE

Todos los componentes usan el patrón **IIFE** (Immediately Invoked Function Expression) para evitar polucionar el scope global y garantizar compatibilidad con `file:///`.

```javascript
(function(global) {
    'use strict';

    class LuthierComponent extends HTMLElement {
        connectedCallback() {
            // Inicialización
        }
    }

    // Registrar solo si no existe
    if (!customElements.get('luthier-component')) {
        customElements.define('luthier-component', LuthierComponent);
    }

    // Exponer globalmente (opcional)
    global.LuthierComponents = global.LuthierComponents || {};
    global.LuthierComponents.LuthierComponent = LuthierComponent;

})(typeof window !== 'undefined' ? window : this);
```

### Por qué IIFE?

1. **No ES6 modules**: Los ES6 modules (`import`/`export`) no funcionan con `file:///` debido a restricciones CORS del navegador.

2. **Encapsulamiento**: Cada componente tiene su propio scope, evitando conflictos de variables.

3. **Compatibilidad**: Funciona en navegadores antiguos sin transpilación.

## Flujo de Carga

### Modo Desarrollo (core/luthier.js)

```
1. Usuario carga <script src="core/luthier.js">
2. luthier.js detecta su ubicación
3. Inyecta estilos FOUC (ocultar :not(:defined))
4. Usa document.write() para cargar secuencialmente:
   - Data helpers
   - Componentes
5. Componentes se auto-registran
6. DOM listo: componentes se renderizan
```

### Modo Producción (dist/luthier.bundle.js)

```
1. Usuario carga <script src="dist/luthier.bundle.js">
2. Bundle contiene todo el código concatenado
3. Componentes se registran inmediatamente
4. DOM listo: componentes se renderizan
```

## Sistema de Configuración

La configuración se define en `window.LUTHIER_CONFIG` **antes** de cargar Luthier:

```javascript
window.LUTHIER_CONFIG = {
    sitio: { ... },
    menu: [ ... ],
    contacto: { ... },
    // etc.
};
```

Los componentes acceden a la configuración vía:

```javascript
var config = global.LUTHIER_CONFIG || {};
var sitio = config.sitio || {};
```

## Ciclo de Vida de Componentes

### connectedCallback

Se ejecuta cuando el elemento se agrega al DOM:

```javascript
connectedCallback() {
    var self = this;
    // setTimeout para esperar contenido interno
    setTimeout(function() {
        self._init();
    }, 0);
}
```

El `setTimeout(0)` es crucial porque:
1. El parser HTML puede no haber terminado de procesar los hijos
2. Garantiza que `innerHTML` contenga todo el contenido

### _init

Inicialización del componente:

```javascript
_init() {
    // 1. Leer atributos
    var titulo = this.getAttribute('titulo');

    // 2. Detectar slots
    var slots = this._detectarSlots();

    // 3. Aplicar clases
    this.classList.add('mi-clase');

    // 4. Renderizar
    this.innerHTML = this._render(datos);

    // 5. Inicializar eventos
    this._initEventos();
}
```

## Sistema de Slots

Luthier implementa un sistema de slots propio (no Shadow DOM) para máximo control:

```javascript
_detectarSlots() {
    var slots = { header: null, footer: null };

    var elementosConSlot = this.querySelectorAll('[slot]');
    for (var i = 0; i < elementosConSlot.length; i++) {
        var el = elementosConSlot[i];
        var nombre = el.getAttribute('slot');
        if (nombre in slots) {
            slots[nombre] = el.outerHTML;
            el.remove();
        }
    }

    return slots;
}
```

### Por qué no Shadow DOM?

1. **Simplicidad de estilos**: Los estilos globales se aplican directamente
2. **Debugging**: El DOM es inspeccionable sin abstracciones
3. **Compatibilidad**: Mejor soporte cross-browser

## Sistema de Estilos

### tokens.css
Variables CSS globales (colores, espaciado, tipografía).

### reset.css
Normalización cross-browser.

### componentes.css
Estilos estructurales de componentes.

### utilities.css
Clases utilitarias opcionales.

### Nomenclatura CSS (BEM-like)

```css
.componente { }
.componente__elemento { }
.componente--modificador { }
.componente__elemento--modificador { }
```

Ejemplo:
```css
.nav { }
.nav__lista { }
.nav__item { }
.nav__item--activo { }
.nav__enlace { }
```

## Data Helpers

Utilidades puras (sin side effects) para manipular datos:

### LuthierData (data-mapper.js)
```javascript
// Agrupación y ordenamiento
LuthierData.agruparPor(items, 'categoria')
LuthierData.ordenarPor(items, 'fecha', 'desc')
LuthierData.filtrar(items, { tipo: 'pdf' })
LuthierData.paginar(items, 2, 10)
LuthierData.valoresUnicos(items, 'categoria')
LuthierData.contarPor(items, 'tipo')

// Agrupación temporal (v1.3.0)
LuthierData.agruparPorPeriodo(items, 'fecha', 'anio')
// Periodos: 'anio', 'mes', 'mes_nombre', 'trimestre', 'semana'
// Retorna: { '2024': [...], '2023': [...] }

LuthierData.etiquetaPeriodo('2024-01', 'mes')  // "Enero 2024"
LuthierData.etiquetaPeriodo('2024-T2', 'trimestre')  // "2do Trimestre 2024"
```

### LuthierSearch (search-engine.js)
```javascript
LuthierSearch.buscar(items, 'termino', ['titulo', 'contenido'])
LuthierSearch.buscarConRelevancia(items, 'termino', campos)
LuthierSearch.normalizar('Texto con Acentos')
```

### LuthierDate (date-formatter.js)
```javascript
LuthierDate.formatoLargo('2024-01-15')    // "15 de enero de 2024"
LuthierDate.formatoRelativo('2024-01-15') // "hace 3 días"
```

## Eventos Personalizados

Los componentes emiten eventos para comunicación:

```javascript
// Emitir
document.dispatchEvent(new CustomEvent('luthier:toggle-accesibilidad'));

// Escuchar
document.addEventListener('luthier:toggle-accesibilidad', function() {
    // manejar evento
});
```

Convención de nombres: `luthier:nombre-evento`

## Accesibilidad

### Roles ARIA
Cada componente incluye roles apropiados:
- `<nav role="navigation">`
- `<main role="main">`
- `<footer role="contentinfo">`

### Navegación por Teclado
- Tab para navegar entre elementos
- Enter/Space para activar
- Flechas para acordeones/menús
- Escape para cerrar paneles

### Estados
- `aria-expanded` para toggle
- `aria-current="page"` para página actual
- `aria-label` para botones sin texto

## Consideraciones de Rendimiento

1. **Sin Virtual DOM**: Manipulación directa del DOM
2. **Carga secuencial**: Los componentes se cargan uno a uno para garantizar dependencias
3. **Debounce en búsqueda**: 300ms de espera antes de filtrar
4. **Lazy loading de imágenes**: `loading="lazy"` en imágenes

## Flujo de Datos CMS

Luthier puede cargar contenido desde archivos Markdown con frontmatter YAML, permitiendo integración con CMS Headless.

### Flujo de Carga de Contenido

```
1. index.json lista los archivos disponibles
2. LuthierCollections carga el índice
3. Para cada archivo:
   a. XMLHttpRequest obtiene el .md
   b. LuthierFrontmatter extrae YAML y body
   c. Datos se almacenan en memoria
4. LuthierData ordena/filtra según opciones
5. Resultado se exporta a variable global
6. LuthierLoop renderiza usando templates
```

### Componentes Involucrados

```
LuthierContent (orquestador)
├── LuthierCollections (cargador)
│   └── LuthierFrontmatter (parser YAML)
├── LuthierData (filtrar/ordenar)
└── LuthierLoop (renderizado)
```

### LuthierFrontmatter (data/frontmatter-parser.js)

Parser minimalista para frontmatter YAML:

```javascript
var resultado = LuthierFrontmatter.parse(contenidoMD);
// {
//     frontmatter: { title: "...", date: "...", tags: [...] },
//     body: "# Contenido Markdown..."
// }
```

**Soporta:** strings, números, booleanos, arrays (inline y multilinea), objetos anidados simples.

### LuthierCollections (data/collection-loader.js)

Carga múltiples archivos desde una carpeta:

```javascript
LuthierCollections.cargar('content/posts', opciones, function(items, error) {
    // items = array de objetos con frontmatter + body
});
```

**Opciones:**
- `ordenar`: campo para ordenar
- `orden`: 'asc' o 'desc'
- `limite`: número máximo de items
- `filtros`: objeto con condiciones

### Índice de Colección (index.json)

Para compatibilidad con `file:///`, cada carpeta usa un índice:

```json
{
  "files": ["articulo1.md", "articulo2.md"],
  "meta": {
    "articulo1.md": { "title": "...", "date": "..." }
  }
}
```

Generar con: `node tools/generate-index.js content/posts`

---

## Debugging

En desarrollo, Luthier muestra un mensaje en consola:

```
🎸 Luthier v1.4.0 cargado correctamente
```

Para debug adicional:
```javascript
console.log(window.LuthierComponents); // Ver componentes registrados
console.log(window.LUTHIER_CONFIG);    // Ver configuración
```

## Herramientas de Desarrollo

### build-bundle.js

Genera el bundle de producción combinando todos los componentes.

```bash
node tools/build-bundle.js
```

**Salida:**
- `dist/luthier.bundle.js` - Bundle completo para producción

**Funcionamiento:**
1. Lee los archivos fuente en orden de dependencias
2. Extrae el contenido de cada componente (sin wrapper IIFE individual)
3. Combina todo en un único IIFE
4. Incluye utilidades compartidas (`_calcularRutaBase`, etc.)

**Orden de carga:**
```
data/          → Helpers (LuthierData, LuthierDate, LuthierSearch)
ui/layout/     → Header, Footer, Sidebar, Layout
ui/navigation/ → Nav, Breadcrumbs
ui/content/    → Card, Loop, Accordion, Tabs, Carousel
ui/documents/  → DocLibrary, DocCard
ui/accessibility/ → A11yWidget
```

### validate-site.js

Valida la integridad del sitio detectando páginas huérfanas y enlaces rotos.

```bash
node tools/validate-site.js [directorio]
```

## Compatibilidad con GitHub Pages

El bundle incluye detección automática de GitHub Pages:

```javascript
// _calcularRutaBase() detecta github.io en el hostname
var isGitHubPages = hostname.indexOf('github.io') !== -1;

// Si es GitHub Pages, excluye el nombre del repo del cálculo de rutas
if (isGitHubPages && partes.length > 0) {
    partes.shift();
}
```

Esto permite que los enlaces funcionen correctamente cuando el sitio está en `https://usuario.github.io/proyecto/`.
