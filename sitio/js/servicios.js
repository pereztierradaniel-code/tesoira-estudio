// Parte 3: pestañas de servicios (crossfade, teclado), tarjetas que se abren en guía y ticket de la Carmiña.
// El ticket se guarda solo en memoria; la reserva (parte 8) lo recibe con el evento «tesoira:reservar».
import { servicios } from './datos.js';
import { alternar, resumenTicket, formatoDuracion, formatoPrecio } from './ticket-logica.js';
import { tarjetasEnGuia } from './tarjetas.js';

/* ---------- Pestañas ---------- */
const pestanas = [...document.querySelectorAll('.servizos [role="tab"]')];
function activar(p, enfocar = false) {
  pestanas.forEach((x) => {
    const si = x === p;
    x.setAttribute('aria-selected', String(si));
    x.tabIndex = si ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).classList.toggle('activo', si);
  });
  if (enfocar) p.focus();
}
pestanas.forEach((p, i) => {
  p.addEventListener('click', () => activar(p));
  p.addEventListener('keydown', (e) => {
    const n = pestanas.length;
    const destino = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (destino !== undefined) { e.preventDefault(); activar(pestanas[destino], true); }
  });
});

/* ---------- Tarjetas que se abren en guía ---------- */
tarjetasEnGuia([...document.querySelectorAll('.servicio__cabeza')], '.servicio');

/* ---------- Ticket de la Carmiña ---------- */
let ticket = [];
const lista = document.querySelector('[data-ticket-lineas]');
const vacio = document.querySelector('[data-ticket-vacio]');
const tiempo = document.querySelector('[data-ticket-tiempo]');
const total = document.querySelector('[data-ticket-total]');
const anuncio = document.querySelector('[data-ticket-anuncio]');
const reservar = document.querySelector('[data-ticket-reservar]');
const flotante = document.querySelector('[data-ticket-flotante]');
const flotanteTexto = document.querySelector('[data-ticket-flotante-texto]');

const fecha = document.querySelector('[data-ticket-fecha]');
if (fecha) {
  fecha.textContent = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

function pintarTicket(nuevoId) {
  const r = resumenTicket(ticket, servicios);
  lista.replaceChildren(...r.lineas.map((s) => {
    const li = document.createElement('li');
    if (s.id === nuevoId) li.className = 'nueva';
    const nombre = document.createElement('span');
    nombre.textContent = s.nombre;
    const min = document.createElement('span');
    min.className = 'ticket__min';
    min.textContent = formatoDuracion(s.duracion);
    const precio = document.createElement('span');
    precio.className = 'ticket__precio';
    precio.textContent = formatoPrecio(s.precio);
    li.append(nombre, min, precio);
    return li;
  }));
  vacio.hidden = !r.vacio;
  tiempo.textContent = r.textoDuracion;
  total.textContent = r.textoPrecio;
  reservar.setAttribute('aria-disabled', String(r.vacio));
  document.querySelectorAll('[data-ticket]').forEach((b) => {
    const dentro = ticket.includes(b.dataset.ticket);
    b.setAttribute('aria-pressed', String(dentro));
    if (b.classList.contains('btn-ticket')) b.textContent = dentro ? 'Quitar del ticket' : 'Añadir al ticket';
  });
  const n = r.lineas.length;
  flotanteTexto.textContent = `${n} ${n === 1 ? 'servicio' : 'servicios'} · ${r.textoPrecio}`;
  actualizarFlotante();
  return r;
}

document.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-ticket]');
  if (!boton) return;
  const id = boton.dataset.ticket;
  const estaba = ticket.includes(id);
  ticket = alternar(ticket, id, servicios);
  const r = pintarTicket(estaba ? null : id);
  const s = servicios.find((x) => x.id === id);
  anuncio.textContent = `${s.nombre} ${estaba ? 'quitado del' : 'añadido al'} ticket. Total ${r.textoPrecio}, ${r.textoDuracion}.`;
});

// Reservar con el ticket, o solo un servicio. La parte 8 escucha este evento y abre el calendario.
function pedirReserva(ids, e) {
  if (!ids.length) { e.preventDefault(); return; }
  document.dispatchEvent(new CustomEvent('tesoira:reservar', { detail: { servicios: ids } }));
}
reservar.addEventListener('click', (e) => pedirReserva(ticket, e));
document.querySelectorAll('[data-reservar]').forEach((a) => a.addEventListener('click', (e) => pedirReserva([a.dataset.reservar], e)));

// Pastilla flotante en el móvil: se ve si hay algo en el ticket y el ticket no está en pantalla.
let ticketVisible = false;
function actualizarFlotante() {
  flotante.hidden = ticket.length === 0 || ticketVisible || matchMedia('(min-width: 960px)').matches;
}
new IntersectionObserver(([e]) => { ticketVisible = e.isIntersecting; actualizarFlotante(); })
  .observe(document.getElementById('ticket'));

pintarTicket();

// La reserva (parte 8) lee el ticket al abrirse desde un botón «Reservar cita» genérico.
export const ticketActual = () => [...ticket];
