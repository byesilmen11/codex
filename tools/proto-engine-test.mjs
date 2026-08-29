// Yuvo prototip motor testi: pufis.js + wrappers.js + state.js + gacha.js dosyalarını window
// shim'iyle eval eder, sözleşmedeki (prototype/ARCHITECTURE.md + docs/v2/06 §5.7) assert'leri
// 5.000 yumurtalık simülasyonla koşar. Kullanım: node tools/proto-engine-test.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'prototype');
const FILES = ['js/data/pufis.js', 'js/data/pufis-forest.js', 'js/data/wrappers.js', 'js/data/store.js', 'js/engine/state.js', 'js/engine/gacha.js'];

let failures = 0;
function assert (cond, msg) {
  if (cond) { console.log('  ok  ' + msg); }
  else { failures += 1; console.error('  FAIL ' + msg); }
}

// ---------- sandbox ----------
function makeSandbox (preload) {
  const store = new Map();
  if (preload) { for (const k in preload) store.set(k, String(preload[k])); }
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); }
  };
  const window = {};
  window.localStorage = localStorage;
  const document = { addEventListener () {}, dispatchEvent () {} };
  const navigator = {};
  const code = FILES.map((f) => `/* == ${f} == */\n` + readFileSync(join(root, f), 'utf8')).join('\n');
  new Function('window', 'document', 'localStorage', 'navigator', code)(window, document, localStorage, navigator);
  return window.Yuvo;
}

const Yuvo = makeSandbox();
const RANK = { yaygin: 0, azbulunur: 1, nadir: 2, destansi: 3, efsanevi: 4, gizli: 5 };

// ---------- statik kontroller ----------
console.log('# Veri kontrolleri');
const R = Yuvo.data.RARITIES;
const oranToplam = Object.values(R).reduce((a, r) => a + r.oran, 0);
assert(Math.abs(oranToplam - 1) < 1e-9, `oran toplamı 1 (ölçülen ${oranToplam})`);

const PUFIS = Yuvo.data.PUFIS;
assert(PUFIS.length === 62, `62 Pufi kaydı — Çayır 31 + Orman 31 (ölçülen ${PUFIS.length})`);
for (const biyom of ['cayir', 'orman']) {
  const alt = PUFIS.filter((p) => (p.biome || 'cayir') === biyom);
  const dagilim = {};
  for (const p of alt) dagilim[p.rarity] = (dagilim[p.rarity] || 0) + 1;
  assert(alt.length === 31 && dagilim.yaygin === 12 && dagilim.azbulunur === 9 && dagilim.nadir === 6 &&
    dagilim.destansi === 2 && dagilim.efsanevi === 1 && dagilim.gizli === 1,
    `${biyom}: 31 kayıt, dağılım 12/9/6/2/1/1 (ölçülen ${JSON.stringify(dagilim)})`);
}
assert(new Set(PUFIS.map((p) => p.id)).size === 62, 'id\'ler benzersiz (62)');
assert(new Set(PUFIS.map((p) => p.kind)).size === 62, 'kind\'ler benzersiz (62)');
assert(PUFIS.every((p) => p.id && p.ad && p.tur && p.kind && p.bio && R[p.rarity]), 'her kayıtta id/ad/tur/kind/bio/rarity dolu');

console.log('# Ambalaj / ritüel verisi (docs/v2/06 §5.2)');
const WS = Yuvo.data.WRAPPER_SERIES;
assert(WS && Object.keys(WS).length === 6, `6 ambalaj serisi (ölçülen ${WS ? Object.keys(WS).length : 0})`);
assert(!!WS && Object.values(WS).every((w) => w.ad && w.renk1 && w.renk2 && w.desen), 'her seride ad/renk1/renk2/desen dolu');
assert(Yuvo.data.WRAPPER_VARIANTS === 8, 'seri başına 8 varyant');
const RT = Yuvo.data.RITUAL;
assert(!!RT && RT.GOLDEN_ORAN === 0.02 && RT.GOLDEN_HARD === 40 && RT.KUMBARA_ESIK === 15 &&
  RT.KUMBARA_GUNLUK === 1 && RT.ISIRIK === 4 && RT.ISIRIK_YILDIZ === 2 &&
  RT.CIKOLATA_YILDIZ_TAVAN === 40 && RT.SERIT === 3 && RT.HIZLI_SERIT === 1,
  'RITUAL sabitleri §5.2 ile birebir');
assert(!!Yuvo.data.TOOLS && ['burgu', 'cekic', 'firlat', 'sihir', 'sedefburgu'].every((t) => Yuvo.data.TOOLS[t]),
  'araç tanımları tam (burgu/cekic/firlat/sihir/sedefburgu)');
console.log(`  bilgi: kumbara dengesi — ${RT.KUMBARA_ESIK} çikolata yenseydi ${RT.KUMBARA_ESIK * RT.ISIRIK * RT.ISIRIK_YILDIZ}⭐ ederdi ≈ ek yumurta 120⭐ (docs/08)`);

