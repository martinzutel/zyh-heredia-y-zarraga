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

### V6 — remaster de la foto de obra con ChatGPT (fuera del entorno)
El usuario pidió una remasterización HD real de `construction.jpg`
("ese es el problema"). Se evaluó usar `cv2.dnn_superres` (FSRCNN)
para super-resolución con IA local, pero requería descargar un
modelo pre-entrenado (~41&nbsp;KB, `FSRCNN_x4.pb` desde el repo oficial
de OpenCV en GitHub) — se pidió permiso explícito al usuario (regla de
"descargar archivos" del harness) y **lo rechazó**, prefiriendo no
descargar nada nuevo.

En cambio, el usuario mismo le pasó la imagen fuente sin comprimir
(`extraction/images/p03_x40_900x1277.png`, la copia más limpia
posible, sin el CLAHE/sharpen ya aplicado en V4/V5 que podría
confundir a un upscaler) a ChatGPT para que la remasterizara, y pegó
el resultado en el chat. El archivo llegó a `~/Downloads/9460c6f4-bd1d-4efb-8351-6d0a7964c4a6.png`
(1054×1493, subida automática del harness al pegar una imagen en el
chat — el nombre es un UUID, no algo que el usuario haya escrito).

Sobre esa base ya remasterizada se aplicó un procesamiento liviano
propio (mucho más sutil que en V4, porque la base ya viene nítida):
upscale 1.35× Lanczos (1054×1493 → 1422×2015), unsharp mask suave, y
un CLAHE muy leve (`clipLimit=1.3` vs. 2.2 de V4) solo para afinar
micro-contraste. Se volvió a verificar el encuadre a los mismos
aspect ratios extremos que en V5 (desktop ancho / mobile vertical)
antes de reemplazar el archivo — sigue funcionando bien con
`object-position:50% 50%`, no hizo falta tocar el CSS.

**Para la próxima vez que haga falta remasterizar algo**: si el
usuario no quiere que se descarguen modelos/herramientas nuevas, la
alternativa que funciona bien es pedirle la imagen fuente sin
comprimir (no la ya procesada) y que él mismo la pase por una
herramienta externa (ChatGPT u otra) y la pegue de vuelta en el chat
— el harness la guarda automáticamente en `~/Downloads/<uuid>.png`,
hay que buscarla ahí por fecha de modificación reciente (`find
~/Downloads -type f -mmin -15`) ya que no llega como path explícito.

### V7 — el nav no tenía shortcut a Contacto
El usuario notó que el nav no tenía forma de llegar directo a
`#contacto` (donde está el botón de WhatsApp, el objetivo real de
conversión del sitio). Al heredar la estructura de la referencia
original, el botón más destacado del header (`.nav-cta`, el pill
oscuro) apuntaba a `https://www.estudioafra.com/` (sitio externo del
estudio) en vez de a la sección de contacto — un hueco real de UX,
no cosmético: la landing existe para generar contacto y el botón con
más jerarquía visual llevaba a otro lado.

Fix: `.nav-cta` ahora apunta a `#contacto` con el texto "Contacto".
"Nuestro estudio" (el link externo) se movió a la lista de
`nav.links`/`.links-mobile` como un ítem más, ya no como el CTA
principal. En mobile se agregó un séptimo ítem (`Contacto`, con
clase `.mobile-cta`, estilo mono/acento para diferenciarlo del resto)
y se subió `max-height` del panel desplegable de 360px a 440px para
que no quede cortado con el ítem nuevo.

