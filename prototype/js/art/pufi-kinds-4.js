/* =====================================================================
   YUVO SANAT — pufi-kinds-4.js  (sahip: ressam-4 · Fısıltı Ormanı yaygınları)
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* =================================================================
     1) AYICIK — "Tostoş", yavru ayı
     bal-kahve tombul gövde · yuvarlak kulaklar · göbek yaması · bal kabı
     ================================================================= */
  function ayicikBits (c) {
    var LT = '#D9A86B', DK = '#8B6242', KRM = '#FFF6E3', BAL = '#F2C94C';
    var b = {};
    b.feet =
      c.caps(49, 99.5, 13, 8, '#B08968', {}) +
      c.caps(71, 99.5, 13, 8, '#B08968', {});
    b.body =
      c.blob(60, 81, 24.5, 19.5, c.vinyl('ay1', LT, DK), {}) +
      c.blob(60, 84.5, 13, 10.5, KRM, { lw: c.LW2 }) +
      c.gloss(47, 69.5, 9, 5) +
      c.bounce(60, 95.5, 15.5, 4.4, '#F2DDB8', 0.2);
    b.head =
      c.ball(60, 44, 21, c.vinyl('ay2', LT, DK), {}) +
      c.gloss(49.5, 34, 8, 4.6);
    b.ears =
      c.earRound(44, 27.5, 7.6, c.vinyl('ay3', LT, DK), '#E8C79A') +
      c.earRound(76, 27.5, 7.6, c.vinyl('ay4', LT, DK), '#E8C79A');
    b.face =
      c.blob(60, 50.5, 8.6, 6.4, KRM, { line: false, op: 0.92 }) +
      c.ball(60, 47.6, 2.6, '#5C4433', { line: false }) +
      c.eyes(60, 42.5, { dx: 8.4, r: 4.6 }) +
      c.cheeks(60, 50.5, 14.6, {}) +
      c.mouth(60, 53.6, 'smile', { w: 7.5 });
    b.balkabi =
      c.caps(85, 88.5, 13, 11.5, c.vinyl('ay5', '#C98A4B', '#7A5230'), { rx: 4 }) +
      c.caps(85, 83, 15, 4.6, '#A97C50', { rx: 2.2 }) +
      (c.sil ? '' :
        c.blob(85, 81, 5, 2.3, BAL, { line: false, op: 0.95 }) +
        c.gloss(81.5, 87.5, 3, 3.4) +
        c.dot(85, 90, 1.1, 0.35));
    return b;
  }
  Y.art.registerKind('ayicik', {
    pufi: function (c) {
      var b = ayicikBits(c);
      return b.feet + b.body + b.head + b.ears + b.face + b.balkabi;
    },
    parts: function (c) {
      var b = ayicikBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.ears + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-25, -26, b.balkabi)) };
    }
  });

  /* =================================================================
     2) MANTARCIN — "Mantuş", mantar cini
     krem gövdecik · kırmızı benekli koca şapka · utangaç gülüş
     ================================================================= */
  function mantarcinBits (c) {
    var KRM = '#FFF6E3', KRD = '#EAD3AE', KAP = '#E85D4A', KPD = '#C94433';
    var b = {};
    b.feet =
      c.caps(51, 100, 11, 7, '#E0C9A6', {}) +
      c.caps(69, 100, 11, 7, '#E0C9A6', {});
    b.body =
      c.blob(60, 82, 22.5, 18, c.vinyl('mn1', KRM, KRD), {}) +
      c.gloss(48.5, 71.5, 8.5, 4.8) +
      c.bounce(60, 95.5, 14, 4.2, '#FFFBEF', 0.22);
    b.head =
      c.ball(60, 46, 19.5, c.vinyl('mn2', KRM, KRD), {}) +
      c.gloss(50, 37.5, 7.5, 4.2);
    b.sapka =
      c.blob(60, 26.5, 27, 13.5, c.vinyl('mn3', KAP, KPD), {}) +
      c.caps(60, 35.5, 42, 5.4, '#D14C3C', { line: false, op: 0.55, rx: 2.7 }) +
      c.gloss(45, 20.5, 9, 4.4) +
      (c.sil ? '' :
        c.ball(48, 25, 3.2, KRM, { line: false, op: 0.95 }) +
        c.ball(63, 19.5, 2.6, KRM, { line: false, op: 0.95 }) +
        c.ball(73, 27, 2.9, KRM, { line: false, op: 0.95 }) +
        c.ball(56, 31.5, 1.9, KRM, { line: false, op: 0.9 }));
    b.face =
      c.eyes(60, 46.5, { dx: 7.6, r: 4.5 }) +
      c.cheeks(60, 53.5, 13.4, {}) +
      c.mouth(60, 55, 'smile', { w: 6 });
    return b;
  }
  Y.art.registerKind('mantarcin', {
    pufi: function (c) {
      var b = mantarcinBits(c);
      return b.feet + b.body + b.head + b.sapka + b.face;
    },
    parts: function (c) {
      var b = mantarcinBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(0, 33, b.sapka)) };
    }
  });

  /* =================================================================
     3) AGACKAKAN — "Tıkırtı", ağaçkakan yavrusu
     kızıl tepelik · krem göğüs · kanat çizgileri · sivri gaga · tokmak
     ================================================================= */
  function agackakanBits (c) {
    var GVD = '#B08968', GVD2 = '#5C4433', KRM = '#FFF6E3';
    var TPE = '#E85D4A', TPD = '#C94433', GAGA = '#D98E4A';
    var b = {};
    b.wings =
      c.leaf(32.5, 77, 8.5, 15.5, c.vinyl('ak1', '#A9805C', GVD2), { rot: -20 }) +
      c.leaf(87.5, 77, 8.5, 15.5, c.vinyl('ak2', '#A9805C', GVD2), { rot: 20 }) +
      (c.sil ? '' :
        c.line('M28.5,72.5 L35,76', 1.8, KRM, { op: 0.75 }) +
        c.line('M27.5,79 L34,82', 1.8, KRM, { op: 0.75 }) +
        c.line('M91.5,72.5 L85,76', 1.8, KRM, { op: 0.75 }) +
        c.line('M92.5,79 L86,82', 1.8, KRM, { op: 0.75 }));
    b.feet =
      c.caps(50.5, 100, 10.5, 6.5, GAGA, {}) +
      c.caps(69.5, 100, 10.5, 6.5, GAGA, {});
    b.body =
      c.blob(60, 81, 23, 19, c.vinyl('ak3', GVD, GVD2), {}) +
      c.blob(60, 84, 13.5, 12, KRM, { lw: c.LW2 }) +
      c.gloss(47.5, 70, 8.5, 4.8) +
      c.bounce(60, 95.5, 14.5, 4.2, '#E8D5BC', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('ak4', GVD, GVD2), {}) +
      c.blob(60, 49.5, 11.5, 8.5, KRM, { line: false, op: 0.94 }) +
      c.gloss(49.5, 34.5, 8, 4.4);
    b.tepelik =
      c.drop(52.5, 24, 3.1, 8.5, c.vinyl('ak5', TPE, TPD), { lw: c.LW2 }) +
      c.drop(60, 22, 3.4, 9, c.vinyl('ak6', TPE, TPD), { lw: c.LW2 }) +
      c.drop(67.5, 24, 3.1, 8.5, c.vinyl('ak7', TPE, TPD), { lw: c.LW2 });
    b.face =
      c.eyes(60, 42, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 49.5, 14.2, {}) +
      c.beak(60, 50, 9.5, GAGA, {});
    b.tokmak =
      c.rope('M79,86 L91,73', 3.4, '#A97C50', { hi: true }) +
      c.ball(92.5, 71, 4.4, c.vinyl('ak8', '#C89B6B', '#7A5230'), {}) +
      (c.sil ? '' : c.gloss(91, 69.5, 1.8, 1.2));
    return b;
  }
  Y.art.registerKind('agackakan', {
    pufi: function (c) {
      var b = agackakanBits(c);
      return b.wings + b.feet + b.body + b.head + b.tepelik + b.face + b.tokmak;
    },
    parts: function (c) {
      var b = agackakanBits(c);
      return {
        govde:    c.move(0, -8, b.wings + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.tepelik + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-26, -19, b.tokmak)) };
    }
  });

  /* =================================================================
     4) YOSUNTOPU — "Yosun", yosun topu
     tek büyük yeşil top · kenarları yaprak püsküllü · tepede filiz
     ================================================================= */
  function yosuntopuBits (c) {
    var LT = '#A8CF8E', MD = '#6FA05A', DKG = '#4E7C46';
    var b = {};
    var tuft = c.leaf(60, 28, 3.6, 8.5, c.vinyl('ys1', LT, MD), { op: 0.95 });
    b.tufts =
      tuft +
      c.spin(36, 60, 63, tuft) + c.spin(-36, 60, 63, tuft) +
      c.spin(72, 60, 63, tuft) + c.spin(-72, 60, 63, tuft) +
      c.spin(108, 60, 63, tuft) + c.spin(-108, 60, 63, tuft) +
      c.spin(144, 60, 63, tuft) + c.spin(-144, 60, 63, tuft);
    b.feet =
      c.caps(50, 100, 10.5, 6.5, MD, {}) +
      c.caps(70, 100, 10.5, 6.5, MD, {});
    b.body =
      c.ball(60, 63, 33, c.vinyl('ys2', LT, DKG), {}) +
      c.gloss(45.5, 47, 11, 6) +
      c.bounce(60, 90, 18, 5, '#CDE8B8', 0.22) +
      (c.sil ? '' :
        c.dot(44, 70, 1.4, 0.3) + c.dot(74, 56, 1.3, 0.3) +
        c.dot(52, 84, 1.2, 0.28) + c.dot(70, 78, 1.3, 0.28) +
        c.dot(38, 56, 1.2, 0.26));
    b.filiz =
      c.rope('M60,31 C60,25 58.5,21 55,17.5', 2.5, DKG, {}) +
      c.leaf(50.5, 14.5, 6, 3.4, c.vinyl('ys3', '#BFE39A', MD), { rot: -32 }) +
      c.leaf(60.5, 13.5, 5.4, 3, c.vinyl('ys4', '#BFE39A', MD), { rot: 24 });
    b.minibas =
      c.ball(60, 44, 20.5, c.vinyl('ys5', LT, DKG), {}) +
      c.gloss(50, 35.5, 8, 4.4);
    b.face =
      c.eyes(60, 44, { dx: 8.6, r: 4.8 }) +
      c.cheeks(60, 51.5, 14.6, {}) +
      c.mouth(60, 53, 'smile', { w: 8.5 });
    return b;
  }
  Y.art.registerKind('yosuntopu', {
    pufi: function (c) {
      var b = yosuntopuBits(c);
      return b.tufts + b.feet + b.body + b.filiz + c.move(0, 14, b.face);
    },
    parts: function (c) {
      var b = yosuntopuBits(c);
      return {
        govde:    c.move(0, -6, b.tufts + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.minibas + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(2, 44, b.filiz)) };
    }
  });

  /* =================================================================
     5) KOZALAK — "Pürtük", kozalak pufisi
     kahve gövdede pul sıraları · tepede filiz · sırtında çam dalı
     ================================================================= */
  function kozalakBits (c) {
    var LT = '#A97C50', DK = '#7A5230', LT2 = '#B98A5C', YSL = '#7FB069', YSD = '#4E7C46';
    var b = {};
    var PUL = c.vinyl('kzp', LT2, DK);
    b.dal =
      c.rope('M80,68 C88,62 92,54 93,45', 3, '#8B6242', {}) +
      c.leaf(88.5, 42.5, 6, 2.6, c.vinyl('kz1', YSL, YSD), { rot: -55 }) +
      c.leaf(93, 50, 5, 2.4, c.vinyl('kz2', YSL, YSD), { rot: -15 }) +
      (c.sil ? '' :
        c.leaf(85.5, 52.5, 5.2, 2.2, c.vinyl('kz3', YSL, YSD), { rot: -78, op: 0.95 }));
    b.feet =
      c.caps(50, 100, 11, 7, '#8B6242', {}) +
      c.caps(70, 100, 11, 7, '#8B6242', {});
    b.body =
      c.blob(60, 80.5, 23.5, 19.5, c.vinyl('kz4', LT, DK), {}) +
      (c.sil ? '' :
        c.caps(49.5, 69, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(60, 67.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(70.5, 69, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(43.5, 76.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(54.5, 76.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(65.5, 76.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(76.5, 76.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(47.5, 84.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(58.5, 84.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(69.5, 84.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(53, 91.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 }) +
        c.caps(66, 91.5, 11.5, 6.2, PUL, { lw: c.LW2, rx: 3 })) +
      c.gloss(47, 69, 8.5, 4.6) +
      c.bounce(60, 95.5, 15, 4.4, '#D9BC96', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('kz5', LT2, DK), {}) +
      (c.sil ? '' :
        c.caps(51, 30.5, 10.5, 5.6, PUL, { lw: c.LW2, rx: 2.8, rot: -14 }) +
        c.caps(69, 30.5, 10.5, 5.6, PUL, { lw: c.LW2, rx: 2.8, rot: 14 })) +
      c.gloss(49.5, 35, 8, 4.4);
    b.filiz =
      c.rope('M60,25 C60.5,20.5 62,17 65,14', 2.4, YSD, {}) +
      c.leaf(68.5, 11.8, 5.4, 3, c.vinyl('kz6', '#A8CF8E', '#6FA05A'), { rot: 30 }) +
      c.leaf(59.5, 12.2, 4.8, 2.7, c.vinyl('kz7', '#A8CF8E', '#6FA05A'), { rot: -38 });
    b.face =
      c.eyes(60, 43.5, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 51, 14, {}) +
      c.mouth(60, 52.5, 'smile', { w: 7.5 });
    return b;
  }
  Y.art.registerKind('kozalak', {
    pufi: function (c) {
      var b = kozalakBits(c);
      return b.dal + b.feet + b.body + b.head + b.filiz + b.face;
    },
    parts: function (c) {
      var b = kozalakBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.filiz + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-28, 6, b.dal)) };
    }
  });

  /* =================================================================
     6) GEYIKYAVRU — "Benek", geyik yavrusu
     tarçın gövde · sırt benekleri · iri kulaklar · tomurcuk boynuz · yonca
     ================================================================= */
  function geyikyavruBits (c) {
    var LT = '#D98E4A', DK = '#8B6242', KRM = '#FFF6E3';
    var b = {};
    b.boynuz =
      c.drop(48, 21, 2.7, 7, '#B08968', { lw: c.LW2 }) +
      c.drop(72, 21, 2.7, 7, '#B08968', { lw: c.LW2 });
    b.ears =
      c.leaf(37, 25.5, 7.5, 12.5, c.vinyl('gy1', LT, DK), { rot: -24 }) +
      c.leaf(83, 25.5, 7.5, 12.5, c.vinyl('gy2', LT, DK), { rot: 24 }) +
      (c.sil ? '' :
        c.leaf(38.5, 26.5, 3.6, 7, KRM, { line: false, rot: -24, op: 0.85 }) +
        c.leaf(81.5, 26.5, 3.6, 7, KRM, { line: false, rot: 24, op: 0.85 }));
    b.feet =
      c.caps(49.5, 99.5, 12, 7.5, '#B08968', {}) +
      c.caps(70.5, 99.5, 12, 7.5, '#B08968', {});
    b.body =
      c.blob(60, 81, 23.5, 19, c.vinyl('gy3', LT, DK), {}) +
      c.blob(60, 85, 13, 11, KRM, { lw: c.LW2 }) +
      (c.sil ? '' :
        c.ball(44, 70, 2, KRM, { line: false, op: 0.92 }) +
        c.ball(52, 66, 1.8, KRM, { line: false, op: 0.92 }) +
        c.ball(68, 66.5, 1.9, KRM, { line: false, op: 0.92 }) +
        c.ball(76, 70.5, 2, KRM, { line: false, op: 0.92 }) +
        c.ball(47.5, 75.5, 1.6, KRM, { line: false, op: 0.88 }) +
        c.ball(72.5, 76, 1.6, KRM, { line: false, op: 0.88 })) +
      c.gloss(47.5, 70, 8.5, 4.6) +
      c.bounce(60, 95.5, 15, 4.4, '#EED7B8', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('gy4', LT, DK), {}) +
      c.blob(60, 51, 9, 6.6, KRM, { line: false, op: 0.92 }) +
      c.gloss(49.5, 34.5, 8, 4.4);
    b.face =
      c.ball(60, 48.6, 2.5, '#5C4433', { line: false }) +
      c.eyes(60, 42.5, { dx: 8.2, r: 4.7 }) +
      c.cheeks(60, 50.5, 14.4, {}) +
      c.mouth(60, 53.8, 'smile', { w: 7 });
    b.yonca =
      c.rope('M87,97 C87.5,93 87,89.5 86,86.5', 2.2, '#4E7C46', {}) +
      c.ball(82.5, 83, 3.4, c.vinyl('gy5', '#A8CF8E', '#6FA05A'), { lw: c.LW2 }) +
      c.ball(89.5, 83, 3.4, c.vinyl('gy6', '#A8CF8E', '#6FA05A'), { lw: c.LW2 }) +
      c.ball(86, 78.5, 3.4, c.vinyl('gy7', '#A8CF8E', '#6FA05A'), { lw: c.LW2 }) +
      (c.sil ? '' : c.sparkle(93.5, 76, 2.6, '#FFFFFF', 0.85));
    return b;
  }
  Y.art.registerKind('geyikyavru', {
    pufi: function (c) {
      var b = geyikyavruBits(c);
      return b.boynuz + b.ears + b.feet + b.body + b.head + b.face + b.yonca;
    },
    parts: function (c) {
      var b = geyikyavruBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.boynuz + b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-26, -23, b.yonca)) };
    }
  });

  /* =================================================================
     7) FISILTIBOCEGI — "Fısfıs", fısıltı böceği
     nane yeşili gövde · şeffaf çift kanat · antenler · kanatta spiral
     ================================================================= */
  function fisiltibocegiBits (c) {
    var LT = '#A8CF8E', MD = '#6FA05A', DK = '#4E7C46';
    var CAM = '#F2FBFF', CAM2 = '#BFE3F2';
    var b = {};
    b.kanatlar =
      c.leaf(30.5, 63, 9.5, 19, c.vinyl('fb1', CAM, CAM2), { rot: -26, op: 0.6 }) +
      c.leaf(89.5, 63, 9.5, 19, c.vinyl('fb2', CAM, CAM2), { rot: 26, op: 0.6 }) +
      c.leaf(38, 71, 7, 13.5, c.vinyl('fb3', CAM, CAM2), { rot: -52, op: 0.5 }) +
      c.leaf(82, 71, 7, 13.5, c.vinyl('fb4', CAM, CAM2), { rot: 52, op: 0.5 }) +
      (c.sil ? '' :
        c.line('M30,60 c3.2,-1.2 5.4,1.6 3.4,3.8 c-1.8,2 -4.8,0.4 -3.8,-2.4', 1.5, '#8FB8C8', { op: 0.85 }) +
        c.line('M90,60 c-3.2,-1.2 -5.4,1.6 -3.4,3.8 c1.8,2 4.8,0.4 3.8,-2.4', 1.5, '#8FB8C8', { op: 0.85 }));
    b.anten =
      c.antenna('M53,27 C50,20.5 46,16.5 41.5,14.5', DK, 41.5, 14.5, 2.5) +
      c.antenna('M67,27 C70,20.5 74,16.5 78.5,14.5', DK, 78.5, 14.5, 2.5);
    b.feet =
      c.caps(51, 100, 10.5, 6.5, MD, {}) +
      c.caps(69, 100, 10.5, 6.5, MD, {});
    b.body =
      c.blob(60, 81.5, 22.5, 18.5, c.vinyl('fb5', LT, DK), {}) +
      (c.sil ? '' :
        c.caps(60, 88, 26, 4.6, MD, { line: false, op: 0.4, rx: 2.3 })) +
      c.gloss(48, 71, 8.5, 4.8) +
      c.bounce(60, 95.5, 14.5, 4.2, '#CDE8B8', 0.2);
    b.head =
      c.ball(60, 44, 20, c.vinyl('fb6', LT, DK), {}) +
      c.gloss(50, 35, 7.8, 4.3);
    b.face =
      c.eyes(60, 43.5, { dx: 7.8, r: 4.6 }) +
      c.cheeks(60, 51, 14, {}) +
      c.mouth(60, 52.5, 'smile', { w: 7 });
    return b;
  }
  Y.art.registerKind('fisiltibocegi', {
    pufi: function (c) {
      var b = fisiltibocegiBits(c);
      return b.kanatlar + b.feet + b.body + b.head + b.anten + b.face;
    },
    parts: function (c) {
      var b = fisiltibocegiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.anten + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(0, -4, b.kanatlar)) };
    }
  });

  /* =================================================================
     8) YUSUFCUK — "Zuzu", yusufçuk
     ince uzun gövde · 4 cam kanat · yakın iri gözler · kuyruk topuzu
     ================================================================= */
  function yusufcukBits (c) {
    var LT = '#9AD1D4', DK = '#5C9DA3', CAM = '#EAF7FF';
    var b = {};
    b.kanatlar =
      c.leaf(33, 56, 7, 18.5, c.vinyl('yz1', CAM, LT), { rot: -34, op: 0.62 }) +
      c.leaf(87, 56, 7, 18.5, c.vinyl('yz2', CAM, LT), { rot: 34, op: 0.62 }) +
      c.leaf(35, 72, 6.4, 16, c.vinyl('yz3', CAM, LT), { rot: -62, op: 0.55 }) +
      c.leaf(85, 72, 6.4, 16, c.vinyl('yz4', CAM, LT), { rot: 62, op: 0.55 }) +
      (c.sil ? '' :
        c.line('M31,50 L35.5,61.5', 1.4, '#8FB8C8', { op: 0.7 }) +
        c.line('M89,50 L84.5,61.5', 1.4, '#8FB8C8', { op: 0.7 }));
    b.topuz =
      c.ball(60, 98, 4.3, c.vinyl('yz5', LT, DK), {});
    b.feet =
      c.caps(52.5, 99.5, 9.5, 6, '#7EB9BD', {}) +
      c.caps(67.5, 99.5, 9.5, 6, '#7EB9BD', {});
    b.body =
      c.caps(60, 79, 17, 37, c.vinyl('yz6', LT, DK), { rx: 8.5 }) +
      (c.sil ? '' :
        c.caps(60, 72, 14.5, 4, DK, { line: false, op: 0.35, rx: 2 }) +
        c.caps(60, 80, 14.5, 4, DK, { line: false, op: 0.35, rx: 2 }) +
        c.caps(60, 88, 13.5, 4, DK, { line: false, op: 0.35, rx: 2 })) +
      c.gloss(53.5, 68, 4.6, 6.5) +
      c.bounce(60, 94.5, 9.5, 3.4, '#D6EEF0', 0.22);
    b.head =
      c.ball(60, 44, 19.5, c.vinyl('yz7', LT, DK), {}) +
      c.gloss(50, 35, 7.6, 4.2);
    b.face =
      c.eyes(60, 44, { dx: 7, r: 5.2 }) +
      c.cheeks(60, 51.5, 13, {}) +
      c.mouth(60, 53, 'smile', { w: 7 });
    return b;
  }
  Y.art.registerKind('yusufcuk', {
    pufi: function (c) {
      var b = yusufcukBits(c);
      return b.kanatlar + b.topuz + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = yusufcukBits(c);
      return {
        govde:    c.move(0, -8, b.topuz + b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(0, -4, b.kanatlar)) };
    }
  });

  /* =================================================================
     9) KURBAGA — "Pıtpıt", kurbağacık
     yeşil tombul gövde · gözler kafanın üstünde · nilüfer yaprağı
     ================================================================= */
  function kurbagaBits (c) {
    var LT = '#A8CF8E', MD = '#6FA05A', DK = '#4E7C46', KRM = '#FFF6E3';
    var b = {};
    b.nilufer =
      c.blob(60, 99, 21, 5.6, c.vinyl('kb1', '#7FB069', DK), {}) +
      (c.sil ? '' :
        c.line('M60,96.5 L74,99.5', 1.6, DK, { op: 0.55 }) +
        c.line('M60,96.5 L49,100.5', 1.6, DK, { op: 0.55 }));
    b.feet =
      c.caps(49.5, 98.5, 13, 7, MD, {}) +
      c.caps(70.5, 98.5, 13, 7, MD, {});
    b.body =
      c.blob(60, 82, 24, 18.5, c.vinyl('kb2', LT, MD), {}) +
      c.blob(60, 86, 13.5, 10.5, KRM, { lw: c.LW2 }) +
      c.gloss(47, 72, 9, 4.8) +
      c.bounce(60, 95, 15, 4.2, '#CDE8B8', 0.2);
    b.head =
      c.ball(60, 46, 20.5, c.vinyl('kb3', LT, MD), {}) +
      c.gloss(49.5, 37.5, 8, 4.4);
    b.gozler =
      c.ball(48.5, 26.5, 7.4, c.vinyl('kb4', LT, MD), {}) +
      c.ball(71.5, 26.5, 7.4, c.vinyl('kb5', LT, MD), {}) +
      c.eyes(60, 26.5, { dx: 11.5, r: 4.4 });
    b.face =
      c.cheeks(60, 50, 14.8, {}) +
      c.mouth(60, 51, 'smile', { w: 12 }) +
      (c.sil ? '' : c.dot(54, 42.5, 1.1, 0.35) + c.dot(66, 42.5, 1.1, 0.35));
    return b;
  }
  Y.art.registerKind('kurbaga', {
    pufi: function (c) {
      var b = kurbagaBits(c);
      return b.nilufer + b.feet + b.body + b.head + b.gozler + b.face;
    },
    parts: function (c) {
      var b = kurbagaBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.gozler + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(0, -39, b.nilufer)) };
    }
  });

  /* =================================================================
     10) KESTANEPUFI — "Kestane", kestane kirpisi
     altı parlak kestane · üstü yumuşak dikenli hale · krem yüz penceresi
     ================================================================= */
  function kestanepufiBits (c) {
    var KAB = '#A97C50', KABD = '#5C4433', DKN = '#8B6242', KRM = '#FFF6E3';
    var b = {};
    var diken = c.drop(60, 20.5, 3, 8.5, c.vinyl('ke1', '#B98A5C', DKN), { lw: c.LW2 });
    b.dikenler =
      c.spin(-78, 60, 44, diken) + c.spin(-52, 60, 44, diken) +
      c.spin(-26, 60, 44, diken) + diken +
      c.spin(26, 60, 44, diken) + c.spin(52, 60, 44, diken) +
      c.spin(78, 60, 44, diken);
    b.feet =
      c.caps(50, 100, 11, 7, DKN, {}) +
      c.caps(70, 100, 11, 7, DKN, {});
    b.body =
      c.blob(60, 81.5, 24, 19, c.vinyl('ke2', KAB, KABD), {}) +
      c.gloss(46.5, 70.5, 9.5, 5.4) +
      (c.sil ? '' : c.gloss(72, 76, 3.4, 2.2)) +
      c.bounce(60, 95.5, 15, 4.4, '#D9BC96', 0.22);
    b.head =
      c.ball(60, 44, 21, c.vinyl('ke3', DKN, KABD), {}) +
      c.blob(60, 47.5, 13.5, 11.5, KRM, { lw: c.LW2 }) +
      c.gloss(50, 34, 7.5, 4);
    b.face =
      c.eyes(60, 45, { dx: 7.8, r: 4.5 }) +
      c.cheeks(60, 52, 13.2, {}) +
      c.mouth(60, 53.5, 'smile', { w: 7 });
    return b;
  }
  Y.art.registerKind('kestanepufi', {
    pufi: function (c) {
      var b = kestanepufiBits(c);
      return b.feet + b.body + b.dikenler + b.head + b.face;
    },
    parts: function (c) {
      var b = kestanepufiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.dikenler + b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(0, 24, b.dikenler)) };
    }
  });

  /* =================================================================
     11) BURUNDUK — "Çizgi", burunduk
     turuncu-tarçın gövde · sırtta 2 şerit · pofuduk kuyruk · fındık yanağı
     ================================================================= */
  function burundukBits (c) {
    var LT = '#D98E4A', DK = '#8B6242', KRM = '#FFF6E3', SRT = '#5C4433';
    var b = {};
    b.kuyruk =
      c.rope('M79,89 C93,84 96,70 90,57', 7.5, '#D98E4A', { hi: true }) +
      c.blob(88.5, 55, 7.5, 10.5, c.vinyl('bu1', '#E2A768', DK), { rot: 18 }) +
      (c.sil ? '' :
        c.caps(88.5, 55, 9.5, 4, SRT, { line: false, op: 0.5, rx: 2, rot: 18 }));
    b.ears =
      c.earRound(46.5, 27, 6, c.vinyl('bu2', LT, DK), KRM) +
      c.earRound(73.5, 27, 6, c.vinyl('bu3', LT, DK), KRM);
    b.feet =
      c.caps(49.5, 99.5, 12, 7.5, '#B08968', {}) +
      c.caps(70.5, 99.5, 12, 7.5, '#B08968', {});
    b.body =
      c.blob(60, 81, 23.5, 19, c.vinyl('bu4', LT, DK), {}) +
      c.blob(60, 85, 12.5, 10.5, KRM, { lw: c.LW2 }) +
      (c.sil ? '' :
        c.caps(45.5, 76, 6, 21, SRT, { line: false, op: 0.8, rx: 3, rot: -10 }) +
        c.caps(74.5, 76, 6, 21, SRT, { line: false, op: 0.8, rx: 3, rot: 10 })) +
      c.gloss(47.5, 70, 8.5, 4.6) +
      c.bounce(60, 95.5, 15, 4.4, '#EED0A8', 0.2);
    b.head =
      c.ball(60, 44, 20.5, c.vinyl('bu5', LT, DK), {}) +
      c.blob(73, 51.5, 7.6, 6.8, c.vinyl('bu6', '#E8B078', LT), { lw: c.LW2 }) +
      c.gloss(49.5, 34.5, 8, 4.4);
    b.face =
      c.ball(60, 47.8, 2.2, SRT, { line: false }) +
      c.eyes(60, 42.5, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 49.5, 13.2, {}) +
      c.mouth(60, 52.5, 'smile', { w: 7 });
    return b;
  }
  Y.art.registerKind('burunduk', {
    pufi: function (c) {
      var b = burundukBits(c);
      return b.kuyruk + b.feet + b.body + b.head + b.ears + b.face;
    },
    parts: function (c) {
      var b = burundukBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.ears + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-29, -11, b.kuyruk)) };
    }
  });

  /* =================================================================
     12) UYURFARE — "Mışmış", uyur fare
     lavanta-gri gövde · battaniye gibi sarılı kuyruk · yıldız yastık · 'o' ağız
     ================================================================= */
  function uyurfareBits (c) {
    var LT = '#CFC6E0', DK = '#8E7CC3', KRM = '#FFF6E3';
    var YIL = '#FFE9A8', YILD = '#F2C94C';
    var b = {};
    b.ears =
      c.earRound(45, 28, 7.8, c.vinyl('uf1', LT, DK), '#E8DFF2') +
      c.earRound(75, 28, 7.8, c.vinyl('uf2', LT, DK), '#E8DFF2');
    b.feet =
      c.caps(49.5, 99.5, 12, 7.5, '#B9A8D6', {}) +
      c.caps(70.5, 99.5, 12, 7.5, '#B9A8D6', {});
    b.body =
      c.blob(60, 81, 24, 19, c.vinyl('uf3', LT, DK), {}) +
      c.blob(60, 84.5, 13, 10.5, KRM, { lw: c.LW2 }) +
      c.gloss(47, 70, 9, 5) +
      c.bounce(60, 95.5, 15, 4.4, '#E4DCF2', 0.2);
    b.kuyruk =
      c.rope('M36,84 C31,93 40,100.5 60,100.5 C79,100.5 89,96 87,88.5', 6.8, '#B9A8D6', { hi: true });
    b.head =
      c.ball(60, 44, 21, c.vinyl('uf4', LT, DK), {}) +
      c.gloss(49.5, 34, 8, 4.6);
    b.face =
      c.eyes(60, 43, { dx: 8.2, r: 4.6 }) +
      c.cheeks(60, 50.5, 14.4, {}) +
      c.mouth(60, 52.5, 'o', { w: 5 });
    b.yastik =
      c.ball(85, 87.5, 6.8, c.vinyl('uf5', YIL, YILD), {}) +
      (c.sil ? '' :
        c.sparkle(85, 87, 5.2, KRM, 0.95) +
        c.sparkle(91, 80, 2.4, KRM, 0.7));
    return b;
  }
  Y.art.registerKind('uyurfare', {
    pufi: function (c) {
      var b = uyurfareBits(c);
      return b.feet + b.body + b.kuyruk + b.head + b.ears + b.face + b.yastik;
    },
    parts: function (c) {
      var b = uyurfareBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body + b.kuyruk),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.ears + b.face)),
        aksesuar: c.zoom(1.3, 60, 60, c.move(-25, -27.5, b.yastik)) };
    }
  });

  /* =====================================================================
     KAYITLI KINDLER (Fısıltı Ormanı yaygınları · 12 adet):
       1. ayicik        — Tostoş,  yavru ayı (bal kabı)
       2. mantarcin     — Mantuş,  mantar cini (benekli şapka)
       3. agackakan     — Tıkırtı, ağaçkakan yavrusu (davul tokmağı)
       4. yosuntopu     — Yosun,   yosun topu (filiz)
       5. kozalak       — Pürtük,  kozalak pufisi (çam dalı)
       6. geyikyavru    — Benek,   geyik yavrusu (yonca)
       7. fisiltibocegi — Fısfıs,  fısıltı böceği (spiralli kanatlar)
       8. yusufcuk      — Zuzu,    yusufçuk (cam kanatlar)
       9. kurbaga       — Pıtpıt,  kurbağacık (nilüfer yaprağı)
      10. kestanepufi   — Kestane, kestane kirpisi (diken halesi)
      11. burunduk      — Çizgi,   burunduk (pofuduk kuyruk)
      12. uyurfare      — Mışmış,  uyur fare (yıldız yastık)
     ===================================================================== */
})();
