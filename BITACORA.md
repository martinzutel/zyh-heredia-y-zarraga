# Bitácora del proyecto — ZYH (Zarraga y Heredia)

> Registro de trabajo para retomar contexto e intención entre sesiones.
> Actualizar esta bitácora al final de cada sesión de trabajo relevante,
> agregando entradas nuevas arriba de "Estado actual" — no reescribir el
> historial.

## Qué es esto

Sitio web estático (una sola página) para **ZYH**, un desarrollo
inmobiliario de **AFRa Arquitectos** (fideicomiso al costo, Buenos
Aires — esquina Heredia y Zarraga, zona Chacarita/Villa Ortúzar).
Convierte el folleto comercial en PDF (`AFRa_ZYH_folleto2025.pdf`, en
el Desktop del usuario, fuera del repo) en un sitio navegable,
responsive y con identidad propia.

**Dueño real del contenido:** todo el texto, medidas, especificaciones
e imágenes provienen del PDF original. No se inventó información
(precios de m², contacto real, etc. — donde el PDF no daba datos
verificables como teléfono/mail, se usó el QR real del folleto en vez
de fabricar un contacto).

**Autoría de commits:** todos los commits deben quedar únicamente a
nombre del usuario (`martinzutel <martinzutel@gmail.com>`, que es la
config git local/global del repo). Nunca agregar trailers tipo
`Co-Authored-By: Claude`.

## Estructura del repo

```
afra-zyh/
├── index.html              # única página, todas las secciones
├── css/styles.css          # sistema de diseño completo
├── js/script.js            # Lenis + GSAP/ScrollTrigger + fallback IO
├── assets/images/           # imágenes finales optimizadas (versionadas)
├── extraction/               # RAW extraído del PDF (gitignored, no tocar en git)
│   ├── pages/               # cada página del PDF renderizada a PNG
│   └── images/               # imágenes embebidas extraídas con pymupdf
├── .claude/launch.json      # config de servidor de preview (ver limitación abajo)
└── BITACORA.md               # este archivo
```

## Cómo se extrajo el contenido del PDF

- El entorno no tenía `poppler` ni `pdftoppm`/`pdfimages` (no hay
  Homebrew instalado). Se instaló `pymupdf` vía `pip3 install pymupdf`
  (sí hay acceso a internet/pip).
- Texto: `page.get_text()` por página.
- Páginas completas como imagen: `page.get_pixmap(matrix=fitz.Matrix(2,2))`
  → sirvió para *revisar visualmente* el folleto (leer con la tool
  `Read`, que soporta imágenes).
- Imágenes embebidas limpias (sin el texto/overlay del folleto):
  `page.get_images(full=True)` + `fitz.Pixmap(doc, xref)`, filtrando
  por tamaño para separar fotos/renders grandes de iconos chicos.
- El logo de AFRa se extrajo con fondo negro y se le hizo chroma-key a
  transparente (blanco sobre transparente) con PIL para poder usarlo
  sobre fondos oscuros.
- Mapeo final de assets usados en el sitio (en `assets/images/`):
  `hero-building.jpg`, `facade-evening.jpg`, `construction.jpg`,
  `interior-terrace.jpg`, `interior-living.jpg`, `plan-zarraga-iso.jpg`,
  `plan-heredia-iso.jpg`, `floorplan-full.png`, `map-wide.jpg`,
  `map-zoom.jpg`, `logo-afra.png`, `qr-code.png`.

## Decisiones de diseño

### V1 (primer pase, descartado como "genérico")
Hero centrado con imagen de fondo + scrim, paleta navy `#3f4152` +
crema, tipografía Cormorant Garamond (serif) + Jost (sans), tarjetas
redondeadas, reveal on-scroll con IntersectionObserver simple. El
usuario pidió explícitamente que **no se pareciera a los sitios
típicos generados por IA** (ese patrón centrado + serif elegante +
fade-in es exactamente eso).

### V2 (actual) — identidad "hoja de obra técnica"
Pedido del usuario: más contraste/legibilidad, uso de **librerías de
animación reales** (no solo CSS), tipografías con carácter propio, y
un layout distinto al de proyectos típicos de Claude.

