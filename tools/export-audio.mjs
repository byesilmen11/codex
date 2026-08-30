// Yuvo — ses ihracı v1 (boru hattı KANITI): WebAudio sentez seslerini offline render edip
// WAV yazar. Kapsam (v1): çekirdek + ritüel doruk sesleri + 5 örnek pufiChirp. Tam kapsam
// (tüm SOUNDS + 62 cıvıltı) Unity proje açılışında (docs/v2/07 §6; proje/03-yapilacaklar.md).
//
// Kullanım:
//   node tools/export-audio.mjs           → content/audio/proof/*.wav + content/audio/manifest.json
//   node tools/export-audio.mjs --check   → render ETMEZ; manifest ↔ disk (varlık+bayt+sha256)
//
// Yöntem: prototype/js/audio.js KAYNAĞI değiştirilmeden Chromium'da (playwright-core, duman
// testiyle aynı ikili) değerlendirilir; window.AudioContext, OfflineAudioContext'e sarılır
// (state/resume şimlenir), her ses TAZE bağlamda render edilir. Math.random render başına
// sabit tohumlu PRNG'ye çevrilir → noiseBuf ve burst ofsetleri dahil İÇERİK tekrarlanabilir.
// Ölçülen sınır: kısa sesler koşumlar arası bit-özdeş; en uzun/yoğun graflarda (fanfareBig,
// goldenFanfare) Chromium son-bit kayan nokta oynaması gösterebilir (peak/boyut aynı, duyulmaz)
// — bu yüzden --check yeniden render ETMEZ, manifest↔disk doğrular (export-art ile aynı karar).
// pufiChirp imzası kaynaktaki FNV-1a ile birebir.
import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = join(repo, 'content', 'audio');
const outDir = join(audioDir, 'proof');
const manifestPath = join(audioDir, 'manifest.json');
const CHECK = process.argv.includes('--check');
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const RATE = 44100;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// ---------- iş listesi: { dosya, ses, opts, sure(sn) } ----------
const CHIRP_IDS = ['cikcik', 'pirpir', 'petek', 'safak', 'gundogan'];
const JOBS = [
  { dosya: 'sfx_tap.wav', ses: 'tap', sure: 0.5 },
  { dosya: 'sfx_crack1.wav', ses: 'crack1', sure: 0.5 },
  { dosya: 'sfx_crackBig.wav', ses: 'crackBig', sure: 1.0 },
  { dosya: 'sfx_pop.wav', ses: 'pop', sure: 0.8 },
  { dosya: 'sfx_chime.wav', ses: 'chime', sure: 1.2 },
  { dosya: 'sfx_star.wav', ses: 'star', sure: 0.8 },
  { dosya: 'sfx_fanfare.wav', ses: 'fanfare', sure: 1.6 },
  { dosya: 'sfx_fanfareBig.wav', ses: 'fanfareBig', sure: 2.4 },
  { dosya: 'sfx_foilTear.wav', ses: 'foilTear', sure: 0.6 },
  { dosya: 'sfx_bite.wav', ses: 'bite', sure: 0.5 },
  { dosya: 'sfx_capsulePop.wav', ses: 'capsulePop', sure: 1.0 },
  { dosya: 'sfx_goldenFanfare.wav', ses: 'goldenFanfare', sure: 2.4 },
  { dosya: 'sfx_shakeRattle_cayir.wav', ses: 'shakeRattle', opts: { family: 'cayir' }, sure: 1.0 },
  { dosya: 'sfx_shakeRattle_orman.wav', ses: 'shakeRattle', opts: { family: 'orman' }, sure: 1.0 },
  ...CHIRP_IDS.map((id) => ({ dosya: `chirp_${id}.wav`, ses: 'pufiChirp', opts: { id }, sure: 1.0 }))
];

// ---------- --check: manifest ↔ disk (yeniden render yok — export-art deseni) ----------
if (CHECK) {
  if (!existsSync(manifestPath)) { console.error('HATA: content/audio/manifest.json yok — önce üretin.'); process.exit(1); }
  const man = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let bozuk = 0;
  for (const e of man.dosyalar) {
    const p = join(audioDir, e.dosya);
    if (!existsSync(p)) { bozuk++; console.error(`  EKSİK ${e.dosya}`); continue; }
    const buf = readFileSync(p);
    if (sha256(buf) !== e.sha256 || buf.length !== e.bayt) { bozuk++; console.error(`  FARKLI ${e.dosya}`); }
    else console.log(`  ok    ${e.dosya}`);
  }
  if (bozuk) { console.error(`SONUÇ: ${bozuk} dosya manifest ile uyumsuz — yeniden üretin: node tools/export-audio.mjs`); process.exit(1); }
  console.log(`SONUÇ: ses ihracı manifest ile tutarlı (${man.dosyalar.length} dosya).`);
  process.exit(0);
}

