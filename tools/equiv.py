"""Test de equivalencia: ejecuta el MISMO escenario en dos versiones del juego y compara fotograma a fotograma.
Sirve para refactorizar sin miedo: si el comportamiento no debe cambiar, el resultado debe ser "0 con diferencias".

uso:  python3 tools/equiv.py A.html B.html [--viewport WxH] [--verbose]
      (A = version de referencia, B = la nueva; para el bundle usa: python3 tools/build.py --debug)
requiere: pip install playwright && playwright install chromium
nota: necesita los ganchos window.__astro (js/debug.js); el bundle de produccion no los incluye.
- Math.random sembrado, requestAnimationFrame anulado (solo avanza __astro.step)
- compara: texto de pantalla, hash del canvas, estado (R, nave, listas)"""
import asyncio, hashlib, json, sys
from playwright.async_api import async_playwright

INIT = """
(() => {
  let s = 123456789;
  Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.requestAnimationFrame = () => 0;
})();
"""

SNAP = """() => { const A = window.__astro, cv = document.getElementById('cv');
  const st = { R: JSON.parse(JSON.stringify(A.R)), ship: { ...A.ship }, foes: A.foes.map(f => [f.k, Math.round(f.x), Math.round(f.y), +f.hp.toFixed(2)]), shots: A.shots.map(s => [+s.x.toFixed(2), +s.y.toFixed(2), +s.life.toFixed(2)]), loot: A.loot.map(l => [l.g, l.u, +l.x.toFixed(2), +l.y.toFixed(2), +l.life.toFixed(2)]),
    disc: [...A.discovered], vis: [...A.visited].length, log: A.logBook.length, pings: A.pings };
  return { dump: A.dump(), px: cv.toDataURL(), st: JSON.stringify(st) }; }"""

STEP = "([n, dt]) => { for (let i = 0; i < n; i++) window.__astro.step(dt); }"
KEYS = "(k) => { const A = window.__astro; for (const x in A.keys) A.keys[x] = false; for (const x of k) A.keys[x] = true; }"
TP = "([x, y]) => { const A = window.__astro; A.ship.x = x; A.ship.y = y; A.ship.vx = A.ship.vy = 0; }"

