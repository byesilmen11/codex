/* =====================================================================
   YUVO — FTUE açılışı (docs/v2/04 §1, 0:00–0:55 dilimi) + Luna gün sonu
   =====================================================================
   AKIŞ (tam ekran, metin okumadan oynanır):
     karanlik : karanlıkta ışıyan yumurta + kalp atışı (~2,2 sn, pasif)
     yildiz   : gökten yıldız süzülür, nabız halkasıyla ÇOCUĞUN dokunuşunu
                bekler; dokununca parmağa yapışıp çayıra iner, anlatıcı
                2 cümle söyler (Yuvo.dialog)
     isit     : çimende üşüyen yumurta — 3 ovalama/dokunuş ısıtır,
                kabuk ışık sızdırır → introDone=true → ceremony {eggIdx:0}
   Sonrası: ilk albüm ziyaretinde Kiki albümü hediye eder (album.js,
   introGiftShown bayrağı). Yuvo.scenes.intro.playDusk(onDone): Luna'nın
   günbatımı ritüeli (home.js "Günü Bitir" çağırır).
   Test: Yuvo.test.skipIntro() / Yuvo.test.replayIntro()
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Y.scenes = Y.scenes || {};

  var el = null, timers = [], phase = null, warmth = 0, rubAcc = 0, lastXY = null;

  function st () { return (Y.engine && Y.engine.state) || {}; }
  function play (n, o) { try { if (Y.audio && Y.audio.play) Y.audio.play(n, o); } catch (e) {} }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function dlg () { return (Y.data && Y.data.DIALOG) || {}; }

  function eggArt () {
    if (Y.art && Y.art.eggSVG) {
      try { var s = Y.art.eggSVG('yaygin', { crack: 0 }); if (s) return s; } catch (e) {}
    }
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<ellipse cx="60" cy="64" rx="34" ry="42" fill="#FFF6E3" stroke="#3E2A1C" stroke-width="3.5"/>' +
      '<ellipse cx="48" cy="46" rx="10" ry="6" fill="#FFFFFF" opacity="0.6"/></svg>';
  }

  function starSVG () {
    return '<svg viewBox="0 0 90 90" aria-hidden="true">' +
      '<path d="M45 8 L54 33 L80 35 L60 51 L67 77 L45 62 L23 77 L30 51 L10 35 L36 33 Z"' +
      ' fill="#FFD34D" stroke="#3E2A1C" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="38" cy="30" r="4" fill="#FFFFFF" opacity="0.85"/></svg>';
  }

  /* ---------- aşamalar ---------- */

  function showKaranlik () {
    phase = 'karanlik';
    el.innerHTML =
      '<div class="intro-stage intro-dark">' +
        '<div class="intro-glow-egg beat" aria-hidden="true">' + eggArt() + '</div>' +
      '</div>';
    play('chime');
    later(showYildiz, 2200);
  }

  function showYildiz () {
    phase = 'yildiz';
    el.innerHTML =
      '<div class="intro-stage intro-dusk">' +
        '<div class="intro-hills" aria-hidden="true"></div>' +
        '<button class="intro-star" aria-label="Yıldıza dokun">' +
          '<span class="intro-star-ring" aria-hidden="true"></span>' +
          '<span class="intro-star-body">' + starSVG() + '</span>' +
        '</button>' +
      '</div>';
    var btn = el.querySelector('.intro-star');
    btn.addEventListener('click', function onStar () {
      btn.removeEventListener('click', onStar);
      btn.classList.add('caught');
      play('magicRise');
      play('star');
      var D = dlg();
      var lines = (D.anlatici && D.anlatici.giris) || [];
      if (Y.dialog && lines.length) {
        Y.dialog.say({ kim: null, metin: lines[0] });
        Y.dialog.say({ kim: null, metin: lines[1] || '', cb: function () { showIsit(); } });
      } else {
        later(showIsit, 900);
      }
    });
  }

  function showIsit () {
    phase = 'isit';
    warmth = 0; rubAcc = 0; lastXY = null;
    el.innerHTML =
      '<div class="intro-stage intro-dawn">' +
        '<div class="intro-hills lit" aria-hidden="true"></div>' +
        '<p class="intro-hint">Üşümüş… ısıtır mısın?</p>' +
        '<button class="intro-egg shiver" aria-label="Yumurtayı ovarak ısıt">' +
          '<span class="intro-egg-warm" aria-hidden="true"></span>' +
          '<span class="intro-egg-art">' + eggArt() + '</span>' +
        '</button>' +
        '<div class="intro-hand" aria-hidden="true">🖐</div>' +
      '</div>';
    var egg = el.querySelector('.intro-egg');
    // Ovalama: parmak yumurta üstünde gezindikçe ısınır; tap da sayılır
    egg.addEventListener('pointermove', function (e) {
      if (e.buttons === 0 && e.pointerType !== 'touch') return;
      if (lastXY) {
        rubAcc += Math.abs(e.clientX - lastXY[0]) + Math.abs(e.clientY - lastXY[1]);
        if (rubAcc > 90) { rubAcc = 0; warmUp(); }
      }
      lastXY = [e.clientX, e.clientY];
    });
    egg.addEventListener('pointerdown', function (e) { lastXY = [e.clientX, e.clientY]; });
    egg.addEventListener('click', function () { warmUp(); });
  }

  function warmUp () {
    if (phase !== 'isit' || warmth >= 3) return;
    warmth += 1;
    play(warmth >= 3 ? 'crack' : 'pop');
    var egg = el.querySelector('.intro-egg');
    if (egg) {
      egg.classList.remove('shiver');
      egg.classList.add('warm-' + warmth);
      egg.classList.remove('pulse'); void egg.offsetWidth; egg.classList.add('pulse');
    }
    if (warmth >= 3) {
      var hint = el.querySelector('.intro-hint');
      if (hint) hint.textContent = 'Isındı! Kabuk ışıldıyor…';
      later(finishIntro, 700);
    }
  }

  function finishIntro () {
    var s = st();
    s.introDone = true;
    if (Y.engine && Y.engine.save) Y.engine.save();
    if (Y.dialog) Y.dialog.clear();
    if (Y.go) Y.go('ceremony', { eggIdx: 0 });
  }

  /* ---------- Luna günbatımı ritüeli (her günün kapanışı) ---------- */
  // Sahneden bağımsız tam ekran örtü; onDone en sonda çağrılır (newDay orada).
  function playDusk (onDone) {
    var app = document.getElementById('app') || document.body;
    var wrap = document.createElement('div');
    wrap.className = 'dusk-layer';
    var stars = '';
    for (var i = 0; i < 9; i++) {
      stars += '<span class="dusk-star" style="left:' + (8 + (i * 37) % 84) + '%;top:' +
               (6 + (i * 23) % 38) + '%;animation-delay:' + (i * 0.35) + 's">✦</span>';
    }
    var lunaArt = '';
    if (Y.art && Y.art.story && Y.art.story.portre) {
      try { lunaArt = Y.art.story.portre('luna', { mood: 'sleep' }) || ''; } catch (e) {}
    }
    wrap.innerHTML =
      '<div class="dusk-sky" aria-hidden="true">' + stars + '</div>' +
      (lunaArt ? '<div class="dusk-luna" aria-hidden="true">' + lunaArt + '</div>' : '');
    app.appendChild(wrap);
    void wrap.offsetWidth;
    wrap.classList.add('on');
    play('chime');

    function bitir () {
      wrap.classList.remove('on');
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (typeof onDone === 'function') { try { onDone(); } catch (e) {} }
      }, 650);
    }
    var D = dlg();
    var ninni = (D.luna && D.luna.ninni) || [];
    if (Y.dialog && ninni.length) {
      Y.dialog.say({ kim: 'luna', mood: 'sleep', metin: ninni[0] });
      Y.dialog.say({ kim: 'luna', mood: 'sleep', metin: ninni[1] || '', cb: bitir });
    } else {
      setTimeout(bitir, 1400);
    }
  }

  /* ---------- sahne API ---------- */
  Y.scenes.intro = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'intro-scene';
      rootEl.appendChild(el);
      showKaranlik();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      phase = null;
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
    },
    playDusk: playDusk
  };

  /* ---------- test kancaları ---------- */
  Y.test = Y.test || {};
  Y.test.skipIntro = function () {
    var s = st();
    s.introDone = true;
    if (Y.engine && Y.engine.save) Y.engine.save();
    if (Y.dialog) Y.dialog.clear();
    if (Y.go) Y.go('home');
    return true;
  };
  Y.test.replayIntro = function () {
    var s = st();
    s.introDone = false;
    if (Y.engine && Y.engine.save) Y.engine.save();
    if (Y.go) Y.go('intro');
    return true;
  };
  Y.test.introWarm = function () { warmUp(); return warmth; };
})();
