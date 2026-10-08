'use strict';
/* Estado guardable del jugador (R): creditos, nivel, mejoras, mision, reputacion, combustible, mercado, base, piezas...
   Aqui esta el esquema completo de la partida guardada. */

let R={cr:50,xp:0,lv:1,hull:100,cg:{},u:{hull:0,laser:0,cargo:0,engine:0},m:null,kills:0,st:0,wp:0,sh:0,ow:[1,0,0],os:[1,0,0],clk:0};
try{ const raw=localStorage.getItem('vacio_rpg'); if(raw) R=Object.assign(R,JSON.parse(raw)); }catch(e){}
const saveR=()=>{ try{ localStorage.setItem('vacio_rpg',JSON.stringify(R)); }catch(e){} };
let saveT=0;   // temporizador de autoguardado
function gain(x){ R.xp+=x; while(R.xp>=R.lv*60){ R.xp-=R.lv*60; R.lv++; R.hull=hullMax(); toast('NIVEL '+R.lv+' - casco reforzado',3.5); logEv('Subes al nivel '+R.lv+'. El casco queda reforzado.'); } }
if(!R.fit) R.fit={}; while(R.ow.length<WP.length) R.ow.push(0); if(!R.npc) R.npc={}; if(!R.myst) R.myst={g:0,ids:{},v:0,r:0}; if(R.fuel==null) R.fuel=100; if(R.comp==null) R.comp=0; if(!R.rep) R.rep={fed:0,com:0,pir:0,exp:0};
if(!R.mk) R.mk={}; if(!R.seen) R.seen={};
function autosave(dt){
  if((saveT+=dt)>4){ saveT=0; saveR(); }
}
