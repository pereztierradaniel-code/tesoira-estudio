// Pruebas de la lógica de reservas. Ejecutar desde la raíz del proyecto (o de la skill):
//   node --test <ruta>/reservas-logica.test.mjs
// Fija la zona horaria de España para que las pruebas de medianoche sean reales.
process.env.TZ = 'Europe/Madrid';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Busca reservas-logica.js en sitio/js (proyecto) o en assets/js (skill).
const candidatos = [
  path.resolve('sitio/js/reservas-logica.js'),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../js/reservas-logica.js'),
];
const ruta = candidatos.find((c) => existsSync(c));
if (!ruta) throw new Error('No encuentro reservas-logica.js');
const L = await import(pathToFileURL(ruta).href);

const horario = {
  0: [],
  1: [['10:00', '14:00'], ['16:00', '20:00']],
  2: [['10:00', '14:00'], ['16:00', '20:00']],
  3: [['10:00', '14:00'], ['16:00', '20:00']],
  4: [['10:00', '14:00'], ['16:00', '20:00']],
  5: [['10:00', '14:00'], ['16:00', '20:00']],
  6: [['09:00', '14:00']],
};
// 2026-11-09 es lunes; 2026-11-14 sábado; 2026-11-15 domingo.
const d = (y, m, dia, h = 0, min = 0) => new Date(y, m - 1, dia, h, min);

test('la zona horaria de la prueba es la de España', () => {
  assert.equal(d(2026, 11, 9, 12).getTimezoneOffset(), -60);
});

test('fechaLocal no cambia de día pasada la medianoche (toISOString sí lo haría)', () => {
  const madrugada = d(2026, 11, 10, 0, 30);
  assert.equal(L.fechaLocal(madrugada), '2026-11-10');
  assert.equal(madrugada.toISOString().slice(0, 10), '2026-11-09');
});

test('a las 00:10 del lunes se puede reservar ese mismo lunes desde la apertura', () => {
  const h = L.huecos({ horario, fecha: d(2026, 11, 9), duracion: 30, ahora: d(2026, 11, 9, 0, 10) });
  assert.equal(h[0], '10:00');
  assert.equal(h.at(-1), '19:30');
});

test('a las 23:50 ya no quedan horas hoy, pero mañana sí', () => {
  const ahora = d(2026, 11, 9, 23, 50);
  assert.deepEqual(L.huecos({ horario, fecha: d(2026, 11, 9), duracion: 30, ahora }), []);
  assert.equal(L.huecos({ horario, fecha: d(2026, 11, 10), duracion: 30, ahora })[0], '10:00');
});

test('durante el día solo aparecen horas posteriores a ahora', () => {
  const h = L.huecos({ horario, fecha: d(2026, 11, 9), duracion: 30, ahora: d(2026, 11, 9, 11, 0) });
  assert.equal(h[0], '11:30');
  const conMargen = L.huecos({ horario, fecha: d(2026, 11, 9), duracion: 30, ahora: d(2026, 11, 9, 11, 0), margen: 60 });
  assert.equal(conMargen[0], '12:30');
});

test('un servicio largo no se sale del cierre ni de la pausa del mediodía', () => {
  const h = L.huecos({ horario, fecha: d(2026, 11, 10), duracion: 60, ahora: d(2026, 11, 9, 20) });
  assert.ok(h.includes('13:00'));
  assert.ok(!h.includes('13:30'));
  assert.ok(h.includes('19:00'));
  assert.ok(!h.includes('19:30'));
});

test('las horas ocupadas bloquean también los inicios que se solaparían', () => {
  const h = L.huecos({ horario, fecha: d(2026, 11, 10), duracion: 60, ahora: d(2026, 11, 9, 20), ocupadas: ['10:30'] });
  assert.ok(!h.includes('10:00'));
  assert.ok(!h.includes('10:30'));
  assert.ok(h.includes('11:00'));
});

test('los días pasados, los domingos cerrados y los festivos no tienen horas', () => {
  const ahora = d(2026, 11, 10, 9);
  assert.deepEqual(L.huecos({ horario, fecha: d(2026, 11, 9), duracion: 30, ahora }), []);
  assert.deepEqual(L.huecos({ horario, fecha: d(2026, 11, 15), duracion: 30, ahora }), []);
  assert.deepEqual(L.huecos({ horario, festivos: ['2026-11-11'], fecha: d(2026, 11, 11), duracion: 30, ahora }), []);
});

