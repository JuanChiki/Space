'use strict';
/* Catalogo visual y de estadisticas de naves: disenos ASCII, paletas, tabla FOE y tablas de aparicion (SPAWN).
   Para anadir un enemigo: nuevo diseno + paleta + entrada en FOE + entrada en SPAWN (o en REGION_SPAWN). */

const run=(a,b,sv,ch,mir,ci)=>{ const o=[]; for(let f=a;f<=b;f++) o.push([f,sv,ch,mir,ci]); return o; };
/* celda: [adelante, lateral, glifo, espejo, color]  glifos: N nariz, W ala, L linea, T travesaño; colores: 0 casco 1 sombra 2 cabina 3 motor 4 luz 5 arma */
const HULLS=[
 [...run(-2,2,0,'#',0,0),[2.6,0,'O',0,2],[4,0,'L',0,0],[5.2,0,'L',0,0],[6.6,0,'N',0,0],[-3,0,'=',0,3],[-2.2,1.8,'=',1,3],[0,1.8,'W',1,0],[-1.2,3.6,'W',1,0],[-2.4,5.4,'W',1,1],[-3.4,5.4,'*',1,4],[2.4,1.8,'L',1,1]],
 [...run(-1,2,0,'#',0,0),...run(-1,2,1.8,'#',1,1),[2,0,'O',0,2],[3.4,0,'L',0,0],[4.6,0,'N',0,0],[-2.5,0,'=',0,3],[-2.5,1.8,'=',1,3],[3.6,3.6,'L',1,5],[2.4,3.6,'L',1,1],[0.4,3.6,'T',1,1],[-1.2,3.6,'*',1,4]],
 [...run(-2,3,0,'#',0,0),[2.4,0,'O',0,2],[4.4,0,'L',0,0],[5.6,0,'L',0,0],[6.8,0,'L',0,5],[8,0,'N',0,0],[-3,0,'=',0,3],[-2.4,1.8,'=',1,3],[0.4,1.8,'W',1,0],[-0.8,3.6,'W',1,0],[-2,5.4,'W',1,0],[-3.2,7.2,'W',1,1],[-4.2,7.2,'*',1,4],[3.4,1.8,'L',1,5]]];