### V8 — favicon
El usuario pidió un ícono para la pestaña del navegador. Se generó
con PIL directamente (sin dependencias nuevas): un cuadrado con
esquinas redondeadas en `--ink` (#22242C) con la misma "L" que ya se
usa como motivo de marca en cada `.eyebrow .angle` del sitio (dos
barras redondeadas en `--wood` #B08659), así queda coherente con el
resto de la identidad en vez de ser un ícono genérico aparte.

Archivos: `favicon.ico` (multi-tamaño 16/32/48/64, en la raíz porque
los navegadores lo piden ahí por default aunque haya `<link>` tags),
`favicon.svg` (escalable, el que usan los navegadores modernos),
`assets/icons/favicon-32.png` y `assets/icons/apple-touch-icon.png`
(180×180, para agregar a inicio en iOS). Se generaron también
`favicon-16.png`/`favicon-48.png` pero se borraron por no estar
referenciados por ningún `<link>` — el `.ico` ya trae esos tamaños
embebidos, tenerlos sueltos era bloat sin uso real.

### V9 — auditoría palabra por palabra contra el PDF original
El usuario pidió una verificación "hiper rigurosa": que toda la
información del sitio (medidas, números, términos) sea fiel al PDF
fuente, y que si algo ya estaba perfecto no se tocara. Se releyó el
PDF completo (texto extraído + renders a 4-6x de las páginas con
texto chico, para no confiar solo en la extracción automática) y se
comparó oración por oración contra `index.html`. Método: no asumir
que las reescrituras anteriores (V1→V8) habían preservado el
contenido fiel — cada vez que se reescribió el HTML se corría riesgo
de perder o agregar detalle sin querer.

**Errores reales encontrados y corregidos:**
- **Piso de las unidades** (el más importante): el sitio decía
  "disponible en PB y 1º piso" en tres lugares (los dos `.unit-meta`
  y el copy de la sección Unidades). El PDF dice "Disponible en
  pisos 1 y 2" — confirmado en tres ubicaciones distintas (dos veces
  en la página 4, una vez en la página 5, con los propios números de
  unidad 101/201 y 102/202 confirmando piso 1 y piso 2, no planta
  baja). Corregido a "pisos 1 y 2" en las tres ubicaciones.
- **"20 cuotas mensuales"**: el PDF dice "20 cuotas consecutivas en
  USD" — en ningún lado dice "mensuales". Se había agregado esa
  palabra en una reescritura anterior sin verificar contra la
  fuente. Se sacó "mensuales" del payment-note.
- **Especificaciones con detalle recortado de más** en reescrituras
  previas (probablemente al "pulir" el copy se perdió precisión):
  - Puertas interiores: faltaba "pomelas de primera calidad" en las
    bisagras Sidañez.
  - Pisos: el exterior no repetía la marca/línea/color (Cerro Negro
    gris malba grafito), el PDF sí la repite explícitamente para
    ambos.
  - Confort: faltaban los detalles de instalación del aire
    acondicionado (línea de cobre aislada, drenajes de agua,
    instalación eléctrica).
  - Cocinas: faltaban varios ítems reales del PDF, incluida una
    **medida** (revestimiento cerámico sobre mesada de 60&nbsp;cm de
    altura) y el tipo de grifería (monocomando). También faltaban
    alacena, módulos de guardado, cantos de ABS, puertas batientes.
  - Dormitorios: faltaba el mecanismo de los placares (guía superior,
    carrito, guía inferior) y que la terminación en melamina es
    "exterior e interior" (ambas caras).
  - Baños: faltaba **toda** la lista de artefactos del inodoro
    (inodoro con mochila, bidet, tapa asiento de madera laqueada) y
    qué griferías son FV (ducha, bacha y bidet).

**Verificado y confirmado correcto (sin cambios):** años/edificios/m²
de AFRa (30/56/30.000), las 4 razones del terreno con sus medidas (22
metros, 100 metros, 15 y 20 minutos), la lista de otros edificios de
AFRa con sus años, m² cubiertos/semicubiertos/totales y dimensiones de
ambientes de ambas unidades, fechas de obra (septiembre 2025 → julio
2027), 40% inicial, nombres de calles del mapa (contrastados contra
la imagen del mapa, no solo el texto), y el resto del texto de
carpinterías.

**Decisión editorial, no error**: el PDF tiene dos typos reales
("Chacharita" en vez de "Chacarita", "múdolos" en vez de "módulos")
— son nombres/palabras reales mal tipeados en el material original,
no datos que puedan variar. Se mantiene la ortografía correcta en el
sitio en vez de reproducir el typo, porque el pedido de fidelidad es
sobre la información (medidas, términos, datos), no sobre errores de
tipeo de un tercero. "A 15”/20” de..." se interpretó como minutos
(convención estándar en inmobiliarias argentinas para tiempo de
viaje) — no está el texto "minutos" en el PDF, pero tampoco hay otra
unidad plausible dado el contexto (distancias en cuadras/avenidas), y
ya estaba interpretado así desde V1. No se identificó una alternativa
mejor, se dejó como está.

### V10 — navbar glass, fecha de entrega a diciembre, unidades pendiente
Tres pedidos del usuario en un mismo mensaje:

1. **Navbar estilo "vidrio opaco" Apple**: antes era
   `rgba(237,234,227,0.88)` + `blur(10px)` sin prefijo `-webkit-`
   (esto último era en rigor un bug — Safari/iOS no aplica
   `backdrop-filter` sin el prefijo, así que en Safari el navbar
   nunca tuvo blur real). Se subió a `blur(22px) saturate(180%)`
   —el "recipe" clásico de vibrancy de Apple/Safari— con el prefijo
   agregado, opacidad bajada a 0.66 para que se note más el vidrio, y
   un borde superior claro + sombra suave para el efecto de canto de
   vidrio. Antes de bajar la opacidad se calculó el contraste texto/
   fondo en el peor caso posible (navbar sobre una zona completamente
   negra de la foto del hero, el escenario más exigente): a 0.66 da
   5.51:1, sigue pasando AA con margen. El menú mobile desplegable
   recibió el mismo tratamiento pero con opacidad más alta (0.85) por
   ser una lista larga que hay que poder leer con comodidad.

2. **Fecha de entrega julio→diciembre 2027**: se buscaron todas las
   menciones (`grep -i julio`) y se cambiaron las 4 que correspondían
   (meta description, hero-stat, especificaciones "Obra", timeline de
   financiación). La mención "1 ZYH (2027)" en el mapa de otros
   edificios de AFRa no se tocó porque solo indica el año, no el mes.

3. **"Últimas 4 unidades" → 2 unidades (2 ya se vendieron)**: el
   usuario avisó que se vendieron 2 de las 4, pero **todavía no tiene
   el dato de cuáles** (101/201/102/202) — se le preguntó
   explícitamente para no inventar cuál unidad sigue disponible, y
   contestó que lo resolvemos después. **No tocar el conteo de
   unidades ni los unit-card hasta tener esa confirmación** — es un
   dato real de disponibilidad, no algo para asumir.

### V11 — foto de obra nueva (edificio real, no fundación) + fix de recortes
El usuario pasó una foto nueva (`IMG_3812.HEIC`, cámara de iPhone,
4284×5712 = exactamente 3:4) que muestra el edificio real ya con
varios pisos de estructura de hormigón levantados — mucho más
avanzada que la foto anterior (obreros en los cimientos). Pidió
reemplazarla y que la sección se adapte para que la imagen "entre
toda", y por separado que la foto de fachada (`hero-building.jpg`,
829×1172 ≈ 0,707) deje de verse "recortada cuadrada".

