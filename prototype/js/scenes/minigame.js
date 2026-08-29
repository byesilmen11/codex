/* Yuvo — Sahne: Eşle & Bul mini oyunu (6 kart, 3 çift; süre yok, kaybetme yok).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md — buildDeck/onCardTap/finish/start
   akışı DEĞİŞMEDİ, yalnız markup stringleri.
   Görsel dil: BRAND.md §5 — kart sırtı markalı (şeker gradyan + beyaz Yuvo yumurta
   amblemi + %5 benek), eşleşme çayır-yeşili onay parıltısı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;
  var timers = [];
  var deck = [];        // [{ fid, svg, open, matched }]
  var flippedIdx = [];  // açık bekleyen kart indeksleri (en çok 2)
  var matchedPairs = 0;
  var attempts = 0;     // çift deneme sayısı
  var lock = false;
  var finished = false;
  // Çıt Çıt Köşesi (P6 — ASMR sakinleşme modu): ödülsüz sonsuz kabuk çıtlatma
  var mode = 'match';   // 'match' | 'citcit'
  var citCrack = 0;     // 0-3 (3'te ışık sızar, sonra taze yumurta)
  var citRarity = 'yaygin';
  var CIT_RARITIES = ['yaygin', 'azbulunur', 'nadir', 'destansi', 'efsanevi'];

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n); } catch (e) {} }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  // Yuvo.icons güvenli erişim (main.js ico() deseni): ikon yoksa emoji fallback
  function ico (name, fb) {
    try {
      if (Yuvo.icons && Yuvo.icons[name]) { var s = Yuvo.icons[name](); if (s) return s; }
    } catch (e) {}
    return '<span class="ico-fallback">' + fb + '</span>';
  }
  function ic (name, fb, cls) {
    return '<span class="ys-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
           ico(name, fb) + '</span>';
  }

  // Dolu yıldız = marka ikonu; boş yıldız = düz dolgulu soluk yıldız (id'siz)
  function starPipSVG (on) {
    if (on) return ico('star', '⭐');
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M14 3.4L17.5 10.2L25 11.4L19.6 16.8L20.8 24.4L14 20.9L7.2 24.4' +
        'L8.4 16.8L3 11.4L10.5 10.2Z" fill="#FFF3D6" stroke="#3E2A1C" stroke-width="2"' +
        ' stroke-linejoin="round" opacity=".5"/>' +
    '</svg>';
  }

  // Düz dolgulu mini çiçek (id'siz) — başlık arması
  function bloomSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<g stroke="#3E2A1C" stroke-width="1.8" stroke-linejoin="round">' +
        '<circle cx="14" cy="6.6" r="4" fill="#FF8FB0"/>' +
        '<circle cx="21" cy="11.8" r="4" fill="#FF8FB0"/>' +
        '<circle cx="18.4" cy="20" r="4" fill="#FF8FB0"/>' +
        '<circle cx="9.6" cy="20" r="4" fill="#FF8FB0"/>' +
        '<circle cx="7" cy="11.8" r="4" fill="#FF8FB0"/>' +
        '<circle cx="14" cy="13.8" r="4.4" fill="#FFC734"/>' +
      '</g>' +
      '<ellipse cx="12.4" cy="12.2" rx="1.5" ry="1" fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Düz dolgulu mini ay (id'siz) — "Pufiler dinleniyor" notu
  function moonSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M18.6 3.9a11 11 0 1 0 5.6 16.6 9.1 9.1 0 0 1-5.6-16.6Z" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<ellipse cx="11.6" cy="9" rx="2.1" ry="1.3" transform="rotate(-22 11.6 9)"' +
        ' fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Düz dolgulu döngü-ok (id'siz) — "Tekrar" butonu (turuncu zeminde beyaz glif)
  function replaySVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M14 5.2a8.8 8.8 0 1 1-8.3 5.9" fill="none" stroke="#FFFFFF"' +
        ' stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M5 4.2l.5 7 6.8-1Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.4"' +
        ' stroke-linejoin="round"/>' +
    '</svg>';
  }

  // Kart sırtı amblemi: çatlak çizgili beyaz Yuvo yumurtası (id'siz düz dolgu)
  function emblemSVG () {
    return '<svg class="mg-emblem" viewBox="0 0 96 108" aria-hidden="true" focusable="false">' +
      '<path d="M48 6C29.4 6 15 27.6 15 50.4 15 71 28.9 86 48 86s33-15 33-35.6' +
        'C81 27.6 66.6 6 48 6Z" fill="#FFFFFF" stroke="#3E2A1C" stroke-width="4"' +
        ' stroke-linejoin="round" opacity=".97"/>' +
      '<path d="M27 46l6.8 5.6 6.5-6.2 6.8 5.9 6.5-5.6 6.8 5.4 7-4.8" fill="none"' +
        ' stroke="#E85C1E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="35" cy="24" rx="7" ry="10" transform="rotate(-20 35 24)"' +
        ' fill="#FFEBD0" opacity=".9"/>' +
      '<ellipse cx="48" cy="78" rx="16" ry="4" fill="#FFE3C2" opacity=".8"/>' +
    '</svg>';
  }

  function shuffle (a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pufiFace (p) {
    if (Yuvo.art && Yuvo.art.pufiSVG) {
      try { var s = Yuvo.art.pufiSVG(p, { mood:'happy' }); if (s) return s; } catch (e) {}
    }
    return '<span class="mg-art-fallback">🐣</span>';
  }
  function eggFace (r) {
    if (Yuvo.art && Yuvo.art.eggSVG) {
      try { var s = Yuvo.art.eggSVG(r, { crack:0 }); if (s) return s; } catch (e) {}
    }
    return '<span class="mg-art-fallback">🥚</span>';
  }

  /* ---------- deste kurulumu ---------- */
  function buildDeck () {
    var s = st(), owned = s.owned || {}, ids = [];
    for (var id in owned) { if (owned[id]) ids.push(id); }
    shuffle(ids);

    var faces = [];
    for (var i = 0; i < ids.length && faces.length < 3; i++) {
      var p = Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(ids[i]);
      if (p) faces.push({ fid:'pufi-' + p.id, gen:(function (pp) { return function () { return pufiFace(pp); }; })(p) });
    }
    // Sahip olunan Pufi azsa: yumurta desenleriyle tamamla
    var eggR = shuffle(['nadir', 'destansi', 'azbulunur', 'efsanevi', 'yaygin']);
    var k = 0;
    while (faces.length < 3 && k < eggR.length) {
      faces.push({ fid:'egg-' + eggR[k], gen:(function (rr) { return function () { return eggFace(rr); }; })(eggR[k]) });
      k += 1;
    }

    deck = [];
    for (var f = 0; f < faces.length; f++) {
      // Çiftin her kartı için sanat AYRI üretilir — SEQ sayacı yeni gradient id verir
      // (aynı svg stringini iki kez basmak belgede yinelenen id üretiyordu)
      deck.push({ fid:faces[f].fid, svg:faces[f].gen(), open:false, matched:false });
      deck.push({ fid:faces[f].fid, svg:faces[f].gen(), open:false, matched:false });
    }
    shuffle(deck);
  }

  /* ---------- çizim ---------- */
  function eggFace2 (r, crack) {
    if (Yuvo.art && Yuvo.art.eggSVG) {
      try { var s = Yuvo.art.eggSVG(r, { crack: crack | 0 }); if (s) return s; } catch (e) {}
    }
    return '<span class="mg-art-fallback">🥚</span>';
  }

  // Çıt Çıt Köşesi: sayaç yok, ödül yok, kaybetme yok — yalnız çıtlatma dokusu
  // (araştırma: ASMR/pop-it döngüsü kendi başına sakinleştirici bir değerdir)
  function renderCitcit () {
    var html = '';
    html += '<div class="mg-head center">' +
              '<h2 class="mg-title">🎵 Çıt Çıt Köşesi</h2>' +
              '<p class="mg-sub">Ödül yok, acele yok — sadece çıt çıt keyfi.</p>' +
            '</div>';
    html += '<div class="mg-citcit center">' +
              '<button class="mg-cc-egg c' + citCrack + '" data-mg="crack"' +
                ' aria-label="Yumurtayı çıtlat">' + eggFace2(citRarity, citCrack) + '</button>' +
              '<p class="mg-cc-hint">' +
                (citCrack === 0 ? 'Dokun — çıt!' : citCrack < 3 ? 'Çıt çıt…' : 'Işık sızıyor!') +
              '</p>' +
              '<button class="btn btn-soft" data-mg="match">↩ Eşini Bul’a dön</button>' +
            '</div>';
    el.innerHTML = html;
  }

  function render () {
    if (!el) return;
    if (mode === 'citcit') { renderCitcit(); return; }
    var s = st();
    var plays = Math.min(5, s.rewardedPlaysToday | 0);
    var left = 5 - plays;
    // Kalan ödüllü hak: dolu/boş mini yıldız SVG dizisi (okuma öncesi yaş)
    var hak = '';
    for (var h = 0; h < 5; h++) {
      hak += '<span class="ys-ico">' + starPipSVG(h < left) + '</span>';
    }
    var html = '';
    html += '<div class="mg-head center">' +
              '<h2 class="mg-title"><span class="ys-ico mg-title-ico" aria-hidden="true">' +
                bloomSVG() + '</span>Eşini Bul</h2>' +
              '<p class="mg-sub">Aynı iki dostu bul!</p>' +
              '<div class="mg-lives" aria-label="Bugün ödüllü oyun hakkı: ' + left + '/5">' +
                hak + '</div>' +
              '<button class="mg-citcit-btn" data-mg="citcit">🎵 Çıt Çıt Köşesi</button>' +
            '</div>';
    html += '<div class="mg-board"><div class="mg-grid">';
    for (var i = 0; i < deck.length; i++) {
      var c = deck[i];
      html += '<button class="mg-card' + (c.open || c.matched ? ' flipped' : '') +
                (c.matched ? ' matched' : '') + '" data-idx="' + i + '" aria-label="Kart ' + (i + 1) + '">' +
                '<span class="mg-inner">' +
                  '<span class="mg-face mg-front" aria-hidden="true">' + emblemSVG() + '</span>' +
                  '<span class="mg-face mg-back">' + c.svg + '</span>' +
                '</span>' +
              '</button>';
    }
    html += '</div></div>';
    el.innerHTML = html;
  }

  function cardEl (idx) {
    return el ? el.querySelector('.mg-card[data-idx="' + idx + '"]') : null;
  }

  /* ---------- oyun akışı ---------- */
  function onCardTap (btn) {
    if (lock || finished) return;
    var idx = parseInt(btn.getAttribute('data-idx'), 10);
    var c = deck[idx];
    if (!c || c.open || c.matched) return;

    c.open = true;
    btn.classList.add('flipped');
    play('tap');
    flippedIdx.push(idx);
    if (flippedIdx.length < 2) return;

    attempts += 1;
    lock = true;
    var ia = flippedIdx[0], ib = flippedIdx[1];
    var a = deck[ia], b = deck[ib];

    if (a.fid === b.fid) {
      later(function () {
        a.matched = true; b.matched = true;
        a.open = false; b.open = false;
        var ea = cardEl(ia), eb = cardEl(ib);
        if (ea) ea.classList.add('matched');
        if (eb) eb.classList.add('matched');
        play('chime');
        matchedPairs += 1;
        flippedIdx = [];
        lock = false;
        if (matchedPairs >= 3) later(finish, 650);
      }, 380);
    } else {
      later(function () {
        a.open = false; b.open = false;
        var ea = cardEl(ia), eb = cardEl(ib);
        if (ea) ea.classList.remove('flipped');
        if (eb) eb.classList.remove('flipped');
        flippedIdx = [];
        lock = false;
      }, 900);
    }
  }

  function finish () {
    if (finished || !el) return;
    finished = true;

    var stars = attempts <= 4 ? 3 : (attempts <= 6 ? 2 : 1);
    var s = st();
    var rested = (s.rewardedPlaysToday | 0) >= 5;
    var reward = rested ? 5 : (stars === 3 ? 40 : (stars === 2 ? 30 : 20));

    if (!rested) s.rewardedPlaysToday = (s.rewardedPlaysToday | 0) + 1;
    if (Yuvo.engine && Yuvo.engine.addStardust) {
      Yuvo.engine.addStardust(reward); // save + refresh motor tarafında
    } else {
      s.stardust = (s.stardust | 0) + reward;
      if (Yuvo.refresh) { try { Yuvo.refresh(); } catch (e) {} }
    }
    play(stars === 3 ? 'fanfare' : 'star');

    // Günlük görev zinciri: 1 oyun bitirmek bir halka (bonus tamamlandıysa kutla)
    if (Yuvo.engine && Yuvo.engine.gorevIlerle && Yuvo.engine.gorevIlerle('oyun') === true &&
        Yuvo.toast) {
      Yuvo.toast('🎁 Günün zinciri tamamlandı — yuvaya bonus yumurta kondu!');
    }

    var starsHtml = '';
    for (var i = 0; i < 3; i++) {
      starsHtml += '<span class="mg-star' + (i < stars ? ' on' : '') + '" style="--d:' + (i * 0.18) + 's"' +
                     ' aria-hidden="true">' + starPipSVG(i < stars) + '</span>';
    }
    var panel = document.createElement('div');
    panel.className = 'mg-result';
    panel.innerHTML =
      '<div class="mg-result-card center">' +
        '<div class="mg-stars" role="img" aria-label="' + stars + ' yıldız kazandın">' +
          starsHtml + '</div>' +
        '<h3 class="mg-result-title">' +
          (stars === 3 ? 'Muhteşem hafıza!' : (stars === 2 ? 'Çok iyi!' : 'Aferin sana!')) +
        '</h3>' +
        (rested
          ? '<p class="mg-note"><span class="ys-ico" aria-hidden="true">' + moonSVG() +
              '</span><span>Pufiler dinleniyor — yarın yine oynayalım!</span></p>'
          : '<p class="mg-note">Yıldız tozun hazır:</p>') +
        '<p class="mg-reward">' + ic('star', '⭐') + '<b>+' + reward + '</b></p>' +
        '<div class="mg-btns stack">' +
          '<button class="btn btn-primary" data-mg="again">' +
            '<span class="ys-ico" aria-hidden="true">' + replaySVG() + '</span>Tekrar</button>' +
          '<button class="btn btn-soft" data-mg="home">' + ic('yuva', '🏡') + 'Yuvaya Dön</button>' +
        '</div>' +
      '</div>';
    el.appendChild(panel);
  }

  function start () {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    flippedIdx = [];
    matchedPairs = 0;
    attempts = 0;
    lock = false;
    finished = false;
    buildDeck();
    render();
  }

  /* ---------- etkileşim ---------- */
  function handleClick (e) {
    var t = e.target;
    var card = t && t.closest ? t.closest('.mg-card') : null;
    if (card) { onCardTap(card); return; }
    var b = t && t.closest ? t.closest('[data-mg]') : null;
    if (!b) return;
    var act = b.getAttribute('data-mg');
    if (act === 'again') {
      play('click');
      start();
    } else if (act === 'home') {
      play('click');
      if (Yuvo.go) Yuvo.go('home');
    } else if (act === 'citcit') {
      play('click');
      mode = 'citcit';
      citCrack = 0;
      citRarity = CIT_RARITIES[Math.floor(Math.random() * CIT_RARITIES.length)];
      render();
    } else if (act === 'match') {
      play('click');
      mode = 'match';
      start();
    } else if (act === 'crack') {
      citCrack += 1;
      if (citCrack > 3) {
        play('pop');                          // kabuk açıldı → taze yumurta gelir
        citCrack = 0;
        citRarity = CIT_RARITIES[Math.floor(Math.random() * CIT_RARITIES.length)];
      } else {
        play('crack');
      }
      render();
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.minigame = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'mg-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      mode = 'match';
      citCrack = 0;
      start();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      flippedIdx = [];
      deck = [];
      lock = false;
      finished = false;
      if (el) {
        el.removeEventListener('click', handleClick);
        if (el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }
    }
  };
})();
