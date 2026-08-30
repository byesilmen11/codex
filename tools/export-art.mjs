// Yuvo — sanat ihracı v1 (boru hattı KANITI): prosedürel SVG'leri PNG'ye render eder.
// Kapsam (v1): yumurta 6 nadirlik × crack 0-3 + 5 örnek Pufi × (happy/sleep/silüet),
// @2x ve @3x. Tam kapsam (62 Pufi, oyuncak parçaları, ambalajlar…) sonraki sürümde
// (docs/v2/07 §5; proje/03-yapilacaklar.md).
//
// Kullanım:
//   node tools/export-art.mjs           → content/art/proof/*.png + content/art/manifest.json
//   node tools/export-art.mjs --check   → render ETMEZ; manifest ↔ disk (varlık+boyut+sha256)
//                                         tutarlılığını doğrular, fark → exit 1
//
// Rasterizasyon: yeni bağımlılık YOK — playwright-core + kurulu Chromium (duman testiyle
// aynı ikili). Şeffaf arka plan (omitBackground). Not: PNG baytları Chromium sürümüne
// bağlıdır; bu yüzden --check yeniden render etmez, manifest'i doğrular (bilinçli karar).
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const proto = join(repo, 'prototype');
const artDir = join(repo, 'content', 'art');
const outDir = join(artDir, 'proof');
const manifestPath = join(artDir, 'manifest.json');
const CHECK = process.argv.includes('--check');
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const FILES = [
  'js/data/pufis.js', 'js/data/pufis-forest.js', 'js/data/wrappers.js',
  'js/art/pufi-svg.js',
  'js/art/pufi-kinds-1.js', 'js/art/pufi-kinds-2.js', 'js/art/pufi-kinds-3.js',
  'js/art/pufi-kinds-4.js', 'js/art/pufi-kinds-5.js', 'js/art/pufi-kinds-6.js'
];

function makeSandbox () {
  const window = {};
  const document = { addEventListener () {}, dispatchEvent () {} };
  const code = FILES.map((f) => `/* == ${f} == */\n` + readFileSync(join(proto, f), 'utf8')).join('\n');
  new Function('window', 'document', 'localStorage', 'navigator', code)(window, document, null, {});
  return window.Yuvo;
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// ---------- iş listesi (id → sprite adı sözleşmesi: docs/v2/07 §5) ----------
const RARITIES = ['yaygin', 'azbulunur', 'nadir', 'destansi', 'efsanevi', 'gizli'];
// Her nadirlikten 1 örnek Pufi (çayır) — kind çeşitliliği boru hattını sınar
const SAMPLE_PUFIS = ['cikcik', 'pirpir', 'petek', 'safak', 'gundogan'];
const SCALES = [2, 3];
const BASE = 120;                              // pufi-svg viewBox 0 0 120 120

function buildJobs (Yuvo) {
  const jobs = [];                             // { name, svg }
  for (const r of RARITIES) {
    for (let crack = 0; crack <= 3; crack++) {
      jobs.push({ name: `egg_${r}_crack${crack}`, svg: Yuvo.art.eggSVG(r, { crack }) });
    }
  }
  for (const id of SAMPLE_PUFIS) {
    const p = Yuvo.data.pufiById(id);
    if (!p) throw new Error(`örnek Pufi bulunamadı: ${id}`);
    jobs.push({ name: `pufi_${id}_happy`, svg: Yuvo.art.pufiSVG(p, { mood: 'happy' }) });
    jobs.push({ name: `pufi_${id}_sleep`, svg: Yuvo.art.pufiSVG(p, { mood: 'sleep' }) });
    jobs.push({ name: `pufi_${id}_sil`, svg: Yuvo.art.pufiSilhouetteSVG(p) });
  }
  for (const j of jobs) {
    if (!j.svg || j.svg.indexOf('<svg') === -1) throw new Error(`${j.name}: SVG üretilemedi`);
  }
  return jobs;
}

// ---------- --check: manifest ↔ disk ----------
if (CHECK) {
  if (!existsSync(manifestPath)) { console.error('HATA: content/art/manifest.json yok — önce üretin.'); process.exit(1); }
  const man = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let bozuk = 0;
  for (const e of man.dosyalar) {
    const p = join(artDir, e.dosya);
    if (!existsSync(p)) { bozuk++; console.error(`  EKSİK ${e.dosya}`); continue; }
    const buf = readFileSync(p);
    if (sha256(buf) !== e.sha256 || buf.length !== e.bayt) { bozuk++; console.error(`  FARKLI ${e.dosya}`); }
    else console.log(`  ok    ${e.dosya}`);
  }
  if (bozuk) { console.error(`SONUÇ: ${bozuk} dosya manifest ile uyumsuz — yeniden üretin: node tools/export-art.mjs`); process.exit(1); }
  console.log(`SONUÇ: sanat ihracı manifest ile tutarlı (${man.dosyalar.length} dosya).`);
  process.exit(0);
}

// ---------- render ----------
const Yuvo = makeSandbox();
const jobs = buildJobs(Yuvo);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const dosyalar = [];
try {
  const page = await browser.newPage({ viewport: { width: BASE * 3 + 40, height: BASE * 3 + 40 } });
  for (const job of jobs) {
    for (const s of SCALES) {
      const px = BASE * s;
      await page.setContent(
        '<style>html,body{margin:0;background:transparent}' +
        `#k{width:${px}px;height:${px}px}#k svg{width:100%;height:100%;display:block}</style>` +
        `<div id="k">${job.svg}</div>`,
        { waitUntil: 'load' }
      );
      const el = await page.$('#k');
      const dosya = `proof/${job.name}@${s}x.png`;
      const buf = await el.screenshot({ omitBackground: true, path: join(artDir, dosya) });
      dosyalar.push({ dosya, en: px, boy: px, bayt: buf.length, sha256: sha256(buf) });
    }
    console.log(`  render ${job.name} (@2x, @3x)`);
  }
} finally {
  await browser.close();
}

const manifest = {
  _meta: {
    uretici: 'tools/export-art.mjs',
    not: 'ELLE DÜZENLEMEYİN — `node tools/export-art.mjs` yeniden üretir. PNG baytları Chromium sürümüne bağlıdır; --check manifest↔disk doğrular, yeniden render etmez.',
    kapsam: 'v1 KANIT: yumurta 6 nadirlik × crack 0-3 + 5 örnek Pufi × (happy/sleep/sil), @2x/@3x. Tam kapsam: docs/v2/07 §5.',
    adSozlesmesi: 'egg_{rarity}_crack{0-3} · pufi_{id}_{happy|sleep|sil} — Unity sprite adları bu sözleşmeyi izler.'
  },
  dosyalar
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`SONUÇ: ${dosyalar.length} PNG + manifest yazıldı (content/art/).`);
