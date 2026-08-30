// Yuvo — altın migrasyon fikstürü ihracı: state.js load() (satır ~168-280) GERÇEK
// çıktılarının deterministik dökümü. C# portu (SaveCodec.Load) her fikstürün `girdi`sini
// aynı stub'larla (tohum 42, sabit ay "2026-01") migre edip `beklenen` ile bire bir
// eşleşmek ZORUNDADIR (PORT-CONTRACT.md EK "Altın migrasyon fikstürleri").
//
// Kullanım:
//   node tools/export-migration-fixtures.mjs           → content/golden/migration/*.json yazar
//   node tools/export-migration-fixtures.mjs --check   → yazmaz, mevcutla karşılaştırır; fark → exit 1
//
// Determinizm garantisi: her vaka İKİ taze sandbox'ta koşulur, çıktılar bire bir
// karşılaştırılır (fark → exit 1). İki stub bunun temelidir:
//   (a) Math.random → gacha.js rand() formülü (mulberry32, satır 31-38) YEREL tohum 42,
//       her vaka için taze — state.js'in tohumsuz yolları (freshSeed satır 26, makeEgg
//       variant satır 67) böylece deterministikleşir.
//   (b) Date → sabit 2026-01-15: Date.now() = 1768435200000; getFullYear/getMonth,
//       monthKey() (state.js satır 157-162) "2026-01" üretecek şekilde sabittir.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const proto = join(repo, 'prototype');
const outDir = join(repo, 'content', 'golden', 'migration');
const CHECK = process.argv.includes('--check');

const STORAGE_KEY = 'yuvo-proto-v1';          // state.js satır 6
const RNG_TOHUM = 42;
const SABIT_MS = 1768435200000;               // 2026-01-15T00:00:00Z
const SABIT_AY = '2026-01';

const FILES = [
  'js/data/pufis.js', 'js/data/pufis-forest.js', 'js/data/wrappers.js',
  'js/data/store.js', 'js/engine/state.js', 'js/engine/gacha.js'
];

// ---------- stub'lar ----------

// gacha.js rand() (satır 31-38) formülü, state yerine YEREL tohumla — Math.random stub'ı.
function makeSeededRandom (tohum) {
  let s = tohum >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- sandbox (proto-engine-test.mjs deseni + stub enjeksiyonu) ----------
// girdi === null → localStorage boş vakası; aksi hâlde 'yuvo-proto-v1' anahtarına konur.
function makeSandbox (girdi) {
  const store = new Map();
  if (girdi !== null && girdi !== undefined) store.set(STORAGE_KEY, String(girdi));
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); }
  };
  const window = {};
  window.localStorage = localStorage;
  const document = { addEventListener () {}, dispatchEvent () {} };

  // (a) Math stub'ı: prototip Math'i (imul/floor/max...) miras alır, yalnız random tohumlu.
  const MathStub = Object.create(Math);
  MathStub.random = makeSeededRandom(RNG_TOHUM);   // HER sandbox (yani her vaka) TAZE tohum

  // (b) Date stub'ı: sabit 2026-01-15 — monthKey() "2026-01" (getMonth 0-tabanlı → Ocak).
  function DateStub () {}
  DateStub.prototype.getFullYear = function () { return 2026; };
  DateStub.prototype.getMonth = function () { return 0; };
  DateStub.now = function () { return SABIT_MS; };

  const code = FILES.map((f) => `/* == ${f} == */\n` + readFileSync(join(proto, f), 'utf8')).join('\n');
  // 'Math' ve 'Date' parametre olarak gölgelenir: eval edilen motor kodu stub'ları görür.
  new Function('window', 'document', 'localStorage', 'navigator', 'Math', 'Date', code)(
    window, document, localStorage, {}, MathStub, DateStub);
  return window.Yuvo;
}

// ---------- vaka girdileri için statik veri (id'ler koddan, elle uydurma değil) ----------
const veri = makeSandbox(null);
const SERILER = Object.keys(veri.data.WRAPPER_SERIES);   // 6 seri, belge sırası
const CAYIR = veri.data.PUFIS
  .filter((p) => (p.biome || 'cayir') === 'cayir' && p.rarity !== 'gizli')
  .map((p) => p.id);
