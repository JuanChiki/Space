'use strict';
/* Equipo del jugador: armas, naves y piezas de taller. Solo datos. */

const WP=[{n:'Laser',cd:.24,d:1,s:380,p:0},{n:'Pulso',cd:.1,d:.45,s:420,p:350},{n:'Canon',cd:.7,d:3.2,s:300,p:600},{n:'Plasma',cd:.45,d:2.1,s:330,p:1100},{n:'Riel',cd:1.1,d:6,s:720,p:1800}];
const SHP=[{n:'Explorador',h:0,c:0,e:1,hue:160,p:0},{n:'Minero',h:-20,c:30,e:.92,hue:40,p:700},{n:'Caza',h:50,c:-8,e:1.2,hue:200,p:900}];
const PARTS={
 blind:{s:'casco',n:'Blindaje',d:'+30 casco',cr:250,c:2,fx:{hull:30}},
 pesad:{s:'casco',n:'Placas pesadas',d:'+60 casco, -10% motor',cr:450,c:4,fx:{hull:60,acc:-0.1}},
 lente:{s:'arma',n:'Lente focal',d:'+25% dano',cr:350,c:3,fx:{dmg:0.25}},
 refri:{s:'arma',n:'Refrigerador',d:'-20% cadencia de tiro',cr:400,c:3,fx:{cd:-0.2}},
 inyec:{s:'motor',n:'Inyectores',d:'+15% motor',cr:300,c:2,fx:{acc:0.15}},
 efici:{s:'motor',n:'Eficiencia',d:'-35% combustible',cr:300,c:2,fx:{feff:0.35}},
 bodeg:{s:'sistema',n:'Bodega ext.',d:'+20 bodega',cr:300,c:2,fx:{cargo:20}},
 react:{s:'sistema',n:'Reactor',d:'repara 0.6 casco/s',cr:600,c:5,fx:{regen:0.6}}
};
