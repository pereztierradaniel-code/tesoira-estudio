// Se carga en el <head> sin defer: decide si hay animación de carga antes de pintar.
(function () {
  var r = document.documentElement;
  r.classList.add('js');
  try {
    if (!sessionStorage.getItem('tesoira-cargado') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      r.classList.add('cargando');
    }
  } catch (e) { /* sin sessionStorage: sin animación */ }
  // Seguridad: si el resto del JavaScript falla, el contenido se ve igual.
  setTimeout(function () { r.classList.remove('cargando'); r.classList.add('listo'); }, 1500);
})();
