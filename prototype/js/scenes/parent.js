/* Yuvo — Ebeveyn Paneli (parent.js)
 * Sahne sözleşmesi: Yuvo.scenes.parent = { mount(rootEl, params), unmount() }
 * Vanilla JS, IIFE, ES module yok, dış kaynak yok. Tüm UI Türkçe.
 */
(function (global) {
  'use strict';

  var Yuvo = global.Yuvo = global.Yuvo || {};
  Yuvo.scenes = Yuvo.scenes || {};

  /* ---------------------------------------------------------------------
   * Gömülü varsayılanlar (Yuvo.data yoksa bunlar kullanılır)
   * ------------------------------------------------------------------- */
  var DEFAULT_PACKS = [
    { id: 'tekli', ad: 'Çıtlat Bakalım', adet: 1, tl: 9.99, garanti: 'Standart oranlar', persona: 'Bir kere deneyelim' },
    { id: 'cep', ad: 'Cep Sepeti', adet: 5, tl: 24.99, garanti: 'En az 1 Az Bulunur', persona: 'Haftalık harçlık' },
    { id: 'haftalik', ad: 'Haftalık Sepet', adet: 10, tl: 39.99, garanti: 'En az 1 Nadir', persona: 'Her cumartesi', populer: true },
    { id: 'kesif', ad: 'Keşif Kolisi', adet: 25, tl: 79.99, garanti: 'En az 3 Nadir', persona: 'Karne / ara ödül' },
    { id: 'kasa', ad: 'Koleksiyoncu Kasası', adet: 50, tl: 129.99, garanti: 'En az 1 Destansı + 5 Nadir', persona: 'Doğum günü' },
    { id: 'kumbara', ad: 'Sezon Kumbarası', adet: 100, tl: 199.99, garanti: '1 seçmeli parça + 2 Destansı + 10 Nadir', persona: 'Bayram hediyesi' }
  ];

  var DEFAULT_CLUB = { ad: 'Yuvo Club', fiyat: 79.99, bonusYuzde: 10, gunlukYumurta: 1, kilerEk: 1 };

  var DEFAULT_ODDS = [
    { ad: 'Yaygın', oran: '%55' },
    { ad: 'Az Bulunur', oran: '%25' },
    { ad: 'Nadir', oran: '%14' },
    { ad: 'Destansı', oran: '%4,6' },
    { ad: 'Efsanevi', oran: '%0,9 + kötü şans koruması' },
    { ad: 'Gizli Pufi', oran: '%0,5' }
  ];

  var DEFAULT_STORE_LIMITS = {
    varsayilanAylik: 400,
    secenekler: [0, 100, 400, 750, 1500],
    sogumaSaat: 24,
    kilerGunluk: 5
  };

  var DEMO_UYARI = 'DEMO — gerçek ödeme alınmaz';
  var DEFAULT_PIN = '1234';
  var LOCK_SECONDS = 30;
  var MAX_TRIES = 3;

  /* ---------------------------------------------------------------------
   * Savunmacı motor erişimi
   * ------------------------------------------------------------------- */
  function data(key, fallback) {
    try {
      if (Yuvo.data && Yuvo.data[key]) return Yuvo.data[key];
    } catch (e) {}
    return fallback;
  }

  function packs() { return data('PACKS', DEFAULT_PACKS) || DEFAULT_PACKS; }
  function club() { return data('CLUB', DEFAULT_CLUB) || DEFAULT_CLUB; }
  function odds() { return data('ODDS', DEFAULT_ODDS) || DEFAULT_ODDS; }
  function limits() { return data('STORE_LIMITS', DEFAULT_STORE_LIMITS) || DEFAULT_STORE_LIMITS; }

  function state() {
    var s = null;
    try { s = Yuvo.engine && Yuvo.engine.state; } catch (e) {}
    if (!s || typeof s !== 'object') s = {};
    if (!s.parent || typeof s.parent !== 'object') {
      s.parent = { pin: DEFAULT_PIN, limitTL: limits().varsayilanAylik, spentTL: 0, ay: '', clubActive: false, limitRaiseTs: 0 };
    }
    if (!s.kiler || typeof s.kiler !== 'object') s.kiler = { adet: 0, bugunAcilan: 0 };
    if (!s.wishes || Object.prototype.toString.call(s.wishes) !== '[object Array]') s.wishes = [];
    return s;
  }

  function engineCall(name, arg, fallback) {
    try {
      if (Yuvo.engine && typeof Yuvo.engine[name] === 'function') {
        return Yuvo.engine[name](arg);
      }
    } catch (e) {}
    return fallback;
  }

  function save() { engineCall('save', undefined, null); }

  function toast(msg) {
    try {
      if (typeof Yuvo.toast === 'function') { Yuvo.toast(msg); return; }
    } catch (e) {}
    try { console.log('[Yuvo]', msg); } catch (e2) {}
  }

  function refreshGame() {
    try { if (typeof Yuvo.refresh === 'function') Yuvo.refresh(); } catch (e) {}
  }

  function goHome() {
    try {
      if (typeof Yuvo.go === 'function') { Yuvo.go('home'); return; }
    } catch (e) {}
  }

  function pufiById(id) {
    try {
      if (Yuvo.data && typeof Yuvo.data.pufiById === 'function') return Yuvo.data.pufiById(id);
    } catch (e) {}
    return null;
  }

  function pufiSVG(pufi) {
    try {
      if (Yuvo.art && typeof Yuvo.art.pufiSVG === 'function') {
        var s = Yuvo.art.pufiSVG(pufi, { mood: 'sakin' });
        if (typeof s === 'string' && s) return s;
      }
    } catch (e) {}
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="#E5E7EB"></circle></svg>';
  }

  /* ---------------------------------------------------------------------
   * Yardımcılar
   * ------------------------------------------------------------------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function tl(n) {
    var v = Number(n);
    if (!isFinite(v)) v = 0;
    var s = v.toFixed(2).replace('.', ',');
    var parts = s.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '₺' + parts.join(',');
  }

  function tlInt(n) {
    var v = Number(n);
    if (!isFinite(v)) v = 0;
    return '₺' + String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function unitPrice(p) {
    var adet = Number(p && p.adet) || 1;
    var fiyat = Number(p && p.tl) || 0;
    return fiyat / adet;
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function isBigRarity(r) {
    var s = String(r || '').toLocaleLowerCase('tr');
    return s.indexOf('efsanev') === 0 || s.indexOf('gizli') === 0;
  }

  /* ---------------------------------------------------------------------
   * Sahne durumu (mount başına)
   * ------------------------------------------------------------------- */
  var root = null;          // sahne kökü
  var appEl = null;         // #app
  var listeners = [];       // [{el, type, fn}]
  var timers = [];          // setTimeout/setInterval id
  var intervals = [];
  var tries = 0;
  var lockUntil = 0;
  var pinBuf = '';
  var activeTab = 'magaza';
  var unlocked = false;
  var openModal = null;

  function on(node, type, fn) {
    if (!node) return;
    node.addEventListener(type, fn);
    listeners.push({ el: node, type: type, fn: fn });
  }

  function later(fn, ms) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }

  function every(fn, ms) {
    var id = setInterval(fn, ms);
    intervals.push(id);
    return id;
  }

  function clearAllTimers() {
    var i;
    for (i = 0; i < timers.length; i++) { clearTimeout(timers[i]); }
    for (i = 0; i < intervals.length; i++) { clearInterval(intervals[i]); }
    timers = [];
    intervals = [];
  }

  function clearAllListeners() {
    for (var i = 0; i < listeners.length; i++) {
      var L = listeners[i];
      try { L.el.removeEventListener(L.type, L.fn); } catch (e) {}
    }
    listeners = [];
  }

  /* ---------------------------------------------------------------------
   * PIN KAPISI
   * ------------------------------------------------------------------- */
  function currentPin() {
    var s = state();
    var p = s.parent && s.parent.pin;
    if (typeof p === 'string' && /^\d{4}$/.test(p)) return p;
    return DEFAULT_PIN;
  }

  function renderGate() {
    if (!root) return;
    root.innerHTML = '';
    root.className = 'par-root';

    var wrap = el('section', 'par-gate');
    wrap.setAttribute('aria-label', 'Ebeveyn paneli kilidi');

    wrap.appendChild(el('h1', 'par-gate-title', 'Ebeveyn Paneli'));
    wrap.appendChild(el('p', 'par-gate-sub', 'Devam etmek için 4 haneli PIN girin.'));

    var dots = el('div', 'par-dots');
    dots.setAttribute('aria-label', 'PIN girişi');
    for (var d = 0; d < 4; d++) dots.appendChild(el('span', 'par-dot'));
    wrap.appendChild(dots);

    var live = el('p', 'par-gate-msg');
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    wrap.appendChild(live);

    var pad = el('div', 'par-keypad');
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'sil', '0', 'ok'];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var b = el('button', 'par-key');
      b.type = 'button';
      if (k === 'sil') {
        b.className = 'par-key par-key-alt';
        b.setAttribute('aria-label', 'Sil');
        b.textContent = '⌫';
        b.setAttribute('data-key', 'del');
      } else if (k === 'ok') {
        b.className = 'par-key par-key-ok';
        b.setAttribute('aria-label', 'Onayla');
        b.textContent = '✓';
        b.setAttribute('data-key', 'ok');
      } else {
        b.textContent = k;
        b.setAttribute('data-key', k);
      }
      pad.appendChild(b);
    }
    wrap.appendChild(pad);

    var hint = el('p', 'par-gate-hint', 'DEMO — varsayılan PIN: 1234');
    wrap.appendChild(hint);

    var back = el('button', 'par-btn par-btn-ghost par-gate-back', 'Oyuna dön');
    back.type = 'button';
    wrap.appendChild(back);

    root.appendChild(wrap);

    function paintDots() {
      var ds = dots.querySelectorAll('.par-dot');
      for (var j = 0; j < ds.length; j++) {
        if (j < pinBuf.length) ds[j].classList.add('is-on');
        else ds[j].classList.remove('is-on');
      }
    }

    function setMsg(t, kind) {
      live.textContent = t || '';
      live.className = 'par-gate-msg' + (kind ? ' par-msg-' + kind : '');
    }

    function locked() { return Date.now() < lockUntil; }

    function setKeysDisabled(v) {
      var bs = pad.querySelectorAll('.par-key');
      for (var j = 0; j < bs.length; j++) bs[j].disabled = !!v;
    }

    function startLockCountdown() {
      setKeysDisabled(true);
      wrap.classList.add('is-locked');
      var tick = function () {
        var left = Math.ceil((lockUntil - Date.now()) / 1000);
        if (left <= 0) {
          setKeysDisabled(false);
          wrap.classList.remove('is-locked');
          tries = 0;
          setMsg('Tekrar deneyebilirsiniz.', null);
          return;
        }
        setMsg(left + ' saniye sonra tekrar deneyebilirsiniz.', 'err');
        later(tick, 1000);
      };
      tick();
    }

    function submit() {
      if (locked()) return;
      if (pinBuf.length !== 4) {
        setMsg('4 hane girin.', 'warn');
        return;
      }
      if (pinBuf === currentPin()) {
        unlocked = true;
        pinBuf = '';
        tries = 0;
        renderPanel();
        return;
      }
      tries++;
      pinBuf = '';
      paintDots();
      if (tries >= MAX_TRIES) {
        lockUntil = Date.now() + LOCK_SECONDS * 1000;
        startLockCountdown();
      } else {
        setMsg('PIN yanlış. Kalan deneme: ' + (MAX_TRIES - tries), 'err');
      }
    }

    on(pad, 'click', function (ev) {
      var t = ev.target;
      while (t && t !== pad && !t.getAttribute) t = t.parentNode;
      if (!t || t === pad) return;
      var key = t.getAttribute('data-key');
      if (!key) return;
      if (locked()) return;
      if (key === 'del') {
        pinBuf = pinBuf.slice(0, -1);
        paintDots();
        setMsg('', null);
        return;
      }
      if (key === 'ok') { submit(); return; }
      if (pinBuf.length < 4) {
        pinBuf += key;
        paintDots();
        setMsg('', null);
        if (pinBuf.length === 4) later(submit, 120);
      }
    });

    on(back, 'click', function () { goHome(); });

    if (locked()) startLockCountdown();
    paintDots();
  }

  /* ---------------------------------------------------------------------
   * ÜST ŞERİT
   * ------------------------------------------------------------------- */
  function spentAndLimit() {
    var s = state();
    var spent = Number(s.parent && s.parent.spentTL) || 0;
    var lim = s.parent && s.parent.limitTL;
    if (typeof lim !== 'number' || !isFinite(lim)) lim = limits().varsayilanAylik;
    return { spent: spent, limit: lim };
  }

  function renderStrip() {
    var sl = spentAndLimit();
    var pct = sl.limit > 0 ? Math.min(100, Math.round((sl.spent / sl.limit) * 100)) : (sl.spent > 0 ? 100 : 0);
    var tone = pct >= 100 ? 'is-over' : (pct >= 80 ? 'is-warn' : '');

    var strip = el('header', 'par-strip');
    var row = el('div', 'par-strip-row');

    var info = el('div', 'par-strip-info');
    info.appendChild(el('div', 'par-strip-main',
      'Bu ay: <strong class="par-num">' + esc(tlInt(sl.spent)) + '</strong> / limit <strong class="par-num">' + esc(tlInt(sl.limit)) + '</strong>'));

    var bar = el('div', 'par-bar ' + tone);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-label', 'Aylık harcama oranı');
    var fill = el('span', 'par-bar-fill');
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    info.appendChild(bar);

    var note = 'Sayaç her ayın 1’inde yenilenir.';
    if (pct >= 100) note = 'Aylık sınıra ulaşıldı · sayaç her ayın 1’inde yenilenir.';
    else if (pct >= 80) note = 'Sınırın %80’ini geçtiniz · sayaç her ayın 1’inde yenilenir.';
    info.appendChild(el('div', 'par-strip-note', esc(note)));

    row.appendChild(info);

    var back = el('button', 'par-btn par-btn-ghost par-strip-back', 'Oyuna dön');
    back.type = 'button';
    on(back, 'click', function () { goHome(); });
    row.appendChild(back);

    strip.appendChild(row);
    return strip;
  }

  function renderTabs() {
    var nav = el('nav', 'par-tabs');
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Ebeveyn paneli bölümleri');
    var defs = [
      { id: 'magaza', ad: 'Mağaza' },
      { id: 'ayarlar', ad: 'Ayarlar' },
      { id: 'rapor', ad: 'Rapor' }
    ];
    for (var i = 0; i < defs.length; i++) {
      var b = el('button', 'par-tab' + (defs[i].id === activeTab ? ' is-active' : ''), esc(defs[i].ad));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('data-tab', defs[i].id);
      b.setAttribute('aria-selected', defs[i].id === activeTab ? 'true' : 'false');
      nav.appendChild(b);
    }
    on(nav, 'click', function (ev) {
      var t = ev.target;
      while (t && t !== nav && !(t.getAttribute && t.getAttribute('data-tab'))) t = t.parentNode;
      if (!t || t === nav) return;
      var id = t.getAttribute('data-tab');
      if (!id || id === activeTab) return;
      activeTab = id;
      renderPanel();
    });
    return nav;
  }

  /* ---------------------------------------------------------------------
   * MAĞAZA SEKMESİ
   * ------------------------------------------------------------------- */
  function renderWishJar() {
    var s = state();
    var card = el('section', 'par-card par-wish');
    card.appendChild(el('h2', 'par-card-title', 'Dilek Kavanozu'));
    card.appendChild(el('p', 'par-card-sub', 'Çocuğunuzun oyundan işaretlediği Pufi’ler. Satın alma zorunluluğu yoktur.'));

    var wishes = s.wishes || [];
    if (!wishes.length) {
      card.appendChild(el('p', 'par-empty', 'Henüz dilek yok'));
      return card;
    }

    var list = el('ul', 'par-wish-list');
    var bigSeen = false;

    for (var i = 0; i < wishes.length; i++) {
      var w = wishes[i] || {};
      var pid = w.pufiId;
      var p = pufiById(pid) || { id: pid, ad: String(pid || 'Pufi'), rarity: '—' };
      if (isBigRarity(p.rarity)) bigSeen = true;

      var li = el('li', 'par-wish-row');
      var art = el('span', 'par-wish-art', pufiSVG(p));
      art.setAttribute('aria-hidden', 'true');
      li.appendChild(art);

      var meta = el('span', 'par-wish-meta');
      meta.appendChild(el('span', 'par-wish-name', esc(p.ad || pid)));
      var rInfo = (window.Yuvo && Yuvo.data && Yuvo.data.RARITIES && Yuvo.data.RARITIES[p.rarity]) || null;
      meta.appendChild(el('span', 'par-wish-rarity', esc((rInfo && rInfo.ad) || p.rarity || '—')));
      li.appendChild(meta);

      var rm = el('button', 'par-btn par-btn-quiet par-wish-rm', 'Kaldır');
      rm.type = 'button';
      rm.setAttribute('data-wish', String(pid));
      rm.setAttribute('aria-label', (p.ad || pid) + ' dileğini kaldır');
      li.appendChild(rm);

      list.appendChild(li);
    }
    card.appendChild(list);

    if (bigSeen) {
      card.appendChild(el('p', 'par-note par-note-warn',
        'Efsanevi vaat olarak satılmaz — oyunla gelir. Bu dilekler için paket önerilmez.'));
    }

    on(list, 'click', function (ev) {
      var t = ev.target;
      while (t && t !== list && !(t.getAttribute && t.getAttribute('data-wish'))) t = t.parentNode;
      if (!t || t === list) return;
      var id = t.getAttribute('data-wish');
      var done = engineCall('clearWish', id, null);
      if (done === null) {
        var st = state();
        var arr = st.wishes || [];
        for (var i = arr.length - 1; i >= 0; i--) {
          if (arr[i] && String(arr[i].pufiId) === String(id)) arr.splice(i, 1);
        }
        st.wishes = arr;
        save();
      }
      toast('Dilek kaldırıldı');
      renderPanel();
    });

    return card;
  }

  function renderPacks() {
    var sec = el('section', 'par-card par-packs-card');
    sec.appendChild(el('h2', 'par-card-title', 'Yumurta Paketleri'));
    sec.appendChild(el('p', 'par-card-sub', 'Fiyatlar demo amaçlıdır; ' + DEMO_UYARI.toLocaleLowerCase('tr') + '.'));

    var grid = el('div', 'par-packs');
    var list = packs();
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var card = el('article', 'par-pack' + (p.populer ? ' is-popular' : ''));
      card.setAttribute('data-pack', String(p.id));
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', (p.ad || '') + ', ' + p.adet + ' yumurta, ' + tl(p.tl));

      if (p.populer) card.appendChild(el('span', 'par-ribbon', 'EN POPÜLER'));

      card.appendChild(el('h3', 'par-pack-name', esc(p.ad)));
      card.appendChild(el('p', 'par-pack-count', esc(p.adet + ' yumurta')));
      card.appendChild(el('p', 'par-pack-price par-num', esc(tl(p.tl))));
      card.appendChild(el('p', 'par-pack-unit par-num', 'yumurta başına ' + esc(tl(unitPrice(p)))));
      card.appendChild(el('span', 'par-badge', esc(p.garanti)));
      card.appendChild(el('p', 'par-pack-persona', esc(p.persona)));

      var buy = el('button', 'par-btn par-btn-primary par-pack-buy', 'İncele ve al');
      buy.type = 'button';
      buy.setAttribute('data-pack', String(p.id));
      card.appendChild(buy);

      grid.appendChild(card);
    }
    sec.appendChild(grid);

    function openFor(id) {
      var all = packs();
      for (var j = 0; j < all.length; j++) {
        if (String(all[j].id) === String(id)) { openPurchase(all[j]); return; }
      }
    }

    on(grid, 'click', function (ev) {
      var t = ev.target;
      while (t && t !== grid && !(t.getAttribute && t.getAttribute('data-pack'))) t = t.parentNode;
      if (!t || t === grid) return;
      openFor(t.getAttribute('data-pack'));
    });

    on(grid, 'keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      if (!t.classList || !t.classList.contains('par-pack')) return;
      ev.preventDefault();
      openFor(t.getAttribute('data-pack'));
    });

    return sec;
  }

  function renderClub() {
    var c = club();
    var s = state();
    var isOn = !!(s.parent && s.parent.clubActive);

    var card = el('section', 'par-card par-club');
    var head = el('div', 'par-club-head');
    head.appendChild(el('h2', 'par-card-title', esc(c.ad || 'Yuvo Club')));
    head.appendChild(el('span', 'par-club-price par-num', 'aylık ' + esc(tl(c.fiyat))));
    card.appendChild(head);

    var ul = el('ul', 'par-list');
    ul.appendChild(el('li', null, '+%' + esc(c.bonusYuzde) + ' bonus yumurta'));
    ul.appendChild(el('li', null, 'günde ' + esc(c.gunlukYumurta) + ' Club yumurtası'));
    ul.appendChild(el('li', null, 'kilerden +' + esc(c.kilerEk) + ' açma hakkı'));
    card.appendChild(ul);

    card.appendChild(el('p', 'par-status', isOn ? 'Durum: açık' : 'Durum: kapalı'));

    var btn = el('button', 'par-btn ' + (isOn ? 'par-btn-outline' : 'par-btn-primary'), isOn ? 'Üyeliği kapat' : 'Üyeliği aç');
    btn.type = 'button';
    on(btn, 'click', function () {
      var res = engineCall('toggleClub', undefined, null);
      if (res === null) {
        var st = state();
        st.parent.clubActive = !st.parent.clubActive;
        save();
        res = st.parent.clubActive;
      }
      toast(res ? 'Yuvo Club açıldı — DEMO, ödeme alınmadı' : 'Yuvo Club kapatıldı');
      refreshGame();
      renderPanel();
    });
    card.appendChild(btn);

    card.appendChild(el('p', 'par-note', DEMO_UYARI));
    return card;
  }

  function oddsTableHTML() {
    var list = odds();
    var html = '<table class="par-odds"><caption class="par-sr">Nadirlik oranları</caption><thead><tr><th scope="col">Nadirlik</th><th scope="col">Oran</th></tr></thead><tbody>';
    for (var i = 0; i < list.length; i++) {
      html += '<tr><th scope="row">' + esc(list[i].ad) + '</th><td class="par-num">' + esc(list[i].oran) + '</td></tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function transparencyBodyHTML() {
    return oddsTableHTML() +
      '<ul class="par-list par-rules">' +
      '<li>Kopya koruması: aynı parçanın tekrar gelme olasılığı her kopyada düşer.</li>' +
      '<li>Kötü şans koruması: 15 yumurtada Nadir çıkmazsa 16.’da garantidir.</li>' +
      '<li>Efsanevi vaat olarak satılmaz — hiçbir pakette Efsanevi garantisi veya seçimi yoktur.</li>' +
      '</ul>';
  }

  function renderTransparency() {
    var card = el('section', 'par-card par-transp');
    card.appendChild(el('h2', 'par-card-title', 'Şeffaflık'));
    card.appendChild(el('p', 'par-card-sub', 'Yumurtadan ne çıkabileceğini ve koruma kurallarını görün.'));
    var btn = el('button', 'par-btn par-btn-outline', 'Ne çıkabilir?');
    btn.type = 'button';
    on(btn, 'click', function () {
      showModal('Şeffaflık Kartı', transparencyBodyHTML(), [{ label: 'Kapat', kind: 'primary', act: closeModal }]);
    });
    card.appendChild(btn);
    return card;
  }

  function renderPantry() {
    var s = state();
    var c = club();
    var lim = limits();
    var gunluk = Number(lim.kilerGunluk) || 5;
    var clubGunluk = gunluk + (Number(c.kilerEk) || 1);
    var adet = Number(s.kiler && s.kiler.adet) || 0;
    var bugun = Number(s.kiler && s.kiler.bugunAcilan) || 0;

    var card = el('section', 'par-card par-pantry');
    card.appendChild(el('h2', 'par-card-title', 'Kiler durumu'));
    card.appendChild(el('p', 'par-pantry-main',
      'Kilerde <strong class="par-num">' + esc(adet) + '</strong> yumurta bekliyor · günde en çok ' +
      esc(gunluk) + ' açılır (Club: ' + esc(clubGunluk) + ')'));
    card.appendChild(el('p', 'par-card-sub', 'Bugün açılan: ' + esc(bugun)));
    card.appendChild(el('p', 'par-note',
      'Satın alınan yumurtalar doğrudan çocuğun sepetine düşmez; her gün birkaçı açılır.'));
    return card;
  }

  function renderStoreTab(host) {
    host.appendChild(renderWishJar());
    host.appendChild(renderPacks());
    host.appendChild(renderClub());
    host.appendChild(renderTransparency());
    host.appendChild(renderPantry());
  }

  /* ---------------------------------------------------------------------
   * SATIN ALMA AKIŞI (3 adım)
   * ------------------------------------------------------------------- */
  function openPurchase(p) {
    var sl = spentAndLimit();
    var after = sl.spent + (Number(p.tl) || 0);

    var body =
      '<div class="par-buy">' +
      '<p class="par-buy-head"><strong>' + esc(p.ad) + '</strong> · ' + esc(p.adet) + ' yumurta</p>' +
      '<p class="par-buy-price par-num">' + esc(tl(p.tl)) + ' <span class="par-buy-unit">(yumurta başına ' + esc(tl(unitPrice(p))) + ')</span></p>' +
      '<p class="par-badge par-badge-block">' + esc(p.garanti) + '</p>' +
      '<p class="par-buy-spend par-num">Bu ay: ' + esc(tlInt(sl.spent)) + ' → bu alımla ' + esc(tlInt(after)) + ' / limit ' + esc(tlInt(sl.limit)) + '</p>' +
      '<h3 class="par-sub-title">Ne çıkabilir?</h3>' +
      transparencyBodyHTML() +
      '<p class="par-demo">' + esc(DEMO_UYARI) + '</p>' +
      '</div>';

    showModal('Satın alma özeti', body, [
      { label: 'Vazgeç', kind: 'quiet', act: closeModal },
      { label: 'Onayla', kind: 'primary', act: function () { doPurchase(p); } }
    ]);
  }

  function doPurchase(p) {
    var res = engineCall('buyPack', p.id, null);
    if (res === null || typeof res !== 'object') {
      // Motor yoksa yerel demo davranışı
      var s = state();
      var sl = spentAndLimit();
      if (sl.limit > 0 && sl.spent + (Number(p.tl) || 0) > sl.limit) {
        res = { ok: false, reason: 'limit' };
      } else if (sl.limit === 0) {
        res = { ok: false, reason: 'limit' };
      } else {
        s.parent.spentTL = sl.spent + (Number(p.tl) || 0);
        s.kiler.adet = (Number(s.kiler.adet) || 0) + (Number(p.adet) || 0);
        save();
        res = { ok: true };
      }
    }

    if (res.ok) {
      closeModal();
      toast('Kilere ' + p.adet + ' yumurta eklendi — DEMO, ödeme alınmadı');
      refreshGame();
      renderPanel();
      return;
    }

    if (res.reason === 'limit') {
      showModal('Alım tamamlanmadı',
        '<p class="par-msg-err">Bu ayın sınırına ulaşıldı. Sınırı Ayarlar’dan değiştirebilirsiniz.</p>',
        [
          { label: 'Kapat', kind: 'quiet', act: closeModal },
          { label: 'Ayarlar’a git', kind: 'primary', act: function () { closeModal(); activeTab = 'ayarlar'; renderPanel(); } }
        ]);
      return;
    }

    showModal('Alım tamamlanmadı',
      '<p class="par-msg-err">İşlem tamamlanamadı (bilinmiyor). Lütfen tekrar deneyin.</p>',
      [{ label: 'Kapat', kind: 'primary', act: closeModal }]);
  }

  /* ---------------------------------------------------------------------
   * AYARLAR SEKMESİ
   * ------------------------------------------------------------------- */
  function applyLimit(v) {
    var res = engineCall('setLimit', v, null);
    if (res === null || typeof res !== 'object') {
      var s = state();
      var old = Number(s.parent.limitTL);
      if (!isFinite(old)) old = limits().varsayilanAylik;
      s.parent.limitTL = v;
      if (v > old) {
        s.parent.limitRaiseTs = Date.now();
        save();
        toast('Yeni sınır 24 saat sonra etkin olur.');
        renderPanel();
        return;
      }
      save();
      toast('Aylık sınır ' + tlInt(v) + ' olarak güncellendi.');
      renderPanel();
      return;
    }
    if (res.ok) {
      toast('Aylık sınır ' + tlInt(v) + ' olarak güncellendi.');
    } else if (res.reason === 'soguma' || res.reason === 'cooldown') {
      toast('Sınır artırımı ' + (limits().sogumaSaat || 24) + ' saat sonra etkin olur.');
    } else {
      toast('Sınır değiştirilemedi (' + esc(res.reason || 'bilinmiyor') + ').');
    }
    renderPanel();
  }

  function renderLimitCard() {
    var s = state();
    var lim = limits();
    var opts = lim.secenekler || DEFAULT_STORE_LIMITS.secenekler;
    var cur = s.parent && s.parent.limitTL;
    if (typeof cur !== 'number' || !isFinite(cur)) cur = lim.varsayilanAylik;

    var card = el('section', 'par-card');
    card.appendChild(el('h2', 'par-card-title', 'Aylık harcama sınırı'));
    card.appendChild(el('p', 'par-card-sub', 'Sınır düşürme anında geçerlidir; artırma ' + esc(lim.sogumaSaat || 24) + ' saat sonra etkin olur.'));

    var group = el('div', 'par-choices');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Aylık sınır seçenekleri');
    for (var i = 0; i < opts.length; i++) {
      var v = opts[i];
      var b = el('button', 'par-choice' + (v === cur ? ' is-active' : ''), v === 0 ? 'Kapalı' : esc(tlInt(v)));
      b.type = 'button';
      b.setAttribute('data-limit', String(v));
      b.setAttribute('aria-pressed', v === cur ? 'true' : 'false');
      group.appendChild(b);
    }
    card.appendChild(group);

    var raiseTs = Number(s.parent && s.parent.limitRaiseTs) || 0;
    if (raiseTs > 0) {
      var hrs = Number(lim.sogumaSaat) || 24;
      var left = raiseTs + hrs * 3600000 - Date.now();
      if (left > 0) {
        var h = Math.ceil(left / 3600000);
        card.appendChild(el('p', 'par-note par-note-warn', 'Bekleyen artırım: yaklaşık ' + esc(h) + ' saat sonra etkin olur.'));
      }
    }

    on(group, 'click', function (ev) {
      var t = ev.target;
      while (t && t !== group && !(t.getAttribute && t.getAttribute('data-limit'))) t = t.parentNode;
      if (!t || t === group) return;
      var v = Number(t.getAttribute('data-limit'));
      if (v === cur) return;
      if (v >= 750) {
        showModal('Emin misiniz?',
          '<p>Bu, ayda 3+ büyük pakete denk. Emin misiniz?</p><p class="par-note">Seçilen sınır: <strong class="par-num">' + esc(tlInt(v)) + '</strong></p>',
          [
            { label: 'Vazgeç', kind: 'quiet', act: closeModal },
            { label: 'Evet, ayarla', kind: 'primary', act: function () { closeModal(); applyLimit(v); } }
          ]);
        return;
      }
      applyLimit(v);
    });

    return card;
  }

  function renderPinCard() {
    var card = el('section', 'par-card');
    card.appendChild(el('h2', 'par-card-title', 'PIN değiştir'));
    card.appendChild(el('p', 'par-card-sub', 'Eski PIN’i ve yeni 4 haneli PIN’i girin.'));

    var form = el('form', 'par-form');
    form.setAttribute('novalidate', 'novalidate');

    function field(id, label) {
      var w = el('div', 'par-field');
      var l = el('label', 'par-label', esc(label));
      l.setAttribute('for', id);
      var inp = document.createElement('input');
      inp.className = 'par-input par-num';
      inp.id = id;
      inp.type = 'password';
      inp.inputMode = 'numeric';
      inp.autocomplete = 'off';
      inp.maxLength = 4;
      inp.setAttribute('pattern', '\\d{4}');
      w.appendChild(l);
      w.appendChild(inp);
      return { wrap: w, input: inp };
    }

    var oldF = field('par-pin-old', 'Eski PIN');
    var newF = field('par-pin-new', 'Yeni PIN (4 hane)');
    form.appendChild(oldF.wrap);
    form.appendChild(newF.wrap);

    var msg = el('p', 'par-form-msg');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    form.appendChild(msg);

    var submit = el('button', 'par-btn par-btn-primary', 'PIN’i güncelle');
    submit.type = 'submit';
    form.appendChild(submit);

    on(form, 'submit', function (ev) {
      ev.preventDefault();
      var o = String(oldF.input.value || '');
      var n = String(newF.input.value || '');
      if (o !== currentPin()) {
        msg.textContent = 'Eski PIN yanlış.';
        msg.className = 'par-form-msg par-msg-err';
        return;
      }
      if (!/^\d{4}$/.test(n)) {
        msg.textContent = 'Yeni PIN 4 rakam olmalı.';
        msg.className = 'par-form-msg par-msg-err';
        return;
      }
      var ok = engineCall('setPin', n, null);
      if (ok === null) {
        var s = state();
        s.parent.pin = n;
        save();
        ok = true;
      }
      if (ok) {
        oldF.input.value = '';
        newF.input.value = '';
        msg.textContent = 'PIN güncellendi.';
        msg.className = 'par-form-msg par-msg-ok';
        toast('PIN güncellendi');
      } else {
        msg.textContent = 'PIN güncellenemedi.';
        msg.className = 'par-form-msg par-msg-err';
      }
    });

    card.appendChild(form);
    return card;
  }

  function renderResetCard() {
    var card = el('section', 'par-card par-danger');
    card.appendChild(el('h2', 'par-card-title', 'Tüm ilerlemeyi sıfırla (DEMO)'));
    card.appendChild(el('p', 'par-card-sub', 'Koleksiyon, kiler ve harcama sayacı temizlenir. Geri alınamaz.'));
    var btn = el('button', 'par-btn par-btn-danger', 'Sıfırla');
    btn.type = 'button';
    on(btn, 'click', function () {
      showModal('Sıfırlamayı onaylıyor musunuz?',
        '<p>Tüm ilerleme silinecek. Bu işlem geri alınamaz.</p><p class="par-note">' + esc(DEMO_UYARI) + '</p>',
        [
          { label: 'Vazgeç', kind: 'quiet', act: closeModal },
          {
            label: 'Evet, sıfırla', kind: 'danger', act: function () {
              var done = engineCall('reset', undefined, null);
              closeModal();
              if (done === null) {
                toast('Sıfırlama bu sürümde kullanılamıyor.');
              } else {
                toast('İlerleme sıfırlandı (DEMO)');
                refreshGame();
              }
              renderPanel();
            }
          }
        ]);
    });
    card.appendChild(btn);
    return card;
  }

  function renderSettingsTab(host) {
    host.appendChild(renderLimitCard());
    host.appendChild(renderPinCard());
    host.appendChild(renderResetCard());
  }

  /* ---------------------------------------------------------------------
   * RAPOR SEKMESİ
   * ------------------------------------------------------------------- */
  function buildReport() {
    var r = engineCall('spendReport', undefined, null);
    if (r && typeof r === 'object') return r;

    var s = state();
    var sl = spentAndLimit();
    var out = {
      ay: (s.parent && s.parent.ay) || '',
      spentTL: sl.spent,
      limitTL: sl.limit,
      paketler: [],
      yumurta: 0,
      pufi: 0
    };

    var purchases = s.purchases;
    if (Object.prototype.toString.call(purchases) === '[object Array]') {
      var byId = {};
      var all = packs();
      var map = {};
      for (var k = 0; k < all.length; k++) map[String(all[k].id)] = all[k];
      var total = 0;
      for (var i = 0; i < purchases.length; i++) {
        var pu = purchases[i] || {};
        var id = String(pu.packId || pu.id || pu.paketId || '');
        var def = map[id] || { ad: id || 'Paket', tl: Number(pu.tl) || 0, adet: Number(pu.adet) || 0 };
        if (!byId[id]) byId[id] = { ad: def.ad, adet: 0, tutar: 0 };
        byId[id].adet += 1;
        byId[id].tutar += Number(pu.tl != null ? pu.tl : def.tl) || 0;
        total += Number(pu.tl != null ? pu.tl : def.tl) || 0;
      }
      for (var key in byId) {
        if (Object.prototype.hasOwnProperty.call(byId, key)) out.paketler.push(byId[key]);
      }
      if (!out.spentTL && total) out.spentTL = total;
    }

    if (s.acilanYumurta != null) out.yumurta = Number(s.acilanYumurta) || 0;
    if (s.collection && typeof s.collection === 'object') {
      var n = 0;
      for (var c in s.collection) { if (Object.prototype.hasOwnProperty.call(s.collection, c)) n++; }
      out.pufi = n;
    }
    return out;
  }

  function renderReportTab(host) {
    var r = buildReport();

    var card = el('section', 'par-card');
    card.appendChild(el('h2', 'par-card-title', 'Harcama raporu'));
    card.appendChild(el('p', 'par-card-sub', 'Dönem: ' + esc(r.ay || 'bu ay')));

    var kpis = el('div', 'par-kpis');
    function kpi(label, value) {
      var b = el('div', 'par-kpi');
      b.appendChild(el('span', 'par-kpi-val par-num', esc(value)));
      b.appendChild(el('span', 'par-kpi-lbl', esc(label)));
      return b;
    }
    kpis.appendChild(kpi('Toplam harcama', tlInt(r.spentTL)));
    kpis.appendChild(kpi('Aylık limit', tlInt(r.limitTL)));
    kpis.appendChild(kpi('Açılan yumurta', String(Number(r.yumurta) || 0)));
    kpis.appendChild(kpi('Yeni Pufi', String(Number(r.pufi) || 0)));
    card.appendChild(kpis);

    var pk = (r.paketler && r.paketler.length) ? r.paketler : [];
    if (pk.length) {
      var html = '<table class="par-table"><thead><tr><th scope="col">Paket</th><th scope="col">Adet</th><th scope="col">Tutar</th></tr></thead><tbody>';
      for (var i = 0; i < pk.length; i++) {
        html += '<tr><th scope="row">' + esc(pk[i].ad) + '</th><td class="par-num">' + esc(pk[i].adet) +
          '</td><td class="par-num">' + esc(tl(pk[i].tutar)) + '</td></tr>';
      }
      html += '</tbody></table>';
      var wrap = el('div', 'par-table-wrap', html);
      card.appendChild(wrap);
    } else {
      card.appendChild(el('p', 'par-empty', 'Bu dönemde alım yok'));
    }

    card.appendChild(el('p', 'par-note', 'Bu rapor bir güven belgesidir; içinde satış teklifi yoktur.'));
    host.appendChild(card);
  }

  /* ---------------------------------------------------------------------
   * MODAL
   * ------------------------------------------------------------------- */
  function closeModal() {
    if (!openModal) return;
    try { if (openModal.parentNode) openModal.parentNode.removeChild(openModal); } catch (e) {}
    openModal = null;
    if (root) root.classList.remove('par-modal-open');
  }

  function showModal(title, bodyHTML, buttons) {
    closeModal();
    if (!root) return;

    var back = el('div', 'par-modal-back');
    var box = el('div', 'par-modal');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', String(title || ''));

    var head = el('div', 'par-modal-head');
    head.appendChild(el('h2', 'par-modal-title', esc(title || '')));
    var x = el('button', 'par-modal-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Kapat');
    head.appendChild(x);
    box.appendChild(head);

    box.appendChild(el('div', 'par-modal-body', bodyHTML || ''));

    var foot = el('div', 'par-modal-foot');
    var btns = buttons || [{ label: 'Kapat', kind: 'primary', act: closeModal }];
    for (var i = 0; i < btns.length; i++) {
      (function (def) {
        var cls = 'par-btn ';
        if (def.kind === 'primary') cls += 'par-btn-primary';
        else if (def.kind === 'danger') cls += 'par-btn-danger';
        else if (def.kind === 'quiet') cls += 'par-btn-quiet';
        else cls += 'par-btn-outline';
        var b = el('button', cls, esc(def.label));
        b.type = 'button';
        on(b, 'click', function () { if (typeof def.act === 'function') def.act(); });
        foot.appendChild(b);
      })(btns[i]);
    }
    box.appendChild(foot);

    on(x, 'click', closeModal);
    on(back, 'click', function (ev) { if (ev.target === back) closeModal(); });

    back.appendChild(box);
    root.appendChild(back);
    root.classList.add('par-modal-open');
    openModal = back;

    later(function () {
      var f = box.querySelector('button');
      if (f && typeof f.focus === 'function') { try { f.focus(); } catch (e) {} }
    }, 20);
  }

  /* ---------------------------------------------------------------------
   * PANEL
   * ------------------------------------------------------------------- */
  function renderPanel() {
    if (!root) return;
    closeModal();
    root.innerHTML = '';
    root.className = 'par-root par-panel';

    root.appendChild(renderStrip());
    root.appendChild(renderTabs());

    var host = el('main', 'par-body');
    host.setAttribute('role', 'tabpanel');
    if (activeTab === 'ayarlar') renderSettingsTab(host);
    else if (activeTab === 'rapor') renderReportTab(host);
    else renderStoreTab(host);

    host.appendChild(el('p', 'par-footer-demo', DEMO_UYARI));
    root.appendChild(host);
  }

  /* ---------------------------------------------------------------------
   * SAHNE
   * ------------------------------------------------------------------- */
  Yuvo.scenes.parent = {
    mount: function (rootEl, params) {
      root = rootEl;
      unlocked = false;
      pinBuf = '';
      tries = 0;
      lockUntil = 0;
      activeTab = 'magaza';
      openModal = null;

      try {
        appEl = document.getElementById('app');
        if (appEl && appEl.classList) appEl.classList.add('fullscreen');
      } catch (e) { appEl = null; }

      if (params && params.tab) activeTab = String(params.tab);

      renderGate();
    },

    unmount: function () {
      clearAllTimers();
      closeModal();
      clearAllListeners();
      try {
        if (appEl && appEl.classList) appEl.classList.remove('fullscreen');
      } catch (e) {}
      if (root) {
        try { root.innerHTML = ''; } catch (e2) {}
        root.className = '';
      }
      root = null;
      appEl = null;
      unlocked = false;
      pinBuf = '';
      tries = 0;
      lockUntil = 0;
      openModal = null;
    }
  };

  /* ---------------------------------------------------------------------
   * Test kancası
   * ------------------------------------------------------------------- */
  Yuvo.test = Yuvo.test || {};
  Yuvo.test.parentUnlock = function (tab) {
    if (!root) {
      try {
        if (typeof Yuvo.go === 'function') Yuvo.go('parent');
      } catch (e) {}
    }
    if (!root) return false;
    unlocked = true;
    tries = 0;
    lockUntil = 0;
    pinBuf = '';
    if (tab) activeTab = String(tab);
    renderPanel();
    return true;
  };

})(typeof window !== 'undefined' ? window : this);
