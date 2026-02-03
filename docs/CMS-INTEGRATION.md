# Integración con CMS Headless

Esta guía explica cómo usar Luthier con CMS Headless como Sveltia CMS o Decap CMS, manteniendo la filosofía de soberanía tecnológica del proyecto.

## ¿Qué es un CMS Headless?

Un CMS Headless (o CMS sin cabeza) separa completamente:
- **Backend**: Donde se gestiona el contenido (el CMS)
- **Frontend**: Donde se muestra el contenido (Luthier)

A diferencia de CMS tradicionales como WordPress o Drupal:
- No hay base de datos SQL
- El contenido se almacena como archivos Markdown con frontmatter YAML
- Todo está versionado en Git
- No hay "lock-in" - puedes editar los archivos directamente

## Compatibilidad con la filosofía Luthier

La integración con CMS Headless es **completamente opcional** y preserva todos los principios de Luthier:

| Principio | Sin CMS | Con CMS |
|-----------|---------|---------|
| Funciona con `file:///` | ✓ | ✓ (el sitio) |
| Sin dependencias externas | ✓ | ✓ (el CMS es opcional) |
| Control total del código | ✓ | ✓ |
| Contenido portable | ✓ | ✓ (Markdown plano) |

El CMS es simplemente una **interfaz visual opcional** para editar los mismos archivos Markdown que puedes editar manualmente.

## CMS Recomendados

### Sveltia CMS

- **Sitio**: https://github.com/sveltia/sveltia-cms
- **Ventajas**:
  - Interfaz moderna y rápida
  - Compatible con File System Access API (edición local sin servidor)
  - Fork mejorado de Decap CMS
  - Activamente mantenido

### Decap CMS

- **Sitio**: https://decapcms.org
- **Ventajas**:
  - Proyecto establecido (antes Netlify CMS)
  - Gran comunidad
  - Documentación extensa

## Estructura de archivos

```
mi-sitio/
├── index.html              # Página principal
├── articulo.html           # Template artículos
├── admin/
│   ├── index.html          # Cargador del CMS
│   └── config.yml          # Configuración de colecciones
└── content/
    ├── posts/
    │   ├── index.json      # Indice (necesario para file:///)
    │   ├── articulo-1.md
    │   └── articulo-2.md
    └── paginas/
        ├── index.json
        └── acerca.md
```

## Formato de archivos Markdown

Los archivos de contenido usan frontmatter YAML:

```markdown
---
title: Mi Artículo
date: 2026-02-03
author: Nombre del Autor
categoria: Tutorial
tags:
  - luthier
  - ejemplo
resumen: Descripción breve del artículo.
imagen: /content/imagenes/foto.jpg
draft: false
---

# Contenido del artículo

Aquí va el contenido en **Markdown**...
```

## Configuración del CMS

### admin/index.html

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Panel de Administración</title>
    <link
        href="https://unpkg.com/@sveltia/cms@0.40.0/dist/sveltia-cms.css"
        rel="stylesheet"
        integrity="sha384-XClTOqNF/rSg22VTk2RBWACZV7741K7+Xj9RmjP9potmZP6PIcJo8OWMti5IIaIN"
        crossorigin="anonymous">
</head>
<body>
    <script
        src="https://unpkg.com/@sveltia/cms@0.40.0/dist/sveltia-cms.js"
        integrity="sha384-yQEUDmuoSkgkqoO782Ju1i4flMDKZ7Lrppk7fQ/8VqmNFBHwrJ3dSZB+BlIDF3gv"
        crossorigin="anonymous"></script>
</body>
</html>
```

### admin/config.yml

```yaml
backend:
  name: github
  repo: tu-usuario/tu-repo
  branch: main

media_folder: "content/imagenes"
public_folder: "/content/imagenes"

collections:
  - name: "posts"
    label: "Articulos"
    folder: "content/posts"
    create: true
    extension: "md"
    format: "yaml-frontmatter"
    fields:
      - { name: title, label: Titulo, widget: string }
      - { name: date, label: Fecha, widget: datetime }
      - { name: author, label: Autor, widget: string }
      - { name: tags, label: Etiquetas, widget: list }
      - { name: body, label: Contenido, widget: markdown }
```

## Componentes Luthier para CMS

### LuthierContent

Carga contenido individual o colecciones:

```html
<!-- Archivo individual -->
<luthier-content src="content/posts/articulo.md">
    <template slot="header">
        <h1>{{title}}</h1>
        <time>{{date}}</time>
    </template>
</luthier-content>

<!-- Colección -->
<luthier-content
    collection="content/posts"
    ordenar="date"
    orden="desc"
    limite="10"
    export-to="POSTS">
