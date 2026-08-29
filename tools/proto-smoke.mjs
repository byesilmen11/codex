// Yuvo prototip duman testi — headless Chromium (playwright-core, executablePath elle verilir).
// Akış: home → yumurta → tören (ısıtma + skip) → kart → birleştirme → albüm → mini oyun.
// Ekran görüntüleri: prototype/screenshots/01-home.png … 06-minigame.png
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distUrl = 'file://' + join(root, 'prototype', 'dist', 'index.html');
const shotDir = join(root, 'prototype', 'screenshots');
mkdirSync(shotDir, { recursive: true });

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Bu kalıplar hedefe sayılmaz (vibrate / audio autoplay uyarıları)
const IGNORE = [
  /vibrate/i,
  /AudioContext/i,
  /autoplay/i,
  /user gesture/i,
  /Failed to load resource/i, // ağ-kısıtlı headless ortamda Google Fonts istekleri (route ile abort ediliyor)
  /fonts\.g(oogleapis|static)/i,
];

const errors = [];
function noteError(kind, text) {
  if (IGNORE.some((re) => re.test(text))) return;
  errors.push(`[${kind}] ${text}`);
}

const steps = [];
function step(name) { steps.push(name); console.log('  → ' + name); }
function fail(msg) { throw new Error(msg); }

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const page = await context.newPage();

  // Headless ortamda dış font isteklerini kes (fonksiyonel akışı etkilemez; fallback yığını devrede)
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());

  page.on('console', (msg) => {
    if (msg.type() === 'error') noteError('console', msg.text());
  });
  page.on('pageerror', (err) => noteError('pageerror', String(err && err.message || err)));

  await page.goto(distUrl, { waitUntil: 'load' });

  // 1) HUD gelmeli
  await page.waitForSelector('#hud .pill', { timeout: 10000 });
  step('HUD yüklendi');
  await page.screenshot({ path: join(shotDir, '01-home.png') });
  step('01-home.png kaydedildi');

  // 2) Yumurta hakkı garanti + sepetteki yumurtaya tıkla
  await page.evaluate(() => window.Yuvo.test.grantEggs(3));
  await page.waitForSelector('.home-egg', { timeout: 5000 });

  // Kopya çıkarsa yeni yumurtayla tekrar dene (onboarding ilk 10'u yeni garanti eder ama savunmacı olalım)
  let result = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    // Yumurtalar sürekli CSS animasyonla salındığı için stability beklemeden tıkla
    await page.click('.home-egg', { force: true });
    await page.waitForSelector('#cere-stage', { timeout: 5000 });
    step(`tören açıldı (deneme ${attempt})`);

    // Isıtma ekranı (arrive ~950ms sonra warm sınıfı gelir)
    await page.waitForSelector('.cere-egg-wrap.warm', { timeout: 5000 });
    if (attempt === 1) {
      await page.screenshot({ path: join(shotDir, '02-ceremony-warm.png') });
      step('02-ceremony-warm.png kaydedildi (ısıtma ekranı)');
    }

    // Skip → sonuç kartı
    result = await page.evaluate(() => {
      const r = window.Yuvo.test.ceremonySkip();
      return r ? { id: r.pufi.id, ad: r.pufi.ad, rarity: r.rarity, isNew: r.isNew } : null;
    });
    if (!result) fail('ceremonySkip null döndürdü');
    await page.waitForSelector('.cere-card', { timeout: 5000 });
    step(`sonuç kartı: ${result.ad} (${result.rarity}) isNew=${result.isNew}`);
    if (attempt === 1) {
      await page.waitForTimeout(600); // kartın belirme animasyonu otursun
      await page.screenshot({ path: join(shotDir, '03-ceremony-card.png') });
      step('03-ceremony-card.png kaydedildi');
    }

    if (result.isNew) {
      // "Oyuncağını Birleştir!" → assembly
      await page.click('#cere-next', { force: true });
      break;
    }
    // Kopya: "Devam" → home, yeni yumurta dene
    await page.click('#cere-next', { force: true });
    await page.waitForSelector('.home-scene', { timeout: 5000 });
    await page.evaluate(() => window.Yuvo.test.grantEggs(1));
    await page.waitForSelector('.home-egg', { timeout: 5000 });
    if (attempt === 5) fail('5 denemede de kopya çıktı, yeni Pufi gelmedi');
  }

  // 3) Birleştirme sahnesi
  await page.waitForSelector('#asm-stage .asm-piece', { timeout: 5000 });
  step('birleştirme sahnesi açıldı');
  await page.screenshot({ path: join(shotDir, '04-assembly.png') });
  step('04-assembly.png kaydedildi');

  const assembled = await page.evaluate(() => window.Yuvo.test.assemble());
  if (!assembled) fail('Yuvo.test.assemble() false döndürdü');

  // 4) Albüme otomatik geçiş (~1sn) + ≥1 sahipli hücre
  await page.waitForSelector('.alb-grid', { timeout: 8000 });
  const ownedCells = await page.$$eval('.alb-cell:not(.missing)', (els) => els.length);
  if (ownedCells < 1) fail('albümde sahipli hücre yok (beklenen ≥1, ölçülen ' + ownedCells + ')');
  step(`albüm açıldı, sahipli hücre: ${ownedCells}`);
  await page.screenshot({ path: join(shotDir, '05-album.png') });
  step('05-album.png kaydedildi');

  // 5) Alt navdan Oyna → mini oyun
  await page.click('#bottom-nav button[data-go="minigame"]');
  await page.waitForSelector('.mg-grid .mg-card', { timeout: 5000 });
  const cardCount = await page.$$eval('.mg-grid .mg-card', (els) => els.length);
  if (cardCount !== 6) fail('mini oyunda 6 kart beklenirdi, ölçülen ' + cardCount);
  step('mini oyun mount oldu (6 kart)');
  await page.screenshot({ path: join(shotDir, '06-minigame.png') });
  step('06-minigame.png kaydedildi');

  await context.close();
} finally {
  await browser.close();
}

console.log('');
if (errors.length) {
  console.error('KONSOL HATALARI (' + errors.length + '):');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('SONUÇ: duman testi GEÇTİ — ' + steps.length + ' adım, sıfır konsol hatası.');
