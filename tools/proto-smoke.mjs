// Yuvo prototip duman testi — headless Chromium (playwright-core, executablePath elle verilir).
// v2 ritüel akışı: vitrin → yumurtayı eline al (tap) → ikinci tap = tören {eggIdx} →
// folyo (3 şerit) → çikolata (ısırıklar) → kapsül (tap fallback ile POP) → sonuç kartı →
// defter kodası → birleştirme → albüm → mini oyun → Ambalaj Defteri (≥1 pul işli).
// Ekran görüntüleri: 01-home, 02-ceremony-foil, 02b-ceremony-capsule, 03-ceremony-card,
//                    04-assembly, 05-album, 06-minigame, 07-chocolate, 08-foilbook
//                    (02b: Tomurcuk Kapsülü — trade-dress denetimi her koşuda görselden yapılır)
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

  // 1) HUD + vitrin gelmeli (temiz state: newDay dili 3 ambalajlı yumurta koyar)
  await page.waitForSelector('#hud .pill', { timeout: 10000 });
  await page.waitForSelector('.home-egg', { timeout: 5000 });
  step('HUD + Balon Postanesi vitrini yüklendi');
  await page.screenshot({ path: join(shotDir, '01-home.png') });
  step('01-home.png kaydedildi');

  // Savunmacı: vitrin boşsa doldur (temiz state'te zaten 3 yumurta var)
  await page.evaluate(() => {
    const s = window.Yuvo.engine.state;
    if (!Array.isArray(s.todayEggs) || s.todayEggs.length === 0) window.Yuvo.test.grantEggs(3);
  });

  // ---- 2) Vitrin jesti: İLK tap = eline al, İKİNCİ tap = tören {eggIdx} ----
  await page.click('.home-egg[data-idx="0"]', { force: true });
  await page.waitForSelector('.home-egg.held', { timeout: 5000 });
  step('yumurta eline alındı (ilk tap → held)');
  await page.click('.home-egg.held', { force: true });
  await page.waitForSelector('#cere-stage', { timeout: 5000 });
  step('tören açıldı (ikinci tap, eggIdx=0)');

  // ---- 3) FOLYO aşaması (tam ritüel: temiz state'te firstRitualDoneToday=false) ----
  await page.waitForSelector('.cere-egg-wrap.warm', { timeout: 5000 });
  const needStrips = await page.evaluate(() => {
    const R = (window.Yuvo.data && window.Yuvo.data.RITUAL) || {};
    return R.SERIT > 0 ? R.SERIT : 3;
  });
  // 1 şerit kopar (kulakçık tap fallback) → soyulmuş folyo + düşen parça görünsün
  await page.click('#rit-tab', { force: true });
  await page.waitForTimeout(380);
  await page.screenshot({ path: join(shotDir, '02-ceremony-foil.png') });
  step('02-ceremony-foil.png kaydedildi (1 şerit soyulmuş)');
  for (let i = 1; i < needStrips; i++) {
    await page.click('#rit-tab', { force: true });
    await page.waitForTimeout(140);
  }
  step(`folyo soyuldu (${needStrips} şerit)`);

  // ---- 4) ÇİKOLATA aşaması: Ye!/Biriktir! butonları + ısırık tap'leri ----
  await page.waitForSelector('#rit-eat', { timeout: 5000 });
  step('çikolata aşaması açıldı (Ye!/Biriktir!)');
  const needBites = await page.evaluate(() => {
    const R = (window.Yuvo.data && window.Yuvo.data.RITUAL) || {};
    return R.ISIRIK > 0 ? R.ISIRIK : 4;
  });
  // 2 ısırık → ısırık izleri + ⭐ floater görünür hâlde ekran görüntüsü
  await page.click('#rit-eat', { force: true });
  await page.waitForTimeout(180);
  await page.click('#rit-eat', { force: true });
  await page.waitForTimeout(260);
  await page.screenshot({ path: join(shotDir, '07-chocolate.png') });
  step('07-chocolate.png kaydedildi (2 ısırık + Ye!/Biriktir!)');
  for (let i = 2; i < needBites; i++) {
    await page.click('#rit-eat', { force: true });
    await page.waitForTimeout(140);
  }
  step(`çikolata bitti (${needBites} ısırık — ⭐ kazanıldı)`);

  // ---- 5) KAPSÜL aşaması: tap fallback (burgu/sihir: 5 dokunuş) → POP ----
  await page.waitForSelector('.cere-egg-wrap.capsule', { timeout: 5000 });
  step('kapsül aşaması açıldı');
  // Tomurcuk Kapsülü karesi: ticari görünüm (Kinder trade-dress ayrışması) denetimi görselden
  await page.waitForTimeout(320);
  await page.screenshot({ path: join(shotDir, '02b-ceremony-capsule.png') });
  step('02b-ceremony-capsule.png kaydedildi (kapalı Tomurcuk Kapsülü)');
  for (let i = 0; i < 6; i++) {
    const opened = await page.$('.cere-egg-wrap.opened');
    if (opened) break;
    await page.click('#rit-obj', { force: true });
    await page.waitForTimeout(120);
  }
  await page.waitForSelector('.cere-egg-wrap.opened', { timeout: 5000 });
  step('kapsül POP! (açıldı + kutlama)');

  // ---- 6) Karşılaşma → sonuç kartı ----
  await page.waitForSelector('.cere-card', { timeout: 9000 });
  const cardInfo = await page.evaluate(() => ({
    name: (document.querySelector('.cere-name') || {}).textContent || '?',
    isNew: !!document.querySelector('.cere-badge-new'),
  }));
  step(`sonuç kartı: ${cardInfo.name} isNew=${cardInfo.isNew}`);
  await page.waitForTimeout(600); // kartın belirme animasyonu otursun
  await page.screenshot({ path: join(shotDir, '03-ceremony-card.png') });
  step('03-ceremony-card.png kaydedildi');

  // Temiz state'te onboarding ilk 10 yumurtayı yeni garanti eder; savunmacı yine de kontrol
  if (!cardInfo.isNew) fail('ilk yumurta kopya çıktı — onboarding garantisi bozulmuş');

  // ---- 7) Defter kodası → birleştirme ----
  await page.click('#cere-next', { force: true }); // "Oyuncağını Birleştir!" → defter kodası oynar
  await page.waitForSelector('#asm-stage .asm-piece', { timeout: 9000 });
  step('defter kodası oynadı → birleştirme sahnesi açıldı');
  await page.screenshot({ path: join(shotDir, '04-assembly.png') });
  step('04-assembly.png kaydedildi');

  const assembled = await page.evaluate(() => window.Yuvo.test.assemble());
  if (!assembled) fail('Yuvo.test.assemble() false döndürdü');

  // ---- 8) Albüme otomatik geçiş (~1sn) + ≥1 sahipli hücre ----
  await page.waitForSelector('.alb-grid', { timeout: 8000 });
  const ownedCells = await page.$$eval('.alb-cell:not(.missing)', (els) => els.length);
  if (ownedCells < 1) fail('albümde sahipli hücre yok (beklenen ≥1, ölçülen ' + ownedCells + ')');
  step(`albüm açıldı, sahipli hücre: ${ownedCells}`);
  await page.screenshot({ path: join(shotDir, '05-album.png') });
  step('05-album.png kaydedildi');

  // ---- 9) Alt navdan Oyna → mini oyun ----
  await page.click('#bottom-nav button[data-go="minigame"]');
  await page.waitForSelector('.mg-grid .mg-card', { timeout: 5000 });
  const cardCount = await page.$$eval('.mg-grid .mg-card', (els) => els.length);
  if (cardCount !== 6) fail('mini oyunda 6 kart beklenirdi, ölçülen ' + cardCount);
  step('mini oyun mount oldu (6 kart)');
  await page.screenshot({ path: join(shotDir, '06-minigame.png') });
  step('06-minigame.png kaydedildi');

  // ---- 10) Alt navdan Defter → Ambalaj Defteri (≥1 pul işli) ----
  await page.click('#bottom-nav button[data-go="foilbook"]');
  await page.waitForSelector('.fb-grid', { timeout: 5000 });
  const fbStats = await page.evaluate(() => {
    const owned = document.querySelectorAll('.fb-grid .fb-cell.owned').length;
    const tabs = document.querySelectorAll('.fb-tabs .fb-tab').length;
    const book = window.Yuvo.test.foilBook();
    let recs = 0;
    for (const k in book) {
      const r = book[k] || {};
      recs += (r.golden | 0);
      for (const v in (r.variants || {})) recs += (r.variants[v] | 0);
    }
    return { owned, tabs, recs };
  });
  if (fbStats.tabs !== 6) fail('Defter\'de 6 seri sekmesi beklenirdi, ölçülen ' + fbStats.tabs);
  if (fbStats.owned < 1) fail('Defter\'de işli pul yok (beklenen ≥1, ölçülen ' + fbStats.owned + ')');
  if (fbStats.recs < 1) fail('foilBook state kaydı boş (beklenen ≥1 folyo)');
  step(`Ambalaj Defteri açıldı — 6 sekme, işli pul: ${fbStats.owned} (state kaydı: ${fbStats.recs})`);
  await page.screenshot({ path: join(shotDir, '08-foilbook.png') });
  step('08-foilbook.png kaydedildi');

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
