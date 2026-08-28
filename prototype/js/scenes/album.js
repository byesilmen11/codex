/* Yuvo — Sahne: Albüm ("Güneş Çayırı" sayfası: 30 hücre + gizli, kilometre taşları, Atölye).
   Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;
  var timers = [];
  var onState = null;

  // Kilometre taşları — state.js'tekiyle aynı tablo (görsel amaçlı kopya)
  var MILES = [
    { at:10, key:'m10', odul:15 },
    { at:20, key:'m20', odul:30 },
    { at:27, key:'m27', odul:60 },
    { at:30, key:'m30', odul:100 }
  ];

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n); } catch (e) {} }
  function toast (t) { if (Yuvo.toast) Yuvo.toast(t); }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  function pufiList () { return (Yuvo.data && Yuvo.data.PUFIS) || []; }
  function byId (id) { return (Yuvo.data && Yuvo.data.pufiById && Yuvo.data.pufiById(id)) || null; }
  function rarInfo (r) {
    return (Yuvo.data && Yuvo.data.RARITIES && Yuvo.data.RARITIES[r]) ||
           { ad:r || '?', renk:'#9AA5B1', uretim:0, kabuk:0 };
  }

  function ownedCount () {
    if (Yuvo.engine && Yuvo.engine.ownedCount) { try { return Yuvo.engine.ownedCount(); } catch (e) {} }
    var s = st(), n = 0, owned = s.owned || {};
    for (var id in owned) {
      if (!owned[id]) continue;
      var p = byId(id);
      if (p && p.rarity === 'gizli') continue;
      n += 1;
    }
    return n;
  }

  function miniArt (p) {
    if (Yuvo.art && Yuvo.art.pufiSVG) {
      try { var s = Yuvo.art.pufiSVG(p, { mood:'happy' }); if (s) return s; } catch (e) {}
    }
    return '<span class="alb-art-fallback">🐣</span>';
  }
  function silArt (p) {
    if (Yuvo.art && Yuvo.art.pufiSilhouetteSVG) {
      try { var s = Yuvo.art.pufiSilhouetteSVG(p); if (s) return s; } catch (e) {}
    }
    return '<span class="alb-art-fallback dim">🐾</span>';
  }
  function toyArt (p) {
    if (Yuvo.art && Yuvo.art.toyAssembledSVG) {
      try { var s = Yuvo.art.toyAssembledSVG(p); if (s) return s; } catch (e) {}
    }
    return miniArt(p);
  }

  /* ---------- çizim ---------- */
  function render () {
    if (!el) return;
    var s = st();
    var owned = ownedCount();
    var pct = Math.max(0, Math.min(100, Math.round(owned / 30 * 100)));
    var ownedMap = s.owned || {};
    var miles = s.milestones || [];
    var html = '';

    // Üst bilgi: başlık + Kabuk bakiyesi + ilerleme
    html += '<div class="alb-head">' +
              '<h2 class="alb-title">📔 Güneş Çayırı</h2>' +
              '<span class="alb-shell">🐚 ' + (s.kabuk | 0) + '</span>' +
            '</div>';
    html += '<div class="alb-progress">' +
              '<span class="alb-progress-num"><b>' + owned + '</b>/30</span>' +
              '<span class="alb-progress-bar"><span class="alb-progress-fill" style="width:' + pct + '%"></span></span>' +
            '</div>';

    // Kilometre taşı çipleri
    html += '<div class="alb-chips">';
    for (var m = 0; m < MILES.length; m++) {
      var mi = MILES[m];
      var claimed = miles.indexOf(mi.key) !== -1;
      var ready = !claimed && owned >= mi.at;
      var cls = claimed ? 'done' : (ready ? 'ready' : 'locked');
      html += '<button class="alb-chip ' + cls + '" data-act="mile" data-key="' + mi.key + '">' +
                '<b>' + mi.at + '</b>' +
                '<small>' + (claimed ? '✓ alındı' : '+' + mi.odul + ' 🐚') + '</small>' +
              '</button>';
    }
    html += '</div>';

    // 30 hücrelik ızgara (gizli hariç, PUFIS sırasıyla)
    html += '<div class="alb-grid">';
    var list = pufiList();
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.rarity === 'gizli') continue;
      var n = ownedMap[p.id] | 0;
      if (n > 0) {
        html += '<button class="alb-cell rf rf-' + p.rarity + '" data-act="cell" data-id="' + p.id + '"' +
                  ' aria-label="' + p.ad + '">' +
                  miniArt(p) +
                  (n > 1 ? '<span class="alb-copy">×' + n + '</span>' : '') +
                '</button>';
      } else {
        html += '<button class="alb-cell missing rf rf-' + p.rarity + '" data-act="cell" data-id="' + p.id + '"' +
                  ' aria-label="Bilinmeyen Pufi">' +
                  silArt(p) +
                  '<span class="alb-q">?</span>' +
                '</button>';
      }
    }
    html += '</div>';

    // Ayrık gizli hücre
    var gizli = null;
    for (var g = 0; g < list.length; g++) { if (list[g].rarity === 'gizli') { gizli = list[g]; break; } }
    if (gizli) {
      var gn = ownedMap[gizli.id] | 0;
      html += '<div class="alb-secret-row">' +
                '<button class="alb-cell alb-secret rf rf-gizli' + (gn > 0 ? '' : ' missing') + '"' +
                  ' data-act="cell" data-id="' + gizli.id + '" aria-label="Gizli Pufi">' +
                  (gn > 0 ? miniArt(gizli) + (gn > 1 ? '<span class="alb-copy">×' + gn + '</span>' : '')
                          : '<span class="alb-q big">???</span>') +
                '</button>' +
                '<span class="alb-secret-label">' +
                  (gn > 0 ? gizli.ad + ' aramıza katıldı! 🌙' : 'Çayırda bir sır fısıldanıyor…') +
                '</span>' +
              '</div>';
    }

    el.innerHTML = html;
  }

  /* ---------- kilometre taşı ödülü ---------- */
  function claimMilestones () {
    var s = st();
    var owned = ownedCount();
    var miles = s.milestones = s.milestones || [];
    var total = 0, i;

    if (Yuvo.engine && Yuvo.engine.checkMilestones) {
      var granted = [];
      try { granted = Yuvo.engine.checkMilestones() || []; } catch (e) { granted = []; }
      for (i = 0; i < MILES.length; i++) {
        if (granted.indexOf(MILES[i].key) !== -1) total += MILES[i].odul;
      }
      if (granted.length) {
        if (Yuvo.engine.save) { try { Yuvo.engine.save(); } catch (e2) {} }
        if (Yuvo.refresh) { try { Yuvo.refresh(); } catch (e3) {} }
      }
    } else {
      // Motor yoksa yerel yedek: bir kez ver
      for (i = 0; i < MILES.length; i++) {
        var mi = MILES[i];
        if (owned >= mi.at && miles.indexOf(mi.key) === -1) {
          miles.push(mi.key);
          s.kabuk = (s.kabuk | 0) + mi.odul;
          total += mi.odul;
        }
      }
      if (total > 0 && Yuvo.refresh) { try { Yuvo.refresh(); } catch (e4) {} }
    }

    if (total > 0) {
      play('star');
      toast('🐚 +' + total + ' Kabuk! Kilometre taşı ödülün.');
    }
    render();
  }

  /* ---------- detay modalı / Atölye ---------- */
  function openDetail (id) {
    var p = byId(id);
    if (!p) return;
    var s = st();
    var n = (s.owned || {})[id] | 0;
    var ri = rarInfo(p.rarity);

    if (n > 0) {
      // Sahipli: ad + nadirlik + bio + birleşmiş oyuncak
      play('pop');
      var htmlOwned =
        '<div class="alb-modal center">' +
          '<div class="alb-modal-art rf rf-' + p.rarity + '">' + toyArt(p) + '</div>' +
          '<h3 class="alb-modal-name">' + p.ad + '</h3>' +
          '<p class="alb-modal-tur">' + p.tur + '</p>' +
          '<p class="alb-modal-tags">' +
            '<span class="rarity-tag" style="background:' + ri.renk + '33;border-color:' + ri.renk + '">' +
              (ri.simge ? ri.simge + ' ' : '') + ri.ad + '</span>' +
            (n > 1 ? ' <span class="alb-copy-tag">×' + n + ' kopya</span>' : '') +
          '</p>' +
          '<p class="alb-bio">“' + p.bio + '”</p>' +
        '</div>';
      if (Yuvo.modal) Yuvo.modal(htmlOwned);
      return;
    }

    // Eksik: Atölye
    play('click');
    var cost = ri.uretim | 0;
    var wallet = s.kabuk | 0;
    var gizliLocked = (p.rarity === 'gizli') && ownedCount() < 30;
    var enough = wallet >= cost;
    var body =
      '<div class="alb-modal center">' +
        '<div class="alb-modal-art rf rf-' + p.rarity + ' missing">' +
          (p.rarity === 'gizli' && gizliLocked ? '<span class="alb-q big">???</span>' : silArt(p)) +
        '</div>' +
        '<h3 class="alb-modal-name">???</h3>' +
        '<p class="alb-modal-tags"><span class="rarity-tag" style="background:' + ri.renk + '33;border-color:' + ri.renk + '">' +
          (ri.simge ? ri.simge + ' ' : '') + ri.ad + '</span></p>' +
        '<div class="alb-workshop">' +
          '<p class="alb-workshop-note">🐢 Usta Kabuk atölyesinde bu dostun oyuncağını üretebilir.</p>' +
          '<p class="alb-cost">Maliyet: <b>' + cost + ' 🐚</b> · Cüzdanın: <b>' + wallet + ' 🐚</b></p>';
    if (gizliLocked) {
      body += '<p class="alb-locked">🔒 Usta Kabuk fısıldar: “Önce 30 dostu yuvaya getir…” (' +
                ownedCount() + '/30)</p>';
    } else {
      body += '<button class="btn btn-primary alb-craft-btn" id="alb-craft-btn"' + (enough ? '' : ' disabled') + '>' +
                '🐢 Usta Kabuk\'a Ürettir</button>';
      if (!enough) body += '<p class="alb-locked">🐚 Kabuk yetersiz — kopyalar Kabuk kazandırır!</p>';
    }
    body += '</div></div>';

    var close = Yuvo.modal ? Yuvo.modal(body) : function () {};
    var btn = document.getElementById('alb-craft-btn');
    if (btn) {
      btn.addEventListener('click', function () { doCraft(p, close); });
    }
  }

  function doCraft (p, close) {
    var r = (Yuvo.engine && Yuvo.engine.craft) ? Yuvo.engine.craft(p.id) : { ok:false, reason:'motor-yok' };
    if (r && r.ok) {
      play('fanfare');
      // Minik üretim töreni: modal içinde parıltı + oyuncak
      var box = document.querySelector('#overlay-root .modal');
      if (box) {
        box.innerHTML =
          '<div class="alb-craft-anim center">' +
            '<div class="alb-craft-spark" aria-hidden="true">✨</div>' +
            '<div class="alb-modal-art rf rf-' + p.rarity + ' alb-pop">' + toyArt(p) + '</div>' +
            '<h3 class="alb-modal-name">' + p.ad + '</h3>' +
            '<p class="alb-workshop-note">Albüme işlendi! 📔</p>' +
          '</div>';
      }
      later(function () {
        try { close(); } catch (e) {}
        render();
      }, 1700);
      toast('🎉 ' + p.ad + ' aileye katıldı!');
    } else {
      var reason = r && r.reason;
      if (reason === 'kabuk-yetersiz') toast('🐚 Kabuk yetersiz — kopyalar Kabuk kazandırır!');
      else if (reason === 'gizli-kilitli') toast('🔒 Önce 30 dostu yuvaya getirmelisin.');
      else if (reason === 'sahipli') toast('Bu dost zaten albümde!');
      else toast('Atölye şu an çalışmıyor.');
    }
  }

  /* ---------- etkileşim ---------- */
  function handleClick (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'cell') {
      openDetail(b.getAttribute('data-id'));
    } else if (act === 'mile') {
      var key = b.getAttribute('data-key');
      var mi = null;
      for (var i = 0; i < MILES.length; i++) { if (MILES[i].key === key) { mi = MILES[i]; break; } }
      if (!mi) return;
      var s = st();
      var claimed = (s.milestones || []).indexOf(key) !== -1;
      var owned = ownedCount();
      if (claimed) {
        play('click');
        toast('Bu ödül alındı ✓');
      } else if (owned >= mi.at) {
        claimMilestones();
      } else {
        play('click');
        toast('Daha ' + (mi.at - owned) + ' dost gerek (' + owned + '/' + mi.at + ').');
      }
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.album = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'alb-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      onState = function () { render(); };
      document.addEventListener('yuvo:state', onState);
      play('page');
      render();
    },
    unmount: function () {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      if (onState) { document.removeEventListener('yuvo:state', onState); onState = null; }
      if (el) {
        el.removeEventListener('click', handleClick);
        if (el.parentNode) el.parentNode.removeChild(el);
        el = null;
      }
    }
  };
})();
