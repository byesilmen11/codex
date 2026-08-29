/* Yuvo — Sahne: Yuva ("Gün doğumu çayırı" tam kompozisyon: katmanlı manzara SVG,
   örgülü sepet, sepette yumurtalar, gezinen Pufiler, gün sonu paneli).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md — mantık/state akışı DEĞİŞMEDİ.
   Görsel dil: BRAND.md §3 (sticker reçetesi) + §5 Yuva atmosferi. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;        // sahne kök konteyneri
  var timers = [];
  var onState = null;
  var SEQ = 0;          // benzersiz SVG gradyan id sayacı (önek: ysh- ; yi-/yv- başkasının)

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n); } catch (e) {} }
  function toast (t) { if (Yuvo.toast) Yuvo.toast(t); }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function uid (n) { return 'ysh-' + n + '-' + (SEQ++); }

  // Yuvo.icons güvenli erişim (main.js ico() deseni): ikon yoksa emoji fallback
  function ico (name, fb) {
    try {
      if (Yuvo.icons && Yuvo.icons[name]) { var s = Yuvo.icons[name](); if (s) return s; }
    } catch (e) {}
    return '<span class="ico-fallback">' + fb + '</span>';
  }
  function ic (name, fb, cls) {
    return '<span class="ys-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
           ico(name, fb) + '</span>';
  }

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

  /* ---------- dekor SVG'leri (düz dolgu; id yalnız büyük manzara gradyanlarında) ---------- */

  // 5 taç yapraklı düz dolgulu çiçek (manzara + çayır süsü ortak)
  function flowerAt (x, y, c, sc) {
    var out = '';
    for (var a = 0; a < 5; a++) {
      var ang = (a * 72 - 90) * Math.PI / 180;
      out += '<circle cx="' + (x + Math.cos(ang) * 6 * sc).toFixed(1) +
             '" cy="' + (y + Math.sin(ang) * 6 * sc).toFixed(1) +
             '" r="' + (4.2 * sc).toFixed(1) + '" fill="' + c + '"/>';
    }
    out += '<circle cx="' + x + '" cy="' + y + '" r="' + (3 * sc).toFixed(1) + '" fill="#F2A400"/>';
    return out;
  }

  // Tam genişlik manzara: gök bandı, gün doğumu ışıması, katmanlı tepeler, çiçek benekleri
  function landscapeSVG () {
    var gSky = uid('sky'), gHill = uid('hill'), gMd = uid('meadow');
    return '<svg viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + gSky + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8AD9F7"/><stop offset="1" stop-color="#CFF0FE"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + gHill + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#B9EC82"/><stop offset="1" stop-color="#A5E36B"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + gMd + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8ED94F"/><stop offset="1" stop-color="#55B944"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="0" y="0" width="390" height="430" fill="url(#' + gSky + ')"/>' +
      '<ellipse cx="195" cy="404" rx="310" ry="130" fill="#FFE9A8" opacity=".85"/>' +
      '<ellipse cx="195" cy="410" rx="390" ry="185" fill="#FFE9A8" opacity=".45"/>' +
      '<path d="M0 408 Q 58 352 132 388 Q 176 340 250 380 Q 314 344 390 396 L390 480 L0 480 Z"' +
        ' fill="url(#' + gHill + ')"/>' +
      '<path d="M0 458 Q 92 418 196 448 Q 302 418 390 452 L390 780 L0 780 Z"' +
        ' fill="url(#' + gMd + ')"/>' +
      flowerAt(52, 500, '#FFFFFF', 0.9) +
      flowerAt(148, 530, '#FF8FB0', 1) +
      flowerAt(258, 506, '#FFC734', 0.85) +
      flowerAt(338, 540, '#FFFFFF', 0.95) +
      flowerAt(96, 586, '#FFC734', 0.8) +
      flowerAt(310, 610, '#FF8FB0', 0.9) +
    '</svg>';
  }

  // Manzara: önce Yuvo.art.env katmanları (varsa), yoksa yerel fallback
  function skyline () {
    var env = Yuvo.art && Yuvo.art.env;
    if (env) {
      try {
        var out = '';
        if (env.sky) out += env.sky() || '';
        if (env.clouds) out += env.clouds() || '';
        if (env.meadow) out += env.meadow() || '';
        if (out) return out;
      } catch (e) {}
    }
    return landscapeSVG();
  }

  // Sticker bulut (beyaz + krem gölgeleme + koyu kontur)
  function cloudSVG () {
    return '<svg viewBox="0 0 120 60" aria-hidden="true" focusable="false">' +
      '<path d="M28 48c-10 0-18-6.5-18-15 0-7.5 6-13.5 14-14C26.5 11 33.5 6 42 6' +
        'c10 0 18.5 6.5 20.5 15.5 1.5-.5 3.5-.9 5.5-.9 9 0 16.4 6.2 16.4 14.2' +
        ' 0 7.6-6.6 13.2-15.4 13.2Z" fill="#FFFFFF" stroke="#3E2A1C" stroke-width="3"' +
        ' stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M24 41c4 2.6 9.6 3.4 14.2 2" fill="none" stroke="#FFE3B8"' +
        ' stroke-width="4" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="34" cy="19" rx="9" ry="4.4" transform="rotate(-14 34 19)"' +
        ' fill="#FFFFFF" opacity=".9"/>' +
    '</svg>';
  }

  // Örgülü yuva sepeti (env.basket yoksa)
  function basketSVG () {
    var gB = uid('bsk'), gR = uid('rim');
    var weave = '';
    for (var x = 34; x <= 226; x += 24) {
      weave += '<path d="M' + x + ' 40 Q ' + (x + 6) + ' 66 ' + (x - 4) + ' 94"' +
               ' fill="none" stroke="#3E2A1C" stroke-width="2.4" opacity=".26"/>';
    }
    weave += '<path d="M20 56c38 10 182 10 220 0M28 76c34 9 170 9 204 0" fill="none"' +
             ' stroke="#3E2A1C" stroke-width="2.4" opacity=".26"/>';
    return '<svg viewBox="0 0 260 118" preserveAspectRatio="xMidYMid meet"' +
      ' aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + gB + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#C98A4B"/><stop offset=".55" stop-color="#B77B3F"/>' +
          '<stop offset="1" stop-color="#8E5A2B"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + gR + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#D89A58"/><stop offset="1" stop-color="#9C6630"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M14 32h232c0 48-38 76-116 76S14 80 14 32Z" fill="none" stroke="#FFFFFF"' +
        ' stroke-width="10" stroke-linejoin="round" opacity=".9"/>' +
      '<path d="M14 32h232c0 48-38 76-116 76S14 80 14 32Z" fill="url(#' + gB + ')"' +
        ' stroke="#3E2A1C" stroke-width="3.5" stroke-linejoin="round"/>' +
      weave +
      '<rect x="6" y="22" width="248" height="22" rx="11" fill="url(#' + gR + ')"' +
        ' stroke="#3E2A1C" stroke-width="3.5"/>' +
      '<ellipse cx="54" cy="29" rx="16" ry="3.6" fill="#FFFFFF" opacity=".55"/>' +
      '<path d="M32 106c2-8 6-12 6-12s1 7-2 13M228 104c-2-8-6-12-6-12s-1 7 2 13"' +
        ' fill="none" stroke="#55B944" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M46 110c1-6 5-10 5-10M214 108c-1-6-5-10-5-10" fill="none"' +
        ' stroke="#8ED94F" stroke-width="5" stroke-linecap="round"/>' +
    '</svg>';
  }

  function basketArt () {
    var env = Yuvo.art && Yuvo.art.env;
    if (env && env.basket) { try { var s = env.basket(); if (s) return s; } catch (e) {} }
    return basketSVG();
  }

  // Düz dolgulu mini ay (id'siz)
  function moonSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M18.6 3.9a11 11 0 1 0 5.6 16.6 9.1 9.1 0 0 1-5.6-16.6Z" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<ellipse cx="11.6" cy="9" rx="2.1" ry="1.3" transform="rotate(-22 11.6 9)"' +
        ' fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Düz dolgulu mini çiçek (id'siz)
  function bloomSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<g stroke="#3E2A1C" stroke-width="1.8" stroke-linejoin="round">' +
        '<circle cx="14" cy="6.6" r="4" fill="#FF8FB0"/>' +
        '<circle cx="21" cy="11.8" r="4" fill="#FF8FB0"/>' +
        '<circle cx="18.4" cy="20" r="4" fill="#FF8FB0"/>' +
        '<circle cx="9.6" cy="20" r="4" fill="#FF8FB0"/>' +
        '<circle cx="7" cy="11.8" r="4" fill="#FF8FB0"/>' +
        '<circle cx="14" cy="13.8" r="4.4" fill="#FFC734"/>' +
      '</g>' +
      '<ellipse cx="12.4" cy="12.2" rx="1.5" ry="1" fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Çayır süs şeridi: çiçekler (aria-hidden dekor)
  function meadowDecorSVG () {
    var xs = [24, 84, 150, 236, 306, 358];
    var cols = ['#FF8FB0', '#FFC734', '#FFFFFF', '#FF8FB0', '#FFC734', '#FFFFFF'];
    var f = '';
    for (var i = 0; i < xs.length; i++) {
      var y = 58 + (i % 3) * 16;
      f += '<path d="M' + xs[i] + ' ' + (y + 16) + 'V' + (y + 4) + '" stroke="#3E9A2F"' +
           ' stroke-width="3" stroke-linecap="round" fill="none"/>' +
           flowerAt(xs[i], y, cols[i], i % 2 ? 0.8 : 1);
    }
    return '<svg viewBox="0 0 390 110" preserveAspectRatio="none"' +
      ' aria-hidden="true" focusable="false">' + f + '</svg>';
  }

  /* ---------- çizim ---------- */
  function render () {
    if (!el) return;
    var s = st();
    var eggs = Math.max(0, s.eggsAvailable | 0);
    var owned = ownedCount();
    var pct = Math.max(0, Math.min(100, Math.round(owned / 30 * 100)));
    var html = '';

    // Manzara katmanı: gök + tepeler + güneş + sticker bulutlar (tamamı dekor)
    html += '<div class="home-sky" aria-hidden="true">' +
              '<div class="home-landscape">' + skyline() + '</div>' +
              '<div class="home-sun"></div>' +
              '<div class="home-cloud c1">' + cloudSVG() + '</div>' +
              '<div class="home-cloud c2">' + cloudSVG() + '</div>' +
            '</div>';

    // Albüm ilerleme şeridi — sticker çip
    html += '<button class="home-progress" data-act="album"' +
              ' aria-label="Albümü aç — Güneş Çayırı ' + owned + '/30">' +
              ic('album', '📔', 'home-progress-ico') +
              '<span class="home-progress-main">' +
                '<span class="home-progress-label">Güneş Çayırı <b>' + owned + '/30</b></span>' +
                '<span class="home-progress-bar">' +
                  '<span class="home-progress-fill" style="width:' + pct + '%"></span>' +
                '</span>' +
              '</span>' +
            '</button>';

    // Yuva sepeti + yumurtalar
    html += '<div class="home-nest-wrap">';
    if (eggs > 0) {
      html += '<p class="home-hint">' + ic('egg', '🥚') +
              '<span>Bir yumurta seç, birlikte çıtlatalım!</span></p>';
    } else {
      html += '<p class="home-hint"><span class="ys-ico" aria-hidden="true">' + moonSVG() +
              '</span><span>Bugünkü yumurtalar çıtlatıldı</span></p>';
    }
    html += '<div class="home-nest">';
    html += '<div class="home-eggs">';
    if (eggs > 0) {
      var shown = Math.min(eggs, 5);
      for (var i = 0; i < shown; i++) {
        html += '<button class="home-egg" style="--i:' + i + '" data-act="egg"' +
                  ' aria-label="Yumurtayı çıtlat">' + eggArt() + '</button>';
      }
      if (eggs > shown) html += '<span class="home-egg-more">+' + (eggs - shown) + '</span>';
    } else {
      html += '<span class="home-nest-empty" aria-hidden="true">' + moonSVG() + '</span>';
    }
    html += '</div>';
    html += '<div class="home-basket" aria-hidden="true">' + basketArt() + '</div>';
    html += '</div></div>';

    // Gün sonu paneli (yumurta bitince)
    if (eggs === 0) {
      var extraLeft = Math.max(0, 2 - (s.extraEggsBought | 0));
      var canAfford = (s.stardust | 0) >= 120;
      html += '<div class="home-dayend">';
      if (extraLeft > 0) {
        html += '<button class="btn btn-primary home-extra" data-act="extra"' +
                  (canAfford ? '' : ' disabled') +
                  ' aria-label="120 yıldız tozuna 1 ek yumurta — kalan hak ' + extraLeft + '/2">' +
                  ic('egg', '🥚') + '<span>+1 Yumurta</span>' +
                  '<span class="home-extra-cost">' + ic('star', '⭐') + '120</span>' +
                  '<span class="home-pips" aria-hidden="true">' +
                    '<i class="pip on"></i><i class="pip' + (extraLeft === 2 ? ' on' : '') + '"></i>' +
                  '</span>' +
                '</button>';
        if (!canAfford) {
          html += '<p class="home-note">' + ic('star', '⭐') +
                  '<span>Yıldız tozu yetersiz — Eşle &amp; Bul oynayıp yıldız toplayabilirsin!</span></p>';
        }
      } else {
        html += '<p class="home-note">' + ic('egg', '🥚') +
                '<span>Bugünlük ek yumurta hakkın doldu (2/2).</span></p>';
      }
      html += '<button class="btn btn-soft home-endday" data-act="endday">' +
                '<span class="ys-ico" aria-hidden="true">' + moonSVG() + '</span>Günü Bitir</button>';
      html += '</div>';
    }

    // Çayır: süs çiçekleri + gezinen Pufiler
    var roam = lastOwnedPufis();
    html += '<div class="home-meadow">';
    html += '<div class="home-flowers" aria-hidden="true">' + meadowDecorSVG() + '</div>';
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
      html += '<p class="home-meadow-hint"><span class="ys-ico" aria-hidden="true">' + bloomSVG() +
              '</span><span>Çayır henüz sessiz… İlk Pufi\'ni bekliyor</span></p>';
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
