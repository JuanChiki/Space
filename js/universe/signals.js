'use strict';
/* Contenido de las senales: nombre y resultado de investigarlas. Determinista por semilla. */

const sigCode=g=>String.fromCharCode(65+g.seed%26)+String.fromCharCode(65+((g.seed/26)|0)%26)+'-'+(100+g.seed%900);
const sigName=g=>g.st==='anomaly'?'Anomalía #'+String(g.seed%10000).padStart(4,'0'):SIG[g.st].n+' '+sigCode(g);
/* lo que ocurre al investigar una señal (determinista por semilla: siempre el mismo resultado) */
const sigFac=o=>['fed','com','pir','exp'][o.seed%4];
function sigPlan(o){
  const r=rng(o.seed^0x9e37), st=o.st, P={cr:0,xp:0,loot:[],ambush:0,txt:'',sh:''};
  if(st==='derelict'){
    if(r()<(sigFac(o)==='pir'?0.4:0.12)){ P.ambush=2; P.xp=10; P.txt='Era una trampa: piratas escondidos entre los restos.'; P.sh='¡era una trampa!'; }
    else{ const n=2+Math.floor(r()*3); for(let i=0;i<n;i++) P.loot.push([['metal','cryst','ice','bio'][Math.floor(r()*4)],1+Math.floor(r()*3)]); P.xp=25; P.txt='Recuperaste '+n+' lotes de carga.'; P.sh='carga recuperada'; }
  } else if(st==='debris'){
    const n=4+Math.floor(r()*4); for(let i=0;i<n;i++) P.loot.push([['rock','metal','ice'][Math.floor(r()*3)],1+Math.floor(r()*2)]); P.xp=12; P.txt='Chatarra aprovechable: '+n+' fragmentos.'; P.sh='chatarra aprovechable';
  } else if(st==='ruins'){
    P.cr=60+Math.floor(r()*120); P.loot.push(['cryst',2],['metal',3]); if(r()<0.4) P.loot.push(['prism',1]); P.xp=40; P.txt='Salvamento: +'+P.cr+' cr y módulos intactos.'; P.sh='+'+P.cr+' cr y módulos';
  } else if(st==='beacon'){ P.xp=15; P.txt='Pulso analizado.'; }
  else if(st==='anomaly'){ P.xp=45; P.txt='Sin explicación.'; }
  else if(st==='monolith'){ P.xp=60; P.txt='Un monolito de origen desconocido.'; P.sh='glifo registrado'; }
  else if(st==='vault'){ P.xp=120; P.txt='Camara de una civilizacion anterior.'; P.sh='camara abierta'; }
  else if(st==='rift'){ P.xp=80; P.txt='Una grieta en el espacio.'; P.sh='la grieta te traga'; }
  else if(st==='echo'){ P.xp=30; P.txt='Senal sin emisor.'; P.sh='senal descifrada'; }
  else if(st==='ghost'){ P.xp=100; P.txt='Una nave que no deberia existir.'; P.sh='nave fantasma'; }
  else P.txt='No había nada.';
  return P;
}
