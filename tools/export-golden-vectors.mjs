// Yuvo — altın vektör ihracı: gacha çekirdeğinin deterministik referans dizileri.
// C# portu (Yuvo.Core.GachaEngine) aynı tohum + aynı kurulumla AYNI dizileri üretmek
// ZORUNDADIR (docs/v2/07 §3). Bu dosyalar NUnit'te "GachaEngineGoldenTests" fikstürüdür;
// port hatası (oran kayması, pity kaçağı, rand tüketim sırası) bit düzeyinde yakalanır.
//
// Kullanım:
//   node tools/export-golden-vectors.mjs           → /content/golden/*.json yazar
//   node tools/export-golden-vectors.mjs --check   → yazmaz, mevcutla karşılaştırır; fark → exit 1
//
// Determinizm garantisi: her senaryo İKİ taze sandbox'ta koşulur ve çıktılar bire bir
// karşılaştırılır; Math.random hiçbir yerde kullanılmaz (vitrin yumurtası sabit verilir).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const proto = join(repo, 'prototype');
const outDir = join(repo, 'content', 'golden');
const CHECK = process.argv.includes('--check');

const FILES = [
  'js/data/pufis.js', 'js/data/pufis-forest.js', 'js/data/wrappers.js',
  'js/data/store.js', 'js/engine/state.js', 'js/engine/gacha.js'
];

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
  const code = FILES.map((f) => `/* == ${f} == */\n` + readFileSync(join(proto, f), 'utf8')).join('\n');
  new Function('window', 'document', 'localStorage', 'navigator', code)(window, document, localStorage, {});
  return window.Yuvo;
}

// Çayır'ın gizli-olmayan ilk N parçası (PUFIS dizi sırası — kurulumlar bununla anlatılır)
function cayirIlkN (Yuvo, n) {
  return (Yuvo.data.PUFIS || [])
    .filter((p) => (p.biome || 'cayir') === 'cayir' && p.rarity !== 'gizli')
    .slice(0, n)
    .map((p) => p.id);
}

/* ---------- senaryolar ----------
   kurulum(Yuvo) → reset(seed) SONRASI state'e uygulanacak alanlar; uygulanan değerler
   JSON'a aynen yazılır ki C# testi kurulumu dosyadan okuyup birebir kurabilsin. */
const SENARYOLAR = [
  {
    ad: 'temiz-baslangic',
    seed: 1001, adet: 1000,
    aciklama: 'Sıfır sahiplik, çayır biyomu. Onboarding (ilk 10 eksik, 3. Nadir+), pity tavanları, altın folyo pity\'si ve orman kilidinin (çayır 10/30) açılışı bu dizide.',
    kurulum: () => ({})
  },
  {
    ad: 'temiz-baslangic-b',
    seed: 907, adet: 1000,
    aciklama: 'temiz-baslangic ile aynı kurulum, farklı tohum — tek tohuma aşırı uyum (overfit) koruması.',
    kurulum: () => ({})
  },
  {
    ad: 'orman-biyomu',
    seed: 2002, adet: 1000,
    aciklama: 'Orman kilidi açık, aktif biyom orman, onboarding geçilmiş. Havuz sızdırmazlığı (yalnız orman düşer) ve biyomlar arası ORTAK pity sayaçları bu dizide.',
    kurulum: (Yuvo) => ({
      owned: Object.fromEntries(cayirIlkN(Yuvo, 10).map((id) => [id, 1])),
      eggCounter: 20,
      ormanAcik: true,
      activeBiome: 'orman'
    })
  },
  {
    ad: 'son-3-cayir',
    seed: 3003, adet: 500,
    aciklama: 'Çayır 27/30 (gizli hariç ilk 27 sahipli), onboarding geçilmiş. Son-3 eksik ağırlığı (W_EKSIK_SON3) ve 30/30 olunca gizli kapısının dizinin ORTASINDA açılması bu dizide.',
    kurulum: (Yuvo) => ({
      owned: Object.fromEntries(cayirIlkN(Yuvo, 27).map((id) => [id, 1])),
      eggCounter: 40
    })
  },
  {
    ad: 'kopya-zorlamasi',
    seed: 4004, adet: 300,
    aciklama: 'Çayır 30/30 tam (yalnız gizli eksik), onboarding geçilmiş. Kopya serisi sayacı, zorlaEksik\'in gizli\'yi ASLA pity\'ye çevirmemesi (aday listesi boş dalı) ve gizli düşüşleri bu dizide.',
    kurulum: (Yuvo) => ({
      owned: Object.fromEntries(cayirIlkN(Yuvo, 30).map((id) => [id, 1])),
      eggCounter: 60
    })
  }
];

