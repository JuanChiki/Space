'use strict';
/* Contactos NPC de las estaciones: sus dialogos y decisiones (SC) y la etiqueta que aparece en el menu. */

/* contactos (NPC): una charla por estacion y dia, con decisiones que cambian reputacion */
const SC={
pir:{t:"Capitan pirata: 'Paga tributo o vuela tranquilo'",o:[
 {l:'Pagar tributo (-80 cr)',fn:()=>R.cr<80?'!Faltan creditos':(R.cr-=80,'Tributo pagado. '+addRep({pir:10}))},
 {l:'Rechazar con firmeza',fn:()=>'Te dejan ir con mala cara. '+addRep({pir:-2})},
 {l:'Delatarlo a la Federacion (+60 cr)',fn:()=>(R.cr+=60,'La Federacion lo agradece. '+addRep({fed:6,pir:-12}))}]},
fed:{t:"Oficial federal: 'Revisaremos su bodega.'",o:[
 {l:'Permitir la inspeccion',fn:()=>'Todo en orden. '+addRep({fed:3})},
 {l:'Sobornar al oficial (-60 cr)',fn:()=>R.cr<60?'!Faltan creditos':(R.cr-=60,'Mira hacia otro lado. '+addRep({fed:-8}))},
 {l:'Donar 2 componentes',fn:()=>R.comp<2?'!Faltan componentes':(R.comp-=2,'Donacion aceptada. '+addRep({fed:8}))}]},
com:{t:"Comerciante: 'Tengo un trato... discreto'",o:[
 {l:'Aceptar el trato (+120 cr)',fn:()=>(R.cr+=120,'Trato sucio cerrado. '+addRep({com:-6,fed:-4}))},
 {l:'Rechazar',fn:()=>'Se encoge de hombros. '+addRep({com:2})},
 {l:'Denunciarlo a la Federacion',fn:()=>'Lo arrestan. '+addRep({fed:5,com:-8})}]},
exp:{t:"Cientifica: 'Necesitamos tus datos de escaneo'",o:[
 {l:'Compartir tus datos',fn:()=>'Gracias por tu aporte. '+addRep({exp:6})},
 {l:'Vender los datos (+80 cr)',fn:()=>(R.cr+=80,'Datos vendidos. '+addRep({exp:-3}))},
 {l:'Ignorarla',fn:()=>'Se aleja decepcionada. '+addRep({exp:-1})}]}};
const npcK=st=>st.id+'|'+Math.floor((R.clk||0)/600), npcLbl=()=>R.npc[npcK(docked)]?'Contacto: sin novedades':'Contacto: '+FS[profOf(docked).f]+' quiere hablar';
