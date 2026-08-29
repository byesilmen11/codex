/* =====================================================================
   YUVO — Veri: Fısıltı Ormanı ailesi (31 Pufi — 12Y/9AB/6N/2D/1E+1G).
   Güneş Çayırı'nın (pufis.js) yapısal aynası; pufis.js'ten SONRA yüklenir.
   Havuz kuralı: gacha.js aktif biyoma göre filtreler; biome alanı olmayan
   eski kayıtlar çayır sayılır (burada yine de geriye dönük damgalanır).
   ===================================================================== */
(function () {
  'use strict';
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.data = Yuvo.data || {};
  if (!Array.isArray(Yuvo.data.PUFIS)) return; // pufis.js yüklenmemişse dokunma

  // Biyom sözlüğü (UI adları + kilit kuralı)
  Yuvo.data.BIOMES = {
    cayir: { ad: 'Güneş Çayırı',   kilit: null },
    orman: { ad: 'Fısıltı Ormanı', kilit: 'Çayır albümünde 10 parça' }
  };

  // Geriye dönük: mevcut çayır kayıtlarını damgala
  for (var i = 0; i < Yuvo.data.PUFIS.length; i++) {
    if (!Yuvo.data.PUFIS[i].biome) Yuvo.data.PUFIS[i].biome = 'cayir';
  }

  var ORMAN = [
    // Yaygın (12)
    { id:'tostos',   ad:'Tostoş',   tur:'Yavru ayı',           kind:'ayicik',        rarity:'yaygin',    bio:'Bal kavanozunu kokusundan bulur; kapağını bir türlü açamaz' },
    { id:'mantus',   ad:'Mantuş',   tur:'Mantar cini',         kind:'mantarcin',     rarity:'yaygin',    bio:'Şapkası yağmurda büyür; onu gururla taşır' },
    { id:'tikirti',  ad:'Tıkırtı',  tur:'Ağaçkakan yavrusu',   kind:'agackakan',     rarity:'yaygin',    bio:'Ağaçlara tık tık selam verir; cevap bekler' },
    { id:'yosun',    ad:'Yosun',    tur:'Yosun topu',          kind:'yosuntopu',     rarity:'yaygin',    bio:'Yuvarlanarak gezer; durduğu yerde uyuyakalır' },
    { id:'purtuk',   ad:'Pürtük',   tur:'Kozalak pufisi',      kind:'kozalak',       rarity:'yaygin',    bio:'Cebinde çam fıstığı biriktirir; hepsi hep dökülür' },
    { id:'benek',    ad:'Benek',    tur:'Geyik yavrusu',       kind:'geyikyavru',    rarity:'yaygin',    bio:'Beneklerini yıldız sanır; her gece tek tek sayar' },
    { id:'fisfis',   ad:'Fısfıs',   tur:'Fısıltı böceği',      kind:'fisiltibocegi', rarity:'yaygin',    bio:'Kanatları fısıltı sesi çıkarır; bütün sırlar ona emanet' },
    { id:'zuzu',     ad:'Zuzu',     tur:'Yusufçuk',            kind:'yusufcuk',      rarity:'yaygin',    bio:'Cam kanatlarında bütün orman yansır' },
    { id:'pitpit',   ad:'Pıtpıt',   tur:'Kurbağacık',          kind:'kurbaga',       rarity:'yaygin',    bio:'Yağmur damlalarıyla ritim tutar' },
    { id:'kestane',  ad:'Kestane',  tur:'Kestane kirpisi',     kind:'kestanepufi',   rarity:'yaygin',    bio:'Dikenli kabuğunu yatak yapar; kimse inanmaz' },
    { id:'cizgi',    ad:'Çizgi',    tur:'Burunduk',            kind:'burunduk',      rarity:'yaygin',    bio:'Yanağında üç fındık, aklında dört uyku' },
    { id:'mismis',   ad:'Mışmış',   tur:'Uyur fare',           kind:'uyurfare',      rarity:'yaygin',    bio:'Her mevsimi kış sanır; esneyerek selam verir' },
    // Az Bulunur (9)
    { id:'puhu',     ad:'Puhu',     tur:'Baykuş yavrusu',      kind:'baykus',        rarity:'azbulunur', bio:'Gündüz bir türlü uyuyamaz — her şeyi merak eder' },
    { id:'kizil',    ad:'Kızıl',    tur:'Tilki yavrusu',       kind:'tilki',         rarity:'azbulunur', bio:'Saklambaçta kuyruğu hep ele verir' },
    { id:'pofur',    ad:'Pofur',    tur:'Porsuk',              kind:'porsuk',        rarity:'azbulunur', bio:'Yer altı kilerinde herkese bir raf ayırır' },
    { id:'semsi',    ad:'Şemsi',    tur:'Yarasa yavrusu',      kind:'yarasa',        rarity:'azbulunur', bio:'Gündüzü hiç görmedi; çok merak ediyor' },
    { id:'pufla',    ad:'Pufla',    tur:'Rakun yavrusu',       kind:'rakun',         rarity:'azbulunur', bio:'Her şeyi derede yıkar; şekerini de yıkadı, hâlâ üzgün' },
    { id:'cini',     ad:'Cini',     tur:'Ateşböceği',          kind:'atesbocegi',    rarity:'azbulunur', bio:'Fenerini kapatmayı unutur; orman ona "harita" der' },
    { id:'huthut',   ad:'Hüthüt',   tur:'İbibik kuşu',         kind:'ibibik',        rarity:'azbulunur', bio:'Tarağını kimseyle paylaşmaz ama herkesi tarar' },
    { id:'topak',    ad:'Topak',    tur:'Su samuru yavrusu',   kind:'susamuru',      rarity:'azbulunur', bio:'Göbeğinde çakıl koleksiyonu taşır; en parlağı sana ayırdı' },
    { id:'mirra',    ad:'Mırra',    tur:'Vaşak yavrusu',       kind:'vasak',         rarity:'azbulunur', bio:'Kulak püskülleriyle (kendince) radyo çeker' },
    // Nadir (6)
    { id:'golge',    ad:'Gölge',    tur:'Gece kelebeği',       kind:'gecekelebegi',  rarity:'nadir',     bio:'Ay ışığını kanatlarında taşır; karanlık ondan korkar' },
    { id:'recine',   ad:'Reçine',   tur:'Kehribar böceği',     kind:'kehribarbocegi',rarity:'nadir',     bio:'Damlayan güneş ışığını şekerleme sanıp sırtında saklar' },
    { id:'boynuz',   ad:'Boynuz',   tur:'Genç geyik',          kind:'geyik',         rarity:'nadir',     bio:'Boynuzlarında kuşlar mola verir; o da sabırla bekler' },
    { id:'flut',     ad:'Flüt',     tur:'Bülbül',              kind:'bulbul',        rarity:'nadir',     bio:'En güzel şarkısını yalnız ay dinlerken söyler' },
    { id:'sarmasik', ad:'Sarmaşık', tur:'Orman perisi',        kind:'ormanperi',     rarity:'nadir',     bio:'Saçları sarmaşıktan; her sabah taze çiçek takar' },
    { id:'puskul',   ad:'Püskül',   tur:'Çam samuru',          kind:'camsamuru',     rarity:'nadir',     bio:'Daldan dala uçuşunu bütün orman alkışlar' },
    // Destansı (2)
    { id:'mese',     ad:'Meşe',     tur:'Yürüyen meşe fidanı', kind:'mesecani',      rarity:'destansi',  bio:'Kökleriyle yürür. Durduğu yerde orman büyür!' },
    { id:'simsim',   ad:'Şimşim',   tur:'Işıl geyiği',         kind:'isilgeyik',     rarity:'destansi',  bio:'Boynuzları gece feneridir. Kaybolan herkes yolunu onunla bulur.' },
    // Efsanevi (1)
    { id:'bilge',    ad:'Bilge',    tur:'Orman ruhu baykuşu',  kind:'bilgebaykus',   rarity:'efsanevi',  bio:'Ormanın bütün fısıltılarını ezbere bilir. İlk tohumun düştüğü günü hatırlayan tek Pufi!' },
    // Gizli (1)
    { id:'kutuk',    ad:'Kütük',    tur:'Kütük Pufisi',        kind:'kutukpufi',     rarity:'gizli',     bio:'Herkes onu devrik bir kütük sanır. Mantarlar şapkasında parti verir!' }
  ];

  for (var j = 0; j < ORMAN.length; j++) {
    ORMAN[j].biome = 'orman';
    Yuvo.data.PUFIS.push(ORMAN[j]);
  }
})();