**Conversión HEIC → JPEG**: `PIL.Image.open()` no puede abrir `.heic`
directamente (falta `pillow-heif`, no instalado). Se usó `sips`
—herramienta nativa de macOS, ya disponible, sin instalar nada
nuevo— con `sips -s format jpeg archivo.HEIC --out salida.jpg`. Para
cualquier `.heic`/`.heif` futuro, este es el camino más simple en
este entorno.

**Por qué no alcanzaba con la sección anterior**: `.obra-banner` era
un banner horizontal a sangre (`height:46vh`, ancho completo) pensado
para una foto panorámica. Una foto vertical 3:4 dentro de eso se
recorta brutalmente sin importar el `object-position` — no es un
problema de encuadre (como el bug de V5) sino de que el contenedor y
la imagen tienen geometrías incompatibles. Se rediseñó como sección
de dos columnas (mismo patrón que `.lot-grid`: imagen + texto, fondo
oscuro), con `.obra-media{aspect-ratio:3/4}` calculado exacto contra
las dimensiones reales del archivo — con la relación de aspecto del
contenedor igual a la de la imagen, `object-fit:cover` no recorta
absolutamente nada, es un ajuste perfecto en cualquier tamaño de
pantalla sin necesitar breakpoints manuales.

**Mismo fix aplicado a la fachada**: se le dio a `.gallery figure.tall`
`aspect-ratio:829/1172` (la proporción exacta del archivo) en vez de
una altura fija en px, y se movió la foto de fachada al slot "tall"
de la galería (antes tenía la foto de living-terraza, que al ser
panorámica tolera mejor un recorte silencioso). El slot que quedó
libre ahora lo ocupan las dos fotos de interiores (ambas ~16:10,
paisaje), con `aspect-ratio:16/10` — nunca están tan lejos de su
proporción real como para que se note un recorte. Se sacaron los
`height` fijos en px que había por breakpoint (640/420/300px) porque
ya no hacen falta: `aspect-ratio` resuelve el alto automáticamente en
cualquier ancho de pantalla sin escribir media queries a mano —
código más corto y más robusto a la vez.

