'use strict';
/* Eventos emergentes: que pasa al investigar una senal (botin, emboscada, triangulacion, anomalia). */

function pingKind(o,kind){ const sx=sectorOf(o.x), sy=sectorOf(o.y), known=new Set(Object.values(pings)); let best=null, bd=1e9;
  for(let dy=-6;dy<=6;dy++) for(let dx=-6;dx<=6;dx++){ if(!dx&&!dy) continue; const k=(sx+dx)+','+(sy+dy); if(known.has(k)) continue;
    if(getSector(sx+dx,sy+dy).signals.some(g=>g.st===kind&&!discovered.has(g.id))){ const d=Math.hypot(dx,dy); if(d<bd){ bd=d; best=k; } } }
  return best; }
function sigResult(o){
  if(o.st==='monolith'||o.st==='echo'){ const k=pings[o.id]; return (o.st==='monolith'?'Glifo grabado. ':'Senal descifrada. ')+(k?'Apunta al sector '+k.replace(',',':')+'.':'No apunta a ningun lugar conocido.'); }
  if(o.st==='beacon'){ const k=pings[o.id]; return k?'Fuente triangulada en el sector '+k.replace(',',':')+'.':'El pulso no apunta a ningún lugar conocido.'; }
  return sigPlan(o).txt;
}
function pingFor(o){        // busca el lugar interesante más cercano que el jugador aún no conoce
  const sx=sectorOf(o.x), sy=sectorOf(o.y), known=new Set(Object.values(pings)); let best=null, bd=1e9;
  for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){
    if(!dx&&!dy) continue; const k=(sx+dx)+','+(sy+dy); if(visited.has(k)||known.has(k)) continue;
    const s=getSector(sx+dx,sy+dy), hit=s.planets.some(p=>p.type==='station')||s.signals.some(g=>g.st!=='nothing')||s.planets.length>=2;
    if(hit){ const d=Math.hypot(dx,dy)+h2(dx,dy,5)*0.5; if(d<bd){ bd=d; best=k; } }
  }
  return best;
}
function noteDiscovery(o){  // se llama al escanear algo por primera vez
  if(o.kind==='planet'){ logEv(o.type==='station'?'Estación localizada: '+o.name+'.':'Descubriste '+o.name+' ('+TYPE_ES[o.type].toLowerCase()+').'); return; }
  if(o.kind!=='signal') return;
  const P=sigPlan(o), sec=sectorOf(o.x)+':'+sectorOf(o.y); let txt=P.txt, tt=P.sh;
  { const f=sigFac(o); let fx='';
    if(o.st==='derelict'){
      if(f==='pir'&&P.ambush&&(R.rep.pir||0)>=30){ P.ambush=0; txt='Marcas piratas: reconocieron tu nave y te dejaron pasar.'; tt='los piratas te respetan'; }
      else{ txt='Restos de '+FAC[f]+'. '+txt; if(!P.ambush) fx=addRep(f==='fed'?{fed:2}:f==='com'?{com:-3}:f==='exp'?{exp:2}:{pir:-2}); }
    } else if(o.st==='ruins'){ txt='Estacion de '+FAC[f]+'. '+txt; fx=addRep(f==='pir'?{pir:-3,fed:2}:{[f]:-4}); }
    if(fx) txt+=' ['+fx+']'; }
  if(P.cr) R.cr+=P.cr; if(P.xp) gain(P.xp);
  P.loot.forEach(([g,u])=>{ const a=Math.random()*6.283, d=3+Math.random()*10; loot.push({x:o.x+Math.cos(a)*d,y:o.y+Math.sin(a)*d*0.6,vx:(Math.random()-0.5)*30,vy:(Math.random()-0.5)*30,u,g,h:GOODS[g][2],life:70}); });
  for(let i=0;i<P.ambush;i++){ const a=Math.random()*6.283; spawnFoe('raider',o.x+Math.cos(a)*55,o.y+Math.sin(a)*55); }
  if(o.st==='beacon'){ const k=pingFor(o); pings[o.id]=k||''; txt=sigResult(o); tt=k?'fuente en sector '+k.replace(',',':'):'el pulso no lleva a ninguna parte'; }
  if(o.st==='monolith'||o.st==='vault'||o.st==='rift'||o.st==='echo'||o.st==='ghost'){ const M=R.myst;
    if(o.st==='monolith'){ if(!M.ids[o.id]){ M.ids[o.id]=1; M.g++; } const k=pingKind(o,'vault'); pings[o.id]=k||''; txt='Glifo '+Math.min(M.g,5)+'/5: "'+GLY[Math.min(M.g,5)-1]+'"'+(k?' Apunta al sector '+k.replace(',',':')+'.':''); tt='glifo '+Math.min(M.g,5)+'/5'; if(R.base) R.base.rp+=10; addRep({exp:3}); }
    else if(o.st==='vault'){ const full=M.g>=3, cr=full?400+M.g*250:150; R.cr+=cr; R.comp+=full?3:1; if(full) R.cg.prism=(R.cg.prism||0)+2; if(R.base) R.base.rp+=full?25:5; addRep({exp:full?10:3}); M.v++; txt=full?'La camara se abre: +'+cr+' cr, componentes y prismas. Los glifos encajan.':'Entreabierta: +'+cr+' cr. Con 3 glifos se abriria del todo.'; tt=full?'camara abierta':'camara entreabierta'; }
    else if(o.st==='rift'){ const a=(o.seed%628)/100, d=SEC*(8+o.seed%7); ship.x=o.x+Math.cos(a)*d; ship.y=o.y+Math.sin(a)*d; ship.vx=0; ship.vy=0; foes.length=0; M.r++; shake=1; txt='La grieta te arrojo al sector '+sectorOf(ship.x)+':'+sectorOf(ship.y)+'. Nada aqui es como lo dejaste.'; tt='lugar imposible'; }
    else if(o.st==='echo'){ const k=pingKind(o,'monolith'); pings[o.id]=k||''; txt=k?'Senal descifrada: un monolito en el sector '+k.replace(',',':')+'.':'Solo ruido: no hay monolitos al alcance.'; tt=k?'coordenadas recibidas':'solo ruido'; }
    else { spawnFoe('brute',o.x-60,o.y); spawnFoe('brute',o.x+60,o.y); R.cr+=500; R.cg.prism=(R.cg.prism||0)+3; shake=1; txt='Los motores arrancaron solos: no estaba vacia. +500 cr y prismas.'; tt='no estaba vacia'; } }
  if(o.st==='anomaly'){ shake=1; tt='los instrumentos fallan'; txt='Los instrumentos fallaron. '+SIG.anomaly.d[o.seed%SIG.anomaly.d.length]; }
  if(o.st==='nothing') tt='no hay nada';
  toast(sigName(o)+': '+tt,4.5);
  logEv(sigName(o)+' (sector '+sec+'). '+txt);
  saveR(); saveArch();
}
