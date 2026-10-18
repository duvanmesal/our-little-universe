# Our Little Universe

Una experiencia romántica de exploración 3D, construida completamente con Astro, TypeScript estricto, React, Three.js, React Three Fiber y Drei. Una estrella central representa a la pareja y seis mundos contienen recuerdos, historia, música, aventuras, sueños y un generador de citas.

## Ejecutar

Requiere Node.js **22.19 o posterior** y npm 9.6.5 o posterior.

```sh
npm install
npm run dev
```

Abre la dirección que imprime Astro (normalmente `http://localhost:4321`).

```sh
npm run lint        # Formato consistente del código
npm run check       # Astro y TypeScript estricto
npm test           # Reglas del generador, datos y recursos locales
npm run build      # Produce dist/
npm run preview    # Sirve el resultado de producción
```

Conserva `package-lock.json`. Para instalaciones reproducibles usa `npm ci`. React se fija a la línea 19.2 porque Fiber 9.7 declara compatibilidad con React >=19 y <19.3. TypeScript se fija a la línea 6.0 compatible con Astro Check. No se omiten ni fuerzan dependencias incompatibles.

## Recorrido

La página abre con «Un pequeño viaje»: tres frases que avanzan con cada toque, clic, Enter, espacio o flecha. Con «Descubre nuestro universo», la estrella dorada crece hasta convertirse en el sol y la cámara se abre hacia el sistema completo. «Saltar introducción» lleva directamente al universo. Selecciona un planeta o utiliza el navegador inferior con teclado. La cámara se acerca gradualmente y revela su contenido. «Back to universe» o Escape devuelve a la vista general. Puedes arrastrar suavemente la cámara y usar la rueda para acercarte o alejarte dentro de límites; el contenido no utiliza scrollbars internas. El control de pausa detiene el movimiento ambiental. «Our universe is still expanding» abre el final.

La galería tiene controles para recorrer sus tres recuerdos; las aventuras tienen puntos seleccionables; los sueños pueden marcarse como realizados; el generador elige una cita sin repetir inmediatamente la anterior. Los sonidos se reproducen exclusivamente al pulsar Play y se detienen al cambiar de sección.

## Personalizar

- **Nombres y fecha:** `src/config/couple.ts`, propiedades `names` y `startDate` (YYYY-MM-DD). También contiene las frases de la introducción (`journey`), dedicatoria, tagline y final. Todos los nombres y fechas iniciales son demostrativos.
- **Recuerdos:** edita `src/data/memories.ts`. Agrega objetos con `image`, `title`, `date`, `description` y `alt`. Coloca tus fotos en `public/images/memories/` y referencia `/images/memories/foto.webp`. Usa WebP/AVIF optimizado, idealmente <250 KB por imagen. No incluyas `public` en la URL. Las ilustraciones SVG incluidas son originales y reemplazables.
- **Timeline:** `src/data/timeline.ts`. Una fecha vacía identifica el hito «Today».
- **Música:** `src/data/songs.ts`. Copia audio propio o con licencia en `public/audio/` y agrega `src: '/audio/mi-cancion.mp3'`. `src` es opcional; sin él, Play muestra un estado pendiente. Los tres WAV incluidos son breves composiciones matemáticas originales, no grabaciones de canciones comerciales. `node scripts/generate-audio.mjs` permite regenerarlos.
- **Aventuras:** `src/data/adventures.ts`. Cambia los lugares, descripciones y estados. Los tres puntos iniciales son simbólicos; no son ubicaciones geográficas.
- **Sueños:** `src/data/dreams.ts`. Usa IDs estables. Los realizados se guardan únicamente en este navegador mediante localStorage; si el almacenamiento falla, siguen funcionando durante la visita. No se sincronizan entre personas o dispositivos.
- **Citas:** `src/data/dateIdeas.ts`. Agrega objetos `title`, `detail`, `type` y `duration`. La selección evita repetir la última idea.
- **Planetas:** `src/data/universe.ts`. Modifica radio, órbita, velocidad, ángulo inicial, colores, semilla de textura, anillos y lunas. Para añadir un destino nuevo, amplía `PlanetId` en `src/types/universe.ts`, agrega sus datos y componente en `src/components/sections/`, y conéctalo en `SectionContent.tsx`. Actualiza el contador del navegador y el fallback sin JavaScript.
- **Diseño:** `src/styles/foundation.css`. Colores y fuentes están definidos en variables CSS; los colores físicos de los planetas están en los datos.