**Sin fecha específica en el caption de la obra nueva**: el caption
anterior decía "cimientos, septiembre 2025", que ya no es cierto para
esta foto (el edificio tiene varios pisos). No se inventó una fecha
nueva para no violar el criterio de rigurosidad de V9 — el texto que
quedó ("La estructura avanza piso a piso, camino a la entrega de
diciembre 2027") no afirma ninguna fecha de la foto en sí, solo
reusa hechos ya confirmados (hormigón visto, entrega diciembre 2027).
Si el usuario da la fecha real de la foto, agregarla.

### V12 — texto menos "chamuyero", foto de fachada pareja, unidades 1A/1B
El usuario adjuntó de nuevo `IMG_3812.HEIC` — se verificó por hash
(`md5`) que es exactamente el mismo archivo que ya se usó en V11
(mismo tamaño, misma fecha de modificación), así que no había nada
que reemplazar en la imagen; el pedido real era sobre el texto y el
layout alrededor de ella.

1. **Texto menos "chamuyero"**: se cambió el copy de la sección
   "Obra" de "El hormigón visto ya toma forma. La estructura avanza
   piso a piso, camino a la entrega de diciembre 2027." (metafórico,
   tono de venta) a "La obra, hoy. Estructura de hormigón visto en
   construcción. Entrega prevista: diciembre 2027." (plano, solo
   hechos ya confirmados, sin adorno).

2. **Fachada "no tan alta" y pareja con la otra columna**: en V11 se
   le había dado a `.gallery figure.tall` `aspect-ratio:829/1172`
   (la proporción real de la foto) para que no se recortara, pero
   eso la hacía muy alta (~950px en desktop) comparada con la columna
   de fotos apiladas al lado — quedaba despareja. Solución: a
   partir de 900px de ancho, la figura pasa a `aspect-ratio:auto` y
   se estira (comportamiento default de CSS Grid) para igualar la
   altura de `.gallery-stack` (la columna de al lado), con
   `display:flex` centrando la imagen y `object-fit:contain` en vez
   de `cover` — así la foto se ve completa (nunca se recorta) pero
   con un "marco" de `--concrete-2` a los costados si la proporción
   no llena el ancho completo de su columna. Resultado: mismo alto
   que la columna vecina (parejo), foto completa, sin inventar un
   recorte cuadrado. En mobile (donde las columnas se apilan y no hay
   "columna vecina" con la que igualar) se mantiene el
   `aspect-ratio:829/1172` fijo de V11, que ahí sí tiene sentido.