- **Hero asimétrico de dos paneles**: panel oscuro a la izquierda +
  imagen a sangre a la derecha — es literalmente la composición de la
  tapa del folleto original, no un layout inventado genérico.
- **Motivo arquitectónico/técnico repetido**: secciones numeradas como
  un set de planos (`A—01` … `A—06`), marcas de registro en las
  esquinas del viewport, líneas/marcas de cota en tarjetas de
  unidades, tablas de dimensiones, placa "H 1395", blueprint SVG que
  se dibuja al hacer scroll.
- **Tipografía**: `Fraunces` (display serif con carácter, variable) +
  `Space Grotesk` (sans) + `Space Mono` (anotaciones técnicas/números).
  Cargadas por Google Fonts.
- **Paleta**: papel cálido `#f1ebe0` / tinta `#17181f` / navy oscuro
  `#24222f` / acento terracota `#a8461f` (ajustado, ver abajo).
- **Animación real**: GSAP + ScrollTrigger (CDN unpkg) para el
  split-text del hero, reveals coreografiados, parallax de la imagen
  de portada y el dibujo del blueprint; Lenis para scroll suave;
  cursor custom y botones magnéticos en desktop; fallback a
  `IntersectionObserver` si el CDN de GSAP no carga (nunca debe quedar
  contenido invisible).
- **Galería** como carrusel de arrastre (drag-scroll con Pointer
  Events) en vez de grid estático.

### Contraste V2 — verificado a mano (WCAG)
El usuario pidió expresamente buen contraste/legibilidad. Se calculó
luminancia relativa y ratio de contraste a mano para las combinaciones
de texto sobre fondo, y se corrigieron dos que fallaban AA (4.5:1):
- `--accent` (terracota como texto chico sobre papel claro): estaba en
  ~4.0:1 → oscurecido de `#c1502a` a `#a8461f` (~5:1).
- `--ink-faint` (gris apagado, labels chicos sobre papel): estaba en
  ~3.2:1 → oscurecido de `#85818c` a `#5f5c68` (~5.5:1).
- `--on-dark-faint` (gris sobre navy): estaba justo en el límite
  (~4.6:1) → aclarado a `#9995a8` (~5.4:1) para dar margen.
- `--accent-light` (naranja sobre navy, usado para labels/números en
  secciones oscuras) ya pasaba (~4.9:1), no se tocó.

### V3 (actual) — reescritura completa a partir de una referencia del usuario
El usuario bajó un HTML de referencia (`~/Downloads/zyh-heredia-zarraga.html`,
1.5&nbsp;MB con imágenes embebidas en base64) y pidió: "basate en esto,
hacé algo muy parecido, dejalo mega pulido, revisá el código para sacar
cualquier bloat inútil, y sacá el mouse animado (el cursor custom de la
V2)". Se interpretó como: adoptar el sistema de diseño y la estructura
de esa referencia casi 1:1, pero servido con los assets reales ya
extraídos del PDF (no los base64 del archivo de referencia) y con el
código auditado a fondo.

- **Paleta nueva**: `--ink:#22242C` / `--concrete:#EDEAE3` /
  `--concrete-2:#E1DDD3` / `--slate:#4A4D59` / `--wood:#B08659`. Se
  abandona la paleta navy/terracota de la V2 por esta, tomada
  literalmente de la referencia.
- **Tipografía nueva**: `Fraunces` (display) + `Inter` (texto) +
  `IBM Plex Mono` (anotaciones). Reemplaza a Space Grotesk/Space Mono
  de la V2 — combinación más editorial/profesional, menos "creada por
  IA".
- **Se eliminó por completo** (pedido explícito del usuario, y por
  auditoría propia de código muerto/bloat): GSAP, ScrollTrigger, Lenis
  (los tres CDN de unpkg), el cursor personalizado (dot + ring que
  seguía el mouse), los botones magnéticos, las marcas de registro
  fijas en las esquinas del viewport, el overlay de grano/ruido, el
  blueprint SVG que se dibujaba con scroll, el sello circular
  giratorio, la marquesina de texto infinito y la galería de
  drag-scroll con Pointer Events. El JS quedó en ~35 líneas: reveal
  on-scroll con `IntersectionObserver`, un toggle de tabs para
  alternar entre Unidad Zárraga/Heredia, y un menú mobile simple.
  Motivo: la referencia del usuario logra el mismo nivel de pulido
  sin nada de eso — esas piezas eran ornamento, no valor real.
