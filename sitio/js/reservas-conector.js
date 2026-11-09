// Conector de la reserva: la ÚNICA pieza que cambiará cuando haya backend (skill de reservas, venta aparte).
//
// horasOcupadas(fecha, profesional) -> Promise<string[]>
//   Inicios de bloques de 30 min ya ocupados ese día, como ["10:00", "10:30"]. Hoy: devuelve [].
// prepararEnvio(reserva) -> { modo: "whatsapp" | "demo", url?: string, mensaje: string }
//   reserva = { servicios: [{nombre, precio, duracion}], profesional, fecha: "AAAA-MM-DD", hora, nombre, telefono, comentario }
//   Hoy: si hay WhatsApp en datos.js, devuelve la url de urlWhatsApp(); si no, modo "demo".
//
// Tesoira es un negocio ficticio y su número de WhatsApp es inventado: datos.js lleva whatsapp: null,
// así que siempre se usa el modo "demo" (decisión de Dani, etapa 5).
import { negocio } from './datos.js';
import { mensajeWhatsApp, urlWhatsApp } from './reservas-logica.js';

export async function horasOcupadas(_fecha, _profesional) {
  return [];
}

export function prepararEnvio(reserva) {
  const mensaje = mensajeWhatsApp(reserva, negocio.nombre);
  if (negocio.whatsapp) return { modo: 'whatsapp', url: urlWhatsApp(negocio.whatsapp, mensaje), mensaje };
  return { modo: 'demo', mensaje };
}
