/* FARMER HORGÁSZTÓ — interakciók
   1) mobil menü
   2) fejléc: árnyék + összezárás görgetési irány szerint
   3) megjelenítő animáció
   4) görgetéssel vezérelt vízszintes kártyasáv
   Minden rész opcionális: ha az adott elem nincs az oldalon, kimarad.
   Későbbi fejlesztés helye: „akvárium” szekció (canvas + úszkáló halak). */

(function () {
  'use strict';

  var BP = 1080;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. Mobil menü --------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');

  if (burger && nav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
      document.body.style.overflow = open && window.innerWidth <= BP ? 'hidden' : '';
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > BP) setMenu(false);
    });
  }

  /* --- 2. Fejléc: árnyék + összezárás --------------------------------- */
  var header = document.querySelector('.hdr');

  if (header) {
    var lastY = window.scrollY;
    var hTicking = false;

    var onHeaderScroll = function () {
      hTicking = false;
      var y = window.scrollY;
      header.classList.toggle('is-stuck', y > 8);

      // nyitott mobilmenü mellett mindig teljes méret marad
      var menuOpen = nav && nav.classList.contains('open');

      if (menuOpen || y < 140) {
        header.classList.remove('is-compact');
      } else if (y > lastY + 4) {
        header.classList.add('is-compact');      // lefelé – összezár
      } else if (y < lastY - 4) {
        header.classList.remove('is-compact');   // felfelé – visszanyílik
      }

      lastY = y;
    };

    onHeaderScroll();
    window.addEventListener('scroll', function () {
      if (!hTicking) {
        hTicking = true;
        window.requestAnimationFrame(onHeaderScroll);
      }
    }, { passive: true });
  }

  /* --- 3. Megjelenítő animáció ---------------------------------------- */
  /* A galéria csempéi csoportosan jelennek meg. Korábban egyenként,
     lépcsőzetesen úsztak be — a fotókról vitte el a figyelmet, és a
     hosszú kaszkád minden görgetésnél újra eljátszotta magát. */
  Array.prototype.forEach.call(document.querySelectorAll('.gal'), function (grid) {
    Array.prototype.forEach.call(grid.children, function (tile) {
      tile.classList.add('rv');
    });
  });

  var items = document.querySelectorAll('.rv');

  if (items.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

      items.forEach(function (el) { io.observe(el); });
    }
  }

  /* --- 3b. Horgászbot motívum: kibontakozás látótérbe éréskor -------- */
  var grows = document.querySelectorAll('[data-grow]');
  if (grows.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      grows.forEach(function (el) { el.classList.add('is-grown'); });
    } else {
      var gio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('is-grown');
            gio.unobserve(en.target);
          }
        });
      }, { threshold: 0.3 });
      grows.forEach(function (el) { gio.observe(el); });
    }
  }

  /* --- 5. Képnézegető (lightbox) ------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.gal a'));

  if (links.length) {
    var box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Képnézegető');
    box.innerHTML =
      '<div class="lb__stage"><img class="lb__img" alt=""></div>' +
      '<button class="lb__btn lb__prev" type="button" aria-label="Előző kép">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button class="lb__btn lb__next" type="button" aria-label="Következő kép">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button class="lb__btn lb__close" type="button" aria-label="Bezárás">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
      '<p class="lb__count"><b></b> / <span></span></p>';
    document.body.appendChild(box);

    var lbImg = box.querySelector('.lb__img');
    var lbNow = box.querySelector('.lb__count b');
    var lbAll = box.querySelector('.lb__count span');
    var index = 0;
    var opener = null;

    lbAll.textContent = links.length;

    var show = function (i, dir) {
      index = (i + links.length) % links.length;
      var link = links[index];
      var thumb = link.querySelector('img');

      lbImg.classList.remove('show', 'from-left', 'from-right');
      if (dir) lbImg.classList.add(dir > 0 ? 'from-right' : 'from-left');

      var next = new Image();
      next.onload = function () {
        lbImg.src = next.src;
        lbImg.alt = thumb ? thumb.alt : '';
        // egy képkockával később indítjuk, hogy legyen mit animálni
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            lbImg.classList.add('show');
          });
        });
      };
      next.src = link.getAttribute('href');

      lbNow.textContent = index + 1;
    };

    var open = function (i, from) {
      opener = from || null;
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      show(i, 0);
      box.querySelector('.lb__close').focus();
    };

    var close = function () {
      box.classList.remove('open');
      lbImg.classList.remove('show');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open(i, a);
      });
    });

    box.querySelector('.lb__prev').addEventListener('click', function () { show(index - 1, -1); });
    box.querySelector('.lb__next').addEventListener('click', function () { show(index + 1, 1); });
    box.querySelector('.lb__close').addEventListener('click', close);

    // háttérre kattintva záródik, a képre kattintva nem
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lb__stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(index + 1, 1);
      else if (e.key === 'ArrowLeft') show(index - 1, -1);
    });

    // ujjal húzás mobilon
    var tx = 0;
    box.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* --- 6. Görgetéssel vezérelt vízszintes kártyasáv -------------------
     A szakasz magassága = a ragadó rész + a vízszintes út hossza.
     Lefelé görgetve a kártyasáv oldalra csúszik; a végére érve a ragadás
     megszűnik és az oldal normálisan folytatódik. */
  var hs = document.querySelector('.hscroll');
  if (!hs) return;

  var sticky = hs.querySelector('.hscroll__sticky');
  var track = hs.querySelector('.hscroll__track');
  var bar = hs.querySelector('.hscroll__bar span');
  var cards = Array.prototype.slice.call(hs.querySelectorAll('.hscroll__item'));
  var metrics = [];
  var travel = 0;
  var current = 0;   // ahol a sáv éppen tart
  var target = 0;    // ahol a görgetés szerint lennie kellene
  var velocity = 0;
  var running = false;
  var visible = false;

  var EASE = 0.085;  // kisebb érték = lágyabban követ

  var isDesktop = function () {
    return window.innerWidth > 900 && !reduced;
  };

  var clamp = function (v, min, max) {
    return v < min ? min : (v > max ? max : v);
  };

  /* A méreteket csak átrendezéskor olvassuk ki, így a képkockán belül
     nincs elrendezés-újraszámolás. */
  var measure = function () {
    metrics = cards.map(function (el) {
      return { el: el, mid: el.offsetLeft + el.offsetWidth / 2 };
    });
  };

  var paint = function () {
    var half = window.innerWidth / 2;

    /* EGÉSZ pixelre kerekítve: a törtpixeles eltolás a szöveget a
       pixelrácson kívülre teszi, attól lesz elmosódott. */
    track.style.transform = 'translate3d(' + Math.round(-current) + 'px,0,0)';
    if (bar && travel) {
      bar.style.width = clamp((current / travel) * 100, 0, 100).toFixed(2) + '%';
    }

    for (var i = 0; i < metrics.length; i++) {
      var m = metrics[i];
      var screenMid = m.mid - current;
      var offset = clamp((screenMid - half) / half, -1.6, 1.6);
      var near = 1 - Math.min(1, Math.abs(offset));
      var away = 1 - near;

      /* Csak függőleges eltolás, egész pixelben — se scale, se rotate,
         se opacity, mert mindegyik újrarasztereztetné a szöveget. */
      m.el.style.transform = 'translate3d(0,' + Math.round(away * 20) + 'px,0)';

      // a kártya fotója enyhén ellenmozog — mélységérzet (képen nem zavar)
      var img = m.el.querySelector('img');
      if (img) {
        img.style.transform =
          'scale(' + (1.08 - near * 0.04).toFixed(3) + ')' +
          ' translate3d(' + (offset * -4).toFixed(2) + '%,0,0)';
      }
    }
  };

  var tick = function () {
    var span = hs.offsetHeight - sticky.offsetHeight;
    if (span > 0) {
      var progress = clamp(-hs.getBoundingClientRect().top / span, 0, 1);
      target = progress * travel;
    }

    var diff = target - current;
    velocity = diff;
    current += diff * EASE;

    if (Math.abs(diff) < 0.08) {
      current = target;
      velocity = 0;
      paint();
      if (!visible) { running = false; return; }
    } else {
      paint();
    }

    window.requestAnimationFrame(tick);
  };

  var start = function () {
    if (running || !travel) return;
    running = true;
    window.requestAnimationFrame(tick);
  };

  /* mobil: ujjal húzható sáv, ugyanaz a középre-érkező hatás */
  var paintTouch = function () {
    var half = window.innerWidth / 2;
    cards.forEach(function (el) {
      var box = el.getBoundingClientRect();
      var offset = clamp((box.left + box.width / 2 - half) / half, -1.4, 1.4);
      var near = 1 - Math.min(1, Math.abs(offset));
      var away = 1 - near;

      el.style.transform = 'translate3d(0,' + Math.round(away * 10) + 'px,0)';
    });
  };

  var arrows = Array.prototype.slice.call(hs.querySelectorAll('.hscroll__arrow'));
  var touchTicking = false;

  var syncArrows = function () {
    var max = track.scrollWidth - track.clientWidth - 2;
    arrows.forEach(function (btn) {
      var isNext = btn.classList.contains('hscroll__arrow--next');
      btn.disabled = isNext ? track.scrollLeft >= max : track.scrollLeft <= 2;
    });
  };

  var step = function (dir) {
    var first = cards[0];
    if (!first) return;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    track.scrollBy({
      left: dir * (first.offsetWidth + gap),
      behavior: reduced ? 'auto' : 'smooth'
    });
  };

  arrows.forEach(function (btn) {
    btn.addEventListener('click', function () {
      step(btn.classList.contains('hscroll__arrow--next') ? 1 : -1);
    });
  });

  track.addEventListener('scroll', function () {
    if (isDesktop()) return;
    syncArrows();
    if (!touchTicking) {
      touchTicking = true;
      window.requestAnimationFrame(function () {
        touchTicking = false;
        paintTouch();
      });
    }
  }, { passive: true });

  var layout = function () {
    if (!isDesktop()) {
      hs.style.height = '';
      track.style.transform = '';
      if (bar) bar.style.width = '';
      travel = 0;
      running = false;
      if (reduced) {
        cards.forEach(function (el) {
          el.style.transform = '';
          el.style.opacity = '';
          var img = el.querySelector('img');
          if (img) img.style.transform = '';
        });
      } else {
        paintTouch();
      }
      syncArrows();
      return;
    }
    travel = Math.max(0, track.scrollWidth - sticky.clientWidth);
    hs.style.height = (sticky.offsetHeight + travel) + 'px';
    measure();
    start();
  };

  /* A hurok csak akkor forog, amikor a szakasz a képernyő közelében van. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }, { rootMargin: '200px 0px' }).observe(hs);
  } else {
    visible = true;
  }

  window.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  layout();
})();
