'use strict';
/* Catalogo de planetas: nombres, tipos, radios, recursos por tipo y textos descriptivos. Solo datos. */

const SYL=['ka','ve','lor','mi','tha','ur','zen','ox','ari','ne','bel','dra','syn','cor','ul','pha','ion','eri','tos','quil','mor','vex'];
const ROM=['I','II','III','IV','V','VI','VII','VIII'];
const TYPE_W=[['ocean',.14],['rocky',.22],['gas',.18],['ice',.12],['lava',.1],['desert',.09],['jungle',.08],['crystal',.07]];
const RADIUS={ocean:[16,28],rocky:[10,26],gas:[30,55],ice:[12,24],lava:[12,24],desert:[11,24],jungle:[14,27],crystal:[9,20],station:[9,13]};
const TYPE_ES={ocean:'Mundo oceánico',rocky:'Mundo rocoso',gas:'Gigante gaseoso',ice:'Mundo helado',lava:'Mundo volcánico',desert:'Mundo desértico',jungle:'Mundo selvático',crystal:'Mundo cristalino',station:'Estación espacial'};
const FLAVOR={
  ocean:['Océanos globales bajo nubes en espiral.','Archipiélagos y tormentas del tamaño de continentes.','Un mundo azul con casquetes polares brillantes.'],
  rocky:['Superficie craterizada, sin atmósfera apreciable.','Cañones profundos y polvo ocre.','Desierto frío; señales débiles de minerales raros.'],
  gas:['Bandas de amoníaco y una tormenta que lleva siglos activa.','Atmósfera turbulenta, sin superficie sólida.','Vientos de miles de km/h en las capas altas.'],
  ice:['Hielo fracturado sobre un océano oculto.','Llanuras de hielo con grietas azuladas.','Brillo intenso y temperaturas extremas.'],
  lava:['Ríos de roca fundida iluminan el lado nocturno.','Corteza inestable y volcanes activos.','La superficie brilla en la oscuridad.'],
  station:['Eso no es un planeta. Es una estación espacial.','Plataforma artificial con luces en el lado oscuro.','Una luna de acero. Nadie responde a la radio.'],
  desert:['Dunas interminables bajo un sol pálido.','Tormentas de arena que duran décadas.','Mesetas rojizas y cañones secos.'],
  jungle:['Selva densa y húmeda; algo se mueve entre las hojas.','Biosfera rebosante, apenas respirable.','Raíces gigantes cubren continentes enteros.'],
  crystal:['Cristales del tamaño de montañas cantan con el viento.','La luz se parte en mil colores sobre su superficie.','Un mundo facetado que refleja las estrellas.'],
  rock:['Roca carbonosa de rotación lenta.'],ice2:['Núcleo de hielo y polvo.'],metal:['Alta densidad: hierro y níquel.']
};
/* planetas: aterrizaje y recoleccion */
const PRES={ocean:['water','water','rock','cryst'],rocky:['rock','metal','metal','cryst'],gas:['gas','gas','gas','cryst'],ice:['ice','ice','water','metal'],lava:['cryst','cryst','metal','rock'],desert:['rock','metal','metal','cryst'],jungle:['bio','bio','bio','water'],crystal:['prism','prism','cryst','metal']};
