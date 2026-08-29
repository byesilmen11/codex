/* =====================================================================
   YUVO RİTÜEL SANATI — ritual-svg.js  (sahip: art-audio ajanı)
   =====================================================================
   v2·06 "Gerçek Yumurta Ritüeli" görsel seti — §5.2 API'leri birebir:

     Yuvo.art.wrapperSVG(seriId, {torn:0..3, golden:false, variant:0..7})
     Yuvo.art.foilScrapSVG(seriId, {golden})
     Yuvo.art.chocolateSVG({bites:0..4})
     Yuvo.art.capsuleSVG(tier, {method:'burgu'|'cekic'|'firlat'|'sihir', stage:0|1|2})
     Yuvo.art.toolSVG(toolId)
     Yuvo.art.foilStampSVG(seriId, variant, {golden, count})

   Stil: pufi-svg.js baş kılavuzu (şeker-vinil sticker, INK kontur, beyaz
   hale, ışık sol-üstten). AMBALAJ ŞABLONU §2.b: A marka kilidi (üst %12) /
   B seri paneli (~%50, desen: papatya|yaprak|dalga|yildiz|kristal|fener) /
   C aile bandı (%15, proto tek aile: Çayır çan-çiçeği) / D yırtma kulakçığı
   + perforasyon / E alt bilgi. A/C/D sabittir; golden tüm bölgelere binen
   tek istisnadır. Ambalaj NADİRLİK KODLAMAZ (§1.3) — nadirlik yalnız
   kapsülün iç ışıma halkasında (capsuleSVG) belirir.

   Kapsül = "Tomurcuk Kapsülü": armut/tomurcuk form, mat turkuaz gövde +
   mercan kapak + yaprak sapı. Kinder'ın sarı iki parçalı kapsül ticari
   görünümü BİLİNÇLİ olarak taklit edilmez (§2.d hukuk notu).

   Teknik: hepsi string döndürür, DETERMİNİSTİK (seed = girdi hash'i);
   gradient/clip/filter id önekimiz 'yr-<ad>-<SEQ>' (yv-/yi-/ye- rezerve,
   dokunulmaz); üretici başına çıktı < 8KB. Dış kaynak yok.
   ===================================================================== */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  var Y = window.Yuvo;
  Y.art = Y.art || {};

  var INK = '#3E2A1C';   // pufi-svg ile aynı kontur mürekkebi (BRAND --line)
  var SIL = '#4A2E1D';   // silüet/gölge dolgusu (BRAND --ink)
  var LW  = 3.5, LW2 = 2.4;
  var SEQ = 0;           // 'yr-' id sayacı — sayfada çift basımda çakışma olmaz

  /* ---------- temel yardımcılar (pufi-svg desenine paralel, yerel kopya) ---------- */

  function N (x) { return Math.round(x * 100) / 100; }

  function E (name, attrs, inner) {
    var s = '<' + name;
    for (var k in attrs) {
      var v = attrs[k];
      if (v === null || v === undefined || v === '') continue;
      s += ' ' + k + '="' + v + '"';
    }
    return (inner === undefined || inner === null) ? s + '/>' : s + '>' + inner + '</' + name + '>';
  }

  function hash (s) {
    s = String(s);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  function seeded (a) { // mulberry32
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function sanit (s) { return String(s).replace(/[^a-zA-Z0-9_-]/g, ''); }
  function uid (name) { return 'yr-' + sanit(name) + '-' + (SEQ++); }

  function hx (c) {
    c = String(c).replace('#', '');
    if (c.length === 3) c = c.charAt(0) + c.charAt(0) + c.charAt(1) + c.charAt(1) + c.charAt(2) + c.charAt(2);
    return [parseInt(c.slice(0, 2), 16) || 0, parseInt(c.slice(2, 4), 16) || 0, parseInt(c.slice(4, 6), 16) || 0];
  }
  function mixc (a, b, t) {
    var A = hx(a), B = hx(b), o = '#', i, v;
    for (i = 0; i < 3; i++) { v = Math.round(A[i] + (B[i] - A[i]) * t); o += ('0' + v.toString(16)).slice(-2); }
    return o;
  }
  function lum (c) { var v = hx(c); return v[0] * 0.299 + v[1] * 0.587 + v[2] * 0.114; }

  function sp4 (x, y, s, col, op) { // 4 uçlu ışıltı
    return E('path', { d: 'M' + N(x) + ' ' + N(y - s) +
      ' Q' + N(x + s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x + s) + ' ' + N(y) +
      ' Q' + N(x + s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x) + ' ' + N(y + s) +
      ' Q' + N(x - s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x - s) + ' ' + N(y) +
      ' Q' + N(x - s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x) + ' ' + N(y - s) + ' Z',
      fill: col, opacity: op != null ? op : 0.9 });
  }

  function svgTag (vb, defs, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" aria-hidden="true">' +
           (defs ? '<defs>' + defs + '</defs>' : '') + inner + '</svg>';
  }

  function stkFilter (u, r) { // beyaz sticker halesi (pufi-svg reçetesi)
    return '<filter id="' + u + '-stk" x="-20%" y="-20%" width="140%" height="140%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="' + (r || 2.6) + '" result="yrd"/>' +
      '<feFlood flood-color="#FFFFFF"/>' +
      '<feComposite in2="yrd" operator="in" result="yrh"/>' +
      '<feMerge><feMergeNode in="yrh"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  }

  var FONT = "'Baloo 2','Nunito','Trebuchet MS',sans-serif";
  function txt (x, y, size, fill, content, o) {
    o = o || {};
    return E('text', { x: N(x), y: N(y), 'font-family': FONT, 'font-size': N(size),
      'font-weight': 800, fill: fill, 'text-anchor': 'middle',
      'letter-spacing': o.ls != null ? o.ls : null, opacity: o.op != null ? o.op : null }, content);
  }

  /* ---------- veri erişimi (wrappers.js yüklüyse ondan; yoksa §5.2 birebir yedek) ---------- */

  var SERI_FB = {
    gunesbahcesi:   { ad:'Güneş Bahçesi',     renk1:'#F6B93B', renk2:'#F8E3A1', desen:'papatya' },
    masalormani:    { ad:'Masal Ormanı',      renk1:'#2E6B3C', renk2:'#C9A94E', desen:'yaprak'  },
    sedefdalgalar:  { ad:'Sedef Dalgalar',    renk1:'#4FB8D8', renk2:'#EDE7F6', desen:'dalga'   },
    yildiztozu:     { ad:'Yıldız Tozu Gecesi',renk1:'#28356B', renk2:'#C7CBE8', desen:'yildiz'  },
    karisiltisi:    { ad:'Kar Işıltısı',      renk1:'#8FD3E8', renk2:'#FFFFFF', desen:'kristal' },
    senlikfenerleri:{ ad:'Şenlik Fenerleri',  renk1:'#D9483B', renk2:'#F2C14E', desen:'fener'   }
  };
  var RAR_FB = { yaygin:'#9AA5B1', azbulunur:'#58B368', nadir:'#4FB8D8',
                 destansi:'#B266E8', efsanevi:'#F2A61B', gizli:'#5C4A9E' };

  function seriDef (id) {
    var t = (Y.data && Y.data.WRAPPER_SERIES) || {};
    return t[id] || SERI_FB[id] || SERI_FB.gunesbahcesi;
  }
  function rarRenk (tier) {
    var R = Y.data && Y.data.RARITIES;
    return (R && R[tier] && R[tier].renk) || RAR_FB[tier] || RAR_FB.yaygin;
  }

  var GOLD = { renk1:'#F2C14E', renk2:'#FFF0C2', deep:'#B8811C', hi:'#FFE9A8' };

  // Seri paleti: golden tüm bölgelerin üstüne binen tek istisna (§2.b)
  function pal (seriId, golden) {
    var s = seriDef(seriId);
    var r1 = golden ? GOLD.renk1 : s.renk1;
    var r2 = golden ? GOLD.renk2 : s.renk2;
    var deep = golden ? GOLD.deep : mixc(s.renk1, '#4A2E1D', 0.32);
    var dark = lum(r1) < 120;
    return {
      ad: s.ad, desen: s.desen, r1: r1, r2: r2, deep: deep,
      light: mixc(r2, '#FFFFFF', 0.3),
      mA: dark ? r2 : deep,                       // desen ana rengi
      mB: dark ? mixc(r2, '#FFFFFF', 0.6) : '#FFFFFF', // desen açık rengi
      etxt: dark ? '#FFF4DC' : deep,
      golden: !!golden
    };
  }

  /* ---------- seri desen motifleri (defs'te 1 kez, <use> ile basılır) ---------- */

  function motifDef (desen, mA, mB) { // orijinde ~6 birim yarıçaplı motif
    var s = '', i, a;
    if (desen === 'yaprak') {
      s = E('path', { d: 'M0 -6 Q5.2 -1.6 0 6 Q-5.2 -1.6 0 -6 Z', fill: mA }) +
          E('path', { d: 'M0 -4 L0 4', stroke: mB, 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.8 });
    } else if (desen === 'dalga') {
      s = E('path', { d: 'M-7 -1 Q-3.5 -4.6 0 -1 Q3.5 2.6 7 -1', stroke: mA, 'stroke-width': 1.9,
            fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M-5.4 3 Q-2.7 0.4 0 3 Q2.7 5.6 5.4 3', stroke: mB, 'stroke-width': 1.4,
            fill: 'none', 'stroke-linecap': 'round', opacity: 0.85 });
    } else if (desen === 'yildiz') {
      s = sp4(0, 0, 6, mB, 0.95) + E('circle', { cx: 3.6, cy: -3.8, r: 1.1, fill: mA, opacity: 0.9 });
    } else if (desen === 'kristal') {
      s = E('path', { d: 'M0 -6 L4.2 0 L0 6 L-4.2 0 Z', fill: mA }) +
          E('path', { d: 'M0 -6 L0 6 M-4.2 0 L4.2 0', stroke: mB, 'stroke-width': 0.8,
            fill: 'none', opacity: 0.85 });
    } else if (desen === 'fener') {
      s = E('rect', { x: -3.4, y: -4, width: 6.8, height: 8, rx: 2.7, fill: mA }) +
          E('rect', { x: -1.7, y: -5.8, width: 3.4, height: 2, rx: 0.9, fill: mB }) +
          E('path', { d: 'M0 4 L0 6.4', stroke: mB, 'stroke-width': 1, 'stroke-linecap': 'round' }) +
          E('circle', { cx: 0, cy: 0, r: 1.7, fill: mB, opacity: 0.95 });
    } else { // papatya (varsayılan)
      for (i = 0; i < 5; i++) {
        a = -90 + i * 72;
        s += E('ellipse', { cx: 0, cy: -3.9, rx: 1.9, ry: 3.1, fill: mB, opacity: 0.95,
              transform: 'rotate(' + a + ' 0 0)' });
      }
      s += E('circle', { cx: 0, cy: 0, r: 2.1, fill: mA });
    }
    return s;
  }

  // Varyant köşe rozeti glifleri (0..7): benek/yıldız/kalp/hilal/elmas/çiçek/halka/damla
  function badgeGlyph (v, col) {
    v = ((v | 0) % 8 + 8) % 8;
    switch (v) {
      case 0: return E('circle', { cx: 0, cy: 0, r: 2.4, fill: col });
      case 1: return sp4(0, 0, 3.4, col, 1);
      case 2: return E('path', { d: 'M0 3.4 C-4.4 0.4 -3 -3.4 0 -1.2 C3 -3.4 4.4 0.4 0 3.4 Z', fill: col });
      case 3: return E('path', { d: 'M0.8 -3.2 A3.3 3.3 0 1 0 0.8 3.2 A4.3 4.3 0 0 1 0.8 -3.2 Z', fill: col });
      case 4: return E('path', { d: 'M0 -3.2 L2.6 0 L0 3.2 L-2.6 0 Z', fill: col });
      case 5: return E('circle', { cx: 0, cy: -2.1, r: 1.3, fill: col }) +
                     E('circle', { cx: 2, cy: 1.1, r: 1.3, fill: col }) +
                     E('circle', { cx: -2, cy: 1.1, r: 1.3, fill: col });
      case 6: return E('circle', { cx: 0, cy: 0, r: 2.5, fill: 'none', stroke: col, 'stroke-width': 1.5 });
      default: return E('path', { d: 'M0 -3.4 Q2.8 -0.4 2.8 1 A2.8 2.8 0 0 1 -2.8 1 Q-2.8 -0.4 0 -3.4 Z', fill: col });
    }
  }

  /* ---------- ortak geometri ---------- */

  var EGG_D = 'M60 13 C82 13 96 41 96 67 C96 90 80 106 60 106 C40 106 24 90 24 67 C24 41 38 13 60 13 Z';

  function ground (cy, rx, ry, op) {
    return E('ellipse', { cx: 60, cy: cy || 107.5, rx: rx || 26, ry: ry || 4.4, fill: SIL, opacity: op || 0.13 });
  }

  // Zigzag yırtık sınırı: nokta listesi (dash + yırtık kenar + clip aynı noktaları kullanır)
  function zigPts (ya, yb, rnd) {
    var pts = [], n = 9, i, t;
    for (i = 0; i <= n; i++) {
      t = i / n;
      pts.push([N(16 + 88 * t), N(ya + (yb - ya) * t + (i % 2 ? 2.7 : -2.7) + (rnd() * 1.6 - 0.8))]);
    }
    return pts;
  }
  function ptsPath (pts) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) d += ' L' + pts[i][0] + ' ' + pts[i][1];
    return d;
  }

  /* ---------- çikolata gövdesi (wrapper altı + chocolateSVG ortak) ---------- */

  function chocDefs (u) { // sıcak süt çikolatası (soğuk gri-kahve yasak — BRAND "doygun")
    return '<radialGradient id="' + u + '-cg" cx="0.36" cy="0.28" r="1.05">' +
      '<stop offset="0" stop-color="#B57C48"/><stop offset="0.55" stop-color="#8A5A32"/>' +
      '<stop offset="1" stop-color="#5C3A1E"/></radialGradient>';
  }
  function chocBody (u) { // Yuvo güneş kabartmalı mat kakao yumurta (kontursuz iç içerik hariç)
    var s = E('path', { d: EGG_D, fill: 'url(#' + u + '-cg)', stroke: INK,
      'stroke-width': LW, 'stroke-linejoin': 'round' });
    var i, a, rays = '';
    for (i = 0; i < 8; i++) {
      a = i * Math.PI / 4;
      rays += E('path', { d: 'M' + N(60 + Math.cos(a) * 12.5) + ' ' + N(46 + Math.sin(a) * 12.5) +
        ' L' + N(60 + Math.cos(a) * 17) + ' ' + N(46 + Math.sin(a) * 17),
        stroke: '#5C3A22', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.55 });
    }
    s += rays;
    s += E('circle', { cx: 60, cy: 46, r: 10.5, fill: 'none', stroke: '#5C3A22', 'stroke-width': 2.2, opacity: 0.55 });
    s += E('circle', { cx: 59, cy: 45, r: 10.5, fill: 'none', stroke: '#B98055', 'stroke-width': 1.3, opacity: 0.5 });
    s += E('circle', { cx: 60, cy: 46, r: 4, fill: '#5C3A22', opacity: 0.4 });
    // üst-solda belirgin tek gloss elipsi (iştah = parlaklık) + alt yansıma
    s += E('ellipse', { cx: 46, cy: 35, rx: 7.5, ry: 12.5, fill: '#FFFFFF', opacity: 0.35,
      transform: 'rotate(24 46 35)' });
    s += E('ellipse', { cx: 60, cy: 97, rx: 15, ry: 4.6, fill: '#C08A5F', opacity: 0.3 });
    return s;
  }

  /* =====================================================================
     1) wrapperSVG — A-E bölgeli folyo; torn 0-3 şerit soyulma; golden
     ===================================================================== */

  Y.art.wrapperSVG = function (seriId, opts) {
    opts = opts || {};
    var torn = Math.max(0, Math.min(3, opts.torn | 0));
    var v = Math.max(0, Math.min(7, opts.variant | 0));
    var P = pal(seriId, opts.golden);
    var u = uid('wrap-' + seriId);
    var rnd = seeded(hash('wrap:' + seriId + ':' + v));
    var defs = stkFilter(u), inner = ground(), i;

    var zig1 = zigPts(41, 33, rnd), zig2 = zigPts(66, 58, rnd);
    defs += chocDefs(u);
    defs += '<clipPath id="' + u + '-e"><path d="' + EGG_D + '"/></clipPath>';
    defs += '<linearGradient id="' + u + '-f" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + P.light + '"/>' +
      '<stop offset="0.45" stop-color="' + P.r1 + '"/>' +
      '<stop offset="1" stop-color="' + P.deep + '"/></linearGradient>';
    defs += '<g id="' + u + '-mo">' + motifDef(P.desen, P.mA, P.mB) + '</g>';
    defs += '<g id="' + u + '-bell">' +
      E('path', { d: 'M-2.9 1.6 Q-2.9 -2.6 0 -2.6 Q2.9 -2.6 2.9 1.6 Z', fill: '#FFC734',
        stroke: '#8E5A2B', 'stroke-width': 0.9, 'stroke-linejoin': 'round' }) +
      E('circle', { cx: 0, cy: 2.3, r: 0.9, fill: '#8E5A2B' }) + '</g>';

    if (torn >= 3) { // tam soyulma: yalnız çikolata (folyo sahnede parça olarak düşmüştür)
      inner += '<g filter="url(#' + u + '-stk)">' + chocBody(u) + '</g>';
      return svgTag('0 0 120 120', defs, inner);
    }

    var body = '';
    if (torn > 0) body += E('g', { 'clip-path': 'url(#' + u + '-e)' }, chocBody(u));

    /* --- folyo içeriği (tam çizilir; kalan-şerit clip'i üstte) --- */
    var f = E('path', { d: EGG_D, fill: 'url(#' + u + '-f)' });
    // B · SERİ PANELİ (~%50): pane yıkaması + motifler + köşe rozeti
    f += E('rect', { x: 14, y: 25.5, width: 92, height: 42.5, fill: P.r2, opacity: 0.32 });
    f += '<use href="#' + u + '-mo" transform="translate(60 45.5) scale(2.05) rotate(' + N(v * 6 - 21) + ')"/>';
    var ANG = [16, 82, 152, 214, 288];
    for (i = 0; i < 5; i++) {
      var a = (ANG[i] + rnd() * 18) * Math.PI / 180;
      var rr = 20 + rnd() * 5;
      f += '<use href="#' + u + '-mo" transform="translate(' + N(60 + Math.cos(a) * rr) + ' ' +
           N(46 + Math.sin(a) * rr * 0.82) + ') scale(' + N(0.82 + rnd() * 0.3) + ')" opacity="' +
           (i % 2 ? 0.72 : 0.9) + '"/>';
    }
    if (torn === 0) { // üst şerit yırtılınca A bölgesi + rozet zaten clip dışı kalır — çizme
      f += E('g', { transform: 'translate(87 30.5)' },
        E('circle', { cx: 0, cy: 0, r: 5.2, fill: '#FFFFFF', opacity: 0.92 }) +
        E('circle', { cx: 0, cy: 0, r: 5.2, fill: 'none', stroke: P.deep, 'stroke-width': 1.4 }) +
        badgeGlyph(v, P.deep));
      // A · MARKA KİLİDİ (üst %12, SABİT): koyu taç bandı + yumurta amblemi + logotip
      f += E('path', { d: 'M24 13 L96 13 L96 25.5 L24 25.5 Z', fill: P.deep, opacity: 0.96 });
      f += E('g', { transform: 'translate(60 17.8) scale(0.82)' },
        E('path', { d: 'M0 -4 C2.8 -4 4 -1.2 4 0.9 C4 3 2.2 4.2 0 4.2 C-2.2 4.2 -4 3 -4 0.9 C-4 -1.2 -2.8 -4 0 -4 Z',
          fill: '#FFFFFF', opacity: 0.95 }) +
        E('path', { d: 'M-1.6 -1.2 L0.2 0.2 L-1 1.4 L0.8 2.6', stroke: P.deep, 'stroke-width': 0.9,
          fill: 'none', 'stroke-linecap': 'round' }));
      f += txt(60, 24.3, 5.6, '#FFFFFF', 'YUVO', { ls: 1.1 });
    }
    // C · AİLE BANDI (%15, SİSTEM): Çayır çan-çiçeği + benek
    f += E('rect', { x: 14, y: 68, width: 92, height: 12.5, fill: '#FFF6E0', opacity: 0.93 });
    f += E('path', { d: 'M14 68 L106 68 M14 80.5 L106 80.5', stroke: P.deep, 'stroke-width': 1.2, opacity: 0.7 });
    for (i = 0; i < 3; i++) f += '<use href="#' + u + '-bell" transform="translate(' + (42 + i * 18) + ' 73.6)"/>';
    for (i = 0; i < 2; i++) f += E('circle', { cx: 51 + i * 18, cy: 74, r: 1.3, fill: P.deep, opacity: 0.6 });
    // E · ALT BİLGİ (%8): seri adı krem plaka üstünde (ton-üstü-ton yasak,
    // min. optik ~12px — "hangi seriden çıktı?" ritüeli okunur kalmalı)
    f += E('rect', { x: 21, y: 85.6, width: 78, height: 9.2, rx: 3.2, fill: '#FFF6E0', opacity: 0.95 });
    f += E('rect', { x: 21, y: 85.6, width: 78, height: 9.2, rx: 3.2, fill: 'none',
      stroke: P.deep, 'stroke-width': 0.9, opacity: 0.55 });
    f += txt(60, 92.4, 7, P.deep, P.ad);
    f += E('g', { transform: 'translate(60 98.6) scale(0.8)' },
      E('rect', { x: -4.2, y: -2.8, width: 8.4, height: 5.6, rx: 1.3, fill: '#FFFFFF', opacity: 0.92,
        stroke: P.etxt, 'stroke-width': 1 }) +
      E('path', { d: 'M0 -2.8 L0 2.8', stroke: P.etxt, 'stroke-width': 0.9 }));
    // specular sweep (yumuşak folyo ışık süpürmesi)
    f += E('ellipse', { cx: 47, cy: 39, rx: 30, ry: 7, fill: '#FFFFFF', opacity: P.golden ? 0.4 : 0.26,
      transform: 'rotate(-24 47 39)' });
    f += E('ellipse', { cx: 72, cy: 84, rx: 20, ry: 4.4, fill: '#FFFFFF', opacity: 0.14,
      transform: 'rotate(-24 72 84)' });
    // METAL PARLAMASI: çapraz keskin highlight bandı + açık/koyu buruşma
    // fasetleri — ambalaj hissini satan sert kenarlı yansımalar
    f += E('path', { d: 'M24 56 L72 24 L80 27 L32 60 Z', fill: '#FFFFFF',
      opacity: P.golden ? 0.55 : 0.45 });
    f += E('path', { d: 'M35 64 L84 31 L87 33.5 L38 67 Z', fill: '#FFFFFF', opacity: 0.22 });
    f += E('path', { d: 'M79 97 L96 80 L94 91 Z', fill: P.light, opacity: 0.5 });
    f += E('path', { d: 'M27 66 L38 72.5 L28 76 Z', fill: P.deep, opacity: 0.26 });
    f += E('path', { d: 'M86 42 L96 51 L84 49 Z', fill: P.deep, opacity: 0.22 });
    if (P.golden) {
      f += sp4(40, 33, 3.6, GOLD.hi, 0.95) + sp4(78, 56, 3, '#FFFFFF', 0.9) +
           sp4(50, 62, 2.4, GOLD.hi, 0.85) + sp4(87, 68, 2.6, '#FFFFFF', 0.9);
    }
    // D · perforasyon çizgileri (kalan sınırlarda)
    var dash = { stroke: '#FFFFFF', 'stroke-width': 1.1, fill: 'none', 'stroke-dasharray': '2.6 2.6', opacity: 0.55 };
    if (torn < 1) f += E('path', mixDash(dash, ptsPath(zig1)));
    if (torn < 2) f += E('path', mixDash(dash, ptsPath(zig2)));
    f += E('path', mixDash(dash, 'M30 84.5 L90 84.5'));

    // kalan-şerit clip'i (yırtılan üst şeritler atılır)
    var foil = E('g', { 'clip-path': 'url(#' + u + '-e)' }, f);
    if (torn > 0) {
      var edge = torn === 1 ? zig1 : zig2;
      var rest = ptsPath(edge) + ' L106 118 L14 118 Z';
      defs += '<clipPath id="' + u + '-r"><path d="' + rest + '"/></clipPath>';
      foil = E('g', { 'clip-path': 'url(#' + u + '-r)' }, foil);
      // yırtık kenar: beyaz cırt + gölge + sağda kıvrılmış katlama
      var ey = edge[edge.length - 1][1];
      foil += E('g', { 'clip-path': 'url(#' + u + '-e)' },
        E('path', { d: ptsPath(edge), stroke: '#FFFFFF', 'stroke-width': 2.4, fill: 'none',
          'stroke-linejoin': 'round', opacity: 0.95 }) +
        E('path', { d: ptsPath(edge), stroke: P.deep, 'stroke-width': 1, fill: 'none',
          'stroke-linejoin': 'round', opacity: 0.4, transform: 'translate(0 1.6)' }));
      foil += E('path', { d: 'M' + N(88) + ' ' + N(ey - 1) + ' L' + N(97) + ' ' + N(ey - 6) +
        ' L' + N(95) + ' ' + N(ey + 4) + ' Z', fill: P.light, stroke: INK, 'stroke-width': 1.8,
        'stroke-linejoin': 'round' });
    }

    body += foil;
    if (torn === 0) { // yırtma kulakçığı (D, SABİT): zig1'in sağ ucunda
      body += E('g', { transform: 'rotate(-9 99 34)' },
        E('rect', { x: 91, y: 29.5, width: 16, height: 9.6, rx: 4.8, fill: P.deep,
          stroke: INK, 'stroke-width': 2.2 }) +
        E('path', { d: 'M97.6 31.8 L101.4 34.3 L97.6 36.8', stroke: '#FFFFFF', 'stroke-width': 1.6,
          fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }

    inner += '<g filter="url(#' + u + '-stk)">' + body + '</g>';
    if (P.golden) inner += sp4(18, 30, 4.4, GOLD.renk1, 0.95) + sp4(103, 46, 3.6, GOLD.hi, 0.9) +
                           sp4(99, 92, 2.8, GOLD.renk1, 0.85);
    return svgTag('0 0 120 120', defs, inner);
  };

  function mixDash (base, d) { // dash özniteliklerine yol ekle
    var o = { d: d }, k;
    for (k in base) o[k] = base[k];
    return o;
  }

  /* =====================================================================
     2) foilScrapSVG — buruşmuş düşen folyo parçası
     ===================================================================== */

  Y.art.foilScrapSVG = function (seriId, opts) {
    opts = opts || {};
    var P = pal(seriId, opts.golden);
    var u = uid('scrap-' + seriId);
    var rnd = seeded(hash('scrap:' + seriId + (opts.golden ? ':g' : '')));
    var n = 9, pts = [], i, a, r;
    for (i = 0; i < n; i++) {
      a = (i / n) * Math.PI * 2;
      r = 13 + rnd() * 8;
      pts.push([N(30 + Math.cos(a) * r), N(30 + Math.sin(a) * r * 0.88)]);
    }
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (i = 1; i < n; i++) d += ' L' + pts[i][0] + ' ' + pts[i][1];
    d += ' Z';
    var defs = stkFilter(u, 1.8) +
      '<radialGradient id="' + u + '-g" cx="0.36" cy="0.3" r="1.05">' +
      '<stop offset="0" stop-color="' + P.light + '"/>' +
      '<stop offset="0.55" stop-color="' + P.r1 + '"/>' +
      '<stop offset="1" stop-color="' + P.deep + '"/></radialGradient>';
    var body = E('path', { d: d, fill: 'url(#' + u + '-g)', stroke: INK, 'stroke-width': 2.2,
      'stroke-linejoin': 'round' });
    // buruşuk yüz: açık/koyu kırışık fasetler
    body += E('path', { d: 'M' + pts[1][0] + ' ' + pts[1][1] + ' L30 30 L' + pts[3][0] + ' ' + pts[3][1] + ' Z',
      fill: '#FFFFFF', opacity: 0.42 });
    body += E('path', { d: 'M' + pts[5][0] + ' ' + pts[5][1] + ' L30 30 L' + pts[7][0] + ' ' + pts[7][1] + ' Z',
      fill: P.deep, opacity: 0.4 });
    body += E('path', { d: 'M' + pts[8][0] + ' ' + pts[8][1] + ' L30 30 L' + pts[0][0] + ' ' + pts[0][1] + ' Z',
      fill: '#FFFFFF', opacity: 0.2 });
    body += E('path', { d: 'M' + pts[2][0] + ' ' + pts[2][1] + ' L30 30 M' + pts[6][0] + ' ' + pts[6][1] + ' L30 30',
      stroke: P.deep, 'stroke-width': 1, fill: 'none', opacity: 0.5 });
    var inner = E('ellipse', { cx: 30, cy: 52.5, rx: 13, ry: 2.7, fill: SIL, opacity: 0.13 }) +
      '<g filter="url(#' + u + '-stk)">' + body + '</g>' +
      sp4(30 + 16, 14, 2.6, P.golden ? GOLD.hi : '#FFFFFF', 0.9);
    if (P.golden) inner += sp4(10, 38, 3, GOLD.renk1, 0.9);
    return svgTag('0 0 60 60', defs, inner);
  };

  /* =====================================================================
     3) chocolateSVG — ısırık izli güneş kabartmalı çikolata; 4'te kapsül
     ===================================================================== */

  var BITES = [
    [[80, 32, 11], [72, 25, 8]],
    [[42, 30, 10], [50, 24, 7]],
    [[61, 36, 12], [52, 43, 8], [70, 43, 8]],
    [[60, 52, 17], [46, 50, 10], [74, 50, 10], [60, 37, 14]]
  ];

  Y.art.chocolateSVG = function (opts) {
    opts = opts || {};
    var bites = Math.max(0, Math.min(4, opts.bites | 0));
    var u = uid('choc' + bites);
    var defs = stkFilter(u) + chocDefs(u);
    var inner = ground(), i, j, cset;

    if (bites >= 4) { // içinden Tomurcuk Kapsülü görünür (nötr ışıma — nadirlik burada sızmaz)
      inner += E('g', { transform: 'translate(60 56) scale(0.52) translate(-60 -57)' },
        E('ellipse', { cx: 60, cy: 57, rx: 34, ry: 26, fill: '#FFF6D0', opacity: 0.85 }) +
        E('path', { d: 'M33 57 C33 34 44 15 60 13 C76 15 87 34 87 57 Z', fill: '#FF9B82',
          stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }) +
        E('path', { d: 'M31 57 C31 84 42 100 60 100 C78 100 89 84 89 57 Z', fill: '#5FC6C0',
          stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }) +
        E('path', { d: 'M31 57 Q60 63 89 57', stroke: INK, 'stroke-width': 3, fill: 'none' }));
    }

    if (bites > 0) {
      var m = '<mask id="' + u + '-m"><path d="' + EGG_D + '" fill="#FFFFFF"/>';
      for (i = 0; i < bites; i++) {
        cset = BITES[i];
        for (j = 0; j < cset.length; j++) {
          m += E('circle', { cx: cset[j][0], cy: cset[j][1], r: cset[j][2], fill: '#000000' });
        }
      }
      m += '</mask>';
      defs += m;
    }

    var body = chocBody(u);
    // ısırık kenarı: açık iç-çikolata hilali (maske dış yarıyı bırakır)
    for (i = 0; i < bites; i++) {
      cset = BITES[i];
      for (j = 0; j < cset.length; j++) {
        body += E('circle', { cx: cset[j][0], cy: cset[j][1], r: cset[j][2], fill: 'none',
          stroke: '#C08A5F', 'stroke-width': 3.6, opacity: 0.9 });
        body += E('circle', { cx: cset[j][0], cy: cset[j][1], r: cset[j][2] + 2.6, fill: 'none',
          stroke: '#4E2F1B', 'stroke-width': 1.4, opacity: 0.45 });
      }
    }
    if (bites > 0) body = E('g', { mask: 'url(#' + u + '-m)' }, body);
    inner += '<g filter="url(#' + u + '-stk)">' + body + '</g>';
    // kırıntılar
    if (bites > 0 && bites < 4) {
      inner += E('circle', { cx: 30 + bites * 4, cy: 100, r: 1.8, fill: '#5C3A22', opacity: 0.85 }) +
               E('circle', { cx: 88 - bites * 3, cy: 102, r: 1.4, fill: '#8A5A38', opacity: 0.85 });
    }
    return svgTag('0 0 120 120', defs, inner);
  };

  /* =====================================================================
     4) capsuleSVG — Tomurcuk Kapsülü (tier ışıması + yöntem + aşama)
     ===================================================================== */

  var LID_D  = 'M33 57 C33 34 44 15 60 13 C76 15 87 34 87 57 Z';
  var BOWL_D = 'M31 57 C31 84 42 100 60 100 C78 100 89 84 89 57 Z';

  function capsuleDefs (u) {
    return '<radialGradient id="' + u + '-b" cx="0.36" cy="0.3" r="1.1">' +
      '<stop offset="0" stop-color="#8FDAD4"/><stop offset="0.55" stop-color="#5FC6C0"/>' +
      '<stop offset="1" stop-color="#2E9A96"/></radialGradient>' +
      '<radialGradient id="' + u + '-l" cx="0.36" cy="0.3" r="1.1">' +
      '<stop offset="0" stop-color="#FFC0AC"/><stop offset="0.55" stop-color="#FF9B82"/>' +
      '<stop offset="1" stop-color="#E06A52"/></radialGradient>';
  }
  function capLeaf () { // yaprak sapı = çevirme tutamacı
    return E('path', { d: 'M60 14 Q59 6 64 3', stroke: '#55B944', 'stroke-width': 2.8,
        fill: 'none', 'stroke-linecap': 'round' }) +
      E('path', { d: 'M64 0.6 Q70 3.6 64.6 8 Q60.6 4 64 0.6 Z', fill: '#8ED94F',
        stroke: INK, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
  }
  function capLid (u) {
    return E('path', { d: LID_D, fill: 'url(#' + u + '-l)', stroke: INK, 'stroke-width': LW,
        'stroke-linejoin': 'round' }) +
      E('ellipse', { cx: 50, cy: 30, rx: 5.4, ry: 9, fill: '#FFFFFF', opacity: 0.35,
        transform: 'rotate(20 50 30)' }) + capLeaf();
  }
  function capBowl (u, open) {
    var s = E('path', { d: BOWL_D, fill: 'url(#' + u + '-b)', stroke: INK, 'stroke-width': LW,
      'stroke-linejoin': 'round' });
    if (open) { // yuva çanağı: iç boşluk + yumuşak minder
      s += E('ellipse', { cx: 60, cy: 58.5, rx: 26.5, ry: 7.2, fill: '#1F7A76', stroke: INK,
        'stroke-width': 2.4 });
      s += E('ellipse', { cx: 60, cy: 59.5, rx: 20, ry: 4.6, fill: '#FFF6E0', opacity: 0.92 });
    }
    s += E('ellipse', { cx: 48, cy: 72, rx: 5, ry: 8.6, fill: '#FFFFFF', opacity: 0.22,
      transform: 'rotate(14 48 72)' });
    s += E('ellipse', { cx: 60, cy: 95, rx: 14, ry: 3.6, fill: '#BDEBE6', opacity: 0.25 });
    return s;
  }
  function methodAccent (method, stage, glow) {
    if (method === 'cekic') { // tık-tık-KIRT ritim halkaları
      var s = '', i, cy = [26, 42, 58];
      for (i = 0; i < 3; i++) {
        s += E('circle', { cx: 101, cy: cy[i], r: 4.6 - i * 0.6, fill: 'none', stroke: '#FFFFFF',
          'stroke-width': 2, opacity: 0.85 }) +
          E('circle', { cx: 101, cy: cy[i], r: 1.2, fill: '#FFFFFF', opacity: 0.85 });
      }
      return s;
    }
    if (method === 'firlat') { // zıplama/sallama izleri
      return E('path', { d: 'M24 100 Q60 108 96 100', stroke: SIL, 'stroke-width': 2.2, fill: 'none',
          'stroke-linecap': 'round', opacity: 0.35 }) +
        E('path', { d: 'M16 46 Q11 54 16 62 M12 50 Q9 54 12 58', stroke: '#FFFFFF', 'stroke-width': 2.2,
          fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }) +
        E('path', { d: 'M104 46 Q109 54 104 62 M108 50 Q111 54 108 58', stroke: '#FFFFFF',
          'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 });
    }
    if (method === 'sihir') {
      return sp4(24, 28, 4.4, '#FFE9A8', 0.95) + sp4(98, 36, 3.6, '#FFFFFF', 0.9) +
             sp4(28, 78, 3, glow, 0.8) + sp4(94, 84, 2.6, '#FFE9A8', 0.85);
    }
    // burgu (varsayılan): sap çevresinde çevirme oku
    return E('path', { d: 'M76 10 A22 22 0 0 1 90 26', stroke: '#FFFFFF', 'stroke-width': 2.4,
        fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 }) +
      E('path', { d: 'M90 26 L84.6 22.6 M90 26 L92.6 20.4', stroke: '#FFFFFF', 'stroke-width': 2.4,
        fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 });
  }

  Y.art.capsuleSVG = function (tier, opts) {
    opts = opts || {};
    var stage = Math.max(0, Math.min(2, opts.stage | 0));
    var method = opts.method || 'burgu';
    var glow = rarRenk(tier);
    var gLight = mixc(glow, '#FFFFFF', 0.55);
    var u = uid('cap-' + sanit(String(tier)));
    var defs = stkFilter(u) + capsuleDefs(u) +
      '<radialGradient id="' + u + '-a" cx="0.5" cy="0.5" r="0.5">' +
      '<stop offset="0" stop-color="' + glow + '" stop-opacity="0.6"/>' +
      '<stop offset="0.6" stop-color="' + glow + '" stop-opacity="0.25"/>' +
      '<stop offset="1" stop-color="' + glow + '" stop-opacity="0"/></radialGradient>';
    var inner = '', body = '';

    if (stage < 2) {
      inner += ground();
      if (stage === 1) inner += E('circle', { cx: 60, cy: 56, r: 52, fill: 'url(#' + u + '-a)' });
      body += capBowl(u, false);
      // iç ışıma halkası (ipucu merdiveni 3. basamak — nadirliğin İLK sinyali)
      var seam = 'M31 57 Q60 62.5 89 57';
      body += E('path', { d: seam, stroke: glow, 'stroke-width': 9, fill: 'none',
        'stroke-linecap': 'round', opacity: stage === 1 ? 0.4 : 0.24 });
      body += E('path', { d: seam, stroke: gLight, 'stroke-width': 4.4, fill: 'none',
        'stroke-linecap': 'round', opacity: stage === 1 ? 0.95 : 0.65 });
      if (stage === 1) { // çatlak: kapak aralanır, ışık taşar
        body += E('ellipse', { cx: 60, cy: 55.5, rx: 26, ry: 5.6, fill: gLight, opacity: 0.9 }) +
                E('ellipse', { cx: 60, cy: 55.5, rx: 15, ry: 3.2, fill: '#FFFFFF', opacity: 0.75 }) +
                E('path', { d: 'M46 52 L43 45 M60 51 L60 43 M74 52 L77 45', stroke: gLight,
                  'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', opacity: 0.9 });
        body += E('g', { transform: 'translate(0 -5.5) rotate(-5 60 40)' }, capLid(u));
      } else {
        body += E('path', { d: 'M31 57 Q60 62.5 89 57', stroke: INK, 'stroke-width': 2, fill: 'none', opacity: 0.5 });
        body += capLid(u);
      }
      inner += '<g filter="url(#' + u + '-stk)">' + body + '</g>';
      inner += methodAccent(method, stage, glow);
      if (stage === 1) inner += sp4(30, 40, 3.6, gLight, 0.95) + sp4(92, 34, 3, '#FFFFFF', 0.9);
    } else { // AÇIK: iki yarım fizikle ayrılmış; alt yarım = ilk yuva çanağı
      inner += E('circle', { cx: 60, cy: 50, r: 54, fill: 'url(#' + u + '-a)' });
      inner += ground(109, 28, 4.2);
      body += E('g', { transform: 'translate(0 8)' }, capBowl(u, true));
      body += E('g', { transform: 'translate(-26 -6) rotate(-30 47 35) scale(0.94)' }, capLid(u));
      inner += '<g filter="url(#' + u + '-stk)">' + body + '</g>';
      inner += E('circle', { cx: 62, cy: 46, r: 15, fill: '#FFFFFF', opacity: 0.55 }) +
               sp4(62, 46, 9, gLight, 0.95) + sp4(88, 26, 4.4, gLight, 0.95) +
               sp4(24, 44, 3.8, '#FFFFFF', 0.9) + sp4(96, 66, 3.2, glow, 0.8) +
               sp4(34, 20, 3, glow, 0.75);
      if (method === 'sihir') inner += sp4(18, 74, 3, '#FFE9A8', 0.85);
    }
    return svgTag('0 0 120 120', defs, inner);
  };

  /* =====================================================================
     5) toolSVG — tören araçları (saf kozmetik; §2.d rafı)
     ===================================================================== */

  function toolBurgu (u, hp1, hp2, cp1, cp2, extra) {
    var defs = '<radialGradient id="' + u + '-h" cx="0.36" cy="0.28" r="1.05">' +
      '<stop offset="0" stop-color="' + hp1 + '"/><stop offset="1" stop-color="' + hp2 + '"/></radialGradient>' +
      '<radialGradient id="' + u + '-c" cx="0.36" cy="0.28" r="1.05">' +
      '<stop offset="0" stop-color="' + cp1 + '"/><stop offset="1" stop-color="' + cp2 + '"/></radialGradient>';
    var body =
      E('rect', { x: 55.6, y: 40, width: 8.8, height: 12, rx: 3, fill: hp2, stroke: INK, 'stroke-width': LW2 }) +
      E('rect', { x: 38, y: 24, width: 44, height: 17, rx: 8.5, fill: 'url(#' + u + '-h)',
        stroke: INK, 'stroke-width': LW }) +
      E('ellipse', { cx: 47, cy: 29, rx: 7, ry: 3, fill: '#FFFFFF', opacity: 0.5, transform: 'rotate(-14 47 29)' }) +
      E('path', { d: 'M45 50 Q60 43.5 75 50 L62.5 96 Q60 99.5 57.5 96 Z', fill: 'url(#' + u + '-c)',
        stroke: INK, 'stroke-width': LW, 'stroke-linejoin': 'round' }) +
      E('path', { d: 'M48.4 58 Q60 64 71.6 58 M51.2 68 Q60 73 68.8 68 M54 78 Q60 82 66 78',
        stroke: '#FFFFFF', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.75 });
    return { defs: defs, body: body, extra: extra || '' };
  }

  var TOOL_BUILDERS = {
    burgu: function (u) {
      return toolBurgu(u, '#D9A05B', '#8E5A2B', '#BFEAF5', '#3FA9DE',
        sp4(84, 84, 3.4, '#8AD9F7', 0.85));
    },
    sedefburgu: function (u) {
      return toolBurgu(u, '#F6EEFF', '#CBA7E0', '#EDE7F6', '#8AD9F7',
        sp4(30, 30, 4.4, '#FFD9EC', 0.95) + sp4(88, 60, 3.6, '#BFEAF5', 0.9) + sp4(80, 88, 2.8, '#EDE7F6', 0.85));
    },
    cekic: function (u) {
      var defs = '<radialGradient id="' + u + '-h" cx="0.36" cy="0.28" r="1.05">' +
        '<stop offset="0" stop-color="#D9A05B"/><stop offset="1" stop-color="#8E5A2B"/></radialGradient>';
      var body = E('g', { transform: 'rotate(-8 60 34)' },
          E('rect', { x: 32, y: 20, width: 56, height: 28, rx: 13, fill: 'url(#' + u + '-h)',
            stroke: INK, 'stroke-width': LW }) +
          E('path', { d: 'M40 24 L40 44 M80 24 L80 44', stroke: '#6E441F', 'stroke-width': 2.2,
            'stroke-linecap': 'round', opacity: 0.8 }) +
          E('ellipse', { cx: 46, cy: 27, rx: 8, ry: 3.2, fill: '#FFFFFF', opacity: 0.5 })) +
        E('rect', { x: 55.8, y: 46, width: 8.4, height: 46, rx: 4, fill: '#E8BE5C',
          stroke: INK, 'stroke-width': LW2 }) +
        E('rect', { x: 53.6, y: 86, width: 12.8, height: 8.6, rx: 4.2, fill: '#B77B3F',
          stroke: INK, 'stroke-width': LW2 });
      return { defs: defs, body: body, extra: sp4(90, 16, 4, '#FFC734', 0.95) + sp4(24, 40, 2.8, '#FFC734', 0.8) };
    },
    firlat: function (u) {
      var defs = capsuleDefs(u);
      var body = E('g', { transform: 'translate(60 52) rotate(14) scale(0.5) translate(-60 -57)' },
        E('path', { d: LID_D, fill: 'url(#' + u + '-l)', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }) +
        E('path', { d: BOWL_D, fill: 'url(#' + u + '-b)', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }) +
        E('path', { d: 'M31 57 Q60 63 89 57', stroke: INK, 'stroke-width': 3.4, fill: 'none' }));
      var extra =
        E('path', { d: 'M28 26 Q20 40 26 54 M20 30 Q15 40 19 50', stroke: SIL, 'stroke-width': 2.6,
          fill: 'none', 'stroke-linecap': 'round', opacity: 0.5 }) +
        E('path', { d: 'M92 26 Q100 40 94 54 M100 30 Q105 40 101 50', stroke: SIL, 'stroke-width': 2.6,
          fill: 'none', 'stroke-linecap': 'round', opacity: 0.5 }) +
        E('path', { d: 'M28 96 Q60 106 92 96', stroke: SIL, 'stroke-width': 2.6, fill: 'none',
          'stroke-linecap': 'round', opacity: 0.4 }) +
        E('path', { d: 'M42 84 q4 -7 8 0 q4 7 8 0 q4 -7 8 0 q4 7 8 0', stroke: '#3FA9DE',
          'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }) +
        sp4(60, 16, 4.4, '#FFC734', 0.95);
      return { defs: defs, body: body, extra: extra };
    },
    sihir: function (u) {
      var defs = '<radialGradient id="' + u + '-h" cx="0.36" cy="0.28" r="1.05">' +
        '<stop offset="0" stop-color="#FFF1DC"/><stop offset="1" stop-color="#F2BE8E"/></radialGradient>' +
        '<radialGradient id="' + u + '-a" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="#FFC734" stop-opacity="0.5"/>' +
        '<stop offset="1" stop-color="#FFC734" stop-opacity="0"/></radialGradient>';
      var body =
        E('rect', { x: 63, y: 30, width: 12, height: 30, rx: 6, fill: 'url(#' + u + '-h)',
          stroke: INK, 'stroke-width': LW, transform: 'rotate(16 69 45)' }) +
        E('ellipse', { cx: 58, cy: 66, rx: 17, ry: 15, fill: 'url(#' + u + '-h)',
          stroke: INK, 'stroke-width': LW }) +
        E('ellipse', { cx: 43, cy: 62, rx: 6, ry: 7.6, fill: 'url(#' + u + '-h)',
          stroke: INK, 'stroke-width': LW2, transform: 'rotate(-22 43 62)' }) +
        E('rect', { x: 44, y: 76, width: 28, height: 10, rx: 5, fill: '#FF8FB0',
          stroke: INK, 'stroke-width': LW2 }) +
        E('ellipse', { cx: 52, cy: 60, rx: 5, ry: 3, fill: '#FFFFFF', opacity: 0.5 });
      var extra = E('circle', { cx: 80, cy: 26, r: 22, fill: 'url(#' + u + '-a)' }) +
        sp4(80, 26, 7, '#FFC734', 0.98) + sp4(94, 42, 3.4, '#FFE9A8', 0.9) +
        sp4(68, 14, 3, '#FFE9A8', 0.85) + sp4(28, 34, 2.8, '#FFD9EC', 0.8);
      return { defs: defs, body: body, extra: extra };
    }
  };

  Y.art.toolSVG = function (toolId) {
    var id = sanit(String(toolId || 'burgu')) || 'burgu';
    var u = uid('tool-' + id);
    var build = TOOL_BUILDERS[String(toolId)] || null;
    var r;
    if (build) { r = build(u); }
    else { // bilinmeyen araç: kilitli raf yer tutucusu (halka + ışıltı)
      r = { defs: '',
        body: E('circle', { cx: 60, cy: 58, r: 26, fill: '#EDE7F6', stroke: INK, 'stroke-width': LW }) +
              E('circle', { cx: 60, cy: 58, r: 15, fill: 'none', stroke: '#8F76C2', 'stroke-width': 3,
                'stroke-dasharray': '5 6', 'stroke-linecap': 'round' }),
        extra: sp4(60, 58, 7, '#C9B4E8', 0.9) };
    }
    var inner = ground(100, 24, 4, 0.12) +
      '<g filter="url(#' + u + '-stk)">' + r.body + '</g>' + (r.extra || '');
    return svgTag('0 0 120 120', stkFilter(u) + (r.defs || ''), inner);
  };

  /* =====================================================================
     6) foilStampSVG — Ambalaj Defteri yuvası pulu (×n rozetli)
     ===================================================================== */

  Y.art.foilStampSVG = function (seriId, variant, opts) {
    opts = opts || {};
    var v = Math.max(0, Math.min(7, variant | 0));
    var P = pal(seriId, opts.golden);
    var count = Math.max(0, opts.count | 0);
    var u = uid('stamp-' + seriId);
    var defs = stkFilter(u, 2) +
      '<linearGradient id="' + u + '-f" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + P.light + '"/>' +
      '<stop offset="0.45" stop-color="' + P.r1 + '"/>' +
      '<stop offset="1" stop-color="' + P.deep + '"/></linearGradient>' +
      '<clipPath id="' + u + '-e"><path d="' + EGG_D + '"/></clipPath>' +
      '<g id="' + u + '-mo">' + motifDef(P.desen, P.mA, P.mB) + '</g>';

    // pul zemini + perforasyon (yuvarlak delik dizisi hissi: nokta çerçeve)
    var body = E('rect', { x: 26, y: 12, width: 68, height: 94, rx: 8, fill: '#FFFFFF',
        stroke: INK, 'stroke-width': 2.5 }) +
      E('rect', { x: 31, y: 17, width: 58, height: 84, rx: 5, fill: P.r2, opacity: 0.35 }) +
      E('rect', { x: 31, y: 17, width: 58, height: 84, rx: 5, fill: 'none',
        stroke: P.golden ? GOLD.renk1 : P.deep, 'stroke-width': 2.4,
        'stroke-dasharray': '0.5 5.4', 'stroke-linecap': 'round', opacity: 0.85 });

    // varyant filigranı: köşe glifinin BÜYÜK silüeti pulun sol-üst boşluğunda —
    // hayalet (kilitli) hâlde bile "hangisi eksik?" tek bakışta okunur
    body += E('g', { transform: 'translate(41 28)', opacity: 0.3 },
      E('g', { transform: 'scale(3)' }, badgeGlyph(v, P.deep)));

    // mini folyo yumurta (A bandı + desen + C bandı özetli)
    var mini = E('path', { d: EGG_D, fill: 'url(#' + u + '-f)', stroke: INK, 'stroke-width': 4.4,
        'stroke-linejoin': 'round' }) +
      E('g', { 'clip-path': 'url(#' + u + '-e)' },
        E('rect', { x: 20, y: 13, width: 80, height: 13, fill: P.deep, opacity: 0.95 }) +
        E('rect', { x: 20, y: 70, width: 80, height: 11, fill: '#FFF6E0', opacity: 0.9 }) +
        E('path', { d: 'M20 70 L100 70 M20 81 L100 81', stroke: P.deep, 'stroke-width': 1.6, opacity: 0.7 }) +
        '<use href="#' + u + '-mo" transform="translate(60 47) scale(2.2) rotate(' + N(v * 6 - 21) + ')"/>' +
        E('ellipse', { cx: 48, cy: 40, rx: 26, ry: 6.6, fill: '#FFFFFF',
          opacity: P.golden ? 0.4 : 0.25, transform: 'rotate(-24 48 40)' }));
    body += E('g', { transform: 'translate(60 55) scale(0.5) translate(-60 -59.5)' }, mini);

    // varyant köşe rozeti (büyütüldü: silüet ayrımı 12px glife sıkışmasın)
    body += E('g', { transform: 'translate(80 92)' },
      E('circle', { cx: 0, cy: 0, r: 9, fill: '#FFFFFF', stroke: P.deep, 'stroke-width': 1.8 }) +
      E('g', { transform: 'scale(1.6)' }, badgeGlyph(v, P.deep)));

    if (P.golden) body += sp4(38, 26, 4, GOLD.renk1, 0.95) + sp4(80, 40, 3, GOLD.hi, 0.9) +
                          sp4(42, 88, 2.8, GOLD.renk1, 0.85);

    // ×n kopya rozeti
    if (count >= 2) {
      body += E('g', { transform: 'translate(92 20)' },
        E('circle', { cx: 0, cy: 0, r: 11.5, fill: '#FF7C33', stroke: INK, 'stroke-width': 2.5 }) +
        txt(0, 3.6, 10.5, '#FFFFFF', '×' + Math.min(count, 99)));
    }

    return svgTag('0 0 120 120', defs, '<g filter="url(#' + u + '-stk)">' + body + '</g>');
  };
})();
