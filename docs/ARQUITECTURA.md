# SPACE — Arquitectura y guia tecnica

[← Volver al README](../README.md)

Documentacion tecnica del proyecto: como esta organizado el codigo, como fluye un fotograma y que archivos tocar para anadir contenido.
Las rutas de este documento son relativas a la raiz del proyecto.

## Como jugar / abrir

- **Desarrollo:** abre `index.html` con doble clic (no necesita servidor).
- **Compartir:** `python3 tools/build.py` genera **`dist/Space.html`**, un solo archivo con todo dentro.

Controles: `W/A/D` mover, `S` frenar, `E` escanear, `F` disparar, `Q` cambiar arma, `G` atracar, `L` aterrizar, `B` construir tu base,
`M` mapa, `C` catalogo (Enter marca un rumbo), `J` bitacora, `I` inventario, `Y` cronica, `O` opciones, `H` ayuda, `` ` `` o `F2` consola de pruebas.

## Estructura (segun el punto 25 de `Futuro.md`)

```
Space/
├── index.html          marcado + lista ordenada de scripts  (el ORDEN de carga vive aqui)
├── css/style.css
├── js/                 59 archivos, 1941 lineas
├── tools/              build, tests y analisis (no hacen falta para jugar)
└── dist/Space.html     version de un solo archivo (generada)
```

**Configuracion**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/config.js` | 15 | Configuracion y constantes de ajuste. Tocar aqui para afinar el juego sin buscar por el codigo. |

**core/ — base y orquestacion**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/core/env.js` | 7 | Entorno: canvas, contexto 2D, deteccion de pantalla tactil y botonera tactil (DOM). |
| `js/core/math.js` | 18 | Matematica base: hash, ruido, fbm, generador pseudoaleatorio con semilla. Sin dependencias. |
| `js/core/state.js` | 9 | Estado transversal de la partida en vuelo: nave, camara, tiempo, teclas, entorno cercano y avisos (toast). |
| `js/core/update.js` | 31 | Orquestacion de un fotograma de logica: llama a cada sistema en orden. Aqui se ve el flujo completo. |

**data/ — contenido (solo datos)**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/data/planets.js` | 22 | Catalogo de planetas: nombres, tipos, radios, recursos por tipo y textos descriptivos. Solo datos. |
| `js/data/factions.js` | 4 | Facciones y sus siglas. Solo datos. |
| `js/data/economy.js` | 10 | Economia: mercancias, perfiles de estacion y mejoras de nave. Solo datos. |
| `js/data/equipment.js` | 15 | Equipo del jugador: armas, naves y piezas de taller. Solo datos. |
| `js/data/signals.js` | 20 | Catalogo de senales, eventos emergentes y misterios. Solo datos. |
| `js/data/ships.js` | 43 | Catalogo visual y de estadisticas de naves: disenos ASCII, paletas, tabla FOE y tablas de aparicion (SPAWN). Para anadir un enemigo: nuevo diseno + paleta + entrada en FOE + entrada en SPAWN (o en REGION_SPAWN). |
| `js/data/surface.js` | 24 | Sprites y ambientes de la superficie de los planetas (aterrizaje). Solo datos. |
| `js/data/regions.js` | 4 | Catalogo de regiones del espacio. Solo datos. |
| `js/data/construction.js` | 21 | Modulos de base, tecnologias y costes de construccion. Solo datos. |

**universe/ — generacion determinista del universo**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/universe/planets.js` | 27 | Generacion procedural de un planeta (nombre, tipo, atmosfera, anillos...). Determinista: no usa Math.random. |
| `js/universe/signals.js` | 26 | Contenido de las senales: nombre y resultado de investigarlas. Determinista por semilla. |
| `js/universe/regions.js` | 6 | Donde hay regiones: funcion determinista por sector. |
| `js/universe/sectors.js` | 73 | Universo en sectores: generacion determinista de planetas, asteroides y senales, y consultas sobre ellos. |

**player/ — estado del jugador**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/player/progression.js` | 14 | Estado guardable del jugador (R): creditos, nivel, mejoras, mision, reputacion, combustible, mercado, base, piezas... Aqui esta el esquema completo de la partida guardada. |
| `js/player/ship.js` | 13 | Nave del jugador: estadisticas derivadas (casco, dano, motor), cambio de arma y regeneracion del casco. |
| `js/player/inventory.js` | 16 | Bodega: carga total, capacidad y recogida de botin. |
| `js/player/reputation.js` | 6 | Reputacion con las facciones: descuentos, ganancia por comerciar y por acciones. |

