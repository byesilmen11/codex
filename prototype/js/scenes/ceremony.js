/* Yuvo — Sahne: Çıtlatma Töreni (docs/06 §2 + ARCHITECTURE.md 6 adım). Sahip: scenes-core ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};
  Yuvo.test = Yuvo.test || {};

  // ---------- modül durumu ----------
  var mounted = false;
  var rootEl = null, stageEl = null, eggEl = null, eggWrapEl = null;
  var warmthEl = null, ringsEl = null, fxEl = null, hintEl = null;
  var result = null;           // openEgg() sonucu — mount'ta BİR KEZ çekilir, saklanır
  var stage = 'idle';          // arrive | warm | rhythm | burst | card | noegg
  var crack = 0;
  var warmDist = 0, warmTaps = 0, rubbing = false, lastX = 0, lastY = 0;
  var ringStep = 0;
  var lastTap = 0;
  var timers = [];

  var WARM_DIST = 1400;        // px — dairesel ovalama (pointermove) birikimi eşiği
  var WARM_TAPS = 5;           // dokunma fallback: 5 tap
  var DBL_MS = 350;            // çift-tap hızlandırma eşiği

  // ---------- yardımcılar ----------
  function later (fn, ms) {
    var id = setTimeout(function () { if (mounted) fn(); }, ms);
    timers.push(id);
    return id;
  }
  function clearTimers () {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }
  function play (name) {
    try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(name); } catch (e) {}
  }
  function vibrate (p) {
    try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {}
  }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function rarityInfo (key) {
    return (Yuvo.data && Yuvo.data.RARITIES && Yuvo.data.RARITIES[key]) || { ad: key || '?', renk: '#9AA5B1' };
  }

  // Savunmacı sanat: art modülü henüz yoksa basit yedekler
  function eggSVG () {
    try {
      if (Yuvo.art && Yuvo.art.eggSVG) {
        var s = Yuvo.art.eggSVG(result.rarity, { crack: crack });
        if (s) return s;
      }
    } catch (e) {}
    var renk = rarityInfo(result.rarity).renk;
    var cr = '';
    if (crack >= 1) cr += '<path d="M45 40 l8 9 -6 7 9 8" stroke="#6d5c46" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (crack >= 2) cr += '<path d="M74 52 l-7 8 8 6 -5 9" stroke="#6d5c46" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if (crack >= 3) cr += '<path d="M40 66 l10 5 -3 9 11 4 M80 42 l-4 10 8 5" stroke="#57452f" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 120 120"><ellipse cx="60" cy="66" rx="34" ry="44" fill="' + renk + '"/>' +
      '<ellipse cx="48" cy="48" rx="10" ry="14" fill="rgba(255,255,255,.5)"/>' + cr + '</svg>';
  }
  function pufiSVG (mood) {
    try {
      if (Yuvo.art && Yuvo.art.pufiSVG) {
        var s = Yuvo.art.pufiSVG(result.pufi, { mood: mood || 'happy' });
        if (s) return s;
      }
    } catch (e) {}
    var renk = rarityInfo(result.rarity).renk;
    return '<svg viewBox="0 0 120 120"><circle cx="60" cy="64" r="38" fill="' + renk + '"/>' +
      '<circle cx="48" cy="56" r="5" fill="#3a2f22"/><circle cx="72" cy="56" r="5" fill="#3a2f22"/>' +
      '<path d="M48 74 q12 10 24 0" stroke="#3a2f22" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }

  function renderEgg () { if (eggEl) eggEl.innerHTML = eggSVG(); }
  function setHint (text) { if (hintEl) hintEl.textContent = text || ''; }

  // ---------- aşama 0: yumurta yoksa nazik mesaj ----------
  function showNoEgg () {
    stage = 'noegg';
    rootEl.innerHTML =
      '<div class="cere-stage cere-noegg">' +
        '<div class="cere-noegg-box card center">' +
          '<div class="cere-noegg-ico">🌙</div>' +
          '<h2>Bugünün yumurtaları bitti</h2>' +
          '<p>Pufiler tatlı tatlı uyuyor… Yarın sepette yeni sürprizler olacak!</p>' +
          '<button class="btn btn-primary" id="cere-home">Yuvaya Dön 🏡</button>' +
        '</div>' +
      '</div>';
    var b = rootEl.querySelector('#cere-home');
    if (b) b.addEventListener('click', function () { if (Yuvo.go) Yuvo.go('home'); });
    later(function () { if (stage === 'noegg' && Yuvo.go) Yuvo.go('home'); }, 3000);
  }

  // ---------- sahne iskeleti ----------
  function buildStage () {
    rootEl.innerHTML =
      '<div class="cere-stage" id="cere-stage">' +
        '<div class="cere-basket" id="cere-basket">🧺</div>' +
        '<div class="cere-egg-wrap arriving" id="cere-egg-wrap">' +
          '<div class="cere-egg" id="cere-egg"></div>' +
          '<div class="cere-warmth" id="cere-warmth"></div>' +
          '<div class="cere-hand" aria-hidden="true">🖐️</div>' +
        '</div>' +
        '<div class="cere-rings" id="cere-rings"></div>' +
        '<div class="cere-fx" id="cere-fx"></div>' +
        '<p class="cere-hint" id="cere-hint"></p>' +
      '</div>';
    stageEl = rootEl.querySelector('#cere-stage');
    eggWrapEl = rootEl.querySelector('#cere-egg-wrap');
    eggEl = rootEl.querySelector('#cere-egg');
    warmthEl = rootEl.querySelector('#cere-warmth');
    ringsEl = rootEl.querySelector('#cere-rings');
    fxEl = rootEl.querySelector('#cere-fx');
    hintEl = rootEl.querySelector('#cere-hint');

    stageEl.addEventListener('pointerdown', onPointerDown);
    stageEl.addEventListener('pointermove', onPointerMove);
    stageEl.addEventListener('pointerup', onPointerEnd);
    stageEl.addEventListener('pointercancel', onPointerEnd);
    renderEgg();
  }

  // ---------- işaretçi olayları ----------
  function onPointerDown (e) {
    var now = Date.now();
    var isDbl = (now - lastTap) < DBL_MS;
    lastTap = now;
    if (isDbl) { accelerate(); return; }

    if (stage === 'warm') {
      rubbing = true;
      lastX = e.clientX; lastY = e.clientY;
      warmTaps += 1;
      play('tap');
      vibrate(8);
      checkWarm();
    } else if (stage === 'rhythm') {
      onRingTap();
    }
  }
  function onPointerMove (e) {
    if (stage !== 'warm' || !rubbing) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    warmDist += Math.sqrt(dx * dx + dy * dy);
    checkWarm();
  }
  function onPointerEnd () { rubbing = false; }

  // Çift-tap: her aşamayı hızlandır
  function accelerate () {
    if (stage === 'arrive') { clearTimers(); startWarm(); }
    else if (stage === 'warm') { finishWarm(); }
    else if (stage === 'rhythm') {
      clearTimers();
      crack = 3; renderEgg();
      play('crackBig'); vibrate([20, 30, 80]);
      doBurst();
    } else if (stage === 'burst') { clearTimers(); showCard(); }
  }

  // ---------- aşama 1: sepetten geliş ----------
  function showArrive () {
    stage = 'arrive';
    setHint('Yumurta geliyor! 🥚');
    play('pop');
    later(function () { startWarm(); }, 950);
  }

  // ---------- aşama 2: ısıtma ----------
  function startWarm () {
    if (stage === 'warm') return;
    stage = 'warm';
    warmDist = 0; warmTaps = 0;
    if (eggWrapEl) { eggWrapEl.classList.remove('arriving'); eggWrapEl.classList.add('warm'); }
    var basket = rootEl && rootEl.querySelector('#cere-basket');
    if (basket) basket.classList.add('gone');
    // Jest gösterimi: yumurta üstünde daire çizen el animasyonu (.cere-hand) — metin kısa kalır
    setHint('Ovala! 🖐️');
  }
  function checkWarm () {
    if (stage !== 'warm') return;
    var progress = Math.max(warmDist / WARM_DIST, warmTaps / WARM_TAPS);
    if (warmthEl) warmthEl.style.opacity = String(Math.min(1, progress) * 0.65);
    if (progress >= 1) finishWarm();
  }
  function finishWarm () {
    if (stage !== 'warm') return;
    stage = 'warming-done';
    rubbing = false;
    crack = 1;
    renderEgg();
    if (warmthEl) warmthEl.style.opacity = '0.65';
    if (eggWrapEl) { eggWrapEl.classList.remove('warm'); eggWrapEl.classList.add('warmed'); }
    play('crack1');
    vibrate(40);
    setHint('Çıtladı! ✨');
    later(function () { startRhythm(); }, 500);
  }

  // ---------- aşama 3: ritim halkaları ----------
  function startRhythm () {
    stage = 'rhythm';
    ringStep = 0;
    setHint('Halkaya dokun! 👆');
    showRing(0);
  }
  function showRing (i) {
    ringStep = i;
    if (ringsEl) {
      ringsEl.innerHTML = '<div class="cere-ring ring-p' + i + '">' +
        '<span class="cere-ring-finger" aria-hidden="true">👆</span></div>';
    }
  }
  function onRingTap () {
    if (stage !== 'rhythm') return;
    if (ringStep === 0) {
      crack = 2; renderEgg();
      play('crack1'); vibrate(20);
      showRing(1);
    } else if (ringStep === 1) {
      crack = 3; renderEgg();
      play('crack2'); vibrate(30);
      showRing(2);
    } else {
      play('crackBig'); vibrate([20, 30, 80]);
      doBurst();
    }
  }

  // ---------- aşama 4: patlama + kutlama ----------
  function doBurst () {
    if (stage === 'burst' || stage === 'card') return;
    stage = 'burst';
    setHint('');
    if (ringsEl) ringsEl.innerHTML = '';
    if (eggWrapEl) eggWrapEl.classList.add('burst');

    var tier = (result && result.celebrationTier) || 0;
    play('pop');
    if (tier >= 3) { if (stageEl) stageEl.classList.add('tier3glow'); play('fanfareBig'); }
    else if (tier === 2) play('fanfare');
    else if (tier === 1) play('chime');

    if (fxEl) {
      fxEl.innerHTML = '<div class="cere-flash"></div>';
      spawnConfetti([18, 26, 38, 60][tier] || 18);
      if (tier >= 2) later(function () { spawnConfetti(24); }, 350);
      var pw = document.createElement('div');
      pw.className = 'cere-pufi';
      pw.innerHTML = pufiSVG('happy');
      fxEl.appendChild(pw);
    }
    vibrate(tier >= 3 ? [40, 60, 120] : 50);
    later(function () { showCard(); }, tier >= 3 ? 1700 : 1050);
  }
  function spawnConfetti (n) {
    if (!fxEl) return;
    var colors = ['#FFD34D', '#FF8A5C', '#A8E06E', '#BDE8FF', '#B266E8', rarityInfo(result.rarity).renk];
    var box = document.createElement('div');
    box.className = 'cere-confetti';
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = 90 + Math.random() * 190;
      var p = document.createElement('i');
      p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * r - 50) + 'px');
      p.style.setProperty('--rot', Math.round(Math.random() * 720 - 360) + 'deg');
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.15) + 's';
      box.appendChild(p);
    }
    fxEl.appendChild(box);
    later(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 1600);
  }

  // ---------- aşama 5-6: sonuç kartı ----------
  function showCard () {
    if (stage === 'card' || !result) return;
    stage = 'card';
    clearTimers();
    if (stageEl) stageEl.classList.add('show-card');
    if (ringsEl) ringsEl.innerHTML = '';
    setHint('');

    var p = result.pufi;
    var ri = rarityInfo(result.rarity);
    var badge = result.isNew
      ? '<span class="cere-badge cere-badge-new">Yeni! ✨</span>'
      : '<span class="cere-badge cere-badge-copy">+' + (result.kabukGained || 0) + ' 🐚</span>';
    var btn = result.isNew
      ? '<button class="btn btn-primary" id="cere-next">Oyuncağını Birleştir!</button>'
      : '<button class="btn btn-primary" id="cere-next">Devam ▶</button>';

    if (fxEl) {
      fxEl.innerHTML =
        '<div class="cere-card card">' +
          '<div class="cere-portrait rf rf-' + esc(result.rarity) + '">' + pufiSVG('happy') + '</div>' +
          '<h2 class="cere-name">' + esc(p.ad) + '</h2>' +
          '<div class="cere-tags">' +
            '<span class="rarity-tag" style="background:' + esc(ri.renk) + '33;border-color:' + esc(ri.renk) + '">' +
              esc((ri.simge ? ri.simge + ' ' : '') + ri.ad) + '</span>' +
            badge +
          '</div>' +
          '<p class="cere-bio">' + esc(p.bio || '') + '</p>' +
          btn +
        '</div>';
      play('chime');
      var b = fxEl.querySelector('#cere-next');
      if (b) {
        b.addEventListener('click', function () {
          play('click');
          if (!Yuvo.go) return;
          if (result.isNew) Yuvo.go('assembly', { pufiId: p.id });
          else Yuvo.go('home');
        });
      }
    }
  }

  // ---------- sahne API ----------
  Yuvo.scenes.ceremony = {
    mount: function (el) {
      mounted = true;
      rootEl = el;
      result = null;
      stage = 'idle';
      crack = 0; warmDist = 0; warmTaps = 0; rubbing = false; ringStep = 0; lastTap = 0;

      var res = null;
      try {
        if (Yuvo.engine && Yuvo.engine.openEgg) res = Yuvo.engine.openEgg();
      } catch (e) { res = null; }

      if (!res || res.error || !res.pufi) { showNoEgg(); return; }
      result = res;
      buildStage();
      showArrive();
    },
    unmount: function () {
      mounted = false;
      clearTimers();
      // stageEl üzerindeki dinleyiciler innerHTML temizliğiyle DOM'la birlikte gider;
      // yine de referansları bırak.
      rootEl = null; stageEl = null; eggEl = null; eggWrapEl = null;
      warmthEl = null; ringsEl = null; fxEl = null; hintEl = null;
      result = null; rubbing = false; stage = 'idle';
    }
  };

  // ---------- test kancası ----------
  // Töreni anında sonuç kartına sarar; sonucu döndürür (sahne açık değilse null).
  Yuvo.test.ceremonySkip = function () {
    if (!mounted) return null;
    if (!result) { if (Yuvo.go) Yuvo.go('home'); return null; }
    clearTimers();
    crack = 3;
    renderEgg();
    showCard();
    return result;
  };
})();
