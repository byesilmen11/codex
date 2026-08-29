/* =====================================================================
   YUVO ÇEVRE SANATI — js/art/env.js  (sahip: cevre — çevre sanatçısı)
   =====================================================================
   SAHNE STİLİSTLERİNİN SÖZLEŞMESİ — window.Yuvo.art.env

   Tüm üreticiler SVG STRING döndürür (innerHTML ile basılır). Her çıktı
   kendi <svg ... aria-hidden="true"> sarmalayıcısını taşır, dış kaynak
   içermez ve 6KB'nin altındadır. Id'ler "ye-" önekiyle her çağrıda
   BENZERSİZ üretilir (aynı üretici aynı sayfada iki kez basılabilir).
   Sanat deterministiktir: aynı üretici her çağrıda aynı kompozisyon.

   ÜRETİCİLER (viewBox / preserveAspectRatio / kullanım):

   sky()        0 0 360 240 / xMidYMax slice
     Gök bandı: dikey #8AD9F7->#CFF0FE gradyan + ufukta #FFE9A8 gün doğumu
     ışıması. ALT kenara çapalıdır (YMax): dar-yüksek kutuda üstten
     kırpılır. Güneş meadow() katmanındadır (dar ekranda kenar kırpması
     güneşi yarım bırakmasın diye). Öneri: sahnenin üst yarısı,
     position:absolute; top:0; left:0; width:100%; height:~45%.

   clouds()     0 0 360 120 / xMidYMin slice
     3 tombul bulut (defs'te tek bulut + <use>). Her <use>
     class="env-cloud" taşır -> stilist süzülme animasyonu bağlayabilir
     (öneri: transform-box:fill-box ile yavaş translateX salınımı).
     sky() üzerine AYRI katman olarak, üst kenara hizalı basılır.

   meadow()     0 0 360 200 / xMidYMax slice
     Ufukta ışın halkalı gün doğumu güneşi (#FFC734/#F2A400, cx 190 —
     dar ekran bandında daima kadraj içinde; tepeler önüne biner, güneş
     tepelerin ARKASINDAN yükselir) + 3 katman yuvarlak tepe (#A5E36B /
     #8ED94F / #55B944) + seeded çiçek (#FF8FB0/beyaz taç, #FFC734
     merkez) ve çim serpme + beyaz benekler. Ekranın alt bandı:
     position:absolute; left:0; right:0; bottom:0; height:~42-46%.

   rays(renk)   0 0 240 240 / xMidYMid slice
     Tören huzmeleri: 12 huzme (uzun/kısa dönüşümlü), merkezden dışa
     "renk" %35->0 solar; merkezde renk + beyaz yumuşak parlama.
     "renk" #RRGGBB doğrulanır; geçersizse #FFC734'e düşer. Huzme grubu
     <g class="env-rays"> -> stilist spin verebilir (öneri:
     .env-rays{transform-box:fill-box; transform-origin:center;
     animation:ye-spin 24s linear infinite}). Yumurtanın ARKASINA,
     merkezi (120,120) yumurta merkeziyle çakışacak şekilde konur.

   sparkles()   0 0 360 360 / xMidYMid slice
     12 süzülen ışıltı (#FFE9A8/#FFD76B/beyaz, 4 uçlu yıldız + minik
     daire). Her örnek class="env-sp" ve style="--i:n" taşır ->
     gecikmeli süzülme: .env-sp{animation-delay:calc(var(--i)*.35s)}.
     Tören/kutlama üst katmanı; tam ekran overlay.

   basket()     0 0 240 170 / xMidYMid meet
     Yuva sepeti — TAM sticker reçetesi (BRAND §3): #3E2A1C kontur (lw 4),
     feMorphology beyaz hale, #B77B3F->#8E5A2B şeker-vinil gövde, hasır
     örgü dokusu (<use> ×3 satır), kalın kapsül ağız (rim, y=52..82),
     üst-sol parlama şeridi, iç sert alt gölge bandı, zemin gölge elipsi.
     YUMURTALAR SEPETE DAHİL DEĞİLDİR: sahne yumurtaları ayrı katman
     olarak basar; yumurtalar alt uçları rim bandının (y~52-82) arkasında
     kalacak şekilde sepetin ÜSTÜNE bindirilir — "sepetin içinde" hissi
     böyle kurulur (.home-egg yerleşimi sahne stilistinindir).

   tableWood()  0 0 360 200 / xMidYMid slice
     Atölye masası: --bg2 (#FFE9C4) taban; yalnız marka kahveleri —
     plaka ayrım çizgileri #B77B3F ~%28, damar kıvrımları #8E5A2B
     %12-15 (<use> ×3), 2 budak halkası <=%10, üst kenarda #FFF9EC %35
     ışık bandı. Assembly zemini: inset:0; width/height:100%.

   paper()      0 0 360 360 / xMidYMid slice
     Albüm kâğıdı: --paper (#FFF9EC) taban + %4-5 benek graini (#8A6B4F,
     <use> ×4 döndürme) + köşelerde #FFE9C4 %6 vinyet. Metin arkasında
     güvenli (BRAND §3: doku <=%6). Hafif (~1.4KB).

   flowers()    0 0 360 56 / xMidYMax meet
     Dekoratif kenar çelengi: 4 çiçek (#FF8FB0 / #FFC734 dönüşümlü,
     ince #3E2A1C kontur, beyaz parlamalı merkez) + 3 yaprak çifti
     (#8ED94F) yatay dizi. Albüm başlığı altı / modal üstü süsü;
     height:28-32px önerilir.

   RENK KAYNAĞI: yalnız BRAND.md §1 + §5 hexleri; yeni ton türetilmez.
   Kontur mürekkebi DAİMA #3E2A1C (--line) — pufi-svg/ritual-svg de artık
   aynı mürekkebi kullanır (BRAND §1.1 tek mürekkep kuralı). Id alanları:
   "ye-" bu dosyanın, "yv-" pufi-svg'nin, "yi-" ui-icons'undur.
   ===================================================================== */
