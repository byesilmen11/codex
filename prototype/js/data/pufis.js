/* Yuvo — Veri: nadirlik tablosu + Güneş Çayırı ailesi (31 Pufi). Sahip: engine ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.data = Yuvo.data || {};

  // simge: renk körlüğü için renk DIŞI nadirlik kodu (docs/10 §1 — desen+çerçeve+simge)
  Yuvo.data.RARITIES = {
    yaygin:    { ad:'Yaygın',     renk:'#9AA5B1', simge:'●', kabuk:1,  uretim:5,   oran:0.550 },
    azbulunur: { ad:'Az Bulunur', renk:'#58B368', simge:'▲', kabuk:2,  uretim:10,  oran:0.250 },
    nadir:     { ad:'Nadir',      renk:'#4FB8D8', simge:'◆', kabuk:4,  uretim:25,  oran:0.140 },
    destansi:  { ad:'Destansı',   renk:'#B266E8', simge:'★', kabuk:10, uretim:80,  oran:0.046 },
    efsanevi:  { ad:'Efsanevi',   renk:'#F2A61B', simge:'✹', kabuk:25, uretim:200, oran:0.009 },
    gizli:     { ad:'Gizli',      renk:'#5C4A9E', simge:'☾', kabuk:60, uretim:300, oran:0.005 }
  };

  // Kademe sıralaması (düşükten yükseğe) — pity karşılaştırmaları için.
  Yuvo.data.RARITY_ORDER = ['yaygin', 'azbulunur', 'nadir', 'destansi', 'efsanevi', 'gizli'];

  // 31 Pufi — adlar/türler/biyografiler docs/v2/02 §2.3 tablosundan birebir;
  // id/kind eşlemesi ARCHITECTURE.md'de sabit.
  Yuvo.data.PUFIS = [
    // Yaygın (12)
    { id:'cikcik',   ad:'Cikcik',   tur:'Civciv',               kind:'civciv',        rarity:'yaygin',    bio:'Horoz çırağı; güneşten önce ötmeye çalışır, hep esner' },
    { id:'pamus',    ad:'Pamuş',    tur:'Kuzu',                 kind:'kuzu',          rarity:'yaygin',    bio:'Bulutları koyun sanıp gökyüzüne "mee" der' },
    { id:'vizbiz',   ad:'Vızbız',   tur:'Bal arıcığı',          kind:'ari',           rarity:'yaygin',    bio:'Bütün çiçeklerin adresini bilir, kendi kovanını unutur' },
    { id:'molu',     ad:'Mölü',     tur:'Buzağı',               kind:'buzagi',        rarity:'yaygin',    bio:'Papatya koklamayı sever; her seferinde hapşırır' },
    { id:'gidak',    ad:'Gıdak',    tur:'Tavukçuk',             kind:'tavuk',         rarity:'yaygin',    bio:'Sürpriz yumurta görünce heyecandan gıdaklar' },
    { id:'badi',     ad:'Badi',     tur:'Ördek yavrusu',        kind:'ordek',         rarity:'yaygin',    bio:'Sıra olmayı hep şaşırır, hep en önde biter' },
    { id:'hophop',   ad:'Hophop',   tur:'Çekirge',              kind:'cekirge',       rarity:'yaygin',    bio:'Zıplayışlarını sayar, hep "üç"te kaybolur' },
    { id:'fistik',   ad:'Fıstık',   tur:'Yer sincabı',          kind:'sincap',        rarity:'yaygin',    bio:'Yanaklarında tohum saklar; yerini asla hatırlamaz' },
    { id:'boncuk',   ad:'Boncuk',   tur:'Uğur böceği',          kind:'ugurbocegi',    rarity:'yaygin',    bio:'Sırtındaki puanları sayarken uyuyakalır' },
    { id:'kivrik',   ad:'Kıvrık',   tur:'Solucancık',           kind:'solucan',       rarity:'yaygin',    bio:'Toprak altı tünellerin haritasını çizer' },
    { id:'toprik',   ad:'Toprik',   tur:'Tarla faresi',         kind:'fare',          rarity:'yaygin',    bio:'Hasat şarkıları mırıldanır' },
    { id:'cigdem',   ad:'Çiğdem',   tur:'Çayır çiçeği perisi',  kind:'peri',          rarity:'yaygin',    bio:'Sabah çiyinden kendine minicik taçlar yapar' },
    // Az Bulunur (9)
    { id:'pirpir',   ad:'Pırpır',   tur:'Kelebek',              kind:'kelebek',       rarity:'azbulunur', bio:'Her sabah kanat desenini değiştirir; ikisi asla eş olmaz' },
    { id:'zipzip',   ad:'Zıpzıp',   tur:'Yavru tavşan',         kind:'tavsan',        rarity:'azbulunur', bio:'Havuç değil çilek delisi; kimseye söylemeyin' },
    { id:'civil',    ad:'Cıvıl',    tur:'Serçe',                kind:'serce',         rarity:'azbulunur', bio:'Her melodiyi ezberler — hep yanlış' },
    { id:'evcik',    ad:'Evcik',    tur:'Salyangoz',            kind:'salyangoz',     rarity:'azbulunur', bio:'Kabuğunu misafire açar, papatya çayı ikram eder' },
    { id:'dikenik',  ad:'Dikenik',  tur:'Kirpi',                kind:'kirpi',         rarity:'azbulunur', bio:'Sarılmayı çok ister; herkes uzaktan sarılır' },
    { id:'kosti',    ad:'Kösti',    tur:'Köstebek',             kind:'kostebek',      rarity:'azbulunur', bio:'Gözlüğünü toprakta unutur, yine de yolu bulur' },
    { id:'meke',     ad:'Meke',     tur:'Oğlak',                kind:'oglak',         rarity:'azbulunur', bio:'Kafa tokuşturmayı selamlaşma sanır' },
    { id:'findik',   ad:'Fındık',   tur:'Çoban köpeği yavrusu', kind:'kopek',         rarity:'azbulunur', bio:'Kuzular yerine kelebekleri güder' },
    { id:'kirinti',  ad:'Kırıntı',  tur:'Karınca',              kind:'karinca',       rarity:'azbulunur', bio:'Yüz kat büyük yük taşır; teşekkür bekler' },
    // Nadir (6)
    { id:'petek',    ad:'Petek',    tur:'Arı kraliçesi',        kind:'arikralice',    rarity:'nadir',     bio:'Baldan tacı güneşte parlar; Vızbız\'ın tek hatırladığı adres' },
    { id:'ibik',     ad:'İbik',     tur:'Horoz',                kind:'horoz',         rarity:'nadir',     bio:'Sesini sezonda bir kez tam ayarında bulur; o gün bayramdır' },
    { id:'yele',     ad:'Yele',     tur:'Midilli',              kind:'midilli',       rarity:'nadir',     bio:'Koşarken yelesinden altın toz savrulur' },
    { id:'makas',    ad:'Makas',    tur:'Kırlangıç',            kind:'kirlangic',     rarity:'nadir',     bio:'Kuyruğuyla bulutları ikiye böler' },
    { id:'tavus',    ad:'Tavus',    tur:'Tavuskuşu',            kind:'tavuskusu',     rarity:'nadir',     bio:'Kuyruğunu yalnızca içten bir iltifat duyunca açar' },
    { id:'ipekce',   ad:'İpekçe',   tur:'İpek örümceği',        kind:'orumcek',       rarity:'nadir',     bio:'Çayıra sabah çiyinden dantel örer' },
    // Destansı (2)
    { id:'bogac',    ad:'Boğaç',    tur:'Güneş buzağısı',       kind:'gunesbuzagisi', rarity:'destansi',  bio:'Boynuzları gün doğumu ışığı saçar; kışın çayırı o ısıtır' },
    { id:'safak',    ad:'Şafak',    tur:'Altın tarlakuşu',      kind:'tarlakusu',     rarity:'destansi',  bio:'Sabahı onun şarkısı getirir; geç kalkarsa sis basar' },
    // Efsanevi (1)
    { id:'gundogan', ad:'Gündoğan', tur:'Güneş kuşu',           kind:'guneskusu',     rarity:'efsanevi',  bio:'Kanat çırpınca altın polen yağar; adanın ilk sabahının şarkısını hatırlayan tek Pufi' },
    // Gizli (1)
    { id:'hisir',    ad:'Hışır',    tur:'Korkuluk Pufisi',      kind:'korkuluk',      rarity:'gizli',     bio:'Herkes onu cansız sanır; ay ışığında tek başına dans eder' }
  ];

  // Yardımcı: id → Pufi kaydı (bulunamazsa null).
  Yuvo.data.pufiById = function (id) {
    var list = Yuvo.data.PUFIS;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  };

  // Yardımcı: kademe rank'ı (yaygin=0 … gizli=5); bilinmeyen → -1.
  Yuvo.data.rarityRank = function (rarity) {
    return Yuvo.data.RARITY_ORDER.indexOf(rarity);
  };
})();
