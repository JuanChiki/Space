// Analisis estatico del proyecto: nombres sin definir (no-undef), nombres duplicados entre archivos y
// dependencias "hacia arriba" de las capas data/ y universe/.
// uso:  cd tools && npm install && node check.mjs ..
import fs from 'fs'; import path from 'path'; import { Linter } from 'eslint'; import globals from 'globals'; import * as acorn from 'acorn'; import * as walk from 'acorn-walk';
const root = process.argv[2]; const order = [...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1]);   // el orden de carga vive en index.html
const decl = {}; // nombre -> archivo
const dups = [];
for (const f of order) {
  const src = fs.readFileSync(path.join(root,f),'utf8'); const ast = acorn.parse(src,{ecmaVersion:2022,sourceType:'script'});
  for (const n of ast.body) {
    const add = (name)=>{ if (decl[name]) dups.push(`${name}: ${decl[name]} y ${f}`); decl[name]=f; };
    if (n.type==='FunctionDeclaration') add(n.id.name);
    else if (n.type==='VariableDeclaration') for (const d of n.declarations) { if (d.id.type==='Identifier') add(d.id.name); else walk.simple(d.id,{Identifier:(x)=>add(x.name)}); }
  }
}
console.log('nombres globales definidos:', Object.keys(decl).length, '| duplicados entre archivos:', dups.length ? dups : 'ninguno');
const linter = new Linter({ configType:'flat' });
const G = Object.fromEntries(Object.keys(decl).map(k=>[k, 'writable']));
let problems = 0;
for (const f of order) {
  const src = fs.readFileSync(path.join(root,f),'utf8');
  const msgs = linter.verify(src, [{ files:['**/*.js'], languageOptions:{ ecmaVersion:2022, sourceType:'script', globals:{...globals.browser, ...G, __astro:'writable'} }, rules:{ 'no-undef':'error','no-const-assign':'error','no-dupe-keys':'error','no-unreachable':'warn' } }], { filename: f });
  for (const m of msgs) { problems++; console.log(`${f}:${m.line}:${m.column} ${m.ruleId||'sintaxis'} ${m.message}`); }
}
console.log('problemas de analisis estatico:', problems);
// matriz de dependencias: que archivo usa nombres definidos en que otro
const layer = f => f.split('/')[1]==='config.js'?'config':f.split('/')[1]; 
const LAYERS = ['config','core','data','universe','player','entities','systems','rendering','ui','debug.js','main.js'];
const deps = {}; 
for (const f of order) {
  const src = fs.readFileSync(path.join(root,f),'utf8'); const ast = acorn.parse(src,{ecmaVersion:2022,sourceType:'script'});
  const own = new Set(Object.entries(decl).filter(([k,v])=>v===f).map(([k])=>k));
  const used = new Set(); walk.simple(ast,{Identifier:(x)=>{ if (decl[x.name] && !own.has(x.name)) used.add(x.name); }});
  deps[f]=[...used].map(n=>[n,decl[n]]);
}
fs.writeFileSync(path.join(root,'tools','deps.json'), JSON.stringify({decl,deps},null,1));
// violaciones de capa "hacia arriba" para las capas puras
const rank = {config:0,core:1,data:2,universe:3,player:4,entities:5,systems:6,rendering:7,ui:8};
const pure = ['data','universe'];
for (const f of order) { const lf = layer(f); if (!pure.includes(lf)) continue;
  const bad = deps[f].filter(([n,g])=> (rank[layer(g)]??9) > rank[lf]);
  if (bad.length) console.log(`  capa ${lf}: ${f} usa -> ${[...new Set(bad.map(([n,g])=>n+'('+g.replace('js/','')+')'))].join(', ')}`);
}