(function () {
  window.Yuvo = window.Yuvo || { data: {}, art: {}, audio: {}, engine: {}, scenes: {}, test: {} };
  var Y = window.Yuvo;
  Y.art = Y.art || {};

  /* ---------- ortak yardımcılar (pufi-svg desenine paralel, bağımsız kopya) ---------- */

  var LINE = '#3E2A1C';  // çevre kontur mürekkebi (BRAND §1.1)
  var SEQ = 0;           // benzersiz id sayacı — "ye-" öneki bu dosyaya ayrılmıştır

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

  function uid (name) { return 'ye-' + name + '-' + (SEQ++); }

  function hash (s) {
    s = String(s);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function seeded (a) { // mulberry32 — deterministik serpme (her çağrıda aynı sanat)
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var HEX_RE = /^#[0-9A-Fa-f]{6}$/;
  function hex (s, fb) { return HEX_RE.test(String(s == null ? '' : s)) ? String(s) : fb; }

  function wrap (vb, par, defs, inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb +
           '" preserveAspectRatio="' + par + '" aria-hidden="true">' +
           (defs ? '<defs>' + defs + '</defs>' : '') + inner + '</svg>';
  }

  function use (id, tr, extra) {
    var a = { href: '#' + id, transform: tr || null };
    if (extra) { for (var k in extra) a[k] = extra[k]; }
    return E('use', a);
  }

  function stops (list) {
    var s = '', i;
    for (i = 0; i < list.length; i++) {
      s += '<stop offset="' + list[i][0] + '" stop-color="' + list[i][1] + '"' +
           (list[i][2] != null ? ' stop-opacity="' + list[i][2] + '"' : '') + '/>';
    }
    return s;
  }

  function lin (id, list, x1, y1, x2, y2) {
    return '<linearGradient id="' + id + '" x1="' + x1 + '" y1="' + y1 +
           '" x2="' + x2 + '" y2="' + y2 + '">' + stops(list) + '</linearGradient>';
  }

  function rad (id, list, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '">' +
           stops(list) + '</radialGradient>';
  }

  /* ---------- sky: gök bandı + gün doğumu ışıması ----------
     NOT: Güneş artık meadow() katmanındadır — dar ekranda "slice" kırpması
     kenardaki güneşi yarım bırakıyordu; gün doğumu güneşi tepelerin
     arkasından, daima kadraj içinde yükselir (BRAND §5). ---------- */

  function sky () {
    var u = uid('sky');
    var gSky = u + '-g', gHz = u + '-h';
    var defs =
      lin(gSky, [[0, '#8AD9F7'], [1, '#CFF0FE']], 0, 0, 0, 1) +
      rad(gHz, [[0, '#FFE9A8', 0.9], [1, '#FFE9A8', 0]], 0.5, 0.5, 0.5);
    var s =
      E('rect', { x: 0, y: 0, width: 360, height: 240, fill: 'url(#' + gSky + ')' }) +
      E('ellipse', { cx: 180, cy: 236, rx: 240, ry: 80, fill: 'url(#' + gHz + ')' });
    return wrap('0 0 360 240', 'xMidYMax slice', defs, s);
  }

  /* ---------- clouds: defs'te 1 tombul bulut, <use> ×3 ---------- */

  function clouds () {
    var u = uid('clouds'), c = u + '-c';
    var defs = E('g', { id: c },
      E('ellipse', { cx: 0, cy: 8, rx: 34, ry: 10, fill: '#FFFFFF' }) +
      E('circle', { cx: -17, cy: 0, r: 13, fill: '#FFFFFF' }) +
      E('circle', { cx: 1, cy: -7, r: 16, fill: '#FFFFFF' }) +
      E('circle', { cx: 18, cy: 1, r: 11, fill: '#FFFFFF' }) +
      E('ellipse', { cx: 2, cy: 12.5, rx: 26, ry: 5, fill: '#CFF0FE', opacity: 0.8 }));
    var s =
      use(c, 'translate(64 40)', { 'class': 'env-cloud', opacity: 0.95 }) +
      use(c, 'translate(198 26) scale(0.72)', { 'class': 'env-cloud', opacity: 0.85 }) +
      use(c, 'translate(314 48) scale(0.55)', { 'class': 'env-cloud', opacity: 0.7 });
    return wrap('0 0 360 120', 'xMidYMin slice', defs, s);
  }

  /* ---------- meadow: 3 tepe + seeded çiçek/çim serpme ---------- */

  function meadow () {
    var u = uid('meadow'), p = u + '-p', f = u + '-f', g = u + '-g';
    var gSun = u + '-s', ray = u + '-r';
    var defs =
      rad(gSun, [[0, '#FFE79A'], [0.6, '#FFC734'], [1, '#F2A400']], 0.38, 0.32, 0.95) +
      E('rect', { id: ray, x: -3.4, y: -46, width: 6.8, height: 15, rx: 3.4,
        fill: '#FFC734', opacity: 0.8 }) +
      E('ellipse', { id: p, cx: 0, cy: -6, rx: 3.1, ry: 5.4, stroke: LINE, 'stroke-width': 1 }) +
      E('g', { id: f },
        E('path', { d: 'M0 14 Q-1.4 7 0 2', stroke: '#55B944', 'stroke-width': 2.4,
          fill: 'none', 'stroke-linecap': 'round' }) +
        E('path', { d: 'M0 10 Q-6 8.6 -7.6 3.4 Q-2 4.6 0 10 Z', fill: '#55B944' }) +
        use(p) + use(p, 'rotate(72)') + use(p, 'rotate(144)') +
        use(p, 'rotate(216)') + use(p, 'rotate(288)') +
        E('circle', { cx: 0, cy: 0, r: 3, fill: '#FFC734', stroke: LINE, 'stroke-width': 1 })) +
      E('path', { id: g, d: 'M0 0 Q-1.6 -8 -5.4 -11 M0 0 Q0.4 -9 1.4 -13 M0 0 Q2.4 -7 6.2 -10',
        stroke: '#55B944', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
    // Gün doğumu güneşi (BRAND §5: ışın halkalı --sun): tepelerin ARKASINDAN
    // yükselir; cx 190 dar ekran "slice" bandında da daima kadraj içindedir.
    var i, beams = '';
    for (i = 0; i < 10; i++) beams += use(ray, 'rotate(' + (i * 36) + ')');
    var s =
      E('circle', { cx: 190, cy: 50, r: 38, fill: '#FFE9A8', opacity: 0.5 }) +
      E('g', { transform: 'translate(190 50)' }, beams) +
      E('circle', { cx: 190, cy: 50, r: 27, fill: 'url(#' + gSun + ')' }) +
      E('circle', { cx: 190, cy: 50, r: 22, fill: 'none', stroke: '#FFF9EC', 'stroke-width': 2, opacity: 0.5 }) +
      E('ellipse', { cx: 181, cy: 40, rx: 7, ry: 4, fill: '#FFFFFF', opacity: 0.7,
        transform: 'rotate(-18 181 40)' }) +
      E('path', { d: 'M0 84 Q48 44 118 60 Q168 71 216 56 Q272 39 322 58 Q344 66 360 62 L360 200 L0 200 Z', fill: '#A5E36B' }) +
      E('path', { d: 'M0 126 Q56 92 136 106 Q206 118 262 102 Q316 88 360 104 L360 200 L0 200 Z', fill: '#8ED94F' }) +
      E('path', { d: 'M0 172 Q72 140 172 154 Q272 168 360 146 L360 200 L0 200 Z', fill: '#55B944' });
    var rnd = seeded(hash('yuvo-meadow')), x, y, sc;
    for (i = 0; i < 7; i++) {
      x = N(18 + i * 47 + rnd() * 22);
      y = N(112 + rnd() * 64);
      sc = N(0.75 + rnd() * 0.5);
      s += use(f, 'translate(' + x + ' ' + y + ') scale(' + sc + ')',
               { fill: (i % 2 ? '#FFFFFF' : '#FF8FB0') });
    }
    for (i = 0; i < 5; i++) {
      x = N(32 + i * 66 + rnd() * 28);
      y = N(122 + rnd() * 62);
      s += use(g, 'translate(' + x + ' ' + y + ') scale(' + N(0.8 + rnd() * 0.5) + ')');
    }
    for (i = 0; i < 6; i++) {
      s += E('circle', { cx: N(14 + rnd() * 332), cy: N(98 + rnd() * 88), r: N(1.4 + rnd() * 1.1),
             fill: '#FFFFFF', opacity: 0.55 });
    }
    return wrap('0 0 360 200', 'xMidYMax slice', defs, s);
  }

  /* ---------- rays: tören huzmeleri (renk doğrulamalı) ---------- */

  function rays (renk) {
    var col = hex(renk, '#FFC734');
    var u = uid('rays');
    var gB = u + '-g', gC = u + '-c', gW = u + '-w', bL = u + '-l', bS = u + '-s';
    var defs =
      lin(gB, [[0, col, 0.35], [1, col, 0]], 0, 1, 0, 0) +
      rad(gC, [[0, col, 0.4], [0.6, col, 0.16], [1, col, 0]], 0.5, 0.5, 0.5) +
      rad(gW, [[0, '#FFFFFF', 0.55], [1, '#FFFFFF', 0]], 0.5, 0.5, 0.5) +
      E('path', { id: bL, d: 'M0 -16 L15 -122 L-15 -122 Z', fill: 'url(#' + gB + ')' }) +
      E('path', { id: bS, d: 'M0 -16 L11 -97 L-11 -97 Z', fill: 'url(#' + gB + ')' });
    var i, beams = '';
    for (i = 0; i < 12; i++) beams += use(i % 2 ? bS : bL, 'rotate(' + (i * 30) + ')');
    var s = E('g', { transform: 'translate(120 120)' },
      E('circle', { cx: 0, cy: 0, r: 54, fill: 'url(#' + gC + ')' }) +
      E('g', { 'class': 'env-rays' }, beams) +
      E('circle', { cx: 0, cy: 0, r: 26, fill: 'url(#' + gW + ')' }));
    return wrap('0 0 240 240', 'xMidYMid slice', defs, s);
  }

  /* ---------- sparkles: süzülen ışıltılar ---------- */

  function sparkles () {
    var u = uid('sparkles'), sp = u + '-s', dt = u + '-d';
    var defs =
      E('path', { id: sp, d: 'M0 -10 Q2.2 -2.2 10 0 Q2.2 2.2 0 10 Q-2.2 2.2 -10 0 Q-2.2 -2.2 0 -10 Z' }) +
      E('circle', { id: dt, cx: 0, cy: 0, r: 3 });
    var cols = ['#FFE9A8', '#FFD76B', '#FFFFFF'];
    var rnd = seeded(hash('yuvo-sparkles'));
    var s = '', i, x, y, sc;
    for (i = 0; i < 12; i++) {
      x = N(26 + rnd() * 308);
      y = N(26 + rnd() * 308);
      sc = N(0.5 + rnd() * 0.9);
      s += use(i % 3 === 2 ? dt : sp, 'translate(' + x + ' ' + y + ') scale(' + sc + ')',
               { fill: cols[i % 3], opacity: N(0.6 + rnd() * 0.35), 'class': 'env-sp', style: '--i:' + i });
    }
    return wrap('0 0 360 360', 'xMidYMid slice', defs, s);
  }

  /* ---------- basket: sticker reçeteli hasır yuva sepeti ---------- */

  function basket () {
    var u = uid('basket');
    var halo = u + '-halo', gb = u + '-b', gr = u + '-r', w = u + '-w';
    var defs =
      '<filter id="' + halo + '" x="-14%" y="-14%" width="128%" height="128%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/>' +
      '<feFlood flood-color="#FFFFFF"/>' +
      '<feComposite in2="d" operator="in" result="h"/>' +
      '<feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      lin(gb, [[0, '#B77B3F'], [1, '#8E5A2B']], 0, 0, 0, 1) +
      lin(gr, [[0, '#B77B3F'], [0.55, '#B77B3F'], [1, '#8E5A2B']], 0, 0, 0, 1) +
      E('path', { id: w,
        d: 'M0 0 Q10 9 20 0 Q30 9 40 0 Q50 9 60 0 Q70 9 80 0 Q90 9 100 0 Q110 9 120 0 Q130 9 140 0',
        fill: 'none', stroke: LINE, 'stroke-width': 2.2, opacity: 0.4, 'stroke-linecap': 'round' });
    var body =
      E('path', { d: 'M45 70 Q47 116 60 134 Q72 148 120 148 Q168 148 180 134 Q193 116 195 70 Z',
        fill: 'url(#' + gb + ')', stroke: LINE, 'stroke-width': 4, 'stroke-linejoin': 'round' }) +
      use(w, 'translate(50 88)') +
      use(w, 'translate(54 106) scale(0.95 1)') +
      use(w, 'translate(59 124) scale(0.87 1)') +
      E('ellipse', { cx: 120, cy: 141.5, rx: 50, ry: 4.6, fill: '#8E5A2B', opacity: 0.5 }) +
      E('ellipse', { cx: 74, cy: 88, rx: 15, ry: 5.6, fill: '#FFFFFF', opacity: 0.3,
        transform: 'rotate(-14 74 88)' }) +
      E('rect', { x: 32, y: 52, width: 176, height: 30, rx: 15, fill: 'url(#' + gr + ')',
        stroke: LINE, 'stroke-width': 4 }) +
      E('ellipse', { cx: 66, cy: 61, rx: 23, ry: 5.2, fill: '#FFFFFF', opacity: 0.55,
        transform: 'rotate(-3 66 61)' }) +
      E('circle', { cx: 97, cy: 66, r: 2.6, fill: '#FFFFFF', opacity: 0.4 });
    var s =
      E('ellipse', { cx: 120, cy: 156, rx: 82, ry: 8.5, fill: '#8E5A2B', opacity: 0.18 }) +
      E('g', { filter: 'url(#' + halo + ')' }, body);
    return wrap('0 0 240 170', 'xMidYMid meet', defs, s);
  }

  /* ---------- tableWood: atölye masası (yalnız marka kahveleri) ---------- */

  function tableWood () {
    var u = uid('wood'), g = u + '-g';
    var defs = E('g', { id: g },
      E('path', { d: 'M0 0 Q30 6 62 2 Q96 -3 130 3', fill: 'none', stroke: '#8E5A2B',
        'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.15 }) +
      E('path', { d: 'M6 12 Q44 17 84 12 Q110 8.6 128 13', fill: 'none', stroke: '#8E5A2B',
        'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.12 }));
    var s =
      E('rect', { x: 0, y: 0, width: 360, height: 200, fill: '#FFE9C4' }) +
      E('path', { d: 'M0 52H360M0 103H360M0 152H360', fill: 'none', stroke: '#B77B3F',
        'stroke-width': 2.5, opacity: 0.28 }) +
      use(g, 'translate(18 22)') +
      use(g, 'translate(146 72) scale(1.15 1)') +
      use(g, 'translate(40 166)') +
      E('ellipse', { cx: 86, cy: 128, rx: 9, ry: 5.6, fill: 'none', stroke: '#8E5A2B',
        'stroke-width': 2, opacity: 0.1 }) +
      E('ellipse', { cx: 86, cy: 128, rx: 3.4, ry: 2, fill: '#8E5A2B', opacity: 0.1 }) +
      E('ellipse', { cx: 272, cy: 28, rx: 8, ry: 5, fill: 'none', stroke: '#8E5A2B',
        'stroke-width': 2, opacity: 0.09 }) +
      E('ellipse', { cx: 272, cy: 28, rx: 3, ry: 1.8, fill: '#8E5A2B', opacity: 0.09 }) +
      E('rect', { x: 0, y: 0, width: 360, height: 16, fill: '#FFF9EC', opacity: 0.35 });
    return wrap('0 0 360 200', 'xMidYMid slice', defs, s);
  }

  /* ---------- paper: albüm kâğıdı (hafif grain + köşe vinyeti) ---------- */

  function paper () {
    var u = uid('paper'), nId = u + '-n';
    var rnd = seeded(hash('yuvo-paper'));
    var d = '', i;
    for (i = 0; i < 14; i++) {
      d += 'M' + N(8 + rnd() * 158) + ' ' + N(8 + rnd() * 158) + 'h.6';
    }
    var defs = E('path', { id: nId, d: d, fill: 'none', stroke: '#8A6B4F',
      'stroke-width': 2.6, 'stroke-linecap': 'round' });
    var s =
      E('rect', { x: 0, y: 0, width: 360, height: 360, fill: '#FFF9EC' }) +
      use(nId, null, { opacity: 0.05 }) +
      use(nId, 'rotate(90 180 180)', { opacity: 0.04 }) +
      use(nId, 'rotate(180 180 180)', { opacity: 0.05 }) +
      use(nId, 'rotate(270 180 180)', { opacity: 0.04 }) +
      E('ellipse', { cx: 0, cy: 0, rx: 150, ry: 120, fill: '#FFE9C4', opacity: 0.06 }) +
      E('ellipse', { cx: 360, cy: 0, rx: 150, ry: 120, fill: '#FFE9C4', opacity: 0.06 }) +
      E('ellipse', { cx: 0, cy: 360, rx: 150, ry: 120, fill: '#FFE9C4', opacity: 0.06 }) +
      E('ellipse', { cx: 360, cy: 360, rx: 150, ry: 120, fill: '#FFE9C4', opacity: 0.06 });
    return wrap('0 0 360 360', 'xMidYMid slice', defs, s);
  }

  /* ---------- flowers: dekoratif kenar çelengi ---------- */

  function flowers () {
    var u = uid('flowers'), p = u + '-p', f = u + '-f', l = u + '-l';
    var defs =
      E('ellipse', { id: p, cx: 0, cy: -6.4, rx: 3.4, ry: 5.6, stroke: LINE, 'stroke-width': 1.2 }) +
      E('g', { id: f },
        use(p) + use(p, 'rotate(72)') + use(p, 'rotate(144)') +
        use(p, 'rotate(216)') + use(p, 'rotate(288)') +
        E('circle', { cx: 0, cy: 0, r: 3.4, fill: '#FFF9EC', stroke: LINE, 'stroke-width': 1.2 }) +
        E('circle', { cx: -1.1, cy: -1.1, r: 1.1, fill: '#FFFFFF', opacity: 0.9 })) +
      E('g', { id: l },
        E('path', { d: 'M0 0 Q-8 -1.6 -12 -8.6 Q-4.4 -8 0 0 Z', fill: '#8ED94F', stroke: LINE,
          'stroke-width': 1.2, 'stroke-linejoin': 'round' }) +
        E('path', { d: 'M0 0 Q8 -1.6 12 -8.6 Q4.4 -8 0 0 Z', fill: '#8ED94F', stroke: LINE,
          'stroke-width': 1.2, 'stroke-linejoin': 'round' }));
    var s = '', i, x;
    for (i = 0; i < 7; i++) {
      x = 36 + i * 48;
      if (i % 2 === 0) {
        s += use(f, 'translate(' + x + ' 32) scale(' + (i % 4 === 0 ? 1 : 0.85) + ')',
                 { fill: (i % 4 === 0 ? '#FF8FB0' : '#FFC734') });
      } else {
        s += use(l, 'translate(' + x + ' 38)');
      }
    }
    return wrap('0 0 360 56', 'xMidYMax meet', defs, s);
  }

  /* ---------- kamu API ---------- */

  Y.art.env = {
    meadow: meadow,
    sky: sky,
    rays: rays,
    clouds: clouds,
    basket: basket,
    tableWood: tableWood,
    paper: paper,
    flowers: flowers,
    sparkles: sparkles
  };
})();
