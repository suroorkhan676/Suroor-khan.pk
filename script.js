(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile menu */
  var toggle = $('.menu-toggle');
  var nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Social links that are not filled in yet do nothing when tapped */
  $$('a[data-pending]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Quote form opens WhatsApp with the message ready to send */
  var form = $('#quote-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#q-name').value.trim();
      var msg = 'Hi Suroor, I would like a quote.\n' +
        (name ? 'Name: ' + name + '\n' : '') +
        'Service: ' + $('#q-service').value + '\n' +
        'Details: ' + ($('#q-details').value.trim() || 'I will share the details here.');
      var a = document.createElement('a');
      a.href = 'https://wa.me/923130926668?text=' + encodeURIComponent(msg);
      a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  /* Portfolio: field tabs */
  var tabs = $$('.tab');
  var panels = $$('.tab-panel');
  function selectTab(field) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.field === field ? 'true' : 'false'); });
    panels.forEach(function (p) { p.hidden = p.id !== 'panel-' + field; });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { selectTab(t.dataset.field); }); });
  $$('.field-tile').forEach(function (a) {
    a.addEventListener('click', function () { selectTab(a.dataset.field); });
  });

  /* Portfolio: category pages open inside the page and follow the address hash */
  var index = $('#work-index');
  var pages = $$('.cat-page');
  var work = $('#work');
  function route(scroll) {
    var m = /^#work-([\w-]+)$/.exec(location.hash);
    var page = m ? $('#cat-' + m[1]) : null;
    pages.forEach(function (p) { p.hidden = p !== page; });
    if (index) index.hidden = !!page;
    if (page) {
      selectTab(page.dataset.field);
      if (scroll && work) work.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', function () { route(true); });
  route(false);
  if (/^#work-/.test(location.hash) && work) setTimeout(function () { work.scrollIntoView(); }, 0);

  /* Particles: soft floating dots in the navy sections. Click near a dot for a burst. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function particles(canvas) {
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var host = canvas.parentElement;
    var dots = [], bursts = [], w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(18, Math.min(70, Math.round(w * h / 14000)));
      while (dots.length < n) dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.2 + Math.random() * 1.8 });
      dots.length = n;
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, d;
      for (i = 0; i < dots.length; i++) {
        a = dots[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (j = i + 1; j < dots.length; j++) {
          b = dots[j]; d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.strokeStyle = 'rgba(157,185,255,' + (0.22 * (1 - d / 110)).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(157,185,255,.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
      for (i = bursts.length - 1; i >= 0; i--) {
        b = bursts[i]; b.life -= 0.025;
        if (b.life <= 0) { bursts.splice(i, 1); continue; }
        b.x += b.vx; b.y += b.vy;
        ctx.fillStyle = 'rgba(220,231,255,' + b.life.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(b.x, b.y, 1.6, 0, 6.2832); ctx.fill();
      }
    }
    function loop() {
      draw();
      raf = (visible && !document.hidden && !reduce) ? requestAnimationFrame(loop) : 0;
    }
    function start() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
    size(); draw();
    window.addEventListener('resize', function () { size(); draw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(host);
    }
    document.addEventListener('visibilitychange', start);
    start();
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button, input, select, textarea, summary')) return;
      var r = host.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, k, c;
      for (k = 0; k < dots.length; k++) {
        if (Math.hypot(dots[k].x - x, dots[k].y - y) < 60) {
          for (c = 0; c < 14; c++) {
            var ang = Math.random() * 6.2832, sp = 0.6 + Math.random() * 1.8;
            bursts.push({ x: dots[k].x, y: dots[k].y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1 });
          }
          dots[k].vx += (Math.random() - .5) * .8; dots[k].vy += (Math.random() - .5) * .8;
          if (reduce) draw(); else start();
          break;
        }
      }
    });
  }
  $$('canvas.particles').forEach(particles);

  /* Home links always return to the main page */
  $$('a[data-home]').forEach(function (a) {
    a.addEventListener('click', function () { window.scrollTo(0, 0); });
  });

  /* Design viewer */
  var dlg = $('#viewer');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var img = $('#viewer-img');
  var title = $('#viewer-title');
  var cat = $('#viewer-cat');
  var list = [];
  var idx = 0;

  function show(i) {
    idx = (i + list.length) % list.length;
    var btn = list[idx];
    var src = btn.querySelector('img');
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    title.textContent = btn.dataset.title;
    cat.textContent = btn.dataset.catlabel;
  }
  function open(btn) {
    list = $$('.work-btn').filter(function (el) { return !el.closest('[hidden]'); });
    show(list.indexOf(btn));
    dlg.showModal();
  }
  $$('.work-btn').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  $('#viewer-close').addEventListener('click', function () { dlg.close(); });
  $('#viewer-prev').addEventListener('click', function () { show(idx - 1); });
  $('#viewer-next').addEventListener('click', function () { show(idx + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
