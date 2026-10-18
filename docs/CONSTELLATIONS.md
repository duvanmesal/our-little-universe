# Constelaciones de nuestra historia

Estado: implementado. Tres capítulos con tres recuerdos cada uno, conectados mediante recorridos editoriales. Los textos e ilustraciones siguen siendo de demostración.

Las figuras son versiones estilizadas de Casiopea (W), Osa Menor (cucharón) y Corona Boreal (corona abierta), no mapas astronómicos a escala. Las líneas sólidas solo se iluminan cuando se visitan sus recuerdos. El contador muestra el progreso y **Trace this constellation again** reinicia únicamente el capítulo actual para volver a completarlo mediante clics. Las guías discontinuas muestran la silueta pendiente sin marcarla como completada.

## Implementación entregada

- Las tres figuras aparecen también alrededor del sistema solar, tanto en la portada como al explorar. Cada una abre su capítulo y refleja los recuerdos ya visitados. Escape y **Back to universe** restauran el foco en la figura de origen. Se conserva el acceso **Constellations** del pie y el easter egg independiente.
- La cámara principal se retira hacia una perspectiva distante. El atlas usa un Canvas pequeño bajo demanda, sin actualizar React por frame; comparte coordenadas con el fallback SVG. Los controles son botones HTML en ambos modos.
- Las conexiones se trazan en 1150 ms una vez visitados sus dos extremos, con un punto de luz que recorre sus estrellas intermedias. Halos de shader, destellos al seleccionar y una entrada del atlas con escala suave acompañan las interacciones. Cada capítulo tiene un tono y una silueta propios, compartidos por el cielo, las miniaturas y el atlas. Las estrellas intermedias son decorativas; los tres recuerdos siguen siendo los puntos interactivos.
- Movimiento reducido elimina destellos y desplazamientos; la pausa orbital conserva la navegación y las entradas del contenido. El renderizador del atlas solo solicita frames mientras hay cambios.
- Los nueve recuerdos tienen IDs estables y se comparten con la galería mediante `MemoryFigure`. Se editan en `src/data/memories.ts`; la composición y conexiones están en `src/data/constellations.ts`.
- El progreso se guarda localmente bajo `our-little-universe:stars:v1`. **Remember stars on this device** permite desactivarlo y elimina la copia guardada, manteniendo la visita actual. Si el almacenamiento falla, la experiencia continúa en memoria.
- El modo `/?fallback` permite probar el atlas SVG. Movimiento reducido elimina las esperas y el trazado animado.

El documento conserva a continuación el concepto aprobado como referencia de diseño.

## La experiencia

Un control discreto, **Constellations**, abre otra perspectiva del universo. La cámara se aleja del sistema y gira suavemente hacia un pequeño conjunto de estrellas. Los planetas permanecen como referencia tenue en la distancia. El botón **Back to universe** siempre devuelve al sistema; no se pierde el progreso de los mundos explorados.

Cada estrella representa un recuerdo. Al tocarla se ilumina y abre su foto, fecha y descripción. La línea que la conecta con los recuerdos ya visitados se dibuja lentamente. Cuando se han explorado las estrellas del capítulo, aparece la figura completa, su nombre y una frase breve. No hay confeti, puntuaciones ni un orden obligatorio para leer los recuerdos.

El orden de las conexiones sí será editorial: seguirá el recorrido del capítulo, aunque el visitante abra las estrellas en otro orden. Así evitamos unir puntos arbitrarios o generar una maraña visual.

## Primera versión propuesta

Tres constelaciones pequeñas, con entre tres y cinco recuerdos cada una:

- **The beginning:** primeros mensajes, primer encuentro y el momento en que empezó a sentirse como algo nuestro.
- **Places we keep:** paseos, viajes y lugares que significan algo para la pareja.
- **Ordinary magic:** recuerdos cotidianos: una tarde, una comida, una conversación que quisimos guardar.

Estos nombres y contenidos son propuestas de demostración. La figura de cada constelación será abstracta y sutil; elegiremos su composición a partir de los recuerdos, sin imponer corazones o signos del zodiaco. La figura final de un capítulo podrá conservarse iluminada mientras se explora el siguiente.

## Interacción y movimiento

1. Abrir **Constellations**: fundido de etiquetas, retirada de cámara y aparición progresiva de las estrellas.
2. Elegir un capítulo mediante su nombre o su figura. La cámara se encuadra sin rotaciones bruscas.
3. Explorar una estrella: un pequeño halo confirma la selección y aparece el recuerdo.
4. Conectar recuerdos: las líneas avanzan de estrella a estrella en unos 600–900 ms, con luz moderada.
5. Completar el capítulo: la figura respira una vez, aparece la frase y permanece disponible para volver a leerla.
6. Regresar: la cámara retorna a la vista general y recupera la navegación planetaria.

En móvil se mostrará un capítulo por encuadre. Cada estrella tendrá una zona táctil amplia y un botón equivalente en la lista de recuerdos. Escape y **Back to universe** conservarán la misma función que en el resto de la experiencia. Con movimiento reducido, el trazado y el cambio de encuadre serán inmediatos.

## Integración con el proyecto

- Agregar IDs estables a los recuerdos actuales para poder referenciarlos desde planetas y constelaciones, sin duplicar fotografías ni textos.
- Crear `src/data/constellations.ts` con los campos `id`, `title`, `closingLine`, `stars` y `connections`. Cada estrella tendrá `id`, `memoryId` y `position`; cada conexión referenciará dos IDs de estrella.
- Incorporar un modo de navegación `constellations` y un capítulo seleccionado, manteniendo la selección de planetas independiente.
- Reutilizar la galería, los fundidos y la cámara cinematográfica de esta iteración.
- Crear componentes pequeños para estrellas, conexiones y navegación entre capítulos. Las líneas usarán geometría reutilizable; el avance del trazado no actualizará React en cada frame.
- Mantener la versión sin WebGL mediante una figura SVG y una lista de recuerdos con los mismos botones.
- Registrar estrellas visitadas por ID en este navegador. El almacenamiento será opcional y tolerará contenido nuevo; no implicará cuentas ni sincronización entre dispositivos.
- El control de acceso a constelaciones será explícito. El pequeño botón secreto existente seguirá siendo un easter egg independiente.

## Alcance de la primera entrega

Primero construiremos un capítulo completo con tres recuerdos, incluido el regreso al sistema, teclado, móvil y fallback. Después añadiremos los otros dos usando la misma estructura. Evitaremos un editor de figuras, generación aleatoria de conexiones, mapas astronómicos reales o una base de datos hasta que exista una necesidad concreta.

## Criterios de aceptación

- Cada estrella abre el recuerdo correcto; las imágenes y textos tienen una única fuente de datos.
- Las líneas no tapan fotos, texto ni controles y nunca convierten el fondo en una red densa.
- Se puede interrumpir una transición o cambiar de capítulo sin saltos, paneles antiguos ni foco perdido.
- El progreso persiste al recargar, y toda la experiencia funciona también si el almacenamiento está bloqueado.
- La misma historia puede recorrerse con teclado, pantalla táctil, movimiento reducido y sin WebGL.
- Build, tipos, formato y pruebas de referencias entre datos pasan antes de entregar.
