// Parte 4: galería en desplazamiento horizontal y foto ampliada en <dialog> (flechas, teclado ← → Escape y deslizar).
const pista = document.querySelector('[data-galeria-pista]');
const botones = [...document.querySelectorAll('.galeria__boton')];
const visor = document.querySelector('[data-visor]');
const img = document.querySelector('[data-visor-img]');
const texto = document.querySelector('[data-visor-texto]');
const contador = document.querySelector('[data-visor-contador]');
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
let actual = 0;
let origen = null;

/* ---------- Flechas de la pista (ordenador) ---------- */
const flechas = [...document.querySelectorAll('[data-galeria-mover]')];
function estadoFlechas() {
  const max = pista.scrollWidth - pista.clientWidth - 2;
  flechas.forEach((f) => { f.disabled = f.dataset.galeriaMover === '-1' ? pista.scrollLeft <= 2 : pista.scrollLeft >= max; });
}
flechas.forEach((f) => f.addEventListener('click', () => {
  pista.scrollBy({ left: Number(f.dataset.galeriaMover) * pista.clientWidth * 0.7, behavior: sinMovimiento ? 'auto' : 'smooth' });
}));
pista.addEventListener('scroll', estadoFlechas, { passive: true });
addEventListener('resize', estadoFlechas);
estadoFlechas();

/* ---------- Visor ---------- */
function mostrar(i) {
  actual = (i + botones.length) % botones.length;
  const b = botones[actual];
  const miniatura = b.querySelector('img');
  img.src = b.dataset.grande;
  img.alt = miniatura.alt;
  img.width = miniatura.width;
  img.height = miniatura.height;
  texto.textContent = b.closest('figure').querySelector('figcaption span').textContent;
  contador.textContent = `${actual + 1} / ${botones.length}`;
  if (!sinMovimiento) { img.classList.remove('cambiando'); void img.offsetWidth; img.classList.add('cambiando'); }
}

botones.forEach((b, i) => b.addEventListener('click', () => {
  origen = b;
  mostrar(i);
  visor.showModal();
  document.body.classList.add('sin-scroll');
}));
visor.addEventListener('close', () => {
  document.body.classList.remove('sin-scroll');
  origen?.focus();
});
document.querySelector('[data-visor-cerrar]').addEventListener('click', () => visor.close());
document.querySelectorAll('[data-visor-mover]').forEach((b) => b.addEventListener('click', () => mostrar(actual + Number(b.dataset.visorMover))));
// Tocar fuera de la foto también cierra.
visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
visor.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(actual + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(actual - 1); }
});

// Deslizar con el dedo.
let x0 = null;
visor.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
visor.addEventListener('pointerup', (e) => {
  if (x0 === null) return;
  const dx = e.clientX - x0;
  x0 = null;
  if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
});
visor.addEventListener('pointercancel', () => { x0 = null; });
