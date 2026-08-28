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

  Y.audio.play = function (name) {
    try {
      if (!ctx || !master || !noiseBuf) return;
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      var fn = SOUNDS[name];
      if (!fn) return;
      fn(ctx.currentTime + 0.01);
    } catch (e) { /* sessiz */ }
  };
})();