- **Estructura de secciones** (siguiendo la referencia casi 1:1, ids en
  español para los anchors): hero (imagen a sangre + scrim + stats) →
  `#lote` (fondo oscuro, 4 razones numeradas + 2 mapas) → `#galeria`
  (grid asimétrico 1 foto alta + 2 apiladas) → banner de obra en
  construcción (agregado propio, no está en la referencia — se
  reincorporó `construction.jpg`, que sí es una foto real del folleto
  y no tenía lugar en la estructura de la referencia) → `#unidades`
  (tabs Zárraga/Heredia con plano isométrico + tabla de dimensiones) →
  `#especificaciones` (fondo oscuro, grid 2 columnas, se sumó un
  octavo ítem "Obra" con fechas de inicio/entrega) → `#financiacion`
  (payment-card + timeline vertical) → strip de stats de AFRa →
  `#contacto` (WhatsApp + datos reales) → footer.
- **Contacto real**: la referencia del usuario trae datos reales de
  contacto (antes no los teníamos y no se iban a inventar) —
  WhatsApp `https://wa.me/5491131308007`, teléfono
  `+54 9 11 3130-8007`, y el sitio del estudio
  `https://www.estudioafra.com/`. Se usaron tal cual los trajo el
  usuario. Se sacó el bloque de QR de la V2 (ya no hace falta, el
  WhatsApp cumple mejor esa función).
- **Menú mobile**: la referencia del usuario esconde `nav.links` por
  debajo de 820px sin ningún reemplazo (los links quedan
  inaccesibles en mobile). Se consideró un gap real de usabilidad y
  se agregó un toggle hamburguesa + panel desplegable simple (CSS
  `max-height` + JS mínimo) — no estaba en la referencia pero es
  necesario para "mega pulido" en un sitio que se promete responsive.

### Contraste V3 — segunda pasada de verificación
Se repitió el cálculo de contraste (script Python con la fórmula de
luminancia relativa de WCAG) sobre la paleta nueva completa antes de
dar por cerrado el trabajo:
- Todos los pares texto/fondo principales (`--slate` sobre
  `--concrete`/`--white`, `--ink` sobre `--concrete`, blancos con
  opacidad sobre `--ink`) pasaban entre 6.5:1 y 12.9:1 sin tocar nada.
- `--wood` como texto/gráfico sobre fondo **oscuro** (`.reason .num`,
  `.spec-item h4`) pasa ~4.7:1, se dejó igual.
- `--wood` como texto/gráfico sobre fondo **claro** (`.unit-meta`, el
  ícono `.eyebrow .angle` en secciones claras, el subrayado de
  `nav.links a:hover`, el punto de `.tl-item` en el timeline) daba
  2.4–2.7:1 — **fallaba**, heredado tal cual de la referencia del
  usuario. Se agregó un token nuevo `--wood-deep:#835529` (mismo tono,
  más oscuro) usado solo en esos casos puntuales sobre fondo claro;
  queda en 4.7–5.3:1. `--wood` original se conserva intacto para
  fondo oscuro y para el botón `.btn-primary` (fondo madera + texto
  `--ink`, ese par ya daba 4.7:1 sin cambios).

### V4 — foto de obra mejorada + pasada completa de mobile
Pedido del usuario: mejorar la foto de los obreros con cascos
(`construction.jpg`, la del banner "Obra en construcción"), y dejar
todo el sitio "exquisito y fluido" en mobile — tamaños y
distribuciones balanceadas, intuitivas, simples, sin clutter.

**Mejora de imagen** — no hay Homebrew ni acceso a un servicio externo
de super-resolución, así que se instaló `opencv-python-headless` +
`numpy` por pip y se armó un pipeline con OpenCV a partir del PNG
fuente sin comprimir (`extraction/images/p03_x40_900x1277.png`, no de
la copia JPEG ya comprimida):
1. `bilateralFilter` para bajar el ruido de la compresión JPEG
   original sin perder bordes.
2. CLAHE (`clipLimit=2.2`, tiles 8×8) sobre el canal L en LAB — sube
   el contraste local y saca el aspecto "lavado"/con neblina sin
   quemar las luces altas.
