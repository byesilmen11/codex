/* Yuvo Prototip — çekirdek kabuk: router, HUD, nav, modal, toast (SÖZLEŞME: değiştirme) */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };

  var app = document.getElementById('app');
  var hud = document.getElementById('hud');
  var sceneRoot = document.getElementById('scene-root');
  var nav = document.getElementById('bottom-nav');
  var overlayRoot = document.getElementById('overlay-root');
  var toastRoot = document.getElementById('toast-root');

  var FULLSCREEN = { ceremony:true, assembly:true };
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
  };

  // Arka plana tıklayınca kapatma: kalıcı overlayRoot'a BİR KEZ bağlanır (dinleyici birikmez)
  overlayRoot.addEventListener('click', function (e) {
    if (e.target === overlayRoot) overlayRoot.innerHTML = '';
  });

  Yuvo.modal = function (html) {
    var wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = '<button class="modal-close" aria-label="Kapat">✕</button>' + html;
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

  function renderHud () {
    var s = (Yuvo.engine && Yuvo.engine.state) || {};
    hud.innerHTML =
      '<span class="pill">⭐ ' + (s.stardust || 0) + '</span>' +
      '<span class="pill">🐚 ' + (s.kabuk || 0) + '</span>' +
      '<span class="pill">🥚 ' + (s.eggsAvailable || 0) + ' <small>bugün</small></span>';
  }

  var NAV = [
    { id:'home', ico:'🏡', ad:'Yuva' },
    { id:'album', ico:'📔', ad:'Albüm' },
    { id:'minigame', ico:'🎮', ad:'Oyna' }
  ];
  function renderNav () {
    nav.innerHTML = NAV.map(function (n) {
      return '<button data-go="' + n.id + '" class="' + (currentName === n.id ? 'active' : '') + '">' +
        '<span class="ico">' + n.ico + '</span>' + n.ad + '</button>';
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

  // Başlat
  document.addEventListener('DOMContentLoaded', function () {
    if (Yuvo.engine.load) Yuvo.engine.load();
    Yuvo.refresh();
    Yuvo.go('home');
  });
})();
