// Yuvo — içerik ihracı: prototip JS verisinden /content/*.json üretir.
// "Sayılar tek kaynaktan" ilkesinin aracı (docs/v2/07 §4): Unity istemcisi bu
// JSON'ları okur; prototip yaşadıkça içerik çift-kaynak olmaz.
//
// Kullanım:
//   node tools/export-content.mjs           → /content/*.json yazar
//   node tools/export-content.mjs --check   → yazmaz, mevcut dosyalarla karşılaştırır;
//                                             fark varsa exit 1 (CI "export güncel mi?" kapısı)
//
// Kaynaklar: Yuvo.data.* (sandbox eval) + motor/sahne sabitleri (kaynak koddan
// hedefli regex çıkarımı — kalıp bulunamazsa YÜKSEK SESLE düşer, sessizce eskimez).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const proto = join(repo, 'prototype');
const outDir = join(repo, 'content');
const CHECK = process.argv.includes('--check');

const DATA_FILES = [
  'js/data/pufis.js', 'js/data/pufis-forest.js', 'js/data/wrappers.js',
  'js/data/store.js', 'js/data/dialogue.js'
];

// ---------- sandbox (proto-engine-test.mjs deseni) ----------
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
  const code = DATA_FILES.map((f) => `/* == ${f} == */\n` + readFileSync(join(proto, f), 'utf8')).join('\n');
  new Function('window', 'document', 'localStorage', 'navigator', code)(window, document, localStorage, {});
  return window.Yuvo;
}

// ---------- kaynak koddan sabit çıkarımı ----------
function src (file) { return readFileSync(join(proto, file), 'utf8'); }

function num (source, name, file) {
  const m = source.match(new RegExp('var ' + name + ' = ([0-9.]+);'));
  if (!m) throw new Error(`${file}: 'var ${name} = <sayı>;' kalıbı bulunamadı — export aracı güncellenmeli`);
  return Number(m[1]);
}

function fail (msg) { console.error('HATA: ' + msg); process.exit(1); }

const Yuvo = makeSandbox();
const stateSrc = src('js/engine/state.js');
const gachaSrc = src('js/engine/gacha.js');
const cereSrc = src('js/scenes/ceremony.js');

// Tören zamanlamaları (ceremony.js): POP öncesi hush + tier'a göre kutlama süresi
const hushM = cereSrc.match(/classList\.add\('hush'\);[\s\S]{0,300}?\}, (\d+)\);/);
if (!hushM) fail("ceremony.js: hush süresi kalıbı bulunamadı — export aracı güncellenmeli");
const celebM = cereSrc.match(/t >= 3 \? (\d+) : t === 2 \? (\d+) : t === 1 \? (\d+) : (\d+)\);/);
if (!celebM) fail('ceremony.js: tier kutlama süresi kalıbı bulunamadı — export aracı güncellenmeli');

// Kilometre taşları (state.js)
const milestones = [];
for (const m of stateSrc.matchAll(/\{ at:(\d+), key:'(\w+)', kabuk:(\d+) \}/g)) {
  milestones.push({ at: Number(m[1]), key: m[2], kabuk: Number(m[3]) });
}
if (milestones.length !== 4) fail(`state.js: 4 kilometre taşı beklenirdi, bulunan ${milestones.length}`);

// ---------- doğrulamalar (bozuk veri asla ihraç edilmez) ----------
const PUFIS = Yuvo.data.PUFIS || [];
if (PUFIS.length !== 62) fail(`62 Pufi beklenirdi, ölçülen ${PUFIS.length}`);
const oranToplam = Object.values(Yuvo.data.RARITIES).reduce((a, r) => a + r.oran, 0);
if (Math.abs(oranToplam - 1) > 1e-9) fail(`oran toplamı 1 değil (${oranToplam})`);
if (Object.keys(Yuvo.data.WRAPPER_SERIES).length !== 6) fail('6 ambalaj serisi beklenirdi');
const merdiven = (Yuvo.data.PACKS || []).filter((p) => !p.tekSeferlik);
if (merdiven.length !== 6) fail(`6 paket kademesi beklenirdi, ölçülen ${merdiven.length}`);

// ---------- çıktı dosyaları ----------
const META = {
  uretici: 'tools/export-content.mjs',
  not: 'ELLE DÜZENLEMEYİN — kaynak prototip JS dosyalarıdır; `node tools/export-content.mjs` yeniden üretir.'
};