const ORMAN = veri.data.PUFIS
  .filter((p) => p.biome === 'orman' && p.rarity !== 'gizli')
  .map((p) => p.id);

/* ---------- vakalar ----------
   Kural (sözleşme): kayıt içeren HER vakada `seed` AÇIKÇA verilir — load() truthy seed'i
   aynen taşır, böylece beklenen state'in seed'i freshSeed'e (yaklaşık eşleme) bağlanmaz.
   bos-depo/cop-json'da kayıt yoktur; oradaki seed stub'lı freshSeed'den gelir ve
   deterministiktir (Date.now ^ tohumlu random — her iki taraf da ToInt32 aritmetiği).
   NOT (kendi kararımız): ts/limitRaiseTs alanları int32 aralığında seçildi — JS `x | 0`
   gerçek ms damgalarını sarmalayıp 0'a düşürür; fikstürü okunur tutmak için küçük değer. */
const VAKALAR = [
  {
    ad: 'bos-depo',
    aciklama: 'localStorage boş: load() tertemiz varsayılanlarla açılır (defaults + v1 yolu fillTodayEggs tekrarı). seed stub\'lı freshSeed\'den (deterministik).',
    girdi: null
  },
  {
    ad: 'cop-json',
    aciklama: 'Bozuk JSON ("{{bozuk"): JSON.parse fırlatır, catch temiz başlangıca düşer (state.js satır 189). Sonuç bos-depo ile aynı yol.',
    girdi: '{{bozuk'
  },
  {
    ad: 'v1-kayit',
    aciklama: 'v1 kaydı: todayEggs YOK → savedHadEggs=false → fillTodayEggs(max(0, eggsAvailable|0)) 2 yumurta üretir (2 tohumlu random). Ritüel/v3 alanları varsayılanla açılır.',
    girdi: {
      version: 1,
      stardust: 155, kabuk: 12, day: 4,
      eggsAvailable: 2, extraEggsBought: 1,
      eggCounter: 25, pityN: 3, pityD: 12, pityE: 20, copyStreak: 2,
      owned: Object.fromEntries(CAYIR.slice(0, 12).map((id) => [id, 1])),
      milestones: ['m10'],
      weekCrafts: 1, rewardedPlaysToday: 2,
      seed: 777001
    }
  },
  {
    ad: 'v2-kayit',
    aciklama: 'v2 kaydı, bozuk vitrin: geçersiz seri → daySeries(day), variant 99→7 / -3→0 clamp, golden "evet"→null, kulucka "belki" silinir, obje olmayan öğeler düşer; tools eksikleri FREE_TOOLS ile tamamlanır, activeTool listede yoksa tools[0], lastChocolateChoice "YE"→"ye", negatif sayaçlar 0.',
    girdi: {
      version: 2,
      stardust: 90, kabuk: 30, day: 2,
      eggsAvailable: 5,
      eggCounter: 60, pityN: 7, pityD: 22, pityE: 41, copyStreak: 4,
      owned: Object.fromEntries(CAYIR.slice(0, 8).map((id) => [id, 2])),
      milestones: [],
      todayEggs: [
        { seri: 'yok-boyle-seri', variant: 99, golden: 'evet' },
        { seri: SERILER[1], variant: -3, golden: true, kulucka: 'belki' },
        'cop',
        null,
        { seri: SERILER[0], variant: 2, golden: false, kulucka: true }
      ],
      firstRitualDoneToday: 'evet',
      chocolates: -4, chocolateStarsToday: 3.7, kumbaraToday: 1,
      lastChocolateChoice: 'YE',
      foilBook: { [SERILER[0]]: { variants: { 0: 2, 3: 1 }, golden: 1 } },
      goldenPity: 12,
      tools: ['burgu'],
      activeTool: 'sihir',
      seed: 777002
    }
  },
  {
    ad: 'v3-bozuk',
    aciklama: 'v3 kaydı, bozuk ebeveyn/oturum alanları: pin "abc"→"1234", limitTL -50→varsayılan, ay "2000-01"→syncMonth spentTL sıfırlar, clubActive "evet"→false; negatif kiler 0\'a; çöp wishes süzülür (yalnız pufiId string olanlar; not "dogumgunu" ve durum "sonra" korunur, diğer not/durum düşer); gorevler string / streak dizi → varsayılan; kulucka.seri sayı → null; bugunAcilanlar string → []; todayEggs [] (savedHadEggs=true) → vitrin boş kalır, eggsAvailable 0.',
    girdi: {
      version: 3,
      stardust: 12, kabuk: 5, day: 15,
      eggsAvailable: 4,
      eggCounter: 90, pityN: 1, pityD: 5, pityE: 10, copyStreak: 0,
      owned: Object.fromEntries(CAYIR.slice(0, 3).map((id) => [id, 1])),
      milestones: [],
      todayEggs: [],
      parent: { pin: 'abc', limitTL: -50, spentTL: 123.456, ay: '2000-01', clubActive: 'evet', limitRaiseTs: -5 },
      kiler: { adet: -5, bugunAcilan: -2 },
      wishes: [
        null, 42, 'cop',
        { pufiId: 123 },
        { pufiId: CAYIR[0], ts: -100, not: 'dogumgunu' },
        { pufiId: CAYIR[1], ts: 1300000000, not: 'baskanot', durum: 'sonra' },
        { pufiId: CAYIR[2], durum: 'hemen' }
      ],
      purchases: 'yok',
      kulucka: { seri: 42 },
      hedefPufi: CAYIR[3],
      bugunAcilanlar: 'dun',
      gorevler: 'hepsi',
      streak: [1, 2],
      seed: 777003
    }
  },
  {
    ad: 'v3-tam',
    aciklama: 'Modern, tam v3 kaydı: kulucka + hedefPufi + sakoHidden + wish notları + bugunAcilanlar dolu, ay "2026-01" (syncMonth sıfırlamaz), Club aktif, orman açık. load() değerleri olduğu gibi taşımalı; tek zorunlu iş eggsAvailable=todayEggs.length senkronu ve version=3.',
    girdi: {
      version: 3,
      stardust: 210, kabuk: 75, day: 9,
      eggsAvailable: 3, extraEggsBought: 1,
      eggCounter: 140, pityN: 6, pityD: 18, pityE: 33, copyStreak: 3,
      owned: Object.fromEntries(
        CAYIR.slice(0, 20).map((id) => [id, 2]).concat(ORMAN.slice(0, 4).map((id) => [id, 1]))),
      milestones: ['m10', 'm20'],
      weekCrafts: 2, rewardedPlaysToday: 1,
      todayEggs: [
        { seri: SERILER[2], variant: 1, golden: null, kulucka: true },
        { seri: SERILER[0], variant: 5, golden: true },
        { seri: SERILER[0], variant: 0, golden: null }
      ],
      firstRitualDoneToday: true,
      chocolates: 7, chocolateStarsToday: 12, kumbaraToday: 1,
      lastChocolateChoice: 'biriktir',
      foilBook: {
        [SERILER[0]]: { variants: { 0: 3, 1: 1, 5: 2 }, golden: 2 },
        [SERILER[2]]: { variants: { 4: 1 }, golden: 0 }
      },
      goldenPity: 5,
      tools: ['burgu', 'cekic', 'firlat', 'sihir', 'sedefburgu'],
      activeTool: 'sedefburgu',
      parent: { pin: '4321', limitTL: 750, spentTL: 129.98, ay: '2026-01', clubActive: true, limitRaiseTs: 86400000 },
      kiler: { adet: 3, bugunAcilan: 1 },
      wishes: [
        { pufiId: CAYIR[21], ts: 1200000000, not: 'dogumgunu' },
        { pufiId: ORMAN[5], ts: 1300000000, durum: 'sonra' }
      ],
      purchases: [
        { paketId: 'p1', ad: 'Başlangıç Paketi', tutar: 49.99, adet: 3, ts: 1200000000 },
        { paketId: 'p2', ad: 'Dost Paketi', tutar: 89.99, adet: 6, ts: 1300000000 }
      ],
      introDone: true, introGiftShown: true,
      activeBiome: 'orman', ormanAcik: true,
      sakoHidden: ORMAN[6],
      hedefPufi: CAYIR[22],
      kulucka: { seri: SERILER[3] },
      bugunAcilanlar: [CAYIR[0], ORMAN[0]],
      gorevler: { ac: 3, oyun: 1, albumZiyaret: true, bonusVerildi: true },
      gorevBonusYeni: false,
      streak: { yildiz: 4, rozet: 1 },
      seed: 777004
    }
  }
];

