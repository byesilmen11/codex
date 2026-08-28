/* =====================================================================
   YUVO SANAT SİSTEMİ — pufi-svg.js  (sahip: sanat-lideri)
   =====================================================================
   BAĞLAYICI STİL KILAVUZU (karakter ressamları buna uyar — istisna yok)

   1) MARKA DİLİ — "ŞEKER-VİNİL STICKER"
      Her Pufi ve her yumurta, bir çıkartma (sticker) gibi durur:
      kalın yumuşak TEK RENK koyu kontur + beyaz sticker halesi +
      şeker-vinil dolgu. Keskin köşe YOK; her form yuvarlak.

   2) ANATOMİ ORANLARI (viewBox "0 0 120 120")
      - Kafa/gövde ≈ 1:1 (tombul, bebek oranı). Kafa merkezi ~ (60,44),
        yarıçap 19–22; gövde merkezi ~ (60,81), rx 22–26, ry 18–21.
      - Ayaklar y≈99–101'de biter; zemin gölgesini API çizer (siz çizmeyin).
      - Karakter x=60'ta ortalanır; toplam kapladığı alan ~ x:22–98, y:12–102.
      - Uzuvlar kısa ve tıknaz; boyun yok (kafa gövdeye oturur).

   3) KONTUR (tek renk, yumuşak koyu)
      - Renk: INK '#4A3653' (sıcak patlıcan-moru). Siyah YASAK.
      - Kalınlık: dış formlarda LW=3.5, iç detayda LW2=2.4.
      - stroke-linejoin/linecap daima 'round'.
      - Primitifler (ball/blob/caps/drop/leaf/path) konturu otomatik basar;
        kapatmak için {line:false}.

   4) BEYAZ STICKER HALESİ
      - API, karakteri feMorphology-dilate filtresiyle beyaz hale içine alır
        (silüette kapalı). Ressam kendisi hale ÇİZMEZ.

   5) ŞEKER-VİNİL DOLGU REÇETESİ (her büyük form için)
      a. c.vinyl(ad, açık, koyu): 2-duraklı radyal gradyan
         (odak sol-üst: cx .36, cy .28, r 1.05) — ışık daima SOL-ÜSTten.
      b. c.gloss(cx,cy,rx,ry,rot): sol-üste eğik BEYAZ PARLAMA ŞERİDİ
         (op .55) + minik ikincil damla — "yeni vinil" hissi.
      c. c.bounce(cx,cy,rx,ry): formun ALT kenarında yumuşak yansıma
         (op ~.18) — yerden sekmiş ışık, hacmi tamamlar.

   6) GÖZ SİSTEMİ (iri, çift parlamalı) — c.eyes(cx,cy,o)
      - İri INK ovaller (r 4.4–5.2, ry = r*1.18), aralarında dx 7–9.
      - ÇİFT parlama: büyük beyaz nokta sol-üst (r*0.42) + küçük nokta
        sağ-alt (r*0.2). Efsanevi'de {spark:true} → yıldız parlaması.
      - mood 'sleep' → kirpikli kapalı kapaklar (otomatik).
      - Yanaklar: c.cheeks — pembe '#FFA4B8', op ~.55, gözlerin alt-dışında.

   7) İFADE VARYANTLARI
      - 'happy' (varsayılan): açık gözler + gülümseme/açık ağız.
      - 'sleep': kapalı kapaklar + mini nefes ağzı (c.mouth otomatik).
      - Ağız tipleri: 'smile' | 'open' (dilli) | 'o' | 'none'.

   8) NADİRLİK IŞIMASI
      - Efsanevi/Gizli karakterde aura + yıldız/parıltı ZORUNLU.
      - registerKind tanımında {ownAura:true} diyen ressam aurayı kendi
        çizer; demezse API nadirliğe göre standart aurayı ekler.

   9) KAYIT SÖZLEŞMESİ — Yuvo.art.registerKind(kind, def)
      def = {
        pufi(c, opts)  -> string   // 120×120 iç markup; c.mood'a saygılı
        parts(c)       -> { govde, bas, aksesuar }  // 3 sticker-parça,
                                   // her biri kendi karesinde ortalanmış
        ownAura?: true             // aurayı kendim çizdim
      }
      Kayıtsız kind → sevimli "gizemli Pufi" yer tutucusu.
      Ressam SVG stringini YALNIZ c.* primitifleriyle üretir; gradyan
      id'leri c.vinyl/c.lin üzerinden alınır (SEQ sayaçlı, çakışmaz).
   ===================================================================== */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  var Y = window.Yuvo;
  Y.art = Y.art || {};

  var INK   = '#4A3653';   // tek kontur rengi (sıcak patlıcan moru)
  var SIL   = '#4B3B60';   // silüet dolgusu
  var CHEEK = '#FFA4B8';   // yanak pembesi
  var LW    = 3.5;         // dış kontur
  var LW2   = 2.4;         // iç detay konturu

  /* ---------- temel yardımcılar ---------- */

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

  function mix (a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in b) r[k] = b[k]; return r; }

  function hash (s) {
    s = String(s);
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
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

  // Aynı sanat aynı sayfada tekrar basıldığında gradient/clip/filter id'leri
  // çakışmasın diye artan örnek sayacı (mevcut çözüm korunur).
  var SEQ = 0;

  /* ---------- çizim bağlamı (c) — ressam alet çantası ---------- */

  function outAttrs (c, o, w) {
    o = o || {};
    if (o.line === false) return {};
    return {
      stroke: c.sil ? SIL : (o.lc || INK),
      'stroke-width': N(o.lw || w || LW),
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    };
  }

  function rotAt (deg, x, y) {
    return deg ? 'rotate(' + N(deg) + ' ' + N(x) + ' ' + N(y) + ')' : null;
  }

  function makeCtx (id, opts) {
    opts = opts || {};
    var h = hash(id);
    var c = {
      id: id,
      uid: 'yv-' + sanit(id) + '-' + (opts.tag || 'm') + '-' + (SEQ++),
      sil: !!opts.sil,
      mood: opts.mood === 'sleep' ? 'sleep' : 'happy',
      defs: [],
      INK: INK, SIL: SIL, CHEEK: CHEEK, LW: LW, LW2: LW2,
      E: E, N: N
    };

    // 0..1 deterministik mikro-varyasyon (aynı id → aynı sanat)
    c.v = function (n) { return ((h >>> ((n * 5) % 27)) & 31) / 31; };

    // Dolgu güvenliği: silüette her şey SIL
    c.paint = function (f) { return c.sil ? SIL : f; };
    c.flat  = c.paint;
    c.ink   = function () { return c.sil ? SIL : INK; };
    c.o     = function (v) { return c.sil ? 1 : v; };

    /* --- şeker-vinil gradyanlar --- */
    c.vinyl = function (name, lt, dk, o) {
      if (c.sil) return SIL;
      o = o || {};
      var gid = c.uid + '-' + name;
      var mid = o.md ? '<stop offset="0.55" stop-color="' + o.md + '"/>' : '';
      c.defs.push(
        '<radialGradient id="' + gid + '" cx="' + (o.cx != null ? o.cx : 0.36) +
        '" cy="' + (o.cy != null ? o.cy : 0.28) + '" r="' + (o.r != null ? o.r : 1.05) + '">' +
        '<stop offset="0" stop-color="' + lt + '"/>' + mid +
        '<stop offset="1" stop-color="' + dk + '"/></radialGradient>');
      return 'url(#' + gid + ')';
    };
    c.lin = function (name, stops, x1, y1, x2, y2) {
      if (c.sil) return SIL;
      var gid = c.uid + '-' + name, s = '', i;
      for (i = 0; i < stops.length; i++) {
        s += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"' +
             (stops[i][2] != null ? ' stop-opacity="' + stops[i][2] + '"' : '') + '/>';
      }
      c.defs.push('<linearGradient id="' + gid + '" x1="' + x1 + '" y1="' + y1 +
                  '" x2="' + x2 + '" y2="' + y2 + '">' + s + '</linearGradient>');
      return 'url(#' + gid + ')';
    };

    /* --- konturlu form primitifleri --- */
    c.ball = function (cx, cy, r, fill, o) {
      o = o || {};
      return E('circle', mix({ cx: N(cx), cy: N(cy), r: N(r), fill: c.paint(fill),
        opacity: o.op != null ? c.o(o.op) : null }, outAttrs(c, o)));
    };
    c.blob = function (cx, cy, rx, ry, fill, o) {
      o = o || {};
      return E('ellipse', mix({ cx: N(cx), cy: N(cy), rx: N(rx), ry: N(ry), fill: c.paint(fill),
        opacity: o.op != null ? c.o(o.op) : null, transform: rotAt(o.rot, cx, cy) }, outAttrs(c, o)));
    };
    c.caps = function (cx, cy, w, hh, fill, o) {
      o = o || {};
      var rx = (o.rx != null) ? o.rx : Math.min(w, hh) / 2;
      return E('rect', mix({ x: N(cx - w / 2), y: N(cy - hh / 2), width: N(w), height: N(hh),
        rx: N(rx), fill: c.paint(fill), opacity: o.op != null ? c.o(o.op) : null,
        transform: rotAt(o.rot, cx, cy) }, outAttrs(c, o)));
    };
    c.drop = function (cx, cy, r, len, fill, o) { // damla: sivri uç yukarıda, top altta
      o = o || {};
      var d = 'M' + N(cx) + ' ' + N(cy - len) +
              ' Q' + N(cx + r * 0.92) + ' ' + N(cy - len * 0.42) + ' ' + N(cx + r) + ' ' + N(cy) +
              ' A' + N(r) + ' ' + N(r) + ' 0 0 1 ' + N(cx - r) + ' ' + N(cy) +
              ' Q' + N(cx - r * 0.92) + ' ' + N(cy - len * 0.42) + ' ' + N(cx) + ' ' + N(cy - len) + ' Z';
      return E('path', mix({ d: d, fill: c.paint(fill), opacity: o.op != null ? c.o(o.op) : null,
        transform: rotAt(o.rot, cx, cy) }, outAttrs(c, o)));
    };
    c.leaf = function (cx, cy, rx, ry, fill, o) { // iki ucu sivri yaprak/petal
      o = o || {};
      var d = 'M' + N(cx) + ' ' + N(cy - ry) +
              ' Q' + N(cx + rx) + ' ' + N(cy) + ' ' + N(cx) + ' ' + N(cy + ry) +
              ' Q' + N(cx - rx) + ' ' + N(cy) + ' ' + N(cx) + ' ' + N(cy - ry) + ' Z';
      return E('path', mix({ d: d, fill: c.paint(fill), opacity: o.op != null ? c.o(o.op) : null,
        transform: rotAt(o.rot, cx, cy) }, outAttrs(c, o)));
    };
    c.path = function (d, fill, o) {
      o = o || {};
      return E('path', mix({ d: d, fill: c.paint(fill), opacity: o.op != null ? c.o(o.op) : null,
        transform: o.tr || null }, outAttrs(c, o)));
    };
    c.line = function (d, w, col, o) {
      o = o || {};
      return E('path', { d: d, stroke: c.sil ? SIL : col, 'stroke-width': N(w), fill: 'none',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        opacity: o.op != null ? c.o(o.op) : null,
        'stroke-dasharray': o.dash || null });
    };
    c.rope = function (d, w, col, o) { // konturlu kalın şerit (kuyruk/sap)
      o = o || {};
      var s = E('path', { d: d, stroke: c.sil ? SIL : (o.lc || INK), 'stroke-width': N(w + 4.4),
        fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      s += E('path', { d: d, stroke: c.paint(col), 'stroke-width': N(w), fill: 'none',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      if (o.hi && !c.sil) {
        s += E('path', { d: d, stroke: '#FFFFFF', 'stroke-width': N(Math.max(1.4, w * 0.32)),
          fill: 'none', 'stroke-linecap': 'round', opacity: 0.4 });
      }
      return s;
    };

    /* --- ışık: parlama şeridi + alt yansıma --- */
    c.gloss = function (cx, cy, rx, ry, rot) {
      if (c.sil) return '';
      return E('ellipse', { cx: N(cx), cy: N(cy), rx: N(rx), ry: N(ry), fill: '#FFFFFF',
               opacity: 0.55, transform: rotAt(rot == null ? -18 : rot, cx, cy) }) +
             E('circle', { cx: N(cx + rx * 0.9), cy: N(cy + ry * 1.7), r: N(Math.max(1.2, rx * 0.28)),
               fill: '#FFFFFF', opacity: 0.32 });
    };
    c.bounce = function (cx, cy, rx, ry, col, op) {
      if (c.sil) return '';
      return E('ellipse', { cx: N(cx), cy: N(cy), rx: N(rx), ry: N(ry),
        fill: col || '#FFFFFF', opacity: op != null ? op : 0.18 });
    };
    c.dot = function (x, y, r, op) {
      if (c.sil) return '';
      return E('circle', { cx: N(x), cy: N(y), r: N(r), fill: '#FFFFFF', opacity: op != null ? op : 0.7 });
    };

    /* --- yüz sistemi --- */
    c.eyes = function (cx, cy, o) {
      if (c.sil) return '';
      o = o || {};
      var dx = o.dx != null ? o.dx : 8;
      var r  = o.r  != null ? o.r  : 4.8;
      var ry = o.ry != null ? o.ry : r * 1.18;
      var closed = (c.mood === 'sleep') || o.closed;
      var s = '', i, ex;
      for (i = -1; i <= 1; i += 2) {
        ex = cx + dx * i;
        if (closed) {
          s += E('path', { d: 'M' + N(ex - r) + ' ' + N(cy) + ' Q' + N(ex) + ' ' + N(cy + r * 1.05) +
                 ' ' + N(ex + r) + ' ' + N(cy), stroke: INK, 'stroke-width': 2.8, fill: 'none',
                 'stroke-linecap': 'round' });
          if (o.lash !== false) {
            s += E('path', { d: 'M' + N(ex + r * 0.72 * i) + ' ' + N(cy + r * 0.72) + ' L' +
                   N(ex + r * 1.2 * i) + ' ' + N(cy + r * 1.2), stroke: INK, 'stroke-width': 2,
                   fill: 'none', 'stroke-linecap': 'round' });
          }
        } else {
          s += E('ellipse', { cx: N(ex), cy: N(cy), rx: N(r), ry: N(ry), fill: INK });
          if (o.spark) {
            s += c.sparkle(ex - r * 0.2, cy - ry * 0.26, r * 0.66, '#FFFFFF', 0.95);
            s += E('circle', { cx: N(ex + r * 0.32), cy: N(cy + ry * 0.34), r: N(r * 0.2),
                   fill: '#FFFFFF', opacity: 0.85 });
          } else {
            s += E('circle', { cx: N(ex - r * 0.3), cy: N(cy - ry * 0.32), r: N(r * 0.42), fill: '#FFFFFF' });
            s += E('circle', { cx: N(ex + r * 0.32), cy: N(cy + ry * 0.3), r: N(r * 0.2),
                   fill: '#FFFFFF', opacity: 0.9 });
          }
        }
      }
      return s;
    };
    c.cheeks = function (cx, cy, dx, o) {
      if (c.sil) return '';
      o = o || {};
      var rx = o.rx || 4.2, ry = o.ry || 2.8, op = o.op != null ? o.op : 0.55;
      return E('ellipse', { cx: N(cx - dx), cy: N(cy), rx: N(rx), ry: N(ry), fill: CHEEK, opacity: op }) +
             E('ellipse', { cx: N(cx + dx), cy: N(cy), rx: N(rx), ry: N(ry), fill: CHEEK, opacity: op });
    };
    c.mouth = function (cx, cy, type, o) {
      if (c.sil || type === 'none') return '';
      o = o || {};
      var w = o.w || 9;
      if (c.mood === 'sleep' && !o.force) {
        return E('path', { d: 'M' + N(cx - 2.6) + ' ' + N(cy) + ' Q' + N(cx) + ' ' + N(cy + 2.2) +
               ' ' + N(cx + 2.6) + ' ' + N(cy), stroke: INK, 'stroke-width': 2.2, fill: 'none',
               'stroke-linecap': 'round' });
      }
      if (type === 'open') {
        return E('path', { d: 'M' + N(cx - w / 2) + ' ' + N(cy) +
                 ' Q' + N(cx) + ' ' + N(cy + w * 0.95) + ' ' + N(cx + w / 2) + ' ' + N(cy) +
                 ' Q' + N(cx) + ' ' + N(cy + w * 0.16) + ' ' + N(cx - w / 2) + ' ' + N(cy) + ' Z',
                 fill: INK, 'stroke-linejoin': 'round' }) +
               E('path', { d: 'M' + N(cx - w * 0.22) + ' ' + N(cy + w * 0.3) +
                 ' Q' + N(cx) + ' ' + N(cy + w * 0.64) + ' ' + N(cx + w * 0.22) + ' ' + N(cy + w * 0.3) +
                 ' Q' + N(cx) + ' ' + N(cy + w * 0.4) + ' ' + N(cx - w * 0.22) + ' ' + N(cy + w * 0.3) + ' Z',
                 fill: '#FF8FA0' });
      }
      if (type === 'o') return E('circle', { cx: N(cx), cy: N(cy + 1), r: 2.2, fill: INK });
      return E('path', { d: 'M' + N(cx - w / 2) + ' ' + N(cy) + ' Q' + N(cx) + ' ' + N(cy + w * 0.5) +
             ' ' + N(cx + w / 2) + ' ' + N(cy), stroke: INK, 'stroke-width': 2.6, fill: 'none',
             'stroke-linecap': 'round' });
    };
    c.face = function (cx, cy, o) { // pratik birleşik yüz
      if (c.sil) return '';
      o = o || {};
      var s = c.eyes(cx, cy - 2, o.eyes || {});
      if (o.cheeks !== false) {
        var edx = (o.eyes && o.eyes.dx != null ? o.eyes.dx : 8);
        s += c.cheeks(cx, cy + 4.5, edx + 6, o.cheekOpts || {});
      }
      s += c.mouth(cx, cy + (o.my != null ? o.my : 6.5), o.m || 'smile', o.mOpts || {});
      return s;
    };

    /* --- karakter parçaları --- */
    c.beak = function (cx, cy, w, col, o) { // gaga (o.open → sevinçli açık)
      o = o || {};
      var dk = o.dk || col;
      var open = o.open && c.mood !== 'sleep' && !c.sil;
      var s = c.path('M' + N(cx - w / 2) + ' ' + N(cy) +
              ' Q' + N(cx) + ' ' + N(cy - w * 0.52) + ' ' + N(cx + w / 2) + ' ' + N(cy) +
              ' Q' + N(cx) + ' ' + N(cy + w * (open ? 0.3 : 0.55)) + ' ' + N(cx - w / 2) + ' ' + N(cy) + ' Z',
              col, { lw: LW2 });
      if (open) {
        s += c.path('M' + N(cx - w * 0.32) + ' ' + N(cy + w * 0.22) +
             ' Q' + N(cx) + ' ' + N(cy + w * 0.78) + ' ' + N(cx + w * 0.32) + ' ' + N(cy + w * 0.22) +
             ' Q' + N(cx) + ' ' + N(cy + w * 0.4) + ' ' + N(cx - w * 0.32) + ' ' + N(cy + w * 0.22) + ' Z',
             dk, { lw: LW2 });
      }
      return s;
    };
    c.earRound = function (cx, cy, r, fill, inner) { // fare/ayı kulağı
      var s = c.ball(cx, cy, r, fill, {});
      if (!c.sil) {
        s += E('circle', { cx: N(cx), cy: N(cy + r * 0.08), r: N(r * 0.55), fill: inner });
        s += c.dot(cx - r * 0.38, cy - r * 0.38, r * 0.2, 0.6);
      }
      return s;
    };
    c.antenna = function (d, col, tx, ty, tr) { // anten: eğri sap + top uç
      return c.line(d, 2.6, c.sil ? SIL : col) + c.ball(tx, ty, tr || 3, col, { lw: LW2 });
    };
    c.sparkle = function (x, y, s, col, op) { // 4 uçlu ışıltı
      return E('path', { d: 'M' + N(x) + ' ' + N(y - s) +
        ' Q' + N(x + s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x + s) + ' ' + N(y) +
        ' Q' + N(x + s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x) + ' ' + N(y + s) +
        ' Q' + N(x - s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x - s) + ' ' + N(y) +
        ' Q' + N(x - s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x) + ' ' + N(y - s) + ' Z',
        fill: c.sil ? SIL : col, opacity: c.sil ? 1 : (op != null ? op : 0.9) });
    };
    c.moon = function (cx, cy, r, col, o) { // hilal (ağzı sağa bakar)
      o = o || {};
      var d = 'M' + N(cx) + ' ' + N(cy - r) +
              ' A' + N(r) + ' ' + N(r) + ' 0 1 0 ' + N(cx) + ' ' + N(cy + r) +
              ' A' + N(r * 1.55) + ' ' + N(r * 1.55) + ' 0 0 1 ' + N(cx) + ' ' + N(cy - r) + ' Z';
      return E('path', mix({ d: d, fill: c.paint(col), transform: rotAt(o.rot, cx, cy),
        opacity: o.op != null ? c.o(o.op) : null }, outAttrs(c, o, LW2)));
    };
    c._hn = 0;
    c.aura = function (col, cy, r, a) { // nadirlik ışıması (arka plan)
      if (c.sil) return '';
      var gid = c.uid + '-au' + (c._hn++);
      a = a != null ? a : 0.5;
      c.defs.push(
        '<radialGradient id="' + gid + '" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="' + col + '" stop-opacity="' + N(a) + '"/>' +
        '<stop offset="0.65" stop-color="' + col + '" stop-opacity="' + N(a * 0.42) + '"/>' +
        '<stop offset="1" stop-color="' + col + '" stop-opacity="0"/></radialGradient>');
      return E('circle', { cx: 60, cy: cy != null ? N(cy) : 58, r: r != null ? N(r) : 54,
        fill: 'url(#' + gid + ')' });
    };

    /* --- poz yardımcıları --- */
    c.grp  = function (attrs, inner) { return E('g', attrs, inner); };
    c.move = function (x, y, inner) {
      return E('g', { transform: 'translate(' + N(x) + ' ' + N(y) + ')' }, inner);
    };
    c.spin = function (deg, px, py, inner) {
      return E('g', { transform: 'rotate(' + N(deg) + ' ' + N(px) + ' ' + N(py) + ')' }, inner);
    };
    c.zoom = function (s, px, py, inner) {
      return E('g', { transform: 'translate(' + N(px * (1 - s)) + ' ' + N(py * (1 - s)) +
        ') scale(' + N(s) + ')' }, inner);
    };

    return c;
  }

  function svgWrap (c, inner) {
    var defs = c.defs.length ? '<defs>' + c.defs.join('') + '</defs>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true">' +
           defs + inner + '</svg>';
  }

  // Beyaz sticker halesi: karakter grubunu dilate-beyaz filtresine sarar.
  function sticker (c, inner) {
    if (c.sil || !inner) return inner;
    var fid = c.uid + '-stk';
    c.defs.push(
      '<filter id="' + fid + '" x="-18%" y="-18%" width="136%" height="136%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="yvd"/>' +
      '<feFlood flood-color="#FFFFFF"/>' +
      '<feComposite in2="yvd" operator="in" result="yvh"/>' +
      '<feMerge><feMergeNode in="yvh"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>');
    return '<g filter="url(#' + fid + ')">' + inner + '</g>';
  }

  // Zemin gölgesi (API basar; ressam çizmez)
  function groundShadow (op, ry) {
    return E('ellipse', { cx: 60, cy: 104.5, rx: 25, ry: ry || 4.6, fill: SIL, opacity: op || 0.14 });
  }
  /* =====================================================================
     KAYIT SİSTEMİ — Yuvo.art.registerKind
     ===================================================================== */

  var KINDS = {};

  Y.art.registerKind = function (kind, def) {
    if (!kind || !def || typeof def.pufi !== 'function') return false;
    KINDS[String(kind)] = def;
    return true;
  };

  /* --- yer tutucu: "gizemli Pufi" (kayıtsız kind sevimli kalır) --- */

  function placeholderPufi (c) {
    var LT = '#EFE4FB', DK = '#B49BDD';
    var s = '';
    // ayaklar
    s += c.caps(48, 98, 13, 8, '#C9B4E8', {});
    s += c.caps(72, 98, 13, 8, '#C9B4E8', {});
    // tombul gövde-baş tek kütle
    s += c.blob(60, 68, 29, 33, c.vinyl('bd', LT, DK), {});
    s += c.blob(60, 86, 15, 11, '#F8F1FF', { line: false, op: 0.9 });
    s += c.gloss(46, 48, 9.5, 6);
    s += c.bounce(60, 95, 17, 5, '#EFE4FB');
    // filiz anten + soru kıvrımı
    s += c.antenna('M60 35 Q59 24 64 19', '#8F76C2', 65, 17.5, 3.2);
    s += c.line('M64 19 Q72 14 74 21 Q75 26 69 26', 2.6, c.sil ? SIL : '#8F76C2');
    // yüz
    s += c.face(60, 60, { eyes: { dx: 9, r: 5 }, m: 'smile' });
    return s;
  }

  function placeholderParts (c) {
    var LT = '#EFE4FB', DK = '#B49BDD';
    return {
      govde: c.caps(49, 84, 13, 8, '#C9B4E8', {}) + c.caps(71, 84, 13, 8, '#C9B4E8', {}) +
             c.blob(60, 60, 28, 26, c.vinyl('bd', LT, DK), {}) +
             c.blob(60, 72, 14, 9, '#F8F1FF', { line: false, op: 0.9 }) +
             c.gloss(47, 44, 9, 5.5),
      bas:   c.ball(60, 60, 26, c.vinyl('hd', LT, DK), {}) + c.gloss(48, 48, 8.5, 5) +
             c.face(60, 62, { eyes: { dx: 9.5, r: 5.2 }, m: 'smile' }),
      aksesuar: c.antenna('M60 78 Q58 58 66 48', '#8F76C2', 68, 45, 4.2) +
                c.line('M68 45 Q80 38 82 48 Q83 55 74 55', 3, c.sil ? SIL : '#8F76C2') +
                c.sparkle(40, 52, 5, '#D9C6F5', 0.9) + c.sparkle(84, 72, 4, '#D9C6F5', 0.8)
    };
  }

  var PLACEHOLDER = { pufi: placeholderPufi, parts: placeholderParts };

  function kindDef (pufi) {
    var kind = (pufi && pufi.kind) ? String(pufi.kind) : '';
    return KINDS[kind] || PLACEHOLDER;
  }

  /* =====================================================================
     BEŞ ÖRNEK KARAKTER (kalite çıtası — ressamlar bu düzeye çıkar)
     ===================================================================== */

  /* --- 1. CİVCİV (cikcik) — sarı tombiş, horoz çırağı --- */

  function civcivBits (c) {
    var LT = '#FFF6BE', DK = '#FFC531', WG = '#F5A623', FT = '#FF9F3D';
    var b = {};
    b.tail = c.drop(85, 84, 4.6, 12, c.vinyl('tl', '#FFE98F', WG), { rot: 118 });
    b.feet = c.caps(48, 99, 13, 8, FT, {}) + c.caps(72, 99, 13, 8, FT, {});
    b.body = c.blob(60, 80, 25, 21, c.vinyl('bd', LT, DK), {}) +
             c.blob(60, 86, 13.5, 10.5, '#FFF1B0', { line: false, op: 0.95 }) +
             c.gloss(47.5, 67, 9.5, 5.5) +
             c.bounce(60, 96, 16, 4.6, '#FFF3C0', 0.22);
    b.wingL = c.drop(35.5, 82, 6.8, 14, c.vinyl('w1', '#FFEC9E', WG), { rot: -150 });
    b.wingR = c.drop(84.5, 82, 6.8, 14, c.vinyl('w2', '#FFEC9E', WG), { rot: 150 });
    b.head = c.ball(60, 43, 21.5, c.vinyl('hd', LT, DK), {}) +
             c.gloss(49.5, 32.5, 8.2, 4.6);
    b.crest = c.drop(52, 26.5, 3.3, 8.5, c.vinyl('c1', '#FFEC9E', WG), { rot: -16 }) +
              c.drop(60, 23.5, 3.9, 10.5, c.vinyl('c2', '#FFF3B8', WG), {}) +
              c.drop(68, 26.5, 3.3, 8.5, c.vinyl('c3', '#FFEC9E', WG), { rot: 16 });
    b.face = c.eyes(60, 42, { dx: 8.6, r: 4.9 }) +
             c.cheeks(60, 49, 14.6, {}) +
             c.beak(60, 52.5, 9.5, FT, { open: true, dk: '#E8842B' });
    return b;
  }

  Y.art.registerKind('civciv', {
    pufi: function (c) {
      var b = civcivBits(c);
      return b.tail + b.feet + b.body + b.wingL + b.wingR + b.head + b.crest + b.face;
    },
    parts: function (c) {
      var b = civcivBits(c);
      return {
        govde: c.move(0, -10, b.tail + b.feet + b.body),
        bas:   c.zoom(1.25, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.35, 60, 60,
          c.move(0, 22, b.crest) +
          c.move(14, -14, b.wingL) + c.move(-14, -14, b.wingR))
      };
    }
  });

  /* --- 2. FARE (toprik) — tarla faresi, kulağında başak --- */

  function fareBits (c) {
    var LT = '#F5F2FB', DK = '#BDB6D4', EAR = '#FFC4D9', TAIL = '#F49CC0';
    var b = {};
    b.tail = c.rope('M79 90 Q104 94 102 75 Q100 62 88 67', 6, TAIL, { hi: true });
    b.feet = c.caps(48, 99, 13, 8, '#E3DDF2', {}) + c.caps(72, 99, 13, 8, '#E3DDF2', {});
    b.body = c.blob(60, 81, 24.5, 20, c.vinyl('bd', LT, DK), {}) +
             c.blob(60, 86.5, 13.5, 10, '#FDFBFF', { line: false, op: 0.95 }) +
             c.gloss(48, 68, 9, 5.2) +
             c.bounce(60, 96, 15, 4.4, '#F5F2FB', 0.2);
    b.paws = c.ball(45, 89, 4.6, c.vinyl('p1', LT, DK), { lw: LW2 }) +
             c.ball(75, 89, 4.6, c.vinyl('p2', LT, DK), { lw: LW2 });
    b.ears = c.earRound(40, 26, 11.5, c.vinyl('e1', LT, DK), EAR) +
             c.earRound(80, 26, 11.5, c.vinyl('e2', LT, DK), EAR);
    // başak (hasat şarkıları!): kulağın arkasına sıkıştırılmış
    var wheat = c.line('M87 33 Q92 24 92 15', 2.6, c.sil ? SIL : '#D9A43C');
    var gy = [15, 19, 23], i;
    for (i = 0; i < 3; i++) {
      wheat += c.leaf(89 - i * 0.6, gy[i], 2.6, 4.4, '#F2C14E', { rot: -28, lw: 1.8 });
      wheat += c.leaf(94.6 + i * 0.4, gy[i] + 1, 2.6, 4.4, '#F2C14E', { rot: 28, lw: 1.8 });
    }
    b.wheat = wheat;
    b.head = c.blob(60, 45, 22, 20.5, c.vinyl('hd', LT, DK), {}) +
             c.gloss(49, 34.5, 8.4, 4.6);
    b.face = c.eyes(60, 42.5, { dx: 9, r: 4.7 }) +
             c.cheeks(60, 49.5, 15, {}) +
             c.blob(60, 54, 7.2, 5.4, '#FDFBFF', { line: false, op: 0.95 }) +
             c.path('M57.6 50.6 Q60 48.6 62.4 50.6 Q60.6 53.4 60 53.4 Q59.4 53.4 57.6 50.6 Z',
                    '#F4779B', { lw: 1.8 }) +
             c.mouth(60, 55.5, 'smile', { w: 7 }) +
             (c.sil ? '' : c.line('M38 48 Q31 47 26 48 M39 52 Q33 53 28 55', 1.6, '#B9AECE', { op: 0.85 }) +
                           c.line('M82 48 Q89 47 94 48 M81 52 Q87 53 92 55', 1.6, '#B9AECE', { op: 0.85 }));
    return b;
  }

  Y.art.registerKind('fare', {
    pufi: function (c) {
      var b = fareBits(c);
      return b.tail + b.feet + b.body + b.paws + b.wheat + b.ears + b.head + b.face;
    },
    parts: function (c) {
      var b = fareBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.feet + b.body + b.paws),
        bas:   c.zoom(1.2, 60, 45, c.move(0, 12, b.head + b.face)),
        aksesuar: c.zoom(1.15, 60, 60,
          c.move(8, 26, b.ears) + c.move(-24, 30, b.wheat))
      };
    }
  });

  /* --- 3. KELEBEK (pirpir) — şeker pembesi kanatlar --- */

  function kelebekBits (c) {
    var WLT = '#FFD9EC', WDK = '#FF8FC8', LLT = '#FFE9C9', LDK = '#FFB566';
    var BLT = '#DCCFF7', BDK = '#8F79D9';
    var b = {};
    function upperWing (cx, cy, rot, n) {
      return c.blob(cx, cy, 17.5, 21.5, c.vinyl('uw' + n, WLT, WDK), { rot: rot }) +
             c.blob(cx, cy, 10.8, 14, '#FFF2F9', { line: false, op: 0.9, rot: rot }) +
             c.ball(cx, cy - 4, 3.4, '#FFB56B', { lw: 1.8 }) +
             c.ball(cx + (rot < 0 ? -3 : 3), cy + 6.5, 2.2, '#FF8FC8', { lw: 1.6 });
    }
    function lowerWing (cx, cy, rot, n) {
      return c.blob(cx, cy, 11.5, 13.5, c.vinyl('lw' + n, LLT, LDK), { rot: rot }) +
             c.blob(cx, cy + 1, 6.4, 8, '#FFF6E8', { line: false, op: 0.85, rot: rot }) +
             c.ball(cx, cy + 2, 2, '#FFB566', { lw: 1.5 });
    }
    b.wings = upperWing(33.5, 49, -22, 1) + upperWing(86.5, 49, 22, 2) +
              lowerWing(40, 80, 16, 1) + lowerWing(80, 80, -16, 2);
    b.body = c.caps(60, 77, 17.5, 37, c.vinyl('bd', BLT, BDK), { rx: 8.6 }) +
             c.gloss(55.5, 65, 4.2, 7.5, -8) +
             c.bounce(60, 91, 6.5, 3.4, '#EFE8FC', 0.24);
    b.head = c.ball(60, 44, 16, c.vinyl('hd', BLT, BDK), {}) +
             c.gloss(52.5, 36.5, 5.6, 3.4);
    b.ant = c.antenna('M53 31 Q47 21 41 18', '#7A66C2', 40, 17, 3) +
            c.antenna('M67 31 Q73 21 79 18', '#7A66C2', 80, 17, 3);
    b.face = c.eyes(60, 43, { dx: 6.6, r: 4.4 }) +
             c.cheeks(60, 49, 11.6, { rx: 3.6, ry: 2.4 }) +
             c.mouth(60, 51, 'smile', { w: 7 });
    b.spark = c.sparkle(22, 30, 4, '#FFD9EC', 0.85) + c.sparkle(98, 32, 3.4, '#FFE9C9', 0.85) +
              c.sparkle(25, 74, 3, '#FFD9EC', 0.7);
    return b;
  }

  Y.art.registerKind('kelebek', {
    pufi: function (c) {
      var b = kelebekBits(c);
      return b.wings + b.body + b.head + b.ant + b.face + b.spark;
    },
    parts: function (c) {
      var b = kelebekBits(c);
      return {
        govde: c.zoom(1.15, 60, 78, b.body),
        bas:   c.zoom(1.3, 60, 44, c.move(0, 14, b.head + b.ant + b.face)),
        aksesuar: c.zoom(0.98, 60, 60, c.move(0, 12, b.wings))
      };
    }
  });
  /* --- 4. GÜNEŞ KUŞU (gundogan) — EFSANEVİ: güneş diski + alev sorguç --- */

  function guneskusuBits (c) {
    var LT = '#FFE4A6', DK = '#FF9C3F', CO = '#FF7E4E', GOLD = '#FFD76B';
    var b = {};
    // katmanlı altın aura
    b.aura = c.aura('#FFB63C', 54, 56, 0.5) + c.aura('#FFE28A', 48, 34, 0.45);
    // güneş diski: ışın tacı + çekirdek
    var rays = '', i, a, x1, y1, x2, y2, x3, y3, r1 = 31, r2;
    for (i = 0; i < 12; i++) {
      a = -Math.PI / 2 + i * (Math.PI / 6);
      r2 = (i % 2 ? 38 : 44.5);
      x1 = 60 + Math.cos(a + 0.14) * r1; y1 = 50 + Math.sin(a + 0.14) * r1;
      x2 = 60 + Math.cos(a) * r2;        y2 = 50 + Math.sin(a) * r2;
      x3 = 60 + Math.cos(a - 0.14) * r1; y3 = 50 + Math.sin(a - 0.14) * r1;
      rays += c.path('M' + N(x1) + ' ' + N(y1) + ' Q' + N(x2) + ' ' + N(y2) + ' ' +
                     N(x3) + ' ' + N(y3) + ' Z', GOLD, { lw: 1.8, op: 0.95 });
    }
    b.disc = rays + c.ball(60, 50, 31, c.vinyl('sun', '#FFF3C4', '#FFC93C'), { lw: LW2 }) +
             (c.sil ? '' : E('circle', { cx: 60, cy: 50, r: 25.5, fill: 'none',
               stroke: '#FFFFFF', 'stroke-width': 2, opacity: 0.5 }));
    // görkemli kuyruk: üç kıvrık alev tüyü (sağa-yukarı yelpaze)
    b.tailF = c.drop(87, 74, 4.6, 15, c.vinyl('t3', '#FFF3B8', GOLD), { rot: 40 }) +
              c.drop(89, 81, 5.4, 17, c.vinyl('t2', '#FFEC9E', DK), { rot: 75 }) +
              c.drop(87, 88, 6.2, 19, c.vinyl('t1', GOLD, CO), { rot: 108 });
    b.feet = c.caps(48, 99.5, 13, 8, '#F26B45', {}) + c.caps(72, 99.5, 13, 8, '#F26B45', {});
    b.body = c.blob(60, 81, 24.5, 20, c.vinyl('bd', LT, DK, { md: '#FFB861' }), {}) +
             c.blob(60, 86.5, 13.5, 10.5, '#FFF3CE', { line: false, op: 0.95 }) +
             c.gloss(47.5, 68, 9.4, 5.4) +
             c.bounce(60, 96, 15.5, 4.4, '#FFE9B8', 0.26);
    // göğüste minik güneş nişanı
    b.badge = c.sil ? '' :
              c.ball(60, 86, 4.6, GOLD, { lw: 1.8 }) +
              c.sparkle(60, 86, 7.6, '#FFB63C', 0.85) +
              c.dot(58.6, 84.6, 1.2, 0.85);
    b.wingL = c.drop(35, 82, 7, 15, c.vinyl('w1', GOLD, CO), { rot: -150 });
    b.wingR = c.drop(85, 82, 7, 15, c.vinyl('w2', GOLD, CO), { rot: 150 });
    b.head = c.ball(60, 43, 21, c.vinyl('hd', LT, DK, { md: '#FFC873' }), {}) +
             c.gloss(50, 33, 8, 4.5);
    // alev sorguç: iki tonlu üç damla
    b.crest = c.drop(51, 26, 3.6, 10, c.vinyl('c1', GOLD, CO), { rot: -20 }) +
              c.drop(60, 21.5, 4.4, 13, c.vinyl('c2', '#FFEC9E', '#FF6B4A'), {}) +
              c.drop(69, 26, 3.6, 10, c.vinyl('c3', GOLD, CO), { rot: 20 }) +
              (c.sil ? '' : c.drop(60, 23.5, 2.2, 6.5, '#FFF6D0', { line: false, op: 0.95 }));
    b.face = c.eyes(60, 42, { dx: 8.4, r: 4.9, spark: true }) +
             c.cheeks(60, 49, 14.4, {}) +
             c.beak(60, 52.5, 9, '#F26B45', { open: true, dk: '#D9532E' });
    // süzülen yıldız tozu
    b.stars = c.sparkle(20, 26, 4.6, '#FFE9A8', 0.95) + c.sparkle(101, 34, 3.8, '#FFE9A8', 0.9) +
              c.sparkle(24, 70, 3.2, '#FFD76B', 0.8) + c.sparkle(97, 78, 3.6, '#FFD76B', 0.85) +
              c.dot(30, 44, 1.5, 0.8) + c.dot(94, 56, 1.4, 0.8) + c.dot(84, 18, 1.3, 0.75);
    return b;
  }

  Y.art.registerKind('guneskusu', {
    ownAura: true,
    pufi: function (c) {
      var b = guneskusuBits(c);
      return b.aura + b.disc + b.tailF + b.feet + b.body + b.badge +
             b.wingL + b.wingR + b.head + b.crest + b.face + b.stars;
    },
    parts: function (c) {
      var b = guneskusuBits(c);
      return {
        govde: c.move(0, -8, b.tailF + b.feet + b.body + b.badge + b.wingL + b.wingR),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 16, b.head + b.crest + b.face)),
        aksesuar: c.zoom(1.06, 60, 60, c.move(0, 12, b.disc) + b.stars)
      };
    }
  });

  /* --- 5. KORKULUK (hisir) — GİZLİ: ay ışığında dans eden çuval dostu --- */

  function korkulukBits (c) {
    var BLT = '#F2DFAE', BDK = '#C9A25E';   // çuval gövde
    var HLT = '#F7E8C2', HDK = '#D2AE72';   // kafa (daha aydınlık)
    var HAT1 = '#8F76C2', HAT2 = '#5C4696'; // gece moru şapka
    var STRAW = '#E8BE5C';
    var b = {};
    b.aura = c.aura('#8D7BD8', 56, 54, 0.42) + c.aura('#B9A8E8', 30, 26, 0.3);
    // gövde: yamalı çuval
    b.body = c.path('M45 61 Q38 63 38 76 L38 86 Q38 98 52 98 L68 98 Q82 98 82 86 L82 76 Q82 63 75 61 Q60 55 45 61 Z',
                    c.vinyl('bd', BLT, BDK)) +
             c.gloss(48, 68, 8.4, 4.8) +
             c.bounce(60, 93, 15, 4, '#F7EBC6', 0.2);
    // alt saman püskülü
    var straw = '', sx = [44, 50, 57, 64, 71, 77], i;
    for (i = 0; i < sx.length; i++) {
      straw += c.line('M' + sx[i] + ' 96 L' + N(sx[i] + (i % 2 ? 3.4 : -3.4)) + ' 105', 3,
                      c.sil ? SIL : STRAW);
    }
    b.straw = straw +
              c.line('M40 74 L34 70 M40 79 L33 78', 2.6, c.sil ? SIL : STRAW) +
              c.line('M80 74 L86 70 M80 79 L87 78', 2.6, c.sil ? SIL : STRAW);
    // yamalar + dikişler
    b.patch = c.caps(50, 78, 12, 11, '#E8897A', { rot: -8, rx: 3.5, lw: LW2 }) +
              (c.sil ? '' : c.line('M45.5 74 L48 76 M49 73 L51.5 75', 1.6, '#FFF1E8', { op: 0.9 })) +
              c.path('M70.8 83.2 Q73 80.6 75.2 83.2 Q77.4 85.8 71 89.8 Q64.6 85.8 66.8 83.2 Q69 80.6 70.8 83.2 Z',
                     '#EFA8C0', { lw: LW2 }) +
              (c.sil ? '' : c.line('M56 66 L60 66 M58 64 L58 68', 1.8, '#A8874E', { op: 0.9 }));
    b.head = c.ball(60, 41, 20.5, c.vinyl('hd', HLT, HDK), {}) +
             c.gloss(50, 31.5, 7.8, 4.4) +
             (c.sil ? '' : c.line('M74 30 Q77 36 76.5 42', 1.8, '#B8955A', { dash: '3 3.4', op: 0.9 }));
    // şapka: eğik uçlu gece moru sivri şapka + yıldız uç
    b.hat = c.blob(60, 25.5, 24.5, 6.6, c.vinyl('hb', HAT1, HAT2), {}) +
            c.path('M42 24 Q46 6 64 5 Q79 5 88 12 Q84 15 78 14 Q80 20 76 25 Q59 30 42 24 Z',
                   c.vinyl('hc', HAT1, HAT2)) +
            (c.sil ? '' : c.caps(60, 15, 9, 7, '#B9A8E8', { rot: -10, rx: 2.6, lw: 1.8, op: 0.95 }) +
                          c.sparkle(90, 10, 4.4, '#FFE9B0', 0.95)) +
            c.line('M46 28 L42 34 M51 29 L49 36 M72 29 L76 35', 2.6, c.sil ? SIL : STRAW);
    // yüz: hilal parlamalı iri gözler + dikiş gülümseme
    var eyes;
    if (c.sil) { eyes = ''; }
    else if (c.mood === 'sleep') {
      eyes = c.eyes(60, 41, { dx: 8.6, r: 4.8 });
    } else {
      eyes = E('ellipse', { cx: 51.4, cy: 41, rx: 4.8, ry: 5.6, fill: INK }) +
             E('ellipse', { cx: 68.6, cy: 41, rx: 4.8, ry: 5.6, fill: INK }) +
             c.moon(50.2, 39.4, 2, '#FFF3D6', { line: false, rot: 24 }) +
             c.moon(67.4, 39.4, 2, '#FFF3D6', { line: false, rot: 24 }) +
             c.dot(52.8, 43, 0.9, 0.85) + c.dot(70, 43, 0.9, 0.85);
    }
    b.face = eyes +
             c.cheeks(60, 47.5, 14.4, { op: 0.5 }) +
             (c.sil ? '' : c.line('M53 51 Q60 56 67 51', 2.6, INK, { dash: '4 3' }) +
                           c.line('M56.4 53.2 L56 56 M60.2 54.4 L60.2 57.2 M64 53.2 L64.4 56', 1.6, INK, { op: 0.85 }));
    // yüzen hilal + gece yıldızları
    b.moonAcc = c.moon(97, 30, 7.5, '#FFE9B0', { lw: LW2, rot: -18 }) +
                c.sparkle(22, 34, 4, '#C9BCF2', 0.9) + c.sparkle(30, 78, 3.2, '#C9BCF2', 0.8) +
                c.sparkle(100, 62, 3.4, '#C9BCF2', 0.85) + c.dot(88, 46, 1.4, 0.75) +
                c.dot(26, 56, 1.3, 0.7);
    return b;
  }

  Y.art.registerKind('korkuluk', {
    ownAura: true,
    pufi: function (c) {
      var b = korkulukBits(c);
      return b.aura + b.moonAcc + b.body + b.straw + b.patch + b.head + b.face + b.hat;
    },
    parts: function (c) {
      var b = korkulukBits(c);
      return {
        govde: c.move(0, -12, b.body + b.straw + b.patch),
        bas:   c.zoom(1.2, 60, 41, c.move(0, 19, b.head + b.face)),
        aksesuar: c.zoom(1.25, 60, 60, c.move(0, 40, b.hat) + c.move(-14, 34, b.moonAcc))
      };
    }
  });
  /* =====================================================================
     KAMU API — imzalar ARCHITECTURE.md ile birebir
     ===================================================================== */

  var AURA_BY_RARITY = { efsanevi: '#FFB63C', gizli: '#8D7BD8' };

  Y.art.hasKind = function (kind) { return !!KINDS[String(kind)]; };

  function buildPufi (pufi, opts) {
    var id = (pufi && pufi.id) ? String(pufi.id) : 'pufi';
    var c = makeCtx(id, opts);
    var def = kindDef(pufi);
    var body;
    try { body = def.pufi(c, opts || {}); }
    catch (e) { def = PLACEHOLDER; body = placeholderPufi(c); }
    if (!body) { def = PLACEHOLDER; body = placeholderPufi(c); }
    return { c: c, def: def, body: body };
  }

  Y.art.pufiSVG = function (pufi, opts) {
    opts = opts || {};
    var r = buildPufi(pufi, { tag: 'm', mood: opts.mood });
    var inner = '';
    var auraCol = AURA_BY_RARITY[(pufi && pufi.rarity) || ''];
    if (auraCol && !r.def.ownAura) inner += r.c.aura(auraCol, 58, 54, 0.5);
    inner += groundShadow();
    inner += sticker(r.c, r.body);
    return svgWrap(r.c, inner);
  };

  Y.art.pufiSilhouetteSVG = function (pufi) {
    var r = buildPufi(pufi, { tag: 's', sil: true });
    return svgWrap(r.c, r.body);
  };

  Y.art.toyParts = function (pufi) {
    var id = (pufi && pufi.id) ? String(pufi.id) : 'pufi';
    var order = ['govde', 'bas', 'aksesuar'];
    var tags = { govde: 'pg', bas: 'pb', aksesuar: 'pa' };
    var out = [], i, c, def, piece, set;
    for (i = 0; i < order.length; i++) {
      c = makeCtx(id, { tag: tags[order[i]] });
      def = kindDef(pufi);
      piece = '';
      try {
        set = (typeof def.parts === 'function') ? def.parts(c) : null;
        piece = (set && set[order[i]]) ? set[order[i]] : '';
      } catch (e) { piece = ''; }
      if (!piece) { // savunmacı: boş parça olmasın
        try { set = placeholderParts(c); piece = set[order[i]] || ''; } catch (e2) {}
        if (!piece) piece = c.ball(60, 60, 14, '#C9B4E8', {});
      }
      out.push({ id: order[i], svg: svgWrap(c, sticker(c, piece)) });
    }
    return out;
  };

  Y.art.toyAssembledSVG = function (pufi) {
    var r = buildPufi(pufi, { tag: 't' });
    var c = r.c;
    var inner = '';
    var auraCol = AURA_BY_RARITY[(pufi && pufi.rarity) || ''];
    if (auraCol && !r.def.ownAura) inner += c.aura(auraCol, 56, 54, 0.5);
    inner += E('ellipse', { cx: 60, cy: 108, rx: 33, ry: 5.5, fill: SIL, opacity: 0.15 });
    // vinil kaide + üstünde oyuncak — tek sticker kütlesi
    var ped = c.blob(60, 104, 32, 7.5, c.vinyl('ped', '#FFF8E8', '#E0CFA8'), {}) +
              c.blob(60, 102, 25, 4, '#FFFDF6', { line: false, op: 0.85 });
    inner += sticker(c, ped + c.zoom(0.94, 60, 103, r.body));
    inner += c.sparkle(21, 30, 4.4, '#FFE28A', 0.95) +
             c.sparkle(99, 23, 3.6, '#FFE28A', 0.9) +
             c.sparkle(103, 74, 3, '#FFD9EC', 0.8);
    return svgWrap(c, inner);
  };

  /* =====================================================================
     YUMURTALAR — oyunun kahramanı
     Hacimli vinil kabuk: INK kontur + beyaz sticker halesi + 6 nadirlik
     kaplaması + crack 0-3 (3'te içten ışık sızar).
     ===================================================================== */

  var EGG_D = 'M60 13 C82 13 96 41 96 67 C96 90 80 106 60 106 C40 106 24 90 24 67 C24 41 38 13 60 13 Z';

  var EGGS = {
    yaygin:    { lt: '#FFFDF4', dk: '#E0D2B4', crack: '#8A7458' },
    azbulunur: { lt: '#F2FBEA', dk: '#AEDB96', crack: '#54804A' },
    nadir:     { lt: '#F4FCFF', dk: '#A2D6E8', crack: '#3E7E9E' },
    destansi:  { lt: '#F9F1FF', dk: '#C79EEB', crack: '#7A4EA8' },
    efsanevi:  { lt: '#FFF9E2', dk: '#F2C258', crack: '#A87A2E', aura: '#FFB63C' },
    gizli:     { lt: '#8F7ED0', dk: '#463781', crack: '#2A2058', aura: '#8D7BD8' }
  };

  var CRACKS = [
    'M62 22 L53 32 L63 40 L55 49',
    'M55 49 L66 56 L57 65 M63 40 L73 46 L68 54',
    'M57 65 L46 70 L57 78 L49 87 M73 46 L81 56 L73 63 L80 72 M46 70 L37 66'
  ];

  function sp4 (x, y, s, col, op) { // bağımsız 4 uçlu ışıltı (yumurta için)
    return E('path', { d: 'M' + N(x) + ' ' + N(y - s) +
      ' Q' + N(x + s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x + s) + ' ' + N(y) +
      ' Q' + N(x + s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x) + ' ' + N(y + s) +
      ' Q' + N(x - s * 0.22) + ' ' + N(y + s * 0.22) + ' ' + N(x - s) + ' ' + N(y) +
      ' Q' + N(x - s * 0.22) + ' ' + N(y - s * 0.22) + ' ' + N(x) + ' ' + N(y - s) + ' Z',
      fill: col, opacity: op });
  }

  function eggTexture (rarity, P, rnd) {
    var t = '', i, x, y;
    if (rarity === 'yaygin') { // mat: usulca çilli krem
      for (i = 0; i < 5; i++) {
        x = 36 + rnd() * 48; y = 36 + rnd() * 52;
        t += E('circle', { cx: N(x), cy: N(y), r: N(1.2 + rnd() * 1.2), fill: '#D9C8A4', opacity: 0.5 });
      }
    } else if (rarity === 'azbulunur') { // benekli: iki ton yeşil puan
      for (i = 0; i < 12; i++) {
        var a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd());
        x = 60 + Math.cos(a) * rr * 29; y = 62 + Math.sin(a) * rr * 36;
        t += E('circle', { cx: N(x), cy: N(y), r: N(1.6 + rnd() * 1.9),
               fill: (i % 2 ? '#6FBE62' : '#4E9E54'), opacity: 0.55 });
      }
    } else if (rarity === 'nadir') { // sedef: eğik ışıltı şeridi + mikro yıldız tozu
      t += E('ellipse', { cx: 47, cy: 50, rx: 36, ry: 8.5, fill: '#FFFFFF', opacity: 0.45,
             transform: 'rotate(-24 47 50)' });
      t += E('ellipse', { cx: 50, cy: 47, rx: 36, ry: 2.6, fill: '#F5D9EE', opacity: 0.5,
             transform: 'rotate(-24 50 47)' });
      t += E('ellipse', { cx: 66, cy: 76, rx: 32, ry: 5.5, fill: '#FFFFFF', opacity: 0.3,
             transform: 'rotate(-24 66 76)' });
      t += E('ellipse', { cx: 68, cy: 73, rx: 32, ry: 2, fill: '#BFEAF5', opacity: 0.55,
             transform: 'rotate(-24 68 73)' });
      for (i = 0; i < 7; i++) {
        x = 32 + rnd() * 54; y = 30 + rnd() * 60;
        t += E('circle', { cx: N(x), cy: N(y), r: 1, fill: '#FFFFFF', opacity: 0.75 });
      }
      t += sp4(74, 40, 3, '#FFFFFF', 0.9);
    } else if (rarity === 'destansi') { // akış deseni: hareket hissi
      t += E('path', { d: 'M20 50 Q34 41 48 50 Q62 59 76 50 Q88 42 100 49', stroke: '#A86BE0',
             'stroke-width': 3.4, fill: 'none', opacity: 0.5, 'stroke-linecap': 'round' });
      t += E('path', { d: 'M20 68 Q34 59 48 68 Q62 77 76 68 Q88 60 100 67', stroke: '#8F4ED0',
             'stroke-width': 3, fill: 'none', opacity: 0.42, 'stroke-linecap': 'round' });
      t += E('path', { d: 'M26 86 Q40 78 54 85 Q68 92 84 85', stroke: '#A86BE0',
             'stroke-width': 2.6, fill: 'none', opacity: 0.35, 'stroke-linecap': 'round' });
      for (i = 0; i < 5; i++) {
        x = 34 + rnd() * 52; y = 28 + rnd() * 62;
        t += E('rect', { x: N(x - 2.1), y: N(y - 2.1), width: 4.2, height: 4.2, rx: 1.3,
               fill: '#8F4ED0', opacity: 0.45,
               transform: 'rotate(45 ' + N(x) + ' ' + N(y) + ')' });
      }
      t += E('path', { d: 'M78 32 Q84 28 90 30', stroke: '#C79EEB', 'stroke-width': 2.4,
             fill: 'none', opacity: 0.7, 'stroke-linecap': 'round' }) +
           E('circle', { cx: 76, cy: 33, r: 2, fill: '#C79EEB', opacity: 0.8 });
    } else if (rarity === 'efsanevi') { // altın ışıma + minik yıldızlar
      t += E('ellipse', { cx: 56, cy: 50, rx: 25, ry: 19, fill: '#FFF6D0', opacity: 0.75 });
      t += E('path', { d: 'M34 78 Q46 92 66 92', stroke: '#FFFFFF', 'stroke-width': 2.6,
             fill: 'none', opacity: 0.45, 'stroke-linecap': 'round' });
      t += sp4(46, 42, 5.4, '#FFD76B', 0.95) + sp4(74, 58, 4.4, '#FFD76B', 0.9) +
           sp4(52, 82, 3.6, '#FFE9A8', 0.85) + sp4(78, 34, 3, '#FFFFFF', 0.95) +
           sp4(38, 62, 2.6, '#FFFFFF', 0.85);
      for (i = 0; i < 5; i++) {
        x = 34 + rnd() * 52; y = 28 + rnd() * 62;
        t += E('circle', { cx: N(x), cy: N(y), r: 1.1, fill: '#FFF3B8', opacity: 0.85 });
      }
    } else if (rarity === 'gizli') { // gece moru: hilal + yıldız tozu bulutu
      t += E('ellipse', { cx: 48, cy: 74, rx: 22, ry: 14, fill: '#B9A8E8', opacity: 0.22 });
      t += E('path', { d: 'M70 34 A11.5 11.5 0 1 0 70 57 A15.5 15.5 0 0 1 70 34 Z',
             fill: '#FFE9B0', opacity: 0.95, stroke: P.crack, 'stroke-width': 2,
             'stroke-linejoin': 'round' });
      t += sp4(44, 40, 3.4, '#D9CFFA', 0.9) + sp4(52, 60, 2.6, '#D9CFFA', 0.8) +
           sp4(80, 72, 3, '#D9CFFA', 0.85) + sp4(38, 84, 2.4, '#D9CFFA', 0.75);
      for (i = 0; i < 6; i++) {
        x = 32 + rnd() * 54; y = 28 + rnd() * 64;
        t += E('circle', { cx: N(x), cy: N(y), r: N(0.9 + rnd() * 0.7), fill: '#D9CFFA', opacity: 0.8 });
      }
    }
    return t;
  }

  Y.art.eggSVG = function (rarity, opts) {
    rarity = EGGS[rarity] ? rarity : 'yaygin';
    var P = EGGS[rarity];
    var crack = Math.max(0, Math.min(3, (opts && opts.crack) | 0));
    var uid = 'yv-egg-' + rarity + '-' + (SEQ++);
    var rnd = seeded(hash('egg-' + rarity));
    var defs = [], inner = '', i;

    defs.push(
      '<radialGradient id="' + uid + '-g" cx="0.37" cy="0.27" r="1.02">' +
      '<stop offset="0" stop-color="' + P.lt + '"/>' +
      '<stop offset="1" stop-color="' + P.dk + '"/></radialGradient>');
    defs.push('<clipPath id="' + uid + '-c"><path d="' + EGG_D + '"/></clipPath>');
    defs.push(
      '<filter id="' + uid + '-stk" x="-18%" y="-18%" width="136%" height="136%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="yvd"/>' +
      '<feFlood flood-color="#FFFFFF"/>' +
      '<feComposite in2="yvd" operator="in" result="yvh"/>' +
      '<feMerge><feMergeNode in="yvh"/><feMergeNode in="SourceGraphic"/></feMerge></filter>');

    // aura (efsanevi altın / gizli gece moru)
    if (P.aura) {
      defs.push(
        '<radialGradient id="' + uid + '-a" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="' + P.aura + '" stop-opacity="0.55"/>' +
        '<stop offset="0.65" stop-color="' + P.aura + '" stop-opacity="0.24"/>' +
        '<stop offset="1" stop-color="' + P.aura + '" stop-opacity="0"/></radialGradient>');
      inner += E('circle', { cx: 60, cy: 60, r: 58, fill: 'url(#' + uid + '-a)' });
    }

    inner += E('ellipse', { cx: 60, cy: 108, rx: 27, ry: 5, fill: SIL, opacity: 0.15 });

    // --- sticker gövde ---
    var egg = E('path', { d: EGG_D, fill: 'url(#' + uid + '-g)', stroke: INK,
      'stroke-width': LW, 'stroke-linejoin': 'round' });

    var clipped = eggTexture(rarity, P, rnd);

    // üst parlama şeridi + alt yansıma (vinil reçetesi)
    var glossOp = (rarity === 'yaygin') ? 0.38 : (rarity === 'gizli' ? 0.3 : 0.55);
    clipped += E('ellipse', { cx: 46, cy: 34, rx: 7.5, ry: 13.5, fill: '#FFFFFF',
      opacity: glossOp, transform: 'rotate(24 46 34)' });
    clipped += E('circle', { cx: 52, cy: 52, r: 2.6, fill: '#FFFFFF', opacity: glossOp * 0.6 });
    clipped += E('ellipse', { cx: 60, cy: 97, rx: 16, ry: 5.5,
      fill: rarity === 'gizli' ? '#B9A8E8' : '#FFFFFF', opacity: rarity === 'gizli' ? 0.24 : 0.18 });

    // çatlaklar (birikimli); 3. aşamada içten ışık sızar
    if (crack > 0) {
      var cg = '';
      if (crack >= 3) {
        defs.push(
          '<radialGradient id="' + uid + '-b" cx="0.5" cy="0.5" r="0.5">' +
          '<stop offset="0" stop-color="#FFF3B8" stop-opacity="0.95"/>' +
          '<stop offset="1" stop-color="#FFF3B8" stop-opacity="0"/></radialGradient>');
        cg += E('circle', { cx: 58, cy: 54, r: 26, fill: 'url(#' + uid + '-b)' });
        for (i = 0; i < crack; i++) {
          cg += E('path', { d: CRACKS[i], stroke: '#FFEDA8', 'stroke-width': 6.5, fill: 'none',
                 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 });
        }
      }
      for (i = 0; i < crack; i++) {
        cg += E('path', { d: CRACKS[i], stroke: '#FFFFFF', 'stroke-width': 4.4, fill: 'none',
               'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.3 });
        cg += E('path', { d: CRACKS[i], stroke: P.crack, 'stroke-width': 2.6, fill: 'none',
               'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9 });
      }
      clipped += cg;
    }

    egg += E('g', { 'clip-path': 'url(#' + uid + '-c)' }, clipped);
    inner += '<g filter="url(#' + uid + '-stk)">' + egg + '</g>';

    // kabuk çevresinde süzülen ışıltılar (tören/sepette büyük boyda şahane)
    if (rarity === 'efsanevi') {
      inner += sp4(21, 34, 4.6, '#FFD76B', 0.95) + sp4(101, 44, 3.8, '#FFD76B', 0.9) +
               sp4(96, 92, 3, '#FFE9A8', 0.8);
    } else if (rarity === 'gizli') {
      inner += sp4(20, 40, 3.8, '#B9A8E8', 0.9) + sp4(100, 52, 3.2, '#B9A8E8', 0.85) +
               sp4(94, 90, 2.6, '#D9CFFA', 0.8);
    } else if (rarity === 'destansi') {
      inner += sp4(22, 42, 3.2, '#C79EEB', 0.8) + sp4(99, 56, 2.8, '#C79EEB', 0.75);
    }
    if (crack >= 3) {
      inner += sp4(30, 26, 4, '#FFEDA8', 0.95) + sp4(94, 30, 3.4, '#FFEDA8', 0.9);
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true"><defs>' +
           defs.join('') + '</defs>' + inner + '</svg>';
  };
})();
