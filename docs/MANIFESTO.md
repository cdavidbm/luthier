# Filosofía del Proyecto

Luthier es un **Generador de Sitios Estáticos en Tiempo de Ejecución**: los componentes se renderizan en el navegador del usuario, sin paso de compilación previo ni servidor que procese peticiones.

Nace de la necesidad de crear herramientas web que respeten la **soberanía tecnológica** de las instituciones.

## Qué Significa Soberanía Tecnológica

Soberanía tecnológica significa que la entidad u organización:

- **No depende de la continuidad comercial** de ninguna empresa (Automattic/WordPress, Vercel, Netlify, etc.)
- **No está sujeta a cambios unilaterales** de términos de servicio
- **Puede auditar, modificar y transferir** el 100% del código sin restricciones legales
- **Mantiene la capacidad operativa** incluso si se corta el acceso a repositorios internacionales (npm, GitHub)

## Principios Fundamentales

### 1. Independencia de Infraestructura

**El contenido web no debería requerir servidores para ser visualizado.**

Un archivo HTML debería poder abrirse con doble clic y funcionar completamente. Las instituciones pequeñas, bibliotecas rurales, y usuarios sin conexión permanente merecen acceso a la información sin barreras técnicas.

### 2. Cero Dependencias Externas

**Tu sitio no debería dejar de funcionar porque un tercero apagó sus servidores.**

Luthier no depende de CDNs externos, APIs de terceros, ni servicios en la nube. Todo el código necesario está contenido en archivos locales que controlas completamente.

### 3. Tecnología Comprensible

**El código fuente debe ser legible por cualquier desarrollador.**

Usamos JavaScript vanilla, sin transpilación, sin frameworks, sin abstracciones innecesarias. Un desarrollador junior puede leer y entender el código en una tarde.

### 4. Núcleo Mínimo

**Cuatro componentes estructuran el sitio. El resto es opcional.**

Layout, Nav, Header y Footer centralizan lo que de otro modo habría que repetir en cada archivo. Los demás componentes (Card, Accordion, Tabs) son herramientas de conveniencia; puedes usar HTML plano en su lugar.

### 5. Estándares Web

**Apostamos por tecnologías nativas del navegador.**

Web Components, Custom Elements, CSS Variables son estándares W3C que estarán disponibles durante décadas. `HTMLElement` está en la especificación del W3C desde 2011 y es parte del DOM. Un componente escrito hoy funcionará en 2045 sin "migración".

### 6. Accesibilidad como Requisito

**La accesibilidad no es una característica opcional.**

Cada componente incluye ARIA roles, navegación por teclado, y respeto por preferencias del usuario (movimiento reducido, alto contraste).

### 7. Seguridad por Diseño: Superficie de Ataque Cero

**Sin backend, base de datos ni panel de administración, se eliminan los vectores de ataque más comunes.**

- **Inmunidad a inyecciones**: SQL, NoSQL, Command, LDAP - ninguna aplica porque no hay backend que interprete comandos
- **Sin vulnerabilidades de servidor**: Al ser archivos estáticos, se eliminan de raíz los exploits dirigidos a CMS o motores de backend
- **Integridad garantizada**: Un atacante necesitaría acceso físico al sistema de archivos para alterar el contenido

---

## Para Qué Sirve

Luthier es ideal para **sitios web cuya función principal es presentar información**, no procesarla. Específicamente:

### Repositorios Documentales

Sitios cuya función es organizar, catalogar y presentar grandes cantidades de documentos: normativas, resoluciones, actas, manuales, informes. Luthier incluye componentes especializados (`luthier-doc-library`, `luthier-doc-card`) con filtros, búsqueda y categorización.

### Sitios Institucionales e Informativos

Páginas que presentan información sobre una organización: misión, visión, estructura, servicios, noticias, eventos. El contenido cambia con poca frecuencia y no requiere interacción transaccional.

### Bibliotecas y Archivos Digitales

Instituciones que preservan documentos para futuras generaciones. Los archivos HTML son el formato de preservación digital más estable que existe: un sitio Luthier puede abrirse desde un USB en 15 años.

### Portafolios y Catálogos

Presentación de trabajos, productos o colecciones donde la función es mostrar, no vender ni procesar pedidos.

### Documentación Técnica

Manuales, guías, referencias de API. El contenido es estático y la navegación es la funcionalidad principal.

### Sitios de Emergencia y Contingencia

Sitios que deben funcionar offline, desde una intranet, o cuando la conectividad es limitada. El protocolo `file:///` garantiza funcionamiento sin servidor.

### Proyectos Educativos

Enseñanza de desarrollo web sin la complejidad de frameworks modernos. El código es 100% auditable y comprensible.

---

## Limitaciones: Para Qué NO Sirve Luthier