// ---------- koşum ----------
function kosVaka (vaka) {
  const girdiStr = vaka.girdi === null
    ? null
    : (typeof vaka.girdi === 'string' ? vaka.girdi : JSON.stringify(vaka.girdi));
  const Yuvo = makeSandbox(girdiStr);          // taze sandbox + taze tohum 42 (vakalar sızmaz)
  const sonuc = Yuvo.engine.load();
  return { girdiStr, beklenen: JSON.parse(JSON.stringify(sonuc)) };
}

function dosyaMetni (vaka, girdiStr, beklenen) {
  return JSON.stringify({
    _meta: {
      uretici: 'tools/export-migration-fixtures.mjs',
      not: 'ELLE DÜZENLEMEYİN — state.js load() gerçek çıktısıdır; C# SaveCodec.Load bu state\'i bire bir yeniden üretmek zorundadır (PORT-CONTRACT.md EK).',
      stub: 'Math.random = mulberry32(rngTohum, her vaka taze); Date sabit 2026-01-15 (Date.now=' + SABIT_MS + ', monthKey=sabitAy).'
    },
    ad: vaka.ad,
    aciklama: vaka.aciklama,
    rngTohum: RNG_TOHUM,
    sabitAy: SABIT_AY,
    girdi: girdiStr,
    beklenen
  }, null, 2) + '\n';
}