## Arquitectura

```text
src/
  config/couple.ts             Configuración personal y SEO
  data/                       Datos editables, sin presentación
  types/universe.ts           Tipos de la experiencia
  layouts/Layout.astro        HTML, fuentes locales, cabecera y metadata
  pages/index.astro           Una isla React y alternativa sin JavaScript
  components/universe/
    SolarSystem.tsx           Navegación, intro, selección y final
    UniverseCanvas.tsx        Canvas, calidad y pérdida de contexto
    CameraController.tsx     Interpolación, drag y zoom limitado
    Sun.tsx / Planet.tsx      Materiales procedurales y eventos
    Orbit.tsx / StarField.tsx Geometrías eficientes
    materials.ts             Shaders GLSL
    FallbackUniverse.tsx     Universo HTML/SVG sin WebGL
    SceneBoundary.tsx        Contención de errores del renderizador
  components/sections/        Contenido interactivo por destino
  styles/                    Base visual, secciones y responsive
public/
  images/memories/            Ilustraciones de demostración
  audio/                     Sonidos originales, carga bajo demanda
scripts/generate-audio.mjs    Generación reproducible de los sonidos
tests/universe.test.ts        Pruebas de reglas y recursos
```

Astro renderiza estructura, metadata y cabecera sin hidratación. La única isla React engloba los controles que comparten el estado de la escena. El Canvas y el contenido se dividen mediante importaciones dinámicas; Three.js tiene su propio fragmento. Las APIs del navegador se ejecutan en efectos, eventos o dentro del renderizador cliente.

## Accesibilidad y rendimiento

- Navegación real con botones, foco visible, enlace para saltar al navegador y Escape para volver.
- El foco pasa al título cuando termina la transición y vuelve al control de origen.
- Las animaciones comienzan activas. **Reducir movimiento** en la introducción o **Reduce motion** en el universo permite desactivarlas durante la visita: las frases se resuelven con fundidos simples, el cielo queda estático y la cámara cambia sin animación.
- Fallback funcional cuando WebGL 2 no está disponible, se pierde su contexto o falla el renderizado. Usa `/?fallback` para comprobarlo de forma reproducible.
- Sin JavaScript hay una versión estática con todos los contenidos; el generador necesita JavaScript y ofrece la lista de ideas como alternativa.
- DPR limitado a 1.6 en escritorio y 1.25 en móvil; menos estrellas y sin antialias en móvil. Sin postprocesado de pantalla completa. El resplandor del sol utiliza un sprite procedural ligero.
- Sin texturas planetarias externas, sin servicios de imágenes y sin llamadas externas de fuentes. Dos familias tipográficas instaladas y servidas localmente.
- Los objetos usados por la cámara se reutilizan. No se actualiza estado React en cada frame. Se limpian los eventos, temporizadores y el audio al desmontar.

## Secretos (spoilers)

Hay tres descubrimientos: tocar tres veces una luna, tocar cinco veces la pequeña constelación del lateral y completar los cinco sueños. No se anuncian dentro de la experiencia.

## Desplegar

### Vercel desde GitHub

El repositorio incluye `vercel.json` y fija Node 22.x para que Vercel use una versión compatible.

