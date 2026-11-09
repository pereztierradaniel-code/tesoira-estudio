// Lógica pura del ticket de la Carmiña (detalle de servicios). Probada en pruebas/ticket-logica.test.mjs.
import { totales } from './reservas-logica.js';

// "45 min", "1 h", "1 h 15 min", "2 h 30 min".
export function formatoDuracion(min) {
  const m = Math.max(0, Math.round(Number(min) || 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r} min`;
  return r ? `${h} h ${r} min` : `${h} h`;
}

// "28 €", "12,50 €".
export function formatoPrecio(euros) {
  const n = Number(euros) || 0;
  return `${Number.isInteger(n) ? n : n.toFixed(2).replace('.', ',')} €`;
}

// Añade o quita un servicio. Devuelve una lista nueva de ids, en el orden de la carta.
export function alternar(ids, id, catalogo) {
  const conjunto = new Set(ids);
  if (conjunto.has(id)) conjunto.delete(id); else if (catalogo.some((s) => s.id === id)) conjunto.add(id);
  return catalogo.filter((s) => conjunto.has(s.id)).map((s) => s.id);
}

// Líneas y totales listos para pintar.
export function resumenTicket(ids, catalogo) {
  const lineas = catalogo.filter((s) => ids.includes(s.id));
  const t = totales(lineas);
  return {
    lineas,
    precio: t.precio,
    duracion: t.duracion,
    textoPrecio: formatoPrecio(t.precio),
    textoDuracion: formatoDuracion(t.duracion),
    vacio: lineas.length === 0,
  };
}
