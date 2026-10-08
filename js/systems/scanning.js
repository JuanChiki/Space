'use strict';
/* Escaneo: objetivo mas cercano, progreso de escaneo, catalogo de descubrimientos. */

let target=null, tdist=0, scanTarget=null, scanP=0, infoObj=null, infoT=0;
let discovered=new Set();
try{ const raw=localStorage.getItem('vacio_catalogo'); if(raw) discovered=new Set(JSON.parse(raw)); }catch(e){}
function saveDisc(){ try{ localStorage.setItem('vacio_catalogo',JSON.stringify([...discovered])); }catch(e){} }
function updateScanning(dt){
  let best=null,bd=1e9,bw=1e9;   // bw: distancia ponderada. Las senales sin escanear tienen prioridad para que los asteroides no las tapen
  const consider=(o,pri)=>{ const d=Math.hypot(o.x-ship.x,o.y-ship.y)-o.r, w=d-(pri&&d<SCAN_RANGE?90:0); if(w<bw){ bw=w; bd=d; best=o; } };
  for(const p of near.P) consider(p);
  for(const a of near.R) consider(a);
  for(const g of near.S) consider(g,!discovered.has(g.id));
  target=bd<SCAN_RANGE?best:null; tdist=bd;
  if(keys.scan&&target){
    if(scanTarget!==target){ scanTarget=target; scanP=0; }
    const dur=discovered.has(target.id)?0.35:1.3;
    scanP=Math.min(1,scanP+dt/dur);
    if(scanP>=1){
      infoObj=target; infoT=9;
      if(!discovered.has(target.id)){ discovered.add(target.id); saveDisc(); rpgScan(target); toast('Nuevo descubrimiento: '+target.name,3.5); noteDiscovery(target); }
    }
  } else { scanP=0; scanTarget=null; }
}
function rpgScan(o){ if(!(o&&o.kind==='signal')){ gain(20); R.cr+=10; addRep({exp:1}); } prog('scan'); }   // las señales dan su propia recompensa (o ninguna)
