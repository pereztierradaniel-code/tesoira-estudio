// Parte 7: mapa de Google que solo se carga al pulsar (sin cookies ni datos a Google antes) y el día de hoy marcado.
import { relojLocal } from './neon-logica.js';
import { negocio } from './datos.js';

/* ---------- Mapa al pulsar ---------- */
// Praza da Ferrería (Pontevedra): la dirección de la ficha es inventada (decisión de Dani, etapa 6).
const URL_MAPA = 'https://www.google.com/maps?q=Praza%20da%20Ferrer%C3%ADa%2C%20Pontevedra&z=16&output=embed';
const mapa = document.querySelector('[data-mapa]');
const boton = document.querySelector('[data-mapa-boton]');
boton?.addEventListener('click', () => {
  const iframe = document.createElement('iframe');
  iframe.src = URL_MAPA;
  iframe.title = 'Mapa de Google con la Praza da Ferrería, Pontevedra';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.className = 'mapa__iframe';
  mapa.replaceChildren(iframe);
  mapa.classList.add('cargado');
  iframe.focus();
});

/* ---------- Hoy en el horario ---------- */
const prueba = new URLSearchParams(location.search).get('hora');
const { dia } = relojLocal(prueba ? new Date(prueba) : new Date(), negocio.zonaHoraria);
const fila = document.querySelector(`.horario tr[data-dia="${dia}"]`);
if (fila) {
  fila.classList.add('hoy');
  const marca = document.createElement('span');
  marca.className = 'horario__hoy';
  marca.textContent = 'Hoy';
  fila.querySelector('th').append(' ', marca);
}