console.log('# Test kancaları (motor kısmı)');
assert(typeof Yuvo.test.state === 'function', 'Yuvo.test.state var');
assert(typeof Yuvo.test.grantStardust === 'function', 'Yuvo.test.grantStardust var');
assert(typeof Yuvo.test.grantEggs === 'function', 'Yuvo.test.grantEggs var');
assert(typeof Yuvo.test.openEggRaw === 'function', 'Yuvo.test.openEggRaw var');
assert(typeof Yuvo.test.grantChocolates === 'function', 'Yuvo.test.grantChocolates var');
assert(typeof Yuvo.test.forceGoldenNext === 'function', 'Yuvo.test.forceGoldenNext var');
assert(typeof Yuvo.test.setTool === 'function', 'Yuvo.test.setTool var');
assert(typeof Yuvo.test.foilBook === 'function', 'Yuvo.test.foilBook var');

console.log('# API temel davranış');
Yuvo.engine.reset(12345);
assert(Yuvo.engine.state.stardust === 40 && Yuvo.engine.state.eggsAvailable === 3, 'varsayılan state (40⭐, 3 yumurta)');
Yuvo.engine.state.eggsAvailable = 0;
assert(Yuvo.engine.openEgg().error === 'no-egg', 'yumurta yokken {error:"no-egg"}');
Yuvo.test.grantStardust(300); // 340⭐
assert(Yuvo.engine.buyExtraEgg() === true && Yuvo.engine.buyExtraEgg() === true, 'ek yumurta 2 kez alınabildi');
assert(Yuvo.engine.buyExtraEgg() === false, '3. ek yumurta reddedildi (günde max 2)');
assert(Yuvo.engine.state.stardust === 340 - 240 && Yuvo.engine.state.eggsAvailable === 2, 'ek yumurta 120⭐ düştü, yumurta eklendi');

// ---------- Sim A: 5.000 yumurta — pity + gizli + onboarding (+ ritüel katmanı ölçümleri) ----------
console.log('# Sim A: 5.000 yumurta (pity / gizli / onboarding / altın folyo / defter)');
Yuvo.engine.reset(0xC0FFEE);
Yuvo.test.grantEggs(5000);
let gapN = 0, gapD = 0, gapE = 0, maxGapN = 0, maxGapD = 0, maxGapE = 0;
let gizliErken = 0, onboardingIhlal = 0, ucuncuNadir = true;
let goldenSayisi = 0, sinceGolden = 0, maxGoldenGap = 0, wrapperBozuk = 0;
for (let i = 1; i <= 5000; i++) {
  const preOwned = Yuvo.engine.ownedCount();
  const res = Yuvo.test.openEggRaw();
  if (res.error) { assert(false, 'beklenmedik hata: ' + res.error); break; }
  const r = RANK[res.rarity];
  if (res.rarity === 'gizli' && preOwned < 30) gizliErken += 1;
  if (i <= 10 && !res.isNew) onboardingIhlal += 1;
  if (i === 3 && r < RANK.nadir) ucuncuNadir = false;
  if (r >= RANK.nadir) { maxGapN = Math.max(maxGapN, gapN); gapN = 0; } else gapN += 1;
  if (r >= RANK.destansi) { maxGapD = Math.max(maxGapD, gapD); gapD = 0; } else gapD += 1;
  if (r >= RANK.efsanevi) { maxGapE = Math.max(maxGapE, gapE); gapE = 0; } else gapE += 1;
  // ritüel katmanı (docs/v2/06 §5.7): wrapper kaydı tam mı, altın aralığı pity içinde mi
  if (!res.wrapper || !WS[res.wrapper.seri] ||
      !(res.wrapper.variant >= 0 && res.wrapper.variant < Yuvo.data.WRAPPER_VARIANTS) ||
      res.chocolate !== 1) wrapperBozuk += 1;
  sinceGolden += 1;
  if (res.wrapper && res.wrapper.golden === true) {
    goldenSayisi += 1;
    maxGoldenGap = Math.max(maxGoldenGap, sinceGolden);
    sinceGolden = 0;
  }
}
maxGapN = Math.max(maxGapN, gapN); maxGapD = Math.max(maxGapD, gapD); maxGapE = Math.max(maxGapE, gapE);
assert(maxGapN <= 14, `Nadir+ pity ihlali yok: en uzun boşluk ${maxGapN} ≤ 14 (aralık ≤ 15)`);
assert(maxGapD <= 39, `Destansı+ pity ihlali yok: en uzun boşluk ${maxGapD} ≤ 39 (aralık ≤ 40)`);
assert(maxGapE <= 49, `Efsanevi+ pity ihlali yok: en uzun boşluk ${maxGapE} ≤ 49 (aralık ≤ 50)`);
assert(gizliErken === 0, `gizli 30/30'dan önce düşmüyor (${gizliErken} erken düşüş)`);
assert(onboardingIhlal === 0, 'onboarding: ilk 10 yumurta hep yeni parça');
assert(ucuncuNadir, 'onboarding: 3. yumurta Nadir+');
assert(Yuvo.engine.ownedCount() === 30, '5.000 yumurta sonunda 30/30 (sanity)');
{
  const ms = Yuvo.engine.state.milestones;
  assert(['m10', 'm20', 'm27', 'm30'].every((k) => ms.includes(k)), 'kilometre taşları (m10/m20/m27/m30) bir kez işlendi');
}
// (2) altın folyo: 5.000 açılışta goldenPity ≤ 40 aralık ihlali yok
console.log(`  bilgi: altın folyo — ${goldenSayisi} adet / 5.000 açılış (%${(goldenSayisi / 50).toFixed(2)}); en uzun aralık ${maxGoldenGap}, kuyruk ${sinceGolden}`);
assert(maxGoldenGap <= 40 && sinceGolden < 40, `altın folyo pity: aralık ihlali yok (en uzun ${maxGoldenGap} ≤ 40, kuyruk ${sinceGolden} < 40)`);
assert(goldenSayisi >= 100, `altın oranı taban sanity: ≥ 100 altın (ölçülen ${goldenSayisi}; %2 + pity)`);
// (4) her openEgg foilBook'a tam bir kayıt işler
assert(wrapperBozuk === 0, `her açılış tam wrapper kaydı döndürüyor (seri/variant/chocolate; ${wrapperBozuk} bozuk)`);
{
  const fb = Yuvo.test.foilBook();
  let foilToplam = 0, foilAltin = 0;
  for (const sid in fb) {
    const rec = fb[sid];
    assert(WS[sid] !== undefined, `defter serisi geçerli: ${sid}`);
    foilAltin += rec.golden | 0; foilToplam += rec.golden | 0;
    for (const v in rec.variants) {
      if (!(+v >= 0 && +v < Yuvo.data.WRAPPER_VARIANTS)) assert(false, `geçersiz varyant anahtarı: ${sid}/${v}`);
      foilToplam += rec.variants[v] | 0;
    }
  }
  assert(foilToplam === 5000, `her openEgg foilBook'a tam bir kayıt işledi (${foilToplam}/5000)`);
  assert(foilAltin === goldenSayisi, `altın folyolar defterde Altın Şeref Yuvası'nda (${foilAltin} = ${goldenSayisi})`);
}