// ---------- koşum ----------
function kosSenaryo (sen) {
  const Yuvo = makeSandbox();                 // taze sandbox: senaryolar birbirine sızmaz
  Yuvo.engine.reset(sen.seed);
  const s = Yuvo.engine.state;
  const kur = sen.kurulum(Yuvo);
  if (kur.owned) s.owned = Object.assign({}, kur.owned);
  for (const k of ['eggCounter', 'ormanAcik', 'activeBiome']) {
    if (kur[k] !== undefined) s[k] = kur[k];
  }
  const vektorler = [];
  for (let i = 0; i < sen.adet; i++) {
    // Vitrin yumurtası SABİT verilir (Math.random'sız): ambalaj düşüşü etkilemez (§1.3),
    // golden alanını openEgg mulberry32'den kendisi çeker.
    s.todayEggs = [{ seri: 'gunesbahcesi', variant: 0, golden: null }];
    s.eggsAvailable = 1;
    const r = Yuvo.engine.openEgg();
    if (r.error) throw new Error(`${sen.ad}: ${i + 1}. açılışta hata: ${r.error}`);
    vektorler.push([
      r.rarity, r.pufi.id, r.isNew ? 1 : 0, r.wrapper.golden ? 1 : 0,
      s.pityN, s.pityD, s.pityE, s.copyStreak
    ]);
  }
  return { kur, vektorler };
}

function dosyaMetni (sen, kur, vektorler) {
  // Vektör başına tek satır: dosya diff'lenebilir kalır, boyut şişmez
  const satirlar = vektorler.map((v) => '    ' + JSON.stringify(v)).join(',\n');
  const bas = {
    _meta: {
      uretici: 'tools/export-golden-vectors.mjs',
      not: 'ELLE DÜZENLEMEYİN — C# GachaEngine portu bu diziyi bit düzeyinde yeniden üretmek zorundadır (docs/v2/07 §3).',
      alanlar: ['rarity', 'pufiId', 'isNew', 'golden', 'pityN', 'pityD', 'pityE', 'copyStreak'],
      alanNotu: 'pity/copyStreak değerleri AÇILIŞTAN SONRAKİ sayaç durumudur; sıra numarası = dizideki konum + 1 (eggCounter kurulum değerinin üstüne eklenir).'
    },
    ad: sen.ad,
    aciklama: sen.aciklama,
    seed: sen.seed,
    adet: sen.adet,
    kurulum: kur
  };
  const basText = JSON.stringify(bas, null, 2);
  return basText.slice(0, -2) + ',\n  "vektorler": [\n' + satirlar + '\n  ]\n}\n';
}

let drift = 0;
if (!CHECK) mkdirSync(outDir, { recursive: true });
for (const sen of SENARYOLAR) {
  const a = kosSenaryo(sen);
  const b = kosSenaryo(sen);                  // determinizm kanıtı: iki taze koşum birebir
  const ta = dosyaMetni(sen, a.kur, a.vektorler);
  const tb = dosyaMetni(sen, b.kur, b.vektorler);
  if (ta !== tb) { console.error(`HATA: ${sen.ad} deterministik değil!`); process.exit(1); }

  // hızlı akıl sağlığı: pity tavanları vektörlerde de ihlalsiz olmalı
  for (const v of a.vektorler) {
    if (v[4] > 15 || v[5] > 40 || v[6] > 50) {
      console.error(`HATA: ${sen.ad} pity tavanı ihlali: ${JSON.stringify(v)}`);
      process.exit(1);
    }
  }

  const path = join(outDir, sen.ad + '.json');
  if (CHECK) {
    const mevcut = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (mevcut === ta) console.log(`  ok    content/golden/${sen.ad}.json (${sen.adet} vektör)`);
    else { drift += 1; console.error(`  ESKİ  content/golden/${sen.ad}.json — yeniden üretin: node tools/export-golden-vectors.mjs`); }
  } else {
    writeFileSync(path, ta);
    console.log(`  yazıldı content/golden/${sen.ad}.json (${sen.adet} vektör, ${ta.length} B)`);
  }
}

if (CHECK) {
  if (drift) { console.error(`SONUÇ: ${drift} altın vektör dosyası güncel değil.`); process.exit(1); }
  console.log('SONUÇ: altın vektörler güncel.');
} else {
  console.log('SONUÇ: altın vektörler üretildi — her senaryo çift koşumla determinizm-doğrulandı, pity tavanları ihlalsiz.');
}
