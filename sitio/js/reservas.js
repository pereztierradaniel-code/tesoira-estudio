// Parte 8: interfaz de la reserva en 6 pasos (servicios → profesional → día → hora → datos → resumen).
// La lógica (días, huecos, teléfono, mensaje) está en reservas-logica.js; el envío, en reservas-conector.js.
// Lo que escribe el cliente nunca entra con innerHTML: todo con textContent. No se guarda nada en el navegador.
import { servicios, equipo, horario, festivos, negocio } from './datos.js';
import { diasDisponibles, huecos, telefonoValido, totales, fechaDesdeTexto } from './reservas-logica.js';
import { horasOcupadas, prepararEnvio } from './reservas-conector.js';
import { relojLocal } from './neon-logica.js';
import { formatoDuracion, formatoPrecio } from './ticket-logica.js';
import { ticketActual } from './servicios.js';

const dialogo = document.querySelector('[data-reserva]');
const form = dialogo.querySelector('[data-reserva-form]');
const pasos = [...dialogo.querySelectorAll('[data-paso]')];
const marcas = [...dialogo.querySelectorAll('[data-reserva-pasos] li')];
const barra = dialogo.querySelector('[data-reserva-barra]');
const total = dialogo.querySelector('[data-reserva-total]');
const btnAtras = dialogo.querySelector('[data-reserva-atras]');
const btnSeguir = dialogo.querySelector('[data-reserva-seguir]');
const btnWhatsApp = dialogo.querySelector('[data-reserva-whatsapp]');
const MARGEN = 30; // solo se ofrecen horas que empiezan dentro de MÁS de 30 min (a las 11:00, la primera que sale es la de las 12:00)
const SIN_PREFERENCIA = 'Sin preferencia';

const estado = { servicios: [], profesional: SIN_PREFERENCIA, fecha: null, hora: null, paso: 1 };
let origen = null;

const el = (etiqueta, clase, texto) => {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto !== undefined) e.textContent = texto;
  return e;
};
const elegidos = () => servicios.filter((s) => estado.servicios.includes(s.id));
const duracionTotal = () => totales(elegidos()).duracion;

// Hora de Pontevedra como Date local (la lógica trabaja con hora local). ?hora=… solo para probar.
function ahora() {
  const prueba = new URLSearchParams(location.search).get('hora');
  const r = relojLocal(prueba ? new Date(prueba) : new Date(), negocio.zonaHoraria);
  const [y, m, d] = r.hoy.split('-').map(Number);
  return new Date(y, m - 1, d, Math.floor(r.minutos / 60), r.minutos % 60);
}

const fmtDiaLargo = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtMes = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
const fmtMesCorto = new Intl.DateTimeFormat('es-ES', { month: 'short' });

/* ---------- Paso 1: servicios ---------- */
function pintarServicios() {
  const caja = dialogo.querySelector('[data-paso-servicios]');
  caja.replaceChildren();
  for (const [cat, nombre] of [['pelo', 'Pelo'], ['barba', 'Barba'], ['extras', 'Extras']]) {
    const grupo = el('fieldset', 'grupo-servicios');
    grupo.append(el('legend', 'grupo-servicios__titulo', nombre));
    for (const s of servicios.filter((x) => x.categoria === cat)) {
      const id = `r-s-${s.id}`;
      const fila = el('div', 'opcion-servicio');
      const input = el('input');
      Object.assign(input, { type: 'checkbox', id, value: s.id, checked: estado.servicios.includes(s.id) });
      input.addEventListener('change', () => {
        estado.servicios = servicios.filter((x) => (x.id === s.id ? input.checked : estado.servicios.includes(x.id))).map((x) => x.id);
        estado.fecha = null; estado.hora = null; // la duración cambia: hay que volver a elegir día y hora
        actualizarPie();
      });
      const label = el('label');
      label.htmlFor = id;
      label.append(el('span', 'opcion-servicio__nombre', s.nombre), el('span', 'opcion-servicio__datos', `${formatoDuracion(s.duracion)} · ${formatoPrecio(s.precio)}`));
      fila.append(input, label);
      grupo.append(fila);
    }
    caja.append(grupo);
  }
}