// ---------- Sim B: 30 parça tamamlama medyanı ----------
console.log('# Sim B: tamamlama dağılımı (201 koşu)');
const RUNS = 201, CAP = 2000;
const tamamlama = [];
for (let run = 0; run < RUNS; run++) {
  Yuvo.engine.reset(((run + 1) * 2654435761) >>> 0);
  Yuvo.test.grantEggs(CAP);
  let eggs = 0;
  while (Yuvo.engine.ownedCount() < 30 && eggs < CAP) {
    const res = Yuvo.test.openEggRaw();
    if (res.error) break;
    eggs += 1;
  }
  tamamlama.push(eggs);
}
tamamlama.sort((a, b) => a - b);
const medyan = tamamlama[(RUNS - 1) / 2];
const p90 = tamamlama[Math.floor(RUNS * 0.9)];
console.log(`  bilgi: 30 parça tamamlama — min ${tamamlama[0]} / medyan ${medyan} / P90 ${p90} / max ${tamamlama[RUNS - 1]} yumurta`);
assert(medyan <= 120, `30 parça medyan ≤ 120 yumurta (ölçülen ${medyan})`);
assert(tamamlama[RUNS - 1] < CAP, 'hiçbir koşu tavana takılmadı');

// ---------- Sim C: kesin-eksik garantisi (kademeler arası) ----------
// Kural: zorlaEksik (ilk 10 yumurta VEYA copyStreak>=6) aktifken kopya yalnızca,
// sonucun kademesine eşit/üstü hiçbir kademede (Gizli hariç — pity yok, bilinçli)
// eksik parça kalmamışsa kabul edilir.
console.log('# Sim C: zorlaEksik kademeler arası garanti (60 koşu × 400 yumurta)');
function enYuksekEksikRank (s) {
  let mx = -1;
  for (const p of PUFIS) {
    if (p.rarity === 'gizli') continue;
    if ((p.biome || 'cayir') !== 'cayir') continue; // havuz biyom-filtreli (gacha poolOf)
    if (!s.owned[p.id]) mx = Math.max(mx, RANK[p.rarity]);
  }
  return mx;
}
let ihlalC = 0, zorlamaSayisi = 0;
for (let run = 0; run < 60; run++) {
  Yuvo.engine.reset(((run + 7) * 0x9E3779B9) >>> 0);
  Yuvo.test.grantEggs(400);
  for (let i = 0; i < 400; i++) {
    const s = Yuvo.engine.state;
    const force = (s.eggCounter < 10) || (s.copyStreak >= 6);
    const mxEksik = force ? enYuksekEksikRank(s) : -1;
    const res = Yuvo.test.openEggRaw();
    if (res.error) break;
    if (!force) continue;
    zorlamaSayisi += 1;
    if (!res.isNew && res.rarity !== 'gizli' && mxEksik >= RANK[res.rarity]) ihlalC += 1;
  }
}
console.log(`  bilgi: zorlaEksik tetiklenen çekiliş sayısı: ${zorlamaSayisi}`);
assert(ihlalC === 0, `zorlaEksik: eşit/üstü kademede eksik parça varken kopya düşmüyor (${ihlalC} ihlal)`);