1. En Vercel, selecciona **Add New → Project** e importa `duvanmesal/our-little-universe`.
2. Usa la raíz del repositorio como **Root Directory** y el preset **Astro**.
3. La configuración incluida ejecuta `npm ci`, compila con `npm run build` y publica `dist`.
4. No hacen falta variables de entorno. Pulsa **Deploy**.

Los siguientes pushes a `main` se desplegarán automáticamente al conectar el repositorio. Las fotos y los audios de `public/` se incluyen en la publicación. Si quieres restringir el acceso a la sorpresa, configura la protección del despliegue en Vercel; `noindex` por sí solo no limita quién puede abrir el enlace.

Ejecuta `npm run build` y publica **el contenido de `dist/`** en un hosting estático como Cloudflare Pages, Netlify o Vercel. Configura el comando de build `npm run build`, salida `dist` y Node >=22.19. No necesitas servidor Node en producción ni variables secretas. El proyecto asume despliegue en la raíz del dominio; para un subdirectorio, configura `base` en Astro y adapta las rutas absolutas de recursos.

En `src/config/couple.ts`, establece `siteUrl` con la URL HTTPS definitiva para canonical y Open Graph. `private: true` genera `noindex, nofollow` por defecto. **Noindex no restringe acceso:** si agregas fotos o contenido privado, usa la protección de acceso del hosting. El proyecto no implementa autenticación.

## Decisiones

### Movimiento y próximos capítulos

La cámara utiliza recorridos con duración definida y aceleración/desaceleración suave; el contenido espera a la llegada real, y una selección nueva interrumpe el recorrido desde la posición actual. Los planetas secundarios y las órbitas se atenúan gradualmente. Los paneles y recuerdos conservan brevemente el contenido saliente para completar su fundido. La ruleta mantiene su rotación final y revela el resultado sin parpadeos de texto.

Los tiempos de la cámara y las salidas de contenido se ajustan en `src/config/motion.ts`; los estilos de entrada y microinteracciones están en `src/styles/motion.css`. Las animaciones se activan por defecto incluso si el sistema prefiere movimiento reducido. El control de movimiento está disponible desde la introducción y permite reducirlas o reactivarlas durante la visita. No se cambia ningún ajuste del equipo.

**Constellations** abre tres capítulos de recuerdos conectados: The beginning, Places we keep y Ordinary magic. Cada estrella abre una foto, fecha y descripción; explorar sus extremos revela una conexión y completar el capítulo descubre una frase. La navegación funciona con teclado, móvil, movimiento reducido y fallback SVG. El progreso se guarda en este dispositivo y puede desactivarse con **Remember stars on this device**. Los nueve recuerdos son demo y se comparten con la galería: cambia imágenes y textos en `src/data/memories.ts`, y figuras y conexiones en `src/data/constellations.ts`. Consulta [Constelaciones de nuestra historia](docs/CONSTELLATIONS.md) para detalles.

- Interfaz en inglés siguiendo el copy del encargo; documentación en español.
- Alex y Jamie, 18 de junio de 2023, son datos demo.
- Interpolación exponencial de cámara en lugar de GSAP: cubre estas transiciones sin añadir otra dependencia.
- Estado local a la isla; Zustand no aporta valor a este alcance.
- El sistema orbital prioriza composición y exploración, no una simulación astronómica físicamente exacta.
- La entrega funciona localmente con `npm install` y `npm run dev`; no requiere cuentas, servicios externos ni archivos personales para arrancar.

## Compatibilidad de herramientas

Se recomienda Node 22.22 LTS (`.node-version`). La instalación también se verificó en el Node 22.14 de este equipo, donde npm avisa que la dependencia de fuentes `undici` requiere >=22.19; el check y el build funcionan, pero utiliza la versión recomendada para respetar todos los engines. Three.js actual emite un aviso de deprecación de `Clock` creado internamente por Fiber 9: no es un error de renderizado ni se oculta. El motor 3D se carga como fragmento independiente y puede superar el umbral informativo de tamaño de Vite.
