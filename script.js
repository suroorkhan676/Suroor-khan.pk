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

  /* Particles: floating dots with mouse attraction, connection lines and click bursts. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function particles(canvas) {
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var host = canvas.parentElement;
    var dots = [], bursts = [], w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    var mouse = { x: 0, y: 0, active: false };

    function makeDot() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.4 + Math.random() * 2.2
      };
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(22, Math.min(85, Math.round(w * h / 12000)));
      while (dots.length < n) dots.push(makeDot());
      dots.length = n;
      for (var i = 0; i < dots.length; i++) {
        if (dots[i].x > w) dots[i].x = Math.random() * w;
        if (dots[i].y > h) dots[i].y = Math.random() * h;
      }
    }

    function burst(x, y, count) {
      for (var c = 0; c < count; c++) {
        var ang = Math.random() * 6.2832;
        var sp = 0.7 + Math.random() * 2.2;
        bursts.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          r: 1 + Math.random() * 1.8
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, j, a, b, d, mdx, mdy, md;
      var lineDistance = 110;
      var mouseDistance = 170;

      for (i = 0; i < dots.length; i++) {
        a = dots[i];

        if (!reduce) {
          a.x += a.vx;
          a.y += a.vy;

          if (a.x < 0) { a.x = 0; a.vx *= -1; }
          if (a.x > w) { a.x = w; a.vx *= -1; }
          if (a.y < 0) { a.y = 0; a.vy *= -1; }
          if (a.y > h) { a.y = h; a.vy *= -1; }

          if (mouse.active) {
            mdx = mouse.x - a.x;
            mdy = mouse.y - a.y;
            md = Math.hypot(mdx, mdy);
            if (md < mouseDistance && md > 0.001) {
              var force = (1 - md / mouseDistance) * 0.075;
              a.vx += (mdx / md) * force;
              a.vy += (mdy / md) * force;
            }
          }

          a.vx = a.vx * 0.992 + (a.vx >= 0 ? 0.002 : -0.002);
          a.vy = a.vy * 0.992 + (a.vy >= 0 ? 0.002 : -0.002);
          a.vx = Math.max(-0.85, Math.min(0.85, a.vx));
          a.vy = Math.max(-0.85, Math.min(0.85, a.vy));
        }

        for (j = i + 1; j < dots.length; j++) {
          b = dots[j];
          d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < lineDistance) {
            ctx.strokeStyle = 'rgba(157,185,255,' + (0.24 * (1 - d / lineDistance)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          mdx = mouse.x - a.x;
          mdy = mouse.y - a.y;
          md = Math.hypot(mdx, mdy);
          if (md < mouseDistance) {
            ctx.strokeStyle = 'rgba(72,143,255,' + (0.42 * (1 - md / mouseDistance)).toFixed(3) + ')';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(157,185,255,.88)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, 6.2832);
        ctx.fill();
      }

      if (mouse.active) {
        ctx.fillStyle = 'rgba(72,143,255,.18)';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, 6.2832);
        ctx.fill();
      }

      for (i = bursts.length - 1; i >= 0; i--) {
        b = bursts[i];
        b.life -= 0.022;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.985;
        b.vy *= 0.985;
        ctx.fillStyle = 'rgba(220,231,255,' + b.life.toFixed(2) + ')';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 6.2832);
        ctx.fill();
      }
    }

    function loop() {
      draw();
      raf = (visible && !document.hidden && !reduce) ? requestAnimationFrame(loop) : 0;
    }

    function start() {
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    }

    function updateMouse(e) {
      var r = host.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.x <= w && mouse.y >= 0 && mouse.y <= h;
      if (reduce) draw(); else start();
    }

    size();
    draw();
    window.addEventListener('resize', function () { size(); draw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) start();
      }).observe(host);
    }
    document.addEventListener('visibilitychange', start);
    start();

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' && e.isPrimary === false) return;
      updateMouse(e);
    });
    host.addEventListener('pointerenter', updateMouse);

    document.addEventListener('pointerdown', function (e) {
      var bounds = host.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) return;
      if (e.target.closest('a, button, input, select, textarea, summary')) return;
      updateMouse(e);
      var x = mouse.x, y = mouse.y, k, nearest = null, best = 9999;
      for (k = 0; k < dots.length; k++) {
        var dist = Math.hypot(dots[k].x - x, dots[k].y - y);
        if (dist < best) {
          best = dist;
          nearest = dots[k];
        }
      }
      if (nearest && best < 120) {
        nearest.vx += (Math.random() - 0.5) * 1.2;
        nearest.vy += (Math.random() - 0.5) * 1.2;
        burst(nearest.x, nearest.y, 20);
      } else {
        burst(x, y, 14);
      }
      if (reduce) draw(); else start();
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
