// Lógica pura de la reserva (sin HTML): qué días se pueden elegir, qué horas caben y el enlace de WhatsApp.
// Se copia tal cual a sitio/js/ de cada web. Probada en assets/pruebas/reservas-logica.test.mjs.
//
// Formatos:
//   horario  = { 0: [], 1: [["10:00","14:00"], ["16:00","20:00"]], ..., 6: [["09:00","14:00"]] }  (clave = getDay(): 0 domingo)
//   festivos = ["2026-12-25", ...]  (días cerrados, en fecha local)
//   ocupadas = ["10:00", "10:30"]   (inicios de bloques de `paso` minutos ya ocupados)
//
// Todas las fechas se manejan en hora local del navegador. Nunca uses toISOString() para sacar el día:
// devuelve la fecha en UTC y entre las 00:00 y la 01:00 (o las 02:00 en verano) daría el día anterior.

export function fechaLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// "AAAA-MM-DD" -> Date local. Rechaza fechas imposibles (2026-02-30) en vez de dejar que Date las mueva de día.
export function fechaDesdeTexto(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto));
  if (!m) throw new Error(`Fecha no válida: ${texto}`);
  const fecha = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (fechaLocal(fecha) !== texto) throw new Error(`Fecha no válida: ${texto}`);
  return fecha;
}

export function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function aHora(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

function tramosDelDia(horario, fecha, festivos) {
  if (festivos.includes(fechaLocal(fecha))) return [];
  return horario[fecha.getDay()] || [];
}

// Horas de inicio posibles para `fecha` (Date) con una duración total en minutos.
// Hoy solo cuentan las horas posteriores a `ahora` más `margen` minutos.
export function huecos({ horario, festivos = [], fecha, duracion, ahora, ocupadas = [], paso = 30, margen = 0 }) {
  const dia = fechaLocal(fecha);
  const hoy = fechaLocal(ahora);
  if (dia < hoy) return [];
  const minimo = dia === hoy ? ahora.getHours() * 60 + ahora.getMinutes() + margen : -1;
  const ocupado = new Set(ocupadas);
  const resultado = [];
  for (const [ini, fin] of tramosDelDia(horario, fecha, festivos)) {
    const a = aMinutos(ini);
    const b = aMinutos(fin);
    for (let t = a; t + duracion <= b; t += paso) {
      if (t <= minimo) continue;
      let libre = true;
      for (let u = t; u < t + duracion; u += paso) {
        if (ocupado.has(aHora(u))) { libre = false; break; }
      }
      if (libre) resultado.push(aHora(t));
    }
  }
  return resultado;
}

// Días desde hoy durante `semanas` semanas, con si se pueden elegir (tienen al menos un hueco).
export function diasDisponibles({ horario, festivos = [], ahora, duracion, semanas = 4, paso = 30, margen = 0 }) {
  const dias = [];
  for (let i = 0; i < semanas * 7; i++) {
    // Constructor local: evita saltos de día en los cambios de hora de marzo y octubre.
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
    const disponible = huecos({ horario, festivos, fecha, duracion, ahora, paso, margen }).length > 0;
    dias.push({ fecha: fechaLocal(fecha), disponible });
  }
  return dias;
}

// Teléfono del cliente: acepta espacios, guiones, puntos y paréntesis; 9 cifras españolas o internacional con +.
export function telefonoValido(texto) {
  const limpio = String(texto).replace(/[\s().-]/g, '');
  return /^[6789]\d{8}$/.test(limpio) || /^\+\d{8,15}$/.test(limpio) || /^00\d{8,15}$/.test(limpio);
}

// Número del negocio para wa.me: solo cifras, con prefijo de país. 9 cifras españolas -> se añade 34.
export function numeroWhatsApp(texto) {
  // Solo se admiten cifras, espacios, guiones, puntos, paréntesis y un + inicial: nada de letras ni extensiones.
  if (!/^\+?[\d\s().-]+$/.test(String(texto).trim())) throw new Error(`Número de WhatsApp no válido: ${texto}`);
  let n = String(texto).replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (/^[6789]\d{8}$/.test(n)) n = `34${n}`;
  if (!/^\d{10,15}$/.test(n)) throw new Error(`Número de WhatsApp no válido: ${texto}`);
  return n;
}

const formatoDia = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
const formatoEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function totales(servicios) {
  return {
    precio: servicios.reduce((s, x) => s + Number(x.precio || 0), 0),
    duracion: servicios.reduce((s, x) => s + Number(x.duracion || 0), 0),
  };
}

// Texto del mensaje de WhatsApp (sin codificar).
export function mensajeWhatsApp(reserva, nombreNegocio) {
  const { precio, duracion } = totales(reserva.servicios);
  const lineas = [
    `Hola, ${nombreNegocio}. Quiero solicitar una cita:`,
    `- Servicio: ${reserva.servicios.map((s) => s.nombre).join(' + ')} (${duracion} min, ${formatoEuros.format(precio)})`,
  ];
  if (reserva.profesional) lineas.push(`- Profesional: ${reserva.profesional}`);
  lineas.push(`- Día: ${formatoDia.format(fechaDesdeTexto(reserva.fecha))}`);
  lineas.push(`- Hora: ${reserva.hora}`);
  lineas.push(`- Nombre: ${reserva.nombre}`);
  lineas.push(`- Teléfono: ${reserva.telefono}`);
  if (reserva.comentario) lineas.push(`- Comentario: ${reserva.comentario}`);
  return lineas.join('\n');
}

export function urlWhatsApp(numero, mensaje) {
  return `https://wa.me/${numeroWhatsApp(numero)}?text=${encodeURIComponent(mensaje)}`;
}
