// Yuvo prototip motor testi: pufis.js + state.js + gacha.js dosyalarını window shim'iyle
// eval eder, sözleşmedeki (prototype/ARCHITECTURE.md) assert'leri 5.000 yumurtalık
// simülasyonla koşar. Kullanım: node tools/proto-engine-test.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'prototype');
const FILES = ['js/data/pufis.js', 'js/engine/state.js', 'js/engine/gacha.js'];

let failures = 0;
function assert (cond, msg) {
  if (cond) { console.log('  ok  ' + msg); }
  else { failures += 1; console.error('  FAIL ' + msg); }
}

// ---------- sandbox ----------
function makeSandbox () {
  const store = new Map();
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
assert(PUFIS.length === 31, `31 Pufi kaydı (ölçülen ${PUFIS.length})`);
const dagilim = {};
for (const p of PUFIS) dagilim[p.rarity] = (dagilim[p.rarity] || 0) + 1;
assert(dagilim.yaygin === 12 && dagilim.azbulunur === 9 && dagilim.nadir === 6 &&
  dagilim.destansi === 2 && dagilim.efsanevi === 1 && dagilim.gizli === 1,
  `nadirlik dağılımı 12/9/6/2/1/1 (ölçülen ${JSON.stringify(dagilim)})`);
assert(new Set(PUFIS.map((p) => p.id)).size === 31, 'id\'ler benzersiz');
assert(PUFIS.every((p) => p.id && p.ad && p.tur && p.kind && p.bio && R[p.rarity]), 'her kayıtta id/ad/tur/kind/bio/rarity dolu');

console.log('# Test kancaları (motor kısmı)');
assert(typeof Yuvo.test.state === 'function', 'Yuvo.test.state var');
assert(typeof Yuvo.test.grantStardust === 'function', 'Yuvo.test.grantStardust var');
assert(typeof Yuvo.test.grantEggs === 'function', 'Yuvo.test.grantEggs var');
assert(typeof Yuvo.test.openEggRaw === 'function', 'Yuvo.test.openEggRaw var');

console.log('# API temel davranış');
Yuvo.engine.reset(12345);
assert(Yuvo.engine.state.stardust === 40 && Yuvo.engine.state.eggsAvailable === 3, 'varsayılan state (40⭐, 3 yumurta)');
Yuvo.engine.state.eggsAvailable = 0;
assert(Yuvo.engine.openEgg().error === 'no-egg', 'yumurta yokken {error:"no-egg"}');
Yuvo.test.grantStardust(300); // 340⭐
assert(Yuvo.engine.buyExtraEgg() === true && Yuvo.engine.buyExtraEgg() === true, 'ek yumurta 2 kez alınabildi');
assert(Yuvo.engine.buyExtraEgg() === false, '3. ek yumurta reddedildi (günde max 2)');
assert(Yuvo.engine.state.stardust === 340 - 240 && Yuvo.engine.state.eggsAvailable === 2, 'ek yumurta 120⭐ düştü, yumurta eklendi');

// ---------- Sim A: 5.000 yumurta — pity + gizli + onboarding ----------
console.log('# Sim A: 5.000 yumurta (pity / gizli / onboarding)');
Yuvo.engine.reset(0xC0FFEE);
Yuvo.test.grantEggs(5000);
let gapN = 0, gapD = 0, gapE = 0, maxGapN = 0, maxGapD = 0, maxGapE = 0;
let gizliErken = 0, onboardingIhlal = 0, ucuncuNadir = true;
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

// ---------- sonuç ----------
if (failures) {
  console.error(`\nSONUÇ: ${failures} assert BAŞARISIZ`);
  process.exit(1);
} else {
  console.log(`\nSONUÇ: tüm assert'ler geçti — medyan tamamlama ${medyan} yumurta`);
}
