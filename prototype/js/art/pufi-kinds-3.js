/* =====================================================================
   YUVO SANAT — pufi-kinds-3.js  (sahip: ressam-3)
   =====================================================================
   pufi-svg.js STİL KILAVUZUNA birebir uyar: şeker-vinil sticker dili,
   INK kontur (API basar), sol-üst ışık, c.* primitifleri. 8 kind kaydeder:
     Nadir   : arikralice(petek), horoz(ibik), midilli(yele),
               kirlangic(makas), tavuskusu(tavus), orumcek(ipekce)
     Destansı: gunesbuzagisi(bogac, ownAura), tarlakusu(safak, ownAura)
   Anatomi: kafa ~(60,44) r19-22, gövde ~(60,81), ayak bitişi y≈99-101.
   Tasarım kaynağı: plans/sharded-discovering-blum-agent-a460cc2c91851292e.md
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  if (!Y.art || typeof Y.art.registerKind !== 'function') return;

  /* altıgen path (petek deseni/asa başı) — merkez (cx,cy), yarıçap r */
  function hexPath (cx, cy, r) {
    var h = r * 0.866, s = 'M' + (cx + r) + ' ' + cy;
    s += ' L' + (cx + r / 2) + ' ' + (cy + h) + ' L' + (cx - r / 2) + ' ' + (cy + h);
    s += ' L' + (cx - r) + ' ' + cy + ' L' + (cx - r / 2) + ' ' + (cy - h);
    s += ' L' + (cx + r / 2) + ' ' + (cy - h) + ' Z';
    return s;
  }

  /* =========================== 1. ARI KRALİÇESİ (petek) =========================== */
  /* Petek — Nadir. Bal damlası uçlu altın taç, petek nişanı, sedef çift kanat, mini asa. */

  function arikraliceBits (c) {
    var LT = '#FFE9A8', DK = '#F2A400', BAND = '#7A4E20', WNG = '#EAF7FF', WNG2 = '#BFE3F2';
    var b = {};
    b.wings =
      c.leaf(30, 66, 9, 19, c.vinyl('w1', WNG, WNG2), { rot: -24, op: 0.9 }) +
      c.leaf(90, 66, 9, 19, c.vinyl('w2', WNG, WNG2), { rot: 24, op: 0.9 }) +
      c.leaf(33, 82, 6.5, 12, WNG, { rot: -48, op: 0.85 }) +
      c.leaf(87, 82, 6.5, 12, WNG, { rot: 48, op: 0.85 });
    b.feet = c.caps(50, 99.5, 12, 7.5, '#E8B95A', {}) + c.caps(70, 99.5, 12, 7.5, '#E8B95A', {});
    b.body =
      c.blob(60, 80, 23.5, 19.5, c.vinyl('bd', LT, DK), {}) +
      c.caps(60, 74.5, 40, 6.4, BAND, { line: false, op: 0.85, rx: 3.2 }) +
      c.caps(60, 86.5, 34, 6, BAND, { line: false, op: 0.85, rx: 3 }) +
      c.gloss(48, 68, 9, 5) +
      c.bounce(60, 95, 15, 4.4, '#FFF3C0', 0.22);
    b.badge =
      c.path(hexPath(60, 81, 6.2), '#FFD34D', { lw: c.LW2 }) +
      (c.sil ? '' : c.path(hexPath(60, 81, 3), '#FFB020', { line: false, op: 0.9 }) +
        c.dot(58.4, 78.6, 1.1, 0.8));
    b.head = c.ball(60, 44, 20.5, c.vinyl('hd', LT, DK), {}) + c.gloss(49.5, 34, 8, 4.6);
    b.crown =
      c.caps(60, 25.5, 21, 6.5, c.vinyl('cr', '#FFE07A', '#E8A400'), { rx: 3 }) +
      c.drop(52, 20, 2.7, 6.5, '#FFD34D', { lw: c.LW2 }) +
      c.drop(60, 18, 3.1, 8, '#FFDF66', { lw: c.LW2 }) +
      c.drop(68, 20, 2.7, 6.5, '#FFD34D', { lw: c.LW2 }) +
      (c.sil ? '' : c.ball(52, 16.6, 1.5, '#FFB020', { line: false }) +
        c.ball(60, 13.6, 1.7, '#FFB020', { line: false }) +
        c.ball(68, 16.6, 1.5, '#FFB020', { line: false }) +
        c.sparkle(70, 24, 3.4, '#FFFFFF', 0.9));
    b.antennae =
      c.antenna('M50 27 Q45 19 41 15', BAND, 40, 13.5, 2.6) +
      c.antenna('M70 27 Q75 19 79 15', BAND, 80, 13.5, 2.6);
    b.scepter =
      c.rope('M87 62 L92 84', 3.4, '#C98A00', { hi: true }) +
      c.path(hexPath(86, 56, 5), '#FFD34D', { lw: c.LW2 }) +
      (c.sil ? '' : c.sparkle(91, 51, 3.6, '#FFFFFF', 0.95));
    b.face = c.eyes(60, 44, { dx: 8.2, r: 4.7, spark: true }) +
             c.cheeks(60, 51, 13.8, {}) +
             c.mouth(60, 52.5, 'smile', { w: 8 });
    return b;
  }

  Y.art.registerKind('arikralice', {
    pufi: function (c) {
      var b = arikraliceBits(c);
      return b.wings + b.feet + b.body + b.badge + b.scepter + b.head + b.crown + b.antennae + b.face;
    },
    parts: function (c) {
      var b = arikraliceBits(c);
      return {
        govde: c.move(0, -8, b.feet + b.body + b.badge),
        bas:   c.zoom(1.2, 60, 44, c.move(0, 14, b.head + b.crown + b.antennae + b.face)),
        aksesuar: c.zoom(1.1, 60, 60, c.move(-6, 0, b.wings) + c.move(-16, -2, b.scepter))
      };
    }
  });

  /* =========================== 2. HOROZ (ibik) =========================== */
  /* İbik — Nadir. 3 loblu kırmızı ibik + gerdan, 3 renkli yelpaze kuyruk, şarkıcı gaga + nota. */

  function horozBits (c) {
    var LT = '#FFF6DC', DK = '#F0B24A', COMB = '#FF5A4E', COMB2 = '#E03A30', FT = '#F5A623';
    var b = {};
    b.tail =
      c.rope('M76 82 Q102 66 94 40', 5.2, '#55B944', { hi: true }) +
      c.rope('M78 85 Q108 76 104 52', 5.2, '#3FA9DE', { hi: true }) +
      c.rope('M78 89 Q106 88 108 68', 5, '#FF7C33', { hi: true });
    b.feet = c.caps(49, 99.5, 12.5, 7.5, FT, {}) + c.caps(70, 99.5, 12.5, 7.5, FT, {});
    b.body =
      c.blob(58, 80, 24, 20.5, c.vinyl('bd', LT, DK), {}) +
      c.blob(51, 76, 11, 13, '#FFFBEE', { line: false, op: 0.85 }) +
      c.gloss(46, 66.5, 9, 5.2) +
      c.bounce(58, 96, 15, 4.4, '#FFF3D6', 0.2);
    b.wing = c.drop(80, 78, 6.6, 14, c.vinyl('wg', '#FFE9B8', DK), { rot: 150 });
    b.head = c.ball(60, 42, 20, c.vinyl('hd', LT, DK), {}) + c.gloss(50, 32, 7.8, 4.4);
    b.comb =
      c.drop(51, 25, 3.4, 9, c.vinyl('c1', '#FF7A6E', COMB2), { rot: -18 }) +
      c.drop(60, 21.5, 4, 11, c.vinyl('c2', COMB, COMB2), {}) +
      c.drop(69, 25, 3.4, 9, c.vinyl('c3', '#FF7A6E', COMB2), { rot: 18 });
    b.wattle =
      c.drop(56.5, 60.5, 2.6, 6, COMB, { rot: 178, lw: c.LW2 }) +
      c.drop(63.5, 60.5, 2.6, 6, COMB2, { rot: 182, lw: c.LW2 });
    b.beak = c.beak(60, 51.5, 9.5, FT, { open: true, dk: '#E8842B' });
    b.note = c.sil ? '' :
      c.line('M92 30 L92 19 Q96 16.5 98 19.5', 2.4, c.ink()) +
      c.ball(90.2, 30.5, 2.5, c.ink(), { line: false }) +
      c.sparkle(101, 26, 3, '#FFC734', 0.9);
    b.face = c.eyes(60, 41.5, { dx: 8.2, r: 4.7 }) + c.cheeks(60, 48.5, 14, {});
    return b;
  }

  Y.art.registerKind('horoz', {
    pufi: function (c) {
      var b = horozBits(c);
      return b.tail + b.feet + b.body + b.wing + b.head + b.comb + b.wattle + b.beak + b.note + b.face;
    },
    parts: function (c) {
      var b = horozBits(c);
      return {
        govde: c.move(0, -8, b.feet + b.body + b.wing),
        bas:   c.zoom(1.2, 60, 42, c.move(0, 15, b.head + b.comb + b.wattle + b.beak + b.face)),
        aksesuar: c.zoom(1.05, 60, 60, c.move(-22, -2, b.tail) + c.move(-24, 14, b.note))
      };
    }
  });

  /* =========================== 3. MİDİLLİ (yele) =========================== */
  /* Yele — Nadir. Alından sırta akan iki tonlu yele + altın toz, burunlu yüz, püsküllü kuyruk. */

  function midilliBits (c) {
    var LT = '#FFDFA8', DK = '#E8963C', M1 = '#FF8FB0', M2 = '#F26D96', GLD = '#FFC734';
    var b = {};
    b.tail =
      c.rope('M84 80 Q98 86 96 96', 5, M1, { hi: true }) +
      c.drop(96, 101, 4.6, 9, c.vinyl('tt', M1, M2), { rot: 174 });
    b.legs =
      c.caps(46, 96, 10.5, 12, c.vinyl('l1', LT, DK), { rx: 5 }) +
      c.caps(74, 96, 10.5, 12, c.vinyl('l2', LT, DK), { rx: 5 }) +
      c.caps(46, 100.6, 11, 5.4, '#8A5A2B', { rx: 2.6 }) +
      c.caps(74, 100.6, 11, 5.4, '#8A5A2B', { rx: 2.6 });
    b.body =
      c.blob(60, 80, 25.5, 17.5, c.vinyl('bd', LT, DK), {}) +
      c.gloss(48, 69, 9.5, 5) +
      c.bounce(60, 93.5, 16, 4.2, '#FFEFD0', 0.22);
    b.ears =
      c.leaf(46, 25.5, 4.2, 8, c.vinyl('e1', LT, DK), { rot: -14 }) +
      c.leaf(70, 25.5, 4.2, 8, c.vinyl('e2', LT, DK), { rot: 14 });
    b.head = c.ball(58, 42, 19.5, c.vinyl('hd', LT, DK), {}) + c.gloss(48.5, 32.5, 7.6, 4.4);
    b.muzzle =
      c.blob(58, 52.5, 12, 8.2, '#FFF1DC', { lw: c.LW2 }) +
      (c.sil ? '' : c.ball(53.6, 52, 1.35, c.INK, { line: false }) +
        c.ball(62.4, 52, 1.35, c.INK, { line: false })) +
      c.mouth(58, 56.2, 'smile', { w: 7, force: true });
    b.mane =
      c.drop(47, 26, 3.6, 10, c.vinyl('m1', M1, M2), { rot: -34 }) +
      c.drop(56, 21.5, 4, 11.5, c.vinyl('m2', '#FFA9C4', M2), { rot: -6 }) +
      c.drop(66, 24, 3.8, 10.5, GLD, { rot: 24, lw: c.LW2 }) +
      c.drop(74, 31, 3.5, 10, c.vinyl('m3', M1, M2), { rot: 55 }) +
      c.drop(79, 42, 3.3, 9.5, c.vinyl('m4', '#FFA9C4', M2), { rot: 84 }) +
      c.drop(80, 55, 3.1, 9, GLD, { rot: 104, lw: c.LW2 });
    b.dust = c.sil ? '' :
      c.sparkle(38, 34, 3.4, GLD, 0.95) + c.sparkle(86, 38, 2.8, GLD, 0.9) +
      c.sparkle(88, 66, 2.6, '#FFFFFF', 0.85) + c.dot(43, 44, 1.3, 0.8);
    b.face = c.eyes(58, 41, { dx: 7.4, r: 4.5, spark: true }) + c.cheeks(58, 48, 13, {});
    return b;
  }

  Y.art.registerKind('midilli', {
    pufi: function (c) {
      var b = midilliBits(c);
      return b.tail + b.legs + b.body + b.head + b.ears + b.mane + b.muzzle + b.face + b.dust;
    },
    parts: function (c) {
      var b = midilliBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.legs + b.body),
        bas:   c.zoom(1.18, 58, 42, c.move(1, 15, b.head + b.ears + b.muzzle + b.face)),
        aksesuar: c.zoom(1.12, 60, 46, c.move(0, 16, b.mane)) + b.dust
      };
    }
  });

  /* =========================== 4. KIRLANGIÇ (makas) =========================== */
  /* Makas — Nadir. Derin çatallı makas kuyruk, lacivert sırt/krem karın, kızıl gerdan,
     orak kanatlar; yanında ikiye böldüğü bulutçuk. */

  function kirlangicBits (c) {
    var NV = '#3E63B8', NV2 = '#25407E', CRM = '#FFF6E6', RED = '#FF6B4A';
    var b = {};
    b.tail =
      c.drop(70, 99, 3.2, 17, c.vinyl('t1', NV, NV2), { rot: 152 }) +
      c.drop(80, 95, 3.2, 17, c.vinyl('t2', NV, NV2), { rot: 128 });
    b.feet = c.caps(52, 98.5, 9, 6, '#F5A623', {}) + c.caps(68, 98.5, 9, 6, '#F5A623', {});
    b.body =
      c.blob(58, 78, 22, 19, c.vinyl('bd', NV, NV2), {}) +
      c.blob(55, 84, 13.5, 11.5, CRM, { line: false, op: 0.96 }) +
      c.gloss(47, 65.5, 8.6, 4.8) +
      c.bounce(58, 93.5, 14, 4, '#DDE8FF', 0.18);
    b.wings =
      c.drop(34, 74, 5.6, 17, c.vinyl('w1', '#5A80D0', NV2), { rot: -136 }) +
      c.drop(85, 72, 5.6, 17, c.vinyl('w2', '#5A80D0', NV2), { rot: 136 });
    b.head = c.ball(60, 42, 19.5, c.vinyl('hd', NV, NV2), {}) + c.gloss(50, 32.5, 7.6, 4.4);
    b.facePatch =
      c.blob(60, 46, 12.5, 9.5, CRM, { line: false, op: 0.96 }) +
      c.blob(60, 54.5, 7.5, 5, RED, { line: false, op: 0.92 });
    b.beak = c.beak(60, 50, 7, '#F5A623', { dk: '#E8842B' });
    b.cloud = c.sil ? '' :
      c.blob(89, 30, 7.5, 5, '#FFFFFF', { line: false, op: 0.95 }) +
      c.blob(103, 30, 6, 4.4, '#FFFFFF', { line: false, op: 0.95 }) +
      c.line('M96 24 L96 37', 2.2, '#8AD9F7', { op: 0.9 }) +
      c.sparkle(96, 20.5, 2.6, '#8AD9F7', 0.9);
    b.face = c.eyes(60, 42.5, { dx: 7.8, r: 4.5 }) + c.cheeks(60, 49.5, 13.4, { op: 0.45 });
    return b;
  }

  Y.art.registerKind('kirlangic', {
    pufi: function (c) {
      var b = kirlangicBits(c);
      return b.tail + b.feet + b.body + b.wings + b.head + b.facePatch + b.beak + b.cloud + b.face;
    },
    parts: function (c) {
      var b = kirlangicBits(c);
      return {
        govde: c.move(0, -6, b.feet + b.body + b.wings),
        bas:   c.zoom(1.22, 60, 43, c.move(0, 14, b.head + b.facePatch + b.beak + b.face)),
        aksesuar: c.zoom(1.1, 60, 60, c.move(-8, -18, b.tail) + c.move(-26, 34, b.cloud))
      };
    }
  });

  /* =========================== 5. TAVUS KUŞU (tavus) =========================== */
  /* Tavus — Nadir. Göz benekli (ocelli) dev yelpaze kuyruk, 3 toplu sorguç, turkuaz gövde. */

  function tavusBits (c) {
    var TQ = '#57D6C9', TQ2 = '#1FA396', F1 = '#4FC98F', F2 = '#3FA9DE';
    var b = {};
    var fan = '', i, ang, col;
    for (i = -3; i <= 3; i++) {
      ang = i * 21;
      col = (i % 2 === 0) ? F1 : F2;
      fan += c.spin(ang, 60, 72,
        c.leaf(60, 38, 7, 21, c.vinyl('f' + (i + 3), col, '#2A6F60'), {}) +
        (c.sil ? '' :
          c.ball(60, 26, 3.6, '#FFC734', { lw: c.LW2 }) +
          c.ball(60, 26, 1.9, '#2A6FB0', { line: false }) +
          c.dot(59.2, 25, 0.8, 0.9)));
    }
    b.fan = fan;
    b.feet = c.caps(51, 99.5, 11, 7, '#F5A623', {}) + c.caps(69, 99.5, 11, 7, '#F5A623', {});
    b.body =
      c.blob(60, 82, 19.5, 16.5, c.vinyl('bd', TQ, TQ2), {}) +
      c.gloss(50, 72, 8, 4.6) +
      c.bounce(60, 95, 12.5, 3.8, '#CFF5EF', 0.2);
    b.head = c.ball(60, 47, 17, c.vinyl('hd', TQ, TQ2), {}) + c.gloss(51.5, 39, 6.6, 3.8);
    b.crest =
      c.antenna('M53 32 Q51 25 48 21', TQ2, 47.5, 19.5, 2.5) +
      c.antenna('M60 30 Q60 23 60 19', TQ2, 60, 17, 2.7) +
      c.antenna('M67 32 Q69 25 72 21', TQ2, 72.5, 19.5, 2.5);
    b.beak = c.beak(60, 54, 6.5, '#F5A623', { dk: '#E8842B' });
    b.face = c.eyes(60, 46.5, { dx: 6.8, r: 4.3, spark: true }) +
             c.cheeks(60, 53, 12, { op: 0.8, rx: 4.8, ry: 3 });
    return b;
  }

  Y.art.registerKind('tavuskusu', {
    pufi: function (c) {
      var b = tavusBits(c);
      return b.fan + b.feet + b.body + b.head + b.crest + b.beak + b.face;
    },
    parts: function (c) {
      var b = tavusBits(c);
      return {
        govde: c.move(0, -6, b.feet + b.body),
        bas:   c.zoom(1.25, 60, 47, c.move(0, 12, b.head + b.crest + b.beak + b.face)),
        aksesuar: c.zoom(0.86, 60, 60, c.move(0, 16, b.fan)) +
                  (c.sil ? '' : c.sparkle(22, 30, 3.4, '#FFC734', 0.9) +
                    c.sparkle(98, 32, 3, '#FFFFFF', 0.85))
      };
    }
  });

  /* =========================== 6. ÖRÜMCEK (orumcek) =========================== */
  /* İpekçe — Nadir. Yanlarda 3'er tıknaz bacak, sırtta ipek makarası, tepeden inen iplik,
     çiy damlalı dantel ağ parçası; nazik terzi ('o' ağız). */

  function orumcekBits (c) {
    var LL = '#C9A6E8', LL2 = '#8F5FC0', SILK = '#F4EFFF';
    var b = {};
    b.thread = c.rope('M60 5 L60 24', 2, SILK, {});
    b.legs =
      c.caps(38, 76, 13, 6.6, c.vinyl('g1', LL, LL2), { rot: -22, rx: 3.3 }) +
      c.caps(36, 85, 13.5, 6.6, c.vinyl('g2', LL, LL2), { rx: 3.3 }) +
      c.caps(38, 94, 13, 6.6, c.vinyl('g3', LL, LL2), { rot: 22, rx: 3.3 }) +
      c.caps(82, 76, 13, 6.6, c.vinyl('g4', LL, LL2), { rot: 22, rx: 3.3 }) +
      c.caps(84, 85, 13.5, 6.6, c.vinyl('g5', LL, LL2), { rx: 3.3 }) +
      c.caps(82, 94, 13, 6.6, c.vinyl('g6', LL, LL2), { rot: -22, rx: 3.3 });
    b.spool =
      c.caps(78, 68, 9.5, 13, SILK, { rx: 4.5 }) +
      (c.sil ? '' :
        c.line('M73.5 64 L82.5 64', 1.6, '#C9B8E8', { op: 0.9 }) +
        c.line('M73.5 68 L82.5 68', 1.6, '#C9B8E8', { op: 0.9 }) +
        c.line('M73.5 72 L82.5 72', 1.6, '#C9B8E8', { op: 0.9 }));
    b.body =
      c.blob(60, 83, 19.5, 15.5, c.vinyl('bd', LL, LL2), {}) +
      c.blob(60, 88, 10.5, 7, '#EBDBFA', { line: false, op: 0.9 }) +
      c.gloss(50, 74, 8, 4.4) +
      c.bounce(60, 94.5, 12.5, 3.8, '#EBDDF8', 0.2);
    b.head = c.ball(60, 47, 18.5, c.vinyl('hd', LL, LL2), {}) + c.gloss(51, 38.5, 7, 4);
    b.web = c.sil ? '' :
      c.line('M88 28 Q98 30 104 38', 1.8, SILK, { op: 0.85 }) +
      c.line('M90 22 Q102 26 108 36', 1.8, SILK, { op: 0.7 }) +
      c.line('M92 34 L103 30', 1.6, SILK, { op: 0.75 }) +
      c.dot(97, 27, 1.5, 0.9) + c.dot(104, 34, 1.3, 0.85) +
      c.sparkle(108, 26, 2.6, '#FFFFFF', 0.85);
    b.face = c.eyes(60, 46, { dx: 7.2, r: 4.4 }) +
             c.cheeks(60, 53, 12.4, {}) +
             c.mouth(60, 54.5, 'o', {});
    return b;
  }

  Y.art.registerKind('orumcek', {
    pufi: function (c) {
      var b = orumcekBits(c);
      return b.thread + b.legs + b.spool + b.body + b.head + b.web + b.face;
    },
    parts: function (c) {
      var b = orumcekBits(c);
      return {
        govde: c.move(0, -6, b.legs + b.spool + b.body),
        bas:   c.zoom(1.24, 60, 47, c.move(0, 12, b.head + b.face)),
        aksesuar: c.zoom(1.1, 60, 50, c.move(0, 26, b.thread)) + c.move(-14, 18, b.web)
      };
    }
  });

  /* ======================= 7. GÜNEŞ BUZAĞISI (gunesbuzagisi) ======================= */
  /* Boğaç — DESTANSI (ownAura). Işın saçan altın boynuzlar, göz üstü alev yaması,
     güneş nişanlı göğüs, şeftali burun; kendi şafak ışıması + bol ışıltı. */

  function bogacBits (c) {
    var LT = '#FFD9A0', DK = '#E8963C', GLD = '#FFD34D', GLD2 = '#C98A00';
    var b = {};
    b.tail =
      c.rope('M84 82 Q96 88 94 97', 4.6, LT, { hi: true }) +
      c.drop(94, 102, 4, 8, c.vinyl('tt', '#FFB25E', DK), { rot: 176 });
    b.legs =
      c.caps(47, 96.5, 11, 11, c.vinyl('l1', LT, DK), { rx: 5 }) +
      c.caps(73, 96.5, 11, 11, c.vinyl('l2', LT, DK), { rx: 5 }) +
      c.caps(47, 100.8, 11.5, 5, '#8A5A2B', { rx: 2.4 }) +
      c.caps(73, 100.8, 11.5, 5, '#8A5A2B', { rx: 2.4 });
    b.body =
      c.blob(60, 81, 26, 18.5, c.vinyl('bd', LT, DK), {}) +
      c.gloss(47.5, 70, 9.6, 5.2) +
      c.bounce(60, 94.5, 16, 4.4, '#FFE9C0', 0.22);
    b.badge = c.sil ? '' :
      c.ball(60, 86, 5.6, GLD, { lw: c.LW2 }) +
      c.line('M60 77.6 L60 74.6', 2, GLD2) + c.line('M60 94.4 L60 97.4', 2, GLD2) +
      c.line('M51.6 86 L48.6 86', 2, GLD2) + c.line('M68.4 86 L71.4 86', 2, GLD2) +
      c.line('M54 80 L52 78', 2, GLD2) + c.line('M66 80 L68 78', 2, GLD2) +
      c.line('M54 92 L52 94', 2, GLD2) + c.line('M66 92 L68 94', 2, GLD2) +
      c.dot(58.2, 84, 1.2, 0.85);
    b.ears =
      c.leaf(41, 33, 5, 8.5, c.vinyl('e1', LT, DK), { rot: -62 }) +
      c.leaf(79, 33, 5, 8.5, c.vinyl('e2', LT, DK), { rot: 62 });
    b.head = c.ball(60, 43, 21, c.vinyl('hd', LT, DK), {}) + c.gloss(49, 33, 8.2, 4.6);
    b.patch = c.drop(50, 30, 3.8, 8.5, c.vinyl('fp', '#FFA94D', '#E85C1E'), { rot: -14 });
    b.horns =
      c.rope('M46 29 Q39 19 43 10', 4.8, GLD, { hi: true }) +
      c.rope('M74 29 Q81 19 77 10', 4.8, GLD, { hi: true }) +
      (c.sil ? '' :
        c.ball(43, 9, 3, '#FFF3B8', { lw: c.LW2 }) +
        c.ball(77, 9, 3, '#FFF3B8', { lw: c.LW2 }) +
        c.line('M39 6 L36 3', 2, GLD) + c.line('M46 4.5 L45.5 1', 2, GLD) +
        c.line('M81 6 L84 3', 2, GLD) + c.line('M74 4.5 L74.5 1', 2, GLD));
    b.muzzle =
      c.blob(60, 53, 12.5, 8.5, c.vinyl('mz', '#FFC9A4', '#F08A54'), { lw: c.LW2 }) +
      (c.sil ? '' : c.ball(55.6, 52, 1.5, c.INK, { line: false }) +
        c.ball(64.4, 52, 1.5, c.INK, { line: false })) +
      c.mouth(60, 57, 'smile', { w: 7.5, force: true });
    b.glitter = c.sil ? '' :
      c.sparkle(30, 26, 3.8, GLD, 0.95) + c.sparkle(92, 30, 3.2, '#FFFFFF', 0.9) +
      c.sparkle(26, 62, 2.8, GLD, 0.85) + c.sparkle(95, 70, 2.6, GLD, 0.8) +
      c.dot(36, 46, 1.4, 0.85);
    b.face = c.eyes(60, 41.5, { dx: 8.4, r: 4.9, spark: true }) + c.cheeks(60, 48.5, 14.4, {});
    return b;
  }

  Y.art.registerKind('gunesbuzagisi', {
    ownAura: true,
    pufi: function (c) {
      var b = bogacBits(c);
      return c.aura('#FFB63C', 56, 55, 0.42) +
             b.tail + b.legs + b.body + b.badge + b.head + b.ears + b.patch +
             b.horns + b.muzzle + b.face + b.glitter;
    },
    parts: function (c) {
      var b = bogacBits(c);
      return {
        govde: c.move(0, -8, b.tail + b.legs + b.body + b.badge),
        bas:   c.zoom(1.14, 60, 40, c.move(0, 17, b.head + b.ears + b.patch + b.muzzle + b.face)),
        aksesuar: c.zoom(1.18, 60, 30, c.move(0, 34, b.horns)) + b.glitter
      };
    }
  });

  /* =========================== 8. TARLA KUŞU (tarlakusu) =========================== */
  /* Şafak — DESTANSI (ownAura). Geriye yatık altın perçem, gün doğumu gradyanlı göğüs,
     çentikli uzun kuyruk; şarkı: açık gaga + süzülen nota + güneş yayı; yıldız tozu. */

  function safakBits (c) {
    var BR = '#D9A05C', BR2 = '#A86A32', GLD = '#FFD34D', GLD2 = '#E8A400';
    var b = {};
    b.tail =
      c.drop(43, 97, 3.4, 15, c.vinyl('t1', BR, BR2), { rot: -148 }) +
      c.drop(37, 92, 3, 13, c.vinyl('t2', '#E8B87A', BR2), { rot: -128 });
    b.feet = c.caps(53, 99, 9.5, 6.5, '#F5A623', {}) + c.caps(69, 99, 9.5, 6.5, '#F5A623', {});
    b.body =
      c.blob(60, 79, 20.5, 18.5, c.vinyl('bd', BR, BR2), {}) +
      c.blob(57, 83, 12.5, 12,
        c.lin('ch', [[0, '#FFE9A8'], [0.55, '#FFC06B'], [1, '#FF9A5C']], 0, 0, 0, 1),
        { line: false, op: 0.97 }) +
      c.gloss(49, 66.5, 8.4, 4.8) +
      c.bounce(60, 94, 13, 4, '#FFE9C4', 0.2);
    b.wing = c.drop(80, 76, 5.8, 14, c.vinyl('wg', '#E8B87A', BR2), { rot: 145 });
    b.head = c.ball(61, 42, 19.5, c.vinyl('hd', BR, BR2), {}) + c.gloss(51.5, 32.5, 7.6, 4.4);
    b.chestHead = c.blob(61, 47.5, 11.5, 8, '#FFF1CE', { line: false, op: 0.95 });
    b.crest =
      c.drop(69, 26, 3.4, 10, c.vinyl('c1', GLD, GLD2), { rot: 128 }) +
      c.drop(74, 30.5, 3, 9, c.vinyl('c2', '#FFE07A', GLD2), { rot: 112 }) +
      c.drop(64, 24, 3, 8.5, c.vinyl('c3', '#FFE07A', GLD2), { rot: 144 });
    b.beak = c.beak(61, 50.5, 8, '#F5A623', { open: true, dk: '#E8842B' });
    b.song = c.sil ? '' :
      c.line('M90 26 L90 16 Q94 13.5 96 16.5', 2.4, c.ink()) +
      c.ball(88.2, 26.5, 2.4, c.ink(), { line: false }) +
      c.line('M83 38 A11 11 0 0 1 105 38', 3, GLD, { op: 0.95 }) +
      c.line('M87 33 L84.6 30.4', 2, GLD) + c.line('M94 31 L94 27.6', 2, GLD) +
      c.line('M101 33 L103.4 30.4', 2, GLD);
    b.dust = c.sil ? '' :
      c.sparkle(28, 30, 3.4, GLD, 0.95) + c.sparkle(24, 58, 2.8, '#FFFFFF', 0.9) +
      c.sparkle(104, 58, 2.8, GLD, 0.85) + c.dot(34, 44, 1.3, 0.85) + c.dot(99, 47, 1.2, 0.8);
    b.face = c.eyes(61, 41, { dx: 7.6, r: 4.6, spark: true }) + c.cheeks(61, 47.5, 13, {});
    return b;
  }

  Y.art.registerKind('tarlakusu', {
    ownAura: true,
    pufi: function (c) {
      var b = safakBits(c);
      return c.aura('#FFC145', 55, 53, 0.4) +
             b.tail + b.feet + b.body + b.wing + b.head + b.chestHead + b.crest +
             b.beak + b.song + b.face + b.dust;
    },
    parts: function (c) {
      var b = safakBits(c);
      return {
        govde: c.move(0, -6, b.tail + b.feet + b.body + b.wing),
        bas:   c.zoom(1.2, 61, 42, c.move(0, 14, b.head + b.chestHead + b.crest + b.beak + b.face)),
        aksesuar: c.zoom(1.08, 60, 60, c.move(-24, 16, b.song)) + b.dust
      };
    }
  });
})();
