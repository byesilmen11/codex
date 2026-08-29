/* =====================================================================
   YUVO — Konuşma balonu sistemi (Yuvo.dialog)
   =====================================================================
   Alt kenara sabit sticker balon: karakter portresi (Yuvo.art.story)
   + ad + metin. Kuyruk: say() art arda çağrılır, balona dokununca
   sıradaki gelir; kuyruk bitince kapanır. Sahne değişse de yaşar
   (kendi katmanı #dialog-root, #app içinde).
   API:
     Yuvo.dialog.say({ kim:'kiki'|'luna'|'ustakabuk'|'sako'|'pofu'|null,
                       metin:'...', mood:'happy', cb:fn })  // kuyruğa ekle
     Yuvo.dialog.clear()                                    // kuyruğu boşalt
     Yuvo.dialog.busy()                                     // balon açık mı
   kim:null → anlatıcı (portre yerine yıldız simgesi).
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };

  var ADLAR = { kiki:'Kiki', luna:'Luna', ustakabuk:'Usta Kabuk', sako:'Şako', pofu:'Pofu' };
  var queue = [];
  var root = null, open = false;

  function play (n) { try { if (Y.audio && Y.audio.play) Y.audio.play(n); } catch (e) {} }

  function ensureRoot () {
    if (root && root.parentNode) return root;
    var app = document.getElementById('app') || document.body;
    root = document.createElement('div');
    root.id = 'dialog-root';
    app.appendChild(root);
    return root;
  }

  function portrait (kim, mood) {
    if (kim && Y.art && Y.art.story && Y.art.story.portre) {
      try {
        var s = Y.art.story.portre(kim, { mood: mood || 'happy' });
        if (s) return s;
      } catch (e) {}
    }
    // Anlatıcı / portre yoksa: yıldız rozeti
    return '<svg viewBox="0 0 80 80" aria-hidden="true">' +
      '<circle cx="40" cy="40" r="30" fill="#FFEFC2" stroke="#3E2A1C" stroke-width="3"/>' +
      '<path d="M40 22 L45 35 L59 36 L48 45 L52 58 L40 50 L28 58 L32 45 L21 36 L35 35 Z"' +
      ' fill="#FFD34D" stroke="#3E2A1C" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }

  function render (item) {
    var r = ensureRoot();
    var ad = item.kim ? (ADLAR[item.kim] || item.kim) : 'Yıldız Sesi';
    r.innerHTML =
      '<div class="dlg-bubble" role="dialog" aria-label="' + ad + ' konuşuyor">' +
        '<span class="dlg-avatar" aria-hidden="true">' + portrait(item.kim, item.mood) + '</span>' +
        '<span class="dlg-main">' +
          '<b class="dlg-name">' + ad + '</b>' +
          '<span class="dlg-text">' + item.metin + '</span>' +
        '</span>' +
        '<span class="dlg-next" aria-hidden="true">▸</span>' +
      '</div>';
    var bub = r.firstChild;
    bub.addEventListener('click', advance);
    open = true;
    play('pop');
  }

  function advance () {
    var done = queue.shift();
    if (done && typeof done.cb === 'function') { try { done.cb(); } catch (e) {} }
    if (queue.length) { render(queue[0]); }
    else { close(); }
  }

  function close () {
    open = false;
    if (root) root.innerHTML = '';
  }

  Y.dialog = {
    say: function (opts) {
      if (!opts || !opts.metin) return;
      queue.push({ kim: opts.kim || null, metin: opts.metin, mood: opts.mood, cb: opts.cb });
      if (!open) render(queue[0]);
    },
    clear: function () { queue = []; close(); },
    busy: function () { return open; }
  };

  // Test kancası: açık balonu ilerlet (duman testi diyalogları kapatabilsin)
  Y.test = Y.test || {};
  Y.test.dialogNext = function () { if (open) { advance(); return true; } return false; };
})();
