'use strict';
/* Regiones (nebulosa, tormenta ionica, vacio): efectos sobre el vuelo y eventos del vacio. */

let curRegK=null, stormT=5, voidT=25;   // region actual y temporizadores de tormenta y de eventos del vacio
function voidEvt(dt){ voidT-=dt; if(voidT>0) return; voidT=(curRegK==='void'?14:28)+Math.random()*25;
  const st=sectorStats(sectorOf(ship.x),sectorOf(ship.y)); if(!(curRegK==='void'||st.cls==='VACÍO'||st.cls==='ESCASO')) return;
  const E=[()=>{ gain(4); return 'Una luz lejana parpadea tres veces y se apaga.'; },
   ()=>{ R.cg.cryst=(R.cg.cryst||0)+1; return 'Polvo de cristal roza el casco: +1 cristal.'; },
   ()=>'Silencio absoluto. Por un instante el casco deja de crujir.',
   ()=>{ const k=pingFor({x:ship.x,y:ship.y}); if(k&&!Object.values(pings).includes(k)){ pings['v'+k]=k; return 'Tu radio capta un eco ordenado: algo hay en el sector '+k.replace(',',':')+'.'; } return 'Tu radio capta un eco... que se pierde.'; },
   ()=>{ shake=0.6; return 'Una sombra enorme cruza frente a las estrellas. Nadie mas la ve.'; },
   ()=>{ R.fuel=Math.min(100,R.fuel+8); return 'Una corriente de gas frio recarga tu tanque: +8 combustible.'; }];
  const m=E[Math.floor(Math.random()*E.length)](); toast(m,4); if(Math.random()<0.5) logEv(m); }
function regFx(dt){ if(surf) return; const k=regionAt(sectorOf(ship.x),sectorOf(ship.y));
  if(k!==curRegK){ curRegK=k; if(k){ toast('Entras en: '+REG[k].n+' ('+REG[k].d+')',4.5); logEv('Entras en una region: '+REG[k].n+'.'); } }
  if(docked) return;
  if(k==='nebula') R.fuel=Math.min(100,R.fuel+0.5*dt);
  if(k==='storm'){ stormT-=dt; if(stormT<=0){ stormT=4+Math.random()*3; if(R.hull>12){ R.hull-=4; shake=1; toast('Descarga ionica: -4 casco',1.5); } } }
  if(pfx('regen')>0) R.hull=Math.min(hullMax(),R.hull+pfx('regen')*dt);
  voidEvt(dt); }
