/* Atlas Colom — tema, filtros de publicaciones, índice activo e impresión. */
(function () {
  var root = document.documentElement;

  // Tema: alterna claro / oscuro y lo recuerda en este navegador.
  function currentTheme() {
    return root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'theme') {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    }
    if (btn.dataset.action === 'print') window.print();
  });

  // Filtros de publicaciones: un eje a la vez + interruptores.
  var pubs = Array.prototype.slice.call(document.querySelectorAll('.ac-pub'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.chip[data-toggle]'));
  var status = document.querySelector('.filter-status');
  var state = { topic: 'all', first: false, featured: false };

  function apply() {
    var shown = 0;
    pubs.forEach(function (p) {
      var ok = (state.topic === 'all' || p.dataset.topic === state.topic) &&
        (!state.first || p.dataset.first === 'true') &&
        (!state.featured || p.querySelector('.ac-pub-gloss'));
      p.hidden = !ok;
      if (ok) shown++;
    });
    if (status) status.textContent = shown === pubs.length ? '' : 'Mostrando ' + shown + ' de ' + pubs.length + ' artículos';
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      state.topic = c.dataset.filter;
      chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
      apply();
    });
  });
  toggles.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.dataset.toggle;
      state[k] = !state[k];
      t.setAttribute('aria-pressed', String(state[k]));
      apply();
    });
  });

  // Índice de hojas: marca la sección visible.
  var links = {};
  document.querySelectorAll('.bar-index a').forEach(function (a) { links[a.dataset.sec] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        if (links[en.target.id]) links[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section.sheet').forEach(function (s) { io.observe(s); });
  }

  // Al imprimir se muestran todas las publicaciones.
  window.addEventListener('beforeprint', function () { pubs.forEach(function (p) { p.dataset.wasHidden = p.hidden; p.hidden = false; }); });
  window.addEventListener('afterprint', function () { pubs.forEach(function (p) { p.hidden = p.dataset.wasHidden === 'true'; }); });
})();
