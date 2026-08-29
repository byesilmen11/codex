/* Yuvo — Sahne: Yuva ("Gün doğumu çayırı" + Balon Postanesi tezgâhı).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md + docs/v2/06 §2.a, §5.5.
   v2 revizyonu: yuva sepeti "Balon Postanesi tezgâhı"na dönüştü — state.todayEggs
   ambalajlı çizilir (wrapperSVG); İLK tap = eline al, 400ms BASILI TUT = salla
   (shakeRattle; tap fallback: eldeki "Salla!" butonu), eldeyken İKİNCİ tap =
   Yuvo.go('ceremony',{eggIdx}). Kumbara kavanozu tezgâh köşesinde (redeemChocolates).
   Çimen/gezinen Pufi/ilerleme şeridi/gün-sonu paneli mantığı AYNEN korunur.
   Görsel dil: BRAND.md §3 (sticker reçetesi) + §5 Yuva atmosferi. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;        // sahne kök konteyneri
  var timers = [];
  var onState = null;
  var SEQ = 0;          // benzersiz SVG gradyan id sayacı (önek: ysh- ; yi-/yv- başkasının)

  // --- vitrin etkileşim durumu (mount'ta sıfırlanır) ---
  var heldIdx = null;       // eldeki yumurtanın todayEggs index'i (null = elde yok)
  var holdTimer = null;     // 400ms basılı-tut sayacı
  var suppressClick = false;// basılı-tut sonrası gelen click yutulur
  var dropNew = false;      // şölen/ek yumurta sonrası "vitrine düşme" animasyonu

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n, o) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n, o); } catch (e) {} }
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

  function ritual () {
    var r = (Yuvo.data && Yuvo.data.RITUAL) || {};
    return {
      ESIK: (typeof r.KUMBARA_ESIK === 'number') ? r.KUMBARA_ESIK : 15,
      GUNLUK: (typeof r.KUMBARA_GUNLUK === 'number') ? r.KUMBARA_GUNLUK : 1
    };
  }

  function defaultSeri () {
    try {
      if (Yuvo.engine && Yuvo.engine.activeSeries) { var a = Yuvo.engine.activeSeries(); if (a) return a; }
    } catch (e) {}
    var d = (Yuvo.data && Yuvo.data.WRAPPER_SERIES) || null;
    if (d) { for (var k in d) return k; }
    return 'gunesbahcesi';
  }

  // Vitrindeki ambalajlı yumurtalar; eski motor (todayEggs yok) → eggsAvailable'dan türet
  function eggsList () {
    var s = st();
    if (Array.isArray(s.todayEggs)) return s.todayEggs;
    var n = Math.max(0, s.eggsAvailable | 0), out = [];
    for (var i = 0; i < n; i++) out.push({ seri: defaultSeri(), variant: i % 8, golden: null });
    return out;
  }

  function ownedCount (biome) {
    if (Yuvo.engine && Yuvo.engine.ownedCount) { try { return Yuvo.engine.ownedCount(biome); } catch (e) {} }
    var s = st(), n = 0, owned = s.owned || {};
    for (var id in owned) {
      if (!owned[id]) continue;
      var p = Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(id);
      if (p && p.rarity === 'gizli') continue;
      if (biome && p && (p.biome || 'cayir') !== biome) continue;
      n += 1;
    }
    return n;
  }

  // Ambalajlı yumurta sanatı (ambalaj nadirlik SIZDIRMAZ — torn:0, golden yok; §1.3)
  function wrapperArt (egg) {
    egg = egg || {};
    if (Yuvo.art && Yuvo.art.wrapperSVG) {
      try {
        var s = Yuvo.art.wrapperSVG(egg.seri || defaultSeri(), { torn:0, variant: egg.variant | 0 });
        if (s) return s;
      } catch (e) {}
    }
    if (Yuvo.art && Yuvo.art.eggSVG) {
      try { var s2 = Yuvo.art.eggSVG('yaygin', { crack:0 }); if (s2) return s2; } catch (e) {}
    }
    return '<span class="home-art-fallback">🥚</span>';
  }

  function pufiArt (p) {
    if (Yuvo.art && Yuvo.art.pufiSVG) {
      try { var s = Yuvo.art.pufiSVG(p, { mood:'happy' }); if (s) return s; } catch (e) {}
    }
    return '<span class="home-art-fallback">🐣</span>';
  }

  // Sahip olunan son 3-5 Pufi (ekleme sırasına göre sondakiler; aktif biyomdan)
  function lastOwnedPufis () {
    var s = st(), owned = s.owned || {}, biome = s.activeBiome === 'orman' ? 'orman' : 'cayir';
    var out = [];
    for (var id in owned) {
      if (!owned[id]) continue;
      var p = Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(id);
      if (p && (p.biome || 'cayir') === biome) out.push(p);
    }
    return out.slice(-5);
  }

  /* ---------- dekor SVG'leri (düz dolgu; id yalnız gradyan/clip gerekince) ---------- */

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

  // Manzara: önce Yuvo.art.env katmanları (varsa), yoksa yerel fallback.
  // Katmanlar ÜST ÜSTE konumlanmış sarmalayıcılara basılır (.home-env-*):
  // gök üstte, tepeler+güneş+çiçekler alt bantta — orta kuşak boş kalmaz
  // (BRAND §5 "ekranın tamamı kompozisyondur; boş bant yasak").
  function skyline () {
    var env = Yuvo.art && Yuvo.art.env;
    if (env) {
      try {
        var out = '';
        if (env.sky) out += '<div class="home-env home-env-sky">' + (env.sky() || '') + '</div>';
        if (env.clouds) out += '<div class="home-env home-env-clouds">' + (env.clouds() || '') + '</div>';
        if (env.meadow) out += '<div class="home-env home-env-meadow">' + (env.meadow() || '') + '</div>';
        if (out) return out;
      } catch (e) {}
    }
    // fallback'te güneşi CSS .home-sun çizer (env meadow güneşi yok)
    return landscapeSVG() + '<div class="home-sun"></div>';
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

  // Balon Postanesi tezgâhı: bant + ahşap gövde + şenlik bayrakları (sepetin yerine)
  function counterSVG () {
    var gB = uid('ctr'), gT = uid('belt');
    var planks = '';
    for (var x = 56; x <= 244; x += 38) {
      planks += '<path d="M' + x + ' 62 V 112" stroke="#3E2A1C" stroke-width="2.2" opacity=".22"/>';
    }
    var flags = '', fc = ['#FF7C33', '#FFC734', '#8AD9F7', '#FF8FB0'];
    for (var i = 0; i < 6; i++) {
      var fx = 44 + i * 38;
      flags += '<path d="M' + fx + ' 62 L' + (fx + 13) + ' 62 L' + (fx + 6.5) + ' 78 Z"' +
               ' fill="' + fc[i % 4] + '" stroke="#3E2A1C" stroke-width="2"' +
               ' stroke-linejoin="round"/>';
    }
    return '<svg viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet"' +
      ' aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + gB + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#C98A4B"/><stop offset=".55" stop-color="#B77B3F"/>' +
          '<stop offset="1" stop-color="#8E5A2B"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + gT + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#8E5A2B"/><stop offset="1" stop-color="#6E4520"/>' +
        '</linearGradient>' +
      '</defs>' +
      // beyaz hale (sticker reçetesi)
      '<rect x="8" y="30" width="284" height="26" rx="13" fill="none" stroke="#FFFFFF"' +
        ' stroke-width="10"/>' +
      '<rect x="22" y="52" width="256" height="62" rx="14" fill="none" stroke="#FFFFFF"' +
        ' stroke-width="10"/>' +
      // bant (yumurtalar bunun üstünde kayar)
      '<rect x="8" y="30" width="284" height="26" rx="13" fill="url(#' + gT + ')"' +
        ' stroke="#3E2A1C" stroke-width="3.5"/>' +
      '<path d="M24 43 H276" fill="none" stroke="#C98A4B" stroke-width="4"' +
        ' stroke-linecap="round" stroke-dasharray="3 16" class="home-belt-dots"/>' +
      '<circle cx="24" cy="43" r="5.5" fill="#C98A4B" stroke="#3E2A1C" stroke-width="2.4"/>' +
      '<circle cx="276" cy="43" r="5.5" fill="#C98A4B" stroke="#3E2A1C" stroke-width="2.4"/>' +
      // gövde + kalaslar + şenlik bayrakları
      '<rect x="22" y="52" width="256" height="62" rx="14" fill="url(#' + gB + ')"' +
        ' stroke="#3E2A1C" stroke-width="3.5"/>' +
      planks + flags +
      '<ellipse cx="66" cy="60" rx="20" ry="3.4" fill="#FFFFFF" opacity=".5"/>' +
      // çimen tutamları (tezgâh çayıra oturur)
      '<path d="M34 122c2-8 6-12 6-12s1 7-2 13M266 120c-2-8-6-12-6-12s-1 7 2 13"' +
        ' fill="none" stroke="#55B944" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M50 126c1-6 5-10 5-10M250 124c-1-6-5-10-5-10" fill="none"' +
        ' stroke="#8ED94F" stroke-width="5" stroke-linecap="round"/>' +
    '</svg>';
  }

  // Rüzgâr Postası balonu (tezgâh yanında süzülür — dekor)
  function balloonSVG () {
    var g = uid('bln');
    return '<svg viewBox="0 0 60 84" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#FFA94D"/><stop offset=".5" stop-color="#FF7C33"/>' +
        '<stop offset="1" stop-color="#E85C1E"/></linearGradient></defs>' +
      '<path d="M30 4C15 4 6 15 6 28c0 12 10 22 18 28h12c8-6 18-16 18-28C54 15 45 4 30 4Z"' +
        ' fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"/>' +
      '<path d="M30 4C15 4 6 15 6 28c0 12 10 22 18 28h12c8-6 18-16 18-28C54 15 45 4 30 4Z"' +
        ' fill="url(#' + g + ')" stroke="#3E2A1C" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M30 4c-6 0-9 11-9 24 0 11 4 21 6 28M30 4c6 0 9 11 9 24 0 11-4 21-6 28"' +
        ' fill="none" stroke="#FFC734" stroke-width="2.4" opacity=".9"/>' +
      '<path d="M24 56l-3 10M36 56l3 10" stroke="#3E2A1C" stroke-width="2" fill="none"/>' +
      '<rect x="20" y="65" width="20" height="14" rx="4" fill="#C98A4B"' +
        ' stroke="#3E2A1C" stroke-width="2.4"/>' +
      '<path d="M20 70h20" stroke="#3E2A1C" stroke-width="1.6" opacity=".4"/>' +
      '<ellipse cx="20" cy="16" rx="6" ry="3.4" transform="rotate(-28 20 16)"' +
        ' fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Çikolata Kumbarası kavanozu (cam + doluluk; okumasız görülür — goal-gradient)
  function jarSVG (fill01) {
    var g = uid('jar'), clip = uid('jarclip');
    var h = Math.round(52 * Math.max(0, Math.min(1, fill01)));
    var top = 78 - h;
    var balls = '';
    if (h > 6) {
      balls = '<circle cx="26" cy="' + (top + 3) + '" r="5" fill="#8A5A2B"/>' +
              '<circle cx="38" cy="' + (top + 1) + '" r="5.5" fill="#6E4520"/>' +
              '<circle cx="48" cy="' + (top + 4) + '" r="4.6" fill="#8A5A2B"/>';
    }
    return '<svg viewBox="0 0 72 92" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFDD66"/><stop offset="1" stop-color="#F2A400"/>' +
        '</linearGradient>' +
        '<clipPath id="' + clip + '"><rect x="15" y="24" width="42" height="56" rx="12"/></clipPath>' +
      '</defs>' +
      '<rect x="12" y="20" width="48" height="62" rx="14" fill="none" stroke="#FFFFFF"' +
        ' stroke-width="8"/>' +
      '<rect x="12" y="20" width="48" height="62" rx="14" fill="#EAF7FF" opacity=".85"/>' +
      '<g clip-path="url(#' + clip + ')">' +
        '<rect x="15" y="' + top + '" width="42" height="' + (h + 4) + '" fill="#7A4A21"/>' +
        balls +
      '</g>' +
      '<rect x="12" y="20" width="48" height="62" rx="14" fill="none" stroke="#3E2A1C"' +
        ' stroke-width="3"/>' +
      '<rect x="16" y="6" width="40" height="15" rx="7" fill="url(#' + g + ')"' +
        ' stroke="#3E2A1C" stroke-width="3"/>' +
      '<ellipse cx="24" cy="32" rx="4" ry="12" transform="rotate(14 24 32)"' +
        ' fill="#FFFFFF" opacity=".65"/>' +
    '</svg>';
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

  // Mini zil (Salla! butonu glifi — çayır çıngıltısı; id'siz)
  function bellSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M14 3.6c-4.6 0-7.4 3.6-7.4 8.2 0 4.2-1.6 6.4-2.8 7.6h20.4' +
        'c-1.2-1.2-2.8-3.4-2.8-7.6 0-4.6-2.8-8.2-7.4-8.2Z" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M11 22.6a3 3 0 0 0 6 0Z" fill="#F2A400" stroke="#3E2A1C" stroke-width="2"' +
        ' stroke-linejoin="round"/>' +
      '<ellipse cx="10.8" cy="8.6" rx="2" ry="1.2" transform="rotate(-24 10.8 8.6)"' +
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
    var list = eggsList();
    var eggs = list.length;
    if (heldIdx !== null && (heldIdx < 0 || heldIdx >= eggs)) heldIdx = null;
    var holding = heldIdx !== null;
    var biome = s.activeBiome === 'orman' ? 'orman' : 'cayir';
    el.classList.toggle('orman', biome === 'orman');
    var BIO = (Yuvo.data && Yuvo.data.BIOMES) || {};
    var bioAd = (BIO[biome] && BIO[biome].ad) || 'Güneş Çayırı';
    var owned = ownedCount(biome);
    var pct = Math.max(0, Math.min(100, Math.round(owned / 30 * 100)));
    var R = ritual();
    var choc = Math.max(0, s.chocolates | 0);
    var jarReady = choc >= R.ESIK && (s.kumbaraToday | 0) < R.GUNLUK;
    // Kiler: bekleyen sürpriz + günlük hak (çocuk dili — fiyat/mağaza dili YOK)
    var kilerTavan = ((Yuvo.data.STORE_LIMITS && Yuvo.data.STORE_LIMITS.kilerGunluk) || 5) +
      (s.parent && s.parent.clubActive ? ((Yuvo.data.CLUB && Yuvo.data.CLUB.kilerEk) || 1) : 0);
    var kilerHak = s.kiler && (s.kiler.adet | 0) > 0 && (s.kiler.bugunAcilan | 0) < kilerTavan;
    var html = '';

    // Manzara katmanı: gök + tepeler + güneş + sticker bulutlar (tamamı dekor;
    // güneş env meadow katmanında, fallback'te skyline() CSS güneşini basar)
    html += '<div class="home-sky" aria-hidden="true">' +
              '<div class="home-landscape">' + skyline() + '</div>' +
              '<div class="home-cloud c1">' + cloudSVG() + '</div>' +
              '<div class="home-cloud c2">' + cloudSVG() + '</div>' +
            '</div>';

    // Albüm ilerleme şeridi — sticker çip (aktif biyomun sayacı)
    html += '<button class="home-progress" data-act="album"' +
              ' aria-label="Albümü aç — ' + bioAd + ' ' + owned + '/30">' +
              ic('album', '📔', 'home-progress-ico') +
              '<span class="home-progress-main">' +
                '<span class="home-progress-label">' + bioAd + ' <b>' + owned + '/30</b></span>' +
                '<span class="home-progress-bar">' +
                  '<span class="home-progress-fill" style="width:' + pct + '%"></span>' +
                '</span>' +
              '</span>' +
            '</button>';

    // Kenar düğmeleri: Ebeveyn (gri, göze batmaz) + biyom kapısı + Şako Saklambaç
    html += '<div class="home-side">';
    html += '<button class="home-side-btn home-parent-btn" data-act="parent"' +
              ' aria-label="Ebeveyn paneli"><span aria-hidden="true">👨‍👩‍👧</span>' +
              '<small>Ebeveyn</small></button>';
    if (s.ormanAcik) {
      var hedefAd = biome === 'orman' ? 'Güneş Çayırı' : 'Fısıltı Ormanı';
      html += '<button class="home-side-btn home-biome-btn" data-act="biome"' +
                ' aria-label="' + hedefAd + '\'na geç">' +
                '<span aria-hidden="true">' + (biome === 'orman' ? '🌻' : '🌲') + '</span>' +
                '<small>' + (biome === 'orman' ? 'Çayır' : 'Orman') + '</small></button>';
      if (biome === 'orman') {
        html += '<button class="home-side-btn home-sako-btn' + (s.sakoHidden ? ' alert' : '') + '"' +
                  ' data-act="sako" aria-label="Şako Saklambaç">' +
                  '<span aria-hidden="true">🪶</span><small>Şako</small></button>';
      }
    }
    html += '</div>';

    // Balon Postanesi tezgâhı + ambalajlı yumurtalar + kumbara
    html += '<div class="home-nest-wrap">';
    if (holding) {
      html += '<p class="home-hint"><span class="ys-ico" aria-hidden="true">' + bellSVG() +
              '</span><span>Bir daha dokun — töreni başlat!</span></p>';
    } else if (eggs > 0) {
      html += '<p class="home-hint">' + ic('egg', '🥚') +
              '<span>Postan geldi! Bir yumurta seç bakalım…</span></p>';
    } else {
      html += '<p class="home-hint"><span class="ys-ico" aria-hidden="true">' + moonSVG() +
              '</span><span>Bugünkü yumurtalar açıldı</span></p>';
    }
    html += '<div class="home-nest home-counter-zone' + (holding ? ' holding' : '') + '">';
    html += '<div class="home-balloon" aria-hidden="true">' + balloonSVG() + '</div>';
    html += '<div class="home-eggs' + (holding ? ' holding' : '') + '">';
    if (eggs > 0) {
      var shown = Math.min(eggs, 5);
      for (var i = 0; i < shown; i++) {
        var cls = 'home-egg';
        if (heldIdx === i) cls += ' held';
        else if (holding) cls += ' faded';
        if (dropNew && i === shown - 1) cls += ' drop';
        var lbl = (heldIdx === i) ? 'Yumurtayı aç — töreni başlat' : 'Yumurtayı eline al';
        html += '<button class="' + cls + '" style="--i:' + i + '" data-act="egg"' +
                  ' data-idx="' + i + '" aria-label="' + lbl + '">' +
                  '<span class="home-egg-art">' + wrapperArt(list[i]) + '</span>' +
                '</button>';
      }
      if (eggs > shown) html += '<span class="home-egg-more">+' + (eggs - shown) + '</span>';
    } else {
      html += '<span class="home-nest-empty" aria-hidden="true">' + moonSVG() + '</span>';
    }
    html += '</div>';
    html += '<div class="home-basket home-counter" aria-hidden="true">' + counterSVG() + '</div>';
    // Kumbara kavanozu — tezgâh köşesi (doluluk okumasız görülür)
    html += '<button class="home-jar' + (jarReady ? ' ready' : '') + '" data-act="jar"' +
              ' aria-label="Çikolata Kumbarası — ' + choc + '/' + R.ESIK + '">' +
              jarSVG(choc / R.ESIK) +
              '<b class="home-jar-count">' + choc + '/' + R.ESIK + '</b>' +
            '</button>';
    // Kiler sürprizi — çocuk dilinde "posta" (fiyat/mağaza dili YOK; v2·04 kural d)
    if (kilerHak) {
      html += '<button class="home-kiler" data-act="kiler"' +
                ' aria-label="Sürpriz yumurtayı sepete al">' +
                ic('egg', '🥚') + '<span>Sürpriz posta!</span></button>';
    }
    // Eldeyken: Salla! (basılı-tut jestinin tap fallback'i) + Geri Koy
    if (holding) {
      html += '<div class="home-held-actions">' +
                '<button class="btn btn-soft home-held-btn" data-act="shake"' +
                  ' aria-label="Yumurtayı salla ve dinle">' +
                  '<span class="ys-ico" aria-hidden="true">' + bellSVG() + '</span>Salla!</button>' +
                '<button class="btn btn-soft home-held-btn" data-act="putback"' +
                  ' aria-label="Yumurtayı geri koy">' +
                  ic('back', '↩') + 'Geri Koy</button>' +
              '</div>';
    }
    html += '</div></div>';
    dropNew = false;

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
    if (el.querySelector('.home-egg.drop')) {
      later(function () {
        var d = el && el.querySelector('.home-egg.drop');
        if (d) d.classList.remove('drop');
      }, 800);
    }
  }

  /* ---------- vitrin jestleri ---------- */
  function clearHold () {
    if (holdTimer !== null) { clearTimeout(holdTimer); holdTimer = null; }
  }

  function putBack (silent) {
    if (heldIdx === null) return;
    heldIdx = null;
    if (!silent) { play('click'); render(); }
  }

  // Salla: eldeki yumurta çıngırdar — ses aileyi fısıldar, nadirliği asla (§1.3)
  function doShake () {
    play('shakeRattle', { family:'cayir' });  // proto tek aile: çayır çıngıltısı
    var art = el && el.querySelector('.home-egg.held .home-egg-art');
    if (art) {
      art.classList.remove('shake');
      void art.offsetWidth; // animasyonu baştan başlat
      art.classList.add('shake');
      later(function () {
        var a = el && el.querySelector('.home-egg.held .home-egg-art');
        if (a) a.classList.remove('shake');
      }, 700);
    }
  }

  // 400ms basılı tut = salla (jest; tap fallback'i eldeki "Salla!" butonu)
  function handleDown (e) {
    suppressClick = false;
    clearHold();
    var b = e.target && e.target.closest ? e.target.closest('.home-egg[data-idx]') : null;
    if (!b) return;
    var idx = parseInt(b.getAttribute('data-idx'), 10);
    if (isNaN(idx)) return;
    holdTimer = setTimeout(function () {
      holdTimer = null;
      suppressClick = true; // basılı-tut sonrası click "aç" sayılmasın
      if (heldIdx !== idx) { heldIdx = idx; play('crinkle'); render(); }
      doShake();
    }, 400);
  }
  function handleUp () { clearHold(); }

  /* ---------- etkileşim (delege tek dinleyici) ---------- */
  function handleClick (e) {
    if (suppressClick) { suppressClick = false; return; }
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) {
      // Dışarı tap: eldeki yumurta geri konur
      if (heldIdx !== null) putBack();
      return;
    }
    var act = b.getAttribute('data-act');

    if (act === 'egg') {
      var idx = parseInt(b.getAttribute('data-idx'), 10);
      if (isNaN(idx)) idx = 0;
      if (heldIdx === idx) {
        // İkinci tap: tören başlar (eggIdx ile — vitrindeki O yumurta açılır)
        heldIdx = null;
        play('tap');
        if (Yuvo.go) Yuvo.go('ceremony', { eggIdx: idx });
      } else {
        // İlk tap: eline al (crinkle — elde çevirme hissi); başka yumurta eldeyse değiştirir
        heldIdx = idx;
        play('crinkle');
        render();
      }
    } else if (act === 'shake') {
      doShake();
    } else if (act === 'putback') {
      putBack();
    } else if (act === 'jar') {
      putBack(true);
      var R = ritual();
      var ok = !!(Yuvo.engine && Yuvo.engine.redeemChocolates && Yuvo.engine.redeemChocolates());
      if (ok) {
        play('jarClink');
        play('fanfare');
        dropNew = true; // şölen yumurtası vitrine düşer animasyonu
        toast('Çikolata Şöleni! Tezgâha yeni bir yumurta kondu!');
      } else {
        play('jarClink');
        var s2 = st();
        if ((s2.chocolates | 0) >= R.ESIK && (s2.kumbaraToday | 0) >= R.GUNLUK) {
          toast('Bugünkü şölen yapıldı — kumbara yarını bekliyor.');
        } else {
          toast('Kumbarada ' + Math.max(0, s2.chocolates | 0) + ' çikolata var — ' +
                R.ESIK + ' olunca şölen!');
        }
      }
      render();
    } else if (act === 'album') {
      putBack(true);
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
      putBack(true);
      var ok2 = !!(Yuvo.engine && Yuvo.engine.buyExtraEgg && Yuvo.engine.buyExtraEgg());
      if (ok2) {
        play('star');
        dropNew = true;
        toast('Ek yumurta tezgâha kondu!');
      } else {
        var s3 = st();
        if ((s3.extraEggsBought | 0) >= 2) toast('Bugünlük ek yumurta hakkı doldu.');
        else toast('Yıldız tozu yetersiz — 120 yıldız gerekiyor.');
      }
      render();
    } else if (act === 'endday') {
      putBack(true);
      play('chime');
      var yeniGun = function () {
        if (Yuvo.engine && Yuvo.engine.newDay) Yuvo.engine.newDay();
        toast('Yeni gün! Rüzgâr Postası 3 yumurta bıraktı.');
        render();
      };
      // Luna'nın günbatımı ritüeli (docs/v2/04 §1 14:30) — yoksa doğrudan yeni gün
      if (Yuvo.scenes.intro && Yuvo.scenes.intro.playDusk) Yuvo.scenes.intro.playDusk(yeniGun);
      else yeniGun();
    } else if (act === 'kiler') {
      putBack(true);
      var okK = !!(Yuvo.engine && Yuvo.engine.drawFromKiler && Yuvo.engine.drawFromKiler());
      if (okK) {
        play('pop');
        dropNew = true;
        toast('Sepete bir sürpriz yumurta düştü!');
      } else {
        toast('Bugünlük sürprizler tamam — yarın devam!');
      }
      render();
    } else if (act === 'parent') {
      putBack(true);
      play('click');
      if (Yuvo.go) Yuvo.go('parent');
    } else if (act === 'biome') {
      putBack(true);
      var s4 = st();
      var hedef = (s4.activeBiome === 'orman') ? 'cayir' : 'orman';
      if (Yuvo.engine && Yuvo.engine.setBiome && Yuvo.engine.setBiome(hedef)) {
        play('page');
        var B2 = (Yuvo.data && Yuvo.data.BIOMES) || {};
        toast(((B2[hedef] && B2[hedef].ad) || hedef) + '\'na hoş geldin!');
      }
      render();
    } else if (act === 'sako') {
      putBack(true);
      play('click');
      if (Yuvo.go) Yuvo.go('sako');
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.home = {
    mount: function (rootEl) {
      heldIdx = null;
      suppressClick = false;
      dropNew = false;
      el = document.createElement('div');
      el.className = 'home-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      el.addEventListener('pointerdown', handleDown);
      window.addEventListener('pointerup', handleUp);
      window.addEventListener('pointercancel', handleUp);
      onState = function () { render(); };
      document.addEventListener('yuvo:state', onState);
      render();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      clearHold();
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      if (onState) { document.removeEventListener('yuvo:state', onState); onState = null; }
      if (el) {
        el.removeEventListener('click', handleClick);
        el.removeEventListener('pointerdown', handleDown);
        if (el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }
      heldIdx = null;
    }
  };
})();
