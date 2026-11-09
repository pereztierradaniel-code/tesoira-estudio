// Genera el HTML de la sección Servizos desde sitio/js/datos.js y lo pone entre las marcas de index.html.
// Uso: node herramientas/generar-servicios.mjs
import fs from 'node:fs';
import { servicios } from '../sitio/js/datos.js';
import { formatoDuracion, formatoPrecio } from '../sitio/js/ticket-logica.js';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cats = [['pelo', 'Pelo'], ['barba', 'Barba'], ['extras', 'Extras']];
const sangria = (txt, n) => txt.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

const tarjeta = (s) => `<li class="servicio" data-id="${s.id}">
  <div class="servicio__fila">
    <button class="servicio__cabeza" type="button" aria-expanded="false" aria-controls="detalle-${s.id}">
      <span class="servicio__nombre">${esc(s.nombre)}</span>
      <span class="servicio__tiempo">${formatoDuracion(s.duracion)}</span>
      <span class="servicio__precio">${formatoPrecio(s.precio)}</span>
    </button>
    <button class="servicio__mas" type="button" aria-pressed="false" data-ticket="${s.id}" aria-label="Añadir ${esc(s.nombre)} al ticket"><span aria-hidden="true">+</span></button>
  </div>
  <div class="servicio__detalle" id="detalle-${s.id}">
    <p>${esc(s.descripcion)}</p>
    <p class="servicio__datos">${formatoDuracion(s.duracion)} aproximadamente · ${formatoPrecio(s.precio)}</p>
    <div class="servicio__acciones">
      <button class="btn btn-ticket" type="button" aria-pressed="false" data-ticket="${s.id}">Añadir al ticket</button>
      <a class="enlace-flecha" href="#reservar" data-reservar="${s.id}">Reservar solo este →</a>
    </div>
  </div>
</li>`;

const pestanas = cats.map(([c, n], i) => `<button class="pestana" type="button" role="tab" id="pestana-${c}" aria-controls="panel-${c}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${n} <span class="pestana__num">${servicios.filter((s) => s.categoria === c).length}</span></button>`).join('\n');
const paneles = cats.map(([c], i) => `<div class="panel-servicios${i === 0 ? ' activo' : ''}" role="tabpanel" id="panel-${c}" aria-labelledby="pestana-${c}" tabindex="0">
  <ul class="servicios__lista">
${sangria(servicios.filter((s) => s.categoria === c).map(tarjeta).join('\n'), 4)}
  </ul>
</div>`).join('\n');

const html = `<div class="pestanas" role="tablist" aria-label="Categorías de servicios">
${sangria(pestanas, 2)}
</div>
<div class="paneles">
${sangria(paneles, 2)}
</div>`;

const ruta = new URL('../sitio/index.html', import.meta.url);
const pagina = fs.readFileSync(ruta, 'utf8');
const ini = '<!-- servicios:inicio (generado por herramientas/generar-servicios.mjs) -->';
const fin = '<!-- servicios:fin -->';
const a = pagina.indexOf(ini), b = pagina.indexOf(fin);
if (a < 0 || b < 0) throw new Error('Faltan las marcas de servicios en index.html');
const linea = pagina.lastIndexOf('\n', a) + 1;
const n = a - linea;
fs.writeFileSync(ruta, pagina.slice(0, a + ini.length) + '\n' + sangria(html, n) + '\n' + ' '.repeat(n) + pagina.slice(b));
console.log(`Servicios generados: ${servicios.length}`);
