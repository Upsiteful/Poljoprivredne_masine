/* ============================================================
   AGRO MAŠINE MARKO – script.js
   Vanilla JS: hamburger, FAQ accordion, reviews carousel,
   seasonal content, contact form validation + submission
   ============================================================ */

(function () {
  'use strict';

  /* ── DOM Ready ── */
  document.addEventListener('DOMContentLoaded', function () {
    initFooterYear();
    initHamburger();
    initStickyHeader();
    initSmoothNav();
    initFAQ();
    initReviewsCarousel();
    initSeasonalContent();
    initContactForm();
  });

  /* ============================================================
     FOOTER YEAR
  ============================================================ */
  function initFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================================
     HAMBURGER MENU
  ============================================================ */
  function initHamburger() {
    var btn  = document.getElementById('hamburger');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close when a nav link is tapped */
    menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
     STICKY HEADER – add shadow class on scroll
  ============================================================ */
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.style.boxShadow = window.scrollY > 10
        ? '0 4px 24px rgba(0,0,0,0.35)'
        : '0 2px 16px rgba(0,0,0,0.25)';
    }, { passive: true });
  }

  /* ============================================================
     SMOOTH NAV (anchor links with header offset)
  ============================================================ */
  function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var headerH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h')) || 68;
        var top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ============================================================
     FAQ ACCORDION
  ============================================================ */
  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var btn    = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        /* Close all others */
        items.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            var ob = other.querySelector('.faq-q');
            if (ob) ob.setAttribute('aria-expanded', 'false');
          }
        });

        /* Toggle this one */
        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ============================================================
     REVIEWS CAROUSEL (mobile only – swipe + dots)
  ============================================================ */
  function initReviewsCarousel() {
    var track = document.getElementById('reviews-track');
    var dotsWrap = document.getElementById('carousel-dots');
    if (!track || !dotsWrap) return;

    var cards = track.querySelectorAll('.review-card');
    var total = cards.length;
    var current = 0;
    var isMobile = false;

    function checkMobile() {
      return window.innerWidth < 640;
    }

    function enableCarousel() {
      track.classList.add('carousel-mode');
      isMobile = true;
      buildDots();
      goTo(0);
    }

    function disableCarousel() {
      track.classList.remove('carousel-mode');
      track.style.transform = '';
      dotsWrap.innerHTML = '';
      isMobile = false;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Recenzija ' + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', String(i === 0));
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          goTo(parseInt(this.dataset.index));
        });
        dotsWrap.appendChild(dot);
      }
    }

    function goTo(index) {
      if (!isMobile) return;
      current = Math.max(0, Math.min(index, total - 1));
      /* Svaka kartica je tačno 100% širine wrappera, gap=0 */
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsWrap.querySelectorAll('.carousel-dot').forEach(function (d, i) {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', String(i === current));
      });
    }

    /* Touch/swipe support */
    var touchStartX = 0;
    var touchEndX   = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
      }
    }, { passive: true });

    /* Auto-advance (4 s) */
    var autoTimer;
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () {
        if (isMobile) goTo(current < total - 1 ? current + 1 : 0);
      }, 4000);
    }
    function stopAuto() { clearInterval(autoTimer); }
    track.addEventListener('touchstart', stopAuto, { passive: true });

    /* Responsive check */
    function onResize() {
      if (checkMobile() && !isMobile) {
        enableCarousel();
        startAuto();
      } else if (!checkMobile() && isMobile) {
        disableCarousel();
        stopAuto();
      }
    }

    window.addEventListener('resize', onResize, { passive: true });
    onResize(); /* init */
  }

  /* ============================================================
     SEASONAL CONTENT – changes by month
  ============================================================ */
  function initSeasonalContent() {
    var container = document.getElementById('seasonal-content');
    if (!container) return;

    var month = new Date().getMonth(); /* 0=Jan … 11=Dec */

    var seasons = {
      /* Spring: March–May (2,3,4) */
      spring: {
        label: '🌱 Prolećna sezonska preporuka',
        title: 'Vreme je za setvu!',
        subtitle: 'Prolećna sezona donosi najveću potražnju. Ne čekajte – pripremite se na vreme.',
        benefits: [
          'Priprema zemljišta freze i kultivatorima',
          'Precizne sejalice za kukuruz i suncokret',
          'Prskalice za tretiranje useva',
          'Brza isporuka pred setvu'
        ],
        product: {
          icon: '🌽',
          color: '#1b4332',
          name: 'Pneumatske sejalice – akcija',
          desc: 'Veliki izbor sejalica za kukuruz, suncokret i žitarice. Mehaničke i pneumatske. Pozovite za aktuelne cene i dostupnost.',
          ctaText: 'Pozovi za ponudu',
          ctaHref: 'tel:+38160111222'
        }
      },
      /* Summer: June–August (5,6,7) */
      summer: {
        label: '☀️ Letnja sezonska preporuka',
        title: 'Sezona košenja i baliranja!',
        subtitle: 'Leto je pravo vreme za detelinu, lucerku i seno. Imamo sve što vam treba.',
        benefits: [
          'Traktorske kosačice – rotacione i prstaste',
          'Rolo balirke i četvrtaste balirke',
          'Sakupljači pokošene mase',
          'Prikolice za transport bala'
        ],
        product: {
          icon: '🌾',
          color: '#856404',
          name: 'Rolo balirke – dostupne odmah',
          desc: 'Nov i polovan izbor balirki za lucerku, detelinu i seno. Različite širine zahvata. Zovite za demonstraciju i cenu.',
          ctaText: 'Pozovi za ponudu',
          ctaHref: 'tel:+38160111222'
        }
      },
      /* Autumn: Sept–Nov (8,9,10) */
      autumn: {
        label: '🍂 Jesenska sezonska preporuka',
        title: 'Priprema za jesensku obradu!',
        subtitle: 'Jesen je pravo vreme za obradu zemljišta i pripremu za narednu sezonu.',
        benefits: [
          'Plugovi za oranje – jednobrazni i višebrazni',
          'Drljače i tanjirače za pripremu setve',
          'Kultivatori za međurednu obradu',
          'Prikolice i transportna oprema za berbu'
        ],
        product: {
          icon: '🌍',
          color: '#7d4f00',
          name: 'Plugovi i drljače – prolećni popust',
          desc: 'Pripremite se za jesen! Veliki izbor plugova i priključnih mašina za obradu zemljišta. Pogodnost pri kupovini do kraja meseca.',
          ctaText: 'Pitaj za cenu',
          ctaHref: '#kontakt'
        }
      },
      /* Winter: Dec–Feb (11,0,1) */
      winter: {
        label: '❄️ Zimska preporuka',
        title: 'Servis i priprema mašina!',
        subtitle: 'Zima je idealno vreme da se mašine serviseraju i pripreme za prolećnu sezonu.',
        benefits: [
          'Kompletna dijagnostika i servis traktora',
          'Zamena potrošnih delova i filtera',
          'Pregled i podešavanje sejalica',
          'Rezervni delovi na lageru – brza dostava'
        ],
        product: {
          icon: '🔧',
          color: '#2d6a4f',
          name: 'Zimska servisna akcija',
          desc: 'Prijavite svoju mašinu na zimski servis i uštedite. Zamena ulja, filtera, podešavanje i pregled – sve na jednom mestu.',
          ctaText: 'Zakaži servis',
          ctaHref: 'tel:+38160111222'
        }
      }
    };

    /* Determine season */
    var season;
    if (month >= 2 && month <= 4)  season = seasons.spring;
    else if (month >= 5 && month <= 7) season = seasons.summer;
    else if (month >= 8 && month <= 10) season = seasons.autumn;
    else season = seasons.winter;

    /* Render */
    container.innerHTML =
      '<div class="seasonal-text">' +
        '<p class="seasonal-label">' + season.label + '</p>' +
        '<h2>' + season.title + '</h2>' +
        '<p>' + season.subtitle + '</p>' +
        '<ul class="seasonal-benefits">' +
          season.benefits.map(function(b){ return '<li>' + b + '</li>'; }).join('') +
        '</ul>' +
        '<a href="' + season.product.ctaHref + '" class="btn btn-call btn-xl">' +
          season.product.ctaText +
        '</a>' +
      '</div>' +
      '<div class="seasonal-product-card">' +
        '<div class="img-placeholder" style="--ph-color:' + season.product.color + '; aspect-ratio:16/9">' +
          '<span style="font-size:64px">' + season.product.icon + '</span>' +
        '</div>' +
        '<h3>' + season.product.name + '</h3>' +
        '<p>' + season.product.desc + '</p>' +
        '<a href="' + season.product.ctaHref + '" class="btn btn-call">' +
          season.product.ctaText +
        '</a>' +
      '</div>';
  }

  /* ============================================================
     CONTACT FORM – validation + submission
  ============================================================ */
  function initContactForm() {
    var form    = document.getElementById('contact-form');
    var success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Clear previous errors */
      clearErrors();

      var name    = form['name'].value.trim();
      var phone   = form['phone'].value.trim();
      var email   = form['email'].value.trim();
      var message = form['message'].value.trim();
      var consent = form['consent'].checked;

      var valid = true;

      /* Validate phone (required) */
      if (!phone) {
        showError('err-phone', 'Broj telefona je obavezan.');
        setInvalid('field-phone');
        valid = false;
      } else if (!/^[\d\s\+\-\(\)]{6,20}$/.test(phone)) {
        showError('err-phone', 'Unesite ispravan broj telefona.');
        setInvalid('field-phone');
        valid = false;
      }

      /* Validate email (optional, but if filled must be valid) */
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('err-email', 'Unesite ispravnu email adresu.');
        setInvalid('field-email');
        valid = false;
      }

      /* Validate message (required) */
      if (!message) {
        showError('err-message', 'Poruka je obavezna.');
        setInvalid('field-message');
        valid = false;
      }

      /* Validate consent (required) */
      if (!consent) {
        showError('err-consent', 'Molimo vas da potvrdite saglasnost.');
        valid = false;
      }

      if (!valid) return;

      /* ── FORM SUBMISSION ──
         Option A: mailto: fallback (pure static)
         Option B: Replace sendFormToEmail() body with your backend/API call
      */
      sendFormToEmail({ name: name, phone: phone, email: email, message: message });
    });

    /* ── Backend integration point ──
       Replace the body of this function with a fetch() call to your endpoint.
       Example:
         fetch('/api/contact', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(data)
         }).then(...).catch(...)
    */
    function sendFormToEmail(data) {
      /* Fallback: open user's email client pre-filled */
      var subject = encodeURIComponent('Upit sa sajta – ' + (data.name || 'Posetilac'));
      var body = encodeURIComponent(
        'Ime i prezime: ' + (data.name || '–') + '\n' +
        'Telefon: ' + data.phone + '\n' +
        'Email: ' + (data.email || '–') + '\n\n' +
        'Poruka:\n' + data.message
      );
      var mailto = 'mailto:prodaja@agromasine.rs?subject=' + subject + '&body=' + body;

      /* Open in new tab so user doesn't lose the page */
      var a = document.createElement('a');
      a.href = mailto;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      /* Show success state */
      showSuccess();
    }

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showError(id, msg) {
      var el = document.getElementById(id);
      if (el) el.textContent = msg;
    }

    function setInvalid(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add('invalid');
    }

    function clearErrors() {
      ['err-name','err-phone','err-email','err-message','err-consent'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = '';
      });
      ['field-name','field-phone','field-email','field-message'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('invalid');
      });
    }

    /* Clear error on input */
    ['field-phone','field-email','field-message'].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        this.classList.remove('invalid');
        var errId = this.id.replace('field-', 'err-');
        var errEl = document.getElementById(errId);
        if (errEl) errEl.textContent = '';
      });
    });
  }

})();