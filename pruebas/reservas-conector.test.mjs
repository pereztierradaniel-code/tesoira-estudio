// Pruebas del conector de la reserva: node --test "pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horasOcupadas, prepararEnvio } from '../sitio/js/reservas-conector.js';
import { negocio } from '../sitio/js/datos.js';

const reserva = {
  servicios: [{ nombre: 'Degradado a navaja', precio: 18, duracion: 40 }, { nombre: 'Arreglo de barba', precio: 10, duracion: 20 }],
  profesional: 'Brais Novo', fecha: '2026-11-06', hora: '10:30', nombre: 'Ana <b>Prueba</b>', telefono: '612 345 678', comentario: '',
};

test('sin backend no hay horas ocupadas', async () => {
  assert.deepEqual(await horasOcupadas('2026-11-06', 'Brais Novo'), []);
});

test('el negocio es ficticio: no hay WhatsApp y el envío es de demostración', () => {
  assert.equal(negocio.whatsapp, null);
  const r = prepararEnvio(reserva);
  assert.equal(r.modo, 'demo');
  assert.equal(r.url, undefined);
});

test('el mensaje lleva servicios, total, profesional, día, hora y datos', () => {
  const { mensaje } = prepararEnvio(reserva);
  assert.match(mensaje, /^Hola, Tesoira Estudio de Pelo\. Quiero solicitar una cita:/);
  assert.match(mensaje, /Degradado a navaja \+ Arreglo de barba \(60 min, 28\s€\)/); // Intl pone un espacio duro antes del €
  assert.match(mensaje, /Profesional: Brais Novo/);
  assert.match(mensaje, /Día: viernes, 6 de noviembre/);
  assert.match(mensaje, /Hora: 10:30/);
  assert.doesNotMatch(mensaje, /Comentario/);
});

test('con WhatsApp el enlace va codificado (el texto del cliente no rompe la URL)', async () => {
  const { urlWhatsApp } = await import('../sitio/js/reservas-logica.js');
  const url = urlWhatsApp('612 345 678', 'Hola & <b>adiós</b>\n?');
  assert.ok(url.startsWith('https://wa.me/34612345678?text='));
  assert.ok(!/[<>&\n ]/.test(url.split('?text=')[1]));
});
