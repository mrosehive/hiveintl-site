/* ============================================================
   HIVE INTERNATIONAL — site interactions
   Vanilla JS, no dependencies. Degrades gracefully w/o JS.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a link is tapped
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll-reveal (entrance animations) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revObserver.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    function fmt(n) {
      return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US');
    }
    if (reduceMotion) {
      el.textContent = prefix + fmt(target) + suffix;
      return;
    }
    var duration = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + fmt(val) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.counter .num[data-target]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var cObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cObserver.observe(el); });
    }
  }

  /* ---------- Past-performance filtering ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var ppCards = document.querySelectorAll('.pp-card');
  if (filterBtns.length && ppCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        filterBtns.forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        ppCards.forEach(function (card) {
          var cats = (card.getAttribute('data-cats') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Contact form success state ---------- */
  /* Progressive enhancement: submit via fetch so Netlify records the
     submission AND we can show an inline success message without a redirect. */
  var form = document.querySelector('form[data-netlify="true"]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      }).then(function () {
        form.classList.add('hidden');
        var ok = document.querySelector('.form-success');
        if (ok) { ok.classList.remove('hidden'); ok.focus(); }
      }).catch(function () {
        // Fall back to native submission if fetch fails
        form.submit();
      });
    });
  }

  /* ---------- Geographic footprint map tooltips (Impact page) ---------- */
  /* The SVG is inlined in the page; JS only wires hover/tap/focus tooltips. */
  var mapWrap = document.getElementById('footprint-map');
  if (mapWrap && mapWrap.querySelector('svg.footprint-svg')) {
    var tip = document.createElement('div');
    tip.className = 'map-tooltip';
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<span class="t-name"></span><span class="t-prog"></span>';
    mapWrap.appendChild(tip);
    var tName = tip.querySelector('.t-name'), tProg = tip.querySelector('.t-prog');
    function showTip(m) {
      tName.textContent = m.getAttribute('data-name');
      tProg.textContent = m.getAttribute('data-prog');
      var dot = m.querySelector('.dot');
      var wr = mapWrap.getBoundingClientRect(), dr = dot.getBoundingClientRect();
      tip.style.left = (dr.left + dr.width / 2 - wr.left) + 'px';
      tip.style.top = (dr.top - wr.top) + 'px';
      tip.style.opacity = '1';
    }
    function hideTip() { tip.style.opacity = '0'; }
    mapWrap.querySelectorAll('.marker').forEach(function (m) {
      m.addEventListener('mouseenter', function () { showTip(m); });
      m.addEventListener('mouseleave', hideTip);
      m.addEventListener('focus', function () { showTip(m); });
      m.addEventListener('blur', hideTip);
      m.addEventListener('click', function () { showTip(m); });
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.querySelector('[data-year]');
  if (y) { y.textContent = new Date().getFullYear(); }
})();
