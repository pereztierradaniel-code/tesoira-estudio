// Parte 5: contador de la nota media y reseñas que cambian solas cada 6 s.
// Se paran con el ratón encima, con el foco dentro, con el botón «Pausar» o si el usuario prefiere menos movimiento.
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Contador de la nota ---------- */
const contador = document.querySelector('[data-contador]');
if (contador && !sinMovimiento) {
  const final = Number(contador.dataset.contador);
  const formato = (n) => n.toFixed(1).replace('.', ',');
  contador.textContent = formato(0);
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    const inicio = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - inicio) / 1400);
      const suave = 1 - (1 - p) ** 3;
      contador.textContent = formato(final * suave);
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    // Si el navegador frena las animaciones (pestaña en segundo plano), el número final queda bien igual.
    setTimeout(() => { contador.textContent = formato(final); }, 1600);
  }, { threshold: 0.6 }).observe(contador);
}

/* ---------- Reseñas que cambian ---------- */
const caja = document.querySelector('[data-resenas]');
const items = [...document.querySelectorAll('[data-resena]')];
const indicador = document.querySelector('[data-resena-contador]');
const botonPausa = document.querySelector('[data-resena-pausa]');
let actual = 0;
let pausadoPorUsuario = sinMovimiento;
let encima = false;
let temporizador = null;

function mostrar(i) {
  actual = (i + items.length) % items.length;
  items.forEach((it, n) => {
    const si = n === actual;
    it.classList.toggle('activa', si);
    it.setAttribute('aria-hidden', String(!si));
  });
  indicador.textContent = `${actual + 1} / ${items.length}`;
}

function programar() {
  clearInterval(temporizador);
  if (!pausadoPorUsuario && !encima) temporizador = setInterval(() => mostrar(actual + 1), 6000);
}

function pintarPausa() {
  botonPausa.setAttribute('aria-pressed', String(pausadoPorUsuario));
  botonPausa.textContent = pausadoPorUsuario ? 'Reanudar' : 'Pausar';
}

if (items.length) {
  mostrar(0);
  pintarPausa();
  programar();
  document.querySelectorAll('[data-resena-mover]').forEach((b) => b.addEventListener('click', () => {
    mostrar(actual + Number(b.dataset.resenaMover));
    programar();
  }));
  botonPausa.addEventListener('click', () => { pausadoPorUsuario = !pausadoPorUsuario; pintarPausa(); programar(); });
  caja.addEventListener('pointerenter', () => { encima = true; programar(); });
  caja.addEventListener('pointerleave', () => { encima = false; programar(); });
  caja.addEventListener('focusin', () => { encima = true; programar(); });
  caja.addEventListener('focusout', (e) => { if (!caja.contains(e.relatedTarget)) { encima = false; programar(); } });
  // No gastar batería si la pestaña no se ve.
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(temporizador); else programar(); });
}
