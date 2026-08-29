/* Yuvo — Sahne: Birleştirme Masası (docs/06 §3). Sahip: scenes-core ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};
  Yuvo.test = Yuvo.test || {};

  // ---------- modül durumu ----------
  var mounted = false, finished = false;
  var rootEl = null, boardEl = null, shelfEl = null, stageEl = null;
  var pufi = null, parts = [], placed = {}, placedCount = 0;
  var drag = null;
  var timers = [];
  var docHandlers = [];

  var SNAP = 64;        // px — bırakınca oturma eşiği
  var MAGNET = 96;      // px — mıknatıs çekiminin başladığı mesafe
  var PULL = 0.45;      // mıknatıs çekim gücü
  var IDLE_MS = 12000;  // ms — bu kadar hareketsizlikte yardım modu bir parçayı uçurur
  var FAIL_ESIK = 3;    // ardışık başarısız bırakma → yardım modu

  var failCount = 0, idleId = null;

  // ---------- yardımcılar ----------
  function later (fn, ms) {
    var id = setTimeout(function () { if (mounted) fn(); }, ms);
    timers.push(id);
    return id;
  }
  function clearTimers () {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }
  function play (name) {
    try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(name); } catch (e) {}
  }
  function vibrate (p) {
    try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {}
  }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Türkçe iyelik eki: büyük ünlü uyumuna göre -(n)ın/-(n)in/-(n)un/-(n)ün
  // (Kıvrık'ın, Cikcik'in, Pamuş'un, Mölü'nün…)
  function iyelik (ad) {
    var s = String(ad == null ? '' : ad);
    var lower = s.toLocaleLowerCase('tr');
    var VOK = 'aeıioöuü';
    var son = '';
    for (var i = lower.length - 1; i >= 0; i--) {
      if (VOK.indexOf(lower.charAt(i)) !== -1) { son = lower.charAt(i); break; }
    }
    var map = { a:'ı', 'ı':'ı', e:'i', i:'i', o:'u', u:'u', 'ö':'ü', 'ü':'ü' };
    var v = map[son] || 'i';
    var unluBitiyor = VOK.indexOf(lower.charAt(lower.length - 1)) !== -1;
    return s + '’' + (unluBitiyor ? 'n' : '') + v + 'n';
  }
  function onDoc (type, fn) {
    document.addEventListener(type, fn);
    docHandlers.push([type, fn]);
  }
  function offDocs () {
    for (var i = 0; i < docHandlers.length; i++) {
      document.removeEventListener(docHandlers[i][0], docHandlers[i][1]);
    }
    docHandlers = [];
  }
  function rarityColor () {
    var r = (pufi && Yuvo.data && Yuvo.data.RARITIES && Yuvo.data.RARITIES[pufi.rarity]) || null;
    return (r && r.renk) || '#FFD34D';
  }

  function findPufi (id) {
    if (!id) return null;
    try {
      if (Yuvo.data && Yuvo.data.pufiById) {
        var p = Yuvo.data.pufiById(id);
        if (p) return p;
      }
    } catch (e) {}
    var list = (Yuvo.data && Yuvo.data.PUFIS) || [];
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }

  // Savunmacı sanat yedekleri (art modülü henüz yoksa)
  function getParts () {
    try {
      if (Yuvo.art && Yuvo.art.toyParts) {
        var arr = Yuvo.art.toyParts(pufi);
        if (arr && arr.length) return arr;
      }
    } catch (e) {}
    var renk = rarityColor();
    return [
      { id: 'govde', svg: '<svg viewBox="0 0 120 120"><rect x="28" y="26" width="64" height="70" rx="30" fill="' + renk + '"/><ellipse cx="48" cy="42" rx="10" ry="14" fill="rgba(255,255,255,.4)"/></svg>' },
      { id: 'bas', svg: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="36" fill="' + renk + '"/><circle cx="48" cy="54" r="5" fill="#3a2f22"/><circle cx="72" cy="54" r="5" fill="#3a2f22"/><path d="M50 70 q10 8 20 0" stroke="#3a2f22" stroke-width="4" fill="none" stroke-linecap="round"/></svg>' },
      { id: 'aksesuar', svg: '<svg viewBox="0 0 120 120"><path d="M60 24 l11 23 25 3 -18 18 4 25 -22 -12 -22 12 4 -25 -18 -18 25 -3 z" fill="#FFD34D" stroke="#F2A61B" stroke-width="3" stroke-linejoin="round"/></svg>' }
    ];
  }
  function assembledSVG () {
    try {
      if (Yuvo.art && Yuvo.art.toyAssembledSVG) {
        var s = Yuvo.art.toyAssembledSVG(pufi);
        if (s) return s;
      }
    } catch (e) {}
    var renk = rarityColor();
    return '<svg viewBox="0 0 120 120"><rect x="34" y="52" width="52" height="54" rx="24" fill="' + renk + '"/>' +
      '<circle cx="60" cy="42" r="26" fill="' + renk + '"/>' +
      '<circle cx="51" cy="38" r="4" fill="#3a2f22"/><circle cx="69" cy="38" r="4" fill="#3a2f22"/>' +
      '<path d="M53 50 q7 6 14 0" stroke="#3a2f22" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M60 12 l5 10 11 1 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -1 z" fill="#FFD34D"/></svg>';
  }
  function pufiHappySVG () {
    try {
      if (Yuvo.art && Yuvo.art.pufiSVG) {
        var s = Yuvo.art.pufiSVG(pufi, { mood: 'happy' });
        if (s) return s;
      }
    } catch (e) {}
    var renk = rarityColor();
    return '<svg viewBox="0 0 120 120"><circle cx="60" cy="64" r="38" fill="' + renk + '"/>' +
      '<circle cx="48" cy="56" r="5" fill="#3a2f22"/><circle cx="72" cy="56" r="5" fill="#3a2f22"/>' +
      '<path d="M46 72 q14 14 28 0" stroke="#3a2f22" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }
  function partSVG (partId) {
    for (var i = 0; i < parts.length; i++) { if (parts[i].id === partId) return parts[i].svg; }
    return '';
  }

  // ---------- marka yardımcıları (salt string üreticiler; BRAND.md §3–4) ----------
  // Yuvo.icons güvenli erişim: ikon yoksa emoji fallback (main.js ico() deseni)
  function ico (name, fallback) {
    try {
      if (Yuvo.icons && Yuvo.icons[name]) {
        var s = Yuvo.icons[name]();
        if (s) return s;
      }
    } catch (e) {}
    return '<span class="ico-fallback">' + fallback + '</span>';
  }
  // Atölye masası ortam sanatı (env modülü henüz yoksa CSS gradyan zemin yeter)
  function envBg () {
    try {
      if (Yuvo.art && Yuvo.art.env && Yuvo.art.env.tableWood) {
        var s = Yuvo.art.env.tableWood();
        if (s) return '<div class="asm-bg" aria-hidden="true">' + s + '</div>';
      }
    } catch (e) {}
    return '';
  }
  // Oturma parıltısı: defs'siz (statik id YOK), marka renkli yıldızlar
  function sparkSVG () {
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' +
      '<path d="M32 6 L37 27 L58 32 L37 37 L32 58 L27 37 L6 32 L27 27 Z" fill="#FFC734" stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M50 8 L52.5 15.5 L60 18 L52.5 20.5 L50 28 L47.5 20.5 L40 18 L47.5 15.5 Z" fill="#FFA94D" stroke="#3E2A1C" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M13 40 L15 46 L21 48 L15 50 L13 56 L11 50 L5 48 L11 46 Z" fill="#FFFFFF" stroke="#3E2A1C" stroke-width="1.5" stroke-linejoin="round"/>' +
      '</svg>';
  }
  // Bitiş konfetisi: --dx/--dy/--rot inline, marka renk dizisi (zamanlamaya dokunmaz)
  function confettiHTML (n) {
    var renkler = ['#FFC734', '#FF7C33', '#8AD9F7', '#8ED94F', '#FF8FB0'];
    var out = '';
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var r = 90 + Math.random() * 60;
      var dx = Math.round(Math.cos(a) * r);
      var dy = Math.round(Math.sin(a) * r * 0.8) - 30;
      var rot = Math.round(Math.random() * 360 - 180);
      out += '<i style="--dx:' + dx + 'px;--dy:' + dy + 'px;--rot:' + rot + 'deg;' +
        'background:' + renkler[i % renkler.length] + ';animation-delay:' + ((i % 5) * 40) + 'ms"></i>';
    }
    return out;
  }

  // ---------- çizim ----------
  function render () {
    var slotsHtml = '', i;
    for (i = 0; i < parts.length; i++) {
      slotsHtml +=
        '<div class="asm-slot asm-slot-' + esc(parts[i].id) + '" data-part="' + esc(parts[i].id) + '">' +
          '<div class="slot-ghost">' + parts[i].svg + '</div>' +
        '</div>';
    }
    var order = parts.slice();
    for (i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    var piecesHtml = '';
    for (i = 0; i < order.length; i++) {
      piecesHtml += '<div class="asm-piece" data-part="' + esc(order[i].id) + '">' + order[i].svg + '</div>';
    }

    rootEl.innerHTML =
      '<div class="asm-stage" id="asm-stage">' +
        envBg() +
        '<button class="btn btn-soft asm-skip" id="asm-skip">Atla ' + ico('skip', '▶') + '</button>' +
        '<h2 class="asm-title">' + esc(iyelik(pufi.ad)) + ' oyuncağını birleştir!</h2>' +
        '<div class="asm-board" id="asm-board">' + slotsHtml + '</div>' +
        '<p class="asm-hint">Parçaları yuvalarına sürükle</p>' +
        '<div class="asm-shelf" id="asm-shelf">' + piecesHtml + '</div>' +
      '</div>';

    stageEl = rootEl.querySelector('#asm-stage');
    boardEl = rootEl.querySelector('#asm-board');
    shelfEl = rootEl.querySelector('#asm-shelf');

    var skipBtn = rootEl.querySelector('#asm-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', function () {
        if (finished) return;
        play('click');
        for (var i = 0; i < parts.length; i++) {
          if (!placed[parts[i].id]) placePart(parts[i].id);
        }
      });
    }

    shelfEl.addEventListener('pointerdown', onShelfDown);
    onDoc('pointermove', onDocMove);
    onDoc('pointerup', onDocUp);
    onDoc('pointercancel', onDocCancel);
    scheduleIdle();
  }

  // ---------- yardım modu (Bekletmeme / Ceza yok) ----------
  // Uzun hareketsizlik ya da art arda başarısız bırakma sonrası bir parçayı
  // yuvasına kendiliğinden uçurur; sürükleme beceremeyen çocuk takılı kalmaz.
  function scheduleIdle () {
    if (idleId) clearTimeout(idleId);
    idleId = later(function () { assist(); scheduleIdle(); }, IDLE_MS);
  }
  function assist () {
    if (!mounted || finished || drag) return;
    var target = null;
    for (var i = 0; i < parts.length; i++) {
      if (!placed[parts[i].id]) { target = parts[i].id; break; }
    }
    if (!target) return;
    failCount = 0;
    var piece = shelfEl ? shelfEl.querySelector('.asm-piece[data-part="' + target + '"]') : null;
    var slot = slotFor(target);
    if (piece && slot) {
      var sc = centerOf(slot), pc = centerOf(piece);
      piece.classList.remove('returning');
      piece.style.pointerEvents = 'none';
      piece.style.transition = 'transform .55s ease';
      piece.style.transform = 'translate(' + (sc.x - pc.x) + 'px,' + (sc.y - pc.y) + 'px) scale(1.05)';
      play('tap');
      (function (pid, el2) {
        later(function () {
          el2.style.transition = '';
          placePart(pid, el2);
        }, 560);
      })(target, piece);
    } else {
      placePart(target, piece);
    }
  }

  // ---------- sürükle-bırak ----------
  function slotFor (partId) {
    return boardEl ? boardEl.querySelector('.asm-slot[data-part="' + partId + '"]') : null;
  }
  function centerOf (el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function onShelfDown (e) {
    if (finished || drag) return;
    var piece = e.target && e.target.closest ? e.target.closest('.asm-piece') : null;
    if (!piece || piece.classList.contains('placed')) return;
    e.preventDefault();
    piece.classList.remove('returning');
    piece.style.transition = 'none';
    var c = centerOf(piece);
    drag = {
      el: piece,
      part: piece.getAttribute('data-part'),
      sx: e.clientX, sy: e.clientY,
      cx: c.x, cy: c.y,       // parçanın başlangıç merkezi (ekran koordinatı)
      dx: 0, dy: 0
    };
    piece.classList.add('dragging');
    play('tap');
    scheduleIdle();
  }

  function onDocMove (e) {
    if (!drag) return;
    drag.dx = e.clientX - drag.sx;
    drag.dy = e.clientY - drag.sy;

    var slot = slotFor(drag.part);
    if (slot) {
      var sc = centerOf(slot);
      var px = drag.cx + drag.dx, py = drag.cy + drag.dy;
      var dist = Math.sqrt((sc.x - px) * (sc.x - px) + (sc.y - py) * (sc.y - py));
      if (dist < MAGNET && !placed[drag.part]) {
        drag.dx += (sc.x - px) * PULL;   // mıknatıs çekimi
        drag.dy += (sc.y - py) * PULL;
        slot.classList.add('near');
      } else {
        slot.classList.remove('near');
      }
    }
    drag.el.style.transform = 'translate(' + drag.dx + 'px,' + drag.dy + 'px) scale(1.1)';
  }

  function onDocUp () {
    if (!drag) return;
    var d = drag; drag = null;
    var slot = slotFor(d.part);
    var ok = false;
    if (slot && !placed[d.part]) {
      var sc = centerOf(slot);
      var pc = centerOf(d.el);
      var dist = Math.sqrt((sc.x - pc.x) * (sc.x - pc.x) + (sc.y - pc.y) * (sc.y - pc.y));
      ok = dist < SNAP;
    }
    d.el.classList.remove('dragging');
    if (ok) {
      failCount = 0;
      placePart(d.part, d.el);
    } else {
      // Ceza yok: nazikçe rafa geri süzülür
      if (slot) slot.classList.remove('near');
      d.el.style.transition = '';
      d.el.classList.add('returning');
      d.el.style.transform = '';
      (function (el) {
        later(function () { el.classList.remove('returning'); }, 500);
      })(d.el);
      failCount += 1;
      if (failCount >= FAIL_ESIK) later(function () { assist(); }, 550);
    }
    scheduleIdle();
  }
  function onDocCancel () { onDocUp(); }

  // ---------- oturtma + bitiş ----------
  function placePart (partId, pieceEl) {
    if (placed[partId] || finished) return;
    placed[partId] = true;
    placedCount += 1;

    var slot = slotFor(partId);
    if (slot) {
      slot.classList.remove('near');
      slot.classList.add('filled');
      slot.innerHTML = '<div class="slot-fill">' + partSVG(partId) + '</div><i class="asm-spark">' + sparkSVG() + '</i>';
    }
    var piece = pieceEl || (shelfEl ? shelfEl.querySelector('.asm-piece[data-part="' + partId + '"]') : null);
    if (piece) {
      piece.classList.add('placed');
      piece.style.transform = '';
    }
    play('snap');
    vibrate(20);

    if (placedCount >= parts.length) later(function () { finish(); }, 350);
  }

  function finish () {
    if (finished || !mounted) return;
    finished = true;
    drag = null;
    play('fanfare');
    vibrate([20, 40, 60]);
    if (stageEl) {
      stageEl.innerHTML =
        '<div class="asm-done">' +
          '<div class="asm-confetti" aria-hidden="true">' + confettiHTML(14) + '</div>' +
          '<div class="asm-toy">' + assembledSVG() + '</div>' +
          '<div class="asm-dance">' + pufiHappySVG() + '</div>' +
          '<div class="asm-banner">' + ico('check', '✔') + ' Albüme işlendi!</div>' +
        '</div>';
    }
    later(function () { if (Yuvo.go) Yuvo.go('album'); }, 1000);
  }

  // ---------- sahne API ----------
  Yuvo.scenes.assembly = {
    mount: function (el, params) {
      mounted = true;
      finished = false;
      rootEl = el;
      placed = {}; placedCount = 0; drag = null;
      failCount = 0; idleId = null;

      pufi = findPufi(params && params.pufiId);
      if (!pufi) {
        // Savunmacı: parametre yoksa eldeki ilk Pufi ile devam et, o da yoksa eve dön
        var list = (Yuvo.data && Yuvo.data.PUFIS) || [];
        pufi = list[0] || null;
      }
      if (!pufi) {
        if (Yuvo.toast) Yuvo.toast('Birleştirilecek oyuncak bulunamadı');
        if (Yuvo.go) Yuvo.go('home');
        return;
      }
      parts = getParts();
      render();
    },
    unmount: function () {
      mounted = false;
      clearTimers();
      offDocs();
      drag = null;
      failCount = 0; idleId = null;
      rootEl = null; boardEl = null; shelfEl = null; stageEl = null;
      pufi = null; parts = []; placed = {}; placedCount = 0; finished = false;
    }
  };

  // ---------- test kancası ----------
  // Tüm parçaları anında oturtur ve bitirir; başarı durumunu döndürür.
  Yuvo.test.assemble = function () {
    if (!mounted || finished) return false;
    clearTimers(); // bekleyen 350ms bitiş zamanlayıcıları yerine doğrudan bitir
    for (var i = 0; i < parts.length; i++) {
      if (!placed[parts[i].id]) placePart(parts[i].id);
    }
    finish();
    return true;
  };
})();
