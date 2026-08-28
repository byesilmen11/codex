/* Yuvo — Motor: state, kalıcılık, ekonomi mutasyonları. Sahip: engine ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.engine = Yuvo.engine || {};

  var STORAGE_KEY = 'yuvo-proto-v1';
  var EXTRA_EGG_COST = 120;
  var EXTRA_EGG_MAX = 2;

  // Kilometre taşları: ownedCount eşiği → { anahtar, Kabuk ödülü }
  var MILESTONES = [
    { at:10, key:'m10', kabuk:15 },
    { at:20, key:'m20', kabuk:30 },
    { at:27, key:'m27', kabuk:60 },
    { at:30, key:'m30', kabuk:100 }
  ];

  function freshSeed () {
    return ((Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0) || 1;
  }

  function defaults () {
    return {
      version: 1,
      stardust: 40, kabuk: 0, day: 1,
      eggsAvailable: 3, extraEggsBought: 0,   // günlük: 3 temel + en çok 2 ek (120⭐/adet)
      eggCounter: 0, pityN: 0, pityD: 0, pityE: 0, copyStreak: 0,
      owned: {},                              // pufiId -> adet
      milestones: [],                         // ör. ['m10','m20','m27','m30']
      weekCrafts: 0, rewardedPlaysToday: 0,
      seed: freshSeed()                       // mulberry32 tohumu (gacha.js kullanır)
    };
  }

  function refresh () { if (Yuvo.refresh) { try { Yuvo.refresh(); } catch (e) {} } }
  function commit () { Yuvo.engine.save(); refresh(); }

  Yuvo.engine.state = defaults();

  Yuvo.engine.load = function () {
    var base = defaults();
    try {
      var raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          for (var k in base) {
            if (Object.prototype.hasOwnProperty.call(saved, k) && saved[k] !== null && saved[k] !== undefined) {
              base[k] = saved[k];
            }
          }
        }
      }
    } catch (e) { /* bozuk kayıt → temiz başlangıç */ }
    if (!base.owned || typeof base.owned !== 'object') base.owned = {};
    if (!Array.isArray(base.milestones)) base.milestones = [];
    if (!base.seed) base.seed = freshSeed();
    Yuvo.engine.state = base;
    return base;
  };

  Yuvo.engine.save = function () {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Yuvo.engine.state));
    } catch (e) { /* depolama yoksa sessizce devam */ }
  };

  Yuvo.engine.reset = function (seed) {
    var s = defaults();
    if (seed !== undefined && seed !== null) s.seed = (seed >>> 0) || 1;
    Yuvo.engine.state = s;
    commit();
    return s;
  };

  Yuvo.engine.newDay = function () {
    var s = Yuvo.engine.state;
    s.day += 1;
    s.eggsAvailable = 3;
    s.extraEggsBought = 0;
    s.rewardedPlaysToday = 0;
    if ((s.day - 1) % 7 === 0) s.weekCrafts = 0;  // yeni hafta → Atölye hakkı tazelenir
    commit();
  };

  Yuvo.engine.addStardust = function (n) {
    var s = Yuvo.engine.state;
    s.stardust = Math.max(0, s.stardust + (n | 0));
    commit();
  };

  Yuvo.engine.spendStardust = function (n) {
    var s = Yuvo.engine.state;
    n = n | 0;
    if (n < 0 || s.stardust < n) return false;
    s.stardust -= n;
    commit();
    return true;
  };

  Yuvo.engine.buyExtraEgg = function () {
    var s = Yuvo.engine.state;
    if (s.extraEggsBought >= EXTRA_EGG_MAX) return false;
    if (s.stardust < EXTRA_EGG_COST) return false;
    s.stardust -= EXTRA_EGG_COST;
    s.extraEggsBought += 1;
    s.eggsAvailable += 1;
    commit();
    return true;
  };

  // Gizli HARİÇ sahip olunan farklı parça sayısı (0-30).
  Yuvo.engine.ownedCount = function () {
    var s = Yuvo.engine.state, n = 0;
    for (var id in s.owned) {
      if (!s.owned[id]) continue;
      var p = Yuvo.data.pufiById && Yuvo.data.pufiById(id);
      if (p && p.rarity === 'gizli') continue;
      n += 1;
    }
    return n;
  };

  // Kilometre taşı ödülleri — bir kez, state.milestones ile.
  // Not: burada commit çağrılmaz; yeni parça kazandıran akış (openEgg/craft) zaten commit eder.
  Yuvo.engine.checkMilestones = function () {
    var s = Yuvo.engine.state;
    var count = Yuvo.engine.ownedCount();
    var granted = [];
    for (var i = 0; i < MILESTONES.length; i++) {
      var m = MILESTONES[i];
      if (count >= m.at && s.milestones.indexOf(m.key) === -1) {
        s.milestones.push(m.key);
        s.kabuk += m.kabuk;
        granted.push(m.key);
      }
    }
    return granted;
  };

  // Atölye: Kabuk yeterliyse üret; gizli için ownedCount()==30 şartı.
  Yuvo.engine.craft = function (pufiId) {
    var s = Yuvo.engine.state;
    var pufi = Yuvo.data.pufiById && Yuvo.data.pufiById(pufiId);
    if (!pufi) return { ok:false, reason:'bilinmiyor' };
    if (s.owned[pufiId]) return { ok:false, reason:'sahipli' };
    if (pufi.rarity === 'gizli' && Yuvo.engine.ownedCount() !== 30) {
      return { ok:false, reason:'gizli-kilitli' };
    }
    var cost = (Yuvo.data.RARITIES[pufi.rarity] || {}).uretim || 0;
    if (s.kabuk < cost) return { ok:false, reason:'kabuk-yetersiz' };
    s.kabuk -= cost;
    s.owned[pufiId] = 1;
    s.weekCrafts += 1;
    Yuvo.engine.checkMilestones();
    commit();
    return { ok:true };
  };

  // Test kancaları (motor kısmı) — nesneyi toptan yazma: sahne kancaları korunur.
  Yuvo.test = Yuvo.test || {};
  Yuvo.test.state = function () { return Yuvo.engine.state; };
  Yuvo.test.grantStardust = function (n) { Yuvo.engine.addStardust(n); };
  Yuvo.test.grantEggs = function (n) {
    var s = Yuvo.engine.state;
    s.eggsAvailable += Math.max(0, n | 0);
    commit();
  };
})();