let drift = 0;
if (!CHECK) mkdirSync(outDir, { recursive: true });
for (const vaka of VAKALAR) {
  const a = kosVaka(vaka);
  const b = kosVaka(vaka);                     // determinizm kanıtı: iki taze koşum bire bir
  const ta = dosyaMetni(vaka, a.girdiStr, a.beklenen);
  const tb = dosyaMetni(vaka, b.girdiStr, b.beklenen);
  if (ta !== tb) { console.error(`HATA: ${vaka.ad} deterministik değil!`); process.exit(1); }

  // akıl sağlığı: load() sözleşmesi — version 3 ve eggsAvailable senkronu (state.js 272-273)
  const s = a.beklenen;
  if (s.version !== 3 || !Array.isArray(s.todayEggs) || s.eggsAvailable !== s.todayEggs.length) {
    console.error(`HATA: ${vaka.ad} load() değişmezleri ihlalde (version/eggsAvailable).`);
    process.exit(1);
  }

  const path = join(outDir, vaka.ad + '.json');
  if (CHECK) {
    const mevcut = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (mevcut === ta) console.log(`  ok    content/golden/migration/${vaka.ad}.json`);
    else { drift += 1; console.error(`  ESKİ  content/golden/migration/${vaka.ad}.json — yeniden üretin: node tools/export-migration-fixtures.mjs`); }
  } else {
    writeFileSync(path, ta);
    console.log(`  yazıldı content/golden/migration/${vaka.ad}.json (${ta.length} B)`);
  }
}

if (CHECK) {
  if (drift) { console.error(`SONUÇ: ${drift} migrasyon fikstürü güncel değil.`); process.exit(1); }
  console.log('SONUÇ: migrasyon fikstürleri güncel.');
} else {
  console.log('SONUÇ: migrasyon fikstürleri üretildi — her vaka çift koşumla determinizm-doğrulandı.');
}