Luthier **no es la herramienta adecuada** cuando el sitio requiere:

### Autenticación y Sesiones de Usuario

Si necesitas login, roles, permisos, o contenido personalizado por usuario, necesitas un backend. Luthier no puede verificar credenciales ni mantener sesiones.

### Formularios Transaccionales

PQRS, denuncias, solicitudes, inscripciones - cualquier formulario que deba **guardar datos de forma persistente** requiere un servidor o servicio externo que los reciba y almacene.

> **Nota**: Luthier puede mostrar formularios que envíen datos a servicios externos (APIs, sistemas de tickets, etc.), pero no puede procesarlos por sí mismo.

### Comercio Electrónico

Carritos de compra, pagos, inventario, seguimiento de pedidos - todo esto requiere estado persistente y procesamiento del lado del servidor.

### Contenido Generado por Usuarios

Comentarios, foros, wikis colaborativas, redes sociales - si los usuarios deben poder crear contenido, necesitas un backend que lo almacene.

### Búsqueda en Grandes Volúmenes

La búsqueda de Luthier funciona en memoria del navegador. Para miles de documentos funciona bien; para millones, necesitarías un motor de búsqueda dedicado.

### Actualizaciones en Tiempo Real

Dashboards con datos en vivo, notificaciones push, chat - requieren conexiones persistentes a un servidor.

---

## Por Qué No Usa Backend

### El Problema de los CMS Tradicionales

Los sistemas de gestión de contenido (WordPress, Drupal, Joomla) fueron diseñados para una era donde:

- Editar HTML era difícil para no-técnicos
- Los navegadores eran limitados
- JavaScript era lento e inconsistente

Estos sistemas resolvieron el problema agregando capas: base de datos, servidor de aplicaciones, panel de administración, plugins. Cada capa es un vector de ataque y un punto de falla.

### La Realidad de los Sitios Informativos

La mayoría de sitios institucionales:

- Actualizan contenido **semanalmente o mensualmente**, no en tiempo real
- Son mantenidos por **una o dos personas**, no equipos concurrentes
- Tienen **cientos o miles** de páginas, no millones
- Requieren **mostrar** información, no **procesarla**

Para estos casos, un servidor procesando cada petición es como usar un camión de 18 ruedas para ir a comprar pan.

### La Solución de Luthier

Luthier elimina las capas innecesarias:

| Componente | CMS Tradicional | Luthier |
|------------|-----------------|---------|
| Contenido | Base de datos | Archivos HTML/JSON |
| Presentación | Motor de plantillas en servidor | Web Components en navegador |
| Administración | Panel web con login | Edición directa de archivos |
| Servidor | Requerido 24/7 | No requerido |

El resultado es un sitio que:

- **Carga instantáneamente** (archivos estáticos, sin consultas a DB)
- **No puede ser hackeado** vía inyección (no hay intérprete de comandos)
- **Funciona offline** (protocolo `file:///`)
- **Cuesta centavos** en hosting (solo almacenamiento, no procesamiento)
- **Dura décadas** sin migraciones forzosas

---

## Integración con CMS Headless

### El CMS es Opcional, No Obligatorio

Luthier puede integrarse con CMS Headless como **Sveltia CMS** o **Decap CMS**, pero esta integración es completamente **opcional**. Un sitio Luthier funciona perfectamente sin ningún CMS.

### Sin Lock-in

A diferencia de WordPress o Drupal donde el contenido está atado a una base de datos propietaria, con un CMS Headless:

- El contenido son **archivos Markdown planos** que puedes editar con cualquier editor de texto
- Puedes cambiar de CMS o eliminarlo completamente sin perder nada
- Todo está versionado en Git
- El sitio sigue funcionando con `file:///` incluso si no usas el CMS

### ¿Por Qué Considerar un CMS Headless?

| Sin CMS | Con CMS |
|---------|---------|
| Editas archivos .md directamente | Interfaz visual para no-programadores |
| Control total del workflow | Panel de administración web |
| Ninguna dependencia externa | CMS carga desde CDN (solo en /admin/) |
| Ideal para desarrolladores | Ideal para equipos mixtos |

### La Metáfora del Editor

Un CMS Headless es como **VS Code para editores no-técnicos**: proporciona una interfaz amigable para editar los mismos archivos que un desarrollador editaría manualmente. El archivo resultante es idéntico.

De la misma forma que puedes escribir LaTeX con un editor visual o directamente en código, un CMS Headless te da la opción de gestionar contenido visualmente sin sacrificar la portabilidad.

### Documentación

Ver [CMS-INTEGRATION.md](CMS-INTEGRATION.md) para la guía completa de integración.

---

**Documentación completa**: [luthier.readthedocs.io](https://luthier.readthedocs.io/)