3. **Unidades → 2 disponibles, 1A y 1B, primer piso**: el usuario
   confirmó que se vendieron ambas unidades del piso 2 (201 y 202) y
   quedan las dos del piso 1, renombradas 1A (tipo Zárraga) y 1B
   (tipo Heredia) — se preguntó explícitamente el mapeo antes de
   tocar nada porque no era inferible con certeza. Cambios: eyebrow y
   meta description a "2 unidades", hero-stat a "Últimas 2
   unidades", tabs y `h3` a "Unidad 1A · Zárraga" / "Unidad 1B ·
   Heredia", `.unit-meta` de cada ficha de "Unidades 101 · 201 —
   disponible en pisos 1 y 2" a simplemente "1º piso — disponible"
   (ya no hace falta distinguir dos números de unidad ni dos pisos
   por tipo, solo queda una de cada una). Las dimensiones de cada
   unidad (m², ambientes) no cambian — son las mismas del PDF, siguen
   siendo la unidad de piso 1 de cada tipo, no una unidad nueva.

### V13 — el fix de V12 para la fachada no funcionaba de verdad
El usuario avisó que la foto de fachada seguía demasiado alta después
del fix de V12. Al revisar el CSS, el enfoque de V12 tenía un
problema real: dependía de `aspect-ratio:auto` + el stretch implícito
de CSS Grid para que `.gallery figure.tall` "adivinara" la altura de
su columna vecina (`.gallery-stack`). Eso es frágil — con
`object-fit:contain` y `height:100%` sobre un contenedor sin altura
propia definida, el navegador puede terminar resolviendo el tamaño
igual usando la proporción intrínseca de la imagen (829:1172), que es
exactamente lo que se quería evitar. No se pudo confirmar visualmente
en su momento (Chrome extension sin conectar) y el supuesto resultó
mal. **Lección: no confiar en comportamiños de stretch/auto
implícitos de CSS Grid para casos así sin poder verificarlos en un
navegador real — usar valores explícitos y deterministas.**

Fix real: se volvió a `height` fijo en px para `.gallery figure.tall`
(640px desktop / 420px tablet / 280px mobile), igual que en el diseño
original pre-V11, calculado para calzar con el alto total de
`.gallery-stack` (308px×2 + 24px gap = 640px, coinciden exacto en
desktop). La única diferencia respecto al diseño original es
`object-fit:contain` en vez de `cover` para esa imagen puntual —
así entra completa dentro de esa caja de 640px sin recortarse
(con un margen de `--concrete-2` a los costados si hace falta), pero
la altura de la caja en sí es fija y predecible, no depende de que el
navegador infiera nada.

### V14 — preview de WhatsApp/redes (Open Graph)
El usuario mandó una captura del link compartido por WhatsApp: se
veía el favicon (el ícono chico de la pestaña) agrandado como imagen
de preview, sin descripción, y pidió una imagen y un texto más
descriptivos, más la URL.

**Causa raíz**: el sitio no tenía ninguna meta tag Open Graph
(`og:title`, `og:description`, `og:image`, etc.) ni Twitter Card. Sin
`og:image`, WhatsApp/Facebook/Twitter caen de vuelta al favicon como
imagen — por eso se veía el ícono de marca ("L" en madera) gigante y
sin contexto.

**Imagen de preview**: se generó una tarjeta social propia
(`assets/og/og-image.jpg`, 1200×630, el tamaño estándar de
Open&nbsp;Graph) con PIL a partir de `facade-evening.jpg`: scrim
oscuro degradado + viñeta izquierda para legibilidad, wordmark "ZYH"
grande (fuente Didot, ya instalada en macOS — no hizo falta descargar
nada), subtítulo con la dirección, línea inferior con unidades
disponibles y fecha de entrega. Primera pasada quedó con la eyebrow
superior poco legible sobre una ventana iluminada del render; se
corrigió subiendo el oscurecido general de la imagen antes de
confirmar el resultado final.

