// Pinta el neón de abierto/cerrado y los textos de estado. La lógica está en neon-logica.js.
import { estadoNeon } from './neon-logica.js';
import { horario, festivos, negocio } from './datos.js';

// Solo para probar en la vista previa: ?hora=2026-11-05T19:30 (hora local del navegador).
const prueba = new URLSearchParams(location.search).get('hora');

function pintar() {
  const fecha = prueba ? new Date(prueba) : new Date();
  const e = estadoNeon({ horario, festivos, fecha, zona: negocio.zonaHoraria });
  document.querySelectorAll('[data-neon]').forEach((el) => { el.dataset.estado = e.abierto ? 'abierto' : 'cerrado'; });
  document.querySelectorAll('[data-neon-texto]').forEach((el) => { el.textContent = e.texto; });
  document.querySelectorAll('[data-neon-cartel]').forEach((el) => { el.textContent = e.abierto ? 'Aberto' : 'Pechado'; });
}

pintar();
if (!prueba) setInterval(pintar, 30000);
