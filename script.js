/* ---------------------------------------------------------------
   Maximilian Haensch — single-page academic site
   Vanilla JS, no dependencies.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     Theme toggle — persists the user's explicit choice; otherwise
     the CSS media query keeps following the OS setting.
     ------------------------------------------------------------- */

  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* -------------------------------------------------------------
     Reveal on scroll — staggered within each section.
     ------------------------------------------------------------- */

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // Stagger siblings so items in one section cascade rather than pop together.
    document.querySelectorAll('.section-inner, .hero-text, .hero-inner').forEach(function (group) {
      group.querySelectorAll(':scope > .reveal, :scope > .pubs > .reveal').forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i * 70) + 'ms');
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // reveal once, then stop watching
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* -------------------------------------------------------------
     Sticky nav state + scroll progress bar.
     Reads are batched into a rAF so scrolling stays cheap.
     ------------------------------------------------------------- */

  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress-bar');
  var cue = document.querySelector('.scroll-cue');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle('is-stuck', y > 24);
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (cue) cue.classList.toggle('is-hidden', y > 80);

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });

  onScroll();

  /* -------------------------------------------------------------
     Scroll spy + sliding nav indicator.
     ------------------------------------------------------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var indicator = document.querySelector('.nav-indicator');
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  var activeLink = null;

  function moveIndicator(link) {
    if (!link) {
      indicator.classList.remove('is-visible');
      return;
    }
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    indicator.classList.add('is-visible');
  }

  function setActive(link) {
    if (link === activeLink) return;
    if (activeLink) activeLink.classList.remove('is-active');
    activeLink = link;
    if (activeLink) activeLink.classList.add('is-active');
    moveIndicator(activeLink);
  }

  if (sections.length && 'IntersectionObserver' in window) {
    // Track which sections are on screen; the topmost one wins.
    var onScreen = new Set();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      });

      if (!onScreen.size) {
        setActive(null); // hero is in view, no section highlighted
        return;
      }

      var top = Array.from(onScreen).sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      })[0];

      setActive(links[sections.indexOf(top)]);
    }, {
      // A band just below the nav: a section is "current" while it crosses it.
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { spy.observe(section); });
  }

  // Keep the indicator glued to its link when the nav reflows.
  window.addEventListener('resize', function () {
    var prev = indicator.style.transition;
    indicator.style.transition = 'none';
    moveIndicator(activeLink);
    // Force a reflow so the transition-less reposition is committed first.
    void indicator.offsetWidth;
    indicator.style.transition = prev;
  });

  /* -------------------------------------------------------------
     Smooth scrolling for browsers without CSS scroll-behavior
     (Safari < 15.4). Modern browsers fall through to native.
     ------------------------------------------------------------- */

  if (!('scrollBehavior' in root.style) && !reduceMotion) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      });
    });
  }

  /* -------------------------------------------------------------
     Footer year.
     ------------------------------------------------------------- */

  document.getElementById('year').textContent = new Date().getFullYear();
})();