**Meta tags agregadas**: `og:type`, `og:url`, `og:site_name`,
`og:title`, `og:description`, `og:image` (+ width/height/alt),
`og:locale`, y el set equivalente `twitter:card` /
`twitter:title` / `twitter:description` / `twitter:image`. El
`og:image` usa URL absoluta (`https://zyh-heredia-y-zarraga.vercel.app/...`)
porque los crawlers de WhatsApp/Facebook no resuelven rutas
relativas.

**URL**: se le preguntó al usuario si quería seguir con el subdominio
gratuito de Vercel o comprar un dominio propio (compra que tiene que
hacer él, no algo que se pueda hacer en su nombre) — eligió seguir
con `zyh-heredia-y-zarraga.vercel.app` por ahora. **Si en el futuro
pide de nuevo mejorar la URL, la respuesta ya está resuelta: quiere
seguir con Vercel, no ir a buscarle dominio propio salvo que lo pida
explícitamente de nuevo.**

**Nota para el futuro**: WhatsApp (y la mayoría de estos sitios)
cachean el preview de un link la primera vez que se comparte, y no
siempre lo vuelven a pedir aunque el `og:image` cambie. Si el usuario
prueba compartir el link después de este cambio y sigue viendo el
preview viejo, no es que el fix no funcionó — hay que decirle que
prueba con un link "roto" a propósito (agregando `?v=2` al final de
la URL) o que use el debugger de Facebook
(developers.facebook.com/tools/debug/) para forzar el recacheo.

### V15 — la fachada no se destacaba en mobile
El usuario pidió, específicamente para mobile: que la fachada se
destaque más, y que tanto la fachada como la obra se vean completas.

**Diagnóstico**: la obra (`.obra-media`) ya estaba bien — su
`aspect-ratio:3/4` coincide exacto con la foto real (1400×1866 =
0,75), así que `object-fit:cover` no recorta nada ahí, en ningún
ancho de pantalla. El problema real estaba en la fachada de la
galería: en mobile (`≤900px` y `≤520px`) tenía una altura fija corta
(420px, 280px) con `object-fit:contain` — al no coincidir esa caja
angosta-y-corta con la proporción real de la foto (0,707, alta), la
imagen quedaba chica y centrada con barras vacías de
`--concrete-2` a los costados. Técnicamente "completa" (no
recortada) pero visualmente insignificante — el problema no era el
recorte sino que no se destacaba.

**Fix**: mismo criterio que ya funcionó para `.obra-media` — en vez
de una altura fija corta, `.gallery figure.tall` pasa a
`aspect-ratio:829/1172` (la proporción real exacta) a todo el ancho
de columna por debajo de 900px. Con la caja calzando exacto con la
imagen, `object-fit:contain` no genera ningún letterbox (cover y
contain dan el mismo resultado cuando las proporciones coinciden), y
al usar el ancho completo la imagen queda mucho más grande y
prominente — la primera y más grande del bloque de interiores en
mobile, en vez de una miniatura con bordes vacíos.

### V16 — las dos fotos de interiores también completas en mobile
Mismo pedido que V15 pero para las dos fotos apiladas de la galería
(`interior-terrace.jpg` e `interior-living.jpg`). Diagnóstico
idéntico: en mobile tenían altura fija (260px en general, 180px por
debajo de 520px con el modo "2 en fila" lado a lado) con
`object-fit:cover` — al no calzar esa caja con la proporción real de
las fotos (~1,77, panorámicas), se recortaban, y en el modo 2 en fila
de `≤520px` el recorte lateral era severo (solo se veía cerca de la
mitad del ancho de cada foto).