async def run(path, viewport, out):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport=viewport)
        await ctx.add_init_script(INIT)
        pg = await ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + path)
        await pg.wait_for_timeout(1800)
        n = [0]

        async def cp(label):
            r = await pg.evaluate(SNAP)
            out.append((label, r['dump'], hashlib.md5(r['px'].encode()).hexdigest(), r['st']))
        async def step(k, n_=1, dt=0.05):
            await pg.evaluate(STEP, [n_, dt])
        async def keys(*k):
            await pg.evaluate(KEYS, list(k))
        async def tp(x, y):
            await pg.evaluate(TP, [x, y])
        async def press(*ks, wait=30):
            for k in ks:
                await pg.keyboard.press(k)
                await pg.wait_for_timeout(wait)
        async def both(label, n_=1, dt=0.05):
            await step(None, n_, dt); await cp(label)

        # 1. reposo y vuelo
        await both('reposo', 20)
        await keys('right'); await both('giro', 15)
        await keys('up'); await both('empuje', 30)
        await keys('up', 'shift'); await both('turbo', 30)
        await keys('down'); await both('freno', 30)
        await keys(); await both('inercia', 20)
        # 2. escaneo y disparo
        await tp(-60, -165 + 70)       # cerca del planeta p0d (rocky)
        await both('cerca-planeta', 10)
        await keys('scan'); await both('escaneando', 40); await keys(); await both('escaneado', 10)
        await keys('fire'); await both('disparo', 40); await keys(); await both('post-disparo', 20)
        # 3. estacion: atracar, menus, mercado
        await pg.evaluate("() => { const A = window.__astro; A.R.cg = { metal: 3, gas: 2, bio: 1 }; A.R.cr = 3000; A.R.comp = 4; }")
        await tp(195, 95 + 30); await keys(); await both('estacion', 30)
        await keys('dock'); await both('atracando', 3); await keys(); await both('atracada', 5)
        await cp('muelle-0')
        for i, k in enumerate(['8', 'ArrowDown', 'ArrowDown', 'Enter', 'Enter', 'ArrowDown', 'Enter', '1', '1', '2', '3', '4', '5', '6', '7', '8', 'ArrowDown', 'Enter', 'Enter', 'Escape', '1', '2', '3', '4', '5', '6', '7']):
            await press(k); await both(f'muelle-{i}', 2)
        await press('9'); await both('hangar', 2); await press('1', '2', '4', '5', '6'); await both('hangar-compra', 2); await press('Escape'); await both('muelle-fin', 2)
        await press('0'); await both('zarpar', 10)
        # 4. aterrizar y minar
        await tp(62 + 22 + 5, -18); await both('cerca-oceano', 20)
        await keys('land'); await both('aterrizando', 3); await keys(); await both('superficie', 10)
        await keys('right'); await both('caminar', 20); await keys(); await both('quieto', 3)
        await keys('left'); await both('volver', 20); await keys(); await both('en-casa', 3)
        await pg.evaluate("() => { window.__astro.step(0.05); }")
        await keys('fire'); await both('minar', 60); await keys(); await both('sup-fin', 5)
        await keys('land'); await both('despegue', 3); await keys(); await both('espacio', 10)
        # 5. interfaces
        await press('m'); await both('mapa', 2); await press('ArrowRight', 'ArrowDown'); await both('mapa-cursor', 2)
        await press('c'); await both('catalogo', 2); await press('d', 's'); await both('cat-filtro', 2)
        await press('j'); await both('bitacora', 2); await press('Escape'); await both('cierra', 2)
        await press('i'); await both('inventario', 2); await press('i'); await both('inv-cierra', 2)
        await press('o'); await both('opciones', 2); await press('d', 'd', 'a'); await both('opc-cambio', 3); await press('o'); await both('opc-cierra', 3)
        await press('h'); await both('ayuda', 2)
        # 5b. mineria (romper asteroide, recoger botin) y caza (enemigos y jefe)
        await tp(0, 300); await both('hacia-asteroides', 5)
        for k in range(3):
            await pg.evaluate("""() => { const A = window.__astro; const ro = A.near().R.filter(a => a.x < 1e8).sort((p, q) => Math.hypot(p.x - A.ship.x, p.y - A.ship.y) - Math.hypot(q.x - A.ship.x, q.y - A.ship.y))[0];
              A.ship.x = ro.x - 38; A.ship.y = ro.y; A.ship.vx = A.ship.vy = A.ship.av = 0; A.ship.a = 0; }""")
            await keys('fire')
            if k == 0:
                for i in range(75): await both(f'mina-fino-{i}', 1)      # un fotograma por punto: detecta diferencias de orden dentro del fotograma
            else:
                await both(f'mina-{k}', 70)
            await keys(); await both(f'botin-{k}', 60)
        await pg.evaluate("() => { const A = window.__astro; A.R.hull = 400; A.spawnFoe('raider', A.ship.x + 70, A.ship.y); A.spawnFoe('dart', A.ship.x + 90, A.ship.y + 10); A.spawnFoe('brute', A.ship.x - 90, A.ship.y); A.spawnFoe('sniper', A.ship.x + 40, A.ship.y - 60); }")
        await keys('fire'); await both('caza-1', 50)
        await pg.evaluate("() => { const A = window.__astro; for (const f of A.foes) A.ship.a = Math.atan2(f.y - A.ship.y, f.x - A.ship.x); }")
        await both('caza-2', 80); await pg.evaluate("() => { const A = window.__astro; const f = A.foes[0]; if (f) A.ship.a = Math.atan2(f.y - A.ship.y, f.x - A.ship.x); }")
        await both('caza-3', 120); await keys(); await both('caza-fin', 40)
        await pg.evaluate("() => { const A = window.__astro; A.R.m = null; A.spawnBoss(); }"); await both('jefe', 30)
        await pg.evaluate("() => { const A = window.__astro; for (const f of A.foes) { f.hp = 1; A.ship.a = Math.atan2(f.y - A.ship.y, f.x - A.ship.x); } }")
        await keys('fire'); await both('jefe-muere', 200); await keys(); await both('jefe-fin', 30)
        # 6. senales y combate (derelict con emboscada o baliza)
        await pg.evaluate("""() => { const A = window.__astro; let g = null;
          for (let d = 1; d < 25 && !g; d++) for (let sx = -d; sx <= d && !g; sx++) for (let sy = -d; sy <= d && !g; sy++)
            for (const q of A.getSector(sx, sy).signals) if (q.st === 'derelict' && A.sigPlan(q).ambush) { g = q; break; }
          A.ship.x = g.x - 60; A.ship.y = g.y; A.ship.vx = A.ship.vy = 0; }""")
        await both('senal-cerca', 12)
        await keys('scan'); await both('senal-scan', 40); await keys(); await both('emboscada', 10)
        await keys('fire', 'up'); await both('combate-1', 120); await keys('fire', 'right'); await both('combate-2', 120)
        await keys(); await both('combate-fin', 60)
        # 7. muerte
        await pg.evaluate("() => { window.__astro.R.hull = 1; }")
        await keys('fire', 'left'); await both('muerte', 400); await keys(); await both('tras-muerte', 20)
        # 7b. SISTEMAS NUEVOS (v7): base, consola, contactos, taller, cronica, rumbo, regiones, misterios, zoom
        await tp(2500, -2500); await both('lejos', 10)
        await pg.evaluate("() => { const A = window.__astro; A.R.cr = 6000; A.R.cg = { metal: 12, cryst: 12, ice: 6, gas: 6, bio: 6 }; A.R.comp = 20; A.R.hull = 100; A.R.fuel = 100; }")
        await press('b'); await both('construye-base', 5)
        await press('Backquote'); await both('consola-abre', 2)
        for cmd in ['ayuda', 'dinero 700', 'armas', 'tecno', 'rp 300', 'rep todas 40']:
            await pg.keyboard.type(cmd); await press('Enter'); await both('consola-' + cmd.split()[0], 2)
        await press('Escape'); await both('consola-cierra', 2)
        await pg.evaluate("() => { const A = window.__astro; for (const id of Object.keys(A.MODS)) A.conRun('modulo ' + id + ' 2'); }")
        await keys('dock'); await both('acoplando-base', 3); await keys(); await both('en-base', 5)
        for i, k in enumerate(['1', '1', '2', '3', '0', '2', '1', '2', '3', '4', '0', '3', '1', '2', '0', 'ArrowDown', 'Enter', '0', '0']):
            await press(k); await both(f'base-{i}', 3)
        await both('tras-base', 60)
        await press('y'); await both('cronica', 2); await press('Escape'); await both('cronica-cierra', 2)
        # estacion: contactos y taller
        await tp(195, 95 + 30); await keys(); await both('estacion-2', 20)
        await keys('dock'); await both('atracando-2', 3); await keys(); await both('atracada-2', 3)
        for pgn in (3, 5, 2, 1, 0):
            await pg.evaluate("(p) => window.__astro.setPage(p)", pgn); await both(f'pagina-{pgn}', 2)
            for i, k in enumerate(['1', '2', '3', '4', '5', '6', '7', '1', '0']):
                await press(k); await both(f'pagina-{pgn}-{i}', 2)
        await press('0'); await both('zarpar-2', 10)
        # rumbo (waypoint) hacia un planeta y llegada
        await pg.evaluate("() => { const A = window.__astro; A.toggleWp({ id: 'p0a', o: { name: 'Destino' } }); }")
        await tp(-300, 200); await keys('up'); await both('rumbo-vuelo', 40); await keys(); await both('rumbo-fin', 10)
        await press('c'); await both('cat-rumbo', 2); await press('Enter'); await both('cat-rumbo-enter', 2); await press('Escape'); await both('cat-cierra', 2)
        await tp(60, -10); await both('rumbo-llega', 20)
        # regiones: nebulosa, tormenta, vacio
        regs = await pg.evaluate("""() => { const A = window.__astro, f = {}; for (let d = 2; d < 60; d++) for (let sx = -d; sx <= d; sx++) for (let sy = -d; sy <= d; sy++) { if (Math.max(Math.abs(sx), Math.abs(sy)) !== d) continue; const k = A.regionAt(sx, sy); if (k && !f[k]) f[k] = [sx, sy]; } return f; }""")
        for k, (sx, sy) in sorted(regs.items()):
            await tp(sx * 500 + 100, sy * 500 + 100)
            await pg.evaluate("() => { window.__astro.R.hull = 100; window.__astro.R.fuel = 60; }")   # casco y combustible bajo el maximo: asi se ve el efecto de la region
            await both('region-' + k, 5)
            for i in range(10): await both(f'region-{k}-quieto-{i}', 40)     # 20 s quieto dentro de la region: aqui actuan tormenta, nebulosa y vacio
            await keys('up')
            for i in range(3): await both(f'region-{k}-vuelo-{i}', 20)
            await keys()
        # misterios
        mys = await pg.evaluate("""() => { const A = window.__astro, f = {}; for (let d = 1; d < 60; d++) for (let sx = -d; sx <= d; sx++) for (let sy = -d; sy <= d; sy++) { if (Math.max(Math.abs(sx), Math.abs(sy)) !== d) continue; for (const g of A.getSector(sx, sy).signals) if (!['derelict','debris','beacon','ruins','anomaly','nothing'].includes(g.st) && !f[g.st]) f[g.st] = g.id; } return f; }""")
        for st, sid in sorted(mys.items()):
            await pg.evaluate("""(sid) => { const A = window.__astro, m = /^g(-?\\d+),(-?\\d+),/.exec(sid), g = A.getSector(+m[1], +m[2]).signals.find(q => q.id === sid); A.ship.x = g.x - 60; A.ship.y = g.y; A.ship.vx = A.ship.vy = 0; }""", sid)
            await both('misterio-' + st, 12); await keys('scan'); await both('misterio-' + st + '-scan', 50); await keys(); await both('misterio-' + st + '-fin', 20)
        # zoom de alta resolucion: simbolos pequenos cerca de estacion y de la base
        await pg.evaluate("() => window.__astro.setFs(7)"); await both('zoom-on', 3)
        await tp(195, 95 + 80); await both('zoom-estacion', 15)
        await pg.evaluate("() => { const A = window.__astro; A.ship.x = A.R.base.x + 40; A.ship.y = A.R.base.y; A.ship.vx = A.ship.vy = 0; }"); await both('zoom-base', 15)
        await press('m'); await both('zoom-mapa', 2); await press('Escape'); await pg.evaluate("() => window.__astro.setFs(14)"); await both('zoom-off', 3)
        # 8. paso del tiempo largo (eventos de mercado, reloj, spawns)
        await tp(900, 900); await both('largo', 600, 0.05)
        await cp('final')
        errs_out = errs[:]
        await b.close()
        return errs_out

