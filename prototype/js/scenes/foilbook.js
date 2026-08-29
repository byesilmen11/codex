/* Yuvo — Sahne: Ambalaj Defteri (docs/v2/06 §2.f + §5.5). Sahip: scenes-meta ajanı.
   Sayfa = seri (6 seri sekmesi); her sayfada 8 varyant yuvası + Altın Şeref Yuvası.
   Eksik = soluk desen silüeti; sahipli = foilStampSVG (+×n rozeti SVG içinde).
   Seri tamamlama ödül çipleri: 4/8 → 20 Kabuk, 8/8 → 40 Kabuk (state.milestones ile
   yerel bir-kez mantığı — engine'de foilbook yardımcısı yok). Araç Rafı: TOOLS listesi,
   sahipliler seçilebilir (setTool), kilitliler silüet + kilit açıklaması.
   Defter saf kozmetiktir: oran/pity'ye asla dokunmaz. Görsel dil: BRAND.md §3. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};

  var el = null;
  var timers = [];
  var onState = null;
  var curSeri = null;   // açık sayfa (seri id)

  // Ödül çipleri (proto değerleri §5.5: 4/8 → 20 Kabuk, 8/8 → 40 Kabuk)
  var REWARDS = [
    { at:4, kabuk:20 },
    { at:8, kabuk:40 }
  ];

  /* ---------- yardımcılar (savunmacı) ---------- */
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function play (n, o) { try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(n, o); } catch (e) {} }
  function toast (t) { if (Yuvo.toast) Yuvo.toast(t); }
  function later (fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

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

  function seriesMap () {
    var d = Yuvo.data && Yuvo.data.WRAPPER_SERIES;
    if (d && typeof d === 'object') {
      for (var k in d) return d; // en az bir seri varsa kullan
    }
    return { gunesbahcesi: { ad:'Güneş Bahçesi', renk1:'#F6B93B', renk2:'#F8E3A1', desen:'papatya' } };
  }
  function seriesIds () {
    var out = [], d = seriesMap();
    for (var k in d) out.push(k);
    return out;
  }
  function variantCount () {
    var n = Yuvo.data && Yuvo.data.WRAPPER_VARIANTS;
    return (typeof n === 'number' && n > 0) ? n : 8;
  }

  // Defter kaydı (normalize edilmiş): { variants:{v:count}, golden:count }
  function bookRec (seri) {
    var fb = st().foilBook;
    var rec = (fb && typeof fb === 'object') ? fb[seri] : null;
    if (!rec || typeof rec !== 'object') return { variants:{}, golden:0 };
    return {
      variants: (rec.variants && typeof rec.variants === 'object') ? rec.variants : {},
      golden: Math.max(0, rec.golden | 0)
    };
  }
  function variantOwnedCount (seri) {
    var rec = bookRec(seri), n = 0, V = variantCount();
    for (var v = 0; v < V; v++) { if ((rec.variants[v] | 0) > 0) n += 1; }
    return n;
  }

  function stampArt (seri, v, opts) {
    if (Yuvo.art && Yuvo.art.foilStampSVG) {
      try { var s = Yuvo.art.foilStampSVG(seri, v, opts || {}); if (s) return s; } catch (e) {}
    }
    return '<span class="fb-art-fallback">🥚</span>';
  }
  function toolArt (id) {
    if (Yuvo.art && Yuvo.art.toolSVG) {
      try { var s = Yuvo.art.toolSVG(id); if (s) return s; } catch (e) {}
    }
    return '<span class="fb-art-fallback">🔨</span>';
  }

  // Mini kilit glifi (id'siz; kilitli araç rozeti)
  function lockSVG () {
    return '<svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">' +
      '<rect x="6" y="12" width="16" height="12" rx="4" fill="#FFC734"' +
        ' stroke="#3E2A1C" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M9.5 12V9.4a4.5 4.5 0 0 1 9 0V12" fill="none" stroke="#3E2A1C"' +
        ' stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="14" cy="17.6" r="2" fill="#3E2A1C"/>' +
    '</svg>';
  }

  // Altın Şeref Yuvası boş silüeti (id'siz; nazik parıltı)
  function goldEmptySVG () {
    return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
      '<rect x="26" y="12" width="68" height="94" rx="8" fill="#FFF6E0"' +
        ' stroke="#F2A61B" stroke-width="3" stroke-dasharray="6 7" stroke-linecap="round"/>' +
      '<path d="M60 38l5.4 12.4 13.4 1.2-10.2 8.9 3.1 13.2L60 66.6l-11.7 7.1 3.1-13.2-10.2-8.9' +
        ' 13.4-1.2Z" fill="#F8DFA6" stroke="#E0B45C" stroke-width="2.4"' +
        ' stroke-linejoin="round"/>' +
      '<path d="M84 24l1.7 3.9 3.9 1.7-3.9 1.7-1.7 3.9-1.7-3.9-3.9-1.7 3.9-1.7Z"' +
        ' fill="#F2C14E" opacity=".8"/>' +
      '<path d="M36 88l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4Z"' +
        ' fill="#F2C14E" opacity=".7"/>' +
    '</svg>';
  }

  /* ---------- ödül çipleri: yerel bir-kez mantığı (state.milestones dili) ---------- */
  function rewardKey (seri, at) { return 'fb-' + seri + '-' + at; }
  function rewardClaimed (seri, at) {
    var m = st().milestones;
    return Array.isArray(m) && m.indexOf(rewardKey(seri, at)) !== -1;
  }
  function claimReward (seri, at, kabuk) {
    var s = st();
    if (!s || typeof s !== 'object') return false;
    if (!Array.isArray(s.milestones)) s.milestones = [];
    var key = rewardKey(seri, at);
    if (s.milestones.indexOf(key) !== -1) return false;      // bir kez
    if (variantOwnedCount(seri) < at) return false;
    s.milestones.push(key);
    s.kabuk = Math.max(0, (s.kabuk | 0) + (kabuk | 0));
    try { if (Yuvo.engine && Yuvo.engine.save) Yuvo.engine.save(); } catch (e) {}
    try { if (Yuvo.refresh) Yuvo.refresh(); } catch (e) {}
    return true;
  }

  /* ---------- araç rafı metinleri ---------- */
  function toolMeta (id) {
    var T = (Yuvo.data && Yuvo.data.TOOLS) || {};
    return T[id] || null;
  }
  function toolLockNote (id) {
    var m = toolMeta(id) || {};
    if (m.kabuk) return (m.ad || id) + ', ' + m.kabuk + ' Kabuk biriktirince kazanılır.';
    if (m.otomatik) return (m.ad || id) + ' Destansı kapsüllerde kendiliğinden gelir — satılmaz!';
    return (m.ad || id) + ' henüz kilitli.';
  }
  function toolTagText (id, ownedTool) {
    var m = toolMeta(id) || {};
    if (ownedTool) return 'Hazır';
    if (m.kabuk) return m.kabuk + ' Kabuk';
    if (m.otomatik) return 'Destansı+';
    return 'Kilitli';
  }

  /* ---------- çizim ---------- */
  function render () {
    if (!el) return;
    var s = st();
    var ids = seriesIds();
    var map = seriesMap();
    if (!curSeri || ids.indexOf(curSeri) === -1) {
      curSeri = null;
      try {
        if (Yuvo.engine && Yuvo.engine.activeSeries) {
          var a = Yuvo.engine.activeSeries();
          if (a && ids.indexOf(a) !== -1) curSeri = a;
        }
      } catch (e) {}
      if (!curSeri) curSeri = ids[0];
    }
    var seri = map[curSeri] || {};
    var seriAd = seri.ad || curSeri;
    var rec = bookRec(curSeri);
    var V = variantCount();
    var ownedV = variantOwnedCount(curSeri);
    var pct = Math.max(0, Math.min(100, Math.round(ownedV / V * 100)));
    var html = '';
    var i, v;

    /* Başlık: kurdele + Kabuk hapı */
    html += '<div class="fb-head">' +
              '<span class="fb-ribbon">' +
                '<span class="fb-ribbon-ico" aria-hidden="true">' + ico('shell', '📔') + '</span>' +
                '<h1 class="fb-title">Ambalaj Defteri</h1>' +
              '</span>' +
              '<span class="fb-shell" aria-label="Kabuk bakiyesi">' +
                ic('shell', '🐚') + '<b>' + Math.max(0, s.kabuk | 0) + '</b>' +
              '</span>' +
            '</div>';

    /* Seri sekmeleri (yatay kaydırmalı şerit; her sekme ≥64px hedef) */
    html += '<div class="fb-tabs" role="tablist" aria-label="Ambalaj serileri">';
    for (i = 0; i < ids.length; i++) {
      var sid = ids[i], sm = map[sid] || {};
      var cnt = variantOwnedCount(sid);
      var goldTik = bookRec(sid).golden > 0;
      html += '<button class="fb-tab' + (sid === curSeri ? ' active' : '') + '"' +
                ' data-act="tab" data-seri="' + esc(sid) + '" role="tab"' +
                ' aria-selected="' + (sid === curSeri ? 'true' : 'false') + '"' +
                ' aria-label="' + esc(sm.ad || sid) + ' — ' + cnt + '/' + V + '">' +
                '<span class="fb-tab-dot" aria-hidden="true" style="background:' +
                  'linear-gradient(135deg,' + esc(sm.renk1 || '#F6B93B') + ',' +
                  esc(sm.renk2 || '#F8E3A1') + ')"></span>' +
                '<span class="fb-tab-name">' + esc(sm.ad || sid) + '</span>' +
                '<span class="fb-tab-count">' + cnt + '/' + V + (goldTik ? ' ✦' : '') + '</span>' +
              '</button>';
    }
    html += '</div>';

    /* Defter sayfası */
    html += '<div class="fb-page">';
    html += '<div class="fb-page-head">' +
              '<span class="fb-page-name">' + esc(seriAd) + '</span>' +
              '<span class="fb-progress-num"><b>' + ownedV + '</b>/' + V + '</span>' +
            '</div>';
    html += '<div class="fb-progress-bar" aria-hidden="true">' +
              '<span class="fb-progress-fill" style="width:' + pct + '%"></span>' +
            '</div>';

    /* Tamamlama ödül çipleri (bir kez; kilitli → hazır → alındı) */
    html += '<div class="fb-chips">';
    for (i = 0; i < REWARDS.length; i++) {
      var rw = REWARDS[i];
      var done = rewardClaimed(curSeri, rw.at);
      var ready = !done && ownedV >= rw.at;
      var cls = done ? ' done' : (ready ? ' ready' : ' locked');
      var albl = seriAd + ' ' + rw.at + '/' + V + ' ödülü: ' + rw.kabuk + ' Kabuk — ' +
                 (done ? 'alındı' : (ready ? 'hazır, almak için dokun' : 'henüz kilitli'));
      html += '<button class="fb-chip' + cls + '" data-act="chip" data-at="' + rw.at + '"' +
                ' data-kabuk="' + rw.kabuk + '" aria-label="' + esc(albl) + '">' +
                '<b>' + rw.at + '/' + V + '</b>' +
                '<small>' + ic('shell', '🐚') + (done ? 'Alındı' : rw.kabuk + ' Kabuk') + '</small>' +
              '</button>';
    }
    html += '</div>';

    /* 8 varyant yuvası + Altın Şeref Yuvası */
    html += '<div class="fb-grid">';
    for (v = 0; v < V; v++) {
      var n = rec.variants[v] | 0;
      if (n > 0) {
        html += '<button class="fb-cell owned" data-act="cell" data-v="' + v + '"' +
                  ' aria-label="' + esc(seriAd) + ' desen ' + (v + 1) +
                  (n > 1 ? ' — ' + n + ' adet' : '') + '">' +
                  stampArt(curSeri, v, { count:n }) +
                '</button>';
      } else {
        // eksik = soluk desen silüeti (nadirlik sızdırmaz — desen zaten seri bilgisi)
        html += '<button class="fb-cell missing" data-act="cell" data-v="' + v + '"' +
                  ' aria-label="' + esc(seriAd) + ' desen ' + (v + 1) + ' — henüz yok">' +
                  stampArt(curSeri, v, {}) +
                '</button>';
      }
    }
    var gN = rec.golden | 0;
    if (gN > 0) {
      html += '<button class="fb-cell gold owned" data-act="cell" data-v="gold"' +
                ' aria-label="Altın Şeref Yuvası — ' + gN + ' altın folyo">' +
                stampArt(curSeri, 0, { golden:true, count:gN }) +
              '</button>';
    } else {
      html += '<button class="fb-cell gold missing" data-act="cell" data-v="gold"' +
                ' aria-label="Altın Şeref Yuvası — henüz boş">' +
                goldEmptySVG() +
              '</button>';
    }
    html += '</div>';

    html += '<p class="fb-note">Açtığın her folyo kendiliğinden buraya yapışır — ' +
            'hiçbir şey kaybolmaz.</p>';
    html += '</div>'; // /fb-page

    /* Araç Rafı */
    var T = (Yuvo.data && Yuvo.data.TOOLS) || {};
    var toolIds = [];
    for (var tid in T) toolIds.push(tid);
    if (toolIds.length) {
      var ownedTools = Array.isArray(s.tools) ? s.tools : [];
      html += '<div class="fb-shelf">';
      html += '<div class="fb-shelf-head"><h3 class="fb-shelf-title">Araç Rafı</h3>' +
              '<span class="fb-shelf-sub">Araçlar yalnız görünümü değiştirir</span></div>';
      html += '<div class="fb-tools">';
      for (i = 0; i < toolIds.length; i++) {
        var id2 = toolIds[i];
        var meta = T[id2] || {};
        var has = ownedTools.indexOf(id2) !== -1;
        var active = has && s.activeTool === id2;
        var cls2 = has ? ' owned' + (active ? ' active' : '') : ' locked';
        var lbl2 = (meta.ad || id2) + (active ? ' — seçili araç'
                    : (has ? ' — seçmek için dokun' : ' — kilitli: ' + toolLockNote(id2)));
        html += '<button class="fb-tool' + cls2 + '" data-act="tool" data-id="' + esc(id2) + '"' +
                  ' aria-label="' + esc(lbl2) + '">' +
                  (active ? '<span class="fb-tool-check" aria-hidden="true">' +
                    ico('check', '✓') + '</span>' : '') +
                  (!has ? '<span class="fb-tool-lock" aria-hidden="true">' + lockSVG() +
                    '</span>' : '') +
                  '<span class="fb-tool-art' + (has ? '' : ' sil') + '" aria-hidden="true">' +
                    toolArt(id2) + '</span>' +
                  '<span class="fb-tool-name">' + esc(meta.ad || id2) + '</span>' +
                  '<span class="fb-tool-tag' + (active ? ' on' : '') + '">' +
                    (active ? 'Seçili' : esc(toolTagText(id2, has))) + '</span>' +
                '</button>';
      }
      html += '</div></div>';
    }

    el.innerHTML = html;
  }

  /* ---------- etkileşim (delege tek dinleyici) ---------- */
  function handleClick (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act');
    var map = seriesMap();
    var seri = map[curSeri] || {};
    var seriAd = seri.ad || curSeri;

    if (act === 'tab') {
      var sid = b.getAttribute('data-seri');
      if (sid && sid !== curSeri) {
        curSeri = sid;
        play('page');
        render();
      }
    } else if (act === 'chip') {
      var at = parseInt(b.getAttribute('data-at'), 10) || 0;
      var kabuk = parseInt(b.getAttribute('data-kabuk'), 10) || 0;
      if (rewardClaimed(curSeri, at)) {
        toast('Bu ödül alındı — mühür defterde!');
      } else if (variantOwnedCount(curSeri) >= at) {
        if (claimReward(curSeri, at, kabuk)) {
          play('fanfare');
          toast('+' + kabuk + ' Kabuk — ' + seriAd + ' ödülü!');
          render();
        }
      } else {
        play('click');
        var kalan = at - variantOwnedCount(curSeri);
        toast(kalan + ' desen daha — sonra ' + kabuk + ' Kabuk senin!');
      }
    } else if (act === 'cell') {
      var vAttr = b.getAttribute('data-v');
      var rec = bookRec(curSeri);
      if (vAttr === 'gold') {
        if ((rec.golden | 0) > 0) {
          play('stampSlap');
          if (Yuvo.modal) {
            Yuvo.modal('<div class="fb-modal">' +
              '<div class="fb-modal-art">' + stampArt(curSeri, 0, { golden:true, count:rec.golden | 0 }) + '</div>' +
              '<h2 class="fb-modal-name">Altın Şeref Yuvası</h2>' +
              '<p class="fb-modal-sub">' + esc(seriAd) + ' · ×' + (rec.golden | 0) + '</p>' +
              '<p class="fb-modal-txt">Altın folyo bulduğun gün bütün ada ışıdı!</p>' +
            '</div>');
          }
        } else {
          play('click');
          toast('Altın folyo çok nadir — ama her Bekçi bir gün bulur!');
        }
      } else {
        var v = parseInt(vAttr, 10) || 0;
        var n = rec.variants[v] | 0;
        if (n > 0) {
          play('stampSlap');
          if (Yuvo.modal) {
            Yuvo.modal('<div class="fb-modal">' +
              '<div class="fb-modal-art">' + stampArt(curSeri, v, { count:n }) + '</div>' +
              '<h2 class="fb-modal-name">' + esc(seriAd) + '</h2>' +
              '<p class="fb-modal-sub">Desen ' + (v + 1) + ' / ' + variantCount() +
                (n > 1 ? ' · ×' + n : '') + '</p>' +
              '<p class="fb-modal-txt">Bu folyoyu sen açtın, deftere sen kazandırdın!</p>' +
            '</div>');
          }
        } else {
          play('click');
          toast('Bu desen henüz defterde yok — yumurta açmaya devam!');
        }
      }
    } else if (act === 'tool') {
      var id = b.getAttribute('data-id');
      var s = st();
      var ownedTools = Array.isArray(s.tools) ? s.tools : [];
      if (ownedTools.indexOf(id) !== -1) {
        if (s.activeTool === id) {
          toast('Bu araç zaten elinde!');
        } else {
          var ok = !!(Yuvo.engine && Yuvo.engine.setTool && Yuvo.engine.setTool(id));
          if (ok) {
            play('click');
            var meta = toolMeta(id) || {};
            toast('Araç seçildi: ' + (meta.ad || id));
          }
          render();
        }
      } else {
        play('click');
        toast(toolLockNote(id));
      }
    }
  }

  /* ---------- sahne API ---------- */
  Yuvo.scenes.foilbook = {
    mount: function (rootEl) {
      el = document.createElement('div');
      el.className = 'fb-scene';
      rootEl.appendChild(el);
      el.addEventListener('click', handleClick);
      onState = function () { render(); };
      document.addEventListener('yuvo:state', onState);
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
