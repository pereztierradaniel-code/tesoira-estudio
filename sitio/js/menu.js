// Cabecera que se compacta al bajar y menú hamburguesa del móvil (foco atrapado, scroll bloqueado, Escape).
const cabecera = document.querySelector('.cabecera');
const boton = document.querySelector('[data-menu-boton]');
const panel = document.getElementById('menu-movil');

const compactar = () => cabecera.classList.toggle('compacta', scrollY > 40);
compactar();
addEventListener('scroll', compactar, { passive: true });

if (boton && panel) {
  const enfocables = () => [boton, ...panel.querySelectorAll('a, button')];

  const abrir = (si) => {
    boton.setAttribute('aria-expanded', String(si));
    boton.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
    panel.classList.toggle('abierto', si);
    panel.inert = !si;
    document.body.classList.toggle('sin-scroll', si);
    cabecera.classList.toggle('compacta', si || scrollY > 40);
    if (si) setTimeout(() => panel.querySelector('a')?.focus(), 50);
  };
  panel.inert = true;

  boton.addEventListener('click', () => abrir(boton.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) abrir(false); });
  document.addEventListener('keydown', (e) => {
    if (!panel.classList.contains('abierto')) return;
    if (e.key === 'Escape') { abrir(false); boton.focus(); return; }
    if (e.key === 'Tab') {
      const lista = enfocables();
      const i = lista.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); lista.at(-1).focus(); }
      else if (!e.shiftKey && i === lista.length - 1) { e.preventDefault(); lista[0].focus(); }
    }
  });
  // Si se agranda la ventana con el menú abierto, se cierra.
  matchMedia('(min-width: 960px)').addEventListener('change', (m) => { if (m.matches) abrir(false); });
}
