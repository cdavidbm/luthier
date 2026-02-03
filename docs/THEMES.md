# Temas

Luthier incluye temas predefinidos para personalizar rápidamente la apariencia de tu sitio.

## Uso

1. Copia el tema deseado a tu proyecto
2. Cárgalo **después** de `tokens.css`:

```html
<link rel="stylesheet" href="styles/tokens.css">
<link rel="stylesheet" href="themes/profesional.css">
```

## Temas Disponibles

### Profesional

Paleta elegante con tonos azul marino y dorado.

| Variable | Valor |
|----------|-------|
| `--l-color-primario` | #002147 (Navy) |
| `--l-color-acento` | #b38b40 (Dorado) |

**Ideal para:** Sitios corporativos, bufetes, consultoras, instituciones educativas, organizaciones formales.

```html
<link rel="stylesheet" href="themes/profesional.css">
```

---

### Corporativo

Paleta moderna con azul vibrante y acentos naranjas.

| Variable | Valor |
|----------|-------|
| `--l-color-primario` | #2563eb (Azul) |
| `--l-color-acento` | #f97316 (Naranja) |

**Ideal para:** Empresas tecnológicas, startups, agencias, organizaciones con imagen dinámica.

```html
<link rel="stylesheet" href="themes/corporativo.css">
```

---

### Natural

Paleta orgánica con verdes y tonos tierra.

| Variable | Valor |
|----------|-------|
| `--l-color-primario` | #166534 (Verde) |
| `--l-color-acento` | #ca8a04 (Ámbar) |

**Ideal para:** Organizaciones ambientales, salud, bienestar, agricultura, proyectos sostenibles.

```html
<link rel="stylesheet" href="themes/natural.css">
```

---

## Modo Oscuro

Todos los temas incluyen variante oscura. Activa con la clase `tema-oscuro`:

```html
<body class="tema-oscuro">
```

O mediante JavaScript:

```javascript
document.body.classList.toggle('tema-oscuro');
```

---

## Crear tu Propio Tema

1. Copia cualquier tema como base
2. Modifica las variables CSS según tus colores
3. Guarda con un nombre descriptivo

### Variables Principales

```css
:root {
    /* Colores de marca */
    --l-color-primario: #tucolor;
    --l-color-primario-oscuro: #tucolor-oscuro;
    --l-color-primario-claro: #tucolor-claro;

    --l-color-secundario: #tucolor2;
    --l-color-secundario-oscuro: #tucolor2-oscuro;
    --l-color-secundario-claro: #tucolor2-claro;

    --l-color-acento: #tuacento;

    /* Tipografía */
    --l-fuente-principal: 'Tu Fuente', sans-serif;
    --l-fuente-titulos: 'Tu Fuente Títulos', sans-serif;

    /* Bordes y sombras */
    --l-radio-sm: 0.25rem;
    --l-radio-md: 0.5rem;
    --l-sombra-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Variante Oscura

Incluye siempre la variante oscura:

```css
.tema-oscuro {
    --l-color-primario: #version-clara-para-fondo-oscuro;
    --l-color-fondo: #1a1a1a;
    --l-color-fondo-secundario: #2d2d2d;
    --l-color-texto: #e0e0e0;
}
```

---

## Cargar Fuentes Externas

Si tu tema usa fuentes de Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="themes/profesional.css">
```

Los temas incluidos usan fuentes del sistema como fallback, por lo que funcionan sin conexión a internet.
