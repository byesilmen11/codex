/* Yuvo — Motor: state, kalıcılık, ekonomi + ritüel mutasyonları. Sahip: engine ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.engine = Yuvo.engine || {};

  var STORAGE_KEY = 'yuvo-proto-v1';
  var EXTRA_EGG_COST = 120;
  var EXTRA_EGG_MAX = 2;
  var DAILY_EGGS = 3;                       // newDay(): vitrine 3 ambalajlı yumurta
  var FREE_TOOLS = ['burgu', 'cekic', 'firlat'];

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

  // Ritüel sabitleri (data/wrappers.js); veri henüz yoksa güvenli varsayılanlar.
  function ritual () {
    var r = (Yuvo.data && Yuvo.data.RITUAL) || {};
    return {
      KUMBARA_ESIK: (typeof r.KUMBARA_ESIK === 'number') ? r.KUMBARA_ESIK : 15,
      KUMBARA_GUNLUK: (typeof r.KUMBARA_GUNLUK === 'number') ? r.KUMBARA_GUNLUK : 1,
      ISIRIK_YILDIZ: (typeof r.ISIRIK_YILDIZ === 'number') ? r.ISIRIK_YILDIZ : 2,
      CIKOLATA_YILDIZ_TAVAN: (typeof r.CIKOLATA_YILDIZ_TAVAN === 'number') ? r.CIKOLATA_YILDIZ_TAVAN : 40
    };
  }

  function seriesKeys () {
    var d = (Yuvo.data && Yuvo.data.WRAPPER_SERIES) || null;
    var keys = d ? Object.keys(d) : [];
    return keys.length ? keys : ['gunesbahcesi'];
  }

  function variantCount () {
    var n = Yuvo.data && Yuvo.data.WRAPPER_VARIANTS;
    return (typeof n === 'number' && n > 0) ? n : 8;
  }

  // Günün aktif ambalaj serisi: takvim yerleşiminin proto simülasyonu (gün → seri rotasyonu;
  // D1 = Güneş Bahçesi varsayılanı — docs/v2/06 §2.b).
  Yuvo.engine.activeSeries = function () {
    var s = Yuvo.engine.state;
    return daySeries(s ? s.day : 1);
  };

  function daySeries (day) {
    var keys = seriesKeys();
    return keys[Math.max(0, ((day || 1) - 1)) % keys.length];
  }

  // Ambalajlı vitrin yumurtası üretir. golden:null → altın çekilişi AÇILIŞTA yapılır; ambalaj
  // nadirlik/altın sızdıramaz çünkü sonuç vitrin anında henüz yok (dürüstlük sözleşmesi §1.3).
  function makeEgg (day, seri) {
    if (!seri || seriesKeys().indexOf(seri) === -1) seri = daySeries(day);
    return { seri:seri, variant: Math.floor(Math.random() * variantCount()), golden:null };
  }

  // Vitrini yeniden kurar ve sayaç senkronunu garanti eder (eggsAvailable = todayEggs.length).
  function fillTodayEggs (s, count) {
    s.todayEggs = [];
    for (var i = 0; i < count; i++) s.todayEggs.push(makeEgg(s.day));
    s.eggsAvailable = s.todayEggs.length;
  }

  function defaults () {
    var s = {
      version: 2,
      stardust: 40, kabuk: 0, day: 1,
      eggsAvailable: DAILY_EGGS, extraEggsBought: 0, // günlük: 3 temel + en çok 2 ek (120⭐/adet)
      eggCounter: 0, pityN: 0, pityD: 0, pityE: 0, copyStreak: 0,
      owned: {},                              // pufiId -> adet
      milestones: [],                         // ör. ['m10','m20','m27','m30']
      weekCrafts: 0, rewardedPlaysToday: 0,
      // --- v2 ritüel alanları (docs/v2/06 §5.3) ---
      todayEggs: [],                          // vitrindeki ambalajlı yumurtalar [{seri,variant,golden:null}]
      firstRitualDoneToday: false,            // tam ritüel / hızlı mod anahtarı (ceremony mount'ta true olur)
      chocolates: 0,                          // Çikolata Kumbarası sayacı
      chocolateStarsToday: 0,                 // çikolatadan bugün kazanılan ⭐ (tavan 40)
      kumbaraToday: 0,                        // bugünkü Çikolata Şöleni dönüşümü (günde max 1)
      lastChocolateChoice: 'ye',              // 'ye' | 'biriktir' — hızlı modun varsayılan davranışı
      foilBook: {},                           // seriId -> { variants:{0:count,...}, golden:count }
      goldenPity: 0,                          // Altın Folyo pity sayacı (gacha.js işler)
      tools: FREE_TOOLS.slice(),              // sahip olunan açma araçları
      activeTool: 'burgu',                    // seçili araç (saf kozmetik — orana asla dokunmaz)
      // --- v3 ebeveyn/mağaza alanları (docs/v2/05 §1-§2) — DEMO, gerçek ödeme yok ---
      parent: {
        pin: '1234',                          // DEMO varsayılanı (panel ekranda açıkça yazar)
        limitTL: storeLimits().varsayilanAylik,
        spentTL: 0,
        ay: monthKey(),                       // 'YYYY-MM' — ay değişince spentTL sıfırlanır
        clubActive: false,
        limitRaiseTs: 0                       // limit ARTIRIMI için 24 sa soğuma damgası
      },
      kiler: { adet: 0, bugunAcilan: 0 },     // satın alınan yumurtalar buraya düşer (binge freni)
      wishes: [],                             // [{pufiId, ts}] — Dilek Kavanozu (çocuk fiyat görmez)
      purchases: [],                          // [{paketId, ad, tutar, adet, ts}] — ebeveyn raporu
      // --- hikâye/FTUE + ikinci biyom (docs/v2/04 §1, v2·03) ---
      introDone: false,                       // FTUE açılışı bir kez oynar
      introGiftShown: false,                  // Kiki'nin albüm hediyesi bir kez oynar
      activeBiome: 'cayir',                   // 'cayir' | 'orman' — gacha havuzu bunu okur
      ormanAcik: false,                       // Fısıltı Ormanı kilidi (Çayır 10/30'da açılır)
      sakoHidden: null,                       // Şako'nun sakladığı orman parçası (pufiId|null)
      seed: freshSeed()                       // mulberry32 tohumu (gacha.js kullanır)
    };
    fillTodayEggs(s, DAILY_EGGS);
    return s;
  }

  function refresh () { if (Yuvo.refresh) { try { Yuvo.refresh(); } catch (e) {} } }
  function commit () { Yuvo.engine.save(); refresh(); }

  /* ---------- v3: mağaza/ebeveyn yardımcıları (store.js yoksa gömülü varsayılan) ---------- */
  function storeLimits () {
    var L = (Yuvo.data && Yuvo.data.STORE_LIMITS) || {};
    return {
      varsayilanAylik: L.varsayilanAylik != null ? L.varsayilanAylik : 400,
      secenekler: L.secenekler || [0, 100, 400, 750, 1500],
      sogumaSaat: L.sogumaSaat != null ? L.sogumaSaat : 24,
      kilerGunluk: L.kilerGunluk != null ? L.kilerGunluk : 5
    };
  }
  function clubInfo () {
    var C = (Yuvo.data && Yuvo.data.CLUB) || {};
    return {
      fiyat: C.fiyat != null ? C.fiyat : 79.99,
      bonusYuzde: C.bonusYuzde != null ? C.bonusYuzde : 10,
      gunlukYumurta: C.gunlukYumurta != null ? C.gunlukYumurta : 1,
      kilerEk: C.kilerEk != null ? C.kilerEk : 1
    };
  }
  function packById (id) {
    if (Yuvo.data && Yuvo.data.packById) { var p = Yuvo.data.packById(id); if (p) return p; }
    var P = (Yuvo.data && Yuvo.data.PACKS) || [], i;
    for (i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
    return null;
  }
  // Ay anahtarı: Date yasak değil ama deterministik test için state.day'den de türetilebilir.
  function monthKey () {
    try {
      var d = new Date();
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
    } catch (e) { return '1970-01'; }
  }
  function nowTs () { try { return Date.now(); } catch (e) { return 0; } }
  function round2 (n) { return Math.round((Number(n) || 0) * 100) / 100; }
  // Ay döndüyse harcama sayacını sıfırla (v2·05 §2.4 "12 Ağustos'ta yenilenir").
  function syncMonth (s) {
    var mk = monthKey();
    if (s.parent.ay !== mk) { s.parent.ay = mk; s.parent.spentTL = 0; }
  }

  Yuvo.engine.state = defaults();

  Yuvo.engine.load = function () {
    var base = defaults();
    var savedHadEggs = false;
    try {
      var raw = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          savedHadEggs = Array.isArray(saved.todayEggs);
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

    // --- version:2 migrasyonu + tip onarımı: eski (v1) kayıt yeni alanları varsayılanla açılır ---
    var i, e;
    if (!Array.isArray(base.todayEggs)) { base.todayEggs = []; savedHadEggs = false; }
    if (!savedHadEggs) {
      // v1 kaydı: eldeki yumurta hakkı korunur, vitrine ambalajlı karşılıkları konur
      fillTodayEggs(base, Math.max(0, base.eggsAvailable | 0));
    } else {
      var keys = seriesKeys(), temiz = [];
      for (i = 0; i < base.todayEggs.length; i++) {
        e = base.todayEggs[i];
        if (!e || typeof e !== 'object') continue;
        if (keys.indexOf(e.seri) === -1) e.seri = daySeries(base.day);
        e.variant = Math.max(0, Math.min(variantCount() - 1, e.variant | 0));
        if (e.golden !== true) e.golden = null;
        temiz.push(e);
      }
      base.todayEggs = temiz;
    }
    if (!base.foilBook || typeof base.foilBook !== 'object' || Array.isArray(base.foilBook)) base.foilBook = {};
    if (!Array.isArray(base.tools) || !base.tools.length) base.tools = FREE_TOOLS.slice();
    for (i = 0; i < FREE_TOOLS.length; i++) {
      if (base.tools.indexOf(FREE_TOOLS[i]) === -1) base.tools.push(FREE_TOOLS[i]);
    }
    if (base.tools.indexOf(base.activeTool) === -1) base.activeTool = base.tools[0];
    if (base.lastChocolateChoice !== 'biriktir') base.lastChocolateChoice = 'ye';
    base.chocolates = Math.max(0, base.chocolates | 0);
    base.chocolateStarsToday = Math.max(0, base.chocolateStarsToday | 0);
    base.kumbaraToday = Math.max(0, base.kumbaraToday | 0);
    base.goldenPity = Math.max(0, base.goldenPity | 0);
    base.firstRitualDoneToday = base.firstRitualDoneToday === true;

    // --- version:3 migrasyonu: v1/v2 kayıtları ebeveyn/mağaza alanlarını varsayılanla açar ---
    var L = storeLimits();
    if (!base.parent || typeof base.parent !== 'object' || Array.isArray(base.parent)) base.parent = {};
    if (typeof base.parent.pin !== 'string' || !/^\d{4}$/.test(base.parent.pin)) base.parent.pin = '1234';
    if (typeof base.parent.limitTL !== 'number' || base.parent.limitTL < 0) base.parent.limitTL = L.varsayilanAylik;
    base.parent.spentTL = Math.max(0, round2(base.parent.spentTL));
    if (typeof base.parent.ay !== 'string') base.parent.ay = monthKey();
    base.parent.clubActive = base.parent.clubActive === true;
    base.parent.limitRaiseTs = Math.max(0, base.parent.limitRaiseTs | 0);
    syncMonth(base);                            // ay döndüyse harcama sayacı sıfırlanır
    if (!base.kiler || typeof base.kiler !== 'object' || Array.isArray(base.kiler)) base.kiler = {};
    base.kiler.adet = Math.max(0, base.kiler.adet | 0);
    base.kiler.bugunAcilan = Math.max(0, base.kiler.bugunAcilan | 0);
    if (!Array.isArray(base.wishes)) base.wishes = [];
    var temizW = [];
    for (i = 0; i < base.wishes.length; i++) {
      var w = base.wishes[i];
      if (w && typeof w === 'object' && typeof w.pufiId === 'string') {
        temizW.push({ pufiId: w.pufiId, ts: Math.max(0, w.ts | 0) });
      }
    }
    base.wishes = temizW;
    if (!Array.isArray(base.purchases)) base.purchases = [];

    base.version = 3;
    base.eggsAvailable = base.todayEggs.length;  // ZORUNLU senkron (main.js HUD / home bunu okur)

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
    fillTodayEggs(s, DAILY_EGGS);           // aktif seriden 3 ambalajlı yumurta + senkron
    s.extraEggsBought = 0;
    s.rewardedPlaysToday = 0;
    s.firstRitualDoneToday = false;         // günün ilk yumurtası yine tam ritüel
    s.chocolateStarsToday = 0;
    s.kumbaraToday = 0;
    s.kiler.bugunAcilan = 0;                // kilerden günlük açma hakkı tazelenir
    syncMonth(s);                           // ay döndüyse ebeveyn harcaması sıfırlanır
    // Şako: orman açıkken sahipli bir orman parçasını "saklar" (yok olmaz, iz bırakır)
    if (s.ormanAcik && !s.sakoHidden) {
      var ormanIds = [], oid, op;
      for (oid in s.owned) {
        if (!s.owned[oid]) continue;
        op = Yuvo.data.pufiById && Yuvo.data.pufiById(oid);
        if (op && op.biome === 'orman' && op.rarity !== 'gizli') ormanIds.push(oid);
      }
      if (ormanIds.length >= 2) s.sakoHidden = ormanIds[Math.floor(Math.random() * ormanIds.length)];
    }
    if (s.parent.clubActive) {              // Club: her gün 1 bonus yumurta doğrudan vitrine
      var cAdet = clubInfo().gunlukYumurta | 0, ci;
      for (ci = 0; ci < cAdet; ci++) { s.todayEggs.push(makeEgg(s.day)); }
      s.eggsAvailable = s.todayEggs.length;
    }
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
    s.todayEggs.push(makeEgg(s.day));       // satın alınan yumurta vitrine aynı ambalaj diliyle düşer
    s.eggsAvailable += 1;                   // todayEggs ile birlikte artar (senkron)
    commit();
    return true;
  };

  // Vitrine ambalajlı yumurta ekler (görev ödülü / kiler / Çikolata Şöleni).
  // seri verilmezse günün aktif serisi; variant rastgele. Eklenen yumurtayı döndürür.
  Yuvo.engine.grantEgg = function (seri) {
    var s = Yuvo.engine.state;
    var egg = makeEgg(s.day, seri);
    s.todayEggs.push(egg);
    s.eggsAvailable += 1;                   // senkron: todayEggs.length ile birlikte
    commit();
    return egg;
  };

  // Isırık: +2⭐ (çikolata kaynaklı ⭐ günlük tavanı 40 — docs/v2/06 §2.c).
  // Kazanılan ⭐ miktarını döndürür (tavana takıldıysa 0; ısırık yine sayılır, tören bozulmaz).
  Yuvo.engine.eatChocolate = function () {
    var s = Yuvo.engine.state, R = ritual();
    var gain = Math.max(0, Math.min(R.ISIRIK_YILDIZ, R.CIKOLATA_YILDIZ_TAVAN - s.chocolateStarsToday));
    s.chocolateStarsToday += gain;
    s.stardust += gain;
    s.lastChocolateChoice = 'ye';
    commit();
    return gain;
  };

  // Çikolata Kumbarası: çikolata bütün hâlde kavanoza. Yeni kumbara sayısını döndürür.
  Yuvo.engine.bankChocolate = function () {
    var s = Yuvo.engine.state;
    s.chocolates += 1;
    s.lastChocolateChoice = 'biriktir';
    commit();
    return s.chocolates;
  };

  // Çikolata Şöleni: 15 çikolata + günde 1 hak → 1 bonus vitrin yumurtası (günlük tavana sayılır).
  Yuvo.engine.redeemChocolates = function () {
    var s = Yuvo.engine.state, R = ritual();
    if (s.chocolates < R.KUMBARA_ESIK) return false;
    if (s.kumbaraToday >= R.KUMBARA_GUNLUK) return false;
    s.chocolates -= R.KUMBARA_ESIK;
    s.kumbaraToday += 1;
    Yuvo.engine.grantEgg();                 // commit'i grantEgg yapar (tek kayıt)
    return true;
  };

  // Açılan folyoyu Ambalaj Defteri'ne işler — openEgg içinden çağrılır; commit'i openEgg yapar
  // (checkMilestones deseniyle aynı). Altın folyo Altın Şeref Yuvası'na, normal folyo varyant
  // yuvasına (×n kopya sayacı) yazılır. Defter saf kozmetiktir: oran/pity'ye etkisi yoktur (§2.f).
  Yuvo.engine.registerFoil = function (seri, variant, golden) {
    var s = Yuvo.engine.state;
    if (!s.foilBook || typeof s.foilBook !== 'object') s.foilBook = {};
    var rec = s.foilBook[seri];
    if (!rec || typeof rec !== 'object') rec = s.foilBook[seri] = { variants:{}, golden:0 };
    if (!rec.variants || typeof rec.variants !== 'object') rec.variants = {};
    if (golden) rec.golden = (rec.golden | 0) + 1;
    else rec.variants[variant] = (rec.variants[variant] | 0) + 1;
    return rec;
  };

  // Araç seçimi (saf kozmetik): yalnız sahip olunan araç aktifleşir.
  Yuvo.engine.setTool = function (id) {
    var s = Yuvo.engine.state;
    if (!Array.isArray(s.tools) || s.tools.indexOf(id) === -1) return false;
    s.activeTool = id;
    commit();
    return true;
  };

  // Gizli HARİÇ sahip olunan farklı parça sayısı (0-30).
  // biome verilirse yalnız o biyomun parçaları sayılır ('cayir'|'orman');
  // verilmezse tüm biyomların toplamı (geriye uyumlu).
  Yuvo.engine.ownedCount = function (biome) {
    var s = Yuvo.engine.state, n = 0;
    for (var id in s.owned) {
      if (!s.owned[id]) continue;
      var p = Yuvo.data.pufiById && Yuvo.data.pufiById(id);
      if (p && p.rarity === 'gizli') continue;
      if (biome && p && (p.biome || 'cayir') !== biome) continue;
      n += 1;
    }
    return n;
  };

  // Kilometre taşı ödülleri — bir kez, state.milestones ile (Çayır Sezon-1 rozetleri).
  // Not: burada commit çağrılmaz; yeni parça kazandıran akış (openEgg/craft) zaten commit eder.
  Yuvo.engine.checkMilestones = function () {
    var s = Yuvo.engine.state;
    var count = Yuvo.engine.ownedCount('cayir');
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
    if (pufi.rarity === 'gizli' && Yuvo.engine.ownedCount(pufi.biome || 'cayir') !== 30) {
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

  /* ======================================================================
     İkinci biyom: Fısıltı Ormanı + Şako Saklambaç (docs/v2/03-04, D3 vuruşu)
     ====================================================================== */

  // Aktif biyomu değiştirir; orman yalnız kilidi açıksa seçilebilir.
  Yuvo.engine.setBiome = function (b) {
    var s = Yuvo.engine.state;
    if (b !== 'cayir' && !(b === 'orman' && s.ormanAcik)) return false;
    if (s.activeBiome === b) return true;
    s.activeBiome = b;
    commit();
    return true;
  };

  // Çayır 10/30'a ulaşınca ormanı BİR KEZ açar; yeni açıldıysa true döner.
  // (commit yok: openEgg/craft akışı zaten commit eder — checkMilestones deseni.)
  Yuvo.engine.checkOrmanUnlock = function () {
    var s = Yuvo.engine.state;
    if (s.ormanAcik) return false;
    if (Yuvo.engine.ownedCount('cayir') >= 10) { s.ormanAcik = true; return true; }
    return false;
  };

  // Şako Saklambaç kazanımı: saklanan parça geri döner ("yok olmaz, iz bırakır" —
  // parça hep sahipli kalır, yalnız albümde Şako tüyüyle gizli görünür).
  Yuvo.engine.sakoRecover = function () {
    var s = Yuvo.engine.state;
    if (!s.sakoHidden) return false;
    s.sakoHidden = null;
    commit();
    return true;
  };

  /* ======================================================================
     v3 — Ebeveyn paneli / mağaza SİMÜLASYONU API'leri (docs/v2/05 §1-§2)
     DEMO: gerçek ödeme yok. Satın alma yalnız Kiler'e yumurta ekler;
     vitrine tek giriş drawFromKiler() → günlük tavanla (binge freni).
     ====================================================================== */

  // Dilek Kavanozu: çocuk fiyat GÖRMEZ; son 7 günde en çok 5 dilek, tekrar yok.
  Yuvo.engine.addWish = function (pufiId) {
    var s = Yuvo.engine.state, i, hafta = 7 * 24 * 3600 * 1000, now = nowTs();
    if (typeof pufiId !== 'string' || !pufiId) return false;
    var taze = [];
    for (i = 0; i < s.wishes.length; i++) {
      if (now - s.wishes[i].ts < hafta) taze.push(s.wishes[i]);
    }
    s.wishes = taze;
    for (i = 0; i < s.wishes.length; i++) if (s.wishes[i].pufiId === pufiId) return false;
    if (s.wishes.length >= 5) return false;
    s.wishes.push({ pufiId: pufiId, ts: now });
    commit();
    return true;
  };

  Yuvo.engine.clearWish = function (pufiId) {
    var s = Yuvo.engine.state, i, kaldi = [];
    for (i = 0; i < s.wishes.length; i++) if (s.wishes[i].pufiId !== pufiId) kaldi.push(s.wishes[i]);
    var degisti = kaldi.length !== s.wishes.length;
    s.wishes = kaldi;
    if (degisti) commit();
    return degisti;
  };

  // Paket satın alma (SİMÜLASYON): limit kontrolü → Kiler'e ekle → kayıt.
  // ASLA doğrudan vitrine koymaz; Club bonusu yukarı yuvarlanır (10→11).
  Yuvo.engine.buyPack = function (paketId) {
    var s = Yuvo.engine.state;
    var p = packById(paketId);
    if (!p) return { ok: false, reason: 'bilinmiyor' };
    syncMonth(s);
    var tutar = round2(p.tl);
    if (round2(s.parent.spentTL + tutar) > s.parent.limitTL + 1e-9) {
      return { ok: false, reason: 'limit' };
    }
    var adet = p.adet | 0;
    if (s.parent.clubActive) {
      var C = clubInfo();
      adet += Math.ceil(adet * (C.bonusYuzde / 100));   // eksik teslim yok
    }
    s.parent.spentTL = round2(s.parent.spentTL + tutar);
    s.kiler.adet += adet;
    s.purchases.push({ paketId: p.id, ad: p.ad, tutar: tutar, adet: adet, ts: nowTs() });
    commit();
    return { ok: true, adet: adet, tutar: tutar };
  };

  // Kilerden günlük çekim: tavan = 5 (+1 Club). Vitrine grantEgg ile düşer.
  Yuvo.engine.drawFromKiler = function () {
    var s = Yuvo.engine.state;
    if (s.kiler.adet <= 0) return false;
    var tavan = storeLimits().kilerGunluk + (s.parent.clubActive ? clubInfo().kilerEk : 0);
    if (s.kiler.bugunAcilan >= tavan) return false;
    s.kiler.adet -= 1;
    s.kiler.bugunAcilan += 1;
    s.todayEggs.push(makeEgg(s.day));
    s.eggsAvailable = s.todayEggs.length;
    commit();
    return true;
  };

  Yuvo.engine.setLimit = function (tl) {
    var s = Yuvo.engine.state;
    tl = Math.max(0, round2(tl));
    var eski = s.parent.limitTL;
    s.parent.limitTL = tl;
    var soguma = tl > eski;                   // ARTIRIM → 24 sa soğuma bilgisi (DEMO'da bilgilendirme)
    if (soguma) s.parent.limitRaiseTs = nowTs();
    commit();
    return { ok: true, soguma: soguma, sogumaSaat: storeLimits().sogumaSaat };
  };

  Yuvo.engine.setPin = function (p) {
    var s = Yuvo.engine.state;
    if (typeof p !== 'string' || !/^\d{4}$/.test(p)) return false;
    s.parent.pin = p;
    commit();
    return true;
  };

  Yuvo.engine.toggleClub = function () {
    var s = Yuvo.engine.state;
    s.parent.clubActive = !s.parent.clubActive;
    commit();
    return s.parent.clubActive;
  };

  // Ebeveyn raporu özeti — satış teklifi içermez (v2·05 §2.5).
  Yuvo.engine.spendReport = function () {
    var s = Yuvo.engine.state, i, toplamYumurta = 0, dokum = {}, liste = [];
    syncMonth(s);
    for (i = 0; i < s.purchases.length; i++) {
      var pr = s.purchases[i];
      toplamYumurta += pr.adet | 0;
      if (!dokum[pr.paketId]) dokum[pr.paketId] = { ad: pr.ad, adet: 0, tutar: 0 };
      dokum[pr.paketId].adet += 1;
      dokum[pr.paketId].tutar = round2(dokum[pr.paketId].tutar + pr.tutar);
    }
    for (var k in dokum) liste.push(dokum[k]);
    var pufiSayisi = 0;
    for (var id in s.owned) if (s.owned[id]) pufiSayisi += 1;
    return {
      ay: s.parent.ay, spentTL: s.parent.spentTL, limitTL: s.parent.limitTL,
      clubActive: s.parent.clubActive,
      paketler: liste, paketAdet: s.purchases.length,
      yumurta: toplamYumurta, kiler: s.kiler.adet, pufi: pufiSayisi
    };
  };

  // Test kancaları (motor kısmı) — nesneyi toptan yazma: sahne kancaları korunur.
  Yuvo.test = Yuvo.test || {};
  Yuvo.test.state = function () { return Yuvo.engine.state; };
  Yuvo.test.grantStardust = function (n) { Yuvo.engine.addStardust(n); };
  Yuvo.test.grantEggs = function (n) {      // artık vitrine AMBALAJLI yumurta ekler (grantEgg dili)
    var s = Yuvo.engine.state;
    n = Math.max(0, n | 0);
    for (var i = 0; i < n; i++) s.todayEggs.push(makeEgg(s.day));
    s.eggsAvailable += n;                   // senkron: todayEggs ile birlikte
    commit();
  };
  Yuvo.test.grantChocolates = function (n) {
    var s = Yuvo.engine.state;
    s.chocolates = Math.max(0, s.chocolates + (n | 0));
    commit();
  };
  Yuvo.test.setTool = function (id) { return Yuvo.engine.setTool(id); };
  Yuvo.test.foilBook = function () { return Yuvo.engine.state.foilBook; };
})();
