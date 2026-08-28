/* Yuvo — Sahne: Eşle & Bul mini oyunu (6 kart, 3 çift; süre yok, kaybetme yok).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md */
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

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n); } catch (e) {} }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

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
      if (p) faces.push({ fid:'pufi-' + p.id, svg:pufiFace(p) });
    }
    // Sahip olunan Pufi azsa: yumurta desenleriyle tamamla
    var eggR = shuffle(['nadir', 'destansi', 'azbulunur', 'efsanevi', 'yaygin']);
    var k = 0;
    while (faces.length < 3 && k < eggR.length) {
      faces.push({ fid:'egg-' + eggR[k], svg:eggFace(eggR[k]) });
      k += 1;
    }

    deck = [];
    for (var f = 0; f < faces.length; f++) {
      deck.push({ fid:faces[f].fid, svg:faces[f].svg, open:false, matched:false });
      deck.push({ fid:faces[f].fid, svg:faces[f].svg, open:false, matched:false });
    }
    shuffle(deck);
  }

  /* ---------- çizim ---------- */
  function render () {
    if (!el) return;
    var s = st();
    var plays = Math.min(5, s.rewardedPlaysToday | 0);
    // Kalan ödüllü hak: sayı yerine yıldız ikonları (okuma öncesi yaş)
    var hak = '';
    for (var h = 0; h < 5; h++) hak += h < (5 - plays) ? '⭐' : '☆';
    var html = '';
    html += '<div class="mg-head center">' +
              '<h2 class="mg-title">🌼 Eşini Bul</h2>' +
              '<p class="mg-sub">Aynı iki dostu bul! · ' + hak + '</p>' +
            '</div>';
    html += '<div class="mg-grid">';
    for (var i = 0; i < deck.length; i++) {
      var c = deck[i];
      html += '<button class="mg-card' + (c.open || c.matched ? ' flipped' : '') +
                (c.matched ? ' matched' : '') + '" data-idx="' + i + '" aria-label="Kart ' + (i + 1) + '">' +
                '<span class="mg-inner">' +
                  '<span class="mg-face mg-front" aria-hidden="true">🌼</span>' +
                  '<span class="mg-face mg-back">' + c.svg + '</span>' +
                '</span>' +
              '</button>';
    }
    html += '</div>';
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

    var starsHtml = '';
    for (var i = 0; i < 3; i++) {
      starsHtml += '<span class="mg-star' + (i < stars ? ' on' : '') + '" style="--d:' + (i * 0.18) + 's">' +
                     (i < stars ? '⭐' : '☆') + '</span>';
    }
    var panel = document.createElement('div');
    panel.className = 'mg-result';
    panel.innerHTML =
      '<div class="mg-result-card center">' +
        '<div class="mg-stars">' + starsHtml + '</div>' +
        '<h3 class="mg-result-title">' +
          (stars === 3 ? 'Muhteşem hafıza!' : (stars === 2 ? 'Çok iyi!' : 'Aferin sana!')) +
        '</h3>' +
        (rested
          ? '<p class="mg-note">Pufiler dinleniyor 💤 Yarın yine oynayalım!</p>'
          : '<p class="mg-note">Yıldız tozun hazır:</p>') +
        '<p class="mg-reward">+' + reward + ' ⭐</p>' +
        '<div class="mg-btns stack">' +
          '<button class="btn btn-primary" data-mg="again">🔁 Tekrar</button>' +
          '<button class="btn btn-soft" data-mg="home">🏡 Yuvaya Dön</button>' +
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
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.minigame = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'mg-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
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
