'use strict';
/* Economia: mercancias, perfiles de estacion y mejoras de nave. Solo datos. */

/* mercado, armas, naves */
const UP=[['hull','Casco +40'],['laser','Laser +60%'],['cargo','Bodega +15'],['engine','Motor +12%']];
const GOODS={rock:['Roca',2,28],ice:['Hielo',3,200],metal:['Metal',6,40],gas:['Gas',5,290],water:['Agua',4,205],cryst:['Cristal',12,170],bio:['Biomasa',7,125],prism:['Prisma',15,285]}, GK=Object.keys(GOODS);
/* FASE 3: ECONOMIA
   Cada estacion tiene un perfil (qué produce y qué necesita), sus precios oscilan con el tiempo
   y reaccionan a lo que el jugador compra/vende (saturacion que se recupera sola). */
const PROF=[{n:'Minera',s:['rock','metal','ice'],d:['bio','cryst'],f:'com'},{n:'Comercial',s:['water','gas'],d:['metal','rock'],f:'com'},{n:'Cientifica',s:['cryst','prism'],d:['gas','bio'],f:'exp'},{n:'Colonia',s:['bio','water'],d:['ice','metal'],f:'fed'},{n:'Guarida',s:['metal','cryst','ice'],d:['water','bio'],f:'pir'}];