**Fix**: se midieron las proporciones reales exactas de ambas fotos
(`interior-terrace.jpg` 1656×934 = 1,7730; `interior-living.jpg`
1654×931 = 1,7766 — casi idénticas pero no exactas, así que se
targettean por separado con `:nth-child(1)`/`:nth-child(2)` en vez de
compartir un solo valor aproximado). Por debajo de 900px cada figura
pasa a `height:auto` + su `aspect-ratio` real exacto, a todo el ancho
de columna. Se sacó por completo el modo "2 en fila" de `≤520px`
(compactaba a la mitad del ancho, lo cual iba en contra de lo pedido)
— ahora las tres fotos de la sección de interiores se apilan en una
sola columna a todo el ancho en cualquier tamaño de mobile, cada una
en su proporción real, sin ningún recorte.

### V17 — URL renombrada a zarraga-y-heredia + favicon "ZYH" + deploy queue lento
Tres cosas en esta sesión:

1. **Rename del proyecto Vercel**: el usuario pidió que el link diga
   "zarraga y heredia" (no "heredia y zarraga" — coincide con el
   orden real de la marca en el PDF, página 1: "ZYH ... ZARRAGA Y
   HEREDIA"; el sitio usa "Heredia y Zarraga" en el copy porque así
   venía en la referencia del usuario, pero el link ahora sigue el
   orden original de marca). Se usó `npx vercel project rename
   <old> <new>` — **existe ese comando**, no hace falta recrear el
   proyecto. Nuevo link:
   `https://zyh-zarraga-y-heredia.vercel.app/`. El link viejo
   (`zyh-heredia-y-zarraga.vercel.app`) puede haber dejado de
   resolver o quedar huérfano — no se verificó a fondo, no darlo por
   sentado si aparece en algún lado.

2. **Cola de deploys de Vercel lenta/atascada**: varios `vercel
   --prod` seguidos quedaron en estado "Queued" varios minutos sin
   pasar a "Building" — no fue por nada de este proyecto ni de la
   cuenta, la cola tardó pero terminó procesando todo igual (los
   deploys atascados eventualmente terminaron en background). **Si
   vuelve a pasar: no hace falta reintentar en loop ni asumir que
   está roto** — esperar unos minutos y volver a chequear con
   `vercel ls` alcanza. El alias de producción (`.vercel.app` sin
   sufijo random) puede quedar apuntando al último deploy que sí
   terminó mientras uno nuevo sigue en cola — o sea el sitio puede
   estar "andando bien" aunque `vercel ls` muestre el último deploy
   como Queued.

3. **Favicon nuevo**: el usuario pidió cambiar el ícono de la
   marquita en L (motivo de `.eyebrow .angle`) por el texto "ZYH" en
   Fraunces, fondo negro. Se preguntó permiso para descargar el
   archivo de Fraunces (no está instalado en el sistema, solo se
   carga vía Google Fonts en el navegador) — el usuario **prefirió no
   descargar nada** y usar una fuente parecida ya instalada. Se usó
   `Didot Bold` (ya estaba disponible, se había usado también para la
   imagen de Open Graph) sobre fondo negro puro (`#000000`, tal cual
   pidió "fondo negro", no el `--ink` del sitio). Se regeneraron
   `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` con PIL, y
   `favicon.svg` con texto vectorial (`font-family:Didot, Fraunces,
   Georgia, serif` como fallback stack, ya que el navegador que
   renderice el SVG puede no tener Didot instalado — en ese caso cae
   a un serif genérico, no es idéntico pero está en la misma familia
   visual).

## Limitaciones del entorno (importante para no perder tiempo de nuevo)

- **El auto-deploy de Vercel al pushear a `main` no es 100% confiable**:
  en el commit `c7b79d9` (navbar glass + fecha) el webhook de GitHub→
  Vercel no disparó ningún build nuevo (el último deploy quedó
  pegado en uno de 2 horas antes, pese a varios pushes después). No
  se investigó la causa raíz. **Después de cada push, verificar que
  el deploy realmente se actualizó** (`curl` algo que cambió, o
  `npx vercel ls` y mirar el timestamp del último deploy) antes de
  asumir que ya está en producción — si no se actualizó, correr
  `npx --yes vercel --prod --yes` a mano como fallback, no hace falta
  debuggear el webhook en el momento.
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
