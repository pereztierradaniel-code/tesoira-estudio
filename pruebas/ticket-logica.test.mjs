// Pruebas del ticket de la Carmiña: node --test "pruebas/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatoDuracion, formatoPrecio, alternar, resumenTicket } from '../sitio/js/ticket-logica.js';
import { servicios } from '../sitio/js/datos.js';

test('duración en minutos y horas', () => {
  assert.equal(formatoDuracion(20), '20 min');
  assert.equal(formatoDuracion(60), '1 h');
  assert.equal(formatoDuracion(75), '1 h 15 min');
  assert.equal(formatoDuracion(150), '2 h 30 min');
  assert.equal(formatoDuracion(0), '0 min');
});

test('precio con coma decimal solo si hace falta', () => {
  assert.equal(formatoPrecio(28), '28 €');
  assert.equal(formatoPrecio(12.5), '12,50 €');
});

test('alternar añade, quita y respeta el orden de la carta', () => {
  let t = alternar([], 'afeitado', servicios);
  t = alternar(t, 'corte-hombre', servicios);
  assert.deepEqual(t, ['corte-hombre', 'afeitado']);
  assert.deepEqual(alternar(t, 'afeitado', servicios), ['corte-hombre']);
});

test('alternar ignora ids que no están en la carta', () => {
  assert.deepEqual(alternar([], 'inventado', servicios), []);
});

test('resumen: degradado + afeitado = 33 € y 1 h 10 min', () => {
  const r = resumenTicket(['degradado', 'afeitado'], servicios);
  assert.equal(r.lineas.length, 2);
  assert.equal(r.textoPrecio, '33 €');
  assert.equal(r.textoDuracion, '1 h 10 min');
  assert.equal(r.vacio, false);
});

test('resumen vacío', () => {
  const r = resumenTicket([], servicios);
  assert.equal(r.vacio, true);
  assert.equal(r.textoPrecio, '0 €');
});