// ---------- Ritüel: kumbara + çikolata yıldız tavanı (docs/v2/06 §5.7 madde 3) ----------
console.log('# Ritüel: kumbara + çikolata ⭐ tavanı');
Yuvo.engine.reset(777);
{
  const s = Yuvo.engine.state;
  assert(s.todayEggs.length === 3 && s.eggsAvailable === 3 &&
    s.todayEggs.every((e) => WS[e.seri] && e.variant >= 0 && e.variant < 8 && e.golden === null),
    'vitrin: 3 ambalajlı yumurta, senkron sayaç, golden açılışa dek null');
  assert(Yuvo.engine.redeemChocolates() === false, 'çikolatasız şölen dönüşümü reddedildi');
  Yuvo.test.grantChocolates(15);
  const onceki = s.todayEggs.length;
  assert(Yuvo.engine.redeemChocolates() === true, '15 çikolata → şölen dönüşümü kabul');
  assert(s.chocolates === 0 && s.kumbaraToday === 1 &&
    s.todayEggs.length === onceki + 1 && s.eggsAvailable === s.todayEggs.length,
    'dönüşüm: -15 çikolata, +1 vitrin yumurtası, sayaç senkron');
  Yuvo.test.grantChocolates(30);
  assert(Yuvo.engine.redeemChocolates() === false, 'aynı gün 2. dönüşüm reddedildi (KUMBARA_GUNLUK=1)');
  Yuvo.engine.newDay();
  assert(Yuvo.engine.state.kumbaraToday === 0 && Yuvo.engine.state.chocolates === 30 &&
    Yuvo.engine.state.todayEggs.length === 7 && Yuvo.engine.state.eggsAvailable === 7 &&
    Yuvo.engine.state.firstRitualDoneToday === false,
    'newDay: haklar birikti (4 kalan + 3 yeni = 7), kumbara hakkı ve ritüel bayrağı sıfırlandı');
  assert(Yuvo.engine.redeemChocolates() === true && Yuvo.engine.state.chocolates === 15,
    'yeni gün → şölen hakkı tazelendi');
}
{
  Yuvo.engine.reset(778);
  const s = Yuvo.engine.state;
  const star0 = s.stardust;
  let kazanc = 0;
  for (let i = 0; i < 25; i++) kazanc += Yuvo.engine.eatChocolate();  // 25 × 2⭐ = 50 → tavan 40
  assert(s.chocolateStarsToday === 40 && s.stardust === star0 + 40 && kazanc === 40,
    'çikolata ⭐ tavanı korunur: 25 ısırık → +40⭐ (2⭐/ısırık, tavan 40)');
  assert(s.lastChocolateChoice === 'ye', 'lastChocolateChoice ısırıkla "ye" oldu');
  assert(Yuvo.engine.bankChocolate() === 1 && s.lastChocolateChoice === 'biriktir',
    'bankChocolate: kumbara +1, tercih "biriktir"');
  Yuvo.engine.newDay();
  assert(Yuvo.engine.state.chocolateStarsToday === 0, 'newDay → çikolata ⭐ sayacı sıfırlandı');
}

// ---------- Ritüel: vitrin boşken no-egg (docs/v2/06 §5.7 madde 5) ----------
console.log('# Ritüel: vitrin boşken no-egg');
{
  Yuvo.engine.reset(999);
  const s = Yuvo.engine.state;
  assert(Yuvo.engine.openEgg(9).error === 'no-egg' && s.todayEggs.length === 3 && s.eggCounter === 0,
    'geçersiz indeks: no-egg, vitrin ve sayaçlar dokunulmadı');
  let acilan = 0;
  for (let i = 0; i < 3; i++) { if (!Yuvo.test.openEggRaw().error) acilan += 1; }
  assert(acilan === 3 && s.todayEggs.length === 0 && s.eggsAvailable === 0,
    'vitrin tamamen açıldı, sayaç senkron 0');
  assert(Yuvo.engine.openEgg(0).error === 'no-egg', 'todayEggs boşken {error:"no-egg"}');
  s.eggsAvailable = 5;  // elle bozulan sayaç bile vitrini boşken açtıramaz
  assert(Yuvo.engine.openEgg(0).error === 'no-egg', 'sayaç elle bozulsa da vitrin boşsa no-egg');
}

// ---------- Ritüel: altın zorlaması + araç seçimi ----------
console.log('# Ritüel: forceGoldenNext + setTool');
{
  Yuvo.engine.reset(555);
  Yuvo.test.forceGoldenNext();
  const rg = Yuvo.test.openEggRaw();
  assert(!rg.error && rg.wrapper && rg.wrapper.golden === true && Yuvo.engine.state.goldenPity === 0,
    'forceGoldenNext → sıradaki açılış altın, goldenPity sıfırlandı');
  const fb = Yuvo.test.foilBook();
  assert((fb[rg.wrapper.seri] || {}).golden === 1, 'altın folyo deftere (Altın Şeref Yuvası) işlendi');
  assert(Yuvo.test.setTool('cekic') === true && Yuvo.engine.state.activeTool === 'cekic',
    'setTool: sahipli araç seçildi');
  assert(Yuvo.test.setTool('sedefburgu') === false && Yuvo.engine.state.activeTool === 'cekic',
    'setTool: sahipsiz araç reddedildi, seçim değişmedi');
}