3. Boost de saturación (+16%) y de brillo (+3%) en HSV.
4. Upscale 1.6× con Lanczos (900×1277 → 1440×2043) + unsharp mask
   para compensar el softening del escalado.
5. Ajuste final de niveles (contraste +4%, +3 de brillo).

Resultado: mucho más definición (se ve la textura de la madera y el
hierro), colores más vivos, sigue siendo la foto real del folleto (no
se generó ni se inventó contenido, solo se realzó lo que ya estaba).
Se reemplazó `assets/images/construction.jpg` (656&nbsp;KB, JPEG
progresivo calidad 84). También se ajustó `object-position:50% 38%`
en `.obra-banner img` para que el recorte del banner ancho quede
centrado en los obreros y no en el pozo vacío de arriba.

**Pasada de mobile** — se auditó `css/styles.css` completo buscando
tanto bugs reales como oportunidades de pulido:
- **Bug real**: `.hero-content` tenía `padding:… 32px 72px` (shorthand)
  que pisaba el padding fluido de `.wrap` en el mismo elemento — el
  hero quedaba con más aire lateral que el resto de las secciones en
  mobile. Se separó en `padding-top`/`padding-bottom` longhand para
  que el padding horizontal lo controle únicamente `.wrap`.
- **Bug real**: `.unit-toggle-wrap` (los botones "Unidad Zárraga" /
  "Unidad Heredia") no tenía `flex-wrap` ni ancho controlado — en
  pantallas angostas (~320–360px) el texto de los dos botones podía
  no entrar. Se pasó a `flex:1 1 0` con texto centrado: ahora son un
  control segmentado de ancho igual que siempre entra exacto,
  cualquiera sea el ancho de pantalla.
- **Bug real**: `figcaption` (los labels sobre las fotos de la
  galería) no tenía `max-width`, así que en el layout de 2 columnas
  de `.gallery-stack` en mobile (`≤520px`) el texto largo se salía del
  cuadro y quedaba cortado por el `overflow:hidden` del `figure`
  padre. Se agregó `max-width:calc(100% - 40px)` (y una versión más
  chica para el layout de 2 columnas) para que el texto haga wrap en
  vez de cortarse.
- **Fluidez real** (pedido explícito de "fluido"): se reemplazaron
  varios saltos bruscos por breakpoint (`.wrap` 32px→20px a los
  640px, `section` 120px→80px a los 820px) por `clamp()` con `vw`, que
  interpola suavemente en todo el rango en vez de saltar de golpe en
  un punto fijo. Se extendió el mismo criterio a paddings de
  `.payment-card`, `.spec-item`, `.studio`, gaps de `.hero-stats` /
  `.unit-totals` / `.studio-stats`, y tamaños de fuente de
  `.hero-eyebrow`, `.hero-address`, `.hero-stat b`, `.section-head p`,
  `.contact h2`/`p.lead`.
- **Balance/simplicidad**: se redujo la altura de `.obra-banner` en
  mobile (46vh→34vh) y de `.gallery figure.tall` en pantallas chicas
  (640px→300px) para que la galería no se sienta pesada de scrollear;
  se agrandó el hit-target del botón de menú mobile de 34px a 44px
  (mínimo recomendado para touch); se ocultó el subtítulo del logo
  ("Fideicomiso al costo" en el nav) por debajo de 380px para aliviar
  la barra superior; los dos botones de `.contact-actions` (WhatsApp /
  Nuestro estudio) pasan a apilarse a ancho completo por debajo de
  480px en vez de quedar centrados en dos líneas.
- Se volvió a correr el chequeo automático de: balance de llaves CSS,
  que cada clase usada en el HTML tenga regla, y que ninguna variable
  CSS quede sin usar — todo limpio.

### Deploy — GitHub + Vercel
El repo local venía existiendo desde el principio pero **nunca tuvo
remoto** (se confirmó con `git remote -v` vacío) hasta esta sesión.
Se creó y conectó todo:

