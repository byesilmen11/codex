/* =====================================================================
   YUVO SANAT — pufi-kinds-2.js  (sahip: ressam-2)
   =====================================================================
   pufi-svg.js STİL KILAVUZUNA birebir uyar: şeker-vinil sticker dili,
   INK kontur, sol-üst ışık, yalnız c.* primitifleri. 9 kind kaydeder:
     peri(Çiğdem)  tavsan(Zıpzıp)  serce(Cıvıl)  salyangoz(Evcik)
     kirpi(Dikenik)  kostebek(Kösti)  oglak(Meke)  kopek(Fındık)
     karinca(Kırıntı)
   peri Yaygın, kalanı Az Bulunur → standart aura (ownAura yok).
   Her kind: bio'dan kişilikli ifade + en az 2 ayırt edici anatomik
   özellik + kendine has silüet. Gradyan adları ctx başına benzersizdir.
   ===================================================================== */
(function () {
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* ortak: minik sticker kalp (kirpi dikenlerine konar) */
  function heart (c, x, y, k) {
    var s = 3.2 * (k || 1), n = c.N;
    return c.path('M' + n(x) + ' ' + n(y + s * 1.05) +
      ' Q' + n(x - s * 1.35) + ' ' + n(y) + ' ' + n(x - s * 0.62) + ' ' + n(y - s * 0.72) +
      ' Q' + n(x) + ' ' + n(y - s * 1.15) + ' ' + n(x) + ' ' + n(y - s * 0.3) +
      ' Q' + n(x) + ' ' + n(y - s * 1.15) + ' ' + n(x + s * 0.62) + ' ' + n(y - s * 0.72) +
      ' Q' + n(x + s * 1.35) + ' ' + n(y) + ' ' + n(x) + ' ' + n(y + s * 1.05) + ' Z',
      '#FF8FB0', { lw: 1.6 });
  }

  /* =====================================================================
     1) PERİ — Çiğdem: "Sabah çiyinden kendine minicik taçlar yapar"
     Ayırt edici: taç yaprak yelpaze etek, çiy damlalı çiçek tacı,
     sırtta yaprak-kanatlar; etrafında süzülen çiy damlaları.
     ===================================================================== */

  function periBits (c) {
    var BLT = '#FFEFE0', BDK = '#F2B48C';   // krem-şeftali vinil
    var P1L = '#FFD9EC', P1D = '#FF8FC8';   // pembe taç yaprak
    var P2L = '#FFE9C9', P2D = '#FFB566';   // bal taç yaprak
    var DEW = '#BFE4F5';
    var b = {}, i;
    var BD = c.vinyl('bd', BLT, BDK);
    var HD = c.vinyl('hd', BLT, BDK);

    // sırt yaprak-kanatlar
    b.wings = c.leaf(34, 66, 6.5, 15, c.vinyl('w1', '#A5E36B', '#55B944'), { rot: -38 }) +
              c.leaf(86, 66, 6.5, 15, c.vinyl('w2', '#A5E36B', '#55B944'), { rot: 38 }) +
              (c.sil ? '' :
               c.line('M36 60 Q33.5 66 35.5 72', 1.6, '#7FCB4C', { op: 0.8 }) +
               c.line('M84 60 Q86.5 66 84.5 72', 1.6, '#7FCB4C', { op: 0.8 }));

    b.feet = c.caps(51, 99.5, 11, 7.5, '#F2A66B', {}) + c.caps(69, 99.5, 11, 7.5, '#F2A66B', {});

    // taç yaprak etek: yelpaze
    var PS = [[-64, 37, 87], [-38, 45, 93], [-13, 54, 96.5],
              [13, 66, 96.5], [38, 75, 93], [64, 83, 87]];
    var pet = '';
    for (i = 0; i < PS.length; i++) {
      pet += c.leaf(PS[i][1], PS[i][2], 5.2, 11.5,
             (i % 2 ? c.vinyl('p' + i, P2L, P2D) : c.vinyl('p' + i, P1L, P1D)),
             { rot: PS[i][0], lw: c.LW2 });
    }
    b.skirt = pet;

    b.body = c.blob(60, 77, 19.5, 16.5, BD, {}) +
             c.blob(60, 82, 10.5, 8, '#FFF7EE', { line: false, op: 0.95 }) +
             c.gloss(50, 67, 7.5, 4.4) +
             c.bounce(60, 89.5, 12, 3.6, '#FFE3CE', 0.2);

    b.head = c.ball(60, 44, 20, HD, {}) + c.gloss(50.5, 34.5, 7.6, 4.3);

    // çiy damlası taçlı çiçek tacı
    var crown = c.line('M43 31.5 Q60 23.5 77 31.5', 2.6, c.sil ? c.SIL : '#55B944');
    var FX = [[46, 29.5], [60, 25.5], [74, 29.5]];
    for (i = 0; i < FX.length; i++) {
      crown += c.leaf(FX[i][0], FX[i][1] - 3.4, 1.9, 3.6, i === 1 ? P1L : '#FFFFFF', { lw: 1.5 }) +
               c.leaf(FX[i][0] - 3.2, FX[i][1] + 1.6, 1.9, 3.4, i === 1 ? P1L : '#FFFFFF', { lw: 1.5, rot: -64 }) +
               c.leaf(FX[i][0] + 3.2, FX[i][1] + 1.6, 1.9, 3.4, i === 1 ? P1L : '#FFFFFF', { lw: 1.5, rot: 64 }) +
               c.ball(FX[i][0], FX[i][1], 2.1, '#FFC734', { lw: 1.5 });
    }
    crown += c.drop(53, 21, 2, 4.5, DEW, { lw: 1.5, rot: 8 }) +
             c.drop(67, 21, 2, 4.5, DEW, { lw: 1.5, rot: -8 }) +
             c.dot(52.4, 20.4, 0.8, 0.9) + c.dot(66.4, 20.4, 0.8, 0.9);
    b.crown = crown;

    b.face = c.eyes(60, 43, { dx: 7.6, r: 4.6 }) +
             c.cheeks(60, 49.5, 13.4, {}) +
             c.mouth(60, 52, 'smile', { w: 8 });

    // süzülen çiy damlaları
    b.dew = c.drop(27, 46, 2.6, 6.5, DEW, { lw: 1.6, rot: -10 }) +
            c.drop(94, 52, 2.2, 5.5, DEW, { lw: 1.6, rot: 12 }) +
            c.dot(26.2, 45, 1, 0.85) +
            c.sparkle(90, 34, 3, '#D6F0FB', 0.85);
    return b;
  }

  Y.art.registerKind('peri', {
    pufi: function (c) {
      var b = periBits(c);
      return b.wings + b.feet + b.skirt + b.body + b.head + b.crown + b.face + b.dew;
    },
    parts: function (c) {
      var b = periBits(c);
      return {
        govde: c.move(0, -6, b.feet + b.skirt + b.body),
        bas:   c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.2, 60, 60,
          c.move(0, 30, b.crown) + c.move(0, 10, b.wings) + c.move(0, 16, b.dew))
      };
    }
  });

  /* =====================================================================
     2) TAVŞAN — Zıpzıp: "Havuç değil çilek delisi; kimseye söylemeyin"
     Ayırt edici: upuzun dik kulaklar (sağının ucu devrik), pofuduk
     pamuk kuyruk, öndişli gülümseme; yanında çilek (havuç DEĞİL).
     ===================================================================== */

  function tavsanBits (c) {
    var LT = '#FFF9F0', DK = '#E3CFC0', EARIN = '#FFC4D9';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var E1 = c.vinyl('e1', LT, DK);
    var E2 = c.vinyl('e2', LT, DK);

    // pofuduk pamuk kuyruk
    b.tail = c.ball(83, 86, 6.8, c.vinyl('tl', '#FFFFFF', '#E8DCD2'), {}) +
             c.dot(80.5, 83.5, 1.8, 0.85);

    b.feet = c.caps(48, 99.5, 13, 8, '#EFDFD4', {}) + c.caps(72, 99.5, 13, 8, '#EFDFD4', {});

    b.body = c.blob(60, 81, 24, 19.5, BD, {}) +
             c.blob(60, 86.5, 13, 10, '#FFFDF8', { line: false, op: 0.95 }) +
             c.gloss(48, 68.5, 9, 5.2) +
             c.bounce(60, 96, 15, 4.3, '#F5EAE0', 0.2);

    // upuzun kulaklar: sol dimdik, sağın ucu devrik (asimetri)
    b.ears = c.blob(49, 22, 6.2, 13.5, E1, { rot: -6 }) +
             c.blob(49.5, 24, 3, 9, EARIN, { line: false, op: 0.85, rot: -6 }) +
             c.blob(72.5, 25, 6, 11.5, E2, { rot: 10 }) +
             c.drop(75.5, 13, 5, 9, E2, { rot: 112 }) +
             c.blob(72.5, 27, 3, 7.5, EARIN, { line: false, op: 0.85, rot: 10 });

    b.head = c.ball(60, 45, 21, HD, {}) + c.gloss(49.5, 35.5, 8, 4.5);

    // yüz: pembe burun + öndişli gülümseme
    b.face = c.eyes(60, 43.5, { dx: 8.4, r: 4.8 }) +
             c.cheeks(60, 50.5, 14.6, {}) +
             c.path('M57.6 51.4 Q60 49.6 62.4 51.4 Q60.6 54 60 54 Q59.4 54 57.6 51.4 Z',
                    '#F4779B', { lw: 1.8 }) +
             c.mouth(60, 55.5, 'smile', { w: 8 }) +
             ((c.mood !== 'sleep' && !c.sil)
               ? c.caps(57.7, 58.6, 3.4, 4.2, '#FFFFFF', { rx: 1.3, lw: 1.6 }) +
                 c.caps(62.3, 58.6, 3.4, 4.2, '#FFFFFF', { rx: 1.3, lw: 1.6 })
               : '');

    // çilek aşkı (havuç değil!)
    b.berry = c.drop(28, 88, 7, 12, c.vinyl('cl', '#FF8A80', '#E8453C'), { rot: 180 }) +
              (c.sil ? '' :
               c.blob(25.8, 88.5, 1, 1.4, '#FFE9A8', { line: false }) +
               c.blob(30.4, 89.5, 1, 1.4, '#FFE9A8', { line: false }) +
               c.blob(28.2, 93.4, 0.9, 1.3, '#FFE9A8', { line: false }) +
               c.dot(25.6, 84.6, 1.2, 0.8)) +
              c.leaf(25.4, 81.5, 2.2, 4, '#55B944', { lw: 1.5, rot: -52 }) +
              c.leaf(30.6, 81.5, 2.2, 4, '#55B944', { lw: 1.5, rot: 52 }) +
              c.line('M28 82.5 L28 79', 2, c.sil ? c.SIL : '#3F8F33') +
              c.sparkle(37, 78, 2.8, '#FFD9EC', 0.85);
    return b;
  }

  Y.art.registerKind('tavsan', {
    pufi: function (c) {
      var b = tavsanBits(c);
      return b.tail + b.feet + b.body + b.ears + b.head + b.face + b.berry;
    },
    parts: function (c) {
      var b = tavsanBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.feet + b.body),
        bas:   c.zoom(1.14, 60, 45, c.move(0, 18, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.25, 60, 60,
          c.move(24, -24, b.berry) + c.move(-10, -20, b.tail) +
          c.sparkle(34, 82, 3.2, '#FFD9EC', 0.85))
      };
    }
  });

  /* =====================================================================
     3) SERÇE — Cıvıl: "Her melodiyi ezberler — hep yanlış"
     Ayırt edici: kalkık kısa yelpaze kuyruk (solda), serçe yanak beneği
     (koyu kahve), kahve başlık + krem yüz; başucunda biri BAŞ AŞAĞI
     iki nota ("hep yanlış").
     ===================================================================== */

  function serceBits (c) {
    var LT = '#F9EED8', DK = '#D9B084';      // krem göğüs
    var BRL = '#E8C39A', BRD = '#B9855A';    // kahve sırt/başlık
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', BRL, BRD);

    // kalkık kısa yelpaze kuyruk (solda, yukarı)
    b.tail = c.drop(33, 66, 4.2, 12, c.vinyl('t1', BRL, '#A8763E'), { rot: -30 }) +
             c.drop(30, 73, 4.8, 13.5, c.vinyl('t2', BRL, '#A8763E'), { rot: -55 });

    b.feet = c.caps(48, 99.5, 12.5, 7.5, '#E09A50', {}) + c.caps(72, 99.5, 12.5, 7.5, '#E09A50', {});

    b.body = c.blob(60, 81, 24, 19.5, BD, {}) +
             c.blob(60, 86, 13.5, 10, '#FFF8EA', { line: false, op: 0.95 }) +
             (c.sil ? '' :
              c.line('M52 72 L54.5 76 M60 71 L60 75.5 M68 72 L65.5 76', 2, '#C89A66', { op: 0.8 })) +
             c.gloss(48, 68.5, 9, 5.2) +
             c.bounce(60, 96, 15, 4.3, '#F2E6D0', 0.2);

    b.wings = c.drop(36, 80, 6.6, 13.5, c.vinyl('w1', BRL, '#A8763E'), { rot: -148 }) +
              c.drop(84, 80, 6.6, 13.5, c.vinyl('w2', BRL, '#A8763E'), { rot: 148 });

    // kahve başlık + krem yüz maskesi
    b.head = c.ball(60, 43, 21, HD, {}) +
             c.blob(60, 48.5, 15.5, 11.5, '#FFF6E4', { line: false, op: 0.95 }) +
             c.gloss(49.5, 33, 8, 4.5);

    // serçe yanak beneği — pembe yanağın dış yanında koyu kahve
    b.patch = c.sil ? '' :
              c.blob(76.4, 47, 3, 3.6, '#8A6B4F', { line: false, op: 0.9, rot: 18 });

    b.face = c.eyes(60, 42, { dx: 8.2, r: 4.7 }) +
             c.cheeks(60, 49, 13.8, {}) +
             c.beak(60, 52, 8.5, '#F2A63C', { open: true, dk: '#D9822B' });

    // notalar: biri baş aşağı ("hep yanlış" esprisi) — silüette gizli
    b.notes = c.sil ? '' :
              c.ball(88, 32, 2.7, '#7A5230', { line: false }) +
              c.line('M90.6 31.2 L90.6 21.5 Q93.5 22 94.8 24.5', 2, '#7A5230') +
              c.ball(97, 45, 2.4, '#9C6B3A', { line: false }) +
              c.line('M94.6 45.8 L94.6 54.5 Q91.9 54 90.7 51.8', 1.8, '#9C6B3A') +
              c.sparkle(99, 36, 2.4, '#FFD9EC', 0.8);
    return b;
  }

  Y.art.registerKind('serce', {
    pufi: function (c) {
      var b = serceBits(c);
      return b.tail + b.feet + b.body + b.wings + b.head + b.patch + b.face + b.notes;
    },
    parts: function (c) {
      var b = serceBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.feet + b.body + b.wings),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.patch + b.face)),
        aksesuar: c.zoom(1.25, 60, 60,
          c.move(-14, 20, b.notes) + c.move(10, -4, b.tail) +
          c.sparkle(30, 40, 3, '#FFE9C9', 0.85))
      };
    }
  });

  /* =====================================================================
     4) SALYANGOZ — Evcik: "Kabuğunu misafire açar, papatya çayı ikram eder"
     Ayırt edici: dev sarmal kabuk hörgücü, bacaksız sümüklü ayak,
     top uçlu duyargalar; kabuğun tepesinde buharı tüten papatya çayı.
     ===================================================================== */

  function salyangozBits (c) {
    var FLT = '#FFE9CE', FDK = '#E8B888';    // bej gövde
    var b = {};
    var FT = c.vinyl('ft', FLT, FDK);
    var HD = c.vinyl('hd', FLT, FDK);
    var SH = c.vinyl('sh', '#FFC98A', '#E8834E');

    // sümüklü ayak: alçak geniş taban (bacak yok!)
    b.foot = c.blob(58, 92.5, 28, 9, FT, {}) +
             c.blob(56, 95, 16, 4.5, '#FFF4E2', { line: false, op: 0.9 }) +
             c.bounce(58, 99, 17, 3, '#F2DFC4', 0.2);

    // boyun + baş (solda, yukarı uzanır)
    b.neck = c.blob(45, 73, 12.5, 17, FT, { rot: -10 });
    b.head = c.ball(44, 52, 16, HD, {}) + c.gloss(36.5, 44.5, 6, 3.6);

    // top uçlu duyargalar
    b.ant = c.antenna('M37 38.5 Q33.5 31 29.5 27.5', '#D9985E', 28.5, 26, 3) +
            c.antenna('M50 38 Q52 30.5 56 26.5', '#D9985E', 57.5, 25, 3);

    // dev sarmal kabuk
    b.shell = c.ball(77, 66, 22.5, SH, {}) +
              (c.sil ? '' :
               c.line('M77 66 Q83.5 66.5 82.5 72.5 Q81 79 73.5 77.5 Q65.5 75.5 67 66.5 Q68.5 57.5 78 58.5 Q88.5 60 89.5 70 Q90.5 82 79 86', 2.6, '#B95E2E', { op: 0.9 })) +
              c.gloss(68, 54, 8, 4.6) +
              (c.sil ? '' : c.dot(87, 74, 1.6, 0.5));

    // misafir çayı: kabuğun tepesinde buharlı fincan
    b.tea = c.blob(87, 45.5, 6.8, 2.2, '#F2DFC4', { lw: 1.6 }) +
            c.caps(87, 41.5, 10, 7.5, '#FFFFFF', { rx: 2.8, lw: 1.8 }) +
            c.line('M92.4 39.5 Q96.5 40.5 92.4 43.5', 1.8, c.sil ? c.SIL : '#E8834E') +
            (c.sil ? '' :
             c.blob(87, 38.6, 3.6, 1.3, '#D9975E', { line: false, op: 0.9 }) +
             c.line('M85 34.5 Q83 31.5 85 28.5 M89 34.5 Q91 31.5 89 28.5', 1.6, '#BFE4F5', { op: 0.85 }));

    b.face = c.eyes(44, 51, { dx: 6.6, r: 4.3 }) +
             c.cheeks(44, 57.5, 11.6, { rx: 3.6, ry: 2.4 }) +
             c.mouth(44, 59.5, 'smile', { w: 7 });

    // ikramın papatyası
    b.daisy = c.leaf(21, 78, 2.4, 5.6, '#FFFFFF', { lw: 1.5 }) +
              c.leaf(21, 78, 2.4, 5.6, '#FFFFFF', { lw: 1.5, rot: 60 }) +
              c.leaf(21, 78, 2.4, 5.6, '#FFFFFF', { lw: 1.5, rot: 120 }) +
              c.ball(21, 78, 2.8, '#FFC734', { lw: 1.5 }) +
              c.sparkle(98, 55, 3, '#FFE9C9', 0.85);
    return b;
  }

  Y.art.registerKind('salyangoz', {
    pufi: function (c) {
      var b = salyangozBits(c);
      return b.foot + b.shell + b.tea + b.neck + b.head + b.ant + b.face + b.daisy;
    },
    parts: function (c) {
      var b = salyangozBits(c);
      return {
        govde: c.move(2, -20, b.foot + b.neck),
        bas:   c.move(16, 8, c.zoom(1.25, 44, 52, b.head + b.ant + b.face)),
        aksesuar: c.zoom(1.1, 60, 60,
          c.move(-17, -6, b.shell + b.tea) + c.move(20, -14, b.daisy))
      };
    }
  });

  /* =====================================================================
     5) KİRPİ — Dikenik: "Sarılmayı çok ister; herkes uzaktan sarılır"
     Ayırt edici: yumuşak uçlu diken tacı (iki ton), iki yana açık
     "sarıl bana" kolları; diken uçlarında süzülen minik kalpler.
     ===================================================================== */

  function kirpiBits (c) {
    var LT = '#FFF3DC', DK = '#E8C08E';      // krem yüz-karın
    var b = {}, i;
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);

    // yumuşatılmış diken tacı: baş+sırt yayı, iki ton kahve
    var QS = [
      [32, 72, -62], [34, 59, -50], [42, 47, -32], [52, 39, -14],
      [63, 37, 4], [74, 42, 24], [83, 52, 44], [86, 63, 58]
    ];
    var quills = '';
    for (i = 0; i < QS.length; i++) {
      quills += c.drop(QS[i][0], QS[i][1], 5.4, 13.5,
                c.vinyl('q' + i, (i % 2 ? '#B97F46' : '#C9935E'), (i % 2 ? '#7A5230' : '#8A5A30')),
                { rot: QS[i][2] });
    }
    b.quills = quills;

    // uzaktan sarılanların kalpleri
    b.hearts = heart(c, 25, 60, 1) + heart(c, 60, 21.5, 1.15) + heart(c, 93, 52, 1);

    b.feet = c.caps(48, 99.5, 13, 8, '#D9A868', {}) + c.caps(72, 99.5, 13, 8, '#D9A868', {});

    // "sarıl bana" kolları: iki yana açık
    b.arms = c.caps(34, 77, 16, 8, BD, { rot: -34, rx: 4 }) +
             c.caps(86, 77, 16, 8, BD, { rot: 34, rx: 4 });

    b.body = c.blob(60, 80, 23.5, 19.5, BD, {}) +
             c.blob(60, 86, 13, 10, '#FFF9EC', { line: false, op: 0.95 }) +
             c.gloss(48.5, 68, 8.8, 5) +
             c.bounce(60, 95.5, 15, 4.3, '#F5E7CE', 0.2);

    b.head = c.ball(60, 46, 19.5, HD, {}) + c.gloss(51, 37.5, 7.4, 4.2);

    b.face = c.eyes(60, 44, { dx: 8, r: 4.7 }) +
             c.cheeks(60, 50.5, 14, {}) +
             c.ball(60, 52.5, 2.5, '#8A5A30', { lw: 1.6 }) +
             c.mouth(60, 56, 'smile', { w: 10 });
    return b;
  }

  Y.art.registerKind('kirpi', {
    pufi: function (c) {
      var b = kirpiBits(c);
      return b.quills + b.feet + b.body + b.arms + b.head + b.face + b.hearts;
    },
    parts: function (c) {
      var b = kirpiBits(c);
      return {
        govde: c.move(0, -8, b.feet + b.body + b.arms),
        bas:   c.zoom(1.2, 60, 46, c.move(0, 12, b.head + b.face)),
        aksesuar: c.zoom(0.95, 60, 60, c.move(0, 14, b.quills + b.hearts))
      };
    }
  });

  /* =====================================================================
     6) KÖSTEBEK — Kösti: "Gözlüğünü toprakta unutur, yine de yolu bulur"
     Ayırt edici: iri pembe kazıcı pençeler (parmak çizgili), koca pembe
     top burun, mutlu-kısık çizgi gözler; "kayıp" gözlük aslında alnında,
     ayak dibinde toprak tümseği.
     ===================================================================== */

  function kostebekBits (c) {
    var LT = '#D5C9EC', DK = '#8F79B8';      // lavanta kadife
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);

    b.feet = c.caps(48, 99.5, 13, 8, '#B9A8D9', {}) + c.caps(72, 99.5, 13, 8, '#B9A8D9', {});

    b.body = c.blob(60, 81, 24.5, 20, BD, {}) +
             c.blob(60, 87, 13, 9.5, '#EFE8F8', { line: false, op: 0.95 }) +
             c.gloss(48, 68, 9, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#DCD2EE', 0.2);

    // iri kazıcı pençeler (öne dönük, parmak çizgili)
    b.paws = c.blob(41, 87, 8.6, 7.4, c.vinyl('p1', '#FFB6C4', '#F28FA8'), { rot: -8 }) +
             c.blob(79, 87, 8.6, 7.4, c.vinyl('p2', '#FFB6C4', '#F28FA8'), { rot: 8 }) +
             (c.sil ? '' :
              c.line('M37.5 82.5 L36.5 91 M41.5 81.6 L41 91.8 M45.5 82.5 L45 91',
                     1.7, '#D9718C', { op: 0.85 }) +
              c.line('M74.5 82.5 L75 91 M78.5 81.6 L79 91.8 M82.5 82.5 L83.5 91',
                     1.7, '#D9718C', { op: 0.85 }));

    b.head = c.ball(60, 44, 21, HD, {}) + c.gloss(49.5, 34, 8, 4.5);

    // alnına itilmiş yuvarlak gözlük ("toprakta unuttum" sanıyor!)
    b.specs = c.ball(51.5, 29.5, 5.6, '#CFEFFA', { lw: 2.2, op: 0.9 }) +
              c.ball(68.5, 29.5, 5.6, '#CFEFFA', { lw: 2.2, op: 0.9 }) +
              c.line('M57.1 28.6 Q60 26.8 62.9 28.6', 2.2, c.ink()) +
              c.line('M46 30.5 Q42.5 33 41.5 36.5 M74 30.5 Q77.5 33 78.5 36.5', 2, c.ink()) +
              c.dot(49.5, 27.5, 1.4, 0.85) + c.dot(66.5, 27.5, 1.4, 0.85);

    // koca pembe burun + mutlu kısık gözler ("gözlüksüz ama mutlu")
    b.face = c.eyes(60, 43, { dx: 8.2, r: 4.4, closed: true, lash: false }) +
             c.cheeks(60, 49.5, 14.2, {}) +
             c.ball(60, 51.5, 4.8, c.vinyl('nz', '#FFA8B8', '#F26D96'), { lw: c.LW2 }) +
             c.dot(58.4, 50, 1.3, 0.85) +
             c.mouth(60, 58, 'smile', { w: 8 });

    // ayak dibinde toprak tümseği
    b.soil = c.ball(30, 97.5, 4, '#C98A4E', { lw: 2 }) +
             c.ball(36.5, 99.5, 3, '#B77B3F', { lw: 1.8 }) +
             c.ball(25, 100, 2.6, '#B77B3F', { lw: 1.8 }) +
             c.sparkle(90, 76, 3, '#D9CFFA', 0.8);
    return b;
  }

  Y.art.registerKind('kostebek', {
    pufi: function (c) {
      var b = kostebekBits(c);
      return b.feet + b.body + b.paws + b.head + b.specs + b.face + b.soil;
    },
    parts: function (c) {
      var b = kostebekBits(c);
      return {
        govde: c.move(0, -8, b.feet + b.body + b.paws),
        bas:   c.zoom(1.18, 60, 44, c.move(0, 13, b.head + b.face)),
        aksesuar: c.zoom(1.3, 60, 60,
          c.move(0, 32, b.specs) + c.move(24, -20, b.soil))
      };
    }
  });

  /* =====================================================================
     7) OĞLAK — Meke: "Kafa tokuşturmayı selamlaşma sanır"
     Ayırt edici: geriye kıvrık halkalı tomurcuk boynuzlar, çene altı
     sakal püskülü, öne düşen perçem; baş "toka?" için öne eğik, alnın
     önünde selam pırıltıları. (Buzağıdan ayrım: sakal, kıvrık boynuz,
     muzzle yok, çan yok.)
     ===================================================================== */

  function oglakBits (c) {
    var LT = '#F9F3E6', DK = '#CBB9A0';      // krem-gri oğlak
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);

    b.tail = c.drop(82, 74, 3.4, 8, BD, { rot: 132, lw: c.LW2 });

    b.feet = c.caps(48, 99.5, 13, 8, '#A8907A', {}) + c.caps(72, 99.5, 13, 8, '#A8907A', {});

    b.body = c.blob(60, 81, 24.5, 20, BD, {}) +
             c.blob(60, 87, 13, 9.5, '#FFFBF2', { line: false, op: 0.95 }) +
             c.gloss(48, 68, 9, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#EFE7D6', 0.2);

    // geriye kıvrık boynuzlar + halka çizgileri
    b.horns = c.rope('M50 30 Q44 20 49 12.5', 5.2, '#EFC06B') +
              c.rope('M70 30 Q76 20 71 12.5', 5.2, '#EFC06B') +
              (c.sil ? '' :
               c.line('M46.2 23.5 Q48.5 22 50.4 23 M45.8 18 Q48 16.6 49.6 17.6', 1.5, '#C9913C', { op: 0.8 }) +
               c.line('M73.8 23.5 Q71.5 22 69.6 23 M74.2 18 Q72 16.6 70.4 17.6', 1.5, '#C9913C', { op: 0.8 }));

    // dik yana kulaklar
    b.ears = c.blob(37.5, 41, 8.2, 5.2, BD, { rot: -16 }) +
             c.blob(37.5, 41.5, 4.2, 2.4, '#FFC4D9', { line: false, op: 0.8, rot: -16 }) +
             c.blob(82.5, 41, 8.2, 5.2, BD, { rot: 16 }) +
             c.blob(82.5, 41.5, 4.2, 2.4, '#FFC4D9', { line: false, op: 0.8, rot: 16 });

    b.head = c.ball(60, 45, 20.5, HD, {}) + c.gloss(50, 35.5, 7.8, 4.4);

    // öne düşen perçem
    b.lock = c.drop(56, 33, 3.5, 7.5, c.vinyl('fl', '#EFE2CC', '#C9AE8C'), { rot: -158 }) +
             c.drop(63, 32, 3, 6.5, c.vinyl('f2', '#EFE2CC', '#C9AE8C'), { rot: 168 });

    // keçi sakalı püskülü
    b.beard = c.drop(60, 63.5, 3.2, 8, c.vinyl('be', '#EFE2CC', '#C9AE8C'), { rot: 180 });

    b.face = c.eyes(60, 43.5, { dx: 8.2, r: 4.7 }) +
             c.cheeks(60, 50, 14.2, {}) +
             c.mouth(60, 53, 'smile', { w: 8.5 });

    // baş grubu: "toka?" için öne eğik
    b.headG = c.spin(-7, 60, 50,
              b.horns + b.ears + b.head + b.lock + b.face + b.beard);

    // selam pırıltıları (eğilen alnın önünde)
    b.bump = c.sparkle(29, 27, 3.6, '#FFD76B', 0.95) +
             c.sparkle(37, 19, 2.8, '#FFD76B', 0.85) +
             (c.sil ? '' : c.line('M33 33 L28 36 M40 14 L37 9.5', 2, '#F2A400', { op: 0.8 }));
    return b;
  }

  Y.art.registerKind('oglak', {
    pufi: function (c) {
      var b = oglakBits(c);
      return b.tail + b.feet + b.body + b.headG + b.bump;
    },
    parts: function (c) {
      var b = oglakBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.feet + b.body),
        bas:   c.zoom(1.15, 60, 45,
               c.move(0, 12, b.horns + b.ears + b.head + b.lock + b.face + b.beard)),
        aksesuar: c.zoom(1.3, 60, 60,
          c.move(0, 34, b.horns) + c.move(0, 10, b.beard) + c.move(4, 26, b.bump))
      };
    }
  });

  /* =====================================================================
     8) KÖPEK — Fındık: "Kuzular yerine kelebekleri güder"
     Ayırt edici: tek göz üstü koyu yama, uçları kıvrık sarkık kulaklar,
     havada kıvrık neşeli kuyruk, beyaz göğüs önlüğü; peşinde güttüğü
     mini kelebek, bakışlar yukarıda.
     ===================================================================== */

  function kopekBits (c) {
    var LT = '#F5CD9E', DK = '#C9853F';      // fındık-karamel
    var EDK = '#A86A32';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);

    // havada kıvrık neşeli kuyruk
    b.tail = c.rope('M79 84 Q94 76 92 61 Q90.5 52 82 54', 6.5, '#E0A863', { hi: true });

    b.feet = c.caps(48, 99.5, 13, 8, '#B9793E', {}) + c.caps(72, 99.5, 13, 8, '#B9793E', {});

    b.body = c.blob(60, 81, 24.5, 20, BD, {}) +
             c.blob(60, 86.5, 13.5, 10, '#FFF6E4', { line: false, op: 0.95 }) +
             c.gloss(48, 68, 9, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#EFD9B4', 0.2);

    // sarkık kulaklar, uçları kıvrık top
    b.ears = c.blob(41, 34, 7, 11.5, c.vinyl('e1', '#D9975E', EDK), { rot: 22 }) +
             c.ball(37.5, 43.5, 5.4, c.vinyl('e3', '#D9975E', EDK), { lw: c.LW2 }) +
             c.blob(79, 34, 7, 11.5, c.vinyl('e2', '#D9975E', EDK), { rot: -22 }) +
             c.ball(82.5, 43.5, 5.4, c.vinyl('e4', '#D9975E', EDK), { lw: c.LW2 });

    // tek göz üstü koyu yama
    b.head = c.ball(60, 44, 21, HD, {}) +
             c.blob(68.6, 40.5, 7.6, 8.4, '#A86A32', { line: false, op: 0.92, rot: -8 }) +
             c.gloss(49.5, 34, 8, 4.5);

    // kelebeğe bakan gözler (hafif yukarıda) + beyaz muzzle + hav!
    b.face = c.eyes(60, 41.5, { dx: 8.4, r: 4.8 }) +
             c.cheeks(60, 48.5, 14.4, {}) +
             c.blob(60, 53, 8, 5.6, '#FFF6E4', { line: false, op: 0.95 }) +
             c.ball(60, 50.5, 2.7, '#6B4526', { lw: 1.6 }) +
             c.mouth(60, 54.5, 'open', { w: 8.5 });

    // güttüğü "sürü": mini kelebek + uçuş izi
    b.fly = c.blob(24.5, 33, 4.4, 5.8, c.vinyl('k1', '#FFD9EC', '#FF8FC8'), { rot: -24, lw: 1.8 }) +
            c.blob(32.5, 33, 4.4, 5.8, c.vinyl('k2', '#FFD9EC', '#FF8FC8'), { rot: 24, lw: 1.8 }) +
            c.caps(28.5, 34.5, 3.4, 8, '#8F79D9', { rx: 1.7, lw: 1.6 }) +
            (c.sil ? '' :
             c.line('M26.6 29.5 Q25 26.5 23 25.5 M30.4 29.5 Q32 26.5 34 25.5', 1.5, '#7A66C2') +
             c.line('M20 48 Q28 44 30 52 Q31 57 26 57', 1.8, '#F49CC0', { dash: '1 4.5', op: 0.85 })) +
            c.sparkle(38, 24, 2.8, '#FFD9EC', 0.85);
    return b;
  }

  Y.art.registerKind('kopek', {
    pufi: function (c) {
      var b = kopekBits(c);
      return b.tail + b.feet + b.body + b.ears + b.head + b.face + b.fly;
    },
    parts: function (c) {
      var b = kopekBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.feet + b.body),
        bas:   c.zoom(1.16, 60, 44, c.move(0, 13, b.ears + b.head + b.face)),
        aksesuar: c.move(31, 24, c.zoom(1.5, 28.5, 34, b.fly)) +
                  c.sparkle(84, 40, 3.4, '#FFD9EC', 0.9) +
                  c.sparkle(36, 84, 3, '#F49CC0', 0.8)
      };
    }
  });

  /* =====================================================================
     9) KARINCA — Kırıntı: "Yüz kat büyük yük taşır; teşekkür bekler"
     Ayırt edici: baş üstünde gövdesinden büyük kurabiye yükü (kollar
     kaldırık), belirgin bel boğumu (göğüs+karın iki küre), dirsekli
     top uçlu antenler; yanda bekleyen "teşekkür?" pırıltısı.
     (Uğur böceğinden ayrım: kiremit-bordo, puansız, yük + boğum.)
     ===================================================================== */

  function karincaBits (c) {
    var LT = '#F28A76', DK = '#C1453A';      // kiremit-bordo şeker
    var b = {};
    var AB = c.vinyl('ab', LT, DK);
    var TH = c.vinyl('th', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var CK = c.vinyl('ck', '#FFE9A8', '#D9973C');

    b.feet = c.caps(49, 99.5, 12, 7.5, '#A83A30', {}) + c.caps(71, 99.5, 12, 7.5, '#A83A30', {});

    // karınca beli: tombul karın + göğüs boğumu
    b.abdomen = c.blob(60, 86, 17.5, 13.5, AB, {}) +
                c.blob(60, 90, 9.5, 6.5, '#FFD9CE', { line: false, op: 0.9 }) +
                c.gloss(51, 78, 6.5, 3.8) +
                c.bounce(60, 96.5, 11.5, 3.6, '#F2C4B8', 0.2);
    b.thorax = c.blob(60, 66, 13, 10.5, TH, {}) + c.gloss(54, 61, 4.6, 2.8);

    // başının üstünde DEV kurabiye yükü
    b.load = c.ball(60, 20.5, 14.5, CK, {}) +
             (c.sil ? '' :
              c.blob(54, 15.5, 2.6, 2.2, '#8A5A30', { line: false, op: 0.9 }) +
              c.blob(65.5, 20, 2.9, 2.4, '#8A5A30', { line: false, op: 0.9 }) +
              c.blob(58, 26, 2.2, 1.9, '#8A5A30', { line: false, op: 0.9 }) +
              c.blob(68, 13.5, 1.8, 1.6, '#8A5A30', { line: false, op: 0.85 })) +
             c.gloss(53, 13, 5.4, 3.2) +
             (c.sil ? '' : c.line('M49.5 29.5 Q60 33.5 70.5 29.5', 2, '#B97F36', { op: 0.6 }));

    // yükü kaldıran kollar + tutan eller
    b.arms = c.rope('M50 62 Q39 50 43.5 34', 5, '#E86B5A') +
             c.rope('M70 62 Q81 50 76.5 34', 5, '#E86B5A') +
             c.ball(45.5, 31.5, 4, AB, { lw: c.LW2 }) +
             c.ball(74.5, 31.5, 4, AB, { lw: c.LW2 });

    b.head = c.ball(60, 46, 17.5, HD, {}) + c.gloss(51.5, 38.5, 6.8, 4);

    // dirsekli top uçlu antenler (yükün iki yanından taşar)
    b.ant = c.antenna('M49 33.5 Q41 30 40.5 22.5', '#8A2F26', 40, 21, 2.8) +
            c.antenna('M71 33.5 Q79 30 79.5 22.5', '#8A2F26', 80, 21, 2.8);

    b.face = c.eyes(60, 45, { dx: 7.4, r: 5 }) +
             c.cheeks(60, 51.5, 12.8, { rx: 3.8, ry: 2.5 }) +
             c.mouth(60, 54, 'smile', { w: 8 });

    // bekleyen "teşekkür?" pırıltısı
    b.thanks = c.sparkle(92, 52, 3.8, '#FFD76B', 0.95) +
               c.sparkle(97, 43, 2.6, '#FFD76B', 0.8) +
               c.dot(88, 60, 1.3, 0.75);
    return b;
  }

  Y.art.registerKind('karinca', {
    pufi: function (c) {
      var b = karincaBits(c);
      return b.feet + b.abdomen + b.thorax + b.load + b.arms + b.head +
             b.ant + b.face + b.thanks;
    },
    parts: function (c) {
      var b = karincaBits(c);
      return {
        govde: c.move(0, -12, b.feet + b.abdomen + b.thorax),
        bas:   c.zoom(1.25, 60, 46, c.move(0, 12, b.head + b.face)),
        aksesuar: c.zoom(1.1, 60, 60,
          c.move(0, 34, b.load + b.ant) + c.move(-16, 6, b.thanks))
      };
    }
  });
})();
