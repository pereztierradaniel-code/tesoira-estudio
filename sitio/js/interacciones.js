// Interacciones de la casa (nivel Premium): carga, parallax, botones magnéticos, menú Dock y cursor propio.
const raiz = document.documentElement;
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const conRaton = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Animación de carga: como mucho 1 s y solo la primera vez en la visita.
if (raiz.classList.contains('cargando')) {
  setTimeout(() => {
    raiz.classList.remove('cargando');
    raiz.classList.add('listo');
    try { sessionStorage.setItem('tesoira-cargado', '1'); } catch { /* modo privado */ }
  }, 950);
} else {
  raiz.classList.add('listo');
}

// Parallax suave.
const capas = [...document.querySelectorAll('[data-parallax]')];
if (capas.length && !sinMovimiento) {
  let pendiente = false;
  const mover = () => {
    capas.forEach((c) => { c.style.transform = `translate3d(0, ${scrollY * Number(c.dataset.parallax)}px, 0)`; });
    pendiente = false;
  };
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(mover); } }, { passive: true });
}

if (conRaton && !sinMovimiento) {
  // Botones magnéticos.
  document.querySelectorAll('.magnetico').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // Magnificación del menú, como el Dock del Mac.
  const dock = document.querySelector('[data-dock]');
  const enlaces = dock ? [...dock.querySelectorAll('a')] : [];
  dock?.addEventListener('pointermove', (e) => {
    enlaces.forEach((a) => {
      const r = a.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      a.style.setProperty('--zoom', (1 + Math.max(0, 1 - d / 140) * 0.18).toFixed(3));
    });
  });
  dock?.addEventListener('pointerleave', () => enlaces.forEach((a) => a.style.setProperty('--zoom', 1)));

  // Cursor propio que cambia según lo que toca.
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const texto = document.createElement('span');
  texto.className = 'cursor__texto';
  cursor.append(texto);
  document.body.append(cursor);
  raiz.classList.add('con-cursor');

  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('visible'); });
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
  const seguir = () => {
    cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(seguir);
  };
  seguir();
  document.addEventListener('pointerover', (e) => {
    const o = e.target.closest('a, button, [data-cursor]');
    const tipo = o?.dataset.cursor || (o?.classList.contains('btn-reservar') ? 'reservar' : o ? 'enlace' : '');
    cursor.dataset.tipo = tipo;
    texto.textContent = tipo === 'ver' ? 'Ver' : tipo === 'reservar' ? 'Reservar' : '';
  });
}

// Parte 9: títulos y entradillas de sección aparecen al entrar en pantalla.
const porVer = document.querySelectorAll('.al-ver, .al-ver-suave');
if (sinMovimiento || !('IntersectionObserver' in window)) {
  porVer.forEach((e) => e.classList.add('visto'));
} else {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); obs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  porVer.forEach((e) => obs.observe(e));
}
