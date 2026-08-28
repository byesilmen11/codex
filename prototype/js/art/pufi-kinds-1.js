/* =====================================================================
   YUVO SANAT — pufi-kinds-1.js  (sahip: ressam-1)
   =====================================================================
   pufi-svg.js STİL KILAVUZUNA birebir uyar: şeker-vinil sticker dili,
   INK kontur, sol-üst ışık, c.* primitifleri. 9 kind kaydeder:
     kuzu(Pamuş)  ari(Vızbız)  buzagi(Mölü)  tavuk(Gıdak)  ordek(Badi)
     cekirge(Hophop)  sincap(Fıstık)  ugurbocegi(Boncuk)  solucan(Kıvrık)
   Hepsi Yaygın kademe → standart aura (API karışmaz), ownAura yok.
   Her kind: kişilikli ifade (bio'dan) + en az 2 ayırt edici anatomik
   özellik + kendine has silüet. Gradyan adları ctx başına benzersizdir.
   ===================================================================== */
(function () {
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* =====================================================================
     1) KUZU — Pamuş: "Bulutları koyun sanıp gökyüzüne 'mee' der"
     Ayırt edici: fıstıki yün bulut gövde (tarak tarak), yün perçem +
     tepe topuzu, sarkık kulaklar; ağzı 'o' (buluta mee diyor), yanında
     mini bulut arkadaşı.
     ===================================================================== */

  function kuzuBits (c) {
    var WLT = '#FFFDF6', WDK = '#E3D4C2';   // yün
    var FLT = '#FFE8C9', FDK = '#F2B27A';   // yüz/karamel
    var HOOF = '#C98A4E', EARIN = '#FFC4D9';
    var b = {}, i;
    var WL = c.vinyl('wl', WLT, WDK);
    var FC = c.vinyl('fc', FLT, FDK);
    var CL = c.vinyl('cl', '#FFFFFF', '#D6ECF8');

    b.feet = c.caps(48, 99.5, 13, 8, HOOF, {}) + c.caps(72, 99.5, 13, 8, HOOF, {});

    // yün gövde: tomurcuk halkası + örtü → tarak tarak bulut silüeti
    var P = [[38,72],[36.5,83],[44,92],[54,95.5],[66,95.5],[76,92],[83.5,83],[82,72],[72,64.5],[60,62.5],[48,64.5]];
    var bumps = '';
    for (i = 0; i < P.length; i++) bumps += c.ball(P[i][0], P[i][1], 7.2, WL, {});
    b.body = bumps +
             c.blob(60, 79, 20, 15.5, WL, { line: false }) +
             c.gloss(46, 70, 8.5, 5) +
             c.bounce(60, 94.5, 15, 4.2, '#F2E9DC', 0.22);

    b.ears = c.blob(41, 49, 5.6, 9, FC, { rot: 24 }) +
             c.blob(41, 49.5, 2.8, 5, EARIN, { line: false, op: 0.8, rot: 24 }) +
             c.blob(79, 49, 5.6, 9, FC, { rot: -24 }) +
             c.blob(79, 49.5, 2.8, 5, EARIN, { line: false, op: 0.8, rot: -24 });

    b.head = c.blob(60, 46, 16.5, 15, FC, {}) + c.gloss(52, 39, 5.8, 3.4);

    // yün perçem + tepe topuzu (silüet kirazı)
    b.cap = c.ball(47, 30, 5, WL, {}) + c.ball(54, 26.5, 5, WL, {}) +
            c.ball(61, 25.5, 5, WL, {}) + c.ball(68, 27.5, 5, WL, {}) +
            c.ball(74, 31.5, 5, WL, {}) +
            c.blob(60, 30, 13.5, 5.5, WL, { line: false }) +
            c.ball(60, 19.5, 4.6, WL, {});

    // buluta "mee": ağız 'o'
    b.face = c.eyes(60, 45, { dx: 7.4, r: 4.5 }) +
             c.cheeks(60, 51.5, 12.4, {}) +
             c.mouth(60, 53.5, 'o');

    // mini bulut arkadaşı (Pamuş'un "koyun"u)
    b.cloud = c.ball(85.5, 26.5, 4.6, CL, { lw: c.LW2 }) +
              c.ball(90.5, 24.5, 5.4, CL, { lw: c.LW2 }) +
              c.ball(94.4, 27.2, 3.6, CL, { lw: c.LW2 }) +
              c.blob(90, 28.4, 8.2, 3.6, CL, { line: false }) +
              c.dot(88.5, 23.4, 1.4, 0.8) +
              c.sparkle(80, 34, 2.6, '#BFE4F5', 0.8);
    return b;
  }

  Y.art.registerKind('kuzu', {
    pufi: function (c) {
      var b = kuzuBits(c);
      return b.feet + b.body + b.ears + b.head + b.cap + b.face + b.cloud;
    },
    parts: function (c) {
      var b = kuzuBits(c);
      return {
        govde: c.move(0, -9, b.feet + b.body),
        bas:   c.zoom(1.18, 60, 44, c.move(0, 13, b.ears + b.head + b.face)),
        aksesuar: c.zoom(1.22, 60, 60,
          c.move(0, 30, b.cap) + c.move(-26, 38, b.cloud) +
          c.sparkle(30, 40, 3.4, '#D6ECF8', 0.85))
      };
    }
  });

  /* =====================================================================
     2) ARI — Vızbız: "Bütün çiçeklerin adresini bilir, kendi kovanını unutur"
     Ayırt edici: bal şeridi gövde, buzlu cam kanatlar, top uçlu antenler,
     minik iğne; yanında adresini bildiği bir papatya.
     ===================================================================== */

  function ariBits (c) {
    var LT = '#FFF3B0', DK = '#FFB833', ST = '#7A5230';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var WNG = c.vinyl('wg', '#F4FCFF', '#BFE4F5');

    b.wings = c.blob(34, 62, 9.8, 16, WNG, { rot: -26, op: 0.92 }) +
              c.line('M31 52 Q28.5 62 32 71', 1.6, '#9CCFE8', { op: 0.75 }) +
              c.blob(86, 62, 9.8, 16, WNG, { rot: 26, op: 0.92 }) +
              c.line('M89 52 Q91.5 62 88 71', 1.6, '#9CCFE8', { op: 0.75 });

    // iğne: gövdenin arkasından ucu görünür
    b.sting = c.drop(84, 94, 3.2, 8, '#F2C14E', { rot: 132, lw: c.LW2 });

    b.feet = c.caps(48, 99, 13, 8, '#E09A28', {}) + c.caps(72, 99, 13, 8, '#E09A28', {});

    b.body = c.blob(60, 81, 24, 20, BD, {}) +
             c.blob(60, 72.5, 21.2, 4.1, ST, { line: false, op: 0.92 }) +
             c.blob(60, 82.5, 23.3, 4.3, ST, { line: false, op: 0.92 }) +
             c.blob(60, 92, 18.8, 3.8, ST, { line: false, op: 0.92 }) +
             c.gloss(47.5, 68.5, 8.8, 5) +
             c.bounce(60, 96, 15.5, 4.4, '#FFF3C0', 0.22);

    b.head = c.ball(60, 43, 21, HD, {}) + c.gloss(49.5, 33, 8, 4.5);

    b.tuft = c.drop(60, 22.5, 2.8, 6.5, c.vinyl('tf', '#FFF6C4', DK), { rot: 10, lw: c.LW2 });

    b.ant = c.antenna('M52 25 Q46.5 18 41 15.8', ST, 39.5, 15, 2.9) +
            c.antenna('M68 25 Q73.5 18 79 15.8', ST, 80.5, 15, 2.9);

    b.face = c.eyes(60, 42, { dx: 8.4, r: 4.8 }) +
             c.cheeks(60, 49, 14.4, {}) +
             c.mouth(60, 51.5, 'open', { w: 8 });

    // papatya: adresini ezbere bildiği çiçek
    b.flower = c.leaf(25, 60, 2.8, 6.8, '#FFFFFF', { lw: 1.6 }) +
               c.leaf(25, 60, 2.8, 6.8, '#FFFFFF', { lw: 1.6, rot: 60 }) +
               c.leaf(25, 60, 2.8, 6.8, '#FFFFFF', { lw: 1.6, rot: 120 }) +
               c.ball(25, 60, 3.2, '#FFC734', { lw: 1.6 }) +
               c.line('M25 67.5 Q23.5 72 26 75.5', 2, c.sil ? c.SIL : '#55B944') +
               c.sparkle(32, 52, 2.8, '#FFD9EC', 0.85);
    return b;
  }

  Y.art.registerKind('ari', {
    pufi: function (c) {
      var b = ariBits(c);
      return b.wings + b.sting + b.feet + b.body + b.head + b.tuft + b.ant + b.face + b.flower;
    },
    parts: function (c) {
      var b = ariBits(c);
      return {
        govde: c.move(0, -9, b.sting + b.feet + b.body),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.tuft + b.face)),
        aksesuar: c.zoom(1.05, 60, 60,
          c.move(0, 10, b.wings) + c.move(0, 28, b.ant) + c.move(32, -22, b.flower))
      };
    }
  });

  /* =====================================================================
     3) BUZAĞI — Mölü: "Papatya koklamayı sever; her seferinde hapşırır"
     Ayırt edici: iri pembe burunlu ağız (muzzle), tomurcuk boynuzlar,
     yana açık kulaklar, göz üstü karamel yama, püsküllü kuyruk;
     burnunun dibinde papatya + hapşırık pırıltıları.
     ===================================================================== */

  function buzagiBits (c) {
    var LT = '#FFF8EA', DK = '#E0C9A8', PATCH = '#E8A863';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var EAR = c.vinyl('er', LT, DK);
    var MZ = c.vinyl('mz', '#FFE2C2', '#F2A66B');

    b.tail = c.rope('M80 88 Q93 91 94 79', 5, '#EFE0C6', { hi: true }) +
             c.drop(94.5, 74.5, 3.2, 8, '#C98A4E', { rot: 18, lw: c.LW2 });

    b.feet = c.caps(48, 99.5, 13, 8, '#B87A44', {}) + c.caps(72, 99.5, 13, 8, '#B87A44', {});

    b.body = c.blob(60, 81, 25, 20, BD, {}) +
             c.blob(70, 73, 8.5, 6.5, PATCH, { line: false, op: 0.95 }) +
             c.blob(60, 87, 13, 9.5, '#FFF6E6', { line: false, op: 0.95 }) +
             c.gloss(47, 68, 9.2, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#F5EAD6', 0.2);

    // tomurcuk boynuzlar (başın arkasından uç verir)
    b.horns = c.caps(46, 23, 7, 9, '#F2E2C4', { rot: -14, rx: 3.4, lw: c.LW2 }) +
              c.caps(74, 23, 7, 9, '#F2E2C4', { rot: 14, rx: 3.4, lw: c.LW2 });

    // yana açık inek kulakları
    b.ears = c.blob(36.5, 36, 8.5, 5.6, EAR, { rot: -22 }) +
             c.blob(36.5, 36.5, 4.6, 2.6, '#FFC4D9', { line: false, op: 0.85, rot: -22 }) +
             c.blob(83.5, 36, 8.5, 5.6, EAR, { rot: 22 }) +
             c.blob(83.5, 36.5, 4.6, 2.6, '#FFC4D9', { line: false, op: 0.85, rot: 22 });

    b.head = c.blob(60, 43, 22, 20, HD, {}) +
             c.blob(70.5, 38.5, 8, 6.6, PATCH, { line: false, op: 0.95 }) +
             c.gloss(49, 33.5, 8, 4.4) +
             c.drop(54, 25, 2.8, 7, PATCH, { rot: -14, lw: c.LW2 }) +
             c.drop(60, 23.5, 3.2, 8.5, '#D9975E', { lw: c.LW2 }) +
             c.drop(66, 25, 2.8, 7, PATCH, { rot: 14, lw: c.LW2 });

    // iri muzzle + burun delikleri + gülümseme
    b.muzzle = c.blob(60, 53.5, 11.5, 7.6, MZ, { lw: c.LW2 }) +
               c.blob(55.8, 52.4, 1.5, 2.1, '#B36B3D', { line: false }) +
               c.blob(64.2, 52.4, 1.5, 2.1, '#B36B3D', { line: false }) +
               c.mouth(60, 56.5, 'smile', { w: 7 });

    b.face = c.eyes(60, 40.5, { dx: 8.8, r: 4.7 }) +
             c.cheeks(60, 48, 15.4, { op: 0.5 });

    // koklamalık papatya + hapşırık öncesi mini pırıltılar
    b.daisy = c.leaf(27, 52, 2.6, 6.2, '#FFFFFF', { lw: 1.6 }) +
              c.leaf(27, 52, 2.6, 6.2, '#FFFFFF', { lw: 1.6, rot: 60 }) +
              c.leaf(27, 52, 2.6, 6.2, '#FFFFFF', { lw: 1.6, rot: 120 }) +
              c.ball(27, 52, 3, '#FFC734', { lw: 1.6 }) +
              c.line('M27 59 Q25.5 63.5 28 67', 2, c.sil ? c.SIL : '#55B944') +
              c.sparkle(40, 57, 2.6, '#8AD9F7', 0.85) +
              c.dot(44, 62, 1.2, 0.8);
    return b;
  }

  Y.art.registerKind('buzagi', {
    pufi: function (c) {
      var b = buzagiBits(c);
      return b.tail + b.feet + b.body + b.horns + b.ears + b.head +
             b.face + b.muzzle + b.daisy;
    },
    parts: function (c) {
      var b = buzagiBits(c);
      return {
        govde: c.move(0, -9, b.tail + b.feet + b.body),
        bas:   c.zoom(1.15, 60, 44, c.move(0, 12, b.head + b.face + b.muzzle)),
        aksesuar: c.zoom(1.12, 60, 60,
          c.move(0, 32, b.horns) + c.move(0, 28, b.ears) + c.move(8, 34, b.daisy))
      };
    }
  });

  /* =====================================================================
     4) TAVUK — Gıdak: "Sürpriz yumurta görünce heyecandan gıdaklar"
     Ayırt edici: üç lobluk yuvarlak ibik + sarkık gerdan (wattle),
     yelpaze kuyruk, çilli göğüs; ayağının dibinde onu heyecanlandıran
     kurdeleli sürpriz yumurta, kanatlar havada.
     ===================================================================== */

  function tavukBits (c) {
    var LT = '#FFFAF0', DK = '#E8CBA8', COMB = '#FF6752';
    var b = {}, i;
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var TL = c.vinyl('tl', '#FFF3E0', '#E0BE94');
    var CB = c.vinyl('cb', '#FF8A73', '#E04432');
    var WG = c.vinyl('wg', '#FFEBD0', '#E0BE94');
    var EG = c.vinyl('eg', '#FFFFFF', '#D9E8F2');

    // yelpaze kuyruk (üç katlı)
    b.tail = c.drop(85, 68, 4.4, 12, TL, { rot: 35 }) +
             c.drop(89, 76, 5, 14, TL, { rot: 65 }) +
             c.drop(87, 85, 5.6, 16, TL, { rot: 100 });

    b.feet = c.caps(48, 99, 13, 8, '#FF9F3D', {}) + c.caps(72, 99, 13, 8, '#FF9F3D', {});

    var SPK = [[52,73],[61,70],[68,75],[56,80],[64,83]], spots = '';
    for (i = 0; i < SPK.length; i++) {
      spots += c.blob(SPK[i][0], SPK[i][1], 1.9, 1.6, '#DFC09A', { line: false, op: 0.55 });
    }
    b.body = c.blob(60, 81, 25, 20.5, BD, {}) +
             c.blob(60, 87, 13.5, 10, '#FFF6E8', { line: false, op: 0.95 }) +
             spots +
             c.gloss(47.5, 68, 9.4, 5.4) +
             c.bounce(60, 96, 16, 4.5, '#F5EBDA', 0.22);

    // heyecandan havaya kalkmış kanatlar
    b.wings = c.drop(35, 79, 6.8, 14, WG, { rot: -140 }) +
              c.drop(85, 79, 6.8, 14, WG, { rot: 140 });

    b.head = c.ball(60, 43, 21.5, HD, {}) + c.gloss(50, 33, 8, 4.5);

    // yuvarlak üç loblu ibik (civcivin sivri sorgucundan ayrışır)
    b.comb = c.ball(51.5, 25.5, 4.8, CB, {}) +
             c.ball(60, 22.5, 5.8, CB, {}) +
             c.ball(68.5, 25.5, 4.8, CB, {});

    // gaganın altında sarkan çifte gerdan
    b.wattle = c.drop(56.5, 63, 2.6, 7, COMB, { rot: -8, lw: c.LW2 }) +
               c.drop(63.5, 63, 2.6, 7, COMB, { rot: 8, lw: c.LW2 });

    b.face = c.eyes(60, 42, { dx: 8.6, r: 4.9 }) +
             c.cheeks(60, 49, 14.8, {}) +
             c.beak(60, 52.5, 9.5, '#FF9F3D', { open: true, dk: '#E8842B' });

    // gıdaklatan sürpriz yumurta (zikzak kuşaklı)
    b.egg = c.blob(29, 91, 6.5, 8, EG, {}) +
            c.line('M23.5 91 L26 88.8 L28.5 91 L31 88.8 L33.5 91', 1.8,
                   c.sil ? c.SIL : '#8AD9F7', { op: 0.9 }) +
            c.dot(26.5, 86, 1.3, 0.8) +
            c.sparkle(38, 81, 3, '#FFD76B', 0.9);
    return b;
  }

  Y.art.registerKind('tavuk', {
    pufi: function (c) {
      var b = tavukBits(c);
      return b.tail + b.feet + b.body + b.wings + b.head + b.comb +
             b.face + b.wattle + b.egg;
    },
    parts: function (c) {
      var b = tavukBits(c);
      return {
        govde: c.move(0, -9, b.tail + b.feet + b.body + b.wings),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.face)),
        aksesuar: c.zoom(1.18, 60, 60,
          c.move(0, 26, b.comb) + c.move(0, 16, b.wattle) + c.move(6, -32, b.egg))
      };
    }
  });

  /* =====================================================================
     5) ÖRDEK — Badi: "Sıra olmayı hep şaşırır, hep en önde biter"
     Ayırt edici: geniş yassı gaga (açık-gülümser), perdeli turuncu
     ayaklar, tek tutam ıslak perçem, havaya kalkık pöstekik kuyruk;
     etrafında su damlacıkları.
     ===================================================================== */

  function ordekBits (c) {
    var LT = '#FFF3D0', DK = '#FFB347';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var WG = c.vinyl('wg', '#FFE9B0', '#F2A63C');
    var BL = c.vinyl('bl', '#FFAE66', '#F26D1F');

    b.tail = c.drop(31, 86, 4.6, 11, WG, { rot: -118 });

    // perdeli ayaklar: yayvan taban + perde çizgileri
    b.feet = c.blob(47, 99, 8, 4.8, '#FF9F3D', {}) +
             c.line('M44 96.4 L44.6 101.4 M50 96.4 L49.4 101.4', 2,
                    c.sil ? c.SIL : '#E8842B') +
             c.blob(73, 99, 8, 4.8, '#FF9F3D', {}) +
             c.line('M70 96.4 L70.6 101.4 M76 96.4 L75.4 101.4', 2,
                    c.sil ? c.SIL : '#E8842B');

    b.body = c.blob(60, 80.5, 25.5, 20.5, BD, {}) +
             c.blob(60, 85.5, 14, 10.5, '#FFF9E4', { line: false, op: 0.95 }) +
             c.gloss(47, 67.5, 9.4, 5.4) +
             c.bounce(60, 95.5, 16, 4.4, '#FFEFC9', 0.24);

    b.wings = c.drop(35.5, 81, 6.6, 13.5, WG, { rot: -152 }) +
              c.drop(84.5, 81, 6.6, 13.5, WG, { rot: 152 });

    b.head = c.ball(60, 42.5, 21.5, HD, {}) + c.gloss(49.5, 32.5, 8.2, 4.6);

    // tek tutam ıslak perçem
    b.tuft = c.drop(63, 23, 3.4, 9, WG, { rot: 16 }) +
             c.drop(56.5, 24.5, 2.7, 7, WG, { rot: -20 });

    // geniş yassı gaga; sevinçte alt gaga da görünür
    b.bill = c.blob(60, 52.5, 10.8, 4.8, BL, { lw: c.LW2 }) +
             ((c.mood !== 'sleep' && !c.sil)
               ? c.blob(60, 56.6, 6.8, 2.8, '#E85C1E', { lw: 1.8 })
               : '') +
             c.blob(56.4, 50.6, 1.1, 1.5, '#C24E14', { line: false }) +
             c.blob(63.6, 50.6, 1.1, 1.5, '#C24E14', { line: false });

    b.face = c.eyes(60, 41.5, { dx: 8.4, r: 4.8 }) +
             c.cheeks(60, 48.5, 14.6, {});

    // su damlacıkları (en önde biten sıra yüzücüsü)
    b.drops = c.drop(26, 64, 2.8, 7, '#8AD9F7', { rot: -10, lw: 1.8 }) +
              c.drop(93, 58, 2.4, 6, '#8AD9F7', { rot: 12, lw: 1.8 }) +
              c.dot(30, 55, 1.3, 0.8) +
              c.sparkle(90, 72, 3, '#BFEAF5', 0.85);
    return b;
  }

  Y.art.registerKind('ordek', {
    pufi: function (c) {
      var b = ordekBits(c);
      return b.tail + b.feet + b.body + b.wings + b.head + b.tuft +
             b.face + b.bill + b.drops;
    },
    parts: function (c) {
      var b = ordekBits(c);
      return {
        govde: c.move(0, -9, b.tail + b.feet + b.body),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.face + b.bill)),
        aksesuar: c.zoom(1.15, 60, 60,
          c.move(0, 24, b.tuft) +
          c.move(16, -18, c.drop(35.5, 81, 6.6, 13.5, c.vinyl('aw1', '#FFE9B0', '#F2A63C'), { rot: -152 })) +
          c.move(-16, -18, c.drop(84.5, 81, 6.6, 13.5, c.vinyl('aw2', '#FFE9B0', '#F2A63C'), { rot: 152 })) +
          b.drops)
      };
    }
  });

  /* =====================================================================
     6) ÇEKİRGE — Hophop: "Zıplayışlarını sayar, hep 'üç'te kaybolur"
     Ayırt edici: dizleri başın hizasına kalkan yaylı arka bacaklar,
     geriye süpürülmüş uzun antenler, sırt kanat yaprakları; ardında
     üç pırıltıyla noktalanan kesik zıplama izi (1-2-üç!).
     ===================================================================== */

  function cekirgeBits (c) {
    var LT = '#DDF5A8', DK = '#78C93E', DEEP = '#4A9E3E';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);

    // yaylı arka bacaklar: kalça → yüksek diz → incik → ayak topu
    b.legs = c.rope('M75 87 Q92 79 90 62 Q92.5 80 86 96', 6.5, '#8FD45E', { hi: true }) +
             c.ball(86, 96.5, 3.6, DEEP, { lw: 2 }) +
             c.rope('M45 87 Q28 79 30 62 Q27.5 80 34 96', 6.5, '#8FD45E', { hi: true }) +
             c.ball(34, 96.5, 3.6, DEEP, { lw: 2 });

    b.feet = c.caps(49, 99.5, 12, 7.5, '#8FD45E', {}) + c.caps(71, 99.5, 12, 7.5, '#8FD45E', {});

    b.body = c.blob(60, 81, 23.5, 19.5, BD, {}) +
             c.blob(60, 86.5, 13, 10, '#F4FBDF', { line: false, op: 0.95 }) +
             c.leaf(47, 76, 3.6, 11, '#5BB53A', { rot: -16, lw: 1.8 }) +
             c.leaf(73, 76, 3.6, 11, '#5BB53A', { rot: 16, lw: 1.8 }) +
             c.gloss(48, 68.5, 9, 5.2) +
             c.bounce(60, 95.5, 15, 4.3, '#E8F7C4', 0.22);

    b.head = c.ball(60, 43, 21, HD, {}) + c.gloss(49.5, 33, 8, 4.5);

    // geriye süpürülmüş uzun antenler
    b.ant = c.antenna('M53 26 Q44 16 30.5 15', DEEP, 28.5, 14.6, 2.6) +
            c.antenna('M67 26 Q76 16 89.5 15', DEEP, 91.5, 14.6, 2.6);

    b.face = c.eyes(60, 42, { dx: 8.4, r: 4.8 }) +
             c.cheeks(60, 49, 14.4, {}) +
             c.mouth(60, 52, 'open', { w: 8.5 });

    // zıplama izi: kesik yay + 1-2-ÜÇ pırıltıları (üçüncüsü kayboluyor!)
    b.hop = (c.sil ? '' :
             c.line('M22 54 Q27 37 39 44', 2.4, '#55B944', { dash: '1 6.5', op: 0.85 })) +
            c.sparkle(22, 55, 2.4, '#8ED94F', 0.9) +
            c.sparkle(29, 42, 2.8, '#8ED94F', 0.9) +
            c.sparkle(39.5, 43.5, 3.4, '#FFC734', 0.95);
    return b;
  }

  Y.art.registerKind('cekirge', {
    pufi: function (c) {
      var b = cekirgeBits(c);
      return b.legs + b.feet + b.body + b.head + b.ant + b.face + b.hop;
    },
    parts: function (c) {
      var b = cekirgeBits(c);
      return {
        govde: c.move(0, -8, b.feet + b.body),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.face)),
        aksesuar: b.legs + c.move(0, 28, b.ant) + c.move(14, 26, b.hop)
      };
    }
  });

  /* =====================================================================
     7) SİNCAP — Fıstık: "Yanaklarında tohum saklar; yerini asla hatırlamaz"
     Ayırt edici: tohum dolu balon yanaklar (silüete taşar), kabarık
     kıvrık kuyruk, sırtta yer sincabı çizgileri, patileri arasında
     palamut; yerini unuttuğu ikinci tohum kenarda süzülür.
     ===================================================================== */

  function sincapBits (c) {
    var LT = '#FBD9A8', DK = '#D98E4A';
    var b = {};
    var BD = c.vinyl('bd', LT, DK);
    var HD = c.vinyl('hd', LT, DK);
    var AC = c.vinyl('ac', '#F2BE7E', '#C9853F');

    b.tail = c.rope('M78 90 Q92 84 90 64 Q88 53 79 51', 8, '#E8A863', { hi: true }) +
             c.drop(77.5, 49, 3.6, 8, DK, { rot: -64, lw: c.LW2 });

    b.feet = c.caps(48, 99.5, 13, 8, '#E0A868', {}) + c.caps(72, 99.5, 13, 8, '#E0A868', {});

    b.body = c.blob(60, 81, 24.5, 20, BD, {}) +
             c.caps(45.5, 78, 5, 16, '#B37034', { rot: -6, rx: 2.5, line: false, op: 0.55 }) +
             c.caps(74.5, 78, 5, 16, '#B37034', { rot: 6, rx: 2.5, line: false, op: 0.55 }) +
             c.blob(60, 86.5, 13, 10, '#FFF1DC', { line: false, op: 0.95 }) +
             c.gloss(47.5, 68, 9, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#F5E3C6', 0.2);

    // patiler arasında palamut
    b.acorn = c.ball(60, 89, 5.2, AC, { lw: c.LW2 }) +
              c.caps(60, 84.4, 10, 4.4, '#8A5A30', { rx: 2.2, lw: 1.8 }) +
              c.line('M60 82 L60 80', 1.8, c.sil ? c.SIL : '#8A5A30');
    b.paws = c.ball(53, 89.5, 4.3, '#F5CD9C', { lw: c.LW2 }) +
             c.ball(67, 89.5, 4.3, '#F5CD9C', { lw: c.LW2 });

    b.ears = c.earRound(46, 27.5, 6.2, HD, '#FFC4D9') +
             c.earRound(74, 27.5, 6.2, HD, '#FFC4D9');

    // balon yanaklar: silüete taşan tohum depoları
    b.head = c.blob(60, 44, 21, 19, HD, {}) +
             c.ball(45.5, 52, 7.6, HD, {}) +
             c.ball(74.5, 52, 7.6, HD, {}) +
             c.blob(45.5, 53.5, 4, 2.6, '#FFF1DC', { line: false, op: 0.7 }) +
             c.blob(74.5, 53.5, 4, 2.6, '#FFF1DC', { line: false, op: 0.7 }) +
             c.gloss(49.5, 34, 8, 4.4);

    b.face = c.eyes(60, 42, { dx: 8.2, r: 4.7 }) +
             c.cheeks(60, 52, 15, { rx: 3.6, ry: 2.4, op: 0.6 }) +
             c.mouth(60, 55, 'smile', { w: 6 });

    // yeri unutulan tohum
    b.seed = c.ball(27, 68, 3.6, '#E8A05E', { lw: 1.8 }) +
             c.caps(27, 64.8, 7, 3.4, '#8A5A30', { rx: 1.6, lw: 1.5 }) +
             c.sparkle(33, 60, 2.8, '#FFD76B', 0.85);
    return b;
  }

  Y.art.registerKind('sincap', {
    pufi: function (c) {
      var b = sincapBits(c);
      return b.tail + b.feet + b.body + b.acorn + b.paws + b.ears +
             b.head + b.face + b.seed;
    },
    parts: function (c) {
      var b = sincapBits(c);
      // aksesuar: kahraman boy palamut + kulaklar
      var bigAcorn = c.ball(60, 76, 10, c.vinyl('ac2', '#F2BE7E', '#C9853F'), {}) +
                     c.caps(60, 67.5, 19, 8, '#8A5A30', { rx: 3.6, lw: 2.2 }) +
                     c.line('M60 63.5 Q61 60.5 63.5 59.5', 2.4, c.sil ? c.SIL : '#6B4526') +
                     c.gloss(56, 73, 3.4, 2) +
                     c.sparkle(75, 62, 3.2, '#FFD76B', 0.9);
      return {
        govde: c.move(0, -9, b.tail + b.feet + b.body + b.paws),
        bas:   c.zoom(1.15, 60, 44, c.move(0, 12, b.head + b.face)),
        aksesuar: c.zoom(1.15, 60, 60,
          c.move(0, 12, b.ears) + c.move(0, 4, bigAcorn) + c.move(4, 10, b.seed))
      };
    }
  });

  /* =====================================================================
     8) UĞUR BÖCEĞİ — Boncuk: "Sırtındaki puanları sayarken uyuyakalır"
     Ayırt edici: puanlı, ortadan dikişli kırmızı elitra gövde,
     puanlı bere-kabuk, top uçlu düşük antenler; mahmur yarı kapalı
     bakış + uzaklaşıp sönen sayma pırıltıları.
     ===================================================================== */

  function ugurbocegiBits (c) {
    var SLT = '#FF9A8A', SDK = '#E8452E', SPOT = '#5C3226', SEAM = '#C43222';
    var b = {}, i;
    var SH = c.vinyl('sh', SLT, SDK);
    var HD = c.vinyl('hd', '#FFF6E4', '#F2C9A0');
    var BN = c.vinyl('bn', SLT, SDK);

    b.feet = c.caps(48, 99.5, 12.5, 8, '#B36B4A', {}) + c.caps(72, 99.5, 12.5, 8, '#B36B4A', {});

    var DOTS = [[48.5,71.5,3.1],[71.5,70,2.9],[44,84,2.7],[76,83.5,3],[52.5,91.5,2.4],[67.5,92.5,2.3]];
    var dots = '';
    for (i = 0; i < DOTS.length; i++) {
      dots += c.ball(DOTS[i][0], DOTS[i][1], DOTS[i][2], SPOT, { line: false, op: 0.95 });
    }
    b.body = c.blob(60, 81, 24.5, 20, SH, {}) +
             (c.sil ? '' : c.line('M60 62.5 L60 99', 2.2, SEAM, { op: 0.85 })) +
             dots +
             c.gloss(47.5, 68, 9, 5.2) +
             c.bounce(60, 96, 15.5, 4.4, '#FFD9CE', 0.2);

    b.head = c.ball(60, 43, 20.5, HD, {}) + c.gloss(52, 36.5, 6, 3.5);

    // puanlı bere-kabuk (elitranın minyatürü)
    b.bonnet = c.blob(60, 29.5, 15.5, 8, BN, {}) +
               (c.sil ? '' : c.line('M60 22.2 L60 37', 2, SEAM, { op: 0.85 })) +
               c.ball(52.5, 29, 1.9, SPOT, { line: false, op: 0.95 }) +
               c.ball(67.5, 29, 1.9, SPOT, { line: false, op: 0.95 });

    // mahmur düşük antenler
    b.ant = c.antenna('M50 23.5 Q43 19 38.5 21', '#7A4634', 37, 21.8, 2.6) +
            c.antenna('M70 23.5 Q77 19 81.5 21', '#7A4634', 83, 21.8, 2.6);

    // yarı kapalı mahmur gözler + tatlı gülümseme
    b.face = c.eyes(60, 42.5, { dx: 7.8, r: 4.6, ry: 3.1 }) +
             c.cheeks(60, 48.5, 13.4, {}) +
             c.mouth(60, 51.5, 'smile', { w: 7 });

    // sayarken sönen pırıltılar: bir... iki... üü...
    b.spark = c.sparkle(88, 58, 3, '#FFD9EC', 0.8) +
              c.sparkle(93, 48, 2.4, '#FFD9EC', 0.65) +
              c.dot(96, 40, 1.2, 0.55);
    return b;
  }

  Y.art.registerKind('ugurbocegi', {
    pufi: function (c) {
      var b = ugurbocegiBits(c);
      return b.feet + b.body + b.head + b.bonnet + b.ant + b.face + b.spark;
    },
    parts: function (c) {
      var b = ugurbocegiBits(c);
      // aksesuar: sayılası kocaman puan rozeti + antenler
      var badge = c.ball(60, 72, 8.5, '#5C3226', { lw: 2.2 }) +
                  c.dot(57, 69, 2.2, 0.85) +
                  c.sparkle(74, 60, 3.4, '#FFD9EC', 0.9);
      return {
        govde: c.move(0, -9, b.feet + b.body),
        bas:   c.zoom(1.2, 60, 43, c.move(0, 14, b.head + b.bonnet + b.face)),
        aksesuar: c.zoom(1.25, 60, 60,
          c.move(0, 26, b.ant) + badge + c.move(-34, 12, b.spark))
      };
    }
  });

  /* =====================================================================
     9) SOLUCAN — Kıvrık: "Toprak altı tünellerin haritasını çizer"
     Ayırt edici: kıvrım kıvrım sarmal gövde (bacak yok!), açık renk
     semer bandı + segment çizgileri, tepesinde tek kıvrık tutam;
     yanında rulo tünel haritası ve toprak tümsekleri.
     ===================================================================== */

  function solucanBits (c) {
    var LT = '#FFC2CE', DK = '#F2809C', DEEP = '#D9587C';
    var b = {};
    var HD = c.vinyl('hd', LT, DK);

    // sarmal gövde: içe kıvrılan tek şerit; beyaz parlama izi sarmalı okutur
    b.coil = c.rope('M60 62 Q82 62 85 74 Q88 86 70 90 Q52 93 46 83 Q42 74 51 71 Q60 69 61 77 Q61.5 83 55 84',
                    15, '#FF9EB4', { hi: true }) +
             // semer bandı (klitellum)
             (c.sil ? '' :
              c.line('M70.5 58.8 Q74.5 64 72 69.8', 4.5, '#FFDCE4', { op: 0.95 }) +
              c.line('M75 60.2 Q78.6 65.2 76.4 70.6', 2.2, '#FFDCE4', { op: 0.8 })) +
             // segment çizgileri
             (c.sil ? '' :
              c.line('M80.5 71.5 Q84.5 76 82.5 81', 1.8, DEEP, { op: 0.6 }) +
              c.line('M57 84.5 Q59.5 89 57.5 93.5', 1.8, DEEP, { op: 0.6 }) +
              c.line('M41.5 78.5 Q45.5 80.5 49.5 78.5', 1.8, DEEP, { op: 0.6 }));

    // toprak tümsekleri (tünel ağzı)
    b.soil = c.ball(31, 97, 3.2, '#C98A4E', { lw: 2 }) +
             c.ball(37, 99, 2.4, '#B77B3F', { lw: 1.8 }) +
             c.ball(88, 97.5, 2.8, '#C98A4E', { lw: 2 });

    b.head = c.ball(60, 42, 19.5, HD, {}) + c.gloss(51, 33, 7.5, 4.2);

    // tepe tutamı
    b.curl = c.antenna('M60 23.5 Q57.5 17.5 62.5 15', DK, 64, 15.4, 2.5);

    b.face = c.eyes(60, 41, { dx: 7.8, r: 4.7 }) +
             c.cheeks(60, 47.5, 13.2, {}) +
             c.mouth(60, 50.5, 'smile', { w: 7.5 });

    // rulo tünel haritası: kesik tünel izi + turuncu hedef yıldızı
    b.map = c.caps(31, 62, 15, 10.5, '#FFF9EA', { rot: -8, rx: 4 }) +
            c.caps(24.4, 61.2, 4, 12, '#F2E2C4', { rot: -8, rx: 2, lw: 2 }) +
            c.caps(37.6, 62.8, 4, 12, '#F2E2C4', { rot: -8, rx: 2, lw: 2 }) +
            (c.sil ? '' :
             c.line('M27 63.5 Q30.5 59 34 62', 1.6, '#B77B3F', { dash: '2 2.6', op: 0.9 }) +
             c.sparkle(34.6, 60.2, 2, '#FF7C33', 0.95));
    return b;
  }

  Y.art.registerKind('solucan', {
    pufi: function (c) {
      var b = solucanBits(c);
      return b.soil + b.coil + b.head + b.curl + b.face + b.map;
    },
    parts: function (c) {
      var b = solucanBits(c);
      return {
        govde: c.move(0, -10, b.soil + b.coil),
        bas:   c.zoom(1.2, 60, 42, c.move(0, 16, b.head + b.curl + b.face)),
        aksesuar: c.zoom(1.3, 60, 60,
          c.move(29, 0, b.map) +
          (c.sil ? '' : c.line('M40 84 Q52 76 60 84 Q68 92 80 84', 2.2, '#B77B3F',
                               { dash: '3 4', op: 0.85 })) +
          c.sparkle(32, 38, 3, '#FFC2CE', 0.85))
      };
    }
  });
})();
