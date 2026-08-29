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

async function newPage () {
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
  return { context, page };
}

try {
  /* ================= BÖLÜM A — FTUE açılışı (temiz state → intro → tören) ================= */
  {
    const { context, page } = await newPage();
    await page.waitForSelector('.intro-scene', { timeout: 10000 });
    step('A· temiz state intro ile açıldı (karanlıkta ışıyan yumurta)');
    await page.waitForSelector('.intro-star', { timeout: 8000 }); // kalp atışı ~2,2 sn sonra yıldız
    await page.waitForTimeout(1500); // düşüş animasyonu otursun
    await page.screenshot({ path: join(shotDir, '09-intro.png') });
    step('A· 09-intro.png kaydedildi (yıldız çocuğun dokunuşunu bekliyor)');
    await page.click('.intro-star', { force: true });
    await page.waitForSelector('.dlg-bubble', { timeout: 5000 });
    step('A· anlatıcı konuştu (balon açık)');
    await page.click('.dlg-bubble'); // 1. cümle
    await page.waitForTimeout(250);
    await page.click('.dlg-bubble'); // 2. cümle → ısıtma aşaması
    await page.waitForSelector('.intro-egg', { timeout: 5000 });
    step('A· ısıtma aşaması açıldı (üşüyen yumurta)');
    for (let i = 0; i < 3; i++) {
      await page.click('.intro-egg', { force: true });
      await page.waitForTimeout(220);
    }
    await page.waitForSelector('#cere-stage', { timeout: 6000 });
    const introDone = await page.evaluate(() => window.Yuvo.test.state().introDone === true);
    if (!introDone) fail('intro tamamlandı ama introDone bayrağı yazılmadı');
    step('A· 3 ovalama → tören devraldı (introDone=true)');
    await context.close();
  }

  /* ================= BÖLÜM B — çekirdek ritüel akışı (mevcut 22 adım) ================= */
  const { context, page } = await newPage();
  // FTUE bölüm A'da doğrulandı — çekirdek akış için atla (mevcut adımlar birebir korunur)
  await page.waitForSelector('.intro-scene', { timeout: 10000 });
  await page.evaluate(() => window.Yuvo.test.skipIntro());

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

  /* ---- 11) Albümden Dilek Kavanozu'na fısılda (çocuk fiyat GÖRMEZ) ---- */
  await page.evaluate(() => { while (window.Yuvo.test.dialogNext()) {} }); // açık balon varsa kapat
  await page.click('#bottom-nav button[data-go="album"]');
  await page.waitForSelector('.alb-grid', { timeout: 5000 });
  await page.evaluate(() => { while (window.Yuvo.test.dialogNext()) {} }); // Kiki hediyesi oynadıysa kapat
  await page.click('.alb-cell.missing', { timeout: 5000 });
  await page.waitForSelector('#alb-wish-btn', { timeout: 5000 });
  const modalText = await page.evaluate(() =>
    (document.querySelector('#overlay-root .modal') || {}).textContent || '');
  if (/₺|TL|fiyat|satın/i.test(modalText)) fail('ÇOCUK ARAYÜZÜ İHLALİ: albüm modalında fiyat/mağaza dili var');
  await page.click('#alb-wish-btn');
  const wishCount = await page.evaluate(() => window.Yuvo.test.state().wishes.length);
  if (wishCount !== 1) fail('dilek kaydedilmedi (beklenen 1, ölçülen ' + wishCount + ')');
  step('dilek kavanoza fısıldandı (fiyat dili yok, wishes=1)');

  /* ---- 12) Ebeveyn paneli: PIN kapısı → panel ---- */
  await page.click('#bottom-nav button[data-go="home"]');
  await page.waitForSelector('.home-parent-btn', { timeout: 5000 });
  await page.click('.home-parent-btn');
  await page.waitForSelector('.par-gate', { timeout: 5000 });
  step('ebeveyn PIN kapısı açıldı (panel kilitli başlar)');
  for (const k of ['1', '2', '3', '4']) {
    await page.click('.par-keypad [data-key="' + k + '"]');
    await page.waitForTimeout(90);
  }
  // 4. haneden sonra bazı akışlar otomatik onaylar — onay tuşuna yalnız kapı hâlâ açıksa bas
  await page.waitForTimeout(400);
  if (!(await page.$('.par-tabs'))) {
    try { await page.click('.par-keypad [data-key="ok"]', { timeout: 2000 }); } catch (e) {}
  }
  await page.waitForSelector('.par-tabs', { timeout: 5000 });
  const packCount = await page.$$eval('.par-pack', (els) => els.length);
  if (packCount !== 6) fail('panelde 6 paket kartı beklenirdi, ölçülen ' + packCount);
  const panelText = await page.evaluate(() => document.body.textContent || '');
  if (!/DEMO/.test(panelText)) fail('panelde DEMO uyarısı görünmüyor');
  step('PIN 1234 → panel açıldı (6 paket + DEMO uyarısı + dilek listesi)');
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(shotDir, '10-parent.png') });
  step('10-parent.png kaydedildi');

  /* ---- 13) Satın alma simülasyonu: özet + Şeffaflık → onay → Kiler ---- */
  await page.click('.par-pack[data-pack="haftalik"] .par-pack-buy');
  await page.waitForSelector('.par-modal', { timeout: 5000 });
  const buyText = await page.evaluate(() =>
    (document.querySelector('.par-modal') || {}).textContent || '');
  if (!/satılmaz|SATILMAZ/.test(buyText)) fail('satın alma özetinde "Efsanevi satılmaz" satırı yok');
  if (!/DEMO/.test(buyText)) fail('satın alma özetinde DEMO uyarısı yok');
  step('satın alma özeti: oran tablosu + Efsanevi-satılmaz + DEMO görünür');
  await page.screenshot({ path: join(shotDir, '11-store.png') });
  step('11-store.png kaydedildi');
  await page.click('.par-modal-foot button:has-text("Onayla")');
  await page.waitForTimeout(400);
  const alim = await page.evaluate(() => {
    const s = window.Yuvo.test.state();
    return { kiler: s.kiler.adet, spent: s.parent.spentTL, vitrin: s.todayEggs.length };
  });
  if (alim.kiler !== 10) fail('haftalık paket kilere 10 yumurta eklemeliydi, ölçülen ' + alim.kiler);
  if (Math.abs(alim.spent - 39.99) > 0.001) fail('harcama ₺39,99 olmalıydı, ölçülen ' + alim.spent);
  if (alim.vitrin !== 2) fail('satın alma vitrine DOKUNMAMALI (beklenen 2, ölçülen ' + alim.vitrin + ')');
  step('onay → Kiler 10 yumurta, harcama ₺39,99, vitrin dokunulmadı');

  /* ---- 14) Oyuna dön → Kiler sürprizi vitrine düşer ---- */
  await page.click('.par-gate-back, .par-btn-ghost');
  await page.waitForSelector('.home-kiler', { timeout: 5000 });
  step('yuvada "Sürpriz posta!" çipi belirdi (kilerde yumurta var)');
  await page.click('.home-kiler', { force: true }); // sonsuz sallanma animasyonu: stabilite bekleme
  await page.waitForTimeout(300);
  const sonKiler = await page.evaluate(() => {
    const s = window.Yuvo.test.state();
    return { kiler: s.kiler.adet, vitrin: s.todayEggs.length, sayac: s.eggsAvailable };
  });
  if (sonKiler.vitrin !== 3 || sonKiler.sayac !== 3) fail('kiler çekimi vitrine düşmedi (' + JSON.stringify(sonKiler) + ')');
  if (sonKiler.kiler !== 9) fail('kiler 9 kalmalıydı, ölçülen ' + sonKiler.kiler);
  step('kilerden 1 yumurta sepete düştü (vitrin 3, kiler 9)');

  /* ---- 15) Fısıltı Ormanı: kilit → açılış → biyom geçişi → Şako Saklambaç ---- */
  await page.evaluate(() => {
    const Y = window.Yuvo, s = Y.test.state();
    const cayir = Y.data.PUFIS.filter((p) => (p.biome || 'cayir') === 'cayir' && p.rarity !== 'gizli');
    for (let i = 0; i < 10; i++) s.owned[cayir[i].id] = s.owned[cayir[i].id] || 1;
    Y.engine.checkOrmanUnlock();
    Y.engine.save();
    Y.engine.setBiome('orman');
    Y.refresh();
  });
  await page.click('#bottom-nav button[data-go="home"]');
  await page.waitForSelector('.home-sako-btn', { timeout: 5000 });
  const ormanDurum = await page.evaluate(() => {
    const s = window.Yuvo.test.state();
    return { acik: s.ormanAcik, biyom: s.activeBiome };
  });
  if (!ormanDurum.acik || ormanDurum.biyom !== 'orman') fail('orman açılmadı: ' + JSON.stringify(ormanDurum));
  step('Fısıltı Ormanı açıldı ve biyom geçişi yapıldı (yuva orman teninde)');
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(shotDir, '12-forest.png') });
  step('12-forest.png kaydedildi');

  // Albümde orman sekmesi
  await page.click('#bottom-nav button[data-go="album"]');
  await page.waitForSelector('.alb-biome-tab', { timeout: 5000 });
  const tabSayisi = await page.$$eval('.alb-biomes .alb-biome-tab', (els) => els.length);
  if (tabSayisi !== 2) fail('albümde 2 biyom sekmesi beklenirdi, ölçülen ' + tabSayisi);
  const ormanHucre = await page.evaluate(() => {
    const tabs = document.querySelectorAll('.alb-biomes .alb-biome-tab');
    tabs[1].click();
    return document.querySelectorAll('.alb-grid .alb-cell').length;
  });
  if (ormanHucre !== 30) fail('orman albüm sayfasında 30 hücre beklenirdi, ölçülen ' + ormanHucre);
  step('albüm orman sayfası: 30 hücre (gizli ayrık)');
  await page.screenshot({ path: join(shotDir, '13-forest-album.png') });
  step('13-forest-album.png kaydedildi');

  // Şako Saklambaç: karıştırma biter → test kancasıyla kazan → ödül
  await page.click('#bottom-nav button[data-go="home"]');
  await page.waitForSelector('.home-sako-btn', { timeout: 5000 });
  await page.click('.home-sako-btn');
  await page.waitForSelector('.sk-scene', { timeout: 5000 });
  step('Şako Saklambaç açıldı');
  await page.waitForSelector('.sk-hint', { timeout: 8000 }); // goster+karistir bitti → seçim
  await page.screenshot({ path: join(shotDir, '14-sako.png') });
  step('14-sako.png kaydedildi (seçim aşaması)');
  const starOnce = await page.evaluate(() => window.Yuvo.test.state().stardust);
  const kazandi = await page.evaluate(() => window.Yuvo.test.sakoWin());
  if (!kazandi) fail('sakoWin kancası seçim aşamasında çalışmadı');
  await page.waitForTimeout(300);
  const starSonra = await page.evaluate(() => window.Yuvo.test.state().stardust);
  if (starSonra !== starOnce + 10) fail('Saklambaç ödülü +10⭐ olmalıydı (' + starOnce + '→' + starSonra + ')');
  step('Saklambaç kazanıldı (+10⭐) — "Bir Daha!" görünür');

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