// ---------- Ritüel: v1 → v3 localStorage migrasyonu ----------
console.log('# Ritüel: v1 → v3 migrasyonu');
{
  const v1 = JSON.stringify({
    version: 1, stardust: 77, kabuk: 5, day: 4,
    eggsAvailable: 2, extraEggsBought: 1,
    eggCounter: 12, pityN: 3, pityD: 9, pityE: 20, copyStreak: 2,
    owned: { cikcik: 2, pamus: 1 }, milestones: ['m10'],
    weekCrafts: 1, rewardedPlaysToday: 2, seed: 42
  });
  const Y2 = makeSandbox({ 'yuvo-proto-v1': v1 });
  const m = Y2.engine.load();
  assert(m.version === 3 && m.stardust === 77 && m.day === 4 && m.eggCounter === 12 && m.pityE === 20,
    'migrasyon: eski alanlar aynen korundu');
  assert(Array.isArray(m.todayEggs) && m.todayEggs.length === 2 && m.eggsAvailable === 2 &&
    m.todayEggs.every((e) => Y2.data.WRAPPER_SERIES[e.seri] && e.golden === null),
    'migrasyon: eggsAvailable=2 → vitrine 2 ambalajlı yumurta, senkron');
  assert(m.goldenPity === 0 && m.chocolates === 0 && m.chocolateStarsToday === 0 && m.kumbaraToday === 0 &&
    m.firstRitualDoneToday === false && m.lastChocolateChoice === 'ye' &&
    typeof m.foilBook === 'object' && Array.isArray(m.tools) &&
    ['burgu', 'cekic', 'firlat'].every((t) => m.tools.includes(t)) && m.activeTool === 'burgu',
    'migrasyon: v2 alanları varsayılanla dolduruldu');
  assert(m.parent && m.parent.pin === '1234' && m.parent.limitTL === 400 && m.parent.spentTL === 0 &&
    m.parent.clubActive === false && m.kiler.adet === 0 && m.kiler.bugunAcilan === 0 &&
    Array.isArray(m.wishes) && m.wishes.length === 0 &&
    Array.isArray(m.purchases) && m.purchases.length === 0,
    'migrasyon: v3 alanları (parent/kiler/wishes/purchases) varsayılanla dolduruldu');
}

// ---------- v3: v2 → v3 migrasyonu (bozuk ebeveyn verisi onarımı) ----------
console.log('# v3: v2 → v3 migrasyonu (bozuk veri onarımı)');
{
  const v2kayit = JSON.stringify({
    version: 2, stardust: 10, kabuk: 1, day: 2, eggsAvailable: 1,
    todayEggs: [{ seri: 'gunes', variant: 2, golden: null }],
    owned: { cikcik: 1 }, milestones: [],
    parent: { pin: '12', limitTL: -5, spentTL: -3, clubActive: 'evet' },
    kiler: { adet: -4, bugunAcilan: 2 },
    wishes: [{ pufiId: 'cikcik', ts: Date.now() }, { hatali: true }, 'çöp'],
    purchases: 'bozuk'
  });
  const Y3 = makeSandbox({ 'yuvo-proto-v1': v2kayit });
  const m = Y3.engine.load();
  assert(m.version === 3 && m.stardust === 10 && m.todayEggs.length === 1 && m.eggsAvailable === 1,
    'v2 kayıt v3\'e taşındı, vitrin/sayaç kayıpsız');
  assert(m.parent.pin === '1234' && m.parent.limitTL === 400 && m.parent.spentTL === 0 &&
    m.parent.clubActive === false,
    'bozuk parent alanları varsayılana onarıldı (PIN/limit/harcama/Club)');
  assert(m.kiler.adet === 0 && m.kiler.bugunAcilan === 2,
    'kiler: negatif adet 0\'a çekildi, geçerli sayaç korundu');
  assert(m.wishes.length === 1 && m.wishes[0].pufiId === 'cikcik' && Array.isArray(m.purchases) &&
    m.purchases.length === 0,
    'çöp dilek girdileri süzüldü, bozuk purchases boş diziye onarıldı');
}

// ---------- v3: mağaza verisi (store.js) ----------
console.log('# v3: mağaza verisi (docs/v2/05 §1-§2)');
{
  const P = Yuvo.data.PACKS;
  const merdiven = (P || []).filter((p) => !p.tekSeferlik);
  assert(Array.isArray(P) && merdiven.length === 6,
    `6 paket kademesi (ölçülen ${merdiven.length})`);
  let mono = true;
  for (let i = 1; i < merdiven.length; i++) {
    if (merdiven[i].tl / merdiven[i].adet > merdiven[i - 1].tl / merdiven[i - 1].adet + 1e-9) mono = false;
  }
  assert(mono, 'birim fiyat merdiveni tekdüze iniyor (₺9,99 → ₺2,00)');
  const hosg = (P || []).find((p) => p.id === 'hosgeldin');
  assert(!!hosg && hosg.tekSeferlik === true && hosg.adet === 5 &&
    Yuvo.engine.buyPack && typeof hosg.tl === 'number',
    'Hoş Geldin Sepeti: tekSeferlik bayraklı, merdiven dışında (geri sayımsız karşılama)');
  assert(P.every((p) => p.id && p.ad && p.adet > 0 && p.tl > 0 && p.garanti), 'her pakette id/ad/adet/tl/garanti dolu');
  const efs = (Yuvo.data.ODDS || []).find((o) => o.satilmaz);
  assert(!!efs && efs.garanti.indexOf('SATILMAZ') >= 0, 'ODDS: Efsanevi "vaat olarak SATILMAZ" satırı işaretli');
  assert(typeof Yuvo.data.DEMO_UYARI === 'string' && Yuvo.data.DEMO_UYARI.indexOf('DEMO') === 0,
    'DEMO uyarı metni var (gerçek ödeme alınmaz)');
  assert(Yuvo.data.tlYaz(9.99) === '₺9,99' && Yuvo.data.clubBonusAdet(10) === 1 && Yuvo.data.clubBonusAdet(25) === 3,
    'tlYaz/clubBonusAdet yardımcıları (bonus yukarı yuvarlanır: 10→1, 25→3)');
}

