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

### Contraste — verificado a mano (WCAG)
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

## Limitaciones del entorno (importante para no perder tiempo de nuevo)

- **No hay Homebrew** en este entorno → no se puede instalar
  `poppler`. Usar `pip3 install pymupdf` para cualquier trabajo futuro
  con PDFs.
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

- Sitio completo, una página, 6 secciones: Hero, Ubicación (A-01),
  Fideicomiso/Proyecto (A-02), Unidades (A-03), Especificaciones
  (A-04), Interiores/Galería (A-05), Contacto (A-06).
- Todo el contenido del folleto migrado (texto + imágenes + planos).
- Diseño V2 (identidad "hoja de obra") implementado y con contraste
  corregido.
- 9 commits en `main`, todos con autoría correcta (`martinzutel`),
  ninguno con trailer de Claude.
- Pendiente / no verificado en esta sesión: revisión visual real en
  navegador (screenshots) por las limitaciones de entorno arriba
  descritas. El usuario tiene el sitio abierto en su navegador para
  revisar a ojo.

## Próximos pasos posibles (no pedidos aún, para referencia)

- Si el usuario pide contacto real (WhatsApp/mail/teléfono), preguntar
  el dato — no inventarlo.
- Si se agregan más unidades/plantas al PDF en el futuro, repetir el
  proceso de extracción documentado arriba antes de tocar el HTML a
  mano.
- Considerar comprimir/`.webp` las imágenes de `assets/images/` si el
  peso de página se vuelve un problema (hoy son JPG calidad 88, no
  optimizados a WebP).
