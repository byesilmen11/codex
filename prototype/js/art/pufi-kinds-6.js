/* =====================================================================
   YUVO SANAT — pufi-kinds-6.js  (sahip: ressam-6 · Fısıltı Ormanı nadir/destansı/efsanevi)
   =====================================================================
   İkinci biyom "Fısıltı Ormanı"nın yıldızları:
   Nadir (6): gecekelebegi, kehribarbocegi, geyik, bulbul, ormanperi, camsamuru
   Destansı (2, ownAura): mesecani, isilgeyik
   Efsanevi (1, ownAura): bilgebaykus
   Stil: şeker-vinil sticker — tek mürekkep kontur (#3E2A1C, API basar),
   ışık sol-üst, gloss + bounce her büyük formda, süsler c.sil guard'lı.
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* =================================================================
     NADİR 1 — gecekelebegi · "Gölge" gece kelebeği
     Gece laciverti geniş kanatlar, üstlerinde ay gümüşü hilal + yıldız
     desenleri; gövde eflatun kapsül; tüylü antenler.
     ================================================================= */
  function gecekelebegiBits (c) {
    var NV = '#4C5A8E', NV2 = '#39466E';       // gece laciverti
    var EF = '#8E7CC3', EF2 = '#5C4A9E';       // orman eflatunu
    var AY = '#DCE3F2';                        // ay gümüşü
    var b = {};

    b.wings =
      c.leaf(32, 54, 12, 23, c.vinyl('kus', NV, NV2), { rot: -18 }) +
      c.leaf(88, 54, 12, 23, c.vinyl('kus2', NV, NV2), { rot: 18 }) +
      c.leaf(36, 80, 9, 15, c.vinyl('kal', NV, NV2), { rot: -50 }) +
      c.leaf(84, 80, 9, 15, c.vinyl('kal2', NV, NV2), { rot: 50 }) +
      c.gloss(28, 42, 5.5, 3.2) +
      c.gloss(92, 42, 5.5, 3.2) +
      (c.sil ? '' :
        c.moon(30, 48, 5.4, AY, { line: false, op: 0.95 }) +
        c.moon(90, 48, 5.4, AY, { line: false, op: 0.95 }) +
        c.dot(36, 62, 1.8, 0.9) + c.dot(84, 62, 1.8, 0.9) +
        c.dot(30, 68, 1.3, 0.75) + c.dot(90, 68, 1.3, 0.75) +
        c.dot(34, 82, 1.5, 0.8) + c.dot(86, 82, 1.5, 0.8) +
        c.sparkle(25, 33, 3, AY, 0.85) +
        c.sparkle(95, 33, 3, AY, 0.85));

    b.feet =
      c.caps(51, 99.5, 11, 7, EF2, {}) +
      c.caps(69, 99.5, 11, 7, EF2, {});

    b.body =
      c.caps(60, 81, 46, 37, c.vinyl('gov', EF, EF2), { rx: 18 }) +
      (c.sil ? '' :
        c.caps(60, 88, 34, 5.4, EF2, { line: false, op: 0.45, rx: 2.7 }) +
        c.caps(60, 95, 26, 4.8, EF2, { line: false, op: 0.45, rx: 2.4 })) +
      c.gloss(48, 70, 9, 5) +
      c.bounce(60, 95.5, 15, 4.4, AY, 0.2);

    b.head =
      c.ball(60, 44, 20.5, c.vinyl('kaf', EF, EF2), {}) +
      c.gloss(49.5, 34, 8, 4.6);

    b.ant =
      c.antenna('M53,26 C50,18 45,12 38,9', NV2, 38, 9, 2.7) +
      c.antenna('M67,26 C70,18 75,12 82,9', NV2, 82, 9, 2.7) +
      (c.sil ? '' :
        c.dot(44.5, 13, 1.2, 0.85) + c.dot(75.5, 13, 1.2, 0.85) +
        c.dot(48.5, 17.5, 1, 0.7) + c.dot(71.5, 17.5, 1, 0.7));

    b.face =
      c.eyes(60, 44, { dx: 8, r: 4.7 }) +
      c.cheeks(60, 51, 13.5, {}) +
      c.mouth(60, 52.5, 'smile', { w: 8 });

    return b;
  }
  Y.art.registerKind('gecekelebegi', {
    pufi: function (c) {
      var b = gecekelebegiBits(c);
      return b.wings + b.feet + b.body + b.head + b.ant + b.face;
    },
    parts: function (c) {
      var b = gecekelebegiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.ant + b.face)),
        aksesuar: c.zoom(0.95, 60, 60, c.move(0, -4, b.wings))
      };
    }
  });

  /* =================================================================
     NADİR 2 — kehribarbocegi · "Reçine" kehribar böceği
     Bal-kehribar sırt kabuğu; içinde hatıra saklı minik yaprak silüeti;
     altın bacaklar; kabukta güçlü gloss.
     ================================================================= */
  function kehribarbocegiBits (c) {
    var KH = '#FFD34D', KH2 = '#F2A61B';       // kehribar-altın
    var KB = '#8B6242', KB2 = '#5C4433';       // ağaç kabuğu
    var ALT = '#FFD34D';
    var b = {};

    b.feet =
      c.caps(36, 87, 10, 6.5, ALT, { rot: -34 }) +
      c.caps(84, 87, 10, 6.5, ALT, { rot: 34 }) +
      c.caps(44, 99.5, 10.5, 7, ALT, {}) +
      c.caps(60, 100, 10.5, 7, ALT, {}) +
      c.caps(76, 99.5, 10.5, 7, ALT, {});

    b.body =
      c.blob(60, 88, 20, 12.5, c.vinyl('kar', KB, KB2), {}) +
      c.gloss(51, 84, 6, 3) +
      c.bounce(60, 96, 13, 3.8, '#FFE9A8', 0.2);

    b.shell =
      c.ball(60, 73, 24, c.vinyl('kab', KH, KH2), {}) +
      (c.sil ? '' :
        c.leaf(64, 75, 5.5, 9.5, KB2, { line: false, op: 0.4, rot: 18 }) +
        c.line('M61.5,82 C62.5,79 63.5,76 65.5,71', 1.5, KB2, { op: 0.35 }) +
        c.dot(52, 80, 1.6, 0.25) +
        c.dot(69, 84, 1.3, 0.22) +
        c.gloss(70, 66, 4.5, 2.6)) +
      c.gloss(49, 62, 10.5, 6);

    b.head =
      c.ball(60, 44, 20, c.vinyl('kaf', KH, KH2), {}) +
      c.gloss(50, 34.5, 7.5, 4.4);

    b.ant =
      c.antenna('M52,27 C50,21 46,16 42,12', KB2, 42, 12, 2.2) +
      c.antenna('M68,27 C70,21 74,16 78,12', KB2, 78, 12, 2.2);

    b.face =
      c.eyes(60, 44, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 51, 13.5, {}) +
      c.mouth(60, 52.5, 'smile', { w: 7.5 });

    return b;
  }
  Y.art.registerKind('kehribarbocegi', {
    pufi: function (c) {
      var b = kehribarbocegiBits(c);
      return b.feet + b.body + b.shell + b.head + b.ant + b.face;
    },
    parts: function (c) {
      var b = kehribarbocegiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.ant + b.face)),
        aksesuar: c.zoom(1.15, 60, 60, c.move(0, -13, b.shell))
      };
    }
  });

  /* =================================================================
     NADİR 3 — geyik · "Boynuz" genç geyik
     Tarçın gövde, krem göğüs; zarif dallı boynuzlar — uçlarında minik
     yeşil yapraklar ("boynuzunda orman büyür"), bir dalında minik kuş.
     ================================================================= */
  function geyikBits (c) {
    var TR = '#B08968', TR2 = '#8B6242';       // tarçın / kabuk
    var KO = '#5C4433';                        // koyu kabuk (toynak, burun)
    var KREM = '#FFF6E3', YE = '#6FA05A';
    var b = {};

    b.antlers =
      c.rope('M50,32 C47,22 46,14 48,7', 4.2, TR2, { hi: true }) +
      c.rope('M49,21 C45,18 41,16 36,13', 3.2, TR2, {}) +
      c.rope('M70,32 C73,22 74,14 72,7', 4.2, TR2, { hi: true }) +
      c.rope('M71,21 C75,18 79,16 84,13', 3.2, TR2, {}) +
      c.leaf(48, 5, 2.8, 4.6, YE, { line: false, rot: 16, op: 0.95 }) +
      c.leaf(35, 11, 2.6, 4.2, YE, { line: false, rot: -42, op: 0.95 }) +
      c.leaf(72, 5, 2.8, 4.6, YE, { line: false, rot: -16, op: 0.95 }) +
      (c.sil ? '' :
        c.ball(85, 10.3, 3, '#D98E9A', { lw: c.LW2 }) +
        c.beak(88, 10.5, 2.8, '#F2A61B', {}) +
        c.dot(84, 9.4, 0.7, 0.9) +
        c.sparkle(42, 8, 2.4, '#FFF6E3', 0.7));

    b.ears =
      c.earRound(42, 33, 6.8, TR, KREM) +
      c.earRound(78, 33, 6.8, TR, KREM);

    b.feet =
      c.caps(50, 99.5, 12, 7.5, KO, {}) +
      c.caps(70, 99.5, 12, 7.5, KO, {});

    b.body =
      c.blob(60, 81, 23, 19, c.vinyl('gvd', TR, TR2), {}) +
      c.blob(60, 80, 12.5, 12, KREM, { line: false, op: 0.95 }) +
      (c.sil ? '' :
        c.dot(46, 72, 1.5, 0.35) +
        c.dot(74, 74, 1.3, 0.3)) +
      c.gloss(46.5, 70, 8, 4.6) +
      c.bounce(60, 96, 15, 4.4, '#E8D2B8', 0.2);

    b.head =
      c.ball(60, 44, 20.5, c.vinyl('kaf', TR, TR2), {}) +
      c.blob(60, 51, 9, 6.4, KREM, { line: false, op: 0.95 }) +
      c.gloss(49.5, 34, 8, 4.6);

    b.face =
      c.eyes(60, 43.5, { dx: 8.2, r: 4.6 }) +
      c.cheeks(60, 50, 14, {}) +
      c.ball(60, 48.2, 2.5, KO, { line: false }) +
      c.mouth(60, 52.5, 'smile', { w: 7 });

    return b;
  }
  Y.art.registerKind('geyik', {
    pufi: function (c) {
      var b = geyikBits(c);
      return b.antlers + b.ears + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = geyikBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.1, 60, 60, c.move(0, 40, b.antlers))
      };
    }
  });

  /* =================================================================
     NADİR 4 — bulbul · "Flüt" bülbül
     Gül kurusu-krem gövde; şarkı söyleyen AÇIK gaga; gagadan yükselen
     nota süsleri; zarif yelpaze kuyruk.
     ================================================================= */
  function bulbulBits (c) {
    var GK = '#D98E9A', GK2 = '#B56B79';       // gül kurusu
    var KREM = '#FFF6E3', AMB = '#F2A61B', EF2 = '#5C4A9E';
    var b = {};

    b.tail =
      c.leaf(33, 84, 5.5, 12, c.vinyl('ky1', GK, GK2), { rot: -58 }) +
      c.leaf(40, 90, 6.5, 13.5, c.vinyl('ky2', GK, GK2), { rot: -38 }) +
      c.leaf(47, 93.5, 6, 12.5, c.vinyl('ky3', GK, GK2), { rot: -18 });

    b.wings =
      c.leaf(37, 76, 7.5, 15, c.vinyl('kn1', GK, GK2), { rot: -28 }) +
      c.leaf(83, 76, 7.5, 15, c.vinyl('kn2', GK, GK2), { rot: 28 });

    b.feet =
      c.caps(52, 100, 9.5, 6.5, AMB, {}) +
      c.caps(68, 100, 9.5, 6.5, AMB, {});

    b.body =
      c.blob(60, 81, 22.5, 18.5, c.vinyl('gvd', GK, GK2), {}) +
      c.blob(60, 84, 13, 12, KREM, { line: false, op: 0.95 }) +
      c.gloss(47, 70.5, 8.5, 4.8) +
      c.bounce(60, 95.5, 15, 4.4, '#F4D7DC', 0.2);

    b.head =
      c.ball(60, 44, 20.5, c.vinyl('kaf', KREM, GK), {}) +
      c.gloss(49.5, 34, 8, 4.6) +
      (c.sil ? '' :
        c.leaf(60, 23.5, 2.6, 5, GK2, { line: false, rot: 8, op: 0.9 }));

    b.notes =
      (c.sil ? '' :
        c.ball(85, 31, 2.3, EF2, { line: false, op: 0.95 }) +
        c.line('M87.3,31 L87.3,22.5', 1.8, EF2, { op: 0.9 }) +
        c.line('M87.3,22.5 C90.5,23.5 91.5,25.5 90.5,27.5', 1.8, EF2, { op: 0.9 }) +
        c.ball(93, 41, 1.9, EF2, { line: false, op: 0.85 }) +
        c.line('M94.9,41 L94.9,34.5', 1.6, EF2, { op: 0.8 }) +
        c.dot(79, 22, 1.3, 0.75) +
        c.sparkle(94, 27, 2.6, '#FFD34D', 0.8));

    b.face =
      c.eyes(60, 42.5, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 50.5, 14, {}) +
      c.beak(60, 49.5, 8, AMB, { open: true });

    return b;
  }
  Y.art.registerKind('bulbul', {
    pufi: function (c) {
      var b = bulbulBits(c);
      return b.tail + b.feet + b.wings + b.body + b.head + b.face + b.notes;
    },
    parts: function (c) {
      var b = bulbulBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.wings + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.15, 60, 60, c.move(20, -28, b.tail))
      };
    }
  });

  /* =================================================================
     NADİR 5 — ormanperi · "Sarmaşık" orman perisi
     Çayırdaki "peri"nin orman kardeşi: yeşil elbise, sarmaşık saçlar
     (kıvrım + minik yapraklar), eğrelti kanatlar, başında çiçek tacı.
     ================================================================= */
  function ormanperiBits (c) {
    var YE = '#A8CF8E', YE2 = '#6FA05A', YE3 = '#4E7C46';
    var TEN = '#FFF6E3', TEN2 = '#F0DCC0';
    var GUL = '#D98E9A', ALT = '#FFD34D';
    var b = {};

    b.wings =
      c.leaf(33, 60, 8, 22, c.vinyl('ka1', YE, YE2), { rot: -30, op: 0.92 }) +
      c.leaf(87, 60, 8, 22, c.vinyl('ka2', YE, YE2), { rot: 30, op: 0.92 }) +
      (c.sil ? '' :
        c.line('M42,43 C36,52 31,63 27,76', 1.6, YE3, { op: 0.5 }) +
        c.line('M78,43 C84,52 89,63 93,76', 1.6, YE3, { op: 0.5 }) +
        c.dot(31, 55, 1.2, 0.5) + c.dot(89, 55, 1.2, 0.5) +
        c.dot(28, 66, 1, 0.45) + c.dot(92, 66, 1, 0.45));

    b.feet =
      c.caps(52, 99.5, 10, 6.5, YE2, {}) +
      c.caps(68, 99.5, 10, 6.5, YE2, {});

    b.body =
      c.drop(60, 84, 17, 22, c.vinyl('elb', YE, YE2), {}) +
      (c.sil ? '' :
        c.caps(60, 71.5, 21, 4.6, YE3, { line: false, op: 0.55, rx: 2.3 }) +
        c.leaf(54, 88, 2.6, 4.4, YE3, { line: false, rot: -20, op: 0.5 }) +
        c.leaf(66, 92, 2.6, 4.4, YE3, { line: false, rot: 22, op: 0.5 })) +
      c.gloss(50.5, 78, 7, 4.2) +
      c.bounce(60, 97, 13.5, 4.2, '#D8EBC8', 0.2);

    b.head =
      c.ball(60, 44, 20, c.vinyl('kaf', TEN, TEN2), {}) +
      c.blob(60, 30, 14.5, 8, c.vinyl('sac', YE, YE2), {}) +
      c.rope('M46,30 C38,34 34,44 37,55 C38,60 41,63 45,63', 4.4, YE2, {}) +
      c.rope('M74,30 C82,34 86,44 83,55 C82,60 79,63 75,63', 4.4, YE2, {}) +
      c.gloss(50, 36.5, 7.5, 4.2) +
      (c.sil ? '' :
        c.leaf(38, 57, 3, 5, YE2, { line: false, rot: -34, op: 0.95 }) +
        c.leaf(82, 57, 3, 5, YE2, { line: false, rot: 34, op: 0.95 }) +
        c.leaf(35, 44, 2.6, 4.4, YE2, { line: false, rot: -70, op: 0.9 }) +
        c.leaf(85, 44, 2.6, 4.4, YE2, { line: false, rot: 70, op: 0.9 }));

    b.crown =
      c.ball(50, 25.5, 2.7, GUL, { lw: c.LW2 }) +
      c.ball(60, 22.5, 3.1, ALT, { lw: c.LW2 }) +
      c.ball(70, 25.5, 2.7, GUL, { lw: c.LW2 }) +
      (c.sil ? '' :
        c.dot(50, 25.5, 0.9, 0.9) +
        c.dot(60, 22.5, 1, 0.9) +
        c.dot(70, 25.5, 0.9, 0.9) +
        c.sparkle(76, 20, 2.6, '#FFFFFF', 0.85));

    b.face =
      c.eyes(60, 44, { dx: 7.6, r: 4.5 }) +
      c.cheeks(60, 50.5, 13, {}) +
      c.mouth(60, 52, 'smile', { w: 7.5 });

    return b;
  }
  Y.art.registerKind('ormanperi', {
    pufi: function (c) {
      var b = ormanperiBits(c);
      return b.wings + b.feet + b.body + b.head + b.crown + b.face;
    },
    parts: function (c) {
      var b = ormanperiBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.15, 60, 44, c.move(0, 14, b.head + b.crown + b.face)),
        aksesuar: c.zoom(1.05, 60, 60, c.move(0, 0, b.wings))
      };
    }
  });

  /* =================================================================
     NADİR 6 — camsamuru · "Püskül" çam samuru
     Turuncu-tarçın gövde; gövde kadar KOCAMAN pofuduk kuyruk (arkada,
     katmanlı); altında yatay dal; pençelerinde kozalak.
     ================================================================= */
  function camsamuruBits (c) {
    var TU = '#E8B04A', TU2 = '#C07A2E';       // turuncu-tarçın
    var KREM = '#FFF6E3';
    var KB = '#8B6242', KB2 = '#5C4433';
    var b = {};

    b.branch =
      c.rope('M22,100.5 C42,96 78,96 98,100.5', 7, KB, { hi: true }) +
      (c.sil ? '' :
        c.dot(34, 98.6, 1.4, 0.35) +
        c.dot(72, 97.6, 1.4, 0.35) +
        c.leaf(93, 94, 2.6, 4.6, '#6FA05A', { line: false, rot: 40, op: 0.9 }));

    b.tail =
      c.blob(86, 62, 12.5, 22, c.vinyl('kyr', TU, TU2), {}) +
      c.blob(84, 43, 10, 12.5, c.vinyl('kyu', TU, TU2), {}) +
      c.ball(84, 36, 6.8, KREM, { line: false, op: 0.95 }) +
      c.gloss(81, 52, 4.5, 8) +
      (c.sil ? '' :
        c.line('M77,68 C80,70 88,70 92,68', 1.8, TU2, { op: 0.5 }) +
        c.line('M78,76 C81,78 88,78 91.5,76', 1.8, TU2, { op: 0.5 }));

    b.feet =
      c.caps(50, 99, 12, 7.5, TU2, {}) +
      c.caps(70, 99, 12, 7.5, TU2, {});

    b.body =
      c.blob(60, 80, 23.5, 19.5, c.vinyl('gvd', TU, TU2), {}) +
      c.blob(58, 83, 12, 12, KREM, { line: false, op: 0.95 }) +
      c.gloss(47, 69.5, 8.5, 4.8) +
      c.bounce(60, 95, 15, 4.4, '#F6DFAE', 0.2);

    b.head =
      c.earRound(45, 29, 6, TU, KREM) +
      c.earRound(75, 29, 6, TU, KREM) +
      c.ball(60, 44, 20.5, c.vinyl('kaf', TU, TU2), {}) +
      c.blob(60, 50.5, 8.5, 6, KREM, { line: false, op: 0.95 }) +
      c.gloss(49.5, 34, 8, 4.6);

    b.cone =
      c.drop(60, 89, 5.5, 8, c.vinyl('koz', KB, KB2), {}) +
      (c.sil ? '' :
        c.line('M56,86.5 L64,90.5', 1.4, KB2, { op: 0.55 }) +
        c.line('M56,90.5 L64,86.5', 1.4, KB2, { op: 0.55 }) +
        c.line('M56.5,93 L63.5,90', 1.4, KB2, { op: 0.5 })) +
      c.ball(52.5, 86, 4.2, TU, { lw: c.LW2 }) +
      c.ball(67.5, 86, 4.2, TU, { lw: c.LW2 });

    b.face =
      c.eyes(60, 43.5, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 50, 13.5, {}) +
      c.ball(60, 48, 2.3, KB2, { line: false }) +
      c.mouth(60, 52, 'smile', { w: 7 });

    return b;
  }
  Y.art.registerKind('camsamuru', {
    pufi: function (c) {
      var b = camsamuruBits(c);
      return b.branch + b.tail + b.feet + b.body + b.head + b.face + b.cone;
    },
    parts: function (c) {
      var b = camsamuruBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body + b.cone),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.1, 60, 60, c.move(-25, 6, b.tail))
      };
    }
  });

  /* =================================================================
     DESTANSI 7 — mesecani · "Meşe" yürüyen meşe fidanı  (ownAura)
     Gövdesi minik ağaç gövdesi (kabuk halkaları), başı yemyeşil yaprak
     kürsü, dallarında palamutlar, kök-ayaklar tıknaz.
     Aura: yosun yeşili + altın sparkle — "durduğu yerde orman büyür".
     ================================================================= */
  function mesecaniBits (c) {
    var KB = '#B08968', KB2 = '#8B6242', KB3 = '#5C4433';
    var YE = '#A8CF8E', YE2 = '#6FA05A', YE3 = '#4E7C46';
    var ALT = '#FFD34D';
    var b = {};

    b.aura =
      c.aura('#6FA05A', 62, 47, 0.45) +
      (c.sil ? '' :
        c.sparkle(26, 40, 3.4, ALT, 0.85) +
        c.sparkle(94, 52, 3, ALT, 0.8) +
        c.sparkle(38, 94, 2.6, ALT, 0.7) +
        c.sparkle(88, 26, 2.8, '#FFF6E3', 0.75));

    b.arms =
      c.rope('M44,74 C37,70 32,65 30,58', 3.6, KB2, { hi: true }) +
      c.rope('M76,74 C83,70 88,65 90,58', 3.6, KB2, { hi: true }) +
      c.leaf(29, 55, 3, 5.2, YE2, { line: false, rot: -26, op: 0.95 }) +
      c.leaf(91, 55, 3, 5.2, YE2, { line: false, rot: 26, op: 0.95 });

    b.feet =
      c.caps(48, 99.5, 14, 8, KB2, {}) +
      c.caps(72, 99.5, 14, 8, KB2, {}) +
      (c.sil ? '' :
        c.dot(43, 97.5, 1.3, 0.4) +
        c.dot(77, 97.5, 1.3, 0.4));

    b.body =
      c.caps(60, 81, 34, 38, c.vinyl('gvd', KB, KB2), { rx: 15 }) +
      (c.sil ? '' :
        c.line('M50,72 C56,74.5 64,74.5 70,72', 2, KB3, { op: 0.4 }) +
        c.line('M48,81 C55,83.5 65,83.5 72,81', 2, KB3, { op: 0.4 }) +
        c.line('M50,90 C56,92.5 64,92.5 70,90', 2, KB3, { op: 0.4 }) +
        c.dot(52, 77, 1.3, 0.35) +
        c.dot(68, 86.5, 1.3, 0.35)) +
      c.gloss(49, 68.5, 7.5, 4.5) +
      c.bounce(60, 96.5, 15, 4.4, '#D9B892', 0.2);

    b.head =
      c.leaf(40, 24, 6, 10, c.vinyl('yp1', YE, YE2), { rot: -30 }) +
      c.leaf(60, 18.5, 6.5, 11, c.vinyl('yp2', YE, YE2), { rot: 0 }) +
      c.leaf(80, 24, 6, 10, c.vinyl('yp3', YE, YE2), { rot: 30 }) +
      c.blob(60, 40, 26.5, 21, c.vinyl('kur', YE, YE2), {}) +
      c.gloss(47, 30.5, 9.5, 5) +
      (c.sil ? '' :
        c.leaf(48, 27, 3.4, 6, YE3, { line: false, rot: -18, op: 0.5 }) +
        c.leaf(72, 29, 3.4, 6, YE3, { line: false, rot: 20, op: 0.5 }) +
        c.dot(38, 38, 1.5, 0.4) +
        c.dot(82, 36, 1.5, 0.4));

    b.acorns =
      c.ball(39, 54, 3.2, KB, { lw: c.LW2 }) +
      c.caps(39, 50.6, 6.6, 3.2, KB3, { rx: 1.6, lw: c.LW2 }) +
      c.ball(47, 58, 2.8, KB, { lw: c.LW2 }) +
      c.caps(47, 55, 5.8, 2.9, KB3, { rx: 1.5, lw: c.LW2 }) +
      (c.sil ? '' :
        c.dot(40, 53.4, 0.8, 0.6) +
        c.dot(48, 57.5, 0.7, 0.55));

    b.face =
      c.eyes(60, 44, { dx: 8.4, r: 4.8 }) +
      c.cheeks(60, 51, 14, {}) +
      c.mouth(60, 52.5, 'smile', { w: 8.5 });

    return b;
  }
  Y.art.registerKind('mesecani', {
    pufi: function (c) {
      var b = mesecaniBits(c);
      return b.aura + b.arms + b.feet + b.body + b.head + b.acorns + b.face;
    },
    parts: function (c) {
      var b = mesecaniBits(c);
      return {
        govde:    c.move(0, -8, b.arms + b.feet + b.body),
        bas:      c.zoom(1.05, 60, 44, c.move(0, 16, b.head + b.face)),
        aksesuar: c.zoom(1.5, 60, 60, c.move(17, 5, b.acorns))
      };
    },
    ownAura: true
  });

  /* =================================================================
     DESTANSI 8 — isilgeyik · "Şimşim" ışıl geyiği  (ownAura)
     Ay gümüşü-lavanta gövde; boynuzları ışık saçan fener dalları
     (uçlarında ışık topları + sparkle); alnında yıldız nişanı.
     Aura: turkuaz-gümüş.
     ================================================================= */
  function isilgeyikBits (c) {
    var GU = '#DCE3F2', GU2 = '#B8C4E0';       // ay gümüşü
    var LA2 = '#5C4A9E';                       // koyu eflatun (toynak, dal)
    var ISK = '#FFE9A8';                       // fener ışığı
    var TQ = '#7FD4C1', ALT = '#FFD34D';
    var b = {};

    b.aura =
      c.aura('#7FD4C1', 60, 46, 0.45) +
      (c.sil ? '' :
        c.sparkle(28, 34, 3.2, GU, 0.9) +
        c.sparkle(92, 46, 2.8, GU, 0.8) +
        c.sparkle(34, 90, 2.6, TQ, 0.7) +
        c.sparkle(90, 92, 3, TQ, 0.75));

    b.antlers =
      c.rope('M50,31 C46,22 45,13 48,6', 4, LA2, { hi: true }) +
      c.rope('M48.5,20 C44,17 39,15 34,12', 3, LA2, {}) +
      c.rope('M70,31 C74,22 75,13 72,6', 4, LA2, { hi: true }) +
      c.rope('M71.5,20 C76,17 81,15 86,12', 3, LA2, {}) +
      (c.sil ? '' :
        c.ball(48, 4.5, 5.6, ISK, { line: false, op: 0.28 }) +
        c.ball(72, 4.5, 5.6, ISK, { line: false, op: 0.28 }) +
        c.ball(34, 10.5, 4.6, ISK, { line: false, op: 0.24 }) +
        c.ball(86, 10.5, 4.6, ISK, { line: false, op: 0.24 })) +
      c.ball(48, 4.5, 3.3, ISK, { lw: c.LW2 }) +
      c.ball(72, 4.5, 3.3, ISK, { lw: c.LW2 }) +
      c.ball(34, 10.5, 2.8, ISK, { lw: c.LW2 }) +
      c.ball(86, 10.5, 2.8, ISK, { lw: c.LW2 }) +
      (c.sil ? '' :
        c.sparkle(53, 9, 2.8, '#FFFFFF', 0.9) +
        c.sparkle(67, 9, 2.8, '#FFFFFF', 0.9) +
        c.sparkle(30, 16, 2.2, '#FFFFFF', 0.8) +
        c.sparkle(90, 16, 2.2, '#FFFFFF', 0.8));

    b.ears =
      c.earRound(43, 33, 6.4, GU, '#EDE4F8') +
      c.earRound(77, 33, 6.4, GU, '#EDE4F8');

    b.feet =
      c.caps(50, 99.5, 12, 7.5, LA2, {}) +
      c.caps(70, 99.5, 12, 7.5, LA2, {});

    b.body =
      c.blob(60, 81, 23, 19, c.vinyl('gvd', GU, GU2), {}) +
      c.blob(60, 80, 12.5, 12, '#FFF6E3', { line: false, op: 0.9 }) +
      (c.sil ? '' :
        c.dot(46, 72, 1.5, 0.4) +
        c.dot(74, 74, 1.3, 0.35) +
        c.dot(50, 90, 1.2, 0.3)) +
      c.gloss(46.5, 70, 8, 4.6) +
      c.bounce(60, 96, 15, 4.4, TQ, 0.18);

    b.head =
      c.ball(60, 44, 20.5, c.vinyl('kaf', GU, GU2), {}) +
      c.blob(60, 51, 9, 6.2, '#FFF6E3', { line: false, op: 0.9 }) +
      c.gloss(49.5, 34, 8, 4.6) +
      (c.sil ? '' :
        c.sparkle(60, 32.5, 3.8, ALT, 0.95) +
        c.dot(60, 32.5, 1, 0.9));

    b.face =
      c.eyes(60, 44, { dx: 8, r: 4.6 }) +
      c.cheeks(60, 51, 13.5, {}) +
      c.ball(60, 48.6, 2.3, LA2, { line: false }) +
      c.mouth(60, 52.5, 'smile', { w: 7 });

    return b;
  }
  Y.art.registerKind('isilgeyik', {
    pufi: function (c) {
      var b = isilgeyikBits(c);
      return b.aura + b.antlers + b.ears + b.feet + b.body + b.head + b.face;
    },
    parts: function (c) {
      var b = isilgeyikBits(c);
      return {
        govde:    c.move(0, -8, b.feet + b.body),
        bas:      c.zoom(1.2, 60, 44, c.move(0, 14, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.05, 60, 60, c.move(0, 42, b.antlers))
      };
    },
    ownAura: true
  });

  /* =================================================================
     EFSANEVİ 9 — bilgebaykus · "Bilge" orman ruhu baykuşu  (ownAura)
     Eflatun-lacivert kadim baykuş; göğsünde AY MADALYONU; kanat uçları
     yıldız tozu döker; bilgece uzun kaş tutamları; yaprak taç.
     Katmanlı aura (eflatun + altın) + 4 sparkle —
     "ormanın bütün fısıltılarını ezbere bilir".
     ================================================================= */
  function bilgebaykusBits (c) {
    var EF = '#8E7CC3', EF2 = '#5C4A9E';       // orman eflatunu
    var NV = '#4C5A8E', NV2 = '#39466E';       // gece laciverti
    var GU = '#DCE3F2', GU2 = '#B8C4E0';       // ay gümüşü
    var ALT = '#FFD34D', KREM = '#FFF6E3', YE2 = '#6FA05A';
    var b = {};

    b.aura =
      c.aura('#8E7CC3', 60, 50, 0.5) +
      c.aura('#FFD34D', 62, 38, 0.32) +
      (c.sil ? '' :
        c.sparkle(24, 36, 3.6, ALT, 0.9) +
        c.sparkle(96, 42, 3.2, GU, 0.85) +
        c.sparkle(30, 92, 3, ALT, 0.8) +
        c.sparkle(92, 88, 3.4, GU, 0.85));

    b.wings =
      c.leaf(33, 72, 10, 20, c.vinyl('kn1', NV, NV2), { rot: -18 }) +
      c.leaf(87, 72, 10, 20, c.vinyl('kn2', NV, NV2), { rot: 18 }) +
      c.gloss(29, 62, 4, 5) +
      (c.sil ? '' :
        c.dot(26, 86, 1.8, 0.9) +
        c.dot(30, 92, 1.5, 0.8) +
        c.dot(24, 97, 1.2, 0.7) +
        c.dot(94, 86, 1.8, 0.9) +
        c.dot(90, 92, 1.5, 0.8) +
        c.dot(96, 97, 1.2, 0.7) +
        c.sparkle(21, 91, 2.2, GU, 0.8) +
        c.sparkle(99, 91, 2.2, GU, 0.8));

    b.feet =
      c.caps(50, 100, 11, 7, '#F2A61B', {}) +
      c.caps(70, 100, 11, 7, '#F2A61B', {});

    b.body =
      c.blob(60, 80, 24.5, 20, c.vinyl('gvd', EF, EF2), {}) +
      c.blob(60, 82.5, 15, 13.5, c.vinyl('gob', KREM, GU2), { line: false, op: 0.95 }) +
      (c.sil ? '' :
        c.line('M51,90 C54,93 58,93 60,90', 1.7, GU2, { op: 0.6 }) +
        c.line('M60,90 C62,93 66,93 69,90', 1.7, GU2, { op: 0.6 }) +
        c.line('M55,95 C58,97.5 62,97.5 65,95', 1.7, GU2, { op: 0.55 })) +
      c.gloss(46, 69, 8.5, 4.8) +
      c.bounce(60, 96, 15.5, 4.4, GU, 0.2);

    b.medal =
      c.ball(60, 79, 8.8, c.vinyl('mad', GU, GU2), {}) +
      c.moon(60, 79, 4.6, KREM, { line: false, op: 0.95 }) +
      (c.sil ? '' :
        c.line('M51.5,73.5 C55,70.5 65,70.5 68.5,73.5', 1.7, ALT, { op: 0.75 }) +
        c.ball(60, 79, 6.4, ALT, { line: false, op: 0.16 }) +
        c.sparkle(65.5, 74.5, 2.4, '#FFFFFF', 0.9));

    b.head =
      c.leaf(45, 25, 4.6, 8.5, c.vinyl('tp1', EF, EF2), { rot: -22 }) +
      c.leaf(75, 25, 4.6, 8.5, c.vinyl('tp2', EF, EF2), { rot: 22 }) +
      c.ball(60, 44, 21.5, c.vinyl('kaf', EF, EF2), {}) +
      c.blob(60, 46.5, 15.5, 12.5, c.vinyl('yuz', KREM, GU2), { line: false, op: 0.95 }) +
      c.gloss(48.5, 33, 8.5, 4.8);

    b.brows =
      c.rope('M52,33.5 C46,29.5 40,28.5 34,31.5', 3, GU, { hi: true }) +
      c.rope('M68,33.5 C74,29.5 80,28.5 86,31.5', 3, GU, { hi: true });

    b.crown =
      c.leaf(52, 24, 3, 5.5, YE2, { rot: -24, lw: c.LW2 }) +
      c.leaf(60, 21.5, 3.4, 6, YE2, { rot: 0, lw: c.LW2 }) +
      c.leaf(68, 24, 3, 5.5, YE2, { rot: 24, lw: c.LW2 }) +
      (c.sil ? '' :
        c.dot(56, 24, 1, 0.85) +
        c.dot(64, 24, 1, 0.85) +
        c.sparkle(72, 18.5, 2.8, ALT, 0.9));

    b.face =
      c.eyes(60, 44, { dx: 8.6, r: 5.2, spark: true }) +
      c.cheeks(60, 52, 14.5, {}) +
      c.beak(60, 50.5, 7, '#F2A61B', {});

    return b;
  }
  Y.art.registerKind('bilgebaykus', {
    pufi: function (c) {
      var b = bilgebaykusBits(c);
      return b.aura + b.wings + b.feet + b.body + b.medal +
             b.head + b.brows + b.crown + b.face;
    },
    parts: function (c) {
      var b = bilgebaykusBits(c);
      return {
        govde:    c.move(0, -8, b.wings + b.feet + b.body),
        bas:      c.zoom(1.1, 60, 44, c.move(0, 14, b.head + b.brows + b.crown + b.face)),
        aksesuar: c.zoom(1.8, 60, 60, c.move(0, -19, b.medal))
      };
    },
    ownAura: true
  });

  /* =====================================================================
     Kayıtlı kindler (pufi-kinds-6.js · Fısıltı Ormanı):
       NADİR   : gecekelebegi  — Gölge, gece kelebeği
                 kehribarbocegi — Reçine, kehribar böceği
                 geyik          — Boynuz, genç geyik
                 bulbul         — Flüt, bülbül
                 ormanperi      — Sarmaşık, orman perisi
                 camsamuru      — Püskül, çam samuru
       DESTANSI: mesecani       — Meşe, yürüyen meşe fidanı  (ownAura)
                 isilgeyik      — Şimşim, ışıl geyiği        (ownAura)
       EFSANEVİ: bilgebaykus    — Bilge, orman ruhu baykuşu  (ownAura)
     ===================================================================== */
})();