**entities/ — cosas que existen en el mundo**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/entities/stations.js` | 4 | Estaciones: perfil de cada una (que produce y que necesita) y su faccion. |
| `js/entities/enemies.js` | 19 | Enemigos: aparicion y comportamiento (IA, persecucion, disparo, choque con el jugador). |

**systems/ — reglas del juego**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/systems/scanning.js` | 25 | Escaneo: objetivo mas cercano, progreso de escaneo, catalogo de descubrimientos. |
| `js/systems/exploration.js` | 41 | Exploracion: sectores cercanos, sectores visitados, bitacora, aterrizaje y recoleccion en superficie. |
| `js/systems/flight.js` | 33 | Vuelo: giro, empuje, freno, asistencia, limite de velocidad, colisiones con planetas y asteroides. |
| `js/systems/combat.js` | 36 | Combate: disparo del jugador, proyectiles, dano, muerte, destruccion de enemigos y asteroides, aparicion de piratas. |
| `js/systems/economy.js` | 14 | Economia: precios dinamicos con saturacion y eventos, combustible, componentes, venta de carga. |
| `js/systems/missions.js` | 17 | Misiones: ofertas de las estaciones, progreso y descripcion. |
| `js/systems/docking.js` | 22 | Acoplamiento a estaciones: reglas de acceso, entrega de misiones, historia. |
| `js/systems/events.js` | 47 | Eventos emergentes: que pasa al investigar una senal (botin, emboscada, triangulacion, anomalia). |
| `js/systems/waypoint.js` | 9 | Rumbo (waypoint): marcar un registro del catalogo como destino, con su nombre y distancia. |
| `js/systems/regions.js` | 20 | Regiones (nebulosa, tormenta ionica, vacio): efectos sobre el vuelo y eventos del vacio. |
| `js/systems/construction.js` | 24 | Construccion: base propia, produccion por modulos, almacen e investigacion. |
| `js/systems/contacts.js` | 22 | Contactos NPC de las estaciones: sus dialogos y decisiones (SC) y la etiqueta que aparece en el menu. |