const RAIDER=[...run(-2,2,0,'#',0,0),[1.6,0,'@',0,2],[3.4,0,'L',0,0],[4.8,0,'N',0,0],[-3,0,'=',0,3],[-3,1.8,'=',1,3],[4.2,1.8,'L',1,5],[4.2,3.6,'L',1,1],[3,3.6,'L',1,1],[-0.4,1.8,'W',1,0],[-1.6,3.6,'W',1,1],[-2.6,5.4,'W',1,1],[-3.4,5.4,'*',1,4]];
const DART=[...run(-1,2,0,'#',0,0),[1,0,'@',0,2],[3,0,'L',0,0],[4.2,0,'L',0,0],[5.4,0,'N',0,0],[-2,0,'=',0,3],[-0.4,1.8,'W',1,1],[-1.4,3.6,'*',1,4]];
const BRUTE=[...run(-2,3,0,'#',0,0),...run(-2,3,1.8,'#',1,1),...run(-1,2,3.6,'#',1,1),[2,0,'@',0,2],[4,0,'#',0,0],[5.2,0,'N',0,0],[-3,0,'=',0,3],[-3,1.8,'=',1,3],[-3,3.6,'=',1,3],[0.4,1.8,'O',1,5],[3.4,1.8,'L',1,5],[3.4,3.6,'L',1,5],[-0.4,5.4,'*',1,4]];
const SNIPE=[...run(-2,2,0,'#',0,0),[0.6,0,'@',0,2],[3,0,'L',0,5],[4.4,0,'L',0,5],[5.8,0,'L',0,5],[7.2,0,'N',0,0],[-3,0,'=',0,3],[-1.2,1.8,'W',1,1],[-2.2,3.6,'*',1,4],[1.6,1.8,'o',1,5]];
const BOSS=[...run(-4,5,0,'#',0,0),...run(-3,4,1.8,'#',1,1),[6,0,'#',0,0],[7,0,'L',0,0],[8.2,0,'N',0,0],[2,0,'O',0,2],[1,1.8,'O',1,5],[-1,1.8,'O',1,5],[1.2,3.6,'W',1,0],[0,5.4,'W',1,0],[-1.2,7.2,'W',1,1],[-2.4,9,'W',1,1],[-3.4,9,'*',1,4],[6.4,1.8,'L',1,5],[7,3.6,'L',1,5],[-4.8,0,'=',0,3],[-4.8,1.8,'=',1,3],[-4.8,3.6,'=',1,3]];
const palH=h=>[`hsl(${h} 40% 82%)`,`hsl(${h} 30% 50%)`,'hsl(190 90% 75%)',0,['hsl(0 90% 62%)','hsl(140 85% 62%)'],'hsl(48 100% 70%)'];
const PR=['hsl(355 60% 62%)','hsl(355 45% 38%)','hsl(48 100% 65%)',0,['hsl(30 100% 60%)','hsl(30 100% 60%)'],'hsl(20 90% 55%)'];
const PB=['hsl(300 55% 68%)','hsl(300 40% 40%)','hsl(55 100% 70%)',0,['hsl(300 100% 70%)','hsl(300 100% 70%)'],'hsl(330 90% 60%)'];
const PW=Array(6).fill('hsl(40 100% 92%)');
const tipP=c=>[c,c];
const PD=['hsl(28 90% 62%)','hsl(28 60% 38%)','hsl(48 100% 70%)',0,tipP('hsl(48 100% 60%)'),'hsl(48 100% 60%)'];
const PBR=['hsl(345 55% 52%)','hsl(345 45% 30%)','hsl(48 100% 65%)',0,tipP('hsl(20 100% 60%)'),'hsl(20 90% 55%)'];
const PSN=['hsl(52 75% 62%)','hsl(52 45% 36%)','hsl(0 100% 65%)',0,tipP('hsl(52 100% 70%)'),'hsl(0 90% 62%)'];
const FOE={
 raider:{n:'Pirata',des:RAIDER,pal:PR,hp:1,spd:70,turn:2.2,cd:1.3,dmg:1,sp:230,rng:200,keep:[45,80],xp:25,r:4.5,h:3,ch:'o'},
 dart:{n:'Aguijon',des:DART,pal:PD,hp:0.5,spd:115,turn:3.4,cd:0.8,dmg:0.6,sp:270,rng:170,keep:[30,60],xp:20,r:3.5,h:2,ch:'.'},
 brute:{n:'Acorazado',des:BRUTE,pal:PBR,hp:2.4,spd:42,turn:1.3,cd:2,dmg:1.8,sp:170,rng:220,keep:[70,110],xp:50,r:6.5,h:4,ch:'O'},
 sniper:{n:'Francotirador',des:SNIPE,pal:PSN,hp:0.8,spd:60,turn:2.6,cd:2.1,dmg:1.4,sp:380,rng:330,keep:[170,230],xp:35,r:4,h:3,ch:'+'},
 drone:{n:'Dron salvaje',des:DART,pal:PD,hp:0.4,spd:95,turn:3,cd:1,dmg:0.5,sp:250,rng:150,keep:[25,50],xp:12,r:3,h:2,ch:'.'},
 wraith:{n:'Espectro',des:SNIPE,pal:PD,hp:0.6,spd:130,turn:3.8,cd:0.7,dmg:1.2,sp:300,rng:180,keep:[40,80],xp:40,r:3.5,h:2,ch:'~'},
 boss:{n:'Jefe pirata',des:BOSS,pal:PB,hp:1,spd:70,turn:2.2,cd:0.4,dmg:1.3,sp:240,rng:230,keep:[60,100],xp:60,r:7,h:5,ch:'@'}};
// Enemigos que aparecen al azar: [tipo, peligro minimo, reputacion pirata a partir de la cual tambien aparece].
// Repetir un tipo lo hace mas frecuente. El jefe no aparece aqui: lo crea una mision.
const SPAWN=[['raider',-1],['raider',-1],['dart',0.15,-30],['sniper',0.25,-60],['brute',0.35,-60]];
// Enemigos propios de cada region (ver REG en data/regions.js).
const REGION_SPAWN={nebula:['drone','drone'],storm:['wraith','wraith']};
const SHB=['      _      ','     / \\     ','    / _ \\    ','   | ( ) |   ','   |  _  |   ','   | | | |   ','   | | | |   ','   | | | |   ','  /  | |  \\  ',' /   | |   \\ ','(___________)'];
const SHE={1:['*    |_|    *','     ( )     '],2:['* |_|   |_| *','  ( )   ( )  '],3:['* |_||_||_| *','  ( )( )( )  ']};
const SHW={
 pulse:{5:'   | | | |   ',6:'/\\ | | | | /\\',7:'|| | | | | ||',8:'||/  | |  \\||',9:'|/   | |   \\|'},
 cannon:{4:' _ |  _  | _ ',5:'/ \\| | | |/ \\',6:'|=|| | | ||=|',7:'|=|| | | ||=|',8:'|=/  | |  \\=|',9:'|/   | |   \\|'},
 laser:{5:' + | | | | + ',6:' | | | | | | ',7:' | | | | | | ',8:' |/  | |  \\| ',9:' /   | |   \\ '}};
const NOZ=[[],[6],[3,9],[3,6,9]];   // posiciones de las toberas segun el nivel del motor