// ---------- v3: buyPack limiti + kiler yolu ----------
console.log('# v3: buyPack — aylık limit + satın alma vitrine DOKUNMAZ');
{
  Yuvo.engine.reset(4242);
  const s = Yuvo.engine.state;
  assert(s.parent && s.parent.pin === '1234' && s.parent.limitTL === 400 && s.parent.spentTL === 0 &&
    s.kiler.adet === 0 && Array.isArray(s.wishes) && Array.isArray(s.purchases),
    'v3 varsayılan state (PIN 1234, limit ₺400, boş kiler/dilek/kayıt)');
  const rx = Yuvo.engine.buyPack('yok-boyle-paket');
  assert(rx.ok === false && rx.reason === 'bilinmiyor', 'bilinmeyen paket reddedildi');
  const eggs0 = s.todayEggs.length;
  const r1 = Yuvo.engine.buyPack('tekli');
  assert(r1.ok === true && r1.adet === 1 && r1.tutar === 9.99, 'tekli paket alındı (₺9,99 → 1 yumurta)');
  assert(s.kiler.adet === 1 && s.todayEggs.length === eggs0 && s.eggsAvailable === eggs0,
    'satın alma YALNIZ Kiler\'e düştü — vitrin/eggsAvailable dokunulmadı');
  assert(s.parent.spentTL === 9.99 && s.purchases.length === 1, 'harcama ve makbuz kaydedildi');
  const r2 = Yuvo.engine.buyPack('kumbara');
  assert(r2.ok === true && s.parent.spentTL === 209.98, 'ikinci paket: toplam ₺209,98');
  const r3 = Yuvo.engine.buyPack('kumbara');
  assert(r3.ok === false && r3.reason === 'limit' && s.parent.spentTL === 209.98 && s.kiler.adet === 101,
    'aylık limit ₺400 aşımı ENGELLENDİ; harcama/kiler değişmedi');
  assert(Yuvo.engine.toggleClub() === true, 'Club açıldı');
  const r4 = Yuvo.engine.buyPack('haftalik');
  assert(r4.ok === true && r4.adet === 11, `Club bonusu yukarı yuvarlanır (10 → ${r4.adet})`);
  s.parent.ay = '2000-01';
  const rep = Yuvo.engine.spendReport();
  assert(rep.spentTL === 0 && rep.ay !== '2000-01' && rep.paketAdet === 3 && rep.kiler === 112,
    'ay devri: harcama sayacı sıfırlandı, makbuz geçmişi ve kiler korundu');
  assert(Yuvo.engine.buyPack('kumbara').ok === true && s.parent.spentTL === 199.99,
    'yeni ayda limit tazelendi');
}

// ---------- v3: kiler günlük tavanı (binge freni) ----------
console.log('# v3: drawFromKiler — günlük tavan 5 (+1 Club)');
{
  Yuvo.engine.reset(4343);
  let s = Yuvo.engine.state;
  assert(Yuvo.engine.drawFromKiler() === false, 'boş kilerden çekim reddedildi');
  s.kiler.adet = 20;
  const eggs0 = s.todayEggs.length;
  let cekim = 0;
  for (let i = 0; i < 7; i++) { if (Yuvo.engine.drawFromKiler()) cekim += 1; }
  assert(cekim === 5 && s.kiler.bugunAcilan === 5 && s.kiler.adet === 15,
    `günlük tavan 5: 7 denemede ${cekim} çekim`);
  assert(s.todayEggs.length === eggs0 + 5 && s.eggsAvailable === s.todayEggs.length &&
    s.todayEggs.every((e) => WS[e.seri] && e.golden === null),
    'çekilen yumurtalar AMBALAJLI vitrine düştü, sayaç senkron');
  assert(Yuvo.engine.toggleClub() === true && Yuvo.engine.drawFromKiler() === true &&
    Yuvo.engine.drawFromKiler() === false,
    'Club: tavan +1 (6. çekim kabul, 7. ret)');
  Yuvo.engine.newDay();
  s = Yuvo.engine.state;
  assert(s.kiler.bugunAcilan === 0 && s.kiler.adet === 14, 'newDay → kiler hakkı tazelendi, stok korundu');
  assert(s.todayEggs.length === 9 && s.eggsAvailable === 9,
    'newDay + Club: dünden kalan 9 KORUNDU, tavan 9 aşılmadı (yeni/Club eklenmedi)');
  assert(Yuvo.engine.drawFromKiler() === true, 'yeni gün → kilerden çekim yeniden açık');
}

