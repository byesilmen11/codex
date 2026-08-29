/* Yuvo Prototip — çekirdek kabuk: router, HUD, nav, modal, toast (SÖZLEŞME: davranış sabit).
   Marka geçişi (BRAND.md): yalnız render markup'ı değişti — HUD artık logo + ikonlu haplar,
   nav Yuvo.icons ile çizilir; Yuvo.go guard'ı, overlay temizliği, modal API'si ve
   tek-seferlik dinleyiciler AYNEN korunur. */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };

  var app = document.getElementById('app');
  var hud = document.getElementById('hud');
  var sceneRoot = document.getElementById('scene-root');
  var nav = document.getElementById('bottom-nav');
  var overlayRoot = document.getElementById('overlay-root');
  var toastRoot = document.getElementById('toast-root');

  var FULLSCREEN = { ceremony:true, assembly:true, intro:true, parent:true, sako:true };
  var current = null, currentName = null;

  Yuvo.go = function (name, params) {
    if (name === currentName && !params) return; // aynı sekmeye çift dokunuş oyunu sıfırlamasın
    if (current && current.unmount) { try { current.unmount(); } catch (e) { console.error(e); } }
    sceneRoot.innerHTML = '';
    overlayRoot.innerHTML = ''; // sahne değişince açık modal kalmasın
    sceneRoot.scrollTop = 0;
    currentName = name;
    current = Yuvo.scenes[name];
    if (!current) { console.error('Sahne yok: ' + name); return; }
    app.classList.toggle('fullscreen', !!FULLSCREEN[name]);
    renderNav();
    current.mount(sceneRoot, params || {});
    // Yumuşak sahne girişi (180ms) — mount SENKRON kalır (test kancaları/akış bozulmaz)
    sceneRoot.classList.remove('scene-fade');
    void sceneRoot.offsetWidth;
    sceneRoot.classList.add('scene-fade');
  };

  // Arka plana tıklayınca kapatma: kalıcı overlayRoot'a BİR KEZ bağlanır (dinleyici birikmez)
  overlayRoot.addEventListener('click', function (e) {
    if (e.target === overlayRoot) overlayRoot.innerHTML = '';
  });

  Yuvo.modal = function (html) {
    var wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = '<button class="modal-close" aria-label="Kapat">' + ico('close', '✕') + '</button>' + html;
    overlayRoot.innerHTML = '';
    overlayRoot.appendChild(wrap);
    function close () { overlayRoot.innerHTML = ''; }
    wrap.querySelector('.modal-close').addEventListener('click', close);
    return close;
  };

  Yuvo.toast = function (text) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    toastRoot.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  };

  Yuvo.refresh = function () {
    renderHud();
    document.dispatchEvent(new CustomEvent('yuvo:state'));
  };

  // Yuvo.icons güvenli erişim: ikon yoksa emoji fallback (BRAND.md §4)
  function ico (name, fallback) {
    try {
      if (Yuvo.icons && Yuvo.icons[name]) {
        var s = Yuvo.icons[name]();
        if (s) return s;
      }
    } catch (e) {}
    return '<span class="ico-fallback">' + fallback + '</span>';
  }

  function renderHud () {
    var s = (Yuvo.engine && Yuvo.engine.state) || {};
    hud.innerHTML =
      '<span class="hud-logo">' + ico('logo', 'Yuvo') + '</span>' +
      '<span class="hud-pills">' +
        '<span class="pill pill-star" aria-label="Yıldız Tozu">' +
          '<span class="pill-ico">' + ico('star', '⭐') + '</span><b>' + (s.stardust || 0) + '</b></span>' +
        '<span class="pill pill-shell" aria-label="Kabuk">' +
          '<span class="pill-ico">' + ico('shell', '🐚') + '</span><b>' + (s.kabuk || 0) + '</b></span>' +
        '<span class="pill pill-egg" aria-label="Bugünkü yumurta hakkı">' +
          '<span class="pill-ico">' + ico('egg', '🥚') + '</span><b>' + (s.eggsAvailable || 0) + '</b>' +
          ' <small>bugün</small></span>' +
      '</span>';
  }

  var NAV = [
    { id:'home', icon:'yuva', emoji:'🏡', ad:'Yuva' },
    { id:'album', icon:'album', emoji:'📔', ad:'Albüm' },
    { id:'foilbook', icon:'shell', emoji:'📔', ad:'Defter' },
    { id:'minigame', icon:'oyna', emoji:'🎮', ad:'Oyna' }
  ];
  function renderNav () {
    nav.innerHTML = NAV.map(function (n) {
      return '<button data-go="' + n.id + '" class="' + (currentName === n.id ? 'active' : '') + '"' +
        ' aria-label="' + n.ad + '">' +
        '<span class="ico">' + ico(n.icon, n.emoji) + '</span>' +
        '<span class="nav-label">' + n.ad + '</span></button>';
    }).join('');
  }
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-go]');
    if (b) { if (Yuvo.audio.play) Yuvo.audio.play('click'); Yuvo.go(b.getAttribute('data-go')); }
  });

  var unlocked = false;
  document.addEventListener('pointerdown', function () {
    if (!unlocked && Yuvo.audio && Yuvo.audio.unlock) { unlocked = true; Yuvo.audio.unlock(); }
  }, { passive:true });

  // Başlat — ilk açılış FTUE'ye (intro), sonrası yuvaya (docs/v2/04 §1)
  document.addEventListener('DOMContentLoaded', function () {
    if (Yuvo.engine.load) Yuvo.engine.load();
    Yuvo.refresh();
    var s = (Yuvo.engine && Yuvo.engine.state) || {};
    Yuvo.go((!s.introDone && Yuvo.scenes.intro) ? 'intro' : 'home');
  });
})();
