// Tarjetas que se abren «en guía» (interacción de la casa), compartidas por servicios y equipo.
// Técnica FLIP: se mide dónde está cada tarjeta, se aplica el cambio de golpe y se anima desde la posición
// anterior. Funciona en todos los navegadores (la View Transitions API se aborta en pestañas en segundo plano).
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CURVA = 'cubic-bezier(.2, .7, .1, 1)';

// cabezas: botones con aria-controls hacia su detalle. selectorTarjeta: el elemento de la lista que se mueve.
export function tarjetasEnGuia(cabezas, selectorTarjeta) {
  const detalleDe = (c) => document.getElementById(c.getAttribute('aria-controls'));
  cabezas.forEach((c) => { detalleDe(c).hidden = true; });

  function abrir(cabeza, si) {
    const tarjeta = cabeza.closest(selectorTarjeta);
    const hermanas = [...tarjeta.parentElement.children];
    const antes = new Map(hermanas.map((t) => [t, t.getBoundingClientRect().top]));

    // Solo una abierta a la vez dentro del grupo.
    cabezas.forEach((otra) => {
      if (otra !== cabeza && otra.getAttribute('aria-expanded') === 'true') {
        otra.setAttribute('aria-expanded', 'false');
        detalleDe(otra).hidden = true;
        otra.closest(selectorTarjeta).classList.remove('abierto');
      }
    });
    cabeza.setAttribute('aria-expanded', String(si));
    detalleDe(cabeza).hidden = !si;
    tarjeta.classList.toggle('abierto', si);

    if (sinMovimiento) return;
    hermanas.forEach((t) => {
      const dy = antes.get(t) - t.getBoundingClientRect().top;
      if (Math.abs(dy) > 1) t.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 450, easing: CURVA });
    });
    if (si) detalleDe(cabeza).animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: CURVA });
  }

  cabezas.forEach((c) => c.addEventListener('click', () => abrir(c, c.getAttribute('aria-expanded') !== 'true')));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    const abierta = cabezas.find((c) => c.getAttribute('aria-expanded') === 'true');
    if (abierta) { abrir(abierta, false); abierta.focus(); }
  });
}
