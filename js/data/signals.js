'use strict';
/* Catalogo de senales, eventos emergentes y misterios. Solo datos. */

const SIG={
  derelict:{n:'Nave abandonada',   w:26,hue:205,ch:'#',d:['Casco abierto al vacío. Los registros de a bordo siguen girando sin nadie que los lea.','Nave a la deriva. El diario de a bordo termina a mitad de una frase.','Sin tripulación, sin alarma, con la bodega a medio abrir.']},
  debris: {n:'Campo de restos',   w:20,hue:30, ch:':',d:['Fragmentos de casco y carga dispersos en una nube lenta.','Restos de algo grande que se partió hace mucho tiempo.']},
  beacon: {n:'Baliza',            w:14,hue:48, ch:'!',d:['Repite un pulso corto cada nueve segundos. Alguien quería ser encontrado.','Transmisor automático; su batería aún aguanta.']},
  ruins:  {n:'Estación destruida',w:8, hue:15, ch:'X',d:['Anillos de una estación partidos desde dentro. Quedan módulos sin quemar.','Una estación que no volverá a atracar a nadie.']},
  anomaly:{n:'Anomalía',          w:7, hue:275,ch:'%',d:['Los sensores no coinciden entre sí. Ninguno miente.','Estructura que no figura en ningún registro.','Parece observar de vuelta.','La lectura cambia cada vez que la miras.','Geometría que no debería existir a esta escala.']},
  monolith:{n:'Monolito',        w:0,hue:40, ch:'|',d:['Piedra negra sin una sola marca de erosion. Sus glifos se reordenan cuando apartas la vista.','Mas antiguo que cualquier estrella cercana. Nadie lo coloco aqui: estaba antes.']},
  vault:   {n:'Camara antigua',  w:0,hue:40, ch:'^',d:['Una puerta sin bisagras en una pared sin edificio.','Arquitectura de una civilizacion anterior a todo lo catalogado.']},
  rift:    {n:'Grieta',          w:0,hue:300,ch:'@',d:['El espacio detras de la grieta no es el mismo espacio.','Un lugar imposible: las estrellas del otro lado estan ordenadas.']},
  echo:    {n:'Senal desconocida',w:0,hue:190,ch:')',d:['Una transmision sin emisor, repetida en un idioma que no existe.','Contiene coordenadas. Alguien quiere que las sigas.']},
  ghost:   {n:'Nave fantasma',   w:0,hue:180,ch:'#',d:['Figura en ningun registro. Su casco refleja una luz que no esta.','Los motores estan frios. Aun asi, parece esperar.']},
  nothing:{n:'Eco sin origen',    w:25,hue:200,ch:'.',d:['Lo investigaste a fondo. No había absolutamente nada.','El eco se disipó antes de que llegaras.','Nada. Ni rastro, ni explicación.']}
};
const SIG_W=Object.values(SIG).reduce((a,s)=>a+s.w,0);
/* misterios: generador aparte (no altera las senales ya existentes). Pesos relativos y probabilidad por sector. */
const MYST={monolith:5,vault:3,rift:2,echo:5,ghost:1}, MYST_RATE=0.04, MYST_W=Object.values(MYST).reduce((a,b)=>a+b,0);
const GLY=['Antes de la primera luz, alguien ya contaba.','No fueron destruidos: se fueron.','La puerta se abre desde dentro.','Todas las estaciones fueron copias.','Volveran cuando alguien termine de leer.'];
