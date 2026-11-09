// Festivos generados por regla (hallazgo de Codex: la lista fija acababa en 2027).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { viernesSanto, festivosDe, festivosDesde } from '../sitio/js/festivos.js';

test('Viernes Santo (dos días antes de la Pascua)', () => {
  assert.equal(viernesSanto(2026), '2026-04-03');
  assert.equal(viernesSanto(2027), '2027-03-26');
  assert.equal(viernesSanto(2028), '2028-04-14');
  assert.equal(viernesSanto(2030), '2030-04-19');
});

test('festivos nacionales fijos y vacaciones de agosto de un año', () => {
  const f = festivosDe(2028);
  for (const d of ['2028-01-01', '2028-01-06', '2028-05-01', '2028-08-15', '2028-10-12', '2028-11-01', '2028-12-06', '2028-12-08', '2028-12-25', '2028-04-14']) {
    assert.ok(f.includes(d), d);
  }
  assert.ok(f.includes('2028-08-16') && f.includes('2028-08-31'));
  assert.ok(!f.includes('2028-08-01'));
});

test('desde un año cubre ese año y los dos siguientes', () => {
  const f = festivosDesde(2026);
  assert.ok(f.includes('2026-12-25'));
  assert.ok(f.includes('2028-01-06'));
  assert.ok(!f.some((d) => d.startsWith('2029')));
});
