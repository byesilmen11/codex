/* Yuvo — Sahne: Yuva (çayır fonu, yuva sepeti, gezinen Pufiler, gün sonu).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;        // sahne kök konteyneri
  var timers = [];
  var onState = null;

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n); } catch (e) {} }
  function toast (t) { if (Yuvo.toast) Yuvo.toast(t); }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  function ownedCount () {
    if (Yuvo.engine && Yuvo.engine.ownedCount) { try { return Yuvo.engine.ownedCount(); } catch (e) {} }
    var s = st(), n = 0, owned = s.owned || {};
    for (var id in owned) {
      if (!owned[id]) continue;
      var p = Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(id);
      if (p && p.rarity === 'gizli') continue;
      n += 1;
    }
    return n;
  }

  function eggArt () {
    if (Yuvo.art && Yuvo.art.eggSVG) {
      try { var s = Yuvo.art.eggSVG('yaygin', { crack:0 }); if (s) return s; } catch (e) {}
    }
    return '<span class="home-art-fallback">🥚</span>';
  }

  function pufiArt (p) {
    if (Yuvo.art && Yuvo.art.pufiSVG) {
      try { var s = Yuvo.art.pufiSVG(p, { mood:'happy' }); if (s) return s; } catch (e) {}
    }
    return '<span class="home-art-fallback">🐣</span>';
  }

  // Sahip olunan son 3-5 Pufi (ekleme sırasına göre sondakiler)
  function lastOwnedPufis () {
    var s = st(), owned = s.owned || {}, ids = [];
    for (var id in owned) { if (owned[id]) ids.push(id); }
    ids = ids.slice(-5);
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var p = Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(ids[i]);
      if (p) out.push(p);
    }
    return out;
  }

  /* ---------- çizim ---------- */
  function render () {
    if (!el) return;
    var s = st();
    var eggs = Math.max(0, s.eggsAvailable | 0);
    var owned = ownedCount();
    var pct = Math.max(0, Math.min(100, Math.round(owned / 30 * 100)));
    var html = '';

    // Gök dekoru: güneş + bulutlar
    html += '<div class="home-sky" aria-hidden="true">' +
              '<div class="home-sun"></div>' +
              '<div class="home-cloud c1"></div>' +
              '<div class="home-cloud c2"></div>' +
            '</div>';

    // Albüm ilerleme şeridi
    html += '<button class="home-progress" data-act="album" aria-label="Albümü aç">' +
              '<span class="home-progress-label">📔 Güneş Çayırı · <b>' + owned + '/30</b></span>' +
              '<span class="home-progress-bar"><span class="home-progress-fill" style="width:' + pct + '%"></span></span>' +
            '</button>';

    // Yuva sepeti + yumurtalar
    html += '<div class="home-nest-wrap">';
    if (eggs > 0) {
      html += '<p class="home-hint">Bir yumurta seç, birlikte çıtlatalım! 🐣</p>';
    } else {
      html += '<p class="home-hint">Bugünkü yumurtalar çıtlatıldı 🌙</p>';
    }
    html += '<div class="home-nest">';
    html += '<div class="home-eggs">';
    if (eggs > 0) {
      var shown = Math.min(eggs, 5);
      for (var i = 0; i < shown; i++) {
        html += '<button class="home-egg" style="--i:' + i + '" data-act="egg" aria-label="Yumurtayı çıtlat">' +
                  eggArt() + '</button>';
      }
      if (eggs > shown) html += '<span class="home-egg-more">+' + (eggs - shown) + '</span>';
    } else {
      html += '<span class="home-nest-empty" aria-hidden="true">💤</span>';
    }
    html += '</div>';
    html += '<div class="home-basket" aria-hidden="true"></div>';
    html += '</div></div>';

    // Gün sonu paneli (yumurta bitince)
    if (eggs === 0) {
      var extraLeft = Math.max(0, 2 - (s.extraEggsBought | 0));
      var canAfford = (s.stardust | 0) >= 120;
      html += '<div class="home-dayend">';
      if (extraLeft > 0) {
        // İkon ağırlıklı: kalan hak iki nokta ile (dolu = kalan), ekonomi cümlesi yok
        html += '<button class="btn btn-primary home-extra" data-act="extra"' + (canAfford ? '' : ' disabled') + '>' +
                  '🥚 +1 · ⭐120 <small>' + (extraLeft === 2 ? '●●' : '●○') + '</small></button>';
        if (!canAfford) {
          html += '<p class="home-note">⭐ yetersiz — Eşle &amp; Bul oynayıp yıldız toplayabilirsin!</p>';
        }
      } else {
        html += '<p class="home-note">Bugünlük ek yumurta hakkın doldu (2/2).</p>';
      }
      html += '<button class="btn btn-soft home-endday" data-act="endday">🌙 Günü Bitir</button>';
      html += '</div>';
    }

    // Çayır: gezinen Pufiler
    var roam = lastOwnedPufis();
    html += '<div class="home-meadow">';
    for (var j = 0; j < roam.length; j++) {
      var left = 6 + ((j * 19) % 68);
      var dur = (7 + (j % 3) * 2.5).toFixed(1);
      var delay = (-(j * 1.7)).toFixed(1);
      html += '<button class="home-roamer' + (j % 2 === 1 ? ' alt' : '') + '"' +
                ' data-act="pufi" data-id="' + roam[j].id + '"' +
                ' style="left:' + left + '%;animation-duration:' + dur + 's;animation-delay:' + delay + 's"' +
                ' aria-label="' + roam[j].ad + '">' +
                '<span class="home-roamer-body">' + pufiArt(roam[j]) + '</span>' +
              '</button>';
    }
    if (roam.length === 0) {
      html += '<p class="home-meadow-hint">Çayır henüz sessiz… İlk Pufi\'ni bekliyor 🌼</p>';
    }
    html += '<div class="home-grass" aria-hidden="true"></div>';
    html += '</div>';

    el.innerHTML = html;
  }

  /* ---------- etkileşim (delege tek dinleyici) ---------- */
  function handleClick (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act');

    if (act === 'egg') {
      play('tap');
      if (Yuvo.go) Yuvo.go('ceremony');
    } else if (act === 'album') {
      play('page');
      if (Yuvo.go) Yuvo.go('album');
    } else if (act === 'pufi') {
      play('pop');
      var body = b.querySelector('.home-roamer-body');
      if (body) {
        body.classList.remove('jump');
        void body.offsetWidth; // animasyonu baştan başlat
        body.classList.add('jump');
        later(function () { body.classList.remove('jump'); }, 700);
      }
    } else if (act === 'extra') {
      var ok = !!(Yuvo.engine && Yuvo.engine.buyExtraEgg && Yuvo.engine.buyExtraEgg());
      if (ok) {
        play('star');
        toast('🥚 Ek yumurta yuvaya kondu!');
      } else {
        var s = st();
        if ((s.extraEggsBought | 0) >= 2) toast('Bugünlük ek yumurta hakkı doldu.');
        else toast('⭐ yetersiz — 120⭐ gerekiyor.');
      }
      render();
    } else if (act === 'endday') {
      play('chime');
      if (Yuvo.engine && Yuvo.engine.newDay) Yuvo.engine.newDay();
      toast('🌞 Yeni gün! 3 taze yumurta yuvada.');
      render();
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.home = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'home-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      onState = function () { render(); };
      document.addEventListener('yuvo:state', onState);
      render();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      if (onState) { document.removeEventListener('yuvo:state', onState); onState = null; }
      if (el) {
        el.removeEventListener('click', handleClick);
        if (el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }
    }
  };
})();
