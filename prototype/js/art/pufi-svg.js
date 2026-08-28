/* Yuvo — pufi-svg.js (art-audio ajanı)
   İnline SVG üretimi: yumurta, Pufi, silüet, oyuncak parçaları, birleşmiş oyuncak.
   Stil: docs/10 "vinil oyuncak" — yuvarlak formlar, pastel + canlı vurgu,
   yumuşak radyal gradyan + parlama noktası + kocaman gözler.
   Tümü deterministik (id hash'i); gradient id'leri pufi id önekli (çakışma yok). */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  var Y = window.Yuvo;
  Y.art = Y.art || {};

  var SIL = '#3A3550';      // silüet rengi
  var INK = '#2B2440';      // göz/ağız

  /* ---------- küçük yardımcılar ---------- */

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

  // Aynı sanat aynı sayfada tekrar basıldığında gradient/clipPath id'leri
  // çakışmasın diye artan örnek sayacı (geçerli DOM: id'ler belge içinde tekil).
  var SEQ = 0;

  /* ---------- çizim bağlamı (ctx) ---------- */

  function makeCtx (id, opts) {
    opts = opts || {};
    var h = hash(id);
    var c = {
      id: id,
      uid: 'yv-' + sanit(id) + '-' + (opts.tag || 'm') + '-' + (SEQ++),
      sil: !!opts.sil,
      mood: opts.mood === 'sleep' ? 'sleep' : 'happy',
      defs: [],
      E: E, N: N
    };
    // 0..1 arası deterministik mikro-varyasyon
    c.v = function (n) { return ((h >>> ((n * 5) % 27)) & 31) / 31; };
    // radyal vinil gradyanı; silüette düz koyu renk
    c.g = function (name, lt, md, dk) {
      if (c.sil) return SIL;
      var gid = c.uid + '-' + name;
      c.defs.push(
        '<radialGradient id="' + gid + '" cx="0.35" cy="0.3" r="0.9">' +
        '<stop offset="0" stop-color="' + lt + '"/>' +
        '<stop offset="0.55" stop-color="' + md + '"/>' +
        '<stop offset="1" stop-color="' + dk + '"/>' +
        '</radialGradient>');
      return 'url(#' + gid + ')';
    };
    c.f = function (col) { return c.sil ? SIL : col; };      // düz dolgu
    c.st = function (col) { return c.sil ? SIL : col; };     // stroke rengi
    c.o = function (v) { return c.sil ? 1 : v; };            // opaklık (silüette tam)
    c.gloss = function (cx, cy, rx, ry) {                    // parlama noktası
      if (c.sil) return '';
      return E('ellipse', { cx: N(cx), cy: N(cy), rx: N(rx), ry: N(ry), fill: '#FFFFFF', opacity: 0.5 }) +
             E('ellipse', { cx: N(cx + rx * 0.9), cy: N(cy + ry * 1.3), rx: N(rx * 0.35), ry: N(ry * 0.35), fill: '#FFFFFF', opacity: 0.25 });
    };
    c._hn = 0;
    c.halo = function (col, cy, r) {                          // efsanevi/gizli ışıması
      if (c.sil) return '';
      var gid = c.uid + '-halo' + (c._hn++);
      c.defs.push(
        '<radialGradient id="' + gid + '" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="' + col + '" stop-opacity="0.55"/>' +
        '<stop offset="0.7" stop-color="' + col + '" stop-opacity="0.22"/>' +
        '<stop offset="1" stop-color="' + col + '" stop-opacity="0"/>' +
        '</radialGradient>');
      return E('circle', { cx: 60, cy: cy || 58, r: r || 52, fill: 'url(#' + gid + ')' });
    };
    // kocaman gözler + ağız + yanaklar
    c.face = function (cx, cy, o) {
      if (c.sil) return '';
      o = o || {};
      var dx = (o.dx || 8) + (c.v(1) - 0.5) * 1.4;
      var ey = cy - 2 + (o.ey || 0);
      var r = o.r || 4.6;
      var s = '';
      var closed = (c.mood === 'sleep') || o.lidded;
      if (closed) {
        s += E('path', { d: 'M' + N(cx - dx - 4) + ' ' + N(ey) + ' Q' + N(cx - dx) + ' ' + N(ey + 4) + ' ' + N(cx - dx + 4) + ' ' + N(ey),
                         stroke: INK, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' });
        s += E('path', { d: 'M' + N(cx + dx - 4) + ' ' + N(ey) + ' Q' + N(cx + dx) + ' ' + N(ey + 4) + ' ' + N(cx + dx + 4) + ' ' + N(ey),
                         stroke: INK, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' });
      } else {
        if (o.onDark) {
          s += E('circle', { cx: N(cx - dx), cy: N(ey), r: N(r + 1.6), fill: '#FFF8F0' });
          s += E('circle', { cx: N(cx + dx), cy: N(ey), r: N(r + 1.6), fill: '#FFF8F0' });
        }
        s += E('circle', { cx: N(cx - dx), cy: N(ey), r: N(r), fill: INK });
        s += E('circle', { cx: N(cx + dx), cy: N(ey), r: N(r), fill: INK });
        if (!o.noHi) {
          s += E('circle', { cx: N(cx - dx - r * 0.32), cy: N(ey - r * 0.36), r: N(r * 0.36), fill: '#FFFFFF' });
          s += E('circle', { cx: N(cx + dx - r * 0.32), cy: N(ey - r * 0.36), r: N(r * 0.36), fill: '#FFFFFF' });
        }
      }
      if (o.mouth !== 'none') {
        var my = ey + (o.my || 8);
        if (closed) {
          s += E('path', { d: 'M' + N(cx - 2.5) + ' ' + N(my) + ' Q' + N(cx) + ' ' + N(my + 2) + ' ' + N(cx + 2.5) + ' ' + N(my),
                           stroke: INK, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' });
        } else {
          s += E('path', { d: 'M' + N(cx - 4) + ' ' + N(my) + ' Q' + N(cx) + ' ' + N(my + 3.5) + ' ' + N(cx + 4) + ' ' + N(my),
                           stroke: INK, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' });
        }
      }
      if (o.cheeks !== false) {
        var co = 0.4 + c.v(2) * 0.2;
        s += E('ellipse', { cx: N(cx - dx - 6.5), cy: N(ey + 6), rx: 3.6, ry: 2.3, fill: '#FF9EAE', opacity: N(co) });
        s += E('ellipse', { cx: N(cx + dx + 6.5), cy: N(ey + 6), rx: 3.6, ry: 2.3, fill: '#FF9EAE', opacity: N(co) });
      }
      return s;
    };
    return c;
  }

  function svgWrap (c, inner) {
    var defs = c.defs.length ? '<defs>' + c.defs.join('') + '</defs>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true">' + defs + inner + '</svg>';
  }

  /* ---------- ortak gövde şablonları ---------- */

  function feet (c, col) {
    return E('ellipse', { cx: 50, cy: 100, rx: 6, ry: 3.4, fill: c.f(col) }) +
           E('ellipse', { cx: 70, cy: 100, rx: 6, ry: 3.4, fill: c.f(col) });
  }

  function birdBody (c, lt, md, dk, o) {
    o = o || {};
    var s = E('ellipse', { cx: 60, cy: 76, rx: o.rx || 25, ry: o.ry || 22, fill: c.g('bd', lt, md, dk) });
    s += E('ellipse', { cx: 38, cy: 78, rx: 8, ry: 13, fill: c.f(dk), transform: 'rotate(20 38 78)' });
    s += E('ellipse', { cx: 82, cy: 78, rx: 8, ry: 13, fill: c.f(dk), transform: 'rotate(-20 82 78)' });
    if (o.belly) s += E('ellipse', { cx: 60, cy: 81, rx: 13, ry: 11, fill: c.f(o.belly) });
    s += feet(c, o.feet || '#F5A05A');
    s += c.gloss(50, 66, 9, 6);
    return s;
  }

  function mamBody (c, lt, md, dk, o) {
    o = o || {};
    var s = E('ellipse', { cx: 60, cy: 78, rx: o.rx || 26, ry: o.ry || 20, fill: c.g('bd', lt, md, dk) });
    if (o.belly) s += E('ellipse', { cx: 60, cy: 82, rx: 13, ry: 11, fill: c.f(o.belly) });
    s += E('ellipse', { cx: 47, cy: 96, rx: 7, ry: 4.4, fill: c.f(dk) });
    s += E('ellipse', { cx: 73, cy: 96, rx: 7, ry: 4.4, fill: c.f(dk) });
    s += c.gloss(49, 69, 9, 5.5);
    return s;
  }

  function bugBody (c, lt, md, dk, o) {
    o = o || {};
    var s = E('ellipse', { cx: 60, cy: 78, rx: o.rx || 19, ry: o.ry || 15, fill: c.g('bd', lt, md, dk) });
    s += E('circle', { cx: 50, cy: 94, r: 3.2, fill: c.f(dk) });
    s += E('circle', { cx: 70, cy: 94, r: 3.2, fill: c.f(dk) });
    s += c.gloss(52, 71, 7, 4.5);
    return s;
  }

  function headBall (c, lt, md, dk, o) {
    o = o || {};
    var r = o.r || 19, cy = o.cy || 43;
    var s = E('circle', { cx: 60, cy: cy, r: r, fill: c.g('hd', lt, md, dk) });
    s += c.gloss(60 - r * 0.42, cy - r * 0.42, r * 0.3, r * 0.2);
    if (o.pre) s += o.pre;
    s += c.face(60, cy + 2, o.face || {});
    if (o.post) s += o.post;
    return s;
  }

  function beak (c, col, cy, w) {
    w = w || 8;
    return E('path', { d: 'M' + N(60 - w / 2) + ' ' + N(cy) + ' Q60 ' + N(cy + 8) + ' ' + N(60 + w / 2) + ' ' + N(cy) +
                          ' Q60 ' + N(cy + 3) + ' ' + N(60 - w / 2) + ' ' + N(cy) + ' Z',
                       fill: c.f(col), 'stroke-linejoin': 'round' });
  }

  function antennae (c, col, o) {
    o = o || {};
    var y0 = o.y0 || 28, len = o.len || 14, spread = o.spread || 10;
    var s = '';
    s += E('path', { d: 'M' + N(60 - spread) + ' ' + N(y0) + ' Q' + N(56 - spread) + ' ' + N(y0 - len) + ' ' + N(48 - spread) + ' ' + N(y0 - len - 2),
                     stroke: c.st(col), 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
    s += E('path', { d: 'M' + N(60 + spread) + ' ' + N(y0) + ' Q' + N(64 + spread) + ' ' + N(y0 - len) + ' ' + N(72 + spread) + ' ' + N(y0 - len - 2),
                     stroke: c.st(col), 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' });
    s += E('circle', { cx: N(48 - spread), cy: N(y0 - len - 2), r: 2.6, fill: c.f(col) });
    s += E('circle', { cx: N(72 + spread), cy: N(y0 - len - 2), r: 2.6, fill: c.f(col) });
    return s;
  }

  function crest (c, col, cx, cy) { // tepe tüyü (3 çizgi)
    return E('path', { d: 'M' + N(cx - 6) + ' ' + N(cy + 7) + ' Q' + N(cx - 8) + ' ' + N(cy - 2) + ' ' + N(cx - 4) + ' ' + N(cy),
                       stroke: c.st(col), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
           E('path', { d: 'M' + N(cx) + ' ' + N(cy + 5) + ' Q' + N(cx) + ' ' + N(cy - 5) + ' ' + N(cx + 1) + ' ' + N(cy - 1),
                       stroke: c.st(col), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
           E('path', { d: 'M' + N(cx + 6) + ' ' + N(cy + 7) + ' Q' + N(cx + 9) + ' ' + N(cy - 1) + ' ' + N(cx + 5) + ' ' + N(cy + 1),
                       stroke: c.st(col), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  }

  function combShape (c, col, big) { // horoz/tavuk ibiği
    var s = E('path', { d: big
      ? 'M46 26 Q48 10 55 20 Q58 6 64 18 Q70 8 74 24 Q62 30 46 26 Z'
      : 'M50 26 Q52 16 57 23 Q60 13 64 22 Q68 16 70 26 Q60 30 50 26 Z',
      fill: c.f(col), 'stroke-linejoin': 'round' });
    return s;
  }

  /* ---------- kind çizicileri (31) ---------- */
  /* Her çizici: { b0 (arkada), govde, bas, a1 (önde) } döndürür.
     toyParts: aksesuar = b0 + a1. */

  var KINDS = {};

  KINDS._def = function (c) { // güvenli varsayılan blob
    return {
      govde: E('ellipse', { cx: 60, cy: 76, rx: 24, ry: 21, fill: c.g('bd', '#EFE6F8', '#D8C8EE', '#B8A4D8') }) + c.gloss(50, 66, 9, 6),
      bas: headBall(c, '#EFE6F8', '#D8C8EE', '#B8A4D8', {}),
      a1: crest(c, '#B8A4D8', 60, 22)
    };
  };

  KINDS.civciv = function (c) {
    return {
      govde: birdBody(c, '#FFF6C9', '#FFE083', '#EFBE4C', { feet: '#F5A05A' }),
      bas: headBall(c, '#FFF6C9', '#FFE083', '#EFBE4C', { r: 20, cy: 42, face: { mouth: 'none' } }) + beak(c, '#F5A05A', 51, 7),
      a1: crest(c, '#EFBE4C', 60, 20)
    };
  };

  KINDS.kuzu = function (c) {
    var wool = '';
    var bumps = [[46, 26, 8], [56, 22, 9], [67, 23, 9], [76, 28, 7], [40, 33, 6], [80, 35, 6]];
    for (var i = 0; i < bumps.length; i++) {
      wool += E('circle', { cx: bumps[i][0], cy: bumps[i][1], r: bumps[i][2], fill: c.g('w' + i, '#FFFDF8', '#F3ECDD', '#DFD4C0') });
    }
    return {
      govde: mamBody(c, '#FFFDF8', '#F3ECDD', '#D8CCB6', {}),
      bas: headBall(c, '#FFF6EC', '#F8DFD0', '#E0BCA8', { r: 18, cy: 44 }),
      a1: wool +
        E('ellipse', { cx: 38, cy: 46, rx: 5.5, ry: 9, fill: c.f('#F3ECDD'), transform: 'rotate(24 38 46)' }) +
        E('ellipse', { cx: 82, cy: 46, rx: 5.5, ry: 9, fill: c.f('#F3ECDD'), transform: 'rotate(-24 82 46)' }) +
        E('ellipse', { cx: 38, cy: 47, rx: 2.6, ry: 5, fill: c.f('#F4A9B8'), transform: 'rotate(24 38 47)', opacity: c.o(0.7) }) +
        E('ellipse', { cx: 82, cy: 47, rx: 2.6, ry: 5, fill: c.f('#F4A9B8'), transform: 'rotate(-24 82 47)', opacity: c.o(0.7) })
    };
  };

  function beeDraw (c, queen) {
    var b0 = E('ellipse', { cx: 42, cy: 58, rx: 9, ry: 15, fill: c.f('#EAF6FF'), opacity: c.o(0.85), transform: 'rotate(24 42 58)' }) +
             E('ellipse', { cx: 78, cy: 58, rx: 9, ry: 15, fill: c.f('#EAF6FF'), opacity: c.o(0.85), transform: 'rotate(-24 78 58)' });
    var govde = bugBody(c, '#FFEFA8', '#FFD95C', '#E8B83A', { rx: queen ? 21 : 19 }) +
      E('ellipse', { cx: 60, cy: 74, rx: queen ? 19 : 17.5, ry: 3.6, fill: c.f('#4A4238') }) +
      E('ellipse', { cx: 60, cy: 84, rx: queen ? 16 : 14.5, ry: 3.4, fill: c.f('#4A4238') });
    var bas = headBall(c, '#FFEFA8', '#FFD95C', '#E8B83A', { r: 16, cy: 48, face: { dx: 7 } });
    var a1 = antennae(c, '#4A4238', { y0: 34, len: 12, spread: 8 });
    if (queen) {
      a1 += E('path', { d: 'M50 24 L53 15 L57 20 L60 12 L63 20 L67 15 L70 24 Q60 28 50 24 Z',
                        fill: c.f('#F2C14E'), 'stroke-linejoin': 'round' }) +
            E('circle', { cx: 60, cy: 12, r: 2, fill: c.f('#FF6F61') });
    }
    return { b0: b0, govde: govde, bas: bas, a1: a1 };
  }
  KINDS.ari = function (c) { return beeDraw(c, false); };
  KINDS.arikralice = function (c) { return beeDraw(c, true); };

  KINDS.buzagi = function (c) {
    return {
      govde: mamBody(c, '#F6E3CC', '#E8C9A8', '#C9A176', {}) +
        E('ellipse', { cx: 73, cy: 73, rx: 8, ry: 6, fill: c.f('#B98A5E'), opacity: c.o(0.8) }),
      bas: headBall(c, '#F6E3CC', '#E8C9A8', '#C9A176', { r: 19, cy: 43, face: { mouth: 'none', ey: -2 } }) +
        E('ellipse', { cx: 60, cy: 53, rx: 11, ry: 7, fill: c.f('#F7DFC8') }) +
        E('circle', { cx: 56, cy: 53, r: 1.5, fill: c.f('#B98A5E') }) +
        E('circle', { cx: 64, cy: 53, r: 1.5, fill: c.f('#B98A5E') }),
      a1: E('path', { d: 'M47 27 Q44 18 50 19 Q53 24 50 28 Z', fill: c.f('#EFE3D0'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M73 27 Q76 18 70 19 Q67 24 70 28 Z', fill: c.f('#EFE3D0'), 'stroke-linejoin': 'round' }) +
          E('ellipse', { cx: 39, cy: 38, rx: 7, ry: 4.4, fill: c.f('#E8C9A8'), transform: 'rotate(-22 39 38)' }) +
          E('ellipse', { cx: 81, cy: 38, rx: 7, ry: 4.4, fill: c.f('#E8C9A8'), transform: 'rotate(22 81 38)' })
    };
  };

  KINDS.tavuk = function (c) {
    return {
      b0: E('ellipse', { cx: 85, cy: 70, rx: 7, ry: 11, fill: c.f('#D9CDB9'), transform: 'rotate(-35 85 70)' }),
      govde: birdBody(c, '#FFFDF6', '#F5EDDE', '#D9CDB9', { feet: '#F5A623' }),
      bas: headBall(c, '#FFFDF6', '#F5EDDE', '#D9CDB9', { r: 19, cy: 43, face: { mouth: 'none' } }) + beak(c, '#F5A623', 52, 7),
      a1: combShape(c, '#FF6B6B', false) +
          E('ellipse', { cx: 60, cy: 61, rx: 3, ry: 4, fill: c.f('#FF6B6B') })
    };
  };

  KINDS.ordek = function (c) {
    return {
      b0: E('path', { d: 'M84 68 Q94 62 90 54', stroke: c.st('#EFC44E'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }),
      govde: birdBody(c, '#FFF3B8', '#FFE27A', '#EFC44E', { feet: '#FF9E3D' }),
      bas: headBall(c, '#FFF3B8', '#FFE27A', '#EFC44E', { r: 19, cy: 42, face: { mouth: 'none', ey: -2 } }),
      a1: E('ellipse', { cx: 60, cy: 53, rx: 11, ry: 4.8, fill: c.f('#FF9E3D') }) +
          E('circle', { cx: 56, cy: 51.5, r: 1.1, fill: c.f('#E07A1E') }) +
          E('circle', { cx: 64, cy: 51.5, r: 1.1, fill: c.f('#E07A1E') }) +
          (c.sil ? '' : E('ellipse', { cx: 55, cy: 52, rx: 3, ry: 1.2, fill: '#FFFFFF', opacity: 0.4 }))
    };
  };

  KINDS.cekirge = function (c) {
    return {
      b0: E('path', { d: 'M44 86 L33 68 L38 92', stroke: c.st('#6CB84A'), 'stroke-width': 6, fill: 'none',
                      'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M76 86 L87 68 L82 92', stroke: c.st('#6CB84A'), 'stroke-width': 6, fill: 'none',
                      'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
      govde: bugBody(c, '#C9EF9E', '#9ADB6E', '#6CB84A', { rx: 21, ry: 14 }),
      bas: headBall(c, '#C9EF9E', '#9ADB6E', '#6CB84A', { r: 15, cy: 50, face: { dx: 6.5 } }),
      a1: antennae(c, '#6CB84A', { y0: 37, len: 18, spread: 7 })
    };
  };

  KINDS.sincap = function (c) {
    return {
      b0: E('path', { d: 'M78 90 Q106 86 102 56 Q99 36 82 42 Q94 54 86 66 Q78 78 74 88 Z',
                      fill: c.g('tl', '#E8A25E', '#C97B3C', '#A85E28'), 'stroke-linejoin': 'round' }) +
          (c.sil ? '' : E('path', { d: 'M84 84 Q100 78 96 58', stroke: '#F2C69E', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', opacity: 0.7 })),
      govde: mamBody(c, '#F8CFA0', '#E8A25E', '#C97B3C', { rx: 24, belly: '#FFE9CF' }),
      bas: headBall(c, '#F8CFA0', '#E8A25E', '#C97B3C', { r: 18, cy: 44, face: { dx: 7.5 } }),
      a1: E('circle', { cx: 47, cy: 27, r: 5.5, fill: c.f('#E8A25E') }) +
          E('circle', { cx: 73, cy: 27, r: 5.5, fill: c.f('#E8A25E') }) +
          E('circle', { cx: 47, cy: 27.5, r: 2.6, fill: c.f('#C97B3C') }) +
          E('circle', { cx: 73, cy: 27.5, r: 2.6, fill: c.f('#C97B3C') })
    };
  };

  KINDS.ugurbocegi = function (c) {
    var spots = '';
    var sp = [[50, 68], [70, 68], [46, 80], [74, 80], [60, 86]];
    for (var i = 0; i < sp.length; i++) spots += E('circle', { cx: sp[i][0], cy: sp[i][1], r: 3, fill: c.f('#4A4238') });
    return {
      govde: E('ellipse', { cx: 60, cy: 82, rx: 19, ry: 13, fill: c.g('bd', '#7A7060', '#5A5248', '#443E36') }) +
        E('circle', { cx: 48, cy: 96, r: 3, fill: c.f('#443E36') }) +
        E('circle', { cx: 72, cy: 96, r: 3, fill: c.f('#443E36') }),
      bas: headBall(c, '#6A6054', '#4A4238', '#332E28', { r: 14, cy: 46, face: { dx: 6, r: 3.8, onDark: true, my: 7 } }),
      a1: E('path', { d: 'M41 80 Q41 58 60 58 Q79 58 79 80 Q60 90 41 80 Z',
                      fill: c.g('sh', '#FF9E8E', '#FF6F61', '#E04C3E'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M60 58 L60 86', stroke: c.st('#B03A30'), 'stroke-width': 2, 'stroke-linecap': 'round' }) +
          spots + c.gloss(50, 64, 6, 3.5) +
          antennae(c, '#4A4238', { y0: 34, len: 9, spread: 6 })
    };
  };

  KINDS.solucan = function (c) {
    var tube = 'M30 94 Q44 100 54 92 Q64 84 62 74 Q60 64 68 57 Q74 51 75 46';
    return {
      govde: E('path', { d: tube, stroke: c.g('bd', '#FCD0C8', '#F5A9A0', '#E08578'), 'stroke-width': 15,
                         fill: 'none', 'stroke-linecap': 'round' }) +
        (c.sil ? '' : E('path', { d: tube, stroke: '#FFFFFF', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.25 })),
      bas: E('circle', { cx: 76, cy: 42, r: 13, fill: c.g('hd', '#FCD0C8', '#F5A9A0', '#E08578') }) +
        c.gloss(71, 37, 4, 2.8) + c.face(76, 43, { dx: 5.5, r: 3.6, my: 7 }),
      a1: E('path', { d: 'M50 92 Q52 86 57 87', stroke: c.st('#E08578'), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M60 74 Q64 72 67 74', stroke: c.st('#E08578'), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M76 30 Q76 24 82 22', stroke: c.st('#8FBF6A'), 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }) +
          E('ellipse', { cx: 85, cy: 20, rx: 5, ry: 3, fill: c.f('#A8D878'), transform: 'rotate(-25 85 20)' })
    };
  };

  KINDS.fare = function (c) {
    return {
      b0: E('path', { d: 'M82 90 Q102 92 100 78 Q98 70 90 74', stroke: c.st('#E8A0B0'), 'stroke-width': 3,
                      fill: 'none', 'stroke-linecap': 'round' }),
      govde: mamBody(c, '#E8EAF2', '#C9CDD8', '#A8AEC0', { rx: 24 }),
      bas: headBall(c, '#E8EAF2', '#C9CDD8', '#A8AEC0', { r: 18, cy: 44, face: { mouth: 'none' } }) +
        E('circle', { cx: 60, cy: 52, r: 2.6, fill: c.f('#E8879E') }),
      a1: E('circle', { cx: 43, cy: 27, r: 11, fill: c.g('e1', '#E8EAF2', '#C9CDD8', '#A8AEC0') }) +
          E('circle', { cx: 77, cy: 27, r: 11, fill: c.g('e2', '#E8EAF2', '#C9CDD8', '#A8AEC0') }) +
          E('circle', { cx: 43, cy: 28, r: 6, fill: c.f('#FFC9D8') }) +
          E('circle', { cx: 77, cy: 28, r: 6, fill: c.f('#FFC9D8') })
    };
  };

  KINDS.peri = function (c) {
    return {
      b0: E('ellipse', { cx: 40, cy: 60, rx: 10, ry: 17, fill: c.f('#D8ECFF'), opacity: c.o(0.8), transform: 'rotate(20 40 60)' }) +
          E('ellipse', { cx: 80, cy: 60, rx: 10, ry: 17, fill: c.f('#D8ECFF'), opacity: c.o(0.8), transform: 'rotate(-20 80 60)' }) +
          E('ellipse', { cx: 44, cy: 78, rx: 7, ry: 11, fill: c.f('#E8F4FF'), opacity: c.o(0.75), transform: 'rotate(30 44 78)' }) +
          E('ellipse', { cx: 76, cy: 78, rx: 7, ry: 11, fill: c.f('#E8F4FF'), opacity: c.o(0.75), transform: 'rotate(-30 76 78)' }),
      govde: E('path', { d: 'M60 56 Q77 62 79 88 Q60 99 41 88 Q43 62 60 56 Z',
                         fill: c.g('bd', '#EFE3FF', '#D8C2F0', '#B49BE0'), 'stroke-linejoin': 'round' }) +
        E('circle', { cx: 52, cy: 100, r: 3, fill: c.f('#B49BE0') }) +
        E('circle', { cx: 68, cy: 100, r: 3, fill: c.f('#B49BE0') }) +
        c.gloss(51, 70, 7, 5),
      bas: headBall(c, '#FFF0E0', '#FFE0CC', '#EFC0A8', { r: 17, cy: 42,
        pre: E('path', { d: 'M44 40 Q44 24 60 24 Q76 24 76 40 Q68 32 60 33 Q52 32 44 40 Z',
                         fill: c.f('#B98AE0'), 'stroke-linejoin': 'round' }),
        face: { ey: 2 } }),
      a1: E('circle', { cx: 50, cy: 26, r: 3.2, fill: c.f('#FF8FB8') }) + E('circle', { cx: 50, cy: 26, r: 1.3, fill: c.f('#FFF3D0') }) +
          E('circle', { cx: 60, cy: 23, r: 3.2, fill: c.f('#FFD070') }) + E('circle', { cx: 60, cy: 23, r: 1.3, fill: c.f('#FFF8E8') }) +
          E('circle', { cx: 70, cy: 26, r: 3.2, fill: c.f('#FF8FB8') }) + E('circle', { cx: 70, cy: 26, r: 1.3, fill: c.f('#FFF3D0') })
    };
  };

  KINDS.kelebek = function (c) {
    var wing = function (cx, cy, rx, ry, rot, n) {
      return E('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: c.g('w' + n, '#FFD6EA', '#FFB3D9', '#E888B8'),
                            transform: 'rotate(' + rot + ' ' + cx + ' ' + cy + ')' });
    };
    return {
      b0: wing(37, 52, 15, 20, -24, 1) + wing(83, 52, 15, 20, 24, 2) +
          wing(42, 80, 10, 13, 18, 3) + wing(78, 80, 10, 13, -18, 4) +
          E('circle', { cx: 37, cy: 48, r: 4.5, fill: c.f('#FFB56B'), opacity: c.o(0.9) }) +
          E('circle', { cx: 83, cy: 48, r: 4.5, fill: c.f('#FFB56B'), opacity: c.o(0.9) }) +
          E('circle', { cx: 42, cy: 80, r: 3, fill: c.f('#FFE9B8'), opacity: c.o(0.9) }) +
          E('circle', { cx: 78, cy: 80, r: 3, fill: c.f('#FFE9B8'), opacity: c.o(0.9) }),
      govde: E('ellipse', { cx: 60, cy: 74, rx: 10, ry: 19, fill: c.g('bd', '#B4A4E0', '#8E7CC3', '#6E5CA8') }) +
        c.gloss(56, 62, 3.5, 6),
      bas: headBall(c, '#B4A4E0', '#8E7CC3', '#6E5CA8', { r: 13, cy: 46, face: { dx: 5.5, r: 3.8, my: 7 } }),
      a1: E('path', { d: 'M54 36 Q48 24 42 22 Q46 26 45 29', stroke: c.st('#6E5CA8'), 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M66 36 Q72 24 78 22 Q74 26 75 29', stroke: c.st('#6E5CA8'), 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' })
    };
  };

  KINDS.tavsan = function (c) {
    return {
      b0: E('circle', { cx: 84, cy: 88, r: 7, fill: c.f('#FFFFFF') }),
      govde: mamBody(c, '#FFFFFF', '#F5F2EC', '#D8D2C6', {}),
      bas: headBall(c, '#FFFFFF', '#F5F2EC', '#D8D2C6', { r: 18, cy: 44, face: { mouth: 'none' } }) +
        E('path', { d: 'M57 52 Q60 55 63 52', stroke: c.st(INK), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }) +
        E('circle', { cx: 60, cy: 50, r: 2, fill: c.f('#F4A9B8') }),
      a1: E('ellipse', { cx: 48, cy: 20, rx: 6.5, ry: 16, fill: c.g('e1', '#FFFFFF', '#F5F2EC', '#D8D2C6'), transform: 'rotate(-8 48 20)' }) +
          E('ellipse', { cx: 72, cy: 20, rx: 6.5, ry: 16, fill: c.g('e2', '#FFFFFF', '#F5F2EC', '#D8D2C6'), transform: 'rotate(8 72 20)' }) +
          E('ellipse', { cx: 48, cy: 22, rx: 3, ry: 11, fill: c.f('#FFC9D8'), transform: 'rotate(-8 48 22)' }) +
          E('ellipse', { cx: 72, cy: 22, rx: 3, ry: 11, fill: c.f('#FFC9D8'), transform: 'rotate(8 72 22)' })
    };
  };

  KINDS.serce = function (c) {
    return {
      b0: E('path', { d: 'M80 84 Q98 92 97 101 Q86 99 77 92 Z', fill: c.f('#A8825A'), 'stroke-linejoin': 'round' }),
      govde: birdBody(c, '#E8CDA8', '#C9A176', '#A8825A', { feet: '#C98A4E', belly: '#F2E3CC' }),
      bas: headBall(c, '#E8CDA8', '#C9A176', '#A8825A', { r: 18, cy: 43, face: { mouth: 'none' } }) + beak(c, '#6E5E4A', 51, 6),
      a1: E('path', { d: 'M44 34 Q60 24 76 34', stroke: c.st('#A8825A'), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', opacity: c.o(0.6) }) +
          E('circle', { cx: 47, cy: 49, r: 2.4, fill: c.f('#6E5E4A'), opacity: c.o(0.7) }) +
          E('circle', { cx: 73, cy: 49, r: 2.4, fill: c.f('#6E5E4A'), opacity: c.o(0.7) })
    };
  };

  KINDS.salyangoz = function (c) {
    return {
      govde: E('path', { d: 'M26 96 Q24 86 36 84 L74 84 Q88 84 90 92 Q90 100 78 100 L38 100 Q28 100 26 96 Z',
                         fill: c.g('bd', '#E2F5CC', '#C9E8B0', '#A0C888'), 'stroke-linejoin': 'round' }) +
        E('ellipse', { cx: 36, cy: 74, rx: 9, ry: 13, fill: c.g('nk', '#E2F5CC', '#C9E8B0', '#A0C888'), transform: 'rotate(8 36 74)' }) +
        c.gloss(34, 90, 8, 3),
      bas: E('circle', { cx: 36, cy: 60, r: 12, fill: c.g('hd', '#E2F5CC', '#C9E8B0', '#A0C888') }) +
        c.gloss(31, 55, 3.5, 2.5) + c.face(36, 61, { dx: 5, r: 3.4, my: 6.5 }),
      a1: E('circle', { cx: 68, cy: 68, r: 20, fill: c.g('sh', '#FCD9A8', '#F2B36B', '#D98E3E') }) +
          E('path', { d: 'M68 68 Q77 68 77 61 Q77 52 67 52 Q56 52 56 63 Q56 76 69 77',
                      stroke: c.st('#C97B3C'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
          c.gloss(60, 58, 5, 3.5) +
          E('path', { d: 'M31 50 Q29 44 26 42', stroke: c.st('#A0C888'), 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M41 50 Q43 44 46 42', stroke: c.st('#A0C888'), 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }) +
          E('circle', { cx: 26, cy: 41, r: 2, fill: c.f('#A0C888') }) +
          E('circle', { cx: 46, cy: 41, r: 2, fill: c.f('#A0C888') })
    };
  };

  KINDS.kirpi = function (c) {
    var spikes = '';
    var cx = 62, cy = 72;
    for (var i = 0; i < 9; i++) {
      var a = Math.PI * (1.08 - i * 0.145);
      var x1 = cx + Math.cos(a + 0.13) * 24, y1 = cy + Math.sin(a + 0.13) * 22;
      var x2 = cx + Math.cos(a) * 38, y2 = cy + Math.sin(a) * 36;
      var x3 = cx + Math.cos(a - 0.13) * 24, y3 = cy + Math.sin(a - 0.13) * 22;
      spikes += E('path', { d: 'M' + N(x1) + ' ' + N(y1) + ' Q' + N(x2) + ' ' + N(y2) + ' ' + N(x3) + ' ' + N(y3) + ' Z',
                            fill: c.f(i % 2 ? '#8A6D4E' : '#A08058'), 'stroke-linejoin': 'round' });
    }
    return {
      b0: spikes,
      govde: mamBody(c, '#FBEFD8', '#F5E3C8', '#D9C4A0', { rx: 23, ry: 18 }),
      bas: headBall(c, '#FBEFD8', '#F5E3C8', '#D9C4A0', { r: 16, cy: 47, face: { mouth: 'none', dx: 7 } }) +
        E('circle', { cx: 60, cy: 55, r: 2.6, fill: c.f('#6E5E4A') }) +
        E('path', { d: 'M56 60 Q60 63 64 60', stroke: c.st(INK), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
      a1: E('path', { d: 'M50 30 Q52 22 56 28 Z', fill: c.f('#8A6D4E'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M58 28 Q60 20 64 27 Z', fill: c.f('#A08058'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M66 29 Q70 22 71 29 Z', fill: c.f('#8A6D4E'), 'stroke-linejoin': 'round' })
    };
  };

  KINDS.kostebek = function (c) {
    return {
      govde: mamBody(c, '#B8AEC6', '#9A8FA8', '#7A7088', {}),
      bas: headBall(c, '#B8AEC6', '#9A8FA8', '#7A7088', { r: 18, cy: 44, face: { lidded: true, mouth: 'none' } }) +
        E('ellipse', { cx: 60, cy: 52, rx: 5, ry: 4, fill: c.f('#FF9EAE') }) +
        E('path', { d: 'M55 60 Q60 64 65 60', stroke: c.st(INK), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
      a1: E('ellipse', { cx: 42, cy: 88, rx: 8.5, ry: 6, fill: c.f('#EFB8C0'), transform: 'rotate(-18 42 88)' }) +
          E('ellipse', { cx: 78, cy: 88, rx: 8.5, ry: 6, fill: c.f('#EFB8C0'), transform: 'rotate(18 78 88)' }) +
          E('path', { d: 'M38 85 L36 82 M42 84 L41 80 M46 85 L47 81', stroke: c.st('#D98A98'), 'stroke-width': 1.8, 'stroke-linecap': 'round' }) +
          E('path', { d: 'M74 85 L73 81 M78 84 L79 80 M82 85 L84 82', stroke: c.st('#D98A98'), 'stroke-width': 1.8, 'stroke-linecap': 'round' })
    };
  };

  KINDS.oglak = function (c) {
    return {
      govde: mamBody(c, '#F8F0E0', '#EFE3D0', '#CDBB9E', {}),
      bas: headBall(c, '#F8F0E0', '#EFE3D0', '#CDBB9E', { r: 18, cy: 44, face: { mouth: 'none' } }) +
        E('ellipse', { cx: 60, cy: 53, rx: 8, ry: 5.5, fill: c.f('#F8E8D4') }) +
        E('path', { d: 'M56 53 Q60 56 64 53', stroke: c.st(INK), 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }) +
        E('path', { d: 'M57 61 Q60 68 63 61 Z', fill: c.f('#CDBB9E'), 'stroke-linejoin': 'round' }),
      a1: E('path', { d: 'M50 28 Q45 17 36 18', stroke: c.st('#C9A176'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M70 28 Q75 17 84 18', stroke: c.st('#C9A176'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) +
          E('ellipse', { cx: 40, cy: 44, rx: 6, ry: 4, fill: c.f('#EFE3D0'), transform: 'rotate(-30 40 44)' }) +
          E('ellipse', { cx: 80, cy: 44, rx: 6, ry: 4, fill: c.f('#EFE3D0'), transform: 'rotate(30 80 44)' })
    };
  };

  KINDS.kopek = function (c) {
    return {
      b0: E('path', { d: 'M84 84 Q98 78 94 66', stroke: c.st('#B08048'), 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
      govde: mamBody(c, '#F2CD9E', '#D9A868', '#B08048', { belly: '#F8E8CE' }),
      bas: headBall(c, '#F2CD9E', '#D9A868', '#B08048', { r: 19, cy: 44, face: { mouth: 'none', ey: -1 } }) +
        E('ellipse', { cx: 60, cy: 53, rx: 10, ry: 7, fill: c.f('#F8E8CE') }) +
        E('ellipse', { cx: 60, cy: 49.5, rx: 3.4, ry: 2.6, fill: c.f('#4A4238') }) +
        (c.mood === 'sleep' ? '' : E('path', { d: 'M57 57 Q60 64 63 57 Z', fill: c.f('#FF8FA0'), 'stroke-linejoin': 'round' })),
      a1: E('ellipse', { cx: 44, cy: 31, rx: 7, ry: 12, fill: c.g('e1', '#C99058', '#A87848', '#8A5E34'), transform: 'rotate(22 44 31)' }) +
          E('ellipse', { cx: 76, cy: 31, rx: 7, ry: 12, fill: c.g('e2', '#C99058', '#A87848', '#8A5E34'), transform: 'rotate(-22 76 31)' })
    };
  };

  KINDS.karinca = function (c) {
    return {
      govde: E('circle', { cx: 60, cy: 88, r: 14, fill: c.g('ab', '#E89A7E', '#C96A4A', '#A04E34') }) +
        E('circle', { cx: 60, cy: 68, r: 10, fill: c.g('th', '#E89A7E', '#C96A4A', '#A04E34') }) +
        E('path', { d: 'M48 70 Q38 74 34 82', stroke: c.st('#A04E34'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
        E('path', { d: 'M72 70 Q82 74 86 82', stroke: c.st('#A04E34'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
        E('path', { d: 'M50 86 Q42 92 40 98', stroke: c.st('#A04E34'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
        E('path', { d: 'M70 86 Q78 92 80 98', stroke: c.st('#A04E34'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
        c.gloss(53, 82, 5, 3.5),
      bas: headBall(c, '#E89A7E', '#C96A4A', '#A04E34', { r: 15, cy: 46, face: { dx: 6, r: 4, my: 7 } }),
      a1: antennae(c, '#A04E34', { y0: 33, len: 12, spread: 7 }) +
          E('ellipse', { cx: 60, cy: 64, rx: 7, ry: 5, fill: c.f('#F2D5A0'), transform: 'rotate(12 60 64)' }) +
          E('circle', { cx: 57, cy: 63, r: 0.9, fill: c.f('#C9A66B') }) +
          E('circle', { cx: 62, cy: 66, r: 0.9, fill: c.f('#C9A66B') }) +
          E('circle', { cx: 63, cy: 62, r: 0.9, fill: c.f('#C9A66B') })
    };
  };

  KINDS.horoz = function (c) {
    return {
      b0: E('path', { d: 'M82 74 Q102 62 96 42', stroke: c.st('#4FB8D8'), 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M84 78 Q106 72 102 54', stroke: c.st('#58B368'), 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M84 82 Q104 84 104 66', stroke: c.st('#B266E8'), 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }),
      govde: birdBody(c, '#FFFDF6', '#F5EFE5', '#D9CFC0', { feet: '#F5A623' }),
      bas: headBall(c, '#FFFDF6', '#F5EFE5', '#D9CFC0', { r: 19, cy: 42, face: { mouth: 'none' } }) + beak(c, '#F5A623', 51, 8),
      a1: combShape(c, '#FF5A5A', true) +
          E('ellipse', { cx: 57, cy: 61, rx: 2.8, ry: 4.2, fill: c.f('#FF5A5A') }) +
          E('ellipse', { cx: 63, cy: 61, rx: 2.8, ry: 4.2, fill: c.f('#FF5A5A') })
    };
  };

  KINDS.midilli = function (c) {
    return {
      b0: E('path', { d: 'M86 82 Q98 88 94 100', stroke: c.st('#7EC8E3'), 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M86 84 Q94 92 88 101', stroke: c.st('#A8DCEF'), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      govde: mamBody(c, '#F5DFC0', '#E8C9A0', '#C9A578', {}),
      bas: headBall(c, '#F5DFC0', '#E8C9A0', '#C9A578', { r: 20, cy: 43, face: { mouth: 'none', ey: -2 } }) +
        E('ellipse', { cx: 60, cy: 54, rx: 11, ry: 7.5, fill: c.f('#F8EAD8') }) +
        E('circle', { cx: 56, cy: 54, r: 1.4, fill: c.f('#C9A578') }) +
        E('circle', { cx: 64, cy: 54, r: 1.4, fill: c.f('#C9A578') }),
      a1: E('circle', { cx: 54, cy: 20, r: 7, fill: c.g('m0', '#A8DCEF', '#7EC8E3', '#5AA8C8') }) +
          E('circle', { cx: 68, cy: 22, r: 6, fill: c.g('m1', '#A8DCEF', '#7EC8E3', '#5AA8C8') }) +
          E('circle', { cx: 77, cy: 30, r: 6, fill: c.g('m2', '#A8DCEF', '#7EC8E3', '#5AA8C8') }) +
          E('circle', { cx: 82, cy: 41, r: 5.5, fill: c.g('m3', '#A8DCEF', '#7EC8E3', '#5AA8C8') }) +
          E('ellipse', { cx: 42, cy: 27, rx: 4.5, ry: 7, fill: c.f('#E8C9A0'), transform: 'rotate(-14 42 27)' }) +
          E('ellipse', { cx: 42, cy: 28, rx: 2, ry: 4, fill: c.f('#F4A9B8'), transform: 'rotate(-14 42 28)', opacity: c.o(0.7) })
    };
  };

  KINDS.kirlangic = function (c) {
    return {
      b0: E('path', { d: 'M78 84 Q96 94 103 107 Q92 103 78 92 Z', fill: c.f('#3E5FA8'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M80 80 Q102 82 110 90 Q97 92 80 88 Z', fill: c.f('#5A7EC8'), 'stroke-linejoin': 'round' }),
      govde: birdBody(c, '#8FAEE8', '#5A7EC8', '#3E5FA8', { feet: '#E8A0A8', belly: '#F5EFE0' }),
      bas: headBall(c, '#8FAEE8', '#5A7EC8', '#3E5FA8', { r: 18, cy: 43,
        pre: E('ellipse', { cx: 60, cy: 48, rx: 10, ry: 8, fill: c.f('#F5EFE0') }),
        face: { mouth: 'none' } }) + beak(c, '#4A4238', 52, 6),
      a1: E('path', { d: 'M40 70 Q34 80 38 88', stroke: c.st('#8FAEE8'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: c.o(0.8) }) +
          E('path', { d: 'M80 70 Q86 80 82 88', stroke: c.st('#8FAEE8'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: c.o(0.8) })
    };
  };

  KINDS.tavuskusu = function (c) {
    var fan = '';
    for (var i = -2; i <= 2; i++) {
      var a = -Math.PI / 2 + i * 0.42;
      var fx = 60 + Math.cos(a) * 38, fy = 62 + Math.sin(a) * 38;
      var deg = N(a * 180 / Math.PI + 90);
      fan += E('ellipse', { cx: N(fx), cy: N(fy), rx: 8.5, ry: 15, fill: c.g('f' + (i + 2), '#8FD8EC', '#4FB8D8', '#2E8FB0'),
                            transform: 'rotate(' + deg + ' ' + N(fx) + ' ' + N(fy) + ')' });
      fan += E('circle', { cx: N(fx), cy: N(fy - 4), r: 4, fill: c.f('#B266E8') });
      fan += E('circle', { cx: N(fx), cy: N(fy - 4), r: 1.8, fill: c.f('#F2C14E') });
    }
    return {
      b0: fan,
      govde: birdBody(c, '#9EDCEC', '#4FB8D8', '#2E8FB0', { feet: '#E8A85E' }),
      bas: headBall(c, '#9EDCEC', '#4FB8D8', '#2E8FB0', { r: 17, cy: 44, face: { mouth: 'none' } }) + beak(c, '#E8A85E', 52, 6),
      a1: E('path', { d: 'M54 30 L51 21 M60 28 L60 19 M66 30 L69 21', stroke: c.st('#2E8FB0'), 'stroke-width': 2, 'stroke-linecap': 'round' }) +
          E('circle', { cx: 51, cy: 20, r: 2.2, fill: c.f('#B266E8') }) +
          E('circle', { cx: 60, cy: 18, r: 2.2, fill: c.f('#B266E8') }) +
          E('circle', { cx: 69, cy: 20, r: 2.2, fill: c.f('#B266E8') })
    };
  };

  KINDS.orumcek = function (c) {
    var legs = '';
    var L = [
      'M44 76 Q28 72 24 60', 'M42 82 Q26 84 20 76', 'M44 88 Q30 94 26 102',
      'M76 76 Q92 72 96 60', 'M78 82 Q94 84 100 76', 'M76 88 Q90 94 94 102'
    ];
    for (var i = 0; i < L.length; i++) {
      legs += E('path', { d: L[i], stroke: c.st('#7A65A8'), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
    }
    return {
      b0: E('path', { d: 'M60 4 L60 30', stroke: c.st('#E8E2F5'), 'stroke-width': 2, 'stroke-linecap': 'round', opacity: c.o(0.8) }) + legs,
      govde: E('circle', { cx: 60, cy: 80, r: 17, fill: c.g('bd', '#B9A8D8', '#9A85C8', '#7A65A8') }) +
        E('circle', { cx: 60, cy: 74, r: 3, fill: c.f('#C9BBE8'), opacity: c.o(0.8) }) +
        c.gloss(53, 73, 5.5, 4),
      bas: headBall(c, '#B9A8D8', '#9A85C8', '#7A65A8', { r: 14, cy: 52, face: { dx: 6, r: 4, my: 7 } }) +
        E('circle', { cx: 53, cy: 44, r: 1.8, fill: c.f(INK) }) +
        E('circle', { cx: 67, cy: 44, r: 1.8, fill: c.f(INK) }),
      a1: c.sil ? E('circle', { cx: 60, cy: 6, r: 2, fill: SIL })
                : E('circle', { cx: 60, cy: 6, r: 2, fill: '#FFF8D8', opacity: 0.9 })
    };
  };

  KINDS.gunesbuzagisi = function (c) {
    return {
      b0: (c.sil ? '' : c.halo('#F2C14E', 46, 40)) +
          E('circle', { cx: 60, cy: 44, r: 26, fill: c.g('sn', '#FFF3C0', '#F8DC8A', '#F2C14E'), opacity: c.o(0.55) }),
      govde: mamBody(c, '#FCE8B0', '#F2C14E', '#D9A32E', {}),
      bas: headBall(c, '#FCE8B0', '#F2C14E', '#D9A32E', { r: 19, cy: 43, face: { mouth: 'none', ey: -1 } }) +
        E('ellipse', { cx: 60, cy: 53, rx: 10, ry: 6.5, fill: c.f('#FFF0CC') }) +
        E('circle', { cx: 56, cy: 53, r: 1.4, fill: c.f('#D9A32E') }) +
        E('circle', { cx: 64, cy: 53, r: 1.4, fill: c.f('#D9A32E') }),
      a1: E('path', { d: 'M49 27 Q45 17 37 16', stroke: c.st('#FFE8A0'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M71 27 Q75 17 83 16', stroke: c.st('#FFE8A0'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M60 27 L60 31 M56 29 L64 29', stroke: c.st('#FFF6D0'), 'stroke-width': 2.4, 'stroke-linecap': 'round' }) +
          E('circle', { cx: 60, cy: 29, r: 1.6, fill: c.f('#FFF6D0') })
    };
  };

  KINDS.tarlakusu = function (c) {
    return {
      b0: E('circle', { cx: 60, cy: 52, r: 30, fill: c.g('gl', '#FDE0C8', '#F8C8A8', '#F2A888'), opacity: c.o(0.45) }),
      govde: birdBody(c, '#FCD9B0', '#F5B87A', '#E08A5C', { feet: '#B06A4E', belly: '#FADCE0' }),
      bas: headBall(c, '#FCD9B0', '#F5B87A', '#E08A5C', { r: 18, cy: 43, face: { mouth: 'none' } }) + beak(c, '#B06A4E', 51, 6),
      a1: E('path', { d: 'M54 30 Q48 18 42 15', stroke: c.st('#E88AA0'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M58 28 Q56 15 51 10', stroke: c.st('#E88AA0'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M62 28 Q64 15 69 10', stroke: c.st('#F5B87A'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
          E('path', { d: 'M66 30 Q72 18 78 15', stroke: c.st('#F5B87A'), 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }) +
          E('circle', { cx: 42, cy: 14, r: 2.4, fill: c.f('#E86A8A') }) +
          E('circle', { cx: 51, cy: 9, r: 2.4, fill: c.f('#E86A8A') }) +
          E('circle', { cx: 69, cy: 9, r: 2.4, fill: c.f('#F2A05C') }) +
          E('circle', { cx: 78, cy: 14, r: 2.4, fill: c.f('#F2A05C') })
    };
  };

  KINDS.guneskusu = function (c) {
    var rays = '';
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / 10);
      var r1 = 34, r2 = (i % 2 ? 46 : 52);
      var x1 = 60 + Math.cos(a + 0.16) * r1, y1 = 52 + Math.sin(a + 0.16) * r1;
      var x2 = 60 + Math.cos(a) * r2, y2 = 52 + Math.sin(a) * r2;
      var x3 = 60 + Math.cos(a - 0.16) * r1, y3 = 52 + Math.sin(a - 0.16) * r1;
      rays += E('path', { d: 'M' + N(x1) + ' ' + N(y1) + ' Q' + N(x2) + ' ' + N(y2) + ' ' + N(x3) + ' ' + N(y3) + ' Z',
                          fill: c.f('#FFD98A'), opacity: c.o(0.85), 'stroke-linejoin': 'round' });
    }
    return {
      b0: (c.sil ? '' : c.halo('#F2A61B', 52, 54)) + rays +
          E('path', { d: 'M82 84 Q104 80 100 62 Q95 76 85 78 Z', fill: c.f('#FF9E5C'), 'stroke-linejoin': 'round' }),
      govde: birdBody(c, '#FFD9A0', '#FFB347', '#F27E4A', { feet: '#E86A3A' }),
      bas: headBall(c, '#FFD9A0', '#FFB347', '#F27E4A', { r: 19, cy: 43, face: { mouth: 'none' } }) + beak(c, '#E86A3A', 52, 7),
      a1: E('path', { d: 'M52 28 Q50 16 44 12 Q50 18 51 24 Z', fill: c.f('#FF7A5C'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M60 26 Q60 12 60 6 Q63 14 62 24 Z', fill: c.f('#FFB347'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M68 28 Q70 16 76 12 Q70 18 69 24 Z', fill: c.f('#FFD98A'), 'stroke-linejoin': 'round' })
    };
  };

  KINDS.korkuluk = function (c) {
    var straw = '';
    var sx = [42, 48, 55, 65, 72, 78];
    for (var i = 0; i < sx.length; i++) {
      straw += E('path', { d: 'M' + sx[i] + ' 94 L' + N(sx[i] + (i % 2 ? 3 : -3)) + ' 103',
                           stroke: c.st('#E8C96E'), 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    }
    return {
      b0: c.sil ? '' : c.halo('#5C4A9E', 58, 50),
      govde: E('path', { d: 'M44 58 Q40 58 40 72 L40 84 Q40 96 52 96 L68 96 Q80 96 80 84 L80 72 Q80 58 76 58 Q60 52 44 58 Z',
                         fill: c.g('bd', '#E0CBA4', '#C9B08A', '#A8905E'), 'stroke-linejoin': 'round' }) +
        straw +
        E('rect', { x: 48, y: 70, width: 11, height: 10, rx: 3, fill: c.f('#A8905E'), transform: 'rotate(-8 53 75)' }) +
        E('path', { d: 'M48 71 L59 71 M48 75 L59 75', stroke: c.st('#8A7248'), 'stroke-width': 1.4, 'stroke-linecap': 'round', transform: 'rotate(-8 53 75)' }) +
        E('path', { d: 'M66 84 L72 84 M69 81 L69 87', stroke: c.st('#8A7248'), 'stroke-width': 1.6, 'stroke-linecap': 'round' }) +
        c.gloss(50, 66, 7, 4),
      bas: headBall(c, '#EFDDB8', '#DCC494', '#B89E6A', { r: 17, cy: 42, face: { noHi: true, dx: 7, r: 4, my: 8 } }) +
        E('path', { d: 'M50 50 L54 54 M54 50 L50 54', stroke: c.st('#8A7248'), 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
      a1: E('ellipse', { cx: 60, cy: 27, rx: 21, ry: 5, fill: c.f('#8A6D4E') }) +
          E('path', { d: 'M46 27 Q52 6 74 10 Q78 20 74 27 Q60 31 46 27 Z',
                      fill: c.g('ht', '#A8885E', '#8A6D4E', '#6A5238'), 'stroke-linejoin': 'round' }) +
          E('path', { d: 'M44 30 L40 36 M48 31 L46 38 M72 31 L75 37', stroke: c.st('#E8C96E'), 'stroke-width': 2.4, 'stroke-linecap': 'round' }) +
          E('rect', { x: 62, y: 12, width: 8, height: 7, rx: 2, fill: c.f('#C9A86E'), transform: 'rotate(12 66 15)' })
    };
  };

  /* ---------- API: pufiSVG / silüet / oyuncak ---------- */

  var HALO_BY_RARITY = { efsanevi: '#F2A61B', gizli: '#5C4A9E' };

  function drawerFor (pufi) {
    var kind = (pufi && pufi.kind) ? String(pufi.kind) : '';
    return KINDS[kind] || KINDS._def;
  }

  function buildLayers (pufi, opts) {
    var id = (pufi && pufi.id) ? String(pufi.id) : 'pufi';
    var c = makeCtx(id, opts);
    var d;
    try { d = drawerFor(pufi)(c); } catch (e) { d = KINDS._def(c); }
    return { c: c, d: d };
  }

  Y.art.pufiSVG = function (pufi, opts) {
    opts = opts || {};
    var r = buildLayers(pufi, { tag: 'm', mood: opts.mood });
    var inner = '';
    var haloCol = HALO_BY_RARITY[(pufi && pufi.rarity) || ''];
    if (haloCol) inner += r.c.halo(haloCol, 58, 54);
    inner += E('ellipse', { cx: 60, cy: 105, rx: 24, ry: 5, fill: SIL, opacity: 0.12 });
    inner += (r.d.b0 || '') + (r.d.govde || '') + (r.d.bas || '') + (r.d.a1 || '');
    return svgWrap(r.c, inner);
  };

  Y.art.pufiSilhouetteSVG = function (pufi) {
    var r = buildLayers(pufi, { tag: 's', sil: true });
    var inner = (r.d.b0 || '') + (r.d.govde || '') + (r.d.bas || '') + (r.d.a1 || '');
    return svgWrap(r.c, inner);
  };

  Y.art.toyParts = function (pufi) {
    var parts = [];
    var specs = [
      { id: 'govde', tag: 'pg', pick: function (d) { return d.govde || ''; } },
      { id: 'bas', tag: 'pb', pick: function (d) { return d.bas || ''; } },
      { id: 'aksesuar', tag: 'pa', pick: function (d) { return (d.b0 || '') + (d.a1 || ''); } }
    ];
    for (var i = 0; i < specs.length; i++) {
      var r = buildLayers(pufi, { tag: specs[i].tag });
      var inner = specs[i].pick(r.d);
      if (!inner) { // savunmacı: boş parça olmasın
        inner = E('circle', { cx: 60, cy: 60, r: 10, fill: r.c.f('#D8C8EE') });
      }
      parts.push({ id: specs[i].id, svg: svgWrap(r.c, inner) });
    }
    return parts;
  };

  Y.art.toyAssembledSVG = function (pufi) {
    var r = buildLayers(pufi, { tag: 't' });
    var inner = '';
    var haloCol = HALO_BY_RARITY[(pufi && pufi.rarity) || ''];
    if (haloCol) inner += r.c.halo(haloCol, 56, 54);
    // vinil oyuncak kaidesi
    inner += E('ellipse', { cx: 60, cy: 107, rx: 31, ry: 7, fill: '#C9BFAE' });
    inner += E('ellipse', { cx: 60, cy: 104.5, rx: 31, ry: 7, fill: r.c.g('pd', '#FBF6EA', '#EFE6D2', '#D5C9B0') });
    inner += (r.d.b0 || '') + (r.d.govde || '') + (r.d.bas || '') + (r.d.a1 || '');
    // minik parıltılar
    inner += E('path', { d: 'M20 34 L20 42 M16 38 L24 38', stroke: '#FFE9A8', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.9 });
    inner += E('path', { d: 'M100 26 L100 32 M97 29 L103 29', stroke: '#FFE9A8', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.9 });
    return svgWrap(r.c, inner);
  };

  /* ---------- API: eggSVG ---------- */

  var EGG_D = 'M60 16 C81 16 95 42 95 68 C95 90 79 105 60 105 C41 105 25 90 25 68 C25 42 39 16 60 16 Z';

  var EGGS = {
    yaygin:    { lt: '#FFFDF7', md: '#F0E8D8', dk: '#CBC0A8', crackCol: '#6E5E4A' },
    azbulunur: { lt: '#F4FBEF', md: '#DFF2D8', dk: '#A8CFA0', crackCol: '#4E7A48', spot: '#58B368' },
    nadir:     { lt: '#F2FBFF', md: '#D8F0F8', dk: '#9FCFE0', crackCol: '#3E7A94' },
    destansi:  { lt: '#F8F1FF', md: '#E8D8F8', dk: '#C2A0E0', crackCol: '#7A4EA8', motif: '#B266E8' },
    efsanevi:  { lt: '#FFFBEA', md: '#FFEDC0', dk: '#E8C070', crackCol: '#A87A2E', halo: '#F2A61B' },
    gizli:     { lt: '#8A7AC8', md: '#5C4A9E', dk: '#3A2E6E', crackCol: '#241C48', halo: '#5C4A9E' }
  };

  var CRACKS = [
    'M58 26 L52 34 L60 40 L55 47',
    'M55 47 L63 54 L57 62 M60 40 L68 44',
    'M57 62 L48 68 L58 74 M68 44 L76 52 L70 60 M48 68 L40 66'
  ];

  function sparkle (x, y, s, col, op) {
    return E('path', { d: 'M' + N(x) + ' ' + N(y - s) + ' Q' + N(x + s * 0.25) + ' ' + N(y - s * 0.25) + ' ' + N(x + s) + ' ' + N(y) +
                          ' Q' + N(x + s * 0.25) + ' ' + N(y + s * 0.25) + ' ' + N(x) + ' ' + N(y + s) +
                          ' Q' + N(x - s * 0.25) + ' ' + N(y + s * 0.25) + ' ' + N(x - s) + ' ' + N(y) +
                          ' Q' + N(x - s * 0.25) + ' ' + N(y - s * 0.25) + ' ' + N(x) + ' ' + N(y - s) + ' Z',
                       fill: col, opacity: op });
  }

  Y.art.eggSVG = function (rarity, opts) {
    rarity = EGGS[rarity] ? rarity : 'yaygin';
    var P = EGGS[rarity];
    var crack = Math.max(0, Math.min(3, (opts && opts.crack) | 0));
    var uid = 'yv-egg-' + rarity + '-' + (SEQ++);
    var defs = [];
    defs.push(
      '<radialGradient id="' + uid + '-g" cx="0.38" cy="0.28" r="0.95">' +
      '<stop offset="0" stop-color="' + P.lt + '"/>' +
      '<stop offset="0.55" stop-color="' + P.md + '"/>' +
      '<stop offset="1" stop-color="' + P.dk + '"/>' +
      '</radialGradient>');
    defs.push('<clipPath id="' + uid + '-c"><path d="' + EGG_D + '"/></clipPath>');
    var inner = '';

    // ışıma / aura (efsanevi altın, gizli karanlık mor)
    if (P.halo) {
      defs.push(
        '<radialGradient id="' + uid + '-h" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="' + P.halo + '" stop-opacity="0.5"/>' +
        '<stop offset="1" stop-color="' + P.halo + '" stop-opacity="0"/>' +
        '</radialGradient>');
      inner += E('circle', { cx: 60, cy: 60, r: 58, fill: 'url(#' + uid + '-h)' });
    }

    inner += E('ellipse', { cx: 60, cy: 107, rx: 26, ry: 5, fill: SIL, opacity: 0.12 });
    inner += E('path', { d: EGG_D, fill: 'url(#' + uid + '-g)' });

    // nadirlik dokusu (yumurta içine kırpılmış)
    var tex = '';
    var rnd = seeded(hash('egg-' + rarity));
    var i, a, rr, x, y;
    if (rarity === 'azbulunur') { // benekli
      for (i = 0; i < 10; i++) {
        a = rnd() * Math.PI * 2; rr = Math.sqrt(rnd());
        x = 60 + Math.cos(a) * rr * 28; y = 64 + Math.sin(a) * rr * 34;
        tex += E('circle', { cx: N(x), cy: N(y), r: N(1.4 + rnd() * 1.8), fill: P.spot, opacity: 0.45 });
      }
    } else if (rarity === 'nadir') { // sedefli şeritler
      tex += E('ellipse', { cx: 48, cy: 52, rx: 34, ry: 9, fill: '#FFFFFF', opacity: 0.35, transform: 'rotate(-24 48 52)' });
      tex += E('ellipse', { cx: 68, cy: 78, rx: 30, ry: 6, fill: '#FFFFFF', opacity: 0.25, transform: 'rotate(-24 68 78)' });
      for (i = 0; i < 5; i++) {
        x = 34 + rnd() * 52; y = 34 + rnd() * 56;
        tex += E('circle', { cx: N(x), cy: N(y), r: 1.1, fill: '#FFFFFF', opacity: 0.6 });
      }
    } else if (rarity === 'destansi') { // hareketli desen hissi (dalga + elmas)
      tex += E('path', { d: 'M22 56 Q34 48 46 56 Q58 64 70 56 Q82 48 98 56', stroke: P.motif, 'stroke-width': 3,
                         fill: 'none', opacity: 0.35, 'stroke-linecap': 'round' });
      tex += E('path', { d: 'M22 72 Q34 64 46 72 Q58 80 70 72 Q82 64 98 72', stroke: P.motif, 'stroke-width': 3,
                         fill: 'none', opacity: 0.3, 'stroke-linecap': 'round' });
      for (i = 0; i < 6; i++) {
        x = 34 + rnd() * 52; y = 30 + rnd() * 60;
        tex += E('rect', { x: N(x - 2), y: N(y - 2), width: 4, height: 4, rx: 1.2, fill: P.motif, opacity: 0.35,
                           transform: 'rotate(45 ' + N(x) + ' ' + N(y) + ')' });
      }
    } else if (rarity === 'efsanevi') { // altın ışıma + parıltı
      tex += E('ellipse', { cx: 52, cy: 48, rx: 26, ry: 16, fill: '#FFF6D8', opacity: 0.5 });
      tex += sparkle(46, 44, 5, '#FFF0B8', 0.95) + sparkle(72, 60, 4, '#FFF0B8', 0.85) +
             sparkle(54, 82, 3.4, '#FFF0B8', 0.8) + sparkle(78, 36, 2.6, '#FFFFFF', 0.9);
    } else if (rarity === 'gizli') { // karanlık mor: hilal + yıldız
      tex += E('circle', { cx: 70, cy: 46, r: 10, fill: '#C9BFEF', opacity: 0.8 });
      tex += E('circle', { cx: 74, cy: 43, r: 9, fill: P.md });
      tex += E('circle', { cx: 44, cy: 62, r: 1.6, fill: '#C9BFEF', opacity: 0.9 });
      tex += E('circle', { cx: 56, cy: 76, r: 1.2, fill: '#C9BFEF', opacity: 0.7 });
      tex += E('circle', { cx: 40, cy: 82, r: 1.4, fill: '#C9BFEF', opacity: 0.8 });
      tex += sparkle(46, 38, 3, '#C9BFEF', 0.85);
    }
    if (tex) inner += E('g', { 'clip-path': 'url(#' + uid + '-c)' }, tex);

    // parlama noktası
    inner += E('ellipse', { cx: 47, cy: 38, rx: 9, ry: 13, fill: '#FFFFFF', opacity: rarity === 'gizli' ? 0.25 : 0.5, transform: 'rotate(18 47 38)' });

    // çatlaklar (0-3, birikimli)
    if (crack > 0) {
      var cg = '';
      if (crack >= 3) { // içeriden ışık sızıntısı
        for (i = 0; i < crack; i++) {
          cg += E('path', { d: CRACKS[i], stroke: '#FFF3B0', 'stroke-width': 5, fill: 'none',
                            'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55 });
        }
      }
      for (i = 0; i < crack; i++) {
        cg += E('path', { d: CRACKS[i], stroke: P.crackCol, 'stroke-width': 2.4, fill: 'none',
                          'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 });
      }
      inner += E('g', { 'clip-path': 'url(#' + uid + '-c)' }, cg);
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true"><defs>' +
           defs.join('') + '</defs>' + inner + '</svg>';
  };
})();
