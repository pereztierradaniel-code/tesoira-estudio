// Datos de la ficha (FICHA-NEGOCIO.md) que usa JavaScript. Única fuente para el neón, el horario y la reserva.
// NEGOCIO FICTICIO: todos los datos son inventados (práctica de la skill web-peluquerIA).

export const negocio = {
  nombre: 'Tesoira Estudio de Pelo',
  direccion: 'Rúa do Muíño 14, bajo · 36002 Pontevedra',
  telefono: '986 000 000',
  // Número inventado: la reserva va en modo demostración y no envía nada (decisión de Dani, etapa 5).
  whatsapp: null,
  zonaHoraria: 'Europe/Madrid',
};

// Clave = getDay(): 0 domingo … 6 sábado.
export const horario = {
  0: [],
  1: [],
  2: [['09:30', '14:00'], ['16:00', '20:00']],
  3: [['09:30', '14:00'], ['16:00', '20:00']],
  4: [['09:30', '14:00'], ['16:00', '21:00']],
  5: [['09:30', '20:00']],
  6: [['09:00', '14:00']],
};

// Festivos nacionales y la segunda quincena de agosto (vacaciones), generados por regla desde el año
// anterior (por si se mira el 1 de enero) hasta dos años después, para que no caduquen.
import { festivosDesde } from './festivos.js';
export const festivos = festivosDesde(new Date().getFullYear() - 1, 4);

export const servicios = [
  { id: 'corte-mujer', categoria: 'pelo', nombre: 'Corte mujer (lavado y secado)', precio: 28, duracion: 45, descripcion: 'Corte a tijera con lavado en los lavacabezas verdes y secado.' },
  { id: 'corte-hombre', categoria: 'pelo', nombre: 'Corte hombre', precio: 16, duracion: 30, descripcion: 'Tijera o máquina, con lavado.' },
  { id: 'degradado', categoria: 'pelo', nombre: 'Degradado a navaja', precio: 18, duracion: 40, descripcion: 'Degradado bajo, medio o alto acabado a navaja.' },
  { id: 'infantil', categoria: 'pelo', nombre: 'Corte infantil (hasta 10 años)', precio: 12, duracion: 20, descripcion: 'Corte sencillo, con paciencia.' },
  { id: 'color-raiz', categoria: 'pelo', nombre: 'Color raíz', precio: 35, duracion: 75, descripcion: 'Tinte de raíz con lavado y secado.' },
  { id: 'balayage', categoria: 'pelo', nombre: 'Mechas balayage', precio: 75, duracion: 150, descripcion: 'Mechas pintadas a mano, matiz incluido.' },
  { id: 'peinado-evento', categoria: 'pelo', nombre: 'Peinado de evento', precio: 30, duracion: 45, descripcion: 'Recogido u ondas para bodas y fiestas.' },
  { id: 'arreglo-barba', categoria: 'barba', nombre: 'Arreglo de barba', precio: 10, duracion: 20, descripcion: 'Recorte y perfilado con máquina.' },
  { id: 'afeitado', categoria: 'barba', nombre: 'Afeitado clásico con toalla caliente', precio: 15, duracion: 30, descripcion: 'Navaja, toalla caliente y aceite.' },
  { id: 'corte-barba', categoria: 'barba', nombre: 'Corte + barba', precio: 24, duracion: 50, descripcion: 'Corte de hombre y arreglo de barba.' },
  { id: 'cejas', categoria: 'extras', nombre: 'Cejas', precio: 6, duracion: 10, descripcion: 'Perfilado con cera o hilo.' },
  { id: 'hidratante', categoria: 'extras', nombre: 'Tratamiento hidratante', precio: 12, duracion: 20, descripcion: 'Mascarilla con masaje en el lavacabezas.' },
];

export const equipo = [
  { nombre: 'Iria Souto', especialidad: 'Dueña. Color y mechas' },
  { nombre: 'Brais Novo', especialidad: 'Barbero. Degradados y afeitado a navaja' },
  { nombre: 'Antía Lema', especialidad: 'Cortes de mujer y peinados de evento' },
];

export const resenas = {
  nota: 4.8,
  total: 212,
  plataforma: 'Google',
  lista: [
    { autor: 'Marta R.', texto: 'Iria me hizo la consulta de color antes de tocar nada y me explicó por qué no me convenía el rubio que llevaba en la foto. Salí con un balayage que me encanta.', estrellas: 5, fecha: '2026-09' },
    { autor: 'Xoán P.', texto: 'El mejor degradado de Pontevedra. Brais no tiene prisa y se nota.', estrellas: 5, fecha: '2026-08' },
    { autor: 'Lucía F.', texto: 'Mi abuela venía a la Carmiña y ahora vengo yo. Los lavacabezas verdes siguen ahí y son comodísimos.', estrellas: 5, fecha: '2026-06' },
    { autor: 'Andrés M.', texto: 'Afeitado con toalla caliente un sábado con vinilos sonando. Repetiré.', estrellas: 5, fecha: '2026-10' },
  ],
};
