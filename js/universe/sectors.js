'use strict';
/* Universo en sectores: generacion determinista de planetas, asteroides y senales, y consultas sobre ellos. */

const sectors = new Map();
const sectorOf = v => Math.floor((v+SEC/2)/SEC);
function getSector(sx,sy){
  const key=sx+','+sy; let s=sectors.get(key); if(s) return s;
  const r=rng((h2(sx,sy,9001)*4294967296)>>>0);
  s={sx,sy,planets:[],rocks:[],signals:[]};
  const ox=sx*SEC, oy=sy*SEC, half=SEC/2;
  if(sx===0&&sy===0){
    s.planets.push(makePlanet(r,'p0a','ocean',62,-18,22));
    s.planets.push(makePlanet(r,'p0b','gas',-175,55,34,true));
    s.planets.push(makePlanet(r,'p0c','station',195,95,11));
    s.planets.push(makePlanet(r,'p0d','rocky',-60,-165,14));
    s.planets.push(makePlanet(rng(11),'p0e','desert',230,-120,17)); s.planets.push(makePlanet(rng(12),'p0f','jungle',-215,-150,19)); s.planets.push(makePlanet(rng(13),'p0g','crystal',40,185,15));
  } else {
    const roll=r(); const n=roll<0.38?0:roll<0.82?1:2;
    for(let i=0;i<n;i++){
      const type=r()<0.04?'station':pickType(r);
      const px=ox+(r()-0.5)*(SEC-150), py=oy+(r()-0.5)*(SEC-150);
      const pl=makePlanet(r,`p${sx},${sy},${i}`,type,px,py);
      if(s.planets.every(o=>Math.hypot(o.x-pl.x,o.y-pl.y)>(o.r*(o.ring?o.ring.outer:1.2)+pl.r*(pl.ring?pl.ring.outer:1.2)+20))) s.planets.push(pl);
    }
  }
  if(sx===4&&sy===-3){ const e=makePlanet(r,'pS','station',ox+40,oy-30,12); e.name='Estacion Ecos'; s.planets.push(e); }
  const addRock=(x,y)=>{
    const rr=2+Math.pow(r(),2)*5;
    if(sx===0&&sy===0&&Math.hypot(x,y)<75) return;
    for(const p of s.planets){ if(Math.hypot(x-p.x,y-p.y)<p.r*(p.ring?1.25:1.05)+rr+6) return; }
    const k=r(); const rk=k<0.6?'rock':k<0.82?'ice':'metal';
    s.rocks.push({kind:'rock',id:`a${sx},${sy},${s.rocks.length}`,x,y,r:rr,rk,seed:Math.floor(r()*1e6)+1,spin:(r()-0.5)*0.9,phase:r()*6.28,
      name:'Asteroide '+String.fromCharCode(65+Math.floor(r()*26))+String.fromCharCode(65+Math.floor(r()*26))+'-'+(100+Math.floor(r()*900))});
  };
  const nCl=Math.floor(r()*3)+(sx===0&&sy===0?1:0);
  for(let k=0;k<nCl;k++){
    const cx=ox+(r()-0.5)*SEC*0.8, cy=oy+(r()-0.5)*SEC*0.8, rad=50+r()*110, n=14+Math.floor(r()*26);
    for(let i=0;i<n;i++){ const ang=r()*6.283, d=Math.sqrt(r())*rad; addRock(cx+Math.cos(ang)*d,cy+Math.sin(ang)*d*0.6); }
  }
  const nS=4+Math.floor(r()*8);
  for(let i=0;i<nS;i++) addRock(ox+(r()-0.5)*SEC,oy+(r()-0.5)*SEC);
  // señales y eventos (rng propio: no cambia nada del universo ya generado)
  if(!(sx===0&&sy===0)){
    const rs=rng((h2(sx+1000003,sy-7777,31337)*4294967296)>>>0);   // desfase: h2(x,y)==h2(-x,-y) si ambos son impares; asi las senales no salen en espejo
    if(rs()<SIGNAL_RATE){
      const px=ox+(rs()-0.5)*(SEC-80), py=oy+(rs()-0.5)*(SEC-80); let roll=rs()*SIG_W, st='nothing';
      for(const k in SIG){ roll-=SIG[k].w; if(roll<0){ st=k; break; } }
      const seed=Math.floor(rs()*1e6)+1, phase=rs()*6.28;
      if(s.planets.every(p=>Math.hypot(p.x-px,p.y-py)>p.r*(p.ring?p.ring.outer:1.2)+22))
        s.signals.push({kind:'signal',id:`g${sx},${sy},${s.signals.length}`,x:px,y:py,r:7,st,seed,phase,
          get name(){ return discovered.has(this.id)?sigName(this):'Señal desconocida'; }});
    }
  }
  if(!(sx===0&&sy===0)){ const rm=rng((h2(sx+424243,sy-98765,2718)*4294967296)>>>0);
    if(rm()<MYST_RATE){ const px=ox+(rm()-0.5)*(SEC-80), py=oy+(rm()-0.5)*(SEC-80); let roll=rm()*MYST_W, st='echo';
      for(const k in MYST){ roll-=MYST[k]; if(roll<0){ st=k; break; } }
      const seed=Math.floor(rm()*1e6)+1, phase=rm()*6.28;
      if(s.planets.every(p=>Math.hypot(p.x-px,p.y-py)>p.r*(p.ring?p.ring.outer:1.2)+22))
        s.signals.push({kind:'signal',id:`g${sx},${sy},${s.signals.length}`,x:px,y:py,r:7,st,seed,phase,get name(){ return discovered.has(this.id)?sigName(this):'Señal desconocida'; }}); } }
  sectors.set(key,s); return s;
}
/* de un id ("p0c", "a3,-2,7", "g1,1,0"...) a su objeto: el universo es determinista, no hace falta guardar nada más */
function idSector(id){
  if(/^p0[a-g]$/.test(id)) return [0,0,'planets'];
  if(id==='pS') return [4,-3,'planets'];
  const m=/^([pag])(-?\d+),(-?\d+),\d+$/.exec(id); if(!m) return null;
  return [+m[2],+m[3],m[1]==='p'?'planets':m[1]==='a'?'rocks':'signals'];
}
function resolveObj(id){ const q=idSector(id); if(!q) return null; const o=getSector(q[0],q[1])[q[2]].find(z=>z.id===id); return o?{o,sx:q[0],sy:q[1],id}:null; }
function sectorStats(sx,sy){
  const s=getSector(sx,sy), pl=s.planets.filter(p=>p.type!=='station').length, st=s.planets.length-pl, ro=s.rocks.length, sg=s.signals.length, score=pl*6+st*6+ro+sg*3;
  return {s,pl,st,ro,sg,cls:score>=55?'DENSO':score>=30?'NORMAL':score>=12?'ESCASO':'VACÍO'}   // umbrales calibrados con ~1600 sectores: 13% vacío, 30% escaso, 35% normal, 22% denso;
}
