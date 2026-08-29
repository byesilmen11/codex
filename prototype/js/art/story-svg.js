/* Yuvo — Sürpriz Yumurta Adası
 * story-svg.js — hikâye karakterlerinin SVG çizim modülü
 * Vanilla JS / IIFE / dış kaynak yok / deterministik.
 */
(function () {
  'use strict';

  var Y = window.Yuvo = window.Yuvo || { data: {}, art: {}, audio: {}, engine: {}, scenes: {}, test: {} };
  Y.art = Y.art || {};

  var SEQ = 0;                    // id çakışma önleyici
  var INK = '#3E2A1C';            // kontur (marka mürekkebi)

  var PAL = {
    sun: '#FFC734',
    sunDeep: '#F2A400',
    accent: '#FF7C33',
    sky: '#8AD9F7',
    meadow: '#8ED94F',
    pink: '#FF8FB0',
    night: '#5C4A9E',
    silver: '#D9DEEA',
    cream: '#FFF3DC',
    white: '#FFFFFF'
  };

  /* ---------------------------------------------------------------- yardımcılar */

  function uid(name) {
    return 'ys2-' + name + '-' + (SEQ++);
  }

  function esc(v) {
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // el('circle', {cx:1}, inner) -> '<circle cx="1"/>' | '<g ...>inner</g>'
  function el(tag, attrs, inner) {
    var s = '<' + tag;
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        s += ' ' + k + '="' + esc(v) + '"';
      }
    }
    if (inner === null || inner === undefined || inner === '') return s + '/>';
    return s + '>' + inner + '</' + tag + '>';
  }

  function stroke(w) {
    return {
      fill: 'none',
      stroke: INK,
      'stroke-width': w || 3.5,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    };
  }

  function filled(fill, w) {
    return {
      fill: fill,
      stroke: INK,
      'stroke-width': w || 3.5,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    };
  }

  // "Şeker-vinil" dolgu: açık -> koyu radyal gradyan
  function vinyl(id, lt, dk) {
    return el('radialGradient', { id: id, cx: '0.36', cy: '0.28', r: '1.05' },
      el('stop', { offset: '0', 'stop-color': lt }) +
      el('stop', { offset: '0.55', 'stop-color': lt }) +
      el('stop', { offset: '1', 'stop-color': dk })
    );
  }

  // Yarı saydam beyaz gradyan (kanat / cam vb.)
  function veil(id, a, b) {
    return el('linearGradient', { id: id, x1: '0', y1: '0', x2: '0.9', y2: '1' },
      el('stop', { offset: '0', 'stop-color': a, 'stop-opacity': '0.95' }) +
      el('stop', { offset: '1', 'stop-color': b, 'stop-opacity': '0.55' })
    );
  }

  // Üst-sol parlama: büyük elips (.55) + küçük ikinci nokta (.32)
  function gloss(cx, cy, rx, ry) {
    return el('g', { 'pointer-events': 'none' },
      el('ellipse', {
        cx: cx, cy: cy, rx: rx, ry: ry,
        fill: '#FFFFFF', opacity: '0.55',
        transform: 'rotate(-18 ' + cx + ' ' + cy + ')'
      }) +
      el('ellipse', {
        cx: (cx + rx * 0.95), cy: (cy + ry * 1.35), rx: rx * 0.36, ry: ry * 0.36,
        fill: '#FFFFFF', opacity: '0.32'
      })
    );
  }

  // Zemin gölgesi
  function shadow(cx, cy, rx, ry) {
    return el('ellipse', {
      cx: cx, cy: (cy === undefined ? 104 : cy), rx: rx || 30, ry: ry || 6.5,
      fill: INK, opacity: '0.14'
    });
  }

  function cheeks(lx, rx, cy, r) {
    var ry = (r || 4) * 0.72;
    return el('g', { 'pointer-events': 'none' },
      el('ellipse', { cx: lx, cy: cy, rx: r || 4, ry: ry, fill: PAL.pink, opacity: '0.55' }) +
      el('ellipse', { cx: rx, cy: cy, rx: r || 4, ry: ry, fill: PAL.pink, opacity: '0.55' })
    );
  }

  function normMood(m) {
    return (m === 'think' || m === 'sleep' || m === 'sad') ? m : 'happy';
  }

  /* İri gözler.
   * opts: { mood, r, gap, wink (tek göz kısık), browColor, brows (bool) }
   */
  function eyes(cx, cy, opts) {
    opts = opts || {};
    var mood = normMood(opts.mood);
    var r = opts.r || 5.2;
    var gap = opts.gap || 11;
    var lx = cx - gap, rx = cx + gap;
    var brows = opts.brows !== false;
    var bc = opts.browColor || INK;
    var out = '';

    function ball(x, yOff, look) {
      var y = cy + (yOff || 0);
      var s = el('ellipse', { cx: x, cy: y, rx: r, ry: r * 1.14, fill: INK });
      s += el('circle', { cx: x - r * 0.34 + (look || 0), cy: y - r * 0.42, r: r * 0.34, fill: '#FFFFFF' });
      s += el('circle', { cx: x + r * 0.42 + (look || 0), cy: y + r * 0.36, r: r * 0.17, fill: '#FFFFFF', opacity: '0.85' });
      return s;
    }

    function lashLid(x) {
      var s = el('path', {
        d: 'M' + (x - r * 1.1) + ' ' + cy + ' q ' + (r * 1.1) + ' ' + (r * 1.25) + ' ' + (r * 2.2) + ' 0'
      });
      s = el('path', Object.assign({
        d: 'M' + (x - r * 1.1) + ' ' + cy + ' q ' + (r * 1.1) + ' ' + (r * 1.25) + ' ' + (r * 2.2) + ' 0'
      }, stroke(2.8)));
      // kirpikler
      s += el('path', Object.assign({
        d: 'M' + (x - r * 1.15) + ' ' + (cy - 0.3) + ' l ' + (-r * 0.5) + ' ' + (-r * 0.42)
      }, stroke(2.0)));
      s += el('path', Object.assign({
        d: 'M' + (x + r * 1.15) + ' ' + (cy - 0.3) + ' l ' + (r * 0.5) + ' ' + (-r * 0.42)
      }, stroke(2.0)));
      return s;
    }

    if (mood === 'sleep') {
      out += lashLid(lx) + lashLid(rx);
      return el('g', null, out);
    }

    if (mood === 'think') {
      out += ball(lx, 0, r * 0.28) + ball(rx, 0, r * 0.28);
      if (brows) {
        out += el('path', Object.assign({
          d: 'M' + (lx - r * 1.1) + ' ' + (cy - r * 2.25) + ' q ' + (r * 1.1) + ' ' + (-r * 0.95) + ' ' + (r * 2.2) + ' ' + (-r * 0.15)
        }, stroke(2.4)));
        out += el('path', Object.assign({
          d: 'M' + (rx - r * 1.05) + ' ' + (cy - r * 1.5) + ' q ' + (r * 1.05) + ' ' + (-r * 0.35) + ' ' + (r * 2.1) + ' ' + (r * 0.1)
        }, stroke(2.4)));
      }
      return el('g', null, out);
    }

    if (mood === 'sad') {
      out += ball(lx, r * 0.34, -r * 0.1) + ball(rx, r * 0.34, r * 0.1);
      if (brows) {
        out += el('path', Object.assign({
          d: 'M' + (lx - r * 1.15) + ' ' + (cy - r * 1.5) + ' q ' + (r * 1.15) + ' ' + (-r * 0.15) + ' ' + (r * 2.15) + ' ' + (r * 0.85)
        }, stroke(2.4)));
        out += el('path', Object.assign({
          d: 'M' + (rx + r * 1.15) + ' ' + (cy - r * 1.5) + ' q ' + (-r * 1.15) + ' ' + (-r * 0.15) + ' ' + (-r * 2.15) + ' ' + (r * 0.85)
        }, stroke(2.4)));
      }
      return el('g', null, out);
    }

    // happy
    out += ball(lx, 0, 0) + ball(rx, 0, 0);
    if (opts.wink) {
      out = ball(lx, 0, 0);
      out += el('path', Object.assign({
        d: 'M' + (rx - r * 1.1) + ' ' + (cy + 0.4) + ' q ' + (r * 1.1) + ' ' + (-r * 1.15) + ' ' + (r * 2.2) + ' 0'
      }, stroke(2.8)));
    }
    if (brows && opts.brows === true) {
      out += el('path', Object.assign({
        d: 'M' + (lx - r * 1.0) + ' ' + (cy - r * 1.9) + ' q ' + (r * 1.0) + ' ' + (-r * 0.5) + ' ' + (r * 2.0) + ' 0'
      }, stroke(2.4)));
      out += el('path', Object.assign({
        d: 'M' + (rx - r * 1.0) + ' ' + (cy - r * 1.9) + ' q ' + (r * 1.0) + ' ' + (-r * 0.5) + ' ' + (r * 2.0) + ' 0'
      }, stroke(2.4)));
    }
    return el('g', null, out);
  }

  /* Ağız — mood'a göre */
  function mouth(cx, cy, w, mood) {
    mood = normMood(mood);
    var h = w * 0.55;
    if (mood === 'sad') {
      return el('path', Object.assign({
        d: 'M' + (cx - w) + ' ' + (cy + h * 0.5) + ' q ' + w + ' ' + (-h) + ' ' + (w * 2) + ' 0'
      }, stroke(2.4)));
    }
    if (mood === 'sleep') {
      return el('path', Object.assign({
        d: 'M' + (cx - w * 0.6) + ' ' + cy + ' q ' + (w * 0.6) + ' ' + (h * 0.7) + ' ' + (w * 1.2) + ' 0'
      }, stroke(2.4)));
    }
    if (mood === 'think') {
      return el('path', Object.assign({
        d: 'M' + (cx - w * 0.7) + ' ' + cy + ' q ' + (w * 0.7) + ' ' + (h * 0.35) + ' ' + (w * 1.4) + ' ' + (-h * 0.25)
      }, stroke(2.4)));
    }
    // happy: açık gülümseme
    return el('path', Object.assign({
      d: 'M' + (cx - w) + ' ' + cy + ' q ' + w + ' ' + (h * 1.6) + ' ' + (w * 2) + ' 0 z',
      fill: '#7A3B2E'
    }, { stroke: INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  }

  /* Beyaz sticker halesi */
  function stickerFilter(id, radius) {
    return el('filter', {
      id: id, x: '-25%', y: '-25%', width: '150%', height: '150%',
      'color-interpolation-filters': 'sRGB'
    },
      el('feMorphology', { 'in': 'SourceAlpha', operator: 'dilate', radius: radius || '2.6', result: 'ys2fat' }) +
      el('feFlood', { 'flood-color': '#FFFFFF', 'flood-opacity': '1', result: 'ys2white' }) +
      el('feComposite', { 'in': 'ys2white', in2: 'ys2fat', operator: 'in', result: 'ys2halo' }) +
      el('feMerge', null,
        el('feMergeNode', { 'in': 'ys2halo' }) +
        el('feMergeNode', { 'in': 'SourceGraphic' })
      )
    );
  }

  /* Karakter grubunu hale filtresiyle sar. */
  function sticker(inner, fid) {
    return el('g', { filter: 'url(#' + fid + ')' }, inner);
  }

  function wrap(inner, defs, viewBox) {
    return el('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: viewBox || '0 0 120 120',
      width: '100%', height: '100%',
      'aria-hidden': 'true', focusable: 'false'
    }, el('defs', null, defs || '') + inner);
  }

  function star(cx, cy, r, fill, op) {
    var d = 'M' + cx + ' ' + (cy - r) +
      ' L' + (cx + r * 0.28) + ' ' + (cy - r * 0.28) +
      ' L' + (cx + r) + ' ' + cy +
      ' L' + (cx + r * 0.28) + ' ' + (cy + r * 0.28) +
      ' L' + cx + ' ' + (cy + r) +
      ' L' + (cx - r * 0.28) + ' ' + (cy + r * 0.28) +
      ' L' + (cx - r) + ' ' + cy +
      ' L' + (cx - r * 0.28) + ' ' + (cy - r * 0.28) + ' Z';
    return el('path', { d: d, fill: fill || '#FFE9A8', opacity: op === undefined ? '0.9' : op });
  }

  function hexPath(cx, cy, r) {
    var pts = [], i, a;
    for (i = 0; i < 6; i++) {
      a = (Math.PI / 180) * (60 * i - 30);
      pts.push((cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  /* ---------------------------------------------------------------- POFU */

  function pofuBody(mood) {
    var g = uid('pofu'), f = uid('halo');
    var defs = vinyl(g, '#FFF6BE', '#FFC531') + stickerFilter(f);
    var s = '';

    // sorguç (3 tüy)
    s += el('path', Object.assign({ d: 'M56 34 q -3 -12 2 -17 q 3 6 2 15' }, filled(PAL.sun, 3.0)));
    s += el('path', Object.assign({ d: 'M62 31 q 0 -15 4 -19 q 2 8 -1 18' }, filled(PAL.sun, 3.0)));
    s += el('path', Object.assign({ d: 'M68 34 q 4 -12 9 -14 q -1 8 -5 15' }, filled(PAL.sun, 3.0)));

    // kanat-kulaklar (damla biçimli)
    s += el('path', Object.assign({
      d: 'M30 58 q -14 -6 -16 4 q -1 10 12 11 q 7 0 9 -6 z'
    }, filled(PAL.sun, 3.5)));
    s += el('path', Object.assign({
      d: 'M90 58 q 14 -6 16 4 q 1 10 -12 11 q -7 0 -9 -6 z'
    }, filled(PAL.sun, 3.5)));

    // ayaklar
    s += el('path', Object.assign({ d: 'M50 98 v6 M44 106 h13 M50 104 l-6 3 M50 104 l6 3' }, stroke(3.2)));
    s += el('path', Object.assign({ d: 'M70 98 v6 M64 106 h13 M70 104 l-6 3 M70 104 l6 3' }, stroke(3.2)));
    s = el('g', { stroke: PAL.accent, 'stroke-width': '3.2', 'stroke-linecap': 'round', fill: 'none' },
      el('path', { d: 'M50 96 v8' }) + el('path', { d: 'M44 104 l6 -2 l6 2' }) +
      el('path', { d: 'M70 96 v8' }) + el('path', { d: 'M64 104 l6 -2 l6 2' })
    ) + s.replace(/<path [^>]*d="M50 98[^>]*\/>/, '').replace(/<path [^>]*d="M70 98[^>]*\/>/, '');

    // gövde (tombul yumurta-yuvarlak)
    s += el('ellipse', Object.assign({ cx: 60, cy: 64, rx: 32, ry: 31 }, filled('url(#' + g + ')')));
    s += gloss(47, 48, 11, 7.5);

    // gaga
    s += el('path', Object.assign({
      d: 'M60 70 l -7 5 l 7 5 l 7 -5 z'
    }, filled(PAL.accent, 2.4)));

    s += eyes(60, 58, { mood: mood, r: 6.0, gap: 12 });
    if (normMood(mood) === 'happy') {
      // ağzı açık coşku (gaga altı)
      s += el('path', Object.assign({
        d: 'M53 82 q 7 9 14 0 z', fill: '#7A3B2E'
      }, { stroke: INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
    } else {
      s += mouth(60, 82, 6, mood);
    }
    s += cheeks(41, 79, 72, 5.2);

    return { defs: defs, body: shadow(60, 106, 30, 6.5) + sticker(s, f) };
  }

  function pofu(opts) {
    opts = opts || {};
    var p = pofuBody(opts.mood);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- KIKI */

  function kikiBody(mood) {
    var g = uid('kiki'), t = uid('kikitail'), f = uid('halo');
    var defs = vinyl(g, '#FFD9A0', '#E8963C') + vinyl(t, '#FFE9C9', '#E8963C') + stickerFilter(f);
    var s = '';

    // KABARIK BÜYÜK KUYRUK — arkada yukarı kıvrık
    s += el('path', Object.assign({
      d: 'M34 88 q -22 -4 -22 -26 q 0 -22 20 -27 q -12 12 -8 25 q 4 13 16 16 z'
    }, filled('url(#' + t + ')')));
    s += el('path', Object.assign({
      d: 'M18 42 q 6 -9 14 -12 M15 56 q 5 -6 11 -8'
    }, stroke(2.4)));

    // sivri kulaklar
    s += el('path', Object.assign({ d: 'M48 40 l -6 -18 l 16 8 z' }, filled('url(#' + g + ')')));
    s += el('path', Object.assign({ d: 'M76 40 l 8 -17 l 4 17 z' }, filled('url(#' + g + ')')));

    // gövde
    s += el('path', Object.assign({
      d: 'M62 96 q -20 0 -20 -18 q 0 -14 20 -14 q 20 0 20 14 q 0 18 -20 18 z'
    }, filled('url(#' + g + ')')));
    // baş
    s += el('ellipse', Object.assign({ cx: 63, cy: 52, rx: 22, ry: 20 }, filled('url(#' + g + ')')));
    s += gloss(53, 42, 8.5, 6);

    // LİSTE KÂĞIDI (elinde)
    s += el('rect', Object.assign({ x: 82, y: 74, width: 20, height: 24, rx: 3 }, filled(PAL.cream, 2.4)));
    s += el('path', Object.assign({
      d: 'M86 81 h12 M86 86 h12 M86 91 h8'
    }, stroke(2.0)));
    // kol
    s += el('path', Object.assign({ d: 'M78 80 q 6 0 8 -2' }, stroke(3.2)));

    // minik gaga-burun
    s += el('path', Object.assign({ d: 'M63 60 l -5 4 l 5 3 l 5 -3 z' }, filled(PAL.accent, 2.4)));

    // telaşlı ifade: bir kaş yukarı (happy'de de)
    var m = normMood(mood);
    s += eyes(63, 50, { mood: m === 'happy' ? 'happy' : m, r: 5.0, gap: 10 });
    if (m === 'happy' || m === 'sleep') {
      s += el('path', Object.assign({ d: 'M48 38 q 5 -5 11 -2' }, stroke(2.4)));
      s += el('path', Object.assign({ d: 'M68 40 q 5 -2 10 1' }, stroke(2.4)));
    }
    s += mouth(63, 69, 5, m);
    s += cheeks(46, 80, 60, 4.4);

    return { defs: defs, body: shadow(62, 104, 28, 6) + sticker(s, f) };
  }

  function kiki(opts) {
    opts = opts || {};
    var p = kikiBody(opts.mood);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- USTAKABUK */

  function ustaShell(cx, cy, rx, ry, gid) {
    var s = el('path', Object.assign({
      d: 'M' + (cx - rx) + ' ' + cy + ' a ' + rx + ' ' + ry + ' 0 0 1 ' + (rx * 2) + ' 0 z'
    }, filled('url(#' + gid + ')')));
    var hexes = [
      [cx, cy - ry * 0.52, 7.2],
      [cx - rx * 0.44, cy - ry * 0.16, 6.4],
      [cx + rx * 0.44, cy - ry * 0.16, 6.4],
      [cx - rx * 0.7, cy - ry * 0.02, 4.6],
      [cx + rx * 0.7, cy - ry * 0.02, 4.6],
      [cx, cy - ry * 0.06, 5.0]
    ];
    for (var i = 0; i < hexes.length; i++) {
      s += el('path', Object.assign({ d: hexPath(hexes[i][0], hexes[i][1], hexes[i][2]) }, filled('#8A5A2B', 2.4)));
    }
    return s;
  }

  function ustaBody(mood) {
    var g = uid('usta'), sh = uid('ustashell'), f = uid('halo');
    var defs = vinyl(g, '#A8D8A0', '#4E8B57') + vinyl(sh, '#B07A3F', '#8A5A2B') + stickerFilter(f);
    var s = '';
    var m = normMood(mood);

    // ön/arka ayaklar
    s += el('ellipse', Object.assign({ cx: 40, cy: 96, rx: 11, ry: 7 }, filled('url(#' + g + ')')));
    s += el('ellipse', Object.assign({ cx: 82, cy: 96, rx: 11, ry: 7 }, filled('url(#' + g + ')')));

    // gövde alt
    s += el('path', Object.assign({
      d: 'M28 92 q 2 -12 32 -12 q 30 0 32 12 z'
    }, filled('url(#' + g + ')')));

    // KABUK
    s += ustaShell(60, 84, 34, 30, sh);
    s += gloss(44, 66, 9, 5.5);

    // uzun boyun
    s += el('path', Object.assign({
      d: 'M50 82 q -4 -22 8 -30 q 10 -6 14 4'
    }, { fill: 'none', stroke: INK, 'stroke-width': 15, 'stroke-linecap': 'round' }));
    s += el('path', Object.assign({
      d: 'M50 82 q -4 -22 8 -30 q 10 -6 14 4'
    }, { fill: 'none', stroke: '#8FCB88', 'stroke-width': 11, 'stroke-linecap': 'round' }));

    // baş
    s += el('ellipse', Object.assign({ cx: 71, cy: 44, rx: 19, ry: 17 }, filled('url(#' + g + ')')));
    s += gloss(63, 36, 7, 4.6);

    // burun delikleri
    s += el('circle', { cx: 85, cy: 45, r: 1.6, fill: INK, opacity: '0.75' });
    s += el('circle', { cx: 85, cy: 50, r: 1.6, fill: INK, opacity: '0.75' });

    s += eyes(70, 43, { mood: m, r: 4.4, gap: 9, brows: false });

    // YUVARLAK GÖZLÜK
    s += el('g', Object.assign({}, stroke(2.4)),
      el('circle', { cx: 61, cy: 43, r: 8.4, fill: 'none', stroke: INK, 'stroke-width': 2.4 }) +
      el('circle', { cx: 79, cy: 43, r: 8.4, fill: 'none', stroke: INK, 'stroke-width': 2.4 }) +
      el('path', { d: 'M69.4 43 h1.2', stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }) +
      el('path', { d: 'M52.6 42 q -4 -1 -6 2', fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' })
    );
    s += el('ellipse', { cx: 58, cy: 40, rx: 3.2, ry: 2.0, fill: '#FFFFFF', opacity: '0.5', transform: 'rotate(-18 58 40)' });
    s += el('ellipse', { cx: 76, cy: 40, rx: 3.2, ry: 2.0, fill: '#FFFFFF', opacity: '0.5', transform: 'rotate(-18 76 40)' });

    // beyaz kalın kaşlar
    s += el('path', {
      d: 'M53 33 q 8 -5 16 -1', fill: 'none', stroke: '#FFFFFF',
      'stroke-width': 4.2, 'stroke-linecap': 'round'
    });
    s += el('path', {
      d: 'M73 32 q 8 -3 14 3', fill: 'none', stroke: '#FFFFFF',
      'stroke-width': 4.2, 'stroke-linecap': 'round'
    });

    // sakin gülümseme
    if (m === 'happy') {
      s += el('path', Object.assign({ d: 'M78 54 q 5 4 9 0' }, stroke(2.4)));
    } else {
      s += mouth(82, 54, 4.5, m);
    }
    s += cheeks(58, 88, 52, 4.0);

    return { defs: defs, body: shadow(60, 104, 34, 6.5) + sticker(s, f) };
  }

  function ustakabuk(opts) {
    opts = opts || {};
    var p = ustaBody(opts.mood);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- LUNA */

  function lunaBody(mood) {
    var g = uid('luna'), w = uid('lunawing'), f = uid('halo');
    var defs = vinyl(g, '#6B5CA8', '#3E2F6B') + veil(w, PAL.silver, '#FFFFFF') + stickerFilter(f);
    var s = '';
    var m = normMood(mood);

    // AY IŞIĞI KANATLARI
    s += el('path', Object.assign({
      d: 'M50 62 q -26 -22 -34 -6 q -8 16 10 24 q 14 6 24 -6 z',
      fill: 'url(#' + w + ')', opacity: '0.92'
    }, { stroke: INK, 'stroke-width': 3.0, 'stroke-linejoin': 'round' }));
    s += el('path', Object.assign({
      d: 'M70 62 q 26 -22 34 -6 q 8 16 -10 24 q -14 6 -24 -6 z',
      fill: 'url(#' + w + ')', opacity: '0.92'
    }, { stroke: INK, 'stroke-width': 3.0, 'stroke-linejoin': 'round' }));
    // kanat üstü minik yıldızlar
    s += star(30, 52, 3.2, '#FFFFFF', 0.85);
    s += star(24, 68, 2.4, '#FFFFFF', 0.7);
    s += star(90, 52, 3.2, '#FFFFFF', 0.85);
    s += star(96, 68, 2.4, '#FFFFFF', 0.7);

    // gövde
    s += el('path', Object.assign({
      d: 'M60 60 q 11 0 11 14 q 0 16 -11 22 q -11 -6 -11 -22 q 0 -14 11 -14 z'
    }, filled('url(#' + g + ')')));

    // uzun ince antenler
    s += el('path', Object.assign({ d: 'M52 32 q -8 -12 -14 -14' }, stroke(2.4)));
    s += el('path', Object.assign({ d: 'M68 32 q 8 -12 14 -14' }, stroke(2.4)));
    s += el('circle', Object.assign({ cx: 38, cy: 18, r: 3.0 }, filled('#FFE9A8', 2.4)));
    s += el('circle', Object.assign({ cx: 82, cy: 18, r: 3.0 }, filled('#FFE9A8', 2.4)));

    // baş
    s += el('circle', Object.assign({ cx: 60, cy: 44, r: 19 }, filled('url(#' + g + ')')));
    s += gloss(52, 36, 7.5, 5);

    // HİLAL taç
    s += el('path', Object.assign({
      d: 'M50 28 a 12 12 0 0 1 20 0 a 9 9 0 0 0 -20 0 z'
    }, filled('#FFE9A8', 2.4)));

    s += eyes(60, 44, { mood: m === 'happy' ? 'sleep' : m, r: 5.0, gap: 10, brows: false });
    // yumuşak kapalı-gülümseme
    s += el('path', Object.assign({ d: 'M54 55 q 6 5 12 0' }, stroke(2.4)));
    s += cheeks(45, 75, 52, 4.4);

    // etraf parıltıları
    s += star(20, 34, 4.0, '#FFE9A8', 0.95);
    s += star(102, 36, 3.4, '#FFE9A8', 0.9);
    s += star(96, 92, 3.0, '#FFE9A8', 0.85);
    s += star(22, 92, 3.6, '#FFE9A8', 0.9);

    return { defs: defs, body: shadow(60, 106, 24, 5.5) + sticker(s, f) };
  }

  function luna(opts) {
    opts = opts || {};
    var p = lunaBody(opts.mood);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- SAKO */

  function sakoBody(mood) {
    var g = uid('sako'), b = uid('sakoblue'), f = uid('halo');
    var defs = vinyl(g, '#3A4A7A', '#2B2B38') + vinyl(b, '#BFEEFF', '#8AD9F7') + stickerFilter(f);
    var s = '';
    var m = normMood(mood);

    // UZUN SİVRİ KUYRUK (yana savrulmuş)
    s += el('path', Object.assign({
      d: 'M44 82 q -20 6 -34 22 q 18 -2 26 -8 q 8 -6 12 -10 z'
    }, filled('url(#' + g + ')')));
    s += el('path', Object.assign({
      d: 'M28 92 q 6 -3 12 -7'
    }, { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: '0.75' }));

    // gövde
    s += el('path', Object.assign({
      d: 'M62 96 q -18 0 -18 -18 q 0 -16 18 -16 q 18 0 18 16 q 0 18 -18 18 z'
    }, filled('url(#' + g + ')')));
    // beyaz karın
    s += el('path', Object.assign({
      d: 'M62 94 q -9 0 -9 -14 q 0 -10 9 -10 q 9 0 9 10 q 0 14 -9 14 z',
      fill: '#FFFFFF'
    }, { stroke: INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));

    // kanat + beyaz bant
    s += el('path', Object.assign({
      d: 'M80 68 q 14 6 12 20 q -2 10 -12 8 q -6 -2 -6 -14 q 0 -10 6 -14 z'
    }, filled('url(#' + g + ')')));
    s += el('path', Object.assign({
      d: 'M78 84 q 8 1 13 4',
      fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.0, 'stroke-linecap': 'round'
    }));

    // ayaklar
    s += el('g', {
      fill: 'none', stroke: PAL.accent, 'stroke-width': '3.0', 'stroke-linecap': 'round'
    },
      el('path', { d: 'M56 96 v7' }) + el('path', { d: 'M51 103 l5 -2 l5 2' })
    );

    // baş
    s += el('circle', Object.assign({ cx: 62, cy: 46, r: 18 }, filled('url(#' + g + ')')));
    s += gloss(54, 38, 7, 4.6);

    // gaga
    s += el('path', Object.assign({
      d: 'M78 46 l 14 4 l -14 6 z'
    }, filled('#F2A400', 2.4)));

    // gagasındaki PARLAK MAVİ TAŞ
    s += el('path', Object.assign({
      d: 'M96 44 l 7 5 l -4 8 l -8 -2 l -1 -8 z',
      fill: 'url(#' + b + ')'
    }, { stroke: INK, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));
    s += el('path', {
      d: 'M95 47 l 4 2', stroke: '#FFFFFF', 'stroke-width': 2.0,
      'stroke-linecap': 'round', opacity: '0.85', fill: 'none'
    });
    s += star(106, 40, 3.2, '#FFFFFF', 0.9);
    s += star(90, 62, 2.4, '#FFFFFF', 0.7);

    // yaramaz bakış: tek göz kısık
    if (m === 'happy') {
      s += eyes(60, 44, { mood: 'happy', r: 4.8, gap: 9.5, wink: true, brows: false });
      s += el('path', Object.assign({ d: 'M48 34 q 6 -4 12 -1' }, stroke(2.4)));
    } else {
      s += eyes(60, 44, { mood: m, r: 4.8, gap: 9.5, brows: false });
    }
    s += cheeks(48, 74, 52, 4.0);

    return { defs: defs, body: shadow(62, 106, 30, 6) + sticker(s, f) };
  }

  function sako(opts) {
    opts = opts || {};
    var p = sakoBody(opts.mood);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- yer tutucu */

  function placeholderBody(mood, cx, cy, r) {
    var g = uid('phold'), f = uid('halo');
    var defs = vinyl(g, '#FFF6BE', PAL.sun) + stickerFilter(f);
    var s = '';
    s += el('circle', Object.assign({ cx: cx, cy: cy, r: r }, filled('url(#' + g + ')')));
    s += gloss(cx - r * 0.35, cy - r * 0.42, r * 0.3, r * 0.2);
    s += el('path', Object.assign({
      d: 'M' + (cx - r * 0.72) + ' ' + (cy - r * 0.9) + ' l ' + (-r * 0.28) + ' ' + (-r * 0.5) +
         ' M' + (cx + r * 0.72) + ' ' + (cy - r * 0.9) + ' l ' + (r * 0.28) + ' ' + (-r * 0.5)
    }, stroke(3.0)));
    s += eyes(cx, cy - r * 0.12, { mood: mood, r: r * 0.22, gap: r * 0.44 });
    s += mouth(cx, cy + r * 0.5, r * 0.24, mood);
    s += cheeks(cx - r * 0.66, cx + r * 0.66, cy + r * 0.3, r * 0.18);
    return { defs: defs, body: shadow(cx, cy + r + 10, r * 0.9, r * 0.2) + sticker(s, f) };
  }

  function placeholder(opts) {
    opts = opts || {};
    var p = placeholderBody(normMood(opts.mood), 60, 60, 30);
    return wrap(p.body, p.defs, '0 0 120 120');
  }

  /* ---------------------------------------------------------------- PORTRE */

  /* Tam gövde çizimini baş-omuz kırpmasına dönüştürür.
   * Her karakter için baş merkezini (40,42)'ye taşıyan ölçek/öteleme.
   */
  var PORTRAIT_XF = {
    pofu:      { hx: 60, hy: 58, k: 0.95 },
    kiki:      { hx: 63, hy: 50, k: 1.05 },
    ustakabuk: { hx: 70, hy: 44, k: 1.05 },
    luna:      { hx: 60, hy: 44, k: 1.00 },
    sako:      { hx: 61, hy: 45, k: 1.05 }
  };

  var BUILD = {
    pofu: pofuBody,
    kiki: kikiBody,
    ustakabuk: ustaBody,
    luna: lunaBody,
    sako: sakoBody
  };

  function portre(id, opts) {
    opts = opts || {};
    var mood = normMood(opts.mood);
    var key = (typeof id === 'string') ? id.toLowerCase() : '';
    var build = BUILD[key];

    if (!build) {
      var ph = placeholderBody(mood, 40, 40, 22);
      return wrap(ph.body, ph.defs, '0 0 80 80');
    }

    var p;
    try {
      p = build(mood);
    } catch (e) {
      var ph2 = placeholderBody(mood, 40, 40, 22);
      return wrap(ph2.body, ph2.defs, '0 0 80 80');
    }

    var xf = PORTRAIT_XF[key] || { hx: 60, hy: 50, k: 1.0 };
    // baş merkezi (hx,hy) -> (40,42), r ~= 26 olacak ölçek
    var k = xf.k;
    var tx = (40 - xf.hx * k).toFixed(3);
    var ty = (42 - xf.hy * k).toFixed(3);

    var clip = uid('pclip');
    var defs = p.defs + el('clipPath', { id: clip },
      el('rect', { x: 0, y: 0, width: 80, height: 80, rx: 12 })
    );

    var inner = el('g', { 'clip-path': 'url(#' + clip + ')' },
      el('g', { transform: 'translate(' + tx + ' ' + ty + ') scale(' + k + ')' }, p.body)
    );

    return wrap(inner, defs, '0 0 80 80');
  }

  /* ---------------------------------------------------------------- dışa açım */

  function safe(fn) {
    return function (opts) {
      try {
        return fn(opts || {});
      } catch (e) {
        return placeholder(opts);
      }
    };
  }

  Y.art.story = {
    pofu: safe(pofu),
    kiki: safe(kiki),
    ustakabuk: safe(ustakabuk),
    luna: safe(luna),
    sako: safe(sako),
    portre: portre,
    _ink: INK,
    _palette: PAL
  };
})();