/* ---------- Paso 2: profesional ---------- */
function pintarProfesionales() {
  const caja = dialogo.querySelector('[data-paso-profesional]');
  caja.querySelectorAll('.opcion').forEach((o) => o.remove());
  const opciones = [{ nombre: SIN_PREFERENCIA, especialidad: 'Quien tenga hueco' }, ...equipo];
  opciones.forEach((p, i) => {
    const id = `r-p-${i}`;
    const fila = el('div', 'opcion');
    const input = el('input');
    Object.assign(input, { type: 'radio', name: 'profesional', id, value: p.nombre, checked: estado.profesional === p.nombre });
    input.addEventListener('change', () => { estado.profesional = p.nombre; actualizarPie(); });
    const label = el('label');
    label.htmlFor = id;
    label.append(el('span', 'opcion__nombre', p.nombre), el('span', 'opcion__datos', p.especialidad));
    fila.append(input, label);
    caja.append(fila);
  });
}

/* ---------- Paso 3: día ---------- */
function pintarCalendario() {
  const caja = dialogo.querySelector('[data-paso-calendario]');
  dialogo.querySelector('[data-texto-duracion]').textContent = formatoDuracion(duracionTotal());
  const dias = diasDisponibles({ horario, festivos, ahora: ahora(), duracion: duracionTotal(), semanas: 4, margen: MARGEN });
  const primero = fechaDesdeTexto(dias[0].fecha);
  const ultimo = fechaDesdeTexto(dias.at(-1).fecha);
  const titulo = fmtMes.format(primero) === fmtMes.format(ultimo) ? fmtMes.format(primero) : `${fmtMes.format(primero).replace(/ de \d+$/, '')} – ${fmtMes.format(ultimo)}`;

  const rejilla = el('div', 'calendario__rejilla');
  rejilla.setAttribute('role', 'group');
  rejilla.setAttribute('aria-label', `Días de ${titulo}`);
  ['L', 'M', 'X', 'J', 'V', 'S', 'D'].forEach((d) => { const c = el('span', 'calendario__semana', d); c.setAttribute('aria-hidden', 'true'); rejilla.append(c); });
  const hueco = (primero.getDay() + 6) % 7; // semana empieza en lunes
  for (let i = 0; i < hueco; i++) rejilla.append(el('span', 'calendario__vacio'));
  dias.forEach(({ fecha, disponible }, i) => {
    const f = fechaDesdeTexto(fecha);
    const b = el('button', 'calendario__dia');
    b.type = 'button';
    b.disabled = !disponible;
    b.setAttribute('aria-pressed', String(estado.fecha === fecha));
    b.setAttribute('aria-label', `${fmtDiaLargo.format(f)}${disponible ? '' : ', sin horas libres'}`);
    b.append(el('span', 'calendario__num', String(f.getDate())));
    if (i === 0 || f.getDate() === 1) b.append(el('span', 'calendario__mes', fmtMesCorto.format(f).replace('.', '')));
    if (i === 0) b.classList.add('es-hoy');
    b.addEventListener('click', () => {
      estado.fecha = fecha; estado.hora = null;
      rejilla.querySelectorAll('.calendario__dia').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      actualizarPie();
    });
    rejilla.append(b);
  });
  caja.replaceChildren(el('p', 'calendario__titulo', titulo), rejilla);
}

