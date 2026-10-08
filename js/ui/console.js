'use strict';
/* Consola de pruebas (tecla ` o F2): comandos para dar dinero, bienes, crear la base, etc. */

let conOpen=false, conBuf='', conLog=['Consola de pruebas. Escribe "ayuda".'], conHist=[], conHi=0;
const FACK=['fed','com','pir','exp'];
function conRun(line){
  const a=line.trim().toLowerCase().split(/\s+/).filter(Boolean); if(!a.length) return '';
  const c=a[0], last=parseFloat(a[a.length-1]), ok=!isNaN(last), fg=x=>GK.find(g=>g===x||GOODS[g][0].toLowerCase().startsWith(x));
  if(c==='ayuda') return 'dinero N | dinero set N | dar <bien|todo> N | rep <fed|com|pir|exp|todas> N (fija -100..100) | comp N | comb N | nivel N | curar | base | modulo <id> N | rp N | tecno. Bienes: '+GK.map(g=>GOODS[g][0].toLowerCase()).join(', ');
  if(c==='dinero'&&ok){ R.cr=Math.max(0,Math.round(a[1]==='set'?last:R.cr+last)); return 'Creditos: '+R.cr; }
  if(c==='dar'&&a.length>=3&&ok){ const gs=a[1]==='todo'?GK:[fg(a[1])]; if(!gs[0]) return 'Bien desconocido: '+a[1]; for(const g of gs) R.cg[g]=Math.max(0,(R.cg[g]||0)+last); return 'Bodega: '+(a[1]==='todo'?'todos':GOODS[gs[0]][0])+' '+(last>0?'+':'')+last; }
  if(c==='rep'&&a.length>=3&&ok){ const ks=a[1]==='todas'?FACK:[FACK.find(k=>k===a[1]||FAC[k].toLowerCase().startsWith(a[1]))]; if(!ks[0]) return 'Faccion desconocida: '+a[1]; for(const k of ks) R.rep[k]=clamp(last,-100,100); return ks.map(k=>FS[k]+' '+R.rep[k]).join('  '); }
  if(c==='comp'&&ok){ R.comp=Math.max(0,Math.round(R.comp+last)); return 'Componentes: '+R.comp; }
  if(c==='comb'&&ok){ R.fuel=clamp(last,0,100); return 'Combustible: '+R.fuel; }
  if(c==='nivel'&&ok){ R.lv=Math.max(1,Math.round(last)); R.xp=0; R.hull=hullMax(); return 'Nivel '+R.lv; }
  if(c==='curar'){ R.hull=hullMax(); R.fuel=100; return 'Casco y combustible al maximo'; }
  if(c==='base'){ if(R.base) return 'Ya tienes base'; R.base={x:ship.x,y:ship.y,mods:{},sto:{},rp:0,tech:{}}; return 'Base creada en tu posicion'; }
  if(c==='modulo'&&a.length>=3&&ok){ if(!R.base) return 'Primero: base'; if(!MODS[a[1]]) return 'Modulos: '+Object.keys(MODS).join(', '); R.base.mods[a[1]]=Math.max(0,Math.round((R.base.mods[a[1]]||0)+last)); return a[1]+' x'+R.base.mods[a[1]]; }
  if(c==='rp'&&ok){ if(!R.base) return 'Primero: base'; R.base.rp+=last; return 'RP '+Math.floor(R.base.rp); }
  if(c==='tecno'){ if(!R.base) return 'Primero: base'; for(const id in TECH) R.base.tech[id]=1; return 'Todas las tecnologias investigadas'; }
  if(c==='armas'){ R.ow=WP.map(()=>1); return 'Todas las armas desbloqueadas (equipalas en el Hangar)'; }
  return 'Comando desconocido. Escribe ayuda'; }
function conPush(m){ for(let i=0;i<m.length;i+=62) conLog.push(m.slice(i,i+62)); if(conLog.length>40) conLog.splice(0,conLog.length-40); }
function drawCon(){ const W=Math.min(cols-2,70), c0=Math.floor((cols-W)/2), n=Math.min(conLog.length,9), H=n+4, r0=Math.max(0,rows-H-1);
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) put(c0+c,r0+r,' ',DIMC);
  box(c0,r0,W,H,ACC,'CONSOLA  [Esc] cerrar'); conLog.slice(-n).forEach((l,i)=>text(c0+2,r0+1+i,l.slice(0,W-4),l[0]==='>'?DIMC:HUDC));
  text(c0+2,r0+H-2,('> '+conBuf+((t*2|0)%2?'_':' ')).slice(0,W-4),ACC); }