</luthier-content>
```

### LuthierMarkdown con frontmatter

```html
<luthier-markdown
    src="content/posts/articulo.md"
    extract-frontmatter>
</luthier-markdown>

<script>
document.querySelector('luthier-markdown')
    .addEventListener('luthier:markdown-loaded', function(e) {
        console.log('Frontmatter:', e.detail.frontmatter);
        console.log('Body:', e.detail.body);
    });
</script>
```

### LuthierLoop para listar

```html
<luthier-content collection="content/posts" export-to="POSTS"></luthier-content>

<div class="posts-grid">
    <luthier-loop source="POSTS" template="card"></luthier-loop>
</div>
```

## Índice de colección (index.json)

Dado que los navegadores no pueden listar directorios con `file:///`, cada carpeta de contenido necesita un archivo `index.json`:

```json
{
  "generated": "2026-02-03T12:00:00Z",
  "generator": "luthier-generate-index",
  "version": "1.0.0",
  "count": 2,
  "files": ["articulo-1.md", "articulo-2.md"],
  "meta": {
    "articulo-1.md": {
      "title": "Primer Artículo",
      "date": "2026-02-03"
    },
    "articulo-2.md": {
      "title": "Segundo Artículo",
      "date": "2026-02-02"
    }
  }
}
```

### Generar el índice

Usa la herramienta incluida:

```bash
# Una carpeta específica
node tools/generate-index.js content/posts

# Todas las carpetas en content/
node tools/generate-index.js
```

**Importante**: Regenera el índice después de agregar o eliminar archivos.

## Flujo de trabajo

### Sin CMS (desarrollador)

1. Edita los archivos `.md` con tu editor favorito
2. Regenera `index.json` si agregas/eliminas archivos
3. Abre el HTML con doble clic o servidor local

### Con CMS (editor no técnico)

1. Accede a `/admin/` en el sitio desplegado
2. Usa la interfaz visual para crear/editar contenido
3. El CMS hace commit a Git automáticamente
4. El sitio se actualiza con el nuevo contenido

### Desarrollo local con Sveltia CMS

Chrome y Edge soportan File System Access API:

1. Inicia un servidor local:
   ```bash
   npx serve .
   # o
   python -m http.server 8000
   ```
2. Abre `http://localhost:8000/admin/`
3. Sveltia detecta el modo local automáticamente
4. Los cambios se guardan directamente en los archivos

## Mapeo de campos CMS → Luthier

| Campo CMS | Tipo Widget | Uso en Luthier |
|-----------|-------------|----------------|
| `title` | string | `{{title}}` en templates |
| `date` | datetime | `{{date}}` formateado |
| `author` | string | `{{author}}` |
| `tags` | list | `{{tags}}` como array |
| `body` | markdown | Contenido renderizado |
| `imagen` | image | `{{imagen}}` URL |

## Consideraciones de seguridad

### Integridad de recursos externos

Los archivos de Sveltia CMS deben cargarse con atributos SRI:

```html
<script
    src="https://unpkg.com/@sveltia/cms@0.40.0/dist/sveltia-cms.js"
    integrity="sha384-yQEUDmuoSkgkqoO782Ju1i4flMDKZ7Lrppk7fQ/8VqmNFBHwrJ3dSZB+BlIDF3gv"
    crossorigin="anonymous"></script>
```

Para calcular el hash de una nueva versión:

```bash
curl -s "https://unpkg.com/@sveltia/cms@VERSION/dist/sveltia-cms.js" \
    | openssl dgst -sha384 -binary \
    | openssl base64 -A
```

### Separación de concerns

- El CMS (`/admin/`) es la única parte que requiere internet
- El sitio principal funciona completamente offline
- El contenido es Markdown plano, portable a cualquier sistema

## Troubleshooting

### El sitio no carga los posts

1. Verifica que existe `content/posts/index.json`
2. Regenera el índice: `node tools/generate-index.js content/posts`
3. Verifica que los archivos `.md` tienen frontmatter válido

### El CMS no carga

1. Verifica conexión a internet (el CMS se carga desde CDN)
2. Verifica que `admin/config.yml` tiene sintaxis YAML correcta
3. En desarrollo local, usa un servidor HTTP (no `file:///`)

### Los cambios del CMS no aparecen

1. Regenera `index.json` después de agregar archivos
2. Recarga la página (Ctrl+F5)
3. Verifica que el archivo `.md` no tiene `draft: true`

## Ejemplo completo

Ver la carpeta `ejemplos/` para sitios de referencia con integración CMS.
