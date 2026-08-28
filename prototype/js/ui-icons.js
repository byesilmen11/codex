/* Yuvo — UI ikon kütüphanesi (window.Yuvo.icons). Sahip: marka-lideri.
   BRAND.md §4: iki-tonlu şeker gradyan + #3E2A1C kalın kontur (28'lik kutuda 2),
   yuvarlak uç/birleşim, üst-solda parlama noktası, BENZERSİZ gradient id'leri
   ("yi-" öneki bu dosyaya ayrılmıştır; pufi-svg.js "yv-" kullanır).
   Hepsi string döndürür; emoji fallback çağıran tarafta (main.js ico() deseni). */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };

  var INK = '#3E2A1C';
  var SEQ = 0;

  function uid (name) { return 'yi-' + name + '-' + (SEQ++); }

  /* Dikey iki-durak şeker gradyanı */
  function grad (id, top, bottom, mid) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + top + '"/>' +
      (mid ? '<stop offset=".55" stop-color="' + mid + '"/>' : '') +
      '<stop offset="1" stop-color="' + bottom + '"/>' +
      '</linearGradient>';
  }

  /* 28×28 ikon sarmalayıcı */
  function wrap (name, defs, body) {
    return '<svg class="yi yi-' + name + '" viewBox="0 0 28 28" width="1em" height="1em"' +
      ' aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      (defs ? '<defs>' + defs + '</defs>' : '') +
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' + body + '</g></svg>';
  }

  /* Parlama noktası (vinil ışıltısı) */
  function shine (cx, cy, rx, ry, rot) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' +
      (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') +
      ' fill="#FFFFFF" opacity=".7"/>';
  }

  /* Daire zeminli glif ikonları (close/back/skip/check) için ortak gövde */
  function disc (name, top, bottom, glyph) {
    var g = uid(name);
    return wrap(name,
      grad(g, top, bottom),
      '<circle cx="14" cy="14" r="10.8" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="2"/>' +
      shine(10, 8.6, 3.4, 2, -24) +
      glyph);
  }

  var icons = {};

  /* --- Wordmark: "Yuv" + çatlak yumurta "o" ------------------------------ */
  icons.logo = function () {
    var gT = uid('logo-t'), gE = uid('logo-e');
    var eggD = 'M66 6.9c-5 0-8.9 5.8-8.9 11.9 0 5.5 3.7 9.5 8.9 9.5s8.9-4 8.9-9.5' +
      'C74.9 12.7 71 6.9 66 6.9Z';
    var textAttrs = ' font-family="\'Baloo 2\',\'Nunito\',\'Trebuchet MS\',sans-serif"' +
      ' font-size="26" font-weight="800" letter-spacing="-0.5"' +
      ' textLength="52" lengthAdjust="spacingAndGlyphs" x="3" y="26.5"';
    return '<svg class="yi yi-logo" viewBox="0 0 96 34" height="1.3em"' +
      ' aria-label="Yuvo" role="img" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      grad(gT, '#FFA94D', '#E85C1E', '#FF7C33') +
      grad(gE, '#FFFEF9', '#FFDFA8') +
      '</defs>' +
      /* beyaz sticker halesi (alt katman) */
      '<text' + textAttrs + ' fill="none" stroke="#FFFFFF" stroke-width="7"' +
      ' stroke-linejoin="round">Yuv</text>' +
      '<path d="' + eggD + '" fill="none" stroke="#FFFFFF" stroke-width="7"' +
      ' stroke-linejoin="round"/>' +
      /* mürekkep kontur + şeker dolgu */
      '<text' + textAttrs + ' fill="url(#' + gT + ')" stroke="' + INK + '"' +
      ' stroke-width="2.2" stroke-linejoin="round" paint-order="stroke">Yuv</text>' +
      '<path d="' + eggD + '" fill="url(#' + gE + ')" stroke="' + INK + '" stroke-width="2.2"/>' +
      /* çatlak + parlama */
      '<path d="M59.4 16.6l2.4 1.9 2.2-2.1 2.3 2 2.2-1.9 2.6 1.6" fill="none"' +
      ' stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="62.4" cy="12" rx="2.5" ry="3.4" transform="rotate(-18 62.4 12)"' +
      ' fill="#FFFFFF" opacity=".8"/>' +
      /* kıvılcım */
      '<path d="M82 3.8l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3z" fill="#FFC734"' +
      ' stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/>' +
      '</svg>';
  };

  /* --- Nav: yuva sepeti + yumurta --------------------------------------- */
  icons.yuva = function () {
    var gN = uid('yuva-n'), gE = uid('yuva-e');
    return wrap('yuva',
      grad(gN, '#C98A4B', '#8E5A2B') + grad(gE, '#FFFEF9', '#FFE3B8'),
      '<path d="M14 4.6c-2.9 0-5.2 3.5-5.2 7.2 0 .9.1 1.7.4 2.5h9.6c.3-.8.4-1.6.4-2.5' +
        'C19.2 8.1 16.9 4.6 14 4.6Z" fill="url(#' + gE + ')" stroke="' + INK + '" stroke-width="2"/>' +
      shine(11.9, 8.2, 1.5, 2.1, -18) +
      '<path d="M4.6 14.3h18.8c.5 0 .9.5.8 1-.7 4.7-4.7 8.1-10.2 8.1s-9.5-3.4-10.2-8.1' +
        'c-.1-.5.3-1 .8-1Z" fill="url(#' + gN + ')" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M6.8 17.6c2.3 1.2 12.1 1.2 14.4 0M9 20.6c1.9.9 8.1.9 10 0"' +
        ' stroke="' + INK + '" stroke-width="1.5" opacity=".5"/>');
  };

  /* --- Nav: albüm defteri (yumurta amblemli, şeritli) -------------------- */
  icons.album = function () {
    var gC = uid('album-c');
    return wrap('album',
      grad(gC, '#FFAE4E', '#F07F1F'),
      '<rect x="5.5" y="4.5" width="17" height="19" rx="3.2" fill="url(#' + gC + ')"' +
        ' stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M9.6 4.7v18.6" stroke="' + INK + '" stroke-width="1.6" opacity=".45"/>' +
      '<path d="M15.9 4.5v6.4l2.1-1.6 2.1 1.6V4.5" fill="#FF8FB0" stroke="' + INK + '"' +
        ' stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M13.4 12.4c-1.7 0-3 2-3 4.1 0 1.9 1.3 3.3 3 3.3s3-1.4 3-3.3' +
        'c0-2.1-1.3-4.1-3-4.1Z" fill="#FFF9EC" stroke="' + INK + '" stroke-width="1.6"/>' +
      shine(8, 7.4, 1.4, 1, -30));
  };

  /* --- Nav: oyna — yap-boz parçası --------------------------------------- */
  icons.oyna = function () {
    var g = uid('oyna');
    return wrap('oyna',
      grad(g, '#8AD9F7', '#3FA9DE'),
      '<path d="M5.5 10.2c0-1.2 1-2.2 2.2-2.2h2.6a3.3 3.3 0 1 1 6.6 0h2.6' +
        'c1.2 0 2.2 1 2.2 2.2v2.4a3.3 3.3 0 1 0 0 6.6v2.4c0 1.2-1 2.2-2.2 2.2' +
        'H7.7c-1.2 0-2.2-1-2.2-2.2Z" fill="url(#' + g + ')" stroke="' + INK + '"' +
        ' stroke-width="2" stroke-linejoin="round"/>' +
      shine(9.4, 11.6, 2.4, 1.5, -22));
  };

  /* --- Yıldız Tozu -------------------------------------------------------- */
  icons.star = function () {
    var g = uid('star');
    return wrap('star',
      grad(g, '#FFE066', '#FFB627'),
      '<path d="M14 3.4L17.5 10.2L25 11.4L19.6 16.8L20.8 24.4L14 20.9L7.2 24.4' +
        'L8.4 16.8L3 11.4L10.5 10.2Z" fill="url(#' + g + ')" stroke="' + INK + '"' +
        ' stroke-width="2" stroke-linejoin="round"/>' +
      shine(11.2, 9.6, 1.7, 1.1, -28));
  };

  /* --- Kabuk (salyangoz sarmalı) ------------------------------------------ */
  icons.shell = function () {
    var g = uid('shell');
    return wrap('shell',
      grad(g, '#FFD9AC', '#FF9C5B'),
      '<circle cx="13.6" cy="14.4" r="9.2" fill="url(#' + g + ')" stroke="' + INK + '"' +
        ' stroke-width="2"/>' +
      '<path d="M22.8 14.4A9.2 9.2 0 1 0 13.6 23.6A6.3 6.3 0 0 0 19.9 17.3' +
        'A4.5 4.5 0 0 0 15.4 12.8A3 3 0 0 0 12.4 15.8" stroke="' + INK + '"' +
        ' stroke-width="1.8"/>' +
      shine(9.8, 9, 2.2, 1.4, -26));
  };

  /* --- Yumurta (çatlak çizgili) ------------------------------------------- */
  icons.egg = function () {
    var g = uid('egg');
    return wrap('egg',
      grad(g, '#FFFEF9', '#FFE3B8'),
      '<path d="M14 3.4C9.6 3.4 6 9 6 14.9 6 20.1 9.5 24.4 14 24.4s8-4.3 8-9.5' +
        'C22 9 18.4 3.4 14 3.4Z" fill="url(#' + g + ')" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M8.6 13.6l2.3 1.9 2.2-2.1 2.3 2 2.2-1.9 2.4 1.6" stroke="' + INK + '"' +
        ' stroke-width="1.7"/>' +
      shine(10.6, 8.4, 2.2, 3, -18));
  };

  /* --- Daire glifleri ------------------------------------------------------ */
  icons.close = function () {
    return disc('close', '#FF9C6B', '#E85C1E',
      '<path d="M10.2 10.2l7.6 7.6M17.8 10.2l-7.6 7.6" stroke="#FFFFFF" stroke-width="3"/>');
  };

  icons.back = function () {
    return disc('back', '#8AD9F7', '#3FA9DE',
      '<path d="M11.2 14h6.6M15.6 8.8L10.4 14l5.2 5.2" stroke="#FFFFFF" stroke-width="3"/>');
  };

  icons.skip = function () {
    return disc('skip', '#FFDD66', '#F2A400',
      '<path d="M9.2 9.2l4.8 4.8-4.8 4.8M15 9.2l4.8 4.8-4.8 4.8" stroke="' + INK + '"' +
        ' stroke-width="2.6"/>');
  };

  icons.check = function () {
    return disc('check', '#A9E56B', '#55B944',
      '<path d="M8.8 14.4l3.6 3.6 7-7.8" stroke="#FFFFFF" stroke-width="3"/>');
  };

  Yuvo.icons = icons;
})();
