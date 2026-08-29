/* Yuvo — Sahne: Gerçek Yumurta Ritüeli (docs/v2/06 §2, §5.4 aşama makinesi).
   Sahip: scenes-core ajanı.
   AKIS: folyo → cikolata → kapsul → karsilasma → kart → defterKoda.
   Kurallar: openEgg(eggIdx) mount'ta BİR KEZ çekilir ve saklanır (§1.3 dürüstlük);
   tek tap (hedef dışı) = aşamayı anında tamamla, çift tap = sonraki aşama;
   fast mod (firstRitualDoneToday) kısa varyantlar; nazik fren (tier>=2 veya yeni parça)
   fast'ı tam ritüele yükseltir. Tüm sanat/ses çağrıları savunmacı (modül yoksa çökme yok).
   Geriye uyumluluk: #cere-stage, .cere-egg-wrap.warm, .cere-card, #cere-next,
   Yuvo.test.ceremonySkip() korunur. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.scenes = Yuvo.scenes || {};
  Yuvo.test = Yuvo.test || {};

  var AKIS = ['folyo', 'cikolata', 'kapsul', 'karsilasma', 'kart', 'defterKoda'];

  // ---------- modül durumu ----------
  var mounted = false;
  var rootEl = null, stageEl = null, eggWrapEl = null, objEl = null;
  var scrapsEl = null, ringsEl = null, fxEl = null, burstEl = null;
  var hintEl = null, tabEl = null, actionsEl = null, kikiEl = null, glowEl = null, bookEl = null;

  var result = null;            // openEgg() sonucu — mount'ta BİR KEZ çekilir, saklanır (§1.3)
  var wrapper = null;           // { seri, variant, golden }
  var fast = false;             // etkin hızlı mod (nazik frenden geçmiş)
  var nazikFren = false;        // tier>=2 || isNew → fast olsa bile tam akış
  var fastChoice = 'ye';        // hızlı mod çikolata varsayılanı (mount'ta yakalanır)

  var stageIdx = -1, stageName = '', stageToken = 0;
  var advancing = false, navigated = false, viaTestSkip = false;
  var lastTap = 0, tapGuardUntil = 0, pendingComplete = false;
  var downX = 0, downY = 0, downT = 0, moved = 0, downOnTarget = false, downOnObj = false;
  var timers = [];
  var SEQ = 0;                  // benzersiz SVG id sayacı (önek: yc- ; yi-/yv-/ysh- başkasının)

  // folyo
  var torn = 0, needStrips = 3, dragging = false, dragLastX = 0, dragAcc = 0;
  // cikolata
  var bites = 0, needBites = 4, chocoDone = false;
  // kapsul
  var method = 'burgu', capStage = 0, capOpened = false;
  var twisting = false, twistAcc = 0, twistTaps = 0, twLastX = 0, twLastY = 0, lastTwistSnd = 0;
  var holdT0 = 0, holdTapCount = 0, magicEl = null, ringStep = 0;

  var DBL_MS = 320;             // çift-tap eşiği
  var TAP_SLOP = 14;            // px — bundan az hareket = tap
  var TAP_MS = 500;             // ms — bundan kısa basış = tap
  var TWIST_TAPS = 5;           // burgu/sihir tap fallback (ARCHITECTURE kuralı)

  // ---------- yardımcılar ----------
  function later (fn, ms) {
    var id = setTimeout(function () { if (mounted) fn(); }, ms);
    timers.push(id);
    return id;
  }
  function slater (fn, ms) {  // aşamaya bağlı zamanlayıcı: aşama değiştiyse çalışmaz
    var tok = stageToken;
    return later(function () { if (stageToken === tok) fn(); }, ms);
  }
  function clearTimers () {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }
  function play (name) {
    try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(name); } catch (e) {}
  }
  function play2 (name, opts) { // parametreli ses (pufiChirp gibi)
    try { if (Yuvo.audio && Yuvo.audio.play) Yuvo.audio.play(name, opts); } catch (e) {}
  }
  // Sürekli crinkle dokusu (§5.6): parmak hızı gain'i modüle eder; API yoksa sessiz geç
  function crinkleStart () {
    try { if (Yuvo.audio && Yuvo.audio.crinkleStart) Yuvo.audio.crinkleStart(); } catch (e) {}
  }
  function crinkleLevel (v) {
    try { if (Yuvo.audio && Yuvo.audio.crinkleLevel) Yuvo.audio.crinkleLevel(v); } catch (e) {}
  }
  function crinkleStop () {
    try { if (Yuvo.audio && Yuvo.audio.crinkleStop) Yuvo.audio.crinkleStop(); } catch (e) {}
  }
  function vibrate (p) {
    try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {}
  }
  function toast (t) { try { if (Yuvo.toast) Yuvo.toast(t); } catch (e) {} }
  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function uid (n) { return 'yc-' + n + '-' + (SEQ++); }
  function st () { return (Yuvo.engine && Yuvo.engine.state) || {}; }
  function rarityInfo (key) {
    return (Yuvo.data && Yuvo.data.RARITIES && Yuvo.data.RARITIES[key]) || { ad: key || '?', renk: '#9AA5B1' };
  }
  function seriesInfo () {
    var ws = Yuvo.data && Yuvo.data.WRAPPER_SERIES;
    var s = ws && wrapper && ws[wrapper.seri];
    return s || { ad: 'Güneş Bahçesi', renk1: '#F6B93B', renk2: '#F8E3A1', desen: 'papatya' };
  }
  function rc () {  // ritüel sabitleri (data/wrappers.js; yoksa güvenli varsayılanlar)
    var r = (Yuvo.data && Yuvo.data.RITUAL) || {};
    return {
      SERIT: (r.SERIT > 0) ? r.SERIT : 3,
      HIZLI_SERIT: (r.HIZLI_SERIT > 0) ? r.HIZLI_SERIT : 1,
      ISIRIK: (r.ISIRIK > 0) ? r.ISIRIK : 4
    };
  }
  function tierOf () { return (result && result.celebrationTier) | 0; }
  function setHint (text) { if (hintEl) hintEl.textContent = text || ''; }
  function icoAlbum () {
    try {
      if (Yuvo.icons && Yuvo.icons.album) { var s = Yuvo.icons.album(); if (s) return s; }
    } catch (e) {}
    return '<span class="ico-fallback">📔</span>';
  }
  // Kabuk UI'da çıplak emoji yasak (BRAND §4): rozet/pill glifleri Yuvo.icons'tan
  function icoStar () {
    try {
      if (Yuvo.icons && Yuvo.icons.star) { var s = Yuvo.icons.star(); if (s) return s; }
    } catch (e) {}
    return '<span class="ico-fallback">⭐</span>';
  }
  function icoShell () {
    try {
      if (Yuvo.icons && Yuvo.icons.shell) { var s = Yuvo.icons.shell(); if (s) return s; }
    } catch (e) {}
    return '<span class="ico-fallback">🐚</span>';
  }
  function iw (svg) { // satır içi ikon sarmalayıcısı
    return '<span class="ys-ico" aria-hidden="true">' + svg + '</span>';
  }

  // ---------- savunmacı sanat: Yuvo.art yoksa markalı yedekler ----------
  function fbWrapperSVG (visTorn, golden) {
    var se = seriesInfo();
    var c1 = golden ? '#F2C14E' : se.renk1;
    var c2 = golden ? '#FFF1D4' : se.renk2;
    var cid = uid('wrap');
    var edge = 20 + visTorn * 32;         // 20 (tam sargı) → 52 → 84 → 116 (bitti)
    var out = '<svg viewBox="0 0 120 140" aria-hidden="true">';
    out += '<defs><clipPath id="' + cid + '"><ellipse cx="60" cy="74" rx="40" ry="52"/></clipPath></defs>';
    // beyaz sticker halesi + çikolata gövde (sargının altı)
    out += '<ellipse cx="60" cy="74" rx="40" ry="52" fill="none" stroke="#FFFFFF" stroke-width="9" opacity=".9"/>';
    out += '<ellipse cx="60" cy="74" rx="40" ry="52" fill="#7A4A20"/>';
    out += '<ellipse cx="46" cy="52" rx="11" ry="16" fill="#A9743C" opacity=".55"/>';
    if (visTorn < 3) {
      out += '<g clip-path="url(#' + cid + ')">';
      out += '<rect x="14" y="' + edge + '" width="92" height="' + (132 - edge) + '" fill="' + c1 + '"/>';
      // yırtık üst kenar (zikzak)
      var zz = 'M14 ' + edge;
      for (var x = 14; x <= 106; x += 10) zz += ' L' + (x + 5) + ' ' + (edge - 6) + ' L' + (x + 10) + ' ' + edge;
      out += '<path d="' + zz + ' Z" fill="' + c1 + '"/>';
      // seri deseni: c2 benekleri (nadirlik ASLA kodlanmaz — §1.3)
      for (var r2 = 0; r2 < 3; r2++) {
        var yy = edge + 16 + r2 * 24;
        if (yy > 122) break;
        for (var k = 0; k < 4; k++) {
          out += '<circle cx="' + (30 + k * 20 + (r2 % 2) * 10) + '" cy="' + yy + '" r="5" fill="' + c2 + '"/>';
        }
      }
      // Aile Bandı (C bölgesi): alt şerit
      out += '<rect x="14" y="108" width="92" height="10" fill="' + c2 + '" opacity=".8"/>';
      if (visTorn === 0) { // A Marka Kilidi: yalnız tam sargıda görünür
        out += '<rect x="14" y="20" width="92" height="14" fill="#FFC734"/>' +
               '<circle cx="60" cy="27" r="5" fill="#FFFFFF" stroke="#3E2A1C" stroke-width="1.6"/>';
      }
      out += '</g>';
    }
    out += '<ellipse cx="60" cy="74" rx="40" ry="52" fill="none" stroke="#3E2A1C" stroke-width="5" stroke-linejoin="round"/>';
    out += '<ellipse cx="45" cy="46" rx="8" ry="12" fill="#FFFFFF" opacity=".5"/>';
    if (golden) out += '<path d="M60 8 l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#FFC734" stroke="#3E2A1C" stroke-width="1.6"/>';
    return out + '</svg>';
  }
  function artWrapper (visTorn) {
    // §2.f sahneleme: altın İLK ŞERİT yırtılınca parlar — torn 0'da ambalaj
    // normal görünür (vitrin sürekliliği); görsel doruk erken sızmaz.
    var vGold = visTorn > 0 && !!wrapper.golden;
    try {
      if (Yuvo.art && Yuvo.art.wrapperSVG) {
        var s = Yuvo.art.wrapperSVG(wrapper.seri, { torn: visTorn, golden: vGold, variant: wrapper.variant | 0 });
        if (s) return s;
      }
    } catch (e) {}
    return fbWrapperSVG(visTorn, vGold);
  }

  function fbScrapSVG (golden) {
    var se = seriesInfo();
    var c1 = golden ? '#F2C14E' : se.renk1;
    var c2 = golden ? '#FFF1D4' : se.renk2;
    return '<svg viewBox="0 0 72 60" aria-hidden="true">' +
      '<path d="M8 32 L26 8 L52 14 L64 34 L48 52 L18 50 Z" fill="' + c1 + '"' +
        ' stroke="#3E2A1C" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M26 8 L34 30 L18 50 M52 14 L34 30 L64 34" fill="none" stroke="' + c2 + '"' +
        ' stroke-width="2.4" stroke-linecap="round" opacity=".85"/>' +
    '</svg>';
  }
  function artScrap () {
    try {
      if (Yuvo.art && Yuvo.art.foilScrapSVG) {
        var s = Yuvo.art.foilScrapSVG(wrapper.seri, { golden: !!wrapper.golden });
        if (s) return s;
      }
    } catch (e) {}
    return fbScrapSVG(!!wrapper.golden);
  }

  function fbChocolateSVG (b) {
    var out = '<svg viewBox="0 0 120 140" aria-hidden="true">';
    out += '<ellipse cx="60" cy="74" rx="38" ry="48" fill="none" stroke="#FFFFFF" stroke-width="9" opacity=".9"/>';
    out += '<ellipse cx="60" cy="74" rx="38" ry="48" fill="#8A5A2B"/>';
    out += '<ellipse cx="47" cy="54" rx="10" ry="15" fill="#A9743C" opacity=".6"/>';
    // Yuvo güneş kabartması
    out += '<circle cx="60" cy="66" r="10" fill="#7A4A20"/><circle cx="60" cy="66" r="6" fill="#A9743C"/>';
    // ısırık izleri (stilize kavisler)
    var spots = [[86, 42], [32, 46], [88, 100], [34, 102]];
    for (var i = 0; i < Math.min(b, 4); i++) {
      out += '<circle cx="' + spots[i][0] + '" cy="' + spots[i][1] + '" r="15" fill="#5C3A1E"/>' +
             '<circle cx="' + (spots[i][0] - 4) + '" cy="' + (spots[i][1] - 4) + '" r="6" fill="#4A2E16"/>';
    }
    if (b >= 4) { // kapsül görünür
      out += '<ellipse cx="60" cy="76" rx="22" ry="28" fill="#45B8C8" stroke="#3E2A1C" stroke-width="3.5"/>' +
             '<path d="M38 66 q22 -14 44 0 l0 -8 q-22 -16 -44 0 Z" fill="#F26D69" stroke="#3E2A1C" stroke-width="3"/>';
    }
    out += '<ellipse cx="60" cy="74" rx="38" ry="48" fill="none" stroke="#3E2A1C" stroke-width="5"/>';
    return out + '</svg>';
  }
  function artChocolate (b) {
    try {
      if (Yuvo.art && Yuvo.art.chocolateSVG) {
        var s = Yuvo.art.chocolateSVG({ bites: b });
        if (s) return s;
      }
    } catch (e) {}
    return fbChocolateSVG(b);
  }

  function fbCapsuleSVG (stage) {
    var renk = rarityInfo(result && result.rarity).renk;
    var out = '<svg viewBox="0 0 120 150" aria-hidden="true">';
    if (stage >= 1) out += '<circle cx="60" cy="80" r="50" fill="' + renk + '" opacity=".18"/>';
    out += '<circle cx="60" cy="80" r="44" fill="none" stroke="' + renk + '" stroke-width="6" opacity="' + (stage >= 1 ? '.55' : '.3') + '"/>';
    if (stage < 2) {
      // Tomurcuk Kapsülü: mat turkuaz gövde + mercan kapak + yaprak sapı (Kinder trade-dress DEĞİL)
      out += '<path d="M60 26 q3 -10 12 -12 q-2 10 -8 13 Z" fill="#55B944" stroke="#3E2A1C" stroke-width="3" stroke-linejoin="round"/>' +
             '<path d="M60 18 v10" stroke="#3E2A1C" stroke-width="3.5" stroke-linecap="round"/>' +
             '<path d="M26 78 q0 -34 34 -50 q34 16 34 50 q0 12 -4 20 l-60 0 q-4 -8 -4 -20 Z" fill="#F26D69" stroke="#3E2A1C" stroke-width="4.5" stroke-linejoin="round"/>' +
             '<path d="M26 84 q34 12 68 0 l0 6 q0 34 -34 40 q-34 -6 -34 -40 Z" fill="#45B8C8" stroke="#3E2A1C" stroke-width="4.5" stroke-linejoin="round"/>' +
             '<ellipse cx="46" cy="52" rx="8" ry="11" fill="#FFFFFF" opacity=".55"/>';
      if (stage === 1) {
        out += '<path d="M28 86 l14 6 -8 6 16 4 -6 8" fill="none" stroke="#FFF7DF" stroke-width="3.5" stroke-linecap="round"/>' +
               '<circle cx="60" cy="92" r="8" fill="' + renk + '" opacity=".65"/>';
      }
    } else {
      // açık: iki yarım ayrık, iç ışıma ortada; alt yarım yuva çanağı olur
      out += '<circle cx="60" cy="70" r="22" fill="#FFF7DF"/>' +
             '<circle cx="60" cy="70" r="14" fill="' + renk + '" opacity=".5"/>' +
             '<g transform="rotate(-24 30 40)">' +
               '<path d="M8 44 q4 -28 30 -36 q22 12 24 34 l-6 6 q-24 -14 -44 0 Z" fill="#F26D69" stroke="#3E2A1C" stroke-width="4" stroke-linejoin="round"/>' +
             '</g>' +
             '<path d="M26 104 q34 12 68 0 l0 4 q0 30 -34 36 q-34 -6 -34 -36 Z" fill="#45B8C8" stroke="#3E2A1C" stroke-width="4.5" stroke-linejoin="round"/>' +
             '<ellipse cx="60" cy="112" rx="24" ry="6" fill="#2E8A99" opacity=".6"/>';
    }
    return out + '</svg>';
  }
  function artCapsule () {
    try {
      if (Yuvo.art && Yuvo.art.capsuleSVG) {
        var s = Yuvo.art.capsuleSVG(result.rarity, { method: method, stage: capStage });
        if (s) return s;
      }
    } catch (e) {}
    return fbCapsuleSVG(capStage);
  }

  function fbStampSVG (golden) {
    var se = seriesInfo();
    var c1 = golden ? '#F2C14E' : se.renk1;
    var c2 = golden ? '#FFF1D4' : se.renk2;
    return '<svg viewBox="0 0 86 62" aria-hidden="true">' +
      '<rect x="4" y="4" width="78" height="54" rx="10" fill="' + c1 + '" stroke="#3E2A1C" stroke-width="3.5"/>' +
      '<rect x="11" y="11" width="64" height="40" rx="7" fill="none" stroke="' + c2 + '" stroke-width="3" stroke-dasharray="6 5"/>' +
      '<ellipse cx="43" cy="31" rx="10" ry="13" fill="' + c2 + '" stroke="#3E2A1C" stroke-width="2.5"/>' +
      (golden ? '<path d="M43 22 l2 5 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1z" fill="#FFC734"/>' : '') +
    '</svg>';
  }
  function artStamp () {
    try {
      if (Yuvo.art && Yuvo.art.foilStampSVG) {
        var s = Yuvo.art.foilStampSVG(wrapper.seri, wrapper.variant | 0, { golden: !!wrapper.golden, count: 1 });
        if (s) return s;
      }
    } catch (e) {}
    return fbStampSVG(!!wrapper.golden);
  }

  function pufiSVG (mood) {
    try {
      if (Yuvo.art && Yuvo.art.pufiSVG) {
        var s = Yuvo.art.pufiSVG(result.pufi, { mood: mood || 'happy' });
        if (s) return s;
      }
    } catch (e) {}
    var renk = rarityInfo(result && result.rarity).renk;
    return '<svg viewBox="0 0 120 120"><circle cx="60" cy="64" r="38" fill="' + renk + '"/>' +
      '<circle cx="48" cy="56" r="5" fill="#3a2f22"/><circle cx="72" cy="56" r="5" fill="#3a2f22"/>' +
      '<path d="M48 74 q12 10 24 0" stroke="#3a2f22" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }

  // ---------- motor çağrıları (savunmacı) ----------
  function engineEat () {
    try { if (Yuvo.engine && Yuvo.engine.eatChocolate) return Yuvo.engine.eatChocolate() | 0; } catch (e) {}
    return 0;
  }
  function engineBank () {
    try { if (Yuvo.engine && Yuvo.engine.bankChocolate) return Yuvo.engine.bankChocolate() | 0; } catch (e) {}
    return 0;
  }

  // ---------- aşama 0: yumurta yoksa nazik mesaj ----------
  function showNoEgg () {
    stageName = 'noegg';
    rootEl.innerHTML =
      '<div class="cere-stage cere-noegg">' +
        '<div class="cere-noegg-box card center">' +
          '<div class="cere-noegg-ico">🌙</div>' +
          '<h2>Bugünün yumurtaları bitti</h2>' +
          '<p>Pufiler tatlı tatlı uyuyor… Yarın postanede yeni sürprizler olacak!</p>' +
          '<button class="btn btn-primary" id="cere-home">Yuvaya Dön</button>' +
        '</div>' +
      '</div>';
    var b = rootEl.querySelector('#cere-home');
    if (b) b.addEventListener('click', function () { if (Yuvo.go) Yuvo.go('home'); });
    later(function () { if (stageName === 'noegg' && Yuvo.go) Yuvo.go('home'); }, 3000);
  }

  // ---------- sahne iskeleti ----------
  function buildStage () {
    rootEl.innerHTML =
      '<div class="cere-stage rit-stage" id="cere-stage">' +
        '<div class="rit-glow" id="rit-glow" aria-hidden="true"></div>' +
        '<div class="rit-scraps" id="rit-scraps" data-rt="1"></div>' +
        '<div class="rit-book" id="rit-book" aria-hidden="true">' + icoAlbum() + '</div>' +
        '<div class="cere-egg-wrap arriving" id="cere-egg-wrap">' +
          '<div class="cere-egg rit-obj" id="rit-obj" data-rt="1"></div>' +
          '<div class="cere-hand" aria-hidden="true">🖐️</div>' +
        '</div>' +
        '<button class="rit-tab" id="rit-tab" data-rt="1" hidden aria-label="Folyodan bir şerit kopar">' +
          '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 4v14M8 12l6 7 6-7" fill="none"' +
            ' stroke="#3E2A1C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<span>Çek!</span>' +
        '</button>' +
        '<div class="rit-actions" id="rit-actions" data-rt="1"></div>' +
        '<div class="cere-rings" id="cere-rings"></div>' +
        '<div class="cere-fx rit-burst" id="rit-burst" aria-hidden="true"></div>' +
        '<div class="cere-fx" id="cere-fx"></div>' +
        '<div class="rit-kiki" id="rit-kiki" hidden></div>' +
        '<p class="cere-hint" id="cere-hint"></p>' +
      '</div>';
    stageEl = rootEl.querySelector('#cere-stage');
    glowEl = rootEl.querySelector('#rit-glow');
    scrapsEl = rootEl.querySelector('#rit-scraps');
    bookEl = rootEl.querySelector('#rit-book');
    eggWrapEl = rootEl.querySelector('#cere-egg-wrap');
    objEl = rootEl.querySelector('#rit-obj');
    tabEl = rootEl.querySelector('#rit-tab');
    actionsEl = rootEl.querySelector('#rit-actions');
    ringsEl = rootEl.querySelector('#cere-rings');
    burstEl = rootEl.querySelector('#rit-burst');
    fxEl = rootEl.querySelector('#cere-fx');
    kikiEl = rootEl.querySelector('#rit-kiki');
    hintEl = rootEl.querySelector('#cere-hint');

    stageEl.addEventListener('pointerdown', onPointerDown);
    stageEl.addEventListener('pointermove', onPointerMove);
    stageEl.addEventListener('pointerup', onPointerUp);
    stageEl.addEventListener('pointercancel', onPointerUp);
    tabEl.addEventListener('click', onTabClick);
  }

  // ---------- ortak jest grameri ----------
  function isTargetEl (t) {
    return !!(t && t.closest && t.closest('[data-rt]'));
  }
  function dispatch (e) {
    var s = stages[stageName];
    if (s && s.input) { try { s.input(e); } catch (err) {} }
  }
  function onPointerDown (e) {
    if (!mounted || advancing) return;
    if (e.target && e.target.closest && e.target.closest('button')) return; // butonlar kendini yönetir
    // Fare sahne dışında bırakılırsa pointerup kaçmasın (sürekli crinkle takılı kalıyordu)
    try { if (stageEl && stageEl.setPointerCapture) stageEl.setPointerCapture(e.pointerId); } catch (ec) {}
    var now = Date.now();
    var dbl = (now - lastTap) < DBL_MS;
    lastTap = now;
    downX = e.clientX; downY = e.clientY; downT = now; moved = 0;
    downOnTarget = isTargetEl(e.target);
    downOnObj = !!(e.target && e.target.closest && e.target.closest('#rit-obj'));
    if (dbl && !downOnTarget) { // çift tap (hedef dışı) = sonraki aşama
      if (now >= tapGuardUntil) { pendingComplete = false; doSkip(); }
      return;
    }
    dispatch(e);
  }
  function onPointerMove (e) {
    if (!mounted || advancing) return;
    // tap/sürükleme ayrımı için kaba yol farkı (jest birikimlerini aşama kodları kendisi izler)
    if (downT) moved = Math.max(moved, Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY));
    dispatch(e);
  }
  function onPointerUp (e) {
    if (!mounted) return;
    // pointercancel tap SAYILMAZ: tarayıcı jesti çaldıysa (sistem jesti,
    // bildirim çekmecesi) iptal edilen dokunuş aşamayı kendiliğinden bitirmesin
    var wasTap = e.type !== 'pointercancel' &&
      downT && moved < TAP_SLOP && (Date.now() - downT) < TAP_MS;
    dispatch(e);
    if (!advancing && wasTap && !downOnTarget) {
      var s = stages[stageName];
      if (s && !s.allTaps && Date.now() >= tapGuardUntil) {
        // tek tap (hedef dışı) = aşamayı bitir; ama çift tapın ikinci vuruşunu
        // DBL_MS kadar bekle — gelirse complete yerine skip çalışır
        pendingComplete = true;
        slater(function () {
          if (pendingComplete) { pendingComplete = false; doComplete(); }
        }, DBL_MS + 40);
      }
    }
    downT = 0; moved = 0; downOnTarget = false;
  }
  function doComplete () {
    var s = stages[stageName];
    if (s && s.complete) { try { s.complete(); } catch (e) {} }
  }
  function doSkip () {
    if (advancing) return;
    var s = stages[stageName];
    if (s && s.skip) { try { s.skip(); } catch (e) {} }
  }

  function next () {
    if (!mounted) return;
    stageToken += 1;
    advancing = false;
    pendingComplete = false;
    tapGuardUntil = Math.max(tapGuardUntil, Date.now() + 300);
    stageIdx += 1;
    if (stageIdx >= AKIS.length) return;
    stageName = AKIS[stageIdx];
    var s = stages[stageName];
    if (s && s.enter) { try { s.enter(); } catch (e) {} }
  }
  function jumpTo (name) {
    var idx = -1;
    for (var i = 0; i < AKIS.length; i++) { if (AKIS[i] === name) { idx = i; break; } }
    if (idx < 0 || !mounted) return;
    stageIdx = idx - 1;
    if (ringsEl) ringsEl.innerHTML = '';
    if (actionsEl) actionsEl.innerHTML = '';
    if (tabEl) tabEl.hidden = true;
    next();
  }

  // ---------- ortak kutlama (kapsül POP — mevcut konfeti/tier kodu) ----------
  function spawnConfetti (n) {
    if (!burstEl) return;
    var colors = ['#FFD34D', '#FF8A5C', '#A8E06E', '#BDE8FF', '#B266E8', rarityInfo(result && result.rarity).renk];
    if (wrapper && wrapper.golden) colors = ['#FFC734', '#F2A400', '#FFF1D4', '#FFD34D', '#F2C14E', '#FFFFFF'];
    var box = document.createElement('div');
    box.className = 'cere-confetti';
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = 90 + Math.random() * 190;
      var p = document.createElement('i');
      p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * r - 50) + 'px');
      p.style.setProperty('--rot', Math.round(Math.random() * 720 - 360) + 'deg');
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.15) + 's';
      box.appendChild(p);
    }
    burstEl.appendChild(box);
    later(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 1600);
  }
  function celebrate () {
    var tier = tierOf();
    if (burstEl) burstEl.innerHTML = '<div class="cere-flash"></div>';
    spawnConfetti([18, 26, 38, 60][tier] || 18);
    if (tier >= 2) slater(function () { spawnConfetti(24); }, 350);
    if (tier >= 3) { if (stageEl) stageEl.classList.add('tier3glow'); play('fanfareBig'); }
    else if (tier === 2) play('fanfare');
    else if (tier === 1) play('chime');
    else play('pop'); // capsulePop henüz sentezlenmediyse de doruk duyulur
    vibrate(tier >= 3 ? [40, 60, 120] : [20, 30, 80]);
    // Nadirlik SPLASH'i: renk + simge + BÜYÜK yazı — okuma bilmeyene simge/renk yeter
    if (tier >= 1 && stageEl) {
      var ri = rarityInfo(result && result.rarity);
      var sp = document.createElement('div');
      sp.className = 'rit-rarity-splash t' + tier;
      sp.style.setProperty('--rc', ri.renk);
      sp.textContent = (ri.simge ? ri.simge + ' ' : '') + String(ri.ad).toLocaleUpperCase('tr') + '!';
      stageEl.appendChild(sp);
      later(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 2000);
    }
    // Kiki'nin hayranlık balonu (kutlama dili — baskı/aciliyet değil), kendiliğinden kapanır
    if (tier >= 2 && Yuvo.dialog) {
      Yuvo.dialog.say({
        kim: 'kiki',
        metin: tier >= 3 ? 'VAAAY! Gözlerime inanamıyorum — bu bir EFSANE!' : 'Vaay! Bu ÇOK nadir bir dost!',
        sure: 2600
      });
    }
  }

  // =======================================================================
  // AŞAMALAR — her aşama { enter, input, complete, skip } (docs/v2/06 §5.4)
  // =======================================================================
  var stages = {};

  // ---------- b. FOLYO YIRTMA ----------
  stages.folyo = {
    enter: function () {
      var R = rc();
      needStrips = fast ? R.HIZLI_SERIT : R.SERIT;
      torn = 0; dragging = false; dragAcc = 0;
      if (eggWrapEl) eggWrapEl.className = 'cere-egg-wrap arriving';
      renderWrapper();
      slater(function () { // smoke-uyum: .cere-egg-wrap.warm (sallanma) folyo boyunca kalır
        if (eggWrapEl) eggWrapEl.className = 'cere-egg-wrap warm';
      }, 700);
      if (tabEl) tabEl.hidden = false;
      setHint(fast ? 'Folyoyu çek!' : 'Folyoyu sıyır! Şeridi çek'); // el jesti cere-hand illüstrasyonundadır
      play('pop');
    },
    input: function (e) {
      if (e.type === 'pointerdown') {
        var sc = e.target && e.target.closest && e.target.closest('.rit-scrap');
        if (sc) { // düşen parça: itince hışırdar
          play('crinkle');
          sc.classList.add('nudge');
          later(function () { sc.classList.remove('nudge'); }, 450);
          return;
        }
        dragging = true; dragLastX = e.clientX; dragAcc = 0;
        crinkleStart(); // sürekli doku başlar; hız gain'i modüle eder
      } else if (e.type === 'pointermove' && dragging) {
        var step = Math.abs(e.clientX - dragLastX);
        dragAcc += step;
        dragLastX = e.clientX;
        crinkleLevel(Math.min(1, step / 24));
        var w = (stageEl && stageEl.clientWidth) || 360;
        if (dragAcc >= w * 0.30) { dragAcc = 0; tearOne(); } // sürükleme ≥ %30 genişlik = 1 şerit
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
        dragging = false;
        crinkleStop();
        var wasTap = e.type === 'pointerup' &&
          downT && moved < TAP_SLOP && (Date.now() - downT) < TAP_MS;
        if (wasTap && downOnObj) tearOne(); // ambalaja tap = kulakçık fallback'i (cancel sayılmaz)
      }
    },
    complete: function () { // kalan şeritler tek harekette soyulur (~1 sn)
      if (advancing) return;
      if (torn >= needStrips) return;
      advancing = true;
      (function step () {
        if (!mounted) return;
        if (torn < needStrips) { tearCore(); slater(step, 140); }
        else finishFolyo();
      })();
    },
    skip: function () {
      if (torn < needStrips) {
        var wasGolden = torn === 0 && wrapper && wrapper.golden;
        torn = needStrips;
        renderWrapper();
        if (wasGolden) goldenReveal();
      }
      dragging = false;
      crinkleStop();
      if (tabEl) tabEl.hidden = true;
      setHint('');
      next();
    }
  };
  function visTornOf () {
    if (torn <= 0) return 0;
    if (torn >= needStrips) return 3;
    return Math.min(3, Math.ceil(3 * torn / needStrips));
  }
  function renderWrapper () { if (objEl) objEl.innerHTML = artWrapper(visTornOf()); }
  function goldenReveal () { // §2.f: ilk şeritte altın parlar + özel fanfar + altın ışık
    if (stageEl) stageEl.classList.add('golden');
    if (glowEl) {
      glowEl.style.background =
        'radial-gradient(circle at 50% 42%, rgba(255,231,150,.9), rgba(255,199,52,.5) 40%, rgba(255,199,52,0) 75%)';
      glowEl.classList.add('show');
    }
    if (burstEl) burstEl.innerHTML = '<div class="rit-flash-gold"></div>';
    play('goldenFanfare');
    vibrate([30, 40, 90]);
    setHint('ALTIN FOLYO!');
    toast('Altın folyo buldun!');
  }
  function tearCore () { // tek şerit: görsel + parça + ses (bitiş kontrolü çağıranda)
    torn += 1;
    renderWrapper();
    play('foilTear');
    vibrate(12);
    if (wrapper && wrapper.golden && torn === 1) goldenReveal();
    if (scrapsEl) {
      var d = document.createElement('div');
      d.className = 'rit-scrap';
      var dir = (torn % 2 === 0) ? 1 : -1;
      // parça yumurta silüetinin (ve E bandındaki seri adının) üstüne binmeden
      // yana savrulur: yatay ofsetler yumurta yarı genişliğinin dışına taşar
      d.style.setProperty('--mx', (dir * (85 + Math.random() * 45)).toFixed(0) + 'px');
      d.style.setProperty('--dx', (dir * (115 + Math.random() * 60)).toFixed(0) + 'px');
      d.style.setProperty('--mr', (dir * (40 + Math.random() * 40)).toFixed(0) + 'deg');
      d.style.setProperty('--rot', (dir * (110 + Math.random() * 90)).toFixed(0) + 'deg');
      d.innerHTML = artScrap();
      scrapsEl.appendChild(d);
      later(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 4200);
    }
  }
  function tearOne () {
    if (advancing || torn >= needStrips) return;
    tearCore();
    if (torn >= needStrips) { advancing = true; finishFolyo(); }
  }
  function finishFolyo () {
    advancing = true;
    dragging = false;
    crinkleStop();
    if (tabEl) tabEl.hidden = true;
    setHint('');
    play('chime'); // kısa parlak "reveal" tınısı
    slater(next, 480);
  }

  // ---------- c. ÇİKOLATA ----------
  stages.cikolata = {
    enter: function () {
      var R = rc();
      needBites = R.ISIRIK; bites = 0; chocoDone = false;
      if (eggWrapEl) eggWrapEl.className = 'cere-egg-wrap';
      if (scrapsEl) scrapsEl.innerHTML = '';
      if (objEl) objEl.innerHTML = artChocolate(0);
      if (fast) { // hızlı mod: son tercihe göre otomatik (§3)
        advancing = true;
        setHint('');
        slater(function () {
          if (fastChoice === 'biriktir') bankNow(true);
          else { // tek ısırıkta ham
            engineEat();
            bites = needBites; chocoDone = true;
            if (objEl) objEl.innerHTML = artChocolate(4);
            play('bite'); play('mmm');
            slater(next, 450);
          }
        }, 380);
        return;
      }
      setHint('Isır ya da biriktir!');
      if (actionsEl) {
        actionsEl.innerHTML =
          '<button class="btn btn-primary rit-btn" id="rit-eat">Ye!</button>' +
          '<button class="btn btn-soft rit-btn" id="rit-bank">Biriktir!</button>';
        var be = actionsEl.querySelector('#rit-eat');
        var bb = actionsEl.querySelector('#rit-bank');
        if (be) be.addEventListener('click', function () { play('click'); biteOne(); });
        if (bb) bb.addEventListener('click', function () { play('click'); bankNow(false); });
      }
    },
    input: function (e) {
      if (e.type === 'pointerdown' && !chocoDone) {
        if (e.target && e.target.closest && e.target.closest('#rit-obj')) biteOne();
      }
    },
    complete: function () { // kalan ısırıklar tek lokmada: "Ham!"
      if (advancing || chocoDone) return;
      advancing = true; chocoDone = true;
      while (bites < needBites) { bites += 1; engineEat(); }
      if (objEl) objEl.innerHTML = artChocolate(4);
      if (actionsEl) actionsEl.innerHTML = '';
      setHint('Ham! Mmm…');
      play('bite'); play('mmm');
      vibrate(12);
      slater(next, 550);
    },
    skip: function () {
      if (!chocoDone) { // çikolata kaybolmaz: son tercih sessizce uygulanır
        chocoDone = true;
        if (fastChoice === 'biriktir') engineBank();
        else engineEat();
      }
      if (actionsEl) actionsEl.innerHTML = '';
      setHint('');
      next();
    }
  };
  function biteOne () {
    if (advancing || chocoDone || bites >= needBites) return;
    bites += 1;
    var gain = engineEat();
    play('bite');
    if (bites % 2 === 1) play('mmm'); // abartısız: tat mizahı, iştah reklamı değil (§2.c)
    vibrate(8);
    if (objEl) objEl.innerHTML = artChocolate(Math.min(4, Math.ceil(4 * bites / needBites)));
    if (gain > 0) { play('star'); starFloat('+' + gain); }
    if (bites >= needBites) {
      chocoDone = true; advancing = true;
      if (actionsEl) actionsEl.innerHTML = '';
      setHint('');
      slater(next, 550);
    }
  }
  function bankNow (fastMode) {
    if (chocoDone) return;
    chocoDone = true; advancing = true;
    var n = engineBank();
    play('jarClink');
    if (eggWrapEl) eggWrapEl.classList.add('to-jar');
    if (actionsEl) actionsEl.innerHTML = '';
    setHint('');
    if (!fastMode) toast('Kumbarada ' + n + ' çikolata');
    slater(function () {
      if (eggWrapEl) eggWrapEl.classList.remove('to-jar');
      next();
    }, fastMode ? 420 : 700);
  }
  function starFloat (text) {
    if (!stageEl) return;
    // hızlı ardışık ısırıkta iki pill üst üste binip "çift basım" gibi
    // okunmasın: yenisi gelmeden eskisi kaldırılır + küçük x kayması
    var old = stageEl.querySelector('.rit-star-float');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var f = document.createElement('div');
    f.className = 'rit-star-float';
    f.style.left = (52 + Math.random() * 14).toFixed(0) + '%';
    f.innerHTML = esc(text) + iw(icoStar());
    stageEl.appendChild(f);
    later(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 1100);
  }

  // ---------- d. KAPSÜL AÇMA ----------
  stages.kapsul = {
    enter: function () {
      capStage = 0; capOpened = false;
      twisting = false; twistAcc = 0; twistTaps = 0; holdT0 = 0; holdTapCount = 0; ringStep = 0;
      method = resolveMethod();
      // çekiçte tüm sahne ritim hedefidir (kaçırmak imkânsız) → hedef-dışı tap complete sayılmaz
      stages.kapsul.allTaps = (method === 'cekic');
      if (eggWrapEl) eggWrapEl.className = 'cere-egg-wrap capsule';
      renderCapsule();
      // nadirlik aurası (iç ışıma halkasının sahne yansıması; ipucu merdiveni 3. basamak)
      var tier = tierOf();
      if (glowEl && tier >= 1 && !(wrapper && wrapper.golden)) {
        var renk = rarityInfo(result.rarity).renk;
        glowEl.style.background =
          'radial-gradient(circle at 50% 46%, ' + renk + '44 0%, ' + renk + '22 40%, transparent 72%)';
        glowEl.classList.add('show');
      }
      if (tier >= 2 && kikiEl) { // nazik fren: Kiki tek satır (atlama yine serbest — §2.d)
        kikiEl.textContent = 'Kiki: "Bunu kaçırma!"';
        kikiEl.hidden = false;
        slater(function () { if (kikiEl) kikiEl.hidden = true; }, 2600);
      }
      if (method === 'cekic') {
        setHint(fast ? 'Tık… KIRT!' : 'Halkaya dokun: tık, tık, KIRT! 👆');
        showRing(0);
      } else if (method === 'firlat') {
        setHint(fast ? 'Bas, salla, bırak!' : 'Basılı tut, salla… bırak! 🚀');
      } else if (method === 'sihir') {
        setHint(fast ? 'Parmağını bas ve tut ✨' : 'Parmağını bas ve tut… ışık büyüsün ✨');
      } else {
        setHint(fast ? 'Çevir!' : 'Yaprak sapını çevir! 🌀');
      }
    },
    input: function (e) { capsuleInput(e); },
    allTaps: false, // enter'da yönteme göre ayarlanır (çekiç: true)
    complete: function () { openCapsule(false); }, // tek/çift tap = anında POP (§2.d)
    skip: function () { openCapsule(true); }
  };
  function resolveMethod () {
    if (tierOf() >= 2) return 'sihir'; // Destansı+ kapsülde otomatik teklif; satılmaz
    var tool = st().activeTool;
    if (tool === 'sedefburgu') return 'burgu'; // kozmetik varyant aynı jest ailesi
    if (tool === 'burgu' || tool === 'cekic' || tool === 'firlat' || tool === 'sihir') return tool;
    return 'burgu';
  }
  function renderCapsule () { if (objEl) objEl.innerHTML = artCapsule(); }
  function crackTo1 () {
    if (capStage >= 1) return;
    capStage = 1;
    renderCapsule();
    play('capsuleTwist');
    vibrate(18);
  }
  function showRing (i) {
    ringStep = i;
    if (ringsEl) {
      ringsEl.innerHTML = '<div class="cere-ring ring-p' + i + '">' +
        '<span class="cere-ring-finger" aria-hidden="true">👆</span></div>';
    }
  }
  function capsuleInput (e) {
    var onObj = downOnObj; // jest başladığı yere göre (pointerup hedefi güvenilmez)
    // pointercancel tap fallback sayacına İŞLEMEZ (iptal edilen dokunuş jest değildir)
    var wasTap = e.type !== 'pointercancel' &&
      downT && moved < TAP_SLOP && (Date.now() - downT) < TAP_MS;

    if (method === 'cekic') { // MEVCUT ritim halkası kodu — kaçırmak imkânsız, her tap sayılır
      if (e.type !== 'pointerdown') return;
      var need = fast ? 1 : 3;
      if (ringStep >= need - 1) {
        play('hammerKirt');
        openCapsule(false);
      } else {
        play('hammerTik');
        vibrate(14);
        if (ringStep === 0) crackTo1();
        showRing(ringStep + 1);
      }
      return;
    }

    if (method === 'burgu') {
      var NEED = fast ? 240 : 880; // dairesel sürtme birikimi (px)
      if (e.type === 'pointerdown') {
        twisting = true; twLastX = e.clientX; twLastY = e.clientY;
        if (eggWrapEl) eggWrapEl.classList.add('twist-wobble');
      } else if (e.type === 'pointermove' && twisting) {
        var dx = e.clientX - twLastX, dy = e.clientY - twLastY;
        twLastX = e.clientX; twLastY = e.clientY;
        twistAcc += Math.sqrt(dx * dx + dy * dy);
        var now = Date.now();
        if (now - lastTwistSnd > 150) { lastTwistSnd = now; play('capsuleTwist'); }
        var p = Math.max(twistAcc / NEED, twistTaps / TWIST_TAPS);
        if (p >= 0.5) crackTo1();
        if (p >= 1) openCapsule(false);
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
        twisting = false;
        if (eggWrapEl) eggWrapEl.classList.remove('twist-wobble');
        if (wasTap && onObj) { // tap fallback: art arda dokunuşlar da çevirir
          twistTaps += 1;
          play('capsuleTwist');
          var p2 = Math.max(twistAcc / NEED, twistTaps / (fast ? 1 : TWIST_TAPS));
          if (p2 >= 0.5) crackTo1();
          if (p2 >= 1) openCapsule(false);
        }
      }
      return;
    }

    if (method === 'firlat') {
      var HOLD = fast ? 250 : 400;
      if (e.type === 'pointerdown' && onObj) {
        holdT0 = Date.now();
        if (eggWrapEl) eggWrapEl.classList.add('hold-shake');
        play('shakeRattle');
        vibrate(10);
        (function rattle () { // basılı tutuldukça çıkırtı
          if (holdT0 && !capOpened) { play('shakeRattle'); slater(rattle, 340); }
        })();
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
        var held = holdT0 ? (Date.now() - holdT0) : 0;
        holdT0 = 0;
        if (eggWrapEl) eggWrapEl.classList.remove('hold-shake');
        if (held >= HOLD) doThrow();
        else if (wasTap && onObj) { // tap fallback: 3 dokunuş = fırlat
          holdTapCount += 1;
          play('tap');
          if (holdTapCount >= (fast ? 1 : 3)) doThrow();
        }
      }
      return;
    }

    if (method === 'sihir') {
      var MAGIC = fast ? 700 : 2000;
      if (e.type === 'pointerdown' && onObj) {
        holdT0 = Date.now();
        play('magicRise');
        if (!magicEl && eggWrapEl) {
          magicEl = document.createElement('div');
          magicEl.className = 'rit-magic';
          eggWrapEl.appendChild(magicEl);
        }
        (function grow () { // ışık büyür; süre dolunca çiçek gibi kendiliğinden açılır
          if (!holdT0 || capOpened || !mounted) return;
          var p = Math.min(1, (Date.now() - holdT0) / MAGIC);
          if (magicEl) {
            magicEl.style.opacity = String(0.35 + p * 0.65);
            magicEl.style.transform = 'scale(' + (0.3 + p * 1.1).toFixed(2) + ')';
          }
          if (p >= 0.6) crackTo1();
          if (p >= 1) { holdT0 = 0; openCapsule(false); return; }
          slater(grow, 90);
        })();
      } else if (e.type === 'pointerup' || e.type === 'pointercancel') {
        var fired = capOpened;
        holdT0 = 0;
        if (!fired) {
          if (magicEl) { magicEl.style.opacity = '0'; magicEl.style.transform = 'scale(.2)'; }
          if (wasTap && onObj) { // tap fallback
            holdTapCount += 1;
            play('magicRise');
            if (holdTapCount >= (fast ? 1 : TWIST_TAPS)) openCapsule(false);
          }
        }
      }
    }
  }
  function doThrow () {
    if (capOpened || advancing) return;
    advancing = true;
    if (eggWrapEl) eggWrapEl.classList.add('thrown');
    play('shakeRattle');
    slater(function () {
      if (eggWrapEl) eggWrapEl.classList.remove('thrown');
      advancing = false;
      openCapsule(false); // zıplar, PAT!
    }, 560);
  }
  // "Ne çıkacak?" anı (unboxing duraklaması): POP'tan hemen önce ~420ms TAM sessizlik +
  // vinyet + hafif zoom. Sync (test) yolu duraklamayı atlar — duman testi senkron kalır.
  var hushing = false;
  function openCapsule (sync) {
    if (capOpened || hushing || !mounted) return;
    if (sync) { popNow(true); return; }
    hushing = true;
    advancing = true;                 // girişler kilitlenir; çift tetik yok
    holdT0 = 0; twisting = false;
    if (eggWrapEl) eggWrapEl.classList.remove('twist-wobble', 'hold-shake', 'thrown');
    if (ringsEl) ringsEl.innerHTML = '';
    if (kikiEl) kikiEl.hidden = true;
    setHint('');
    if (stageEl) stageEl.classList.add('hush');
    slater(function () {
      hushing = false;
      if (stageEl) stageEl.classList.remove('hush');
      popNow(false);
    }, 420);
  }
  function popNow (sync) {
    if (capOpened || !mounted) return;
    capOpened = true; advancing = true;
    holdT0 = 0; twisting = false;
    capStage = 2;
    if (magicEl && magicEl.parentNode) { magicEl.parentNode.removeChild(magicEl); magicEl = null; }
    if (eggWrapEl) {
      eggWrapEl.classList.remove('twist-wobble', 'hold-shake', 'thrown');
      eggWrapEl.classList.add('opened');
    }
    if (ringsEl) ringsEl.innerHTML = '';
    if (kikiEl) kikiEl.hidden = true;
    setHint('');
    renderCapsule();
    play('capsulePop'); // "POP!" + konfeti + tier fanfarı (mevcut kutlama aynen)
    celebrate();
    // Nadirlikte uzayan reveal: doruk anı kademeyle orantılı nefes alır
    var t = tierOf();
    if (sync) next();
    else slater(next, t >= 3 ? 2600 : t === 2 ? 2200 : t === 1 ? 1300 : 900);
  }

  // ---------- e1. KARŞILAŞMA (mevcut mantık: Pufi zıplayarak çıkar; kopyada kısaltılmış) ----------
  stages.karsilasma = {
    enter: function () {
      if (eggWrapEl) eggWrapEl.classList.add('nest-cup'); // alt yarım yuva çanağı olarak kalır
      var kopya = !(result && result.isNew);
      var html = '<div class="cere-pufi' + (kopya ? ' rit-wave' : '') + '">' + pufiSVG('happy') + '</div>';
      if (kopya) { // "boş katman" hissi yasak: Pufi el sallar, parça Kabuk'a dönüşür (§2.e)
        html += '<div class="rit-shell-fly">+' + ((result && result.kabukGained) | 0) +
                iw(icoShell()) + '</div>';
      }
      if (fxEl) fxEl.innerHTML = html;
      play('pop');
      // Her Pufi'nin KENDİ sesi — karşılaşmada ilk kez duyulur (albüm soundboard'la aynı imza)
      if (result && result.pufi) slater(function () { play2('pufiChirp', { id: result.pufi.id }); }, 320);
      var tier = tierOf();
      var dur = kopya ? 1300 : (tier >= 3 ? 2300 : (fast ? 800 : 1800));
      slater(next, dur);
    },
    input: function () {},
    complete: function () { next(); },
    skip: function () { next(); }
  };

  // ---------- e2. KART (mevcut sticker kart aynen; #cere-next korunur) ----------
  stages.kart = {
    enter: function () {
      if (stageEl) stageEl.classList.add('show-card');
      if (ringsEl) ringsEl.innerHTML = '';
      if (scrapsEl) scrapsEl.innerHTML = '';
      setHint('');
      var p = (result && result.pufi) || { ad: '?', bio: '' };
      var ri = rarityInfo(result && result.rarity);
      var badge = (result && result.isNew)
        ? '<span class="cere-badge cere-badge-new">' + iw(icoStar()) + 'Yeni!</span>'
        : '<span class="cere-badge cere-badge-copy">' + iw(icoShell()) + '+' +
          ((result && result.kabukGained) | 0) + '</span>';
      var goldTag = (wrapper && wrapper.golden)
        ? '<span class="cere-badge cere-badge-gold">' + iw(icoStar()) + 'Altın Folyo</span>' : '';
      var btn = (result && result.isNew)
        ? '<button class="btn btn-primary" id="cere-next">Oyuncağını Birleştir!</button>'
        : '<button class="btn btn-primary" id="cere-next">Devam ▶</button>';
      // Seri numarası satırı ("Güneş Çayırı · 7/30") — sonraki merakı doğurur
      var seriSatir = '';
      try {
        var pb = (p.biome || 'cayir'), listP = (Yuvo.data && Yuvo.data.PUFIS) || [];
        var no = 0, tot = 0, ii, q;
        for (ii = 0; ii < listP.length; ii++) {
          q = listP[ii];
          if ((q.biome || 'cayir') !== pb || q.rarity === 'gizli') continue;
          tot += 1;
          if (q.id === p.id) no = tot;
        }
        var bioAd = (Yuvo.data && Yuvo.data.BIOMES && Yuvo.data.BIOMES[pb] && Yuvo.data.BIOMES[pb].ad) ||
                    'Güneş Çayırı';
        if (no > 0) seriSatir = '<p class="cere-serino">' + esc(bioAd) + ' · ' + no + '/' + tot + '</p>';
        else if (p.rarity === 'gizli') seriSatir = '<p class="cere-serino">' + esc(bioAd) + ' · ☾ Gizli Dost</p>';
      } catch (eSer) {}
      if (fxEl) {
        fxEl.innerHTML =
          '<div class="cere-card card">' +
            '<div class="cere-card-rays" aria-hidden="true"></div>' +
            '<div class="cere-portrait rf rf-' + esc(result && result.rarity) + '">' + pufiSVG('happy') + '</div>' +
            '<h2 class="cere-name">' + esc(p.ad) + '</h2>' +
            seriSatir +
            '<div class="cere-tags">' +
              '<span class="rarity-tag" style="background:' + esc(ri.renk) + '33;border-color:' + esc(ri.renk) + '">' +
                esc((ri.simge ? ri.simge + ' ' : '') + ri.ad) + '</span>' +
              badge + goldTag +
            '</div>' +
            '<p class="cere-bio">' + esc(p.bio || '') + '</p>' +
            btn +
          '</div>';
        play('chime');
        var b = fxEl.querySelector('#cere-next');
        if (b) {
          b.addEventListener('click', function () {
            play('click');
            doComplete(); // sonraki aşama: defter kodası (oradan mevcut yönlendirme)
          });
        }
      }
      // hızlı modda kart kendiliğinden akar (tap ile de geçilir); test atlaması kartı bekletir
      if (fast && !viaTestSkip) slater(next, 1700);
    },
    input: function () {},
    complete: function () { next(); },
    skip: function () { next(); }
  };

  // ---------- f. DEFTER KODASI (folyo Ambalaj Defteri'ne uçar) ----------
  stages.defterKoda = {
    enter: function () {
      navigated = false;
      if (fast) { // hızlı mod: koda toast'a iner (§2.f)
        play('stampSlap');
        toast(wrapper && wrapper.golden ? 'Altın folyon Şeref Yuvası\'na yapıştı!' : 'Folyon deftere yapıştı');
        slater(navigateOut, 450);
        return;
      }
      setHint('Folyon deftere uçuyor…');
      if (bookEl) bookEl.classList.add('show');
      var stamp = document.createElement('div');
      stamp.className = 'rit-stamp';
      stamp.innerHTML = artStamp();
      // uçuş hedefi: defter simgesinin gerçek konumu (piksel cinsinden CSS değişkenleri)
      try {
        if (stageEl && bookEl) {
          var sr = stageEl.getBoundingClientRect();
          var br = bookEl.getBoundingClientRect();
          var sx = sr.left + sr.width * 0.5, sy = sr.top + sr.height * 0.46;
          stamp.style.setProperty('--tx', Math.round(br.left + br.width / 2 - sx) + 'px');
          stamp.style.setProperty('--ty', Math.round(br.top + br.height / 2 - sy) + 'px');
        }
      } catch (e) {}
      if (stageEl) stageEl.appendChild(stamp);
      play('page'); // kâğıt düzelme hışırtısı
      slater(function () { // "şlap"
        play('stampSlap');
        vibrate(20);
        if (bookEl) bookEl.classList.add('slap');
        if (stamp.parentNode) stamp.parentNode.removeChild(stamp);
        toast(wrapper && wrapper.golden ? 'Altın folyon Şeref Yuvası\'na yapıştı!' : 'Folyon deftere yapıştı');
      }, 1250);
      slater(navigateOut, 2100);
    },
    input: function () {},
    complete: function () { navigateOut(); },
    skip: function () { navigateOut(); }
  };
  function navigateOut () { // mevcut yönlendirme: yeni parça → assembly; kopya → home
    if (navigated || !mounted) return;
    navigated = true;
    if (!Yuvo.go) return;
    if (result && result.isNew && result.pufi) Yuvo.go('assembly', { pufiId: result.pufi.id });
    else Yuvo.go('home');
  }

  // ---------- sahne API ----------
  Yuvo.scenes.ceremony = {
    mount: function (el, params) {
      mounted = true;
      rootEl = el;
      result = null; wrapper = null;
      stageIdx = -1; stageName = 'idle'; stageToken += 1;
      advancing = false; navigated = false; viaTestSkip = false;
      lastTap = 0; tapGuardUntil = 0; downT = 0; moved = 0; downOnTarget = false;
      torn = 0; dragging = false; dragAcc = 0;
      bites = 0; chocoDone = false;
      capStage = 0; capOpened = false; hushing = false; twisting = false; twistAcc = 0; twistTaps = 0;
      holdT0 = 0; holdTapCount = 0; magicEl = null; ringStep = 0;

      // 1) openEgg(eggIdx) ÖNCE çağrılır ve saklanır — görseller sonuçtan beslenir (§1.3)
      var res = null;
      var eggIdx = params && params.eggIdx;
      try {
        if (Yuvo.engine && Yuvo.engine.openEgg) res = Yuvo.engine.openEgg(eggIdx);
      } catch (e) { res = null; }
      if (!res || res.error || !res.pufi) { showNoEgg(); return; }
      result = res;
      wrapper = res.wrapper || { seri: 'gunesbahcesi', variant: 0, golden: false };

      // 2) tempo: fast = firstRitualDoneToday; nazik fren fast'ı tam ritüele yükseltir (§3)
      var s = st();
      var fastPref = s.firstRitualDoneToday === true;
      fastChoice = (s.lastChocolateChoice === 'biriktir') ? 'biriktir' : 'ye';
      nazikFren = (res.celebrationTier >= 2) || !!res.isNew;
      fast = fastPref && !nazikFren;
      try {
        s.firstRitualDoneToday = true; // mount sonunda true'ya çekilir (§5.4)
        if (Yuvo.engine && Yuvo.engine.save) Yuvo.engine.save();
      } catch (e2) {}

      buildStage();
      next(); // → folyo
    },
    unmount: function () {
      mounted = false;
      clearTimers();
      crinkleStop();
      stageToken += 1;
      if (stageEl) {
        stageEl.removeEventListener('pointerdown', onPointerDown);
        stageEl.removeEventListener('pointermove', onPointerMove);
        stageEl.removeEventListener('pointerup', onPointerUp);
        stageEl.removeEventListener('pointercancel', onPointerUp);
      }
      if (tabEl) tabEl.removeEventListener('click', onTabClick);
      rootEl = null; stageEl = null; eggWrapEl = null; objEl = null;
      scrapsEl = null; ringsEl = null; fxEl = null; burstEl = null;
      hintEl = null; tabEl = null; actionsEl = null; kikiEl = null; glowEl = null; bookEl = null;
      result = null; wrapper = null; magicEl = null;
      dragging = false; twisting = false; holdT0 = 0;
      stageName = 'idle'; stageIdx = -1; advancing = false;
    }
  };
  function onTabClick () { // kulakçık: tap = 1 şerit (dokunma hedefi ≥ 64px)
    if (stageName !== 'folyo') return;
    play('tap');
    tearOne();
  }

  // ---------- test kancaları ----------
  // GERİYE UYUMLU: töreni anında sonuç kartına sarar; sonucu döndürür (sahne açık değilse null).
  Yuvo.test.ceremonySkip = function () {
    if (!mounted) return null;
    if (!result) { if (Yuvo.go) Yuvo.go('home'); return null; }
    viaTestSkip = true;
    if (torn < needStrips) torn = needStrips;
    chocoDone = true; capStage = 2; capOpened = true;
    jumpTo('kart');
    return result;
  };

  // Tam ritüeli programatik yürütür; {fast:true} kısa varyantları koşar.
  // Açık tören yoksa vitrindeki ilk yumurtayla ('ceremony' sahnesine giderek) başlatır.
  Yuvo.test.ritual = function (opts) {
    opts = opts || {};
    try {
      var s = Yuvo.engine && Yuvo.engine.state;
      if (s) s.firstRitualDoneToday = !!opts.fast;
    } catch (e) {}
    if (!mounted) {
      try { if (Yuvo.go) Yuvo.go('ceremony', { eggIdx: (opts.eggIdx | 0) || 0 }); } catch (e2) {}
    }
    if (!mounted || !result) return null;
    var res = result;
    var guard = 0;
    while (mounted && result && guard < 12) { // her skip senkron ilerler; defter kodası yönlendirir
      guard += 1;
      var stg = stages[stageName];
      if (!stg || !stg.skip) break;
      try { stg.skip(); } catch (e3) { break; }
    }
    return res;
  };
})();
