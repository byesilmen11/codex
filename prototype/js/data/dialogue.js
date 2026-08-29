/* =====================================================================
   YUVO — Replik havuzları (docs/v2/03 §5.3 ses tonu kılavuzundan)
   =====================================================================
   Kısa, sesli okunabilir, okuma bilmeyene ebeveyn okur varsayımıyla.
   Pofu KELİMESİZ (ses/animasyon karakteri) — burada repliği yok.
   Kullanım: Yuvo.dialog.say({ kim:'kiki', metin: D.kiki.karsilama[i] })
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Y.data = Y.data || {};

  Y.data.DIALOG = {
    // Anlatıcı — yalnız FTUE açılışında konuşur (2 cümle, sonra susar)
    anlatici: {
      giris: [
        'Ovalya’nın renkleri uyuyor.',
        'Onları yalnızca sen uyandırabilirsin, Yumurta Bekçisi.'
      ]
    },

    kiki: {
      ad: 'Kiki',
      albumHediye: [
        'Bu senin albümün! Her sayfa bir aile.',
        'Bak — ilk kartın yerine yapıştı bile. Kalanlar da seni bekliyor!'
      ],
      karsilama: [
        'Tamam tamam tamam — bugün üç işimiz var: yumurta, yumurta ve… dur, listeme bakayım… YUMURTA!',
        'Çayır dedi ki — yani demedi de, çayırlar konuşmaz ama konuşsaydı KESİN derdi ki — bugün harika görünüyorsun!'
      ],
      sakoIpucu: [
        'Şako mu? Yaramazdır, evet. Ama bak, tüy bırakmış. İz bırakıyorsa, bulunmak istiyordur.'
      ],
      ormanAcilis: [
        'Sisli kapı açıldı! Fısıltı Ormanı’nda yepyeni bir aile yaşıyormuş — hadi bakalım!'
      ],
      gunSonu: [
        'Bugünlük bu kadar! Yarını söylersem sürpriz olmaz ki. Sadece şunu diyeyim: erken gel!'
      ]
    },

    luna: {
      ad: 'Luna',
      ninni: [
        'Şşş… duydun mu? Yumurtalar da rüya görür.',
        'Albümünü kapat, gözlerini de. Renkler bu gece senin rüyanda dinlensin. Yarın… çıt.'
      ],
      teselli: [
        'Gece grilik daha koyu görünür, biliyorum. Ama yıldızları gündüz göremezsin.'
      ]
    },

    ustakabuk: {
      ad: 'Usta Kabuk',
      sabir: [
        'Acele eden yumurta… yok öyle bir şey. Yumurtalar acele etmez. Biz de etmeyelim.',
        'Kopyalar çöp değildir, küçük bekçi. Sabrın kabuğudur onlar.'
      ]
    },

    sako: {
      ad: 'Şako',
      saklambac: [
        'Parlak şeyler parlak olanlara gider. Kural bu. Kuralı ben koydum.',
        'Fena değilsin… bir bekçiye göre. Yarın aynı saatte? Yani — istersen. Bana ne.'
      ],
      kaybetti: [
        'Buldun demek. Şans. Kesinlikle şans. …Bir daha oynayalım mı?'
      ]
    }
  };
})();