**rendering/ — dibujo ASCII**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/rendering/ascii.js` | 80 | Motor de dibujo ASCII: rejilla de celdas, capas (mundo/interfaz), alta resolucion, primitivas (put, text, box, wrap) y volcado al canvas. |
| `js/rendering/effects.js` | 39 | Efectos: particulas, explosiones, estela del motor, sacudida por impacto. |
| `js/rendering/camera.js` | 11 | Camara: sigue a la nave con un poco de adelanto segun la velocidad. |
| `js/rendering/planets.js` | 112 | Dibujo de planetas: textura de superficie por tipo, sombreado, anillos. |
| `js/rendering/stations.js` | 26 | Dibujo de estaciones espaciales y de la base propia: hub central, anillo, paneles y un modulo por cada modulo construido. |
| `js/rendering/world.js` | 96 | Dibujo del mundo: nebulosa, estrellas, asteroides, senales y entidades de combate (botin, disparos, enemigos). |
| `js/rendering/ships.js` | 73 | Dibujo de naves: nave del jugador (modelo compacto con luces y motor) y celdas de enemigos. |
| `js/rendering/surface.js` | 90 | Dibujo de la superficie del planeta al aterrizar: terreno, ciclo dia/noche, decoracion, astronauta, modulo. |
| `js/rendering/hud.js` | 133 | Interfaz en vuelo: HUD, radar, marcadores de objetivo y de rumbo, panel de escaneo, ayuda y estado RPG. |
| `js/rendering/render.js` | 22 | Composicion de un fotograma: decide que se dibuja y en que orden. |

**ui/ — pantallas, menus y entrada**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/ui/options.js` | 58 | Menu de opciones: tamano de simbolos. Incluye la persistencia de esa preferencia. |
| `js/ui/inventory.js` | 20 | Pantalla de inventario (tecla I): carga, mercados recientes y reputacion. |
| `js/ui/menus.js` | 94 | Menus de la estacion: servicios, mercado y hangar. Navegacion por teclado y raton. |
| `js/ui/base.js` | 47 | Menu de la base propia: modulos, almacen e investigacion, y su dibujo. |
| `js/ui/archive.js` | 43 | Archivo (teclas M / C / J): cascaron comun del mapa, el catalogo y la bitacora; estado, teclado y clics. |
| `js/ui/map.js` | 44 | Pestana MAPA del archivo: sectores con niebla de guerra. |
| `js/ui/catalog.js` | 57 | Pestana CATALOGO del archivo: lo descubierto y su ficha. |
| `js/ui/log.js` | 17 | Pestana BITACORA del archivo: diario de viaje. |
| `js/ui/console.js` | 27 | Consola de pruebas (tecla ` o F2): comandos para dar dinero, bienes, crear la base, etc. |
| `js/ui/chronicle.js` | 16 | Cronica (tecla Y): resumen de tu historia hasta ahora. |
| `js/ui/input.js` | 55 | Entrada: teclado, botonera tactil, raton (muelle, archivo, consola, rueda). |

**Arranque**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/main.js` | 20 | Arranque: bucle principal, ajuste automatico de rendimiento y espera de la fuente. |

**Depuracion**

| Archivo | Lineas | Que contiene |
|---|---:|---|
| `js/debug.js` | 4 | Ganchos de depuracion (window.__astro) usados por los tests de tools/. No afectan al juego. |

## Como fluye un fotograma

```
main.js  loop(now)
 ├─ update(dt)                                     core/update.js   (se pausa con: opciones, archivo, inventario, consola, cronica)
 │   ├─ rpgUpdate(dt)                              gameplay
 │   │    baseTick → regFx → pollDockLandKeys → [superficie | acoplado → fin]
 │   │    → regenHull → autosave → tickCargoWarning → checkExploreMission
 │   │    → playerFire → spawnPirates → updateFoes → updateShots → updateLoot
 │   ├─ flightStep → buildNear → collideShip       pilotaje y sectores cercanos
 │   ├─ emitEngineTrail → updateParticles → updateCamera
 │   └─ updateScanning                             objetivo, escaneo y descubrimientos
 └─ render()                                       rendering/render.js
      archivo | inventario | cronica | superficie | espacio (nebulosa, region, estrellas, planetas, rocas, senales, nave, HUD, consola)
```

`core/update.js` es el mejor sitio para entender el orden: cada linea es un sistema. Ese orden **importa**: por ejemplo,
los proyectiles se procesan antes que el botin para que lo que suelta un asteroide roto se mueva ese mismo fotograma.

## Como esta organizado el codigo (y sus limites)

Son scripts clasicos que comparten un unico ambito global, no modulos ES. Eso permite abrir `index.html` con doble clic
(los modulos ES no cargan desde `file://`), pero significa que **el aislamiento entre archivos es una convencion, no algo que el navegador imponga**.
Reglas que se respetan y se pueden comprobar con `tools/check.mjs`:

1. Cada nombre global se define en **un solo** archivo (no hay duplicados).
2. `data/` y `universe/` no usan nada de las capas superiores. **Una excepcion conocida:** el nombre de una senal
   (`universe/sectors.js`) consulta `discovered` para decidir entre "Senal desconocida" y su nombre real.
3. El orden de `index.html` importa solo para lo que se ejecuta **al cargar** (no dentro de funciones): `core/env.js` primero
   (canvas), `config.js` despues, y los datos antes de lo que los usa al cargar (`data/ships.js` define `run` antes de `HULLS`/`FOE`;
   `data/equipment.js` antes de `player/progression.js`, que ajusta la partida guardada segun `WP`).

**Quien es dueno de cada estado** (cada archivo declara el suyo arriba y guarda/carga su parte):

| Estado | Archivo |
|---|---|
| nave, camara, tiempo, teclas, entorno cercano (`near`), avisos | `core/state.js` |
| partida guardada `R` (creditos, nivel, mejoras, reputacion, combustible, mercado, base, piezas) | `player/progression.js` |
| catalogo de descubrimientos `discovered`, objetivo y escaneo | `systems/scanning.js` |
| sectores visitados, bitacora, aterrizados, superficie actual `surf` | `systems/exploration.js` |
| region actual y temporizadores de tormenta / vacio | `systems/regions.js` |
| enemigos `foes` / proyectiles `shots` / botin `loot` | `entities/enemies.js` / `systems/combat.js` / `player/inventory.js` |
| estacion acoplada `docked`, mision ofrecida | `systems/docking.js` |
| rumbo marcado (`wpCache`) | `systems/waypoint.js` |
| rejilla de dibujo (`cols`, `rows`, `G`...) | `rendering/ascii.js` |
| pantallas abiertas: archivo / opciones / inventario / consola / cronica / menu de estacion / menu de base | `ui/archive.js` / `ui/options.js` / `ui/inventory.js` / `ui/console.js` / `ui/chronicle.js` / `ui/menus.js` / `ui/base.js` |

## Anadir cosas: que archivos tocar

Las recetas de **enemigo** y de **modulo de base** se ejecutaron de verdad en una copia del proyecto (un enemigo `wasp` y un modulo `refineria`:
aparecieron y funcionaron sin tocar ningun archivo de logica). Las demas se comprobaron leyendo el codigo; donde hay un numero fijo, la tabla lo senala.

| Quiero anadir... | Edito | Notas |
|---|---|---|
| **Un enemigo** | `data/ships.js`: un diseno (usa `run(...)`), una paleta, una entrada en `FOE` y una en `SPAWN` (o en `REGION_SPAWN` si es propio de una region) | Solo datos. |
| **Un modulo de base o una tecnologia** | `data/construction.js` (`MODS`, `TECH`) | Solo datos: el comentario de ese archivo documenta el formato. La consola acepta `modulo <id> <n>` para probarlo. |
| **Una pieza de taller** | `data/equipment.js` (`PARTS`) | Solo datos, mientras use efectos que `pfx(...)` ya conozca (`hull`, `cargo`, `dmg`, `cd`, `acc`, `feff`, `regen`...). Un efecto nuevo si necesita codigo. |
| **Un arma** | `data/equipment.js` (`WP`) | Casi solo datos: el menu y el cambio de arma usan `WP.length`. Opcional: posicion del canon (`MZ` en `systems/combat.js`) y glifo del disparo (`rendering/world.js`). |
| **Una nave** | `data/equipment.js` (`SHP`) y su diseno en `data/ships.js` (`HULLS`) | El estado `R.os` se extiende solo al comprarla. |
| **Una mercancia** | `data/economy.js` (`GOODS`) y los perfiles `PROF` que la producen o necesitan; `data/planets.js` (`PRES`) si un planeta debe darla | **Cuidado:** `ui/menus.js` (`menuDo`) usa el indice fijo `11` para "comprar componentes" (= 3 + numero de mercancias): con una mas hay que subirlo a `12`. Las misiones de entrega solo eligen entre las 5 primeras (`systems/missions.js`). |
| **Un perfil de estacion** | `data/economy.js` (`PROF`) | Cada estacion toma el perfil con `h2(...)*PROF.length`: **anadir uno reasigna el perfil de las estaciones ya existentes**. |
| **Una faccion** | `data/factions.js`, el campo `f` de los perfiles, su valor inicial en `R.rep` (`player/progression.js`) y su dialogo en `SC` (`systems/contacts.js`) | La reputacion, el inventario y los descuentos ya iteran sobre las facciones. |
| **Una region** | `data/regions.js` (`REG`), donde aparece en `universe/regions.js`, su efecto en `systems/regions.js` (`regFx`), sus enemigos en `REGION_SPAWN` y su aspecto en `rendering/world.js` (`drawRegionFx`) | El efecto y el aspecto son codigo por region, no datos. |
| **Un tipo de senal o misterio** | `data/signals.js` + su resultado en `universe/signals.js` (`sigPlan`) + su sprite en `rendering/world.js` (`drawSignal`) | Si tiene un efecto especial, tambien `systems/events.js`. |
| **Un tipo de planeta** | `data/planets.js` (`TYPE_W`, `RADIUS`, `TYPE_ES`, `PRES`, `FLAVOR`) + `universe/planets.js` (`makePlanet`) + `rendering/planets.js` (`surface`) + `data/surface.js` | Es lo mas repartido. Cambiar `TYPE_W` mueve los planetas ya generados. |
| **Una pantalla nueva** | un archivo en `ui/`, mas la tecla y el clic en `ui/input.js`, el orden de dibujo en `rendering/render.js` y la guarda de pausa en `core/update.js` | Sigue el patron de `ui/inventory.js` (el mas simple). |

## Pruebas y herramientas (carpeta `tools/`)

- `python3 tools/equiv.py A.html B.html` — ejecuta el mismo escenario con semilla fija (volar, escanear, minar, combatir, atracar, comerciar,
  aterrizar, morir, construir y usar la base, consola, contactos, taller, rumbo, las tres regiones, los misterios, zoom de alta resolucion,
  mapa/catalogo/inventario/cronica/opciones) en dos versiones y compara **pantalla, pixeles y estado** fotograma a fotograma.
  Es la red de seguridad para refactorizar. Se valido sometiendola a mutaciones deliberadas (cambiar la vida de un disparo, el orden de dos sistemas,
  el dano de una tormenta, la reputacion...): las detecta.
- `python3 tools/build.py [--debug]` — genera `dist/Space.html`.
- `cd tools && npm install && node check.mjs ..` — analisis estatico (nombres sin definir, duplicados, dependencias de capa).

## Pendiente / siguientes pasos naturales

- **Modulos ES + objeto de estado.** El siguiente paso real hacia el punto "reducir dependencias" de la Fase 1. Requiere servir el juego
  por `http://` (por ejemplo `python3 -m http.server`) y cambiar las ~100 variables globales por un objeto de estado explicito. Con `tools/equiv.py` se puede hacer sin romper nada.
- **Carpetas del plan que aun no tienen contenido:** `ui/terminal` (la terminal del juego del plan; `ui/console.js` es la consola de pruebas, otra cosa)
  y `entities/structures`. La construccion (`systems/construction.js`) ya existe; las facciones existen como datos y reputacion, todavia no como sistema propio.
- **`h2(x,y)` es simetrica** cuando ambas coordenadas son impares (`h2(x,y) == h2(-x,-y)`): el sector (1,1) es gemelo exacto del (-1,-1),
  el (3,1) del (-3,-1), etc. Afecta a ~25% del universo. No se toco porque reordenaria el mundo y las partidas guardadas.
- En movil, los botones tactiles se solapan con el texto del HUD (ya ocurria antes).

## Cambios de comportamiento respecto al archivo de un solo archivo

El codigo se movio **tal cual** (verificado: cada bloque usado exactamente una vez). Solo hay dos cambios:

1. **Corregido un congelamiento al morir por un proyectil** (`systems/combat.js`, `updateShots`): `die()` reasigna `shots=[]` en mitad del bucle
   que los recorre y la siguiente vuelta leia `shots[i]` indefinido; la excepcion impedia pedir el siguiente fotograma y el juego se detenia.
   Ocurria al morir mientras se disparaba. Ahora hay una guarda de una linea.
2. **La tabla de aparicion de enemigos paso de estar escrita en `spawnPirates` a ser datos** (`SPAWN` y `REGION_SPAWN` en `data/ships.js`), con el mismo orden
   y los mismos umbrales, incluida la condicion de reputacion pirata (comprobado: resultados identicos con semilla fija).
