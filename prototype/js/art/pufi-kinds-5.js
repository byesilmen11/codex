/* =====================================================================
   YUVO SANAT — pufi-kinds-5.js  (sahip: ressam-5 · Fısıltı Ormanı az bulunurları + gizli)
   =====================================================================
   Şeker-vinil sticker dili: tek mürekkep kontur (#3E2A1C, API basar),
   şeker-vinil dolgu (ışık SOL-ÜST), gloss + bounce her büyük formda.
   Zemin gölgesi ve beyaz sticker halesi API'de — burada çizilmez.
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* -----------------------------------------------------------------
     1) baykus — Puhu, baykuş yavrusu
     tarçın-krem tombul gövde, göğüste pul deseni, iri meraklı gözler,
     kulak tutamları, aksesuar: minik kitap
     ----------------------------------------------------------------- */
  function baykusBits (c) {
    var LT = '#EFCB9C', DK = '#B08968', CRM = '#FFF6E3', TRC = '#D98E4A', KOY = '#8B6242';
    var b = {};
    b.wings =
      c.leaf(33, 76, 8.5, 16, c.vinyl('bwg', LT, DK), { rot: -16, op: 0.96 }) +
      c.leaf(87, 76, 8.5, 16, c.vinyl('bwh', LT, DK), { rot: 16, op: 0.96 });
    b.feet =
      c.caps(50, 99.5, 11.5, 7, TRC, {}) +
      c.caps(70, 99.5, 11.5, 7, TRC, {});
    b.body =
      c.blob(60, 81, 24, 19.5, c.vinyl('bbd', LT, DK), {}) +
      c.blob(60, 84.5, 14.5, 12.5, CRM, { line: false, op: 0.95 }) +
      (c.sil ? '' :
        c.drop(54, 80, 2.1, 5, TRC, { line: false, op: 0.55 }) +
        c.drop(66, 80, 2.1, 5, TRC, { line: false, op: 0.55 }) +
        c.drop(60, 86, 2.1, 5, TRC, { line: false, op: 0.55 }) +
        c.drop(52, 89, 2.1, 5, TRC, { line: false, op: 0.55 }) +
        c.drop(68, 89, 2.1, 5, TRC, { line: false, op: 0.55 })) +
      c.gloss(47, 70, 8.5, 5) +
      c.bounce(60, 95.5, 15, 4.4, CRM, 0.2);
    b.head =
      c.ball(60, 44, 21, c.vinyl('bhd', LT, DK), {}) +
      c.gloss(49, 33.5, 8.4, 4.8);
    b.tufts =
      c.drop(45.5, 24.5, 3.4, 10, c.vinyl('btf', LT, KOY), { rot: -18 }) +
      c.drop(74.5, 24.5, 3.4, 10, c.vinyl('btg', LT, KOY), { rot: 18 });
    b.face =
      c.ball(51, 44, 8, CRM, { line: false, op: 0.9 }) +
      c.ball(69, 44, 8, CRM, { line: false, op: 0.9 }) +
      c.eyes(60, 44, { dx: 9, r: 5.2 }) +
      c.beak(60, 51.5, 7, TRC, {}) +
      c.cheeks(60, 54, 15.5, {});
    b.book =
      c.caps(60, 89.5, 15, 10.5, c.vinyl('bbk', '#F2998A', '#E85D4A'), { rx: 2.6 }) +
      c.caps(60, 88.6, 12, 7.6, CRM, { lw: c.LW2, rx: 1.6 }) +
      (c.sil ? '' : c.line('M60,85.2 L60,92', c.LW2, KOY, { op: 0.6 }));
    return b;
  }

  Y.art.registerKind('baykus', {
    pufi: function (c) {
      var b = baykusBits(c);
      return b.wings + b.feet + b.body + b.head + b.tufts + b.face + b.book;
    },
    parts: function (c) {
      var b = baykusBits(c);
      return {
        govde:    c.move(0, -8, b.wings + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.tufts + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.book)
      };
    }
  });

  /* -----------------------------------------------------------------
     2) tilki — Kızıl, tilki yavrusu
     tilki kızılı gövde, krem göğüs-yüz maskesi, kocaman pofuduk kuyruk
     (ucu krem, arkada), sivri kulaklar içi krem
     ----------------------------------------------------------------- */
  function tilkiBits (c) {
    var LT = '#F09B66', DK = '#C75B2E', CRM = '#FFF6E3', KOY = '#5C4433';
    var b = {};
    b.tail =
      c.rope('M75,89 C93,87 98,73 91,59', 9.5, '#E8834A', { hi: true }) +
      c.blob(90.5, 57.5, 7.5, 8.5, CRM, {});
    b.ears =
      c.drop(45, 26, 6.2, 15, c.vinyl('ter', LT, DK), { rot: -16 }) +
      c.drop(75, 26, 6.2, 15, c.vinyl('tes', LT, DK), { rot: 16 }) +
      (c.sil ? '' :
        c.drop(46.5, 28.5, 3.4, 8.5, CRM, { line: false, op: 0.9, rot: -16 }) +
        c.drop(73.5, 28.5, 3.4, 8.5, CRM, { line: false, op: 0.9, rot: 16 }));
    b.feet =
      c.caps(50, 99.5, 12, 7.5, DK, {}) +
      c.caps(70, 99.5, 12, 7.5, DK, {});
    b.body =
      c.blob(60, 81, 23.5, 19, c.vinyl('tbd', LT, DK), {}) +
      c.blob(60, 85, 13.5, 11.5, CRM, { line: false, op: 0.95 }) +
      c.gloss(48, 69.5, 9, 5) +
      c.bounce(60, 95, 15, 4.4, '#FFD9B8', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('thd', LT, DK), {}) +
      c.blob(60, 51, 12.5, 8, CRM, { line: false, op: 0.95 }) +
      c.gloss(49.5, 34, 8, 4.6);
    b.face =
      c.eyes(60, 43.5, { dx: 8, r: 4.6 }) +
      c.ball(60, 50, 2, KOY, { line: false }) +
      c.cheeks(60, 51, 14, {}) +
      c.mouth(60, 54, 'smile', { w: 7.5 });
    return b;
  }

  Y.art.registerKind('tilki', {
    pufi: function (c) {
      var b = tilkiBits(c);
      return b.tail + b.ears + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = tilkiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.tail)
      };
    }
  });

  /* -----------------------------------------------------------------
     3) porsuk — Pofur, porsuk
     gri-lavanta gövde, yüzde iki koyu şerit (alından göze), minik
     pençeler, aksesuar: kiler sepeti
     ----------------------------------------------------------------- */
  function porsukBits (c) {
    var LT = '#D6CEE2', DK = '#9C90B8', SRT = '#5C4433', CRM = '#FFF6E3';
    var b = {};
    b.ears =
      c.earRound(44, 27.5, 5, '#B8AECB', CRM) +
      c.earRound(76, 27.5, 5, '#B8AECB', CRM);
    b.feet =
      c.caps(50, 99.5, 12, 7.5, '#8F84A8', {}) +
      c.caps(70, 99.5, 12, 7.5, '#8F84A8', {}) +
      (c.sil ? '' :
        c.dot(46, 98.2, 1, 0.55) + c.dot(50, 97.6, 1, 0.55) + c.dot(54, 98.2, 1, 0.55) +
        c.dot(66, 98.2, 1, 0.55) + c.dot(70, 97.6, 1, 0.55) + c.dot(74, 98.2, 1, 0.55));
    b.body =
      c.blob(60, 81, 25, 19.5, c.vinyl('pbd', LT, DK), {}) +
      c.blob(60, 85.5, 14, 11, CRM, { line: false, op: 0.9 }) +
      c.gloss(47, 69.5, 9, 5) +
      c.bounce(60, 95.5, 16, 4.5, '#E6E0F0', 0.2);
    b.head =
      c.ball(60, 44, 21, c.vinyl('phd', LT, DK), {}) +
      c.caps(51.5, 38, 20, 7, SRT, { line: false, op: 0.85, rot: 78, rx: 3.5 }) +
      c.caps(68.5, 38, 20, 7, SRT, { line: false, op: 0.85, rot: -78, rx: 3.5 }) +
      c.gloss(49.5, 33.5, 8, 4.6);
    b.face =
      c.eyes(60, 44, { dx: 8.5, r: 4.6 }) +
      c.ball(60, 50.5, 2.2, SRT, { line: false }) +
      c.cheeks(60, 52, 14.5, {}) +
      c.mouth(60, 54.5, 'smile', { w: 7.5 });
    b.basket =
      (c.sil ? '' :
        c.drop(56, 82, 2.6, 5.5, '#E85D4A', { lw: c.LW2 }) +
        c.ball(64, 82.5, 2.5, '#A8CF8E', { lw: c.LW2 })) +
      c.rope('M48,87 C50,78 70,78 72,87', 3, '#B08968', {}) +
      c.caps(60, 90.5, 21, 11, c.vinyl('pbk', '#D9A46B', '#8B6242'), { rx: 4 }) +
      (c.sil ? '' :
        c.line('M52,85.8 C52,90 52,93 52.5,95.4', c.LW2, '#8B6242', { op: 0.5 }) +
        c.line('M60,85.4 C60,90 60,94 60,96', c.LW2, '#8B6242', { op: 0.5 }) +
        c.line('M68,85.8 C68,90 68,93 67.5,95.4', c.LW2, '#8B6242', { op: 0.5 }));
    return b;
  }

  Y.art.registerKind('porsuk', {
    pufi: function (c) {
      var b = porsukBits(c);
      return b.ears + b.feet + b.body + b.head + b.face + b.basket;
    },
    parts: function (c) {
      var b = porsukBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.basket)
      };
    }
  });

  /* -----------------------------------------------------------------
     4) yarasa — Şemsi, yarasa yavrusu
     eflatun gövde, şemsiye gibi yarı açık yumuşak kanatlar (iç zar
     çizgili), kocaman kulaklar, dik ve sevimli
     ----------------------------------------------------------------- */
  function yarasaBits (c) {
    var LT = '#B3A4DC', DK = '#7563AD', SLK = '#D9CFF0', ZAR = '#5A4A8E';
    var b = {};
    b.wings =
      c.path('M52,66 C40,58 27,58 23,72 C24,84 28,90 34,92 C34,86 38,84 41,87 C42,81 47,79 50,83 Z',
        c.vinyl('ywg', LT, DK), {}) +
      c.path('M68,66 C80,58 93,58 97,72 C96,84 92,90 86,92 C86,86 82,84 79,87 C78,81 73,79 70,83 Z',
        c.vinyl('ywh', LT, DK), {}) +
      (c.sil ? '' :
        c.line('M30,66 C31,74 32,80 33,86', c.LW2, ZAR, { op: 0.45 }) +
        c.line('M40,68 C41,74 42,79 43,83', c.LW2, ZAR, { op: 0.45 }) +
        c.line('M90,66 C89,74 88,80 87,86', c.LW2, ZAR, { op: 0.45 }) +
        c.line('M80,68 C79,74 78,79 77,83', c.LW2, ZAR, { op: 0.45 }));
    b.ears =
      c.drop(46, 21, 6.8, 16, c.vinyl('yer', LT, DK), { rot: -12 }) +
      c.drop(74, 21, 6.8, 16, c.vinyl('yes', LT, DK), { rot: 12 }) +
      (c.sil ? '' :
        c.drop(47, 24, 3.6, 9, SLK, { line: false, op: 0.9, rot: -12 }) +
        c.drop(73, 24, 3.6, 9, SLK, { line: false, op: 0.9, rot: 12 }));
    b.feet =
      c.caps(51, 99.5, 10.5, 7, DK, {}) +
      c.caps(69, 99.5, 10.5, 7, DK, {});
    b.body =
      c.blob(60, 81, 22.5, 18.5, c.vinyl('ybd', LT, DK), {}) +
      c.blob(60, 85, 12.5, 10.5, SLK, { line: false, op: 0.9 }) +
      c.gloss(48.5, 70, 8.5, 5) +
      c.bounce(60, 95, 14.5, 4.3, SLK, 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('yhd', LT, DK), {}) +
      c.gloss(49.5, 34, 8, 4.6);
    b.face =
      c.eyes(60, 44, { dx: 8, r: 4.8 }) +
      c.ball(60, 50.5, 2.2, ZAR, { line: false }) +
      c.cheeks(60, 52, 14, {}) +
      c.mouth(60, 54.5, 'smile', { w: 8 }) +
      (c.sil ? '' : c.drop(56.5, 57.5, 1.4, 3.2, '#FFFFFF', { rot: 180, line: false, op: 0.95 }));
    return b;
  }

  Y.art.registerKind('yarasa', {
    pufi: function (c) {
      var b = yarasaBits(c);
      return b.wings + b.ears + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = yarasaBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.wings)
      };
    }
  });

  /* -----------------------------------------------------------------
     5) rakun — Pufla, rakun yavrusu
     gri gövde, gözlerde koyu maske bandı (önce bant sonra gözler),
     halkalı kuyruk, elinde yıkadığı şeker
     ----------------------------------------------------------------- */
  function rakunBits (c) {
    var LT = '#CFC8DD', DK = '#948AAD', MSK = '#5C4433', CRM = '#FFF6E3';
    var b = {};
    b.tail =
      c.rope('M78,90 C95,88 97,72 89,60', 10, '#B8AECB', { hi: true }) +
      (c.sil ? '' :
        c.caps(93.5, 80, 11, 6.5, MSK, { line: false, op: 0.72, rot: -8 }) +
        c.caps(94, 70, 11, 6.5, MSK, { line: false, op: 0.72, rot: 14 }) +
        c.caps(90.5, 61, 10, 6, MSK, { line: false, op: 0.72, rot: 30 }));
    b.ears =
      c.earRound(45, 28, 5.5, '#B8AECB', CRM) +
      c.earRound(75, 28, 5.5, '#B8AECB', CRM);
    b.feet =
      c.caps(50, 99.5, 12, 7.5, DK, {}) +
      c.caps(70, 99.5, 12, 7.5, DK, {});
    b.body =
      c.blob(60, 81, 24, 19.5, c.vinyl('rbd', LT, DK), {}) +
      c.blob(60, 85, 13.5, 11, CRM, { line: false, op: 0.92 }) +
      c.gloss(47.5, 69.5, 9, 5) +
      c.bounce(60, 95.5, 15.5, 4.4, '#E6E0F0', 0.2);
    b.head =
      c.ball(60, 44, 21, c.vinyl('rhd', LT, DK), {}) +
      c.blob(60, 52.5, 12, 8, CRM, { line: false, op: 0.92 }) +
      c.caps(60, 43.5, 31, 9.5, MSK, { line: false, op: 0.88, rx: 4.7 }) +
      c.gloss(49, 33, 8, 4.5);
    b.face =
      c.eyes(60, 44, { dx: 8.5, r: 4.8 }) +
      c.ball(60, 51, 2.1, MSK, { line: false }) +
      c.cheeks(60, 53, 14.5, {}) +
      c.mouth(60, 55.5, 'smile', { w: 7.5 });
    b.candy =
      c.caps(51.5, 89, 9.5, 6.8, '#B8AECB', { rot: 16, rx: 3.2 }) +
      c.caps(68.5, 89, 9.5, 6.8, '#B8AECB', { rot: -16, rx: 3.2 }) +
      (c.sil ? '' :
        c.leaf(52, 86.5, 3.4, 2.3, '#E85D4A', { rot: -20, op: 0.95 }) +
        c.leaf(68, 86.5, 3.4, 2.3, '#E85D4A', { rot: 20, op: 0.95 })) +
      c.ball(60, 86.5, 5.2, c.vinyl('rcn', '#F2998A', '#E85D4A'), {}) +
      (c.sil ? '' :
        c.gloss(58, 84.5, 2.2, 1.4) +
        c.sparkle(69, 80, 2.6, '#FFFFFF', 0.75));
    return b;
  }

  Y.art.registerKind('rakun', {
    pufi: function (c) {
      var b = rakunBits(c);
      return b.tail + b.ears + b.feet + b.body + b.head + b.face + b.candy;
    },
    parts: function (c) {
      var b = rakunBits(c);
      return {
        govde:    c.move(0, -8, b.tail + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.candy)
      };
    }
  });

  /* -----------------------------------------------------------------
     6) atesbocegi — Cini, ateşböceği
     koyu lacivert minik gövde, arka kısmı ışık küresi + sparkle,
     şeffaf kanatlar, fener taşır gibi mutlu
     ----------------------------------------------------------------- */
  function atesbocegiBits (c) {
    var NVL = '#6C7BB4', NVD = '#4C5A8E', GLO = '#FFE9A8', GLD = '#F2C94C', WNG = '#EAF7FF';
    var b = {};
    b.wings =
      c.leaf(38, 62, 8, 16, WNG, { rot: -28, op: 0.6 }) +
      c.leaf(82, 62, 8, 16, WNG, { rot: 28, op: 0.6 });
    b.feet =
      c.caps(47, 99.5, 9, 6.5, NVD, {}) +
      c.caps(73, 99.5, 9, 6.5, NVD, {});
    b.glow =
      c.ball(60, 88.5, 13.5, GLO, { line: false, op: 0.35 }) +
      c.ball(60, 88.5, 10, c.vinyl('agl', '#FFF3C8', GLD), {}) +
      c.gloss(56.5, 84.5, 3.6, 2.3) +
      c.bounce(60, 96, 8.5, 2.8, '#FFFFFF', 0.25) +
      (c.sil ? '' :
        c.sparkle(43, 84, 3, '#FFF6D8', 0.9) +
        c.sparkle(78, 89, 2.6, '#FFF6D8', 0.85) +
        c.sparkle(67, 99, 2.2, '#FFF6D8', 0.7));
    b.body =
      c.blob(60, 76.5, 19.5, 14.5, c.vinyl('abd', NVL, NVD), {}) +
      c.gloss(50.5, 69, 7.5, 4.2);
    b.head =
      c.ball(60, 44, 19.5, c.vinyl('ahd', NVL, NVD), {}) +
      c.gloss(50, 35, 7.5, 4.4);
    b.antenna =
      c.antenna('M51,27 C47,20 43,16 39,13', NVD, 39, 13, 2.2) +
      c.antenna('M69,27 C73,20 77,16 81,13', NVD, 81, 13, 2.2);
    b.face =
      c.eyes(60, 44, { dx: 7.8, r: 4.6 }) +
      c.cheeks(60, 51.5, 13.5, {}) +
      c.mouth(60, 53.5, 'smile', { w: 8.5 });
    return b;
  }

  Y.art.registerKind('atesbocegi', {
    pufi: function (c) {
      var b = atesbocegiBits(c);
      return b.wings + b.feet + b.glow + b.body + b.head + b.antenna + b.face;
    },
    parts: function (c) {
      var b = atesbocegiBits(c);
      return {
        govde:    c.move(0, -8, b.wings + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.antenna + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.glow)
      };
    }
  });

  /* -----------------------------------------------------------------
     7) ibibik — Hüthüt, ibibik kuşu
     şeftali-tarçın gövde, başında yelpaze tepelik (uçları koyu),
     ince kavisli gaga, kanatta krem şeritler
     ----------------------------------------------------------------- */
  function ibibikBits (c) {
    var LT = '#F5C9A0', DK = '#D98E4A', TIP = '#5C4433', CRM = '#FFF6E3', RST = '#E8834A';
    var b = {};
    b.crest =
      c.drop(43.3, 24.1, 3.1, 11, RST, { rot: -40 }) +
      c.drop(51.1, 19.6, 3.1, 11, RST, { rot: -20 }) +
      c.drop(60, 18, 3.1, 11, RST, { rot: 0 }) +
      c.drop(68.9, 19.6, 3.1, 11, RST, { rot: 20 }) +
      c.drop(76.7, 24.1, 3.1, 11, RST, { rot: 40 }) +
      (c.sil ? '' :
        c.ball(39.4, 19.5, 1.9, TIP, { line: false }) +
        c.ball(49.1, 14, 1.9, TIP, { line: false }) +
        c.ball(60, 12, 1.9, TIP, { line: false }) +
        c.ball(70.9, 14, 1.9, TIP, { line: false }) +
        c.ball(80.6, 19.5, 1.9, TIP, { line: false }));
    b.wings =
      c.leaf(34, 77, 9, 16, c.vinyl('iwg', RST, '#C75B2E'), { rot: -18 }) +
      c.leaf(86, 77, 9, 16, c.vinyl('iwh', RST, '#C75B2E'), { rot: 18 }) +
      (c.sil ? '' :
        c.caps(33, 73.5, 10, 3.4, CRM, { line: false, op: 0.85, rot: -18, rx: 1.7 }) +
        c.caps(35, 80, 10, 3.4, CRM, { line: false, op: 0.85, rot: -18, rx: 1.7 }) +
        c.caps(87, 73.5, 10, 3.4, CRM, { line: false, op: 0.85, rot: 18, rx: 1.7 }) +
        c.caps(85, 80, 10, 3.4, CRM, { line: false, op: 0.85, rot: 18, rx: 1.7 }));
    b.feet =
      c.caps(50, 99.5, 11, 7, DK, {}) +
      c.caps(70, 99.5, 11, 7, DK, {});
    b.body =
      c.blob(60, 81, 23, 19, c.vinyl('ibd', LT, DK), {}) +
      c.blob(60, 85, 13, 11, CRM, { line: false, op: 0.9 }) +
      c.gloss(48, 69.5, 8.8, 5) +
      c.bounce(60, 95, 15, 4.4, CRM, 0.2);
    b.head =
      c.ball(60, 44, 20, c.vinyl('ihd', LT, DK), {}) +
      c.gloss(50, 34.5, 7.8, 4.5);
    b.beak =
      c.rope('M46,47 C38,49 31,52 26,57', 3.4, DK, {});
    b.face =
      c.eyes(60, 43.5, { dx: 8, r: 4.7 }) +
      c.cheeks(60, 51, 14, {}) +
      c.mouth(60, 53.5, 'smile', { w: 7 });
    return b;
  }

  Y.art.registerKind('ibibik', {
    pufi: function (c) {
      var b = ibibikBits(c);
      return b.wings + b.feet + b.body + b.head + b.crest + b.beak + b.face;
    },
    parts: function (c) {
      var b = ibibikBits(c);
      return {
        govde:    c.move(0, -8, b.wings + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.beak + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.crest)
      };
    }
  });

  /* -----------------------------------------------------------------
     8) susamuru — Topak, su samuru yavrusu
     kahve-krem, dik durur; göbeğinde minik parlak çakıl tutar,
     yassı kuyruk, bıyık noktaları
     ----------------------------------------------------------------- */
  function susamuruBits (c) {
    var LT = '#C69C74', DK = '#8B6242', CRM = '#FFF6E3', KOY = '#5C4433';
    var b = {};
    b.tail =
      c.caps(84, 93, 22, 10, c.vinyl('stl', LT, DK), { rot: -28, rx: 5 });
    b.ears =
      c.earRound(45, 28, 4.6, '#B08968', CRM) +
      c.earRound(75, 28, 4.6, '#B08968', CRM);
    b.feet =
      c.caps(50, 99.5, 12, 7.5, DK, {}) +
      c.caps(70, 99.5, 12, 7.5, DK, {});
    b.body =
      c.blob(60, 81, 24, 19.5, c.vinyl('sbd', LT, DK), {}) +
      c.blob(60, 84, 14.5, 12.5, CRM, { line: false, op: 0.95 }) +
      c.gloss(47.5, 69.5, 9, 5) +
      c.bounce(60, 95.5, 15.5, 4.4, '#EFDCC2', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('shd', LT, DK), {}) +
      c.blob(60, 51, 12.5, 8.5, CRM, { line: false, op: 0.95 }) +
      c.gloss(49.5, 34, 8, 4.6);
    b.face =
      c.eyes(60, 43, { dx: 7.8, r: 4.6 }) +
      c.ball(60, 48.5, 2.4, KOY, { line: false }) +
      (c.sil ? '' :
        c.dot(46.5, 50, 0.9, 0.5) + c.dot(44, 52.5, 0.9, 0.5) + c.dot(46.8, 55, 0.9, 0.5) +
        c.dot(73.5, 50, 0.9, 0.5) + c.dot(76, 52.5, 0.9, 0.5) + c.dot(73.2, 55, 0.9, 0.5)) +
      c.cheeks(60, 52, 14.5, {}) +
      c.mouth(60, 53.5, 'smile', { w: 8 });
    b.pebble =
      c.caps(51, 88.5, 9.5, 6.8, LT, { rot: 20, rx: 3 }) +
      c.caps(69, 88.5, 9.5, 6.8, LT, { rot: -20, rx: 3 }) +
      c.ball(60, 86.5, 5, c.vinyl('spb', '#C4E8EA', '#6FB0B4'), {}) +
      (c.sil ? '' :
        c.gloss(58.2, 84.8, 2, 1.3) +
        c.sparkle(68, 81.5, 2.6, '#FFFFFF', 0.8));
    return b;
  }

  Y.art.registerKind('susamuru', {
    pufi: function (c) {
      var b = susamuruBits(c);
      return b.tail + b.ears + b.feet + b.body + b.head + b.face + b.pebble;
    },
    parts: function (c) {
      var b = susamuruBits(c);
      return {
        govde:    c.move(0, -8, b.tail + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.pebble)
      };
    }
  });

  /* -----------------------------------------------------------------
     9) vasak — Mırra, vaşak yavrusu
     kum-bej gövde, benekli sırt, kulak uçlarında koyu kahve püsküller,
     kısa pofuduk kuyruk, göğüs kremi
     ----------------------------------------------------------------- */
  function vasakBits (c) {
    var LT = '#EAD9B4', DK = '#C7A46F', TUF = '#5C4433', CRM = '#FFF6E3', SPT = '#8B6242';
    var b = {};
    b.tail =
      c.caps(82, 92, 13, 8.5, c.vinyl('vtl', LT, DK), { rot: -32, rx: 4 }) +
      (c.sil ? '' : c.ball(87.5, 88.5, 3.4, TUF, { line: false, op: 0.85 }));
    b.ears =
      c.drop(45.5, 26, 6, 14, c.vinyl('ver', LT, DK), { rot: -14 }) +
      c.drop(74.5, 26, 6, 14, c.vinyl('ves', LT, DK), { rot: 14 }) +
      c.drop(43.4, 16.5, 1.7, 6, TUF, { rot: -14, lw: c.LW2 }) +
      c.drop(76.6, 16.5, 1.7, 6, TUF, { rot: 14, lw: c.LW2 });
    b.feet =
      c.caps(50, 99.5, 12, 7.5, DK, {}) +
      c.caps(70, 99.5, 12, 7.5, DK, {});
    b.body =
      c.blob(60, 81, 24, 19.5, c.vinyl('vbd', LT, DK), {}) +
      c.blob(60, 85, 13.5, 11, CRM, { line: false, op: 0.95 }) +
      (c.sil ? '' :
        c.ball(41, 72, 1.9, SPT, { line: false, op: 0.45 }) +
        c.ball(38, 80, 1.9, SPT, { line: false, op: 0.45 }) +
        c.ball(46, 68, 1.7, SPT, { line: false, op: 0.45 }) +
        c.ball(79, 72, 1.9, SPT, { line: false, op: 0.45 }) +
        c.ball(82, 80, 1.9, SPT, { line: false, op: 0.45 }) +
        c.ball(74, 68, 1.7, SPT, { line: false, op: 0.45 })) +
      c.gloss(47.5, 69.5, 9, 5) +
      c.bounce(60, 95.5, 15.5, 4.4, '#F2E7CC', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('vhd', LT, DK), {}) +
      c.leaf(42.5, 55, 4.5, 7.5, LT, { rot: -32 }) +
      c.leaf(77.5, 55, 4.5, 7.5, LT, { rot: 32 }) +
      c.gloss(49.5, 34, 8, 4.6);
    b.face =
      c.eyes(60, 43.5, { dx: 8, r: 4.6 }) +
      c.ball(60, 49.5, 2, SPT, { line: false }) +
      c.cheeks(60, 51.5, 14, {}) +
      c.mouth(60, 53.5, 'smile', { w: 7.5 });
    return b;
  }

  Y.art.registerKind('vasak', {
    pufi: function (c) {
      var b = vasakBits(c);
      return b.tail + b.ears + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = vasakBits(c);
      return {
        govde:    c.move(0, -8, b.tail + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.ears)
      };
    }
  });

  /* -----------------------------------------------------------------
     10) kutukpufi — Kütük, Kütük Pufisi (GİZLİ)
     devrik minik kütük gövdesi (kabuk halkalı), üstünde minik turuncu
     mantarlar, yüz ön kesitte (açık ahşap halkalı), başında filiz.
     Nadirlik ışıması API'nin standart aurasıyla gelir — burada aura yok.
     ----------------------------------------------------------------- */
  function kutukpufiBits (c) {
    var BRD = '#5C4433', WD = '#F2E2C4', WDD = '#D9B98C', MOS = '#6FA05A';
    var b = {};
    b.log =
      c.caps(60, 83, 58, 28, c.vinyl('klg', '#B08968', BRD), { rx: 13 }) +
      (c.sil ? '' :
        c.line('M38,72 C35.5,77.5 35.5,89 38,94.5', c.LW2, BRD, { op: 0.5 }) +
        c.line('M79,72 C81.5,77.5 81.5,89 79,94.5', c.LW2, BRD, { op: 0.5 }) +
        c.line('M85,74.5 C86.8,79 86.8,87 85,91.5', c.LW2, BRD, { op: 0.4 }) +
        c.blob(35, 95, 6.5, 4, MOS, { line: false, op: 0.75 }) +
        c.blob(84, 94, 5.5, 3.5, MOS, { line: false, op: 0.7 })) +
      c.gloss(42, 76.5, 10, 4.4) +
      c.bounce(60, 95.5, 20, 4.2, '#D9A46B', 0.2);
    b.mushrooms =
      c.caps(38, 68.5, 5.5, 6, '#FFF6E3', { rx: 2.4, lw: c.LW2 }) +
      c.drop(38, 64, 4.6, 7, c.vinyl('kmr', '#E89A5A', '#D98E4A'), { lw: c.LW2 }) +
      c.caps(84, 67, 5, 5.5, '#FFF6E3', { rx: 2.2, lw: c.LW2 }) +
      c.drop(84, 63, 4, 6.5, c.vinyl('kms', '#E89A5A', '#D98E4A'), { lw: c.LW2 }) +
      (c.sil ? '' : c.dot(36.8, 63, 0.8, 0.4) + c.dot(84.8, 62.2, 0.7, 0.4));
    b.cut =
      c.ball(60, 51, 19, c.vinyl('kct', WD, WDD), {}) +
      (c.sil ? '' :
        c.line('M60,40.5 a10.5,10.5 0 1 0 0.01,0', c.LW2, WDD, { op: 0.8 }) +
        c.line('M60,46 a5,5 0 1 0 0.01,0', c.LW2, WDD, { op: 0.8 })) +
      c.gloss(51, 42.5, 7, 4);
    b.sprout =
      c.rope('M60,33 C60,29 61.5,26 63,23.5', 2.6, '#4E7C46', {}) +
      c.leaf(56.5, 24.5, 5, 3.2, c.vinyl('ksp', '#A8CF8E', MOS), { rot: -35 }) +
      c.leaf(67, 21.5, 5.5, 3.4, c.vinyl('ksq', '#A8CF8E', MOS), { rot: 28 });
    b.face =
      c.eyes(60, 50, { dx: 7.2, r: 4.5 }) +
      c.cheeks(60, 57, 12.5, {}) +
      c.mouth(60, 58.5, 'smile', { w: 7.5 });
    b.sparkles =
      (c.sil ? '' :
        c.sparkle(30, 56, 3.2, '#FFF6E3', 0.85) +
        c.sparkle(90, 48, 2.8, '#FFF6E3', 0.8));
    return b;
  }

  Y.art.registerKind('kutukpufi', {
    pufi: function (c) {
      var b = kutukpufiBits(c);
      return b.log + b.mushrooms + b.cut + b.sprout + b.face + b.sparkles;
    },
    parts: function (c) {
      var b = kutukpufiBits(c);
      return {
        govde:    c.move(0, -8, b.log),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.cut + b.sprout + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, b.mushrooms + b.sparkles)
      };
    }
  });

})();

/* =====================================================================
   Bu dosyada kayıtlı kindler (Fısıltı Ormanı):
   1. baykus     — Puhu, baykuş yavrusu (kitaplı)
   2. tilki      — Kızıl, tilki yavrusu (pofuduk kuyruk)
   3. porsuk     — Pofur, porsuk (kiler sepetli)
   4. yarasa     — Şemsi, yarasa yavrusu (şemsiye kanatlı)
   5. rakun      — Pufla, rakun yavrusu (şekerli)
   6. atesbocegi — Cini, ateşböceği (ışık küreli)
   7. ibibik     — Hüthüt, ibibik kuşu (yelpaze tepelikli)
   8. susamuru   — Topak, su samuru yavrusu (çakıllı)
   9. vasak      — Mırra, vaşak yavrusu (püsküllü)
   10. kutukpufi — Kütük, Kütük Pufisi (GİZLİ — mantarlı devrik kütük)
   ===================================================================== */