- **GitHub**: `gh auth login --web` (login interactivo, lo hizo el
  usuario — no es algo que se pueda hacer en su nombre). Repo creado
  con `gh repo create zyh-heredia-y-zarraga --public --source=.
  --remote=origin --push`. Nombre y descripción son descriptivos a
  pedido del usuario (no `afra-zyh` genérico). **Es público a pedido
  explícito del usuario** — el clasificador de auto-mode bloqueó el
  primer intento porque el usuario solo había dicho "creá el repo"
  sin especificar visibilidad; se le preguntó explícitamente y
  contestó que lo quiere público porque tiene que quedar como uno de
  sus trabajos mostrables en su perfil de GitHub. **No asumir
  público por defecto en repos de este usuario en el futuro sin
  confirmar** — en este caso puntual sí lo quiere así, pero fue una
  decisión explícita, no un default.
  → https://github.com/martinzutel/zyh-heredia-y-zarraga
- **Vercel**: `npx vercel login` (login interactivo por navegador, lo
  hizo el usuario). Deploy con `npx vercel --prod`, que además detectó
  el repo de GitHub y lo conectó automáticamente — **a partir de
  ahora cada push a `main` dispara un deploy automático en Vercel**,
  no hace falta correr `vercel --prod` a mano de nuevo salvo que se
  quiera forzar un deploy sin pushear.
  → https://zyh-heredia-y-zarraga.vercel.app
- Sitio estático sin build step (HTML/CSS/JS planos), Vercel lo sirve
  tal cual sin necesitar `vercel.json` ni configuración adicional.
- **No se hizo `npm install -g vercel`** porque falló por permisos
  (`EACCES`, típico de Node instalado sin nvm) y no correspondía usar
  `sudo` para esto. Se usó `npx --yes vercel <comando>` en su lugar,
  que funciona igual sin instalación global — usar ese patrón para
  cualquier comando de Vercel CLI en este proyecto de ahora en más.

### V5 — encuadre del banner de obra corregido
El usuario avisó que "el obrero del casco amarillo no se termina de
ver bien" en el banner de obra. La causa: en V4 se había puesto
`object-position:50% 38%` a ojo, sin medir. Se detectaron las
coordenadas reales del casco amarillo con OpenCV (`cv2.inRange` en
HSV + `findContours`, buscando blobs amarillos grandes) sobre
`construction.jpg` (1440×2043 post-enhance): el casco del obrero
principal está en y=994–1136px, o sea 48.7%–55.6% de la altura de la
imagen. Con `38%` como centro del recorte, el banner cortaba justo
por encima de esa zona en la mayoría de los anchos de pantalla —
el obrero principal quedaba prácticamente fuera de cuadro.

Se generaron previews reales del recorte (simulando tanto el aspect
ratio ancho de desktop ~1920×460 como el más vertical de mobile
~390×240) probando varios valores de `object-position` Y (30/38/45/
50/58/65%) antes de elegir. El centro natural de la imagen (`50%
50%`, equivalente a no poner `object-position` y dejar el default)
resultó ser el que mejor compone en ambos extremos — muestra a los
dos obreros completos. **Lección: para banners recortados con
`object-fit:cover`, no elegir el `object-position` a ojo — medir la
posición real del sujeto principal en la imagen (con detección de
color/contornos si hace falta) y generar un preview real del recorte
en los aspect ratios extremos (mobile muy vertical vs. desktop muy
ancho) antes de decidir el valor.**

Deploy: commit `dfd5ec1`, pusheado y verificado en producción
(`https://zyh-heredia-y-zarraga.vercel.app/css/styles.css` ya sirve
`object-position:50% 50%`).

## Limitaciones del entorno (importante para no perder tiempo de nuevo)

- **No hay Homebrew** en este entorno → no se puede instalar
  `poppler`. Usar `pip3 install pymupdf` para cualquier trabajo futuro
  con PDFs. Para mejora/edición de imágenes, `pip3 install numpy
  opencv-python-headless` funciona bien (usado para el enhance de
  `construction.jpg` — CLAHE, denoise, upscale Lanczos, unsharp mask).
  `Pillow` (PIL) ya estaba disponible de entrada.