/* ---------- Paso 4: hora ---------- */
async function pintarHoras() {
  const caja = dialogo.querySelector('[data-paso-horas]');
  const f = fechaDesdeTexto(estado.fecha);
  dialogo.querySelector('[data-texto-dia]').textContent = `${fmtDiaLargo.format(f)} · ${formatoDuracion(duracionTotal())}`;
  caja.replaceChildren(el('p', 'paso__ayuda', 'Buscando horas libres…'));
  const ocupadas = await horasOcupadas(estado.fecha, estado.profesional === SIN_PREFERENCIA ? null : estado.profesional);
  const lista = huecos({ horario, festivos, fecha: f, duracion: duracionTotal(), ahora: ahora(), ocupadas, margen: MARGEN });
  caja.replaceChildren();
  if (!lista.length) { caja.append(el('p', 'paso__ayuda', 'Ese día ya no quedan horas. Vuelva atrás y elija otro.')); return; }
  for (const [nombre, filtro] of [['Mañana', (h) => h < '14:00'], ['Tarde', (h) => h >= '14:00']]) {
    const horas = lista.filter(filtro);
    if (!horas.length) continue;
    const grupo = el('div', 'horas__grupo');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', nombre);
    grupo.append(el('p', 'horas__titulo', nombre));
    const fila = el('div', 'horas__lista');
    horas.forEach((h) => {
      const b = el('button', 'hora', h.replace(/^0/, ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(estado.hora === h));
      b.addEventListener('click', () => {
        estado.hora = h;
        caja.querySelectorAll('.hora').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        actualizarPie();
      });
      fila.append(b);
    });
    grupo.append(fila);
    caja.append(grupo);
  }
}

/* ---------- Paso 5: datos ---------- */
const campos = { nombre: form.elements.nombre, telefono: form.elements.telefono, comentario: form.elements.comentario, privacidad: form.elements.privacidad };
function erroresDatos() {
  const e = {};
  if (campos.nombre.value.trim().length < 2) e.nombre = 'Escriba su nombre.';
  if (!campos.telefono.value.trim()) e.telefono = 'Escriba su teléfono.';
  else if (!telefonoValido(campos.telefono.value)) e.telefono = 'Revise el teléfono: 9 cifras, o con prefijo internacional (+…).';
  if (!campos.privacidad.checked) e.privacidad = 'Marque la casilla para poder enviar la solicitud.';
  return e;
}
function mostrarErrores(e) {
  for (const k of ['nombre', 'telefono', 'privacidad']) {
    dialogo.querySelector(`[data-error="${k}"]`).textContent = e[k] || '';
    campos[k].setAttribute('aria-invalid', String(Boolean(e[k])));
  }
  const primero = ['nombre', 'telefono', 'privacidad'].find((k) => e[k]);
  if (primero) campos[primero].focus();
}
let intentado = false;
form.addEventListener('input', () => { if (intentado) { const e = erroresDatos(); for (const k of ['nombre', 'telefono', 'privacidad']) { dialogo.querySelector(`[data-error="${k}"]`).textContent = e[k] || ''; campos[k].setAttribute('aria-invalid', String(Boolean(e[k]))); } } });
form.addEventListener('submit', (e) => { e.preventDefault(); seguir(); });

/* ---------- Paso 6: resumen y envío ---------- */
function reserva() {
  return {
    servicios: elegidos().map(({ nombre, precio, duracion }) => ({ nombre, precio, duracion })),
    profesional: estado.profesional === SIN_PREFERENCIA ? '' : estado.profesional,
    fecha: estado.fecha,
    hora: estado.hora,
    nombre: campos.nombre.value.trim(),
    telefono: campos.telefono.value.trim(),
    comentario: campos.comentario.value.trim(),
  };
}
function pintarResumen() {
  const r = reserva();
  const t = totales(r.servicios);
  const filas = [
    ['Servicios', r.servicios.map((s) => s.nombre).join(' + ')],
    ['Tiempo y precio', `${formatoDuracion(t.duracion)} · ${formatoPrecio(t.precio)}`],
    ['Profesional', r.profesional || SIN_PREFERENCIA],
    ['Día', fmtDiaLargo.format(fechaDesdeTexto(r.fecha))],
    ['Hora', r.hora.replace(/^0/, '')],
    ['Nombre', r.nombre],
    ['Teléfono', r.telefono],
  ];
  if (r.comentario) filas.push(['Comentario', r.comentario]);
  const dl = dialogo.querySelector('[data-paso-resumen]');
  dl.replaceChildren(...filas.flatMap(([k, v]) => [el('dt', '', k), el('dd', '', v)]));

  const envio = prepararEnvio(r);
  const demo = dialogo.querySelector('[data-reserva-demo]');
  if (envio.modo === 'whatsapp') {
    btnWhatsApp.href = envio.url;
    demo.hidden = true;
  } else {
    dialogo.querySelector('[data-reserva-mensaje]').textContent = envio.mensaje;
    demo.hidden = false;
  }
  return envio;
}

/* ---------- Navegación entre pasos ---------- */
const valido = { 1: () => estado.servicios.length > 0, 2: () => true, 3: () => Boolean(estado.fecha), 4: () => Boolean(estado.hora), 5: () => true, 6: () => true };

function actualizarPie() {
  const n = estado.servicios.length;
  const t = totales(elegidos());
  total.textContent = n ? `${n} ${n === 1 ? 'servicio' : 'servicios'} · ${formatoPrecio(t.precio)} · ${formatoDuracion(t.duracion)}` : 'Elija al menos un servicio';
  const p = estado.paso;
  btnAtras.hidden = p === 1;
  btnSeguir.disabled = !valido[p]();
  btnSeguir.setAttribute('aria-disabled', String(btnSeguir.disabled));
}

async function irA(p) {
  estado.paso = p;
  pasos.forEach((s) => { s.hidden = Number(s.dataset.paso) !== p; });
  marcas.forEach((m, i) => { if (i + 1 === p) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current'); m.classList.toggle('hecho', i + 1 < p); });
  barra.style.transform = `scaleX(${p / 6})`;
  // En el móvil la fila de pasos no cabe: se desplaza para que se vea el paso actual.
  const lista = marcas[0].parentElement;
  lista.scrollTo({ left: Math.max(0, marcas[p - 1].offsetLeft - lista.offsetLeft - 24), behavior: 'auto' });
  if (p === 3) pintarCalendario();
  if (p === 4) await pintarHoras();
  let envio = null;
  if (p === 6) envio = pintarResumen();
  btnSeguir.hidden = p === 6 && envio?.modo === 'whatsapp';
  btnWhatsApp.hidden = !(p === 6 && envio?.modo === 'whatsapp');
  btnSeguir.textContent = p === 5 ? 'Revisar' : p === 6 ? 'Terminar' : 'Continuar';
  actualizarPie();
  dialogo.querySelector(`#paso${p}-titulo`).focus();
  form.scrollTop = 0;
}

function seguir() {
  const p = estado.paso;
  if (p === 5) {
    intentado = true;
    const e = erroresDatos();
    mostrarErrores(e);
    if (Object.keys(e).length) return;
  }
  if (p === 6) { cerrar(true); return; }
  if (valido[p]()) irA(p + 1);
}
// «Continuar» es el botón de envío del formulario (también responde a Enter): lo gestiona el submit.
btnAtras.addEventListener('click', () => { if (estado.paso > 1) irA(estado.paso - 1); });

/* ---------- Abrir y cerrar ---------- */
function abrir({ servicios: ids = [], profesional } = {}) {
  if (dialogo.open) return;
  origen = document.activeElement;
  estado.servicios = ids.length ? servicios.filter((s) => ids.includes(s.id)).map((s) => s.id) : ticketActual();
  estado.profesional = profesional && equipo.some((p) => p.nombre === profesional) ? profesional : SIN_PREFERENCIA;
  estado.fecha = null; estado.hora = null;
  pintarServicios();
  pintarProfesionales();
  dialogo.showModal();
  document.body.classList.add('sin-scroll');
  irA(1);
}
function cerrar(terminado = false) {
  if (terminado) { form.reset(); intentado = false; mostrarErrores({}); }
  dialogo.close();
}
dialogo.addEventListener('close', () => { document.body.classList.remove('sin-scroll'); origen?.focus?.(); });
dialogo.querySelector('[data-reserva-cerrar]').addEventListener('click', () => cerrar());

// Desde servicios, ticket o equipo (llevan servicios o profesional elegidos).
document.addEventListener('tesoira:reservar', (e) => abrir(e.detail));
// Cualquier otro «Reservar cita» de la página: abre con lo que haya en el ticket.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="#reservar"]');
  if (!a) return;
  e.preventDefault();
  if (a.getAttribute('aria-disabled') === 'true') return;
  abrir();
});


// Señal de que la reserva ya escucha los botones (la usan las pruebas de pruebas-e2e/).
document.documentElement.dataset.reservaLista = 'si';
