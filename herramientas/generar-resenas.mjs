// Genera las reseñas de la sección Opinións desde sitio/js/datos.js y las pone entre las marcas de index.html.
// Uso: node herramientas/generar-resenas.mjs
import fs from 'node:fs';
import { resenas } from '../sitio/js/datos.js';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mes = (aaaamm) => new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${aaaamm}-01T00:00:00Z`));

const html = resenas.lista.map((r, i) => `<li class="resena${i === 0 ? ' activa' : ''}" data-resena="${i}">
  <blockquote>
    <p class="resena__texto">«${esc(r.texto)}»</p>
  </blockquote>
  <p class="resena__pie"><span class="resena__autor">${esc(r.autor)}</span> <span class="resena__estrellas" role="img" aria-label="${r.estrellas} de 5 estrellas">${'★'.repeat(r.estrellas)}</span> <span class="resena__fecha">${mes(r.fecha)}</span></p>
</li>`).join('\n');

const ruta = new URL('../sitio/index.html', import.meta.url);
const pagina = fs.readFileSync(ruta, 'utf8');
const ini = '<!-- resenas:inicio (generado por herramientas/generar-resenas.mjs) -->';
const fin = '<!-- resenas:fin -->';
const a = pagina.indexOf(ini), b = pagina.indexOf(fin);
if (a < 0 || b < 0) throw new Error('Faltan las marcas de reseñas en index.html');
const n = a - (pagina.lastIndexOf('\n', a) + 1);
const sangrado = html.split('\n').map((l) => ' '.repeat(n) + l).join('\n');
fs.writeFileSync(ruta, pagina.slice(0, a + ini.length) + '\n' + sangrado + '\n' + ' '.repeat(n) + pagina.slice(b));
console.log(`Reseñas generadas: ${resenas.lista.length}`);