- **La tool de preview (`mcp__Claude_Preview__preview_start`) no
  funciona en este entorno**: el subproceso que lanza falla con
  `PermissionError: cannot access parent directories` al intentar
  resolver el cwd, sin importar el comando (probado con `python3 -m
  http.server` directo y con wrapper `bash -c cd ... && ...`). Es una
  restricción de sandbox del entorno, no un bug del proyecto. **No
  perder tiempo reintentando la config de `.claude/launch.json`** —
  usar en su lugar el `Bash` tool directo:
  ```
  cd /Users/martinzutel/Desktop/afra-zyh && nohup python3 -m http.server 4173 > /tmp/afra-zyh-server.log 2>&1 & disown
  ```
- **La extensión Claude in Chrome no conectó** en esta sesión
  (`tabs_context_mcp` devuelve "not connected"). Reintentar una vez;
  si sigue fallando, no insistir.
- **El usuario rechazó el permiso de computer-use** cuando se pidió
  para tomar screenshots — no volver a pedirlo salvo que el usuario lo
  pida explícitamente de nuevo.
- Dado lo anterior, la verificación visual en esta sesión se hizo por
  **revisión de código** (balance de tags HTML, llaves CSS, que todas
  las clases usadas en el HTML tengan regla en el CSS, que los ids que
  usa `script.js` existan en el HTML, `curl` para confirmar que todos
  los assets devuelven 200) + abrir el sitio con `open` en el
  navegador real del usuario para que lo revise él. **Si en una
  sesión futura estas herramientas sí conectan, usarlas para
  verificación visual real (capturas en mobile/desktop) en vez de
  solo revisión de código.**

## Cómo levantar el sitio localmente

```bash
cd /Users/martinzutel/Desktop/afra-zyh
python3 -m http.server 4173
# abrir http://localhost:4173/index.html
```

## Estado actual (2026-07-16)

- Sitio completo, una página, diseño **V4** (V3 + foto de obra
  mejorada + pasada de mobile, ver arriba): hero, `#lote`, `#galeria`,
  banner de obra (con foto real mejorada con OpenCV), `#unidades` (con
  tabs JS), `#especificaciones`, `#financiacion`, strip de AFRa,
  `#contacto` (con WhatsApp/teléfono/estudio reales), footer.
- Todo el contenido del folleto migrado (texto + imágenes + planos);
  `logo-afra.png`, `qr-code.png` y `floorplan-full.png` quedan en
  `assets/images/` sin usar en el HTML actual (no se borraron, no
  suman peso a la página si no están referenciados — puede servir
  retomarlos si se agrega una sección de planta completa o un sello
  de marca más adelante).
- JS deliberadamente mínimo (~35 líneas, sin dependencias externas):
  reveal on-scroll, tabs de unidades, menú mobile. Nada de
  animación de scroll compleja ni cursor custom — pedido explícito
  del usuario.
- Contraste verificado dos veces a mano (V2 y V3, ver arriba).
- CSS mobile con paddings/gaps/tamaños de fuente fluidos vía
  `clamp(px, vw, px)` en vez de saltos duros por breakpoint donde
  tenía sentido; grids siguen usando breakpoints fijos donde
  corresponde (cambios de `grid-template-columns`, que no se pueden
  interpolar).
- Commits en `main`, todos con autoría correcta (`martinzutel`),
  ninguno con trailer de Claude.
- Pendiente / no verificado en esta sesión: revisión visual real en
  navegador, en particular en viewports mobile reales (screenshots)
  por las limitaciones de entorno arriba descritas — el trabajo de
  V4 se verificó por auditoría de código (cálculos de ancho/overflow
  a mano para los puntos de riesgo: tabs de unidades, captions de
  galería, hero-eyebrow) más `curl` para los assets. El usuario tiene
  el sitio abierto en su navegador para revisar a ojo, incluyendo con
  las devtools en modo mobile si quiere confirmar antes de dar por
  cerrado el pedido.

## Próximos pasos posibles (no pedidos aún, para referencia)

- Si se agregan más unidades/plantas al PDF en el futuro, repetir el
  proceso de extracción documentado arriba antes de tocar el HTML a
  mano.
- Considerar comprimir/`.webp` las imágenes de `assets/images/` si el
  peso de página se vuelve un problema (hoy son JPG calidad 88, no
  optimizados a WebP).
- Si se pide retomar `floorplan-full.png` (planta 2D completa) o el
  logo/QR de AFRa, ya están extraídos en `assets/images/` — no hace
  falta volver al PDF.