// ---------- render ----------
const audioSrc = readFileSync(join(repo, 'prototype', 'js', 'audio.js'), 'utf8');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM, headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const dosyalar = [];
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><title>yuvo-audio</title>');

  for (const job of JOBS) {
    const res = await page.evaluate(async ({ src, ses, opts, sure, rate }) => {
      // Sabit tohumlu PRNG (mulberry32, tohum 42): noiseBuf + burst ofsetleri tekrarlanabilir
      const gercekRandom = Math.random;
      let seed = 42 >>> 0;
      Math.random = function () {
        seed = (seed + 0x6D2B79F5) >>> 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      try {
        const off = new OfflineAudioContext(1, Math.ceil(rate * (sure + 0.05)), rate);
        // audio.js'in canlı-bağlam beklentileri şimlenir (kaynak DEĞİŞMEZ):
        off.resume = () => Promise.resolve();
        Object.defineProperty(off, 'state', { get: () => 'running' });
        const fakeWin = { AudioContext: function () { return off; } };
        new Function('window', src)(fakeWin);
        const Y = fakeWin.Yuvo;
        Y.audio.unlock();
        Y.audio.play(ses, opts);
        const buf = await off.startRendering();
        const d = buf.getChannelData(0);
        // 16-bit PCM WAV kodla
        let peak = 0;
        for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
        const bytes = new ArrayBuffer(44 + d.length * 2);
        const v = new DataView(bytes);
        const wstr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
        wstr(0, 'RIFF'); v.setUint32(4, 36 + d.length * 2, true); wstr(8, 'WAVE');
        wstr(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
        wstr(36, 'data'); v.setUint32(40, d.length * 2, true);
        for (let i = 0; i < d.length; i++) {
          const s = Math.max(-1, Math.min(1, d[i]));
          v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        let bin = '';
        const u8 = new Uint8Array(bytes);
        for (let i = 0; i < u8.length; i += 0x8000) {
          bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        }
        return { b64: btoa(bin), peak, samples: d.length };
      } finally {
        Math.random = gercekRandom;
      }
    }, { src: audioSrc, ses: job.ses, opts: job.opts || null, sure: job.sure, rate: RATE });

    if (res.peak < 0.001) { console.error(`HATA: ${job.dosya} SESSİZ render edildi (peak ${res.peak}) — şim bozulmuş olabilir.`); process.exit(1); }
    const buf = Buffer.from(res.b64, 'base64');
    const dosya = `proof/${job.dosya}`;
    writeFileSync(join(audioDir, dosya), buf);
    dosyalar.push({
      dosya, ses: job.ses, opts: job.opts || null,
      sure: job.sure, ornekleme: RATE, peak: Math.round(res.peak * 1000) / 1000,
      bayt: buf.length, sha256: sha256(buf)
    });
    console.log(`  render ${job.dosya} (peak ${res.peak.toFixed(3)}, ${buf.length} B)`);
  }
} finally {
  await browser.close();
}

const manifest = {
  _meta: {
    uretici: 'tools/export-audio.mjs',
    not: 'ELLE DÜZENLEMEYİN — `node tools/export-audio.mjs` yeniden üretir. Render sabit tohumlu; baytlar Chromium sürümüne bağlı olabilir, --check manifest↔disk doğrular.',
    kapsam: 'v1 KANIT: çekirdek + ritüel doruk sesleri + 5 örnek pufiChirp (mono 16-bit 44,1 kHz WAV). Tam kapsam: docs/v2/07 §6.',
    adSozlesmesi: 'sfx_{sesAdi}[_varyant].wav · chirp_{pufiId}.wav — Unity ses varlığı adları bu sözleşmeyi izler; pufiChirp imzası kaynaktaki FNV-1a hash ile birebir.'
  },
  dosyalar
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`SONUÇ: ${dosyalar.length} WAV + manifest yazıldı (content/audio/).`);
