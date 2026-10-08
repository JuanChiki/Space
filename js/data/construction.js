'use strict';
/* Modulos de base, tecnologias y costes de construccion. Solo datos. */

/* FASE 5: CONSTRUCCION
   PUNTO DE ENLACE para tus modulos: basta con agregar entradas a MODS y TECH, el resto del sistema las usa solo.
   MODS[id] = {n:nombre, d:descripcion, cost:{cr:N, <bien>:N}, prod:{<bien>:unidades/min}, store:+capacidad, rp:+puntos/min, max:limite, req:<id de TECH>}
   TECH[id] = {n:nombre, d:descripcion, rp:coste, req:<id de TECH>, fx:{prod:+%, cap:+%, disc:-% coste, rp:+%}}   (bienes: ver GOODS) */
const MODS={
 extractor:  {n:'Extractor',  d:'Roca y metal',    cost:{cr:150,metal:2}, prod:{rock:3,metal:1.5}, max:4},
 invernadero:{n:'Invernadero',d:'Biomasa',         cost:{cr:200,water:2}, prod:{bio:2},            max:3},
 condensador:{n:'Condensador',d:'Agua y gas',      cost:{cr:180,ice:2},   prod:{water:3,gas:1},    max:3},
 almacen:    {n:'Almacen',    d:'+40 capacidad',   cost:{cr:120,metal:3}, store:40,                max:4},
 laboratorio:{n:'Laboratorio',d:'Genera RP',       cost:{cr:300,cryst:2}, rp:2,                    max:2}
};
const TECH={
 efic:  {n:'Eficiencia',d:'+25% produccion',  rp:12,fx:{prod:0.25}},
 estiba:{n:'Estiba',    d:'+50% capacidad',   rp:20,fx:{cap:0.5}},
 ingen: {n:'Ingenieria',d:'-20% coste modulos',rp:30,req:'efic',fx:{disc:0.2}},
 comput:{n:'Computo',   d:'+30% investigacion',rp:45,req:'ingen',fx:{rp:0.3}}
};
const BASE_COST={cr:500,metal:5,cryst:3}, BASE_CAP=60;
