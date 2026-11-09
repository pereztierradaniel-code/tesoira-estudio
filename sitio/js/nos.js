// Parte 6: tarjetas del equipo que se abren en guía y «Reservar con…» (la reserva de la parte 8 escucha el evento).
import { tarjetasEnGuia } from './tarjetas.js';

tarjetasEnGuia([...document.querySelectorAll('.persona__cabeza')], '.persona');

document.querySelectorAll('[data-reservar-con]').forEach((a) => a.addEventListener('click', () => {
  document.dispatchEvent(new CustomEvent('tesoira:reservar', { detail: { servicios: [], profesional: a.dataset.reservarCon } }));
}));
