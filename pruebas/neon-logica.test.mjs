// Pruebas del neón: node --test pruebas/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoNeon, relojLocal } from '../sitio/js/neon-logica.js';
import { horario, festivos } from '../sitio/js/datos.js';

// Instantes en UTC; en noviembre Madrid = UTC+1, en agosto UTC+2.
const en = (iso) => new Date(iso);
const estado = (iso) => estadoNeon({ horario, festivos, fecha: en(iso) });

test('jueves por la mañana: abierto hasta las 14:00', () => {
  assert.deepEqual(estado('2026-11-05T10:00:00Z'), { abierto: true, texto: 'Abierto hasta las 14:00', cierra: '14:00' });
});

test('jueves a mediodía: cerrado, abre hoy a las 16:00', () => {
  assert.equal(estado('2026-11-05T14:30:00Z').texto, 'Cerrado · abrimos hoy a las 16:00');
});

test('jueves por la tarde cierra a las 21:00 y a las 21:00 ya está cerrado', () => {
  assert.equal(estado('2026-11-05T19:59:00Z').texto, 'Abierto hasta las 21:00');
  assert.equal(estado('2026-11-05T20:00:00Z').texto, 'Cerrado · abrimos mañana a las 9:30');
});

test('viernes sin cierre a mediodía', () => {
  assert.equal(estado('2026-11-06T13:00:00Z').texto, 'Abierto hasta las 20:00');
});

test('sábado tarde: el siguiente día abierto es el martes', () => {
  assert.equal(estado('2026-11-07T15:00:00Z').texto, 'Cerrado · abrimos el martes a las 9:30');
});

test('lunes: cerrado, abre mañana', () => {
  assert.equal(estado('2026-11-09T10:00:00Z').texto, 'Cerrado · abrimos mañana a las 9:30');
});

test('festivo (8 de diciembre, martes): cerrado y salta al miércoles', () => {
  assert.equal(estado('2026-12-08T10:00:00Z').abierto, false);
  assert.equal(estado('2026-12-08T10:00:00Z').texto, 'Cerrado · abrimos mañana a las 9:30');
});

test('vacaciones de agosto: el siguiente día abierto lleva el número de día', () => {
  assert.equal(estado('2027-08-20T10:00:00Z').texto, 'Cerrado · abrimos el miércoles 1 a las 9:30');
});

test('a las 00:30 de Madrid ya cuenta el día nuevo (no el anterior en UTC)', () => {
  // 2026-11-07 23:30 UTC = domingo 8, 00:30 en Madrid
  const r = relojLocal(en('2026-11-07T23:30:00Z'));
  assert.equal(r.hoy, '2026-11-08');
  assert.equal(r.dia, 0);
});

test('un visitante en otra zona horaria ve la hora de Pontevedra', () => {
  // Las 9:45 en Madrid son las 3:45 en Nueva York: debe salir abierto.
  assert.equal(estado('2026-11-10T08:45:00Z').texto, 'Abierto hasta las 14:00');
});
