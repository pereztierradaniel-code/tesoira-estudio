// Lógica pura del neón de abierto/cerrado (idea distintiva). Sin HTML: se prueba en pruebas/neon-logica.test.mjs.
// Calcula con la hora de Pontevedra (Europe/Madrid), aunque el visitante esté en otra zona horaria.

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const aMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const aTexto = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

// Día de la semana, fecha "AAAA-MM-DD" y minutos desde las 00:00 en la zona indicada.
export function relojLocal(fecha, zona = 'Europe/Madrid') {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(fecha).map((x) => [x.type, x.value]));
  return {
    dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday),
    hoy: `${p.year}-${p.month}-${p.day}`,
    minutos: Number(p.hour) * 60 + Number(p.minute),
  };
}

function sumarDias(aaaammdd, n) {
  const [a, m, d] = aaaammdd.split('-').map(Number);
  // En UTC a propósito: solo cuenta días de calendario, sin cambios de hora por medio.
  const f = new Date(Date.UTC(a, m - 1, d + n));
  const dos = (x) => String(x).padStart(2, '0');
  return `${f.getUTCFullYear()}-${dos(f.getUTCMonth() + 1)}-${dos(f.getUTCDate())}`;
}

// { abierto, texto, cierra?, abre? } — texto en español, para leerlo siempre (no depende de la animación).
export function estadoNeon({ horario, festivos = [], fecha = new Date(), zona = 'Europe/Madrid' }) {
  const { dia, hoy, minutos } = relojLocal(fecha, zona);
  const tramosDe = (d, f) => (festivos.includes(f) ? [] : (horario[d] || []).map(([a, c]) => [aMin(a), aMin(c)]));

  const tramosHoy = tramosDe(dia, hoy);
  const actual = tramosHoy.find(([a, c]) => minutos >= a && minutos < c);
  if (actual) return { abierto: true, texto: `Abierto hasta las ${aTexto(actual[1])}`, cierra: aTexto(actual[1]) };

  const luego = tramosHoy.find(([a]) => a > minutos);
  if (luego) return { abierto: false, texto: `Cerrado · abrimos hoy a las ${aTexto(luego[0])}`, abre: aTexto(luego[0]) };

  for (let i = 1; i <= 21; i++) {
    const d = (dia + i) % 7;
    const tramos = tramosDe(d, sumarDias(hoy, i));
    if (tramos.length) {
      const cuando = i === 1 ? 'mañana' : i < 7 ? `el ${DIAS[d]}` : `el ${DIAS[d]} ${sumarDias(hoy, i).slice(8).replace(/^0/, '')}`;
      return { abierto: false, texto: `Cerrado · abrimos ${cuando} a las ${aTexto(tramos[0][0])}`, abre: aTexto(tramos[0][0]) };
    }
  }
  return { abierto: false, texto: 'Cerrado por vacaciones' };
}