// ---------- P3: oturum döngüsü — hak birikimi, kuluçka, görev zinciri, cezasız streak ----------
console.log('# P3: haklar birikir (tavan 9) + kuluçka + görev zinciri + Bekçi Takvimi');
{
  Yuvo.engine.reset(5151);
  let s = Yuvo.engine.state;
  Yuvo.engine.newDay();
  assert(s.todayEggs.length === 6 && s.eggsAvailable === 6, 'birikim: 3 kalan + 3 yeni = 6');
  Yuvo.engine.newDay();
  assert(s.todayEggs.length === 9, 'birikim: 6 + 3 = 9');
  Yuvo.engine.newDay();
  assert(s.todayEggs.length === 9, 'tavan 9: daha fazla birikmez');
  assert(s.streak.yildiz === 0 && s.streak.rozet === 0,
    'oynanmayan günler yıldız üretmez ama zinciri de KIRMAZ (cezasız)');
  // Kuluçka döngüsü: akşam bırakılır → sabah İLK sırada "hazır", tavana sayılmaz
  assert(Yuvo.engine.kuluckaBirak('yildiztozu') === true, 'kuluçka bırakıldı');
  assert(Yuvo.engine.kuluckaBirak() === false, 'ikinci kuluçka reddedildi (tek sürpriz)');
  Yuvo.engine.newDay();
  assert(s.todayEggs[0] && s.todayEggs[0].kulucka === true && s.todayEggs[0].seri === 'yildiztozu',
    'kuluçka yumurtası sabah İLK sırada, bırakılan seriyle hazır');
  assert(s.kulucka === null, 'kuluçka alanı temizlendi (tek seferlik)');
  assert(s.todayEggs.length === 10 && s.eggsAvailable === 10,
    'kuluçka tavana SAYILMAZ — bekletilen sürpriz asla yanmaz (9 + 1 hazır)');
  assert(Yuvo.engine.yarinSeri() === Yuvo.engine.yarinSeri() && typeof Yuvo.engine.yarinSeri() === 'string',
    'yarinSeri deterministik bir seri anahtarı döndürür');
}
{
  // Görev zinciri: 3 aç + 1 oyun + albüm → BİR KEZ +1 bonus yumurta
  Yuvo.engine.reset(5252);
  const s = Yuvo.engine.state;
  assert(Yuvo.engine.gorevIlerle('oyun') === false, 'oyun tek başına bonus vermez');
  assert(Yuvo.engine.gorevIlerle('album') === false, 'albüm tek başına bonus vermez');
  assert(Yuvo.engine.gorevIlerle('bilinmeyen') === false, 'bilinmeyen görev tipi reddedilir');
  const r1 = Yuvo.engine.openEgg();
  const r2 = Yuvo.engine.openEgg();
  assert(!r1.error && r1.gorevBonus === false && !r2.error && r2.gorevBonus === false,
    'ilk 2 açılış: zincir henüz tamam değil, bonus yok');
  const r3 = Yuvo.engine.openEgg();
  assert(!r3.error && r3.gorevBonus === true, '3. açılış zinciri tamamladı → bonus yumurta!');
  assert(s.gorevler.bonusVerildi === true && s.gorevBonusYeni === true,
    'bonus bayrakları kuruldu (yuva bir kez kutlayacak)');
  assert(s.todayEggs.length === 1 && s.eggsAvailable === 1,
    'bonus yumurta vitrine düştü (3 açıldı → 0, +1 bonus)');
  const r4 = Yuvo.engine.openEgg();
  assert(!r4.error && r4.gorevBonus === false, 'bonus BİR KEZ — 4. açılışta tekrarlanmaz');
  assert(Array.isArray(s.bugunAcilanlar) && s.bugunAcilanlar.length === 4 &&
    s.bugunAcilanlar.every((id) => typeof id === 'string'),
    'bugunAcilanlar: 4 açılış kapanış özeti için kaydedildi');
  // Bekçi Takvimi: oynanan gün → 1 yıldız; kaçan günler düşürmez; 7'de +25 Kabuk + rozet
  Yuvo.engine.newDay();
  assert(s.streak.yildiz === 1, 'oynanan günün sabahında 1 yıldız');
  assert(s.gorevler.ac === 0 && s.gorevler.oyun === 0 && s.gorevler.albumZiyaret === false &&
    s.gorevler.bonusVerildi === false && s.bugunAcilanlar.length === 0 && s.gorevBonusYeni === false,
    'newDay → görev zinciri ve kapanış özeti sıfırlandı');
  for (let d = 0; d < 6; d++) Yuvo.engine.newDay();       // hiç oynanmadı
  assert(s.streak.yildiz === 1, 'kaçan 6 gün yıldızı DÜŞÜRMEDİ (Duolingo-freeze değil, yapısal cezasızlık)');
  const kab0 = s.kabuk;
  for (let d = 0; d < 6; d++) { s.gorevler.ac = 1; Yuvo.engine.newDay(); }  // 6 oynanan gün
  assert(s.streak.yildiz === 0 && s.streak.rozet === 1 && s.kabuk === kab0 + 25,
    '7. yıldızda +25 Kabuk + rozet, şerit sıfırdan devam');
}

// ---------- v3: Dilek Kavanozu ----------
console.log('# v3: addWish — 7 gün / 5 dilek / kopyasız');
{
  Yuvo.engine.reset(4444);
  const s = Yuvo.engine.state;
  const ids = PUFIS.slice(0, 6).map((p) => p.id);
  assert(Yuvo.engine.addWish(ids[0]) === true, 'ilk dilek eklendi');
  assert(Yuvo.engine.addWish(ids[0]) === false, 'aynı dilek ikinci kez reddedildi');
  for (let i = 1; i < 5; i++) Yuvo.engine.addWish(ids[i]);
  assert(s.wishes.length === 5 && Yuvo.engine.addWish(ids[5]) === false, '5 dilek tavanı korunur');
  assert(Yuvo.engine.clearWish(ids[0]) === true && s.wishes.length === 4, 'dilek kaldırıldı');
  assert(Yuvo.engine.clearWish(ids[0]) === false, 'olmayan dilek kaldırılamaz (false)');
  s.wishes[0].ts -= 8 * 24 * 3600 * 1000;
  assert(Yuvo.engine.addWish(ids[5]) === true && s.wishes.length === 4 &&
    s.wishes.every((w) => w.pufiId !== ids[1]),
    '7 günden eski dilek kendiliğinden düştü, yenisi eklendi');
}

