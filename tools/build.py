#!/usr/bin/env python3
"""Empaqueta el proyecto en UN solo archivo HTML (dist/Space.html) para compartirlo o abrirlo con doble clic.

  python3 tools/build.py            -> dist/Space.html   (sin ganchos de depuracion)
  python3 tools/build.py --debug    -> dist/Space.html   (con window.__astro, para los tests)

El orden de los scripts se lee de index.html: ese archivo es la unica fuente de verdad del orden de carga.
Todo el codigo se envuelve en una funcion anonima, como en la version original de un solo archivo."""
import os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')
debug = '--debug' in sys.argv

srcs = re.findall(r'<script src="([^"]+)"></script>', html)
if not debug:
    srcs = [s for s in srcs if not s.endswith('debug.js')]
code = '\n'.join(f'/* ---- {s} ---- */\n' + rd(s) for s in srcs)
code = code.replace("'use strict';\n", '')             # un solo 'use strict' al principio del bloque
bundle = "(() => {\n'use strict';\n" + code + "\n})();"

css = rd('css/style.css')
html = re.sub(r'<link rel="stylesheet" href="css/style.css">', lambda m: '<style>\n' + css + '</style>', html)
html = re.sub(r'(<script src="[^"]+"></script>\n?)+', lambda m: '<script>\n' + bundle + '\n</script>\n', html, count=1)
out = os.path.join(root, 'dist', 'Space.html')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html)
print(f'{out}  ({len(html)//1024} KB, {len(srcs)} archivos de codigo)')
