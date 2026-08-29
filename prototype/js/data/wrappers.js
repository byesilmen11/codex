/* Yuvo — Veri: ambalaj serileri, açma araçları, ritüel sabitleri (docs/v2/06 §5.2).
   Sahip: engine ajanı. */
(function () {
  var Yuvo = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Yuvo.data = Yuvo.data || {};

  // Yuvo öz-markalı 6 ambalaj serisi (docs/v2/06 §2.b — Sezon 1).
  // B Seri Paneli sanatı bu palet/desenden türetilir; nadirlik ASLA kodlanmaz (§1.3).
  Yuvo.data.WRAPPER_SERIES = {
    gunesbahcesi:    { ad:'Güneş Bahçesi',      renk1:'#F6B93B', renk2:'#F8E3A1', desen:'papatya' },
    masalormani:     { ad:'Masal Ormanı',       renk1:'#2E6B3C', renk2:'#C9A94E', desen:'yaprak'  },
    sedefdalgalar:   { ad:'Sedef Dalgalar',     renk1:'#4FB8D8', renk2:'#EDE7F6', desen:'dalga'   },
    yildiztozu:      { ad:'Yıldız Tozu Gecesi', renk1:'#28356B', renk2:'#C7CBE8', desen:'yildiz'  },
    karisiltisi:     { ad:'Kar Işıltısı',       renk1:'#8FD3E8', renk2:'#FFFFFF', desen:'kristal' },
    senlikfenerleri: { ad:'Şenlik Fenerleri',   renk1:'#D9483B', renk2:'#F2C14E', desen:'fener'   }
  };
  Yuvo.data.WRAPPER_VARIANTS = 8;           // seri başına varyant sayısı

  // Açma araçları — saf kozmetik: oran/hız/ödüle asla dokunmaz (docs/v2/06 §2.d).
  Yuvo.data.TOOLS = {
    burgu:      { ad:'Temel Burgu',     ucretsiz:true },
    cekic:      { ad:'Tahta Çekiç',     ucretsiz:true },
    firlat:     { ad:'Salla-Fırlat',    ucretsiz:true },      // proto: baştan açık (D-kilidi simüle edilmez)
    sihir:      { ad:'Sihirli Dokunuş', otomatik:'destansi+' },
    sedefburgu: { ad:'Sedef Burgu',     kabuk:40 }            // oyunla kazanılan örnek kozmetik
  };

  // Ritüel sabitleri.
  Yuvo.data.RITUAL = {
    GOLDEN_ORAN:0.02, GOLDEN_HARD:40,       // proto demo değerleri (gerçek oyun: 1/250, pity 250)
    KUMBARA_ESIK:15, KUMBARA_GUNLUK:1,      // 15 çikolata = 1 bonus yumurta, günde 1
    ISIRIK:4, ISIRIK_YILDIZ:2, CIKOLATA_YILDIZ_TAVAN:40,
    SERIT:3, HIZLI_SERIT:1
  };
})();
