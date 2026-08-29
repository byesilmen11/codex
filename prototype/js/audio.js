/* Yuvo — audio.js (art-audio ajanı)
   WebAudio sentez, dosyasız. Ses yoksa / başlatılamazsa SESSİZCE çalışır, asla hata fırlatmaz.
   Crack'ler: filtreli noise burst + pitch düşüşü (ASMR). Fanfarlar: pentatonik arpej.
   docs/10: yumuşak zarflar, ses seviyesi sıçraması yok, çan/klakson yok. */
(function () {
  window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  var Y = window.Yuvo;
  Y.audio = Y.audio || {};

  var ctx = null, master = null, noiseBuf = null, failed = false;

  Y.audio.unlock = function () {
    if (failed) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { failed = true; return; }
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
        var len = Math.max(1, Math.floor(ctx.sampleRate * 1.2));
        noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
        var d = noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    } catch (e) { ctx = null; master = null; noiseBuf = null; failed = true; }
  };

  /* tek ton: osc + yumuşak zarf; glide ile pitch kayması */
  function tone (t0, dur, f0, o) {
    o = o || {};
    var osc = ctx.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(1, f0), t0);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.glide), t0 + dur * (o.glideT || 1));
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.16, t0 + (o.att || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  /* filtreli noise burst; f0→f1 pitch düşüşü (ASMR çıtırtısı) */
  function burst (t0, dur, o) {
    o = o || {};
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = o.ftype || 'bandpass';
    f.Q.value = o.q || 1.1;
    f.frequency.setValueAtTime(Math.max(1, o.f0 || 2000), t0);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t0 + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t0 + (o.att || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(master);
    var maxOff = Math.max(0.01, noiseBuf.duration - dur - 0.05);
    src.start(t0, Math.random() * maxOff, dur + 0.05);
  }

  /* Do-majör pentatonik (C5'ten): sıcak, çocuksu arpej malzemesi */
  var PENT = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

  var SOUNDS = {
    tap: function (t) {
      tone(t, 0.07, 540, { glide: 470, gain: 0.11 });
    },
    crack1: function (t) {
      burst(t, 0.09, { f0: 2600, f1: 1100, gain: 0.2 });
      tone(t, 0.04, 1700, { type: 'triangle', glide: 1200, gain: 0.06, att: 0.003 });
    },
    crack2: function (t) {
      burst(t, 0.08, { f0: 2200, f1: 900, gain: 0.22 });
      burst(t + 0.07, 0.1, { f0: 1800, f1: 700, gain: 0.19 });
      tone(t, 0.05, 1400, { type: 'triangle', glide: 900, gain: 0.07, att: 0.003 });
    },
    crackBig: function (t) {
      burst(t, 0.12, { f0: 2400, f1: 600, gain: 0.26 });
      burst(t + 0.08, 0.16, { ftype: 'lowpass', f0: 1600, f1: 350, gain: 0.28, q: 0.8 });
      burst(t + 0.18, 0.2, { ftype: 'lowpass', f0: 900, f1: 220, gain: 0.24, q: 0.7 });
      tone(t + 0.05, 0.25, 240, { glide: 130, gain: 0.11 });
    },
    pop: function (t) {
      tone(t, 0.12, 300, { glide: 900, glideT: 0.6, gain: 0.18, att: 0.005 });
      burst(t, 0.03, { f0: 3200, gain: 0.09 });
    },
    chime: function (t) {
      tone(t, 0.6, 880, { gain: 0.11, att: 0.015 });
      tone(t + 0.02, 0.7, 1318.5, { gain: 0.07, att: 0.02 });
    },
    click: function (t) {
      tone(t, 0.035, 900, { type: 'triangle', gain: 0.08, att: 0.002 });
    },
    snap: function (t) { // parça yerine oturdu
      tone(t, 0.05, 620, { type: 'square', glide: 520, gain: 0.1, att: 0.002 });
      burst(t, 0.025, { ftype: 'highpass', f0: 2500, gain: 0.11 });
    },
    fanfare: function (t) { // tier2: kısa pentatonik arpej
      var seq = [PENT[0], PENT[2], PENT[3], PENT[5]];
      for (var i = 0; i < seq.length; i++) {
        tone(t + i * 0.09, 0.32, seq[i], { type: 'triangle', gain: 0.13, att: 0.012 });
      }
      tone(t + 0.32, 0.5, PENT[5], { gain: 0.05, att: 0.02 });
    },
    fanfareBig: function (t) { // tier3: iki oktavlı arpej + akor + parıltı
      var seq = [392.0, PENT[0], PENT[1], PENT[2], PENT[3], PENT[4], PENT[5]];
      for (var i = 0; i < seq.length; i++) {
        tone(t + i * 0.085, 0.3, seq[i], { type: 'triangle', gain: 0.12, att: 0.012 });
      }
      tone(t + 0.62, 0.8, PENT[3], { gain: 0.09, att: 0.02 });
      tone(t + 0.62, 0.8, PENT[5], { gain: 0.07, att: 0.02 });
      tone(t + 0.62, 0.8, 1567.98, { gain: 0.05, att: 0.02 });
      burst(t + 0.6, 0.7, { ftype: 'highpass', f0: 5000, gain: 0.045, att: 0.05, q: 0.7 });
    },
    star: function (t) { // ⭐ kazanımı
      tone(t, 0.16, 1568, { glide: 2093, glideT: 0.7, gain: 0.11, att: 0.006 });
      tone(t + 0.06, 0.18, 2093, { gain: 0.06, att: 0.01 });
    },
    page: function (t) { // albüm sayfası hışırtısı
      burst(t, 0.13, { ftype: 'lowpass', f0: 1000, f1: 300, gain: 0.15, q: 0.5 });
    }
  };

  /* ===================================================================
     RİTÜEL SESLERİ (v2·06 §5.6, art-audio EK) — mevcut sesler ve play()
     deseni aynen korunur; opts yalnız yeni seslerin ince ayarı içindir.
     =================================================================== */

  SOUNDS.foilTear = function (t) { // şerit "cırt" — her çağrıda pitch varyasyonu
    var p = 0.85 + Math.random() * 0.4;
    burst(t, 0.12, { f0: 3400 * p, f1: 1000 * p, gain: 0.22, q: 1.4 });
    burst(t + 0.05, 0.09, { f0: 2400 * p, f1: 800 * p, gain: 0.16 });
    tone(t, 0.05, 1900 * p, { type: 'triangle', glide: 900 * p, gain: 0.05, att: 0.003 });
  };
  SOUNDS.crinkle = function (t) { // tek atımlık kısa doku (sürekli: crinkleStart/Level/Stop)
    for (var i = 0; i < 4; i++) {
      burst(t + i * 0.045 + Math.random() * 0.015, 0.05,
        { f0: 2200 + Math.random() * 1600, f1: 1400, gain: 0.06 + Math.random() * 0.04, q: 2 });
    }
  };
  SOUNDS.shakeRattle = function (t, o) { // salla-dinle: aile parametreli tıkırtı (§2.a)
    var fam = (o && (o.family || o.aile)) || 'cayir';
    var i, det;
    burst(t, 0.045, { ftype: 'lowpass', f0: 900, f1: 400, gain: 0.1, q: 0.7 }); // kutu tok sesi
    if (fam === 'koy' || fam === 'su') {          // su şıpırtısı
      for (i = 0; i < 3; i++) tone(t + 0.05 + i * 0.1, 0.12, 1300 - i * 180, { glide: 620, gain: 0.07, att: 0.004 });
    } else if (fam === 'pofuduk' || fam === 'tuy') { // tüy hışırtısı
      for (i = 0; i < 3; i++) burst(t + 0.05 + i * 0.09, 0.09, { ftype: 'lowpass', f0: 700, f1: 320, gain: 0.1, q: 0.6 });
    } else if (fam === 'orman' || fam === 'yaprak') { // yaprak hışırtısı
      for (i = 0; i < 2; i++) burst(t + 0.05 + i * 0.12, 0.13, { f0: 1600, f1: 900, gain: 0.11, q: 0.7 });
    } else if (fam === 'buz') {                    // buz çınlaması
      tone(t + 0.05, 0.2, 3136, { gain: 0.05, att: 0.002 });
      tone(t + 0.16, 0.24, 3520, { gain: 0.045, att: 0.002 });
      tone(t + 0.17, 0.3, 5274, { gain: 0.02, att: 0.002 });
    } else if (fam === 'kanyon' || fam === 'kum') { // kum tıkırtısı
      for (i = 0; i < 6; i++) burst(t + 0.05 + i * 0.045, 0.02, { ftype: 'highpass', f0: 3800, gain: 0.06 + Math.random() * 0.03 });
    } else {                                       // çayır (varsayılan): çan-çıngıltı
      var seq = [1975.5, 2349.3, 2093, 2637];
      for (i = 0; i < 4; i++) {
        det = 1 + (Math.random() * 0.02 - 0.01);
        tone(t + 0.05 + i * 0.075, 0.16, seq[i] * det, { type: 'triangle', gain: 0.055, att: 0.002 });
      }
    }
  };
  SOUNDS.bite = function (t) { // "kıtır"
    burst(t, 0.05, { ftype: 'lowpass', f0: 1300, f1: 450, gain: 0.28, q: 0.7 });
    burst(t + 0.045, 0.06, { ftype: 'lowpass', f0: 950, f1: 320, gain: 0.22, q: 0.7 });
    tone(t, 0.06, 300, { type: 'triangle', glide: 180, gain: 0.08, att: 0.002 });
  };
  SOUNDS.mmm = function (t) { // minik tat mırıltısı — abartısız (§2.c)
    tone(t, 0.3, 196, { glide: 262, glideT: 0.55, gain: 0.085, att: 0.05 });
    tone(t, 0.3, 392, { glide: 523, glideT: 0.55, gain: 0.03, att: 0.05 });
    tone(t + 0.24, 0.24, 262, { glide: 220, gain: 0.06, att: 0.04 });
  };
  SOUNDS.jarClink = function (t) { // kumbara cam tıngırtısı
    tone(t, 0.22, 1865, { type: 'triangle', gain: 0.09, att: 0.002 });
    tone(t, 0.28, 2794, { gain: 0.045, att: 0.002 });
    tone(t + 0.09, 0.18, 2093, { type: 'triangle', gain: 0.05, att: 0.002 });
    burst(t, 0.02, { ftype: 'highpass', f0: 5000, gain: 0.05 });
  };
  SOUNDS.capsuleTwist = function (t) { // "gıc" — burgu sürtünmesi
    var p = 0.9 + Math.random() * 0.25;
    burst(t, 0.11, { f0: 420 * p, f1: 950 * p, gain: 0.13, q: 3.2 });
    tone(t, 0.11, 150 * p, { type: 'sawtooth', glide: 215 * p, gain: 0.045, att: 0.01 });
  };
  SOUNDS.capsulePop = function (t) { // doruk "POP!"
    tone(t, 0.14, 260, { glide: 1100, glideT: 0.5, gain: 0.22, att: 0.004 });
    burst(t, 0.04, { f0: 3600, gain: 0.12 });
    tone(t + 0.06, 0.3, 1568, { gain: 0.05, att: 0.01 });
    burst(t + 0.05, 0.25, { ftype: 'highpass', f0: 5200, gain: 0.04, att: 0.03, q: 0.7 });
  };
  SOUNDS.hammerTik = function (t) { // oyuncak çekiç "tık"
    tone(t, 0.045, 760, { type: 'triangle', glide: 640, gain: 0.12, att: 0.002 });
    burst(t, 0.03, { ftype: 'lowpass', f0: 1400, f1: 700, gain: 0.14, q: 0.8 });
  };
  SOUNDS.hammerKirt = function (t) { // üçüncü vuruş "KIRT!"
    burst(t, 0.1, { f0: 2100, f1: 700, gain: 0.24 });
    burst(t + 0.06, 0.14, { ftype: 'lowpass', f0: 1200, f1: 300, gain: 0.26, q: 0.7 });
    tone(t, 0.07, 520, { type: 'triangle', glide: 300, gain: 0.1, att: 0.003 });
    tone(t + 0.05, 0.18, 190, { glide: 120, gain: 0.09 });
  };
  SOUNDS.magicRise = function (t) { // sihirli dokunuş: yükselen parıltı
    tone(t, 1.0, 392, { glide: 784, glideT: 0.9, gain: 0.055, att: 0.15 });
    tone(t + 0.1, 0.95, 523.25, { glide: 1046.5, glideT: 0.9, gain: 0.05, att: 0.15 });
    tone(t + 0.2, 0.9, 659.25, { glide: 1318.5, glideT: 0.9, gain: 0.045, att: 0.15 });
    burst(t + 0.2, 0.8, { ftype: 'highpass', f0: 4500, gain: 0.04, att: 0.35, q: 0.7 });
    tone(t + 0.85, 0.35, 2093, { gain: 0.05, att: 0.01 });
  };
  SOUNDS.goldenFanfare = function (t) { // Altın Folyo — sıcak majör çıkış + çan
    var seq = [523.25, 659.25, 783.99, 1046.5, 1318.5], i;
    tone(t, 0.9, 130.8, { gain: 0.06, att: 0.02 });
    for (i = 0; i < seq.length; i++) {
      tone(t + i * 0.11, 0.34, seq[i], { type: 'triangle', gain: 0.12, att: 0.01 });
    }
    tone(t + 0.58, 0.85, 1568, { gain: 0.08, att: 0.015 });
    tone(t + 0.6, 0.85, 2093, { gain: 0.055, att: 0.015 });
    burst(t + 0.56, 0.7, { ftype: 'highpass', f0: 5500, gain: 0.045, att: 0.06, q: 0.7 });
  };
  SOUNDS.stampSlap = function (t) { // defter "şlap"
    burst(t, 0.06, { ftype: 'lowpass', f0: 900, f1: 250, gain: 0.28, q: 0.6 });
    burst(t, 0.03, { f0: 1800, f1: 900, gain: 0.13 });
    tone(t, 0.07, 220, { glide: 140, gain: 0.1, att: 0.003 });
    burst(t + 0.07, 0.09, { ftype: 'lowpass', f0: 1100, f1: 400, gain: 0.08, q: 0.6 }); // sayfa oturması
  };

  /* --- crinkle: SÜREKLİ folyo dokusu — parmak hızı gain/tını modüle eder --- */
  var crinkleN = null;
  Y.audio.crinkleStart = function () {
    try {
      if (!ctx || !master || !noiseBuf || crinkleN) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      var f = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 1.6;
      var g = ctx.createGain(); g.gain.value = 0.0001;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
      crinkleN = { src: src, f: f, g: g };
    } catch (e) { crinkleN = null; }
  };
  Y.audio.crinkleLevel = function (v) { // 0..1 (pointer hızı)
    try {
      if (!crinkleN || !ctx) return;
      v = Math.max(0, Math.min(1, +v || 0));
      var t = ctx.currentTime;
      crinkleN.g.gain.setTargetAtTime(0.0001 + v * 0.13, t, 0.03);
      crinkleN.f.frequency.setTargetAtTime(1700 + v * 2300, t, 0.05);
    } catch (e) { /* sessiz */ }
  };
  Y.audio.crinkleStop = function () {
    try {
      if (!crinkleN) return;
      var n = crinkleN; crinkleN = null;
      if (!ctx) return;
      var t = ctx.currentTime;
      n.g.gain.setTargetAtTime(0.0001, t, 0.05);
      n.src.stop(t + 0.4);
    } catch (e) { crinkleN = null; }
  };

  Y.audio.play = function (name, opts) {
    try {
      if (!ctx || !master || !noiseBuf) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var fn = SOUNDS[name];
      if (!fn) return;
      fn(ctx.currentTime + 0.01, opts);
    } catch (e) { /* sessiz */ }
  };
})();
