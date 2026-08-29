/* Yuvo — Sahne: Albüm ("Güneş Çayırı" hikâye kitabı sayfası: 30 hücre + gizli,
   kilometre taşları, Atölye). Sahip: scenes-meta ajanı. Sözleşme: ARCHITECTURE.md —
   claimMilestones/openDetail/doCraft/handleClick mantığı DEĞİŞMEDİ, yalnız markup.
   Görsel dil: BRAND.md §3 sticker reçetesi + §5 Albüm atmosferi. */
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

  // Düz dolgulu mini ay (id'siz) — gizli şerit süsü
  function moonSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<path d="M18.6 3.9a11 11 0 1 0 5.6 16.6 9.1 9.1 0 0 1-5.6-16.6Z" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<ellipse cx="11.6" cy="9" rx="2.1" ry="1.3" transform="rotate(-22 11.6 9)"' +
        ' fill="#FFFFFF" opacity=".75"/>' +
    '</svg>';
  }

  // Düz dolgulu yıldız patlaması (id'siz) — üretim töreni kıvılcımı
  function sparkSVG () {
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<path d="M24 4l4.2 9.8L38 18l-9.8 4.2L24 32l-4.2-9.8L10 18l9.8-4.2Z" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<circle cx="38.5" cy="9.5" r="3" fill="#FF8FB0" stroke="#3E2A1C" stroke-width="1.6"/>' +
      '<circle cx="9.5" cy="34.5" r="2.4" fill="#8AD9F7" stroke="#3E2A1C" stroke-width="1.6"/>' +
    '</svg>';
  }

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

    // Hikâye kitabı sayfası: kâğıt dokulu sarmalayıcı (mevcut sınıflar içinde aynen)
    html += '<div class="alb-page">';

    // Üst bilgi: kurdele/arma başlık + Kabuk bakiyesi
    html += '<div class="alb-head">' +
              '<span class="alb-ribbon">' +
                '<span class="alb-ribbon-ico" aria-hidden="true">' + ico('album', '📔') + '</span>' +
                '<h2 class="alb-title">Güneş Çayırı</h2>' +
              '</span>' +
              '<span class="alb-shell" aria-label="Kabuk bakiyesi">' +
                ic('shell', '🐚') + '<b>' + (s.kabuk | 0) + '</b>' +
              '</span>' +
            '</div>';
    html += '<div class="alb-progress">' +
              '<span class="alb-progress-num"><b>' + owned + '</b>/30</span>' +
              '<span class="alb-progress-bar">' +
                '<span class="alb-progress-fill" style="width:' + pct + '%"></span>' +
              '</span>' +
            '</div>';

    // Kilometre taşı çipleri — ödül satırı Kabuk ikonlu
    html += '<div class="alb-chips">';
    for (var m = 0; m < MILES.length; m++) {
      var mi = MILES[m];
      var claimed = miles.indexOf(mi.key) !== -1;
      var ready = !claimed && owned >= mi.at;
      var cls = claimed ? 'done' : (ready ? 'ready' : 'locked');
      html += '<button class="alb-chip ' + cls + '" data-act="mile" data-key="' + mi.key + '">' +
                '<b>' + mi.at + '</b>' +
                (claimed
                  ? '<small>' + ic('check', '✓') + 'alındı</small>'
                  : '<small>+' + mi.odul + ' ' + ic('shell', '🐚') + '</small>') +
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

    // Ayrık gizli hücre — pastel gece adası (yıldız benekleri CSS'te, ay süsü burada)
    var gizli = null;
    for (var g = 0; g < list.length; g++) { if (list[g].rarity === 'gizli') { gizli = list[g]; break; } }
    if (gizli) {
      var gn = ownedMap[gizli.id] | 0;
      html += '<div class="alb-secret-row">' +
                '<span class="alb-secret-moon" aria-hidden="true">' + moonSVG() + '</span>' +
                '<button class="alb-cell alb-secret rf rf-gizli' + (gn > 0 ? '' : ' missing') + '"' +
                  ' data-act="cell" data-id="' + gizli.id + '" aria-label="Gizli Pufi">' +
                  (gn > 0 ? miniArt(gizli) + (gn > 1 ? '<span class="alb-copy">×' + gn + '</span>' : '')
                          : '<span class="alb-q big">???</span>') +
                '</button>' +
                '<span class="alb-secret-label">' +
                  (gn > 0 ? gizli.ad + ' aramıza katıldı!' : 'Çayırda bir sır fısıldanıyor…') +
                '</span>' +
              '</div>';
    }

    html += '</div>'; // .alb-page

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
          '<p class="alb-workshop-note">' + ic('shell', '🐚') +
            '<span><b>Usta Kabuk</b> atölyesinde bu dostun oyuncağını üretebilir.</span></p>' +
          '<p class="alb-cost">' +
            '<span class="alb-cost-item">Maliyet <b>' + cost + '</b>' + ic('shell', '🐚') + '</span>' +
            '<span class="alb-cost-item">Cüzdanın <b>' + wallet + '</b>' + ic('shell', '🐚') + '</span>' +
          '</p>';
    if (gizliLocked) {
      body += '<p class="alb-locked">Usta Kabuk fısıldar: “Önce 30 dostu yuvaya getir…” (' +
                ownedCount() + '/30)</p>';
    } else {
      body += '<button class="btn btn-primary alb-craft-btn" id="alb-craft-btn"' + (enough ? '' : ' disabled') + '>' +
                ic('shell', '🐢') + 'Usta Kabuk\'a Ürettir</button>';
      if (!enough) body += '<p class="alb-locked">Kabuk yetersiz — kopyalar Kabuk kazandırır!</p>';
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
            '<div class="alb-craft-spark" aria-hidden="true">' + sparkSVG() + '</div>' +
            '<div class="alb-modal-art rf rf-' + p.rarity + ' alb-pop">' + toyArt(p) + '</div>' +
            '<h3 class="alb-modal-name">' + p.ad + '</h3>' +
            '<p class="alb-workshop-note">' + ic('album', '📔') + '<span>Albüme işlendi!</span></p>' +
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
