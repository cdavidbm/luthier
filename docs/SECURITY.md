# Seguridad de Luthier

## Análisis de Seguridad

Luthier ha sido diseñado con seguridad en mente, siguiendo las mejores prácticas para aplicaciones web estáticas.

## Comparativa OWASP Top 10

### A01:2021 - Broken Access Control
**Estado: N/A**

Luthier es un toolkit de frontend para sitios estáticos. No maneja autenticación ni autorización del lado del servidor.

**Recomendación:** Si necesitas control de acceso, impleméntalo en el servidor que sirve los archivos.

### A02:2021 - Cryptographic Failures
**Estado: N/A**

Luthier no maneja datos sensibles ni criptografía. No almacena contraseñas ni datos de pago.

**Datos en localStorage:**
- Preferencias de accesibilidad (no sensibles)

### A03:2021 - Injection
**Estado: Mitigado**

**XSS (Cross-Site Scripting):**
- Todos los valores dinámicos se escapan con `LuthierUtils.escaparHTML()` antes de insertarse en el DOM
- Las URLs de atributos `href` se sanitizan con `LuthierUtils.sanitizarURL()` (solo permite `http:`, `https:`, `/` y rutas relativas)
- Los enlaces externos incluyen `rel="noopener noreferrer"` para prevenir acceso a `window.opener`
- Los datos de `LUTHIER_CONFIG` deben ser definidos por el desarrollador, no por usuarios finales

**Recomendaciones:**
1. No insertes entrada de usuario sin sanitizar en `LUTHIER_CONFIG`
2. Valida cualquier dato externo antes de pasarlo a componentes

### A04:2021 - Insecure Design
**Estado: Mitigado**

- Arquitectura minimalista reduce superficie de ataque
- Sin dependencias externas que puedan ser comprometidas
- Código abierto y auditable

### A05:2021 - Security Misconfiguration
**Estado: Mitigado**

- Sin configuraciones de servidor (es HTML estático)
- Sin endpoints de administración
- Sin credenciales por defecto

### A06:2021 - Vulnerable and Outdated Components
**Estado: Mitigado**

- **Cero dependencias externas**
- No usa librerías de terceros
- Código vanilla JS actualizable manualmente

### A07:2021 - Identification and Authentication Failures
**Estado: N/A**

Luthier no implementa autenticación. Es responsabilidad del servidor/CDN.

### A08:2021 - Software and Data Integrity Failures
**Estado: Mitigado**

- Sin pipeline de CI/CD complejo
- Sin serialización de datos remotos
- Bundle verificable localmente

**Recomendación:** Usa Subresource Integrity (SRI) si sirves el bundle desde CDN.

### A09:2021 - Security Logging and Monitoring Failures
**Estado: N/A**

Luthier es frontend puro. El logging debe implementarse en el servidor.

### A10:2021 - Server-Side Request Forgery (SSRF)
**Estado: N/A**

No hay componentes del lado del servidor.

## Prácticas de Seguridad Implementadas

### 1. Content Security Policy (CSP)

Recomendamos la siguiente CSP para sitios que usan Luthier:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'none';
    frame-ancestors 'none';
">
```

Nota: `'unsafe-inline'` es necesario para el CSS y el script de configuración inline.

### 2. Uso de atributos rel

Todos los enlaces externos incluyen:
```html
<a href="..." target="_blank" rel="noopener noreferrer">
```

- `noopener`: Previene acceso a `window.opener`
- `noreferrer`: No envía header Referer

### 3. Sanitización de Datos

Los componentes usan `LuthierUtils` para escapar datos antes de renderizar:

```javascript
// Escapar texto para prevenir XSS
var tituloSeguro = LuthierUtils.escaparHTML(config.titulo);
// Sanitizar URLs para prevenir javascript: y data:
var archivoSeguro = LuthierUtils.sanitizarURL(config.archivo);
html += '<a href="' + archivoSeguro + '">' + tituloSeguro + '</a>';
```

### 4. Sin eval()

Luthier **nunca** usa:
- `eval()`
- `new Function()`
- `setTimeout/setInterval` con strings

### 5. Strict Mode

Todo el código usa `'use strict'` para prevenir errores silenciosos.

## Vectores de Ataque Potenciales

### 1. Contenido Malicioso en LUTHIER_CONFIG

**Riesgo:** Si un atacante puede modificar `LUTHIER_CONFIG`, podría inyectar contenido malicioso.

**Mitigación:**
- `LUTHIER_CONFIG` se define en HTML estático, no desde entrada de usuario
- No cargues configuración desde fuentes no confiables

### 2. Datos Maliciosos en Arrays (DOCUMENTOS, ARTICULOS)

**Riesgo:** Si los datos contienen HTML malicioso, podría ejecutarse.

**Mitigación:**
- Los componentes escapan automáticamente los datos con `LuthierUtils.escaparHTML()` antes de renderizar
- Las URLs se sanitizan con `LuthierUtils.sanitizarURL()` para bloquear esquemas peligrosos
- Valida datos de fuentes externas antes de asignarlos a variables globales

### 3. Ataques de Clickjacking

**Mitigación:**
```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

O en headers del servidor:
```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none';
```

## Recomendaciones de Despliegue

### 1. Headers de Seguridad

Configure su servidor para enviar:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 2. HTTPS

Siempre sirva el sitio sobre HTTPS en producción.

### 3. Integridad de Archivos

Si usa CDN, implemente Subresource Integrity:

```html
<script src="luthier.bundle.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 4. Actualizaciones

Revise periódicamente el repositorio para actualizaciones de seguridad.

## Reporte de Vulnerabilidades

Si descubre una vulnerabilidad de seguridad:

1. No la divulgue públicamente
2. Envíe un reporte detallado a [email del proyecto]
3. Espere confirmación antes de divulgar

## Historial de Seguridad

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.4.1 | 2026-02 | Sanitización centralizada con LuthierUtils |
| 1.4.0 | 2026-01 | Nuevos componentes con sanitización de datos |
| 1.0.0 | 2025-11 | Release inicial - Sin vulnerabilidades conocidas |
