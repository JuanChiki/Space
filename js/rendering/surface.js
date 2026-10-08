'use strict';
/* Dibujo de la superficie del planeta al aterrizar: terreno, ciclo dia/noche, decoracion, astronauta, modulo. */

let dayL=1;
function drawSpr(sp,cx,gnd){ const [h,ah,rows]=sp, n=Z>=1.5?2:1;
  rows.forEach((row,i)=>{ const r=gnd-(rows.length-i)*n, sw=i===0&&rows.length>3?Math.round(Math.sin(t*1.2+cx)*0.7):0, l=(30+(1-i/rows.length)*16)*dayL;
    for(let k=0;k<row.length;k++){ const ch=row[k]; if(ch===' ') continue;
      blk(cx+(k-(row.length>>1)+sw)*n,r,ch==='H'?'|':ch,'*o'.includes(ch)?`hsl(${ah} 85% 68%)`:ch==='H'?'hsl(28 40% 38%)':`hsl(${h} 50% ${l|0}%)`); } });
}
function decor(S,off,h0){
  const p=S.p, ty=p.type, gas=ty==='gas';
  for(let ax=off-8;ax<off+cols+8;ax++){ const xm=wrapX(ax); if(Math.abs(xm-30)<9) continue;
    const q=h2(xm,p.seed,50); let sp=null; if(q<0.012) sp=LM[ty]; else if(q<0.1) sp=SPR[ty][Math.floor(h2(xm,p.seed,51)*4)]; if(!sp) continue;
    const g=gy(ax); if(ty==='ocean'&&g>h0+1) continue;
    drawSpr(sp,ax-off,g-(gas?3+Math.round(Math.sin(t*0.9+ax)):0)); }
  for(let c=0;c<cols;c++){ const n=nodeAt(c+off); if(n) put(c,gy(c+off)-1,(t*3|0)%2?'*':'+',`hsl(${GOODS[n.g][2]} 75% 62%)`); }
}
function drawLander(cx,gnd,hh,near){
  const hi=Z>=1.5, rows=hi?LAND_HI:['  *  ','  ^  ',' /o\\ ','/|#|\\','=| |=','_/ \\_'], w=rows[0].length;
  rows.forEach((row,i)=>{ const r=gnd-rows.length+i; for(let k=0;k<w;k++){ const ch=row[k]; if(ch===' ') continue;
    put(cx-(w>>1)+k,r,ch,ch==='*'?((t*2|0)%2?'hsl(0 90% 62%)':'hsl(0 0% 90%)'):'o()'.includes(ch)?'hsl(190 90% 75%)':ch==='='?'hsl(28 70% 50%)':ch==='#'?`hsl(${hh} 30% 50%)`:ch==='^'?'hsl(48 100% 80%)':`hsl(${hh} 40% 80%)`); } });
  if(hi) put(cx,gnd-rows.length-1,'*',(t*2|0)%2?'hsl(0 90% 62%)':'hsl(0 0% 90%)');
  if(near&&(t*2|0)%2===0){ const m=(touchUI?'':'[L] ')+'despegar'; text(cx-(m.length>>1),gnd-rows.length-3,m,ACC); }
}
function drawAstro(S,pc,pr){
  const W=S.W, mining=S.prog>0&&S.nd, dxn=mining?((S.nd.x-S.x+W/2)%W+W)%W-W/2:0, fc=mining?(dxn>=0?1:-1):(S.fc||1), en=S.en/100;
  const bc=en>0.5?'hsl(140 70% 55%)':en>0.2?'hsl(48 100% 60%)':((t*4|0)%2?'hsl(0 90% 60%)':'hsl(0 40% 35%)'), sc='hsl(40 20% 90%)', dk='hsl(40 15% 58%)', tl='hsl(48 100% 66%)';
  const rows=AST.slice(); if(S.mv){ const f=AST_W[((S.x*0.8)|0)%2]; rows[5]=f[0]; rows[6]=f[1]; }
  rows.forEach((row,i)=>{ for(let k=0;k<9;k++){ const ch=row[k]; if(ch===' ') continue;
    const col=ch==='o'?'hsl(190 90% 78%)':i===3&&k===0?dk:i===3&&k===1?bc:i===4&&k===2?bc:(i===3&&k>=6)?tl:i===3&&(k===3||k===4)?dk:sc;
    put(pc+(fc>0?k-4:4-k),pr-6+i,fc>0?ch:(MR[ch]||ch),col); } });
  if(mining){ for(let k=5;k<Math.abs(dxn);k++) put(pc+fc*k,pr-3,(((t*25)|0)+k)%2?'-':'=','hsl(48 100% 70%)');
    const nr=gy(Math.round(S.nd.x))-1, cn=pc+Math.round(dxn); put(cn,nr,'*','hsl(48 100% 85%)'); put(cn+(h2(t*30|0,1,2)<0.5?-1:1),nr-1,'.','hsl(40 100% 70%)'); }
}
function drawSurf(){
  const S=surf,p=S.p,W=S.W,ty=p.type,off=Math.round(S.x)-(cols>>1),h0=hz(),sea=h0+1,pc=cols>>1;
  const cyc=(t*0.011+p.phase/6.283)%1, day=cyc<0.7, u=day?cyc/0.7:(cyc-0.7)/0.3, el=day?Math.sin(u*Math.PI):0; dayL=0.5+0.5*el;
  const mt=new Array(cols).fill(0);
  const ah=(p.atmo||p.h1)|0, gh=(ty==='ocean'?p.h2:p.h1)|0, sat=Math.min(60,p.sat)|0;
  for(let c=0;c<cols;c++){
    const x=c+off, xm=wrapX(x), g=gy(x), a=xm/W*6.2832; mt[c]=g;
    for(let r=0;r<g;r++){ const dp=(h0-r)/h0;
      if(h2(xm,r,31)<0.012*Math.max(0.2,dp)*(1+(1-dayL)*5)) put(c,r,'.',`hsl(210 40% ${(25+h2(xm,r,32)*40)|0}%)`);
      else if(dp<0.5&&h2(xm,r,41)<0.45*(1-dp*2)) put(c,r,h2(xm,r,42)<0.3?':':'.',`hsl(${ah} 45% ${((14+(1-dp*2)*22)*dayL)|0}%)`);
    }
    if(ty==='ice'){ const av=Math.sin(a*5+t*0.5)*0.5+Math.sin(a*11-t*0.3)*0.5, ar=Math.round(h0*0.3+av*3);
      for(let k=0;k<3;k++) put(c,ar+k,k===1?':':'.',`hsl(${(150+av*30)|0} 65% ${28-k*6}%)`); }
    if(ty!=='gas'){ const kk=W*0.007, hm=h0-2-Math.round(5*Z*fbm(Math.cos(a)*kk+9,Math.sin(a)*kk+9,0.5,p.seed+50,2));
      mt[c]=Math.min(hm,g); for(let r=hm;r<g;r++) put(c,r,r===hm?'^':':',`hsl(${gh} ${(sat*0.5)|0}% ${((14+(r-hm)*2)*dayL)|0}%)`); }
    if(ty==='ocean'&&g>sea) for(let r=sea;r<g;r++) put(c,r,r===sea?(Math.sin(a*14+t*2)>0?'~':'-'):'~',`hsl(205 60% ${(48-(r-sea)*5)|0}%)`);
    for(let r=g;r<rows;r++){ const d=r-g; let ch=d===0?'=':d<3?'#':d<7?':':'.', hue=gh, l=Math.max(8,46-d*5), s2=sat;
      if(ty==='lava'){ if(h2(xm,r,13)<0.1){ ch='~'; hue=20+Math.sin(t*2+xm)*12+12; l=45+Math.sin(t*2+xm*0.7)*15; s2=95; } else l*=0.7; }
      else if(ty==='ice'){ l+=10; if(d===0&&h2(xm,t*3|0,7)<0.04){ ch='*'; l=90; } }
      else if(ty==='gas'){ ch=h2(xm,r,2)<0.5?'~':'='; hue=gh+Math.sin(r*0.5)*20; l=50-d*1.5; }
      else if(ty==='crystal'){ if(h2(xm,r,13)<0.07){ ch='*'; hue=190+Math.sin(t*2+xm)*40; l=55+Math.sin(t*3+xm)*20; s2=80; } }
      else if(ty==='desert'){ if(d>0) ch=h2(xm,r,2)<0.35?':':'.'; l+=8; }
      else if(ty==='jungle'){ if(d===0) ch='"'; }
      put(c,r,ch,`hsl(${hue|0} ${s2|0}% ${Math.max(6,l*(s2>=80?1:dayL))|0}%)`); }
    if(ty==='jungle'&&h2(xm,10,3)<0.3) put(c,g-1,h2(xm,11,3)<0.5?'"':',','hsl(110 55% 38%)');

  }
  const sh=ty==='lava'?12:ty==='ice'?195:ty==='crystal'?300:48, big=ty==='gas'?7:4, low=clamp(1-el*2.2,0,1);
  const put2=(c,r,ch,col)=>{ if(c>=0&&c<cols&&r>=0&&r<mt[c]) put(c,r,ch,col); };
  const body=(cx,cy,rad,hue,sat2,lt,cs)=>{ for(let dy=-2;dy<=2;dy++) for(let dx=-rad;dx<=rad;dx++){ const q=(dx/rad)**2+(dy/2)**2; if(q<=1) put2(cx+dx,cy+dy,q<0.4?cs[0]:q<0.75?cs[1]:cs[2],`hsl(${hue} ${sat2}% ${(lt-q*30)|0}%)`); } };
  if(day){
    const shh=(sh<100?sh-(sh-10)*low:sh+low*30)|0, rad=big+Math.round(low*2), sx=Math.round(cols*(0.08+0.84*u)), sy=Math.round(h0-1-Math.sin(u*Math.PI)*h0*0.78);
    for(let dy=-7;dy<=7;dy++) for(let dx=-18;dx<=18;dx++){ const q=(dx/18)**2+(dy/7)**2, c=sx+dx, r=sy+dy;
      if(q<1&&c>=0&&c<cols&&r>=0&&r<mt[c]&&h2(c+off,r,60)<0.35*(1-q)){ const i=r*cols+c; if(G[i]===' '||G[i]==='.') put(c,r,q<0.4?':':'.',`hsl(${shh} 80% ${(18+(1-q)*26)|0}%)`); } }
    for(let k=0;k<12;k++){ const an=k*Math.PI/6+t*0.25, d=rad+3+Math.sin(t*2+k*1.7)*1.5; put2(sx+Math.round(Math.cos(an)*d),sy+Math.round(Math.sin(an)*d/RY),k%2?'.':'+',`hsl(${shh} 90% 75%)`); }
    body(sx,sy,rad,shh,85,78,['@','O',':']);
  } else body(Math.round(cols*(0.1+0.8*u)),Math.round(h0*0.5-Math.sin(u*Math.PI)*h0*0.4),3,215,25,80,['O','o','.']);
  decor(S,off,h0);

  const A=AMB[ty]; if(A) for(let i=0;i<A[8];i++){ if(A[7]>-1&&Math.sin(t*3+i*7)<A[7]) continue; const c=Math.floor(((h2(i,7,1)*cols+t*A[3])%cols+cols)%cols), r=Math.round(h0*(A[5]+A[6]*h2(i,8,2))+Math.sin(t*0.8+i*3)*A[4]); put(c,r,A[0][(Math.sin(t*6+i)>0)|0]||A[0][0],`hsl(${(A[1]+(ty==='crystal'?(i%3)*40:0))|0} 80% ${A[2]}%)`); }
  if(ty==='lava'||ty==='ice') for(let i=0;i<16;i++){ const c=Math.floor(h2(i,7,1)*cols), up=ty==='lava', r=up?h0+6-Math.floor((t*7+i*11)%(h0+6)):Math.floor((t*5+i*13)%h0); put(c,r,up?'.':'*',up?'hsl(25 95% 55%)':'hsl(195 30% 88%)'); }
  const pr=gy(Math.round(S.x))-1, dxh=((S.home-S.x+W/2)%W+W)%W-W/2, hc=pc+Math.round(dxh), hg=gy(S.home), hh=SH().hue;
  drawLander(hc,hg,hh,Math.abs(dxh)<6*Z);
  drawAstro(S,pc,pr);
  if(S.tp>0) for(let r=0;r<rows;r++) if(h2(r,t*40|0,3)<0.55*S.tp/0.35) put(pc+((r*7)%5)-2,r,h2(r,t*50|0,4)<0.5?':':'|',ACC);
  if(S.nd) text(pc-8,pr-4-(Z>=1.5?5:0),GOODS[S.nd.g][0]+' x'+S.nd.u+(touchUI?'':'  [F] minar'),ACC);
  if(S.prog>0){ const f=Math.round(S.prog*8); text(pc-5,pr-3-(Z>=1.5?5:0),'['+'#'.repeat(f)+'-'.repeat(8-f)+']',HUDC); }
}
function drawSurfHud(){ const S=surf,p=S.p,W=S.W,ty=p.type;
  const e=Math.round(clamp(S.en/100,0,1)*14), bw=26, bar=Array(bw).fill('-'); bar[Math.round(S.home/W*(bw-1))]='A'; bar[Math.round(S.x/W*(bw-1))]='@';
  [p.name+' - '+TYPE_ES[ty],'Temp '+p.temp+' C  grav '+p.grav.toFixed(2)+' g','ENERGIA ['+'#'.repeat(e)+'-'.repeat(14-e)+']',
   'BOTIN '+(Object.entries(S.got).map(([g,u])=>GOODS[g][0]+' '+u).join(', ')||'-')+'  ('+Math.round(tot())+'/'+cap()+')',
   'VUELTA AL MUNDO '+W+'u ['+bar.join('')+']',
   (touchUI?'':'< > mover  [F] minar  ')+'[L] despegar (junto a la nave)'].forEach((l,i)=>text(2,1+i,l,i===2&&S.en<30?ACC:i?HUDC:ACC));
  if(toastT>0){ const m='* '+toastMsg+' *'; text(Math.floor((cols-m.length)/2),Math.floor(rows*0.2),m,ACC); }
}
