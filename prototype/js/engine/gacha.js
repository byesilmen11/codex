/* Yuvo — Motor: düşüş algoritması (docs/v2/02 §2.2, proto sabitleriyle). Sahip: engine ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.engine = Yuvo.engine || {};

  // ---------- SABİTLER (Güneş Çayırı onboarding istisnası: E pity 35/50) ----------
  var SOFT_PITY_E = 35;
  var SOFT_ARTIS = 0.06;
  var HARD_PITY_E = 50;
  var PITY_DESTANSI = 40;   // 40 yumurtadır Destansı+ görmediyse
  var PITY_NADIR = 15;      // 15 yumurtadır Nadir+ görmediyse
  var ONBOARDING = 10;      // ilk 10 yumurta: hep eksik; 3.'sü Nadir+ garanti
  var KOPYA_SERI_ESIGI = 6; // 6 ardışık kopya → sıradaki kesin eksik parça
  var W_EKSIK = 4;          // akıllı düşüş: eksik parça ağırlığı
  var W_EKSIK_SON3 = 12;    // ownedCount >= 27 iken eksik ağırlığı

  var TIERS = ['yaygin', 'azbulunur', 'nadir', 'destansi', 'efsanevi', 'gizli'];
  var RANK = { yaygin:0, azbulunur:1, nadir:2, destansi:3, efsanevi:4, gizli:5 };

  // Altın Folyo sabitleri (data/wrappers.js; veri yoksa güvenli varsayılanlar) — docs/v2/06 §2.f.
  function ritualConst () {
    var r = (Yuvo.data && Yuvo.data.RITUAL) || {};
    return {
      GOLDEN_ORAN: (typeof r.GOLDEN_ORAN === 'number') ? r.GOLDEN_ORAN : 0.02,
      GOLDEN_HARD: (typeof r.GOLDEN_HARD === 'number') ? r.GOLDEN_HARD : 40
    };
  }
  var forceGoldenNext = false;              // test kancası: sıradaki açılış kesin altın

  // ---------- RNG: mulberry32, tohum state'te kalıcı ----------
  function rand () {
    var s = Yuvo.engine.state;
    s.seed = (s.seed + 0x6D2B79F5) >>> 0;
    var t = s.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function weightedPick (keys, weights, r) {
    var total = 0, i;
    for (i = 0; i < keys.length; i++) total += weights[i];
    var x = r * total;
    for (i = 0; i < keys.length; i++) {
      x -= weights[i];
      if (x < 0) return keys[i];
    }
    // Kayan-nokta artığı: ağırlığı 0 olan anahtar asla dönmesin — geriye tara
    for (i = keys.length - 1; i >= 0; i--) { if (weights[i] > 0) return keys[i]; }
    return keys[keys.length - 1];
  }

  function poolOf (tier) {
    var out = [], list = Yuvo.data.PUFIS || [];
    for (var i = 0; i < list.length; i++) { if (list[i].rarity === tier) out.push(list[i]); }
    return out;
  }

  function tierEksikVar (s, tier) {
    var havuz = poolOf(tier);
    for (var i = 0; i < havuz.length; i++) { if (!s.owned[havuz[i].id]) return true; }
    return false;
  }

  // ---------- KADEME SEÇİMİ ----------
  function pickTier (s, gizliHavuzda) {
    if (s.pityE >= HARD_PITY_E - 1) return 'efsanevi'; // mutlak tavan

    var base = Yuvo.data.RARITIES;
    var w = {
      yaygin: base.yaygin.oran, azbulunur: base.azbulunur.oran, nadir: base.nadir.oran,
      destansi: base.destansi.oran, efsanevi: base.efsanevi.oran, gizli: base.gizli.oran
    };
    if (!gizliHavuzda) { w.yaygin += w.gizli; w.gizli = 0; } // gizli yalnız 30/30'da havuzda

    if (s.pityE >= SOFT_PITY_E - 1) { // soft pity: Gizli oranına dokunmadan normalize
      w.efsanevi = Math.min(0.95, base.efsanevi.oran + SOFT_ARTIS * (s.pityE - SOFT_PITY_E + 2));
      var rest = 1 - w.efsanevi - w.gizli;
      var restSum = w.yaygin + w.azbulunur + w.nadir + w.destansi;
      if (restSum > 0 && rest > 0) {
        var f = rest / restSum;
        w.yaygin *= f; w.azbulunur *= f; w.nadir *= f; w.destansi *= f;
      } else {
        w.yaygin = Math.max(0, rest); w.azbulunur = 0; w.nadir = 0; w.destansi = 0;
      }
    }

    var tier = weightedPick(TIERS, [w.yaygin, w.azbulunur, w.nadir, w.destansi, w.efsanevi, w.gizli], rand());

    // Taban-yükseltme pity'leri
    if (s.pityD >= PITY_DESTANSI - 1 && RANK[tier] < RANK.destansi) tier = 'destansi';
    else if (s.pityN >= PITY_NADIR - 1 && RANK[tier] < RANK.nadir) tier = 'nadir';
    // Onboarding garantisi: 3. yumurta Nadir+
    if (s.eggCounter === 3 && RANK[tier] < RANK.nadir) tier = 'nadir';
    return tier;
  }

  // ---------- PARÇA SEÇİMİ (akıllı düşüş) ----------
  function pickPufi (s, tier, zorlaEksik) {
    var havuz = poolOf(tier);
    var eksik = [], i;
    for (i = 0; i < havuz.length; i++) { if (!s.owned[havuz[i].id]) eksik.push(havuz[i]); }

    if ((tier === 'efsanevi' || tier === 'gizli') && eksik.length) {
      return eksik[Math.floor(rand() * eksik.length)]; // E/G hep eksik-öncelikli
    }
    if (zorlaEksik && eksik.length) {
      return eksik[Math.floor(rand() * eksik.length)];
    }
    var wEksik = (Yuvo.engine.ownedCount() >= 27) ? W_EKSIK_SON3 : W_EKSIK;
    var weights = [];
    for (i = 0; i < havuz.length; i++) weights.push(s.owned[havuz[i].id] ? 1 : wEksik);
    return weightedPick(havuz, weights, rand());
  }

  // ---------- YUMURTA AÇ ----------
  // openEgg(eggIdx): vitrindeki (state.todayEggs) yumurtayı açar — docs/v2/06 §5.3.
  // eggIdx yalnız ambalaj görselini seçer, havuzu/oranı DEĞİŞTİRMEZ (proto tek aile;
  // çok-biyomlu oyunda kaynakBiyom olur). Nadirlik burada, açılış anında çekilir (§1.3).
  Yuvo.engine.openEgg = function (eggIdx) {
    var s = Yuvo.engine.state;
    if (!s || s.eggsAvailable <= 0) return { error:'no-egg' };
    var vitrin = Array.isArray(s.todayEggs) ? s.todayEggs : (s.todayEggs = []);
    var idx = (eggIdx === undefined || eggIdx === null) ? 0 : (eggIdx | 0);
    if (idx < 0) return { error:'no-egg' };
    var alinan = vitrin.splice(idx, 1);
    if (!alinan.length) {
      // vitrinde o yumurta yok — hayalet sayaç kendini onarır (elle bozulmuş
      // state'te HUD bir sonraki load()'a dek var olmayan yumurta göstermesin)
      s.eggsAvailable = vitrin.length;
      return { error:'no-egg' };
    }
    var egg = alinan[0];

    s.eggsAvailable = vitrin.length;        // ZORUNLU senkron (main.js HUD / home okur)
    s.eggCounter += 1;

    var zorlaEksik = (s.eggCounter <= ONBOARDING) || (s.copyStreak >= KOPYA_SERI_ESIGI);
    var gizliHavuzda = Yuvo.engine.ownedCount() === 30;

    var tier = pickTier(s, gizliHavuzda);

    // Kesin-eksik garantisi kademeler ARASI da işler: çekilen kademenin havuzu tam
    // sahipliyse, aynı-veya-üstü ranktan eksikli bir kademeye (oranları koruyarak)
    // yükselt. Asla düşürme (pity tavanları bozulmaz); Gizli hariç — docs/v2/02 §2.1.4
    // "Pity YOK (bilinçli)", zorlama onu fiilen pity'ye çevirirdi.
    if (zorlaEksik && !tierEksikVar(s, tier)) {
      var adaylar = [], aw = [], ti;
      for (ti = 0; ti < TIERS.length; ti++) {
        var t2 = TIERS[ti];
        if (t2 === 'gizli' || RANK[t2] < RANK[tier]) continue;
        if (!tierEksikVar(s, t2)) continue;
        adaylar.push(t2); aw.push((Yuvo.data.RARITIES[t2] || {}).oran || 0);
      }
      if (adaylar.length === 1) tier = adaylar[0];
      else if (adaylar.length > 1) tier = weightedPick(adaylar, aw, rand());
      // adaylar boşsa kopya kaçınılmaz (ör. tek Efsanevi zaten sahipli) — olduğu gibi bırak
    }

    var pufi = pickPufi(s, tier, zorlaEksik);
    var rarity = pufi.rarity; // = tier

    var isNew, kabukGained = 0;
    if (s.owned[pufi.id]) {
      isNew = false;
      s.owned[pufi.id] += 1;
      kabukGained = (Yuvo.data.RARITIES[rarity] || {}).kabuk || 0;
      s.kabuk += kabukGained;
      s.copyStreak += 1;
    } else {
      isNew = true;
      s.owned[pufi.id] = 1;
      s.copyStreak = 0;
      if (Yuvo.engine.checkMilestones) Yuvo.engine.checkMilestones();
    }

    // Sayaçlar — asla süreyle/paketle sıfırlanmaz, yalnız düşüşle
    var r = RANK[rarity];
    s.pityN = (r >= RANK.nadir) ? 0 : s.pityN + 1;
    s.pityD = (r >= RANK.destansi) ? 0 : s.pityD + 1;
    s.pityE = (r >= RANK.efsanevi) ? 0 : s.pityE + 1;

    // ---- Altın Folyo (§2.f) — tören katmanı: çekiliş matematiğinden tamamen bağımsız ----
    var G = ritualConst();
    s.goldenPity += 1;
    var golden = false;
    if (forceGoldenNext || rand() < G.GOLDEN_ORAN || s.goldenPity >= G.GOLDEN_HARD) {
      golden = true;
      s.goldenPity = 0;
      forceGoldenNext = false;
    }
    egg.golden = golden;

    // Folyo Ambalaj Defteri'ne işlenir (saf kozmetik; commit'i aşağıdaki save yapar)
    var seri = egg.seri || 'gunesbahcesi';
    var variant = egg.variant | 0;
    if (Yuvo.engine.registerFoil) Yuvo.engine.registerFoil(seri, variant, golden);

    Yuvo.engine.save();
    if (Yuvo.refresh) { try { Yuvo.refresh(); } catch (e) {} }

    var celebrationTier = (r >= RANK.efsanevi) ? 3 : (rarity === 'destansi') ? 2 : (rarity === 'nadir') ? 1 : 0;
    return {
      pufi:pufi, rarity:rarity, isNew:isNew, kabukGained:kabukGained, celebrationTier:celebrationTier,
      wrapper:{ seri:seri, variant:variant, golden:golden },  // tören görselleri buradan beslenir
      chocolate:1                                             // her ambalajlı yumurtadan 1 çikolata
    };
  };

  // Test kancaları (motor kısmı)
  Yuvo.test = Yuvo.test || {};
  Yuvo.test.openEggRaw = function () { return Yuvo.engine.openEgg(); };
  Yuvo.test.forceGoldenNext = function () { forceGoldenNext = true; };
})();