test('el sábado a medianoche: hoy no, domingo no, lunes sí', () => {
  const dias = L.diasDisponibles({ horario, ahora: d(2026, 11, 14, 23, 59), duracion: 30 });
  assert.deepEqual(dias.slice(0, 3), [
    { fecha: '2026-11-14', disponible: false },
    { fecha: '2026-11-15', disponible: false },
    { fecha: '2026-11-16', disponible: true },
  ]);
  assert.equal(dias.length, 28);
});

test('el cambio de hora de octubre no repite ni salta días', () => {
  const dias = L.diasDisponibles({ horario, ahora: d(2026, 10, 20, 12), duracion: 30, semanas: 2 }).map((x) => x.fecha);
  assert.equal(new Set(dias).size, 14);
  assert.ok(dias.includes('2026-10-25') && dias.includes('2026-10-26'));
  const marzo = L.diasDisponibles({ horario, ahora: d(2027, 3, 25, 12), duracion: 30, semanas: 1 }).map((x) => x.fecha);
  assert.deepEqual(marzo, ['2027-03-25', '2027-03-26', '2027-03-27', '2027-03-28', '2027-03-29', '2027-03-30', '2027-03-31']);
});

test('teléfono del cliente', () => {
  for (const ok of ['612 345 678', '612-34-56-78', '+34 612 345 678', '+31 6 12345678', '0034612345678']) assert.ok(L.telefonoValido(ok), ok);
  for (const mal of ['', '12345', '512345678', 'hola', '+34']) assert.ok(!L.telefonoValido(mal), mal);
});

test('número del negocio para wa.me', () => {
  assert.equal(L.numeroWhatsApp('612 345 678'), '34612345678');
  assert.equal(L.numeroWhatsApp('+34 612 345 678'), '34612345678');
  assert.equal(L.numeroWhatsApp('0031612345678'), '31612345678');
  assert.throws(() => L.numeroWhatsApp('123'));
  assert.throws(() => L.numeroWhatsApp('abc612345678'));
  assert.throws(() => L.numeroWhatsApp('+34 612345678 ext 2'));
  assert.throws(() => L.numeroWhatsApp(''));
});

test('fechas imposibles se rechazan en vez de cambiar de día', () => {
  assert.equal(L.fechaLocal(L.fechaDesdeTexto('2026-11-10')), '2026-11-10');
  for (const mal of ['2026-02-30', '2026-13-01', '2026-11-1', 'mañana']) assert.throws(() => L.fechaDesdeTexto(mal), mal);
});

test('mensaje y enlace de WhatsApp con todos los datos y bien codificado', () => {
  const reserva = {
    servicios: [{ nombre: 'Corte & degradado', precio: 15, duracion: 30 }, { nombre: 'Barba', precio: 8.5, duracion: 15 }],
    profesional: 'Yahya',
    fecha: '2026-11-10',
    hora: '10:30',
    nombre: 'Ana <b>López</b>',
    telefono: '600 111 222',
    comentario: '¿Puede ser rápido? #prisa',
  };
  const texto = L.mensajeWhatsApp(reserva, 'Y&Y Barbers');
  assert.match(texto, /Corte & degradado \+ Barba \(45 min, 23,5\s€\)/);
  assert.match(texto, /martes, 10 de noviembre/);
  assert.match(texto, /Hora: 10:30/);
  const url = L.urlWhatsApp('612345678', texto);
  assert.ok(url.startsWith('https://wa.me/34612345678?text='));
  assert.ok(!/[ &#<>\n]/.test(url.split('?text=')[1]), 'el texto va codificado');
  assert.equal(decodeURIComponent(url.split('?text=')[1]), texto);
});

test('sin profesional ni comentario, esas líneas no aparecen', () => {
  const texto = L.mensajeWhatsApp({ servicios: [{ nombre: 'Corte', precio: 12, duracion: 30 }], fecha: '2026-11-10', hora: '17:00', nombre: 'Luis', telefono: '600111222' }, 'Barbería');
  assert.ok(!texto.includes('Profesional'));
  assert.ok(!texto.includes('Comentario'));
});