async def main():
    a, bpath = sys.argv[1], sys.argv[2]
    vp = {'width': 1100, 'height': 700}
    if '--viewport' in sys.argv:
        w, h = sys.argv[sys.argv.index('--viewport') + 1].split('x'); vp = {'width': int(w), 'height': int(h)}
    oa, ob = [], []
    ea = await run(a, vp, oa)
    eb = await run(bpath, vp, ob)
    print('errores A:', ea); print('errores B:', eb)
    bad = 0
    if len(oa) != len(ob): print('distinto numero de checkpoints', len(oa), len(ob)); bad += 1
    for (la, da, pa, sa), (lb, db, pb, sb) in zip(oa, ob):
        probs = []
        if da != db: probs.append('pantalla')
        if pa != pb: probs.append('pixeles')
        if sa != sb: probs.append('estado')
        if probs:
            bad += 1
            print(f'DIFERENTE en "{la}": {", ".join(probs)}')
            if '--verbose' in sys.argv and da != db:
                la_, lb_ = da.split('\n'), db.split('\n')
                for i, (x, y) in enumerate(zip(la_, lb_)):
                    if x != y: print(f'  fila {i}\n   A: {x}\n   B: {y}'); break
            if '--verbose' in sys.argv and sa != sb:
                ja, jb = json.loads(sa), json.loads(sb)
                for k in ja:
                    if ja[k] != jb[k]: print('  estado difiere en', k, str(ja[k])[:160], '|', str(jb[k])[:160])
    print(f'{len(oa)} checkpoints comparados, {bad} con diferencias')
    sys.exit(1 if bad else 0)
asyncio.run(main())