// ---------- v3: setLimit soğuması + setPin ----------
console.log('# v3: setLimit / setPin');
{
  Yuvo.engine.reset(4545);
  const s = Yuvo.engine.state;
  const art = Yuvo.engine.setLimit(750);
  assert(art.ok === true && art.soguma === true && art.sogumaSaat === 24 && s.parent.limitTL === 750,
    'limit ARTIRIMI: 24 saat soğuma bilgisiyle kabul');
  const ind = Yuvo.engine.setLimit(100);
  assert(ind.ok === true && ind.soguma === false && s.parent.limitTL === 100,
    'limit İNDİRİMİ: soğumasız, anında');
  assert(Yuvo.engine.setPin('12ab') === false && Yuvo.engine.setPin('123') === false &&
    s.parent.pin === '1234', 'geçersiz PIN reddedildi (4 hane şartı)');
  assert(Yuvo.engine.setPin('9876') === true && s.parent.pin === '9876', 'geçerli PIN değişti');
}

// ---------- Biyom: Fısıltı Ormanı kilidi + havuz filtresi + Şako ----------
console.log('# Biyom: orman kilidi / havuz filtresi / gizli / Şako');
{
  Yuvo.engine.reset(6161);
  const s = Yuvo.engine.state;
  assert(s.activeBiome === 'cayir' && s.ormanAcik === false && s.sakoHidden === null,
    'varsayılan: çayır aktif, orman kilitli, Şako boş');
  assert(Yuvo.engine.setBiome('orman') === false && s.activeBiome === 'cayir',
    'kilitliyken ormana geçilemez');
  // Çayırdan 10 parça → kilit açılır (checkOrmanUnlock bir kez true döner)
  const cayirlar = PUFIS.filter((p) => (p.biome || 'cayir') === 'cayir' && p.rarity !== 'gizli');
  for (let i = 0; i < 10; i++) s.owned[cayirlar[i].id] = 1;
  assert(Yuvo.engine.checkOrmanUnlock() === true && s.ormanAcik === true,
    'Çayır 10/30 → Fısıltı Ormanı açıldı');
  assert(Yuvo.engine.checkOrmanUnlock() === false, 'kilit açılışı bir kez bildirilir');
  assert(Yuvo.engine.setBiome('orman') === true && s.activeBiome === 'orman', 'ormana geçildi');

  // Havuz filtresi: orman aktifken TÜM düşüşler orman ailesinden
  Yuvo.test.grantEggs(600);
  let yanlisBiyom = 0, ormanGizliErken = 0;
  for (let i = 0; i < 600; i++) {
    const pre = Yuvo.engine.ownedCount('orman');
    const res = Yuvo.test.openEggRaw();
    if (res.error) { assert(false, 'orman açılışında hata: ' + res.error); break; }
    if ((res.pufi.biome || 'cayir') !== 'orman') yanlisBiyom += 1;
    if (res.rarity === 'gizli' && pre < 30) ormanGizliErken += 1;
  }
  assert(yanlisBiyom === 0, `orman havuzu sızdırmaz: 600 açılışta ${yanlisBiyom} yabancı düşüş`);
  assert(ormanGizliErken === 0, 'orman gizlisi (Kütük) 30/30\'dan önce düşmez');
  assert(Yuvo.engine.ownedCount('orman') === 30, `orman 600 yumurtada tamamlandı (${Yuvo.engine.ownedCount('orman')}/30)`);
  // Kilometre taşları Çayır rozetidir: orman parçaları m20/m27/m30 tetiklemez
  assert(s.milestones.indexOf('m20') === -1,
    'kilometre taşları çayıra bağlı — orman 30/30 iken bile m20 yok (çayır 10)');

  // Şako: newDay orman parçalarından birini saklar; Saklambaç kazanınca geri döner
  Yuvo.engine.newDay();
  assert(typeof s.sakoHidden === 'string' && s.sakoHidden.length > 0 &&
    (Yuvo.data.pufiById(s.sakoHidden) || {}).biome === 'orman',
    `Şako bir orman parçası sakladı (${s.sakoHidden})`);
  const saklanan = s.sakoHidden;
  assert(s.owned[saklanan] > 0, 'saklanan parça YOK OLMAZ — sahiplik durur (iz bırakır)');
  assert(Yuvo.engine.sakoRecover() === true && s.sakoHidden === null, 'Saklambaç kazanımı: parça geri döndü');
  assert(Yuvo.engine.sakoRecover() === false, 'saklı parça yokken sakoRecover false');

  // Çayıra dönüş + çayır havuzu hâlâ temiz
  assert(Yuvo.engine.setBiome('cayir') === true && s.activeBiome === 'cayir', 'çayıra dönüldü');
  Yuvo.test.grantEggs(50);
  let ormanKacak = 0;
  for (let i = 0; i < 50; i++) {
    const r2 = Yuvo.test.openEggRaw();
    if (!r2.error && (r2.pufi.biome || 'cayir') !== 'cayir') ormanKacak += 1;
  }
  assert(ormanKacak === 0, 'çayır havuzu da sızdırmaz (50 açılış)');
}

// ---------- sonuç ----------
if (failures) {
  console.error(`\nSONUÇ: ${failures} assert BAŞARISIZ`);
  process.exit(1);
} else {
  console.log(`\nSONUÇ: tüm assert'ler geçti — medyan tamamlama ${medyan} yumurta`);
}