const files = {
  'pufis.json': {
    _meta: META,
    pufis: PUFIS.map((p) => ({
      id: p.id, ad: p.ad, tur: p.tur, kind: p.kind,
      rarity: p.rarity, biome: p.biome || 'cayir', bio: p.bio
    }))
  },
  'rarities.json': { _meta: META, rarities: Yuvo.data.RARITIES },
  'wrappers.json': {
    _meta: META,
    series: Yuvo.data.WRAPPER_SERIES,
    variants: Yuvo.data.WRAPPER_VARIANTS,
    tools: Yuvo.data.TOOLS
  },
  'dialogue.json': { _meta: META, dialog: Yuvo.data.DIALOG },
  'packs.json': {
    _meta: META,
    packs: Yuvo.data.PACKS,
    club: Yuvo.data.CLUB,
    odds: Yuvo.data.ODDS,
    oddsNotlar: Yuvo.data.ODDS_NOTLAR,
    storeLimits: Yuvo.data.STORE_LIMITS,
    demoUyari: Yuvo.data.DEMO_UYARI
  },
  'ritual.json': {
    _meta: META,
    // Tören verisi (data/wrappers.js — folyo/çikolata/kumbara/altın folyo)
    ritual: Yuvo.data.RITUAL,
    // Motor sabitleri (engine/state.js)
    engine: {
      dailyEggs: num(stateSrc, 'DAILY_EGGS', 'state.js'),
      eggStackMax: num(stateSrc, 'EGG_STACK_MAX', 'state.js'),   // haklar birikir, tavan
      streakGoal: num(stateSrc, 'STREAK_GOAL', 'state.js'),      // Bekçi Takvimi (CEZASIZ)
      streakKabuk: num(stateSrc, 'STREAK_KABUK', 'state.js'),
      gorevAcHedef: num(stateSrc, 'GOREV_AC_HEDEF', 'state.js'), // günlük görev zinciri
      gorevOyunHedef: num(stateSrc, 'GOREV_OYUN_HEDEF', 'state.js'),
      extraEggCost: num(stateSrc, 'EXTRA_EGG_COST', 'state.js'),
      extraEggMax: num(stateSrc, 'EXTRA_EGG_MAX', 'state.js'),
      milestones
    },
    // Düşüş algoritması sabitleri (engine/gacha.js — v2·02 §2.2)
    gacha: {
      softPityE: num(gachaSrc, 'SOFT_PITY_E', 'gacha.js'),
      softArtis: num(gachaSrc, 'SOFT_ARTIS', 'gacha.js'),
      hardPityE: num(gachaSrc, 'HARD_PITY_E', 'gacha.js'),
      pityDestansi: num(gachaSrc, 'PITY_DESTANSI', 'gacha.js'),
      pityNadir: num(gachaSrc, 'PITY_NADIR', 'gacha.js'),
      onboarding: num(gachaSrc, 'ONBOARDING', 'gacha.js'),
      kopyaSeriEsigi: num(gachaSrc, 'KOPYA_SERI_ESIGI', 'gacha.js'),
      wEksik: num(gachaSrc, 'W_EKSIK', 'gacha.js'),
      wEksikSon3: num(gachaSrc, 'W_EKSIK_SON3', 'gacha.js')
    },
    // Tören zamanlaması (scenes/ceremony.js — v2·06 reveal merdiveni)
    ceremony: {
      hushMs: Number(hushM[1]),                                  // POP öncesi tam sessizlik
      celebrationMsByTier: [Number(celebM[4]), Number(celebM[3]), Number(celebM[2]), Number(celebM[1])]
    }
  }
};

// ---------- yaz / karşılaştır ----------
let drift = 0;
if (!CHECK) mkdirSync(outDir, { recursive: true });
for (const [name, obj] of Object.entries(files)) {
  const text = JSON.stringify(obj, null, 2) + '\n';
  const path = join(outDir, name);
  if (CHECK) {
    const mevcut = existsSync(path) ? readFileSync(path, 'utf8') : null;
    if (mevcut === text) console.log(`  ok    content/${name}`);
    else { drift += 1; console.error(`  ESKİ  content/${name} — yeniden üretin: node tools/export-content.mjs`); }
  } else {
    writeFileSync(path, text);
    console.log(`  yazıldı content/${name} (${text.length} B)`);
  }
}

if (CHECK) {
  if (drift) { console.error(`SONUÇ: ${drift} dosya güncel değil.`); process.exit(1); }
  console.log('SONUÇ: içerik ihracı güncel.');
} else {
  console.log('SONUÇ: içerik ihracı tamam — 62 Pufi, 6+1 paket, oran toplamı 1 doğrulandı.');
}
