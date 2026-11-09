// Festivos de Tesoira por regla (ficha, sección 3: «festivos nacionales y la segunda quincena de agosto»).
// Así no caducan: se generan para el año en curso y los dos siguientes. Probado en pruebas/festivos.test.mjs.
// Nota: solo festivos nacionales comunes; los autonómicos y locales de Galicia/Pontevedra irían aparte si el negocio cierra.

const dos = (n) => String(n).padStart(2, '0');
const FIJOS = ['01-01', '01-06', '05-01', '08-15', '10-12', '11-01', '12-06', '12-08', '12-25'];

// Domingo de Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano).
function pascua(anio) {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia };
}

export function viernesSanto(anio) {
  const { mes, dia } = pascua(anio);
  const f = new Date(Date.UTC(anio, mes - 1, dia - 2));
  return `${f.getUTCFullYear()}-${dos(f.getUTCMonth() + 1)}-${dos(f.getUTCDate())}`;
}

export function festivosDe(anio) {
  const agosto = Array.from({ length: 16 }, (_, i) => `${anio}-08-${dos(16 + i)}`);
  return [...FIJOS.map((md) => `${anio}-${md}`), viernesSanto(anio), ...agosto];
}

export function festivosDesde(anio, anios = 3) {
  return Array.from({ length: anios }, (_, i) => festivosDe(anio + i)).flat();
}
