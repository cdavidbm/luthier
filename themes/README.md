# Temas de Luthier

Coleccion de temas predefinidos para personalizar rapidamente la apariencia de tu sitio.

## Uso

1. Copia el tema deseado a tu proyecto
2. Cargalo **despues** de `tokens.css`:

```html
<link rel="stylesheet" href="styles/tokens.css">
<link rel="stylesheet" href="themes/profesional.css">
```

## Temas Disponibles

### Profesional (`profesional.css`)

Paleta elegante con tonos azul marino y dorado.

- **Primario:** Navy (#002147)
- **Acento:** Dorado (#b38b40)
- **Ideal para:** Sitios corporativos, bufetes, consultoras, instituciones educativas

### Corporativo (`corporativo.css`)

Paleta moderna con azul vibrante y acentos naranjas.

- **Primario:** Azul (#2563eb)
- **Acento:** Naranja (#f97316)
- **Ideal para:** Empresas tecnologicas, startups, agencias

### Natural (`natural.css`)

Paleta organica con verdes y tonos tierra.

- **Primario:** Verde (#166534)
- **Acento:** Ambar (#ca8a04)
- **Ideal para:** Organizaciones ambientales, salud, bienestar, agricultura

## Modo Oscuro

Todos los temas incluyen variante oscura. Activa con la clase `tema-oscuro`:

```html
<body class="tema-oscuro">
```

## Crear tu Propio Tema

1. Copia cualquier tema como base
2. Modifica las variables CSS segun tus colores
3. Guarda con un nombre descriptivo

Variables principales a personalizar:

```css
:root {
    --l-color-primario: #tucolor;
    --l-color-primario-oscuro: #tucolor-oscuro;
    --l-color-primario-claro: #tucolor-claro;
    --l-color-secundario: #tucolor2;
    --l-color-acento: #tuacento;
    --l-fuente-principal: 'Tu Fuente', sans-serif;
}
```
