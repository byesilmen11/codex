/* =====================================================================
   YUVO — Sahne: Şako Saklambaç (Fısıltı Ormanı mini oyunu; docs/v2/04 D3)
   =====================================================================
   Şako parlak bir şey saklar: 3 çalıdan birinin altında. Çalılar karışır,
   çocuk 2 tahmin hakkıyla arar. Bulursa:
     - Şako bir parça saklamışsa (state.sakoHidden) → parça GERİ DÖNER
       (engine.sakoRecover) + albümdeki tüy izi silinir
     - saklı parça yoksa → +10 Yıldız Tozu
   Bulamazsa ceza yok — doğru çalı gösterilir, "Bir Daha!" hep açık.
   AKIŞ: goster (1,4 sn) → karistir (1,2 sn) → sec (2 hak) → sonuc
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Y.scenes = Y.scenes || {};

  var el = null, timers = [], phase = null, dogru = 0, hak = 2, kilit = false;

  function st () { return (Y.engine && Y.engine.state) || {}; }
  function play (n) { try { if (Y.audio && Y.audio.play) Y.audio.play(n); } catch (e) {} }
  function toast (t) { if (Y.toast) Y.toast(t); }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function dlg () { return (Y.data && Y.data.DIALOG && Y.data.DIALOG.sako) || {}; }

  function sakoArt (mood) {
    if (Y.art && Y.art.story && Y.art.story.portre) {
      try { var s = Y.art.story.portre('sako', { mood: mood || 'happy' }); if (s) return s; } catch (e) {}
    }
    return '<span style="font-size:40px">🪶</span>';
  }

  function bushSVG (n) {
    var t1 = 22 + (n * 7) % 10, t2 = 34 + (n * 5) % 8;
    return '<svg viewBox="0 0 120 100" aria-hidden="true">' +
      '<ellipse cx="60" cy="62" rx="46" ry="34" fill="#4E7C46" stroke="#3E2A1C" stroke-width="3.5"/>' +
      '<ellipse cx="' + t1 + '" cy="46" rx="' + t2 * 0.55 + '" ry="16" fill="#6FA05A"' +
        ' stroke="#3E2A1C" stroke-width="3"/>' +
      '<ellipse cx="' + (118 - t1) + '" cy="50" rx="15" ry="12" fill="#6FA05A"' +
        ' stroke="#3E2A1C" stroke-width="3"/>' +
      '<ellipse cx="44" cy="36" rx="9" ry="4.5" fill="#A8CF8E" opacity="0.8"/>' +
    '</svg>';
  }

  function sparkleSVG () {
    return '<svg viewBox="0 0 60 60" aria-hidden="true">' +
      '<path d="M30 6 L36 24 L54 30 L36 36 L30 54 L24 36 L6 30 L24 24 Z" fill="#FFD34D"' +
        ' stroke="#3E2A1C" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="25" cy="22" r="3.4" fill="#FFFFFF" opacity="0.9"/></svg>';
  }

  function hiddenPufi () {
    var s = st();
    if (!s.sakoHidden) return null;
    return (Y.data && Y.data.pufiById && Y.data.pufiById(s.sakoHidden)) || null;
  }

  function render (line, revealAt) {
    if (!el) return;
    var gizliP = hiddenPufi();
    var html = '';
    html += '<div class="sk-stage">';
    html += '<button class="sk-back" data-act="back" aria-label="Yuvaya dön">↩ Yuva</button>';
    html += '<div class="sk-sako" aria-hidden="true">' + sakoArt(phase === 'sonuc-kayip' ? 'happy' : 'think') + '</div>';
    html += '<p class="sk-line">' + line + '</p>';
    if (gizliP && phase === 'goster') {
      html += '<p class="sk-note">🪶 Şako <b>' + gizliP.ad + '</b>\'i saklamış — bul, geri gelsin!</p>';
    }
    html += '<div class="sk-bushes' + (phase === 'karistir' ? ' mixing' : '') + '">';
    for (var i = 0; i < 3; i++) {
      var reveal = (revealAt === i);
      html += '<button class="sk-bush" data-act="bush" data-idx="' + i + '"' +
                (phase === 'sec' ? '' : ' disabled') +
                ' aria-label="Çalı ' + (i + 1) + '">' +
                (reveal ? '<span class="sk-spark">' + sparkleSVG() + '</span>' : '') +
                bushSVG(i) +
              '</button>';
    }
    html += '</div>';
    if (phase === 'sec') {
      html += '<p class="sk-hint">Hangi çalıda? Hakkın: <b>' + hak + '</b></p>';
    }
    if (phase === 'sonuc-kazandi' || phase === 'sonuc-kayip') {
      html += '<div class="sk-actions">' +
                '<button class="btn btn-primary" data-act="again">Bir Daha!</button>' +
                '<button class="btn btn-soft" data-act="back">Yuvaya Dön</button>' +
              '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function start () {
    kilit = false;
    hak = 2;
    dogru = Math.floor(Math.random() * 3);
    phase = 'goster';
    var L = dlg().saklambac || [];
    render(L[0] || 'Parlak şeyler saklanır. Bulabilir misin?', dogru);
    play('crinkle');
    later(function () {
      phase = 'karistir';
      render('Karışıyor… gözünü ayırma!', -1);
      play('shakeRattle');
      later(function () {
        phase = 'sec';
        render('Şimdi… hangisinde?', -1);
      }, 1200);
    }, 1400);
  }

  function pick (idx) {
    if (phase !== 'sec' || kilit) return;
    if (idx === dogru) {
      kilit = true;
      phase = 'sonuc-kazandi';
      play('fanfare');
      var geri = !!(Y.engine && Y.engine.sakoRecover && Y.engine.sakoRecover());
      if (geri) {
        render('Buldun! …Şans. Kesinlikle şans.', dogru);
        toast('Saklanan dost geri döndü! 🪶');
      } else {
        if (Y.engine && Y.engine.addStardust) Y.engine.addStardust(10);
        render('Buldun! …Şans. Kesinlikle şans.', dogru);
        toast('+10 Yıldız Tozu!');
      }
    } else {
      hak -= 1;
      play('click');
      if (hak > 0) {
        render('Orada değil! Son hakkın…', -1);
      } else {
        kilit = true;
        phase = 'sonuc-kayip';
        render('Hihihi! Buradaydı. Saksağanlar açıklama yapmaz. Bir daha?', dogru);
        play('pop');
      }
    }
  }

  function handleClick (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'back') {
      play('click');
      if (Y.go) Y.go('home');
    } else if (act === 'again') {
      play('click');
      start();
    } else if (act === 'bush') {
      pick(parseInt(b.getAttribute('data-idx'), 10) | 0);
    }
  }

  Y.scenes.sako = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'sk-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      start();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      phase = null;
      if (el) {
        el.removeEventListener('click', handleClick);
        if (el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }
    }
  };

  // Test kancası: doğru çalıyı seç (duman testi kazanma yolunu doğrular)
  Y.test = Y.test || {};
  Y.test.sakoWin = function () {
    if (phase !== 'sec') return false;
    pick(dogru);
    return true;
  };
})();
