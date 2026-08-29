/* =====================================================================
   YUVO — Mağaza verisi (docs/v2/05-magaza-ve-yumurta-paketleri.md §1-§2)
   =====================================================================
   DEMO: Bu prototipte gerçek ödeme YOKTUR. Paketler simülasyondur;
   satın alma yalnız Kiler'e yumurta ekler (buyPack → state.kiler).
   Çocuk arayüzü bu dosyadaki hiçbir veriyi GÖRMEZ — yalnız ebeveyn
   paneli (js/scenes/parent.js) okur. Dilek Kavanozu fiyat göstermez.
   ===================================================================== */
(function () {
  'use strict';
  var Y = window.Yuvo = window.Yuvo || { data:{}, art:{}, audio:{}, engine:{}, scenes:{}, test:{} };
  Y.data = Y.data || {};

  /* ---------- Paket merdiveni (v2·05 §1.2 — birim fiyat ₺9,99 → ₺2,00) ---------- */
  Y.data.PACKS = [
    { id:'tekli', ad:'Çıtlat Bakalım', adet:1, tl:9.99, usd:0.49,
      garanti:'Standart oranlar', garantiKisa:'—',
      persona:'"Bir kere deneyelim" — dürtü alt sınırı, merdivenin çapası' },
    { id:'cep', ad:'Cep Sepeti', adet:5, tl:24.99, usd:0.99,
      garanti:'En az 1 Az Bulunur', garantiKisa:'1 Az Bulunur',
      persona:'Haftalık harçlık — küçük ödül anı' },
    { id:'haftalik', ad:'Haftalık Sepet', adet:10, tl:39.99, usd:1.99,
      garanti:'En az 1 Nadir + kopya koruması', garantiKisa:'1 Nadir',
      persona:'"Her cumartesi" ritüeli', populer:true },
    { id:'kesif', ad:'Keşif Kolisi', adet:25, tl:79.99, usd:3.99,
      garanti:'En az 3 Nadir', garantiKisa:'3 Nadir',
      persona:'Karne / ara ödül' },
    { id:'kasa', ad:'Koleksiyoncu Kasası', adet:50, tl:129.99, usd:5.99,
      garanti:'En az 1 Destansı + 5 Nadir', garantiKisa:'1 Destansı',
      persona:'Doğum günü hediyesi' },
    { id:'kumbara', ad:'Sezon Kumbarası', adet:100, tl:199.99, usd:8.99,
      garanti:'1 seçmeli parça + 2 Destansı + 10 Nadir', garantiKisa:'Seçmeli parça',
      persona:'Bayram / büyük hediye' }
  ];

  Y.data.CLUB = {
    ad:'Yuvo Club', fiyat:79.99, bonusYuzde:10, gunlukYumurta:1, kilerEk:1,
    ozet:'Her pakette +%10 bonus yumurta · günde 1 Club yumurtası · kilerden +1 açma hakkı'
  };

  /* ---------- Şeffaflık Kartı (v2·05 §2.2) ----------
     Oranlar Yuvo.data.RARITIES ile birebir; Efsanevi satırı "vaat olarak
     satılmaz" ilkesini taşır (hiçbir pakette Efsanevi garantisi/seçimi yok). */
  Y.data.ODDS = [
    { ad:'Yaygın',      oran:'%55',   garanti:'—' },
    { ad:'Az Bulunur',  oran:'%25',   garanti:'5\'li ve üzeri: en az 1' },
    { ad:'Nadir',       oran:'%14',   garanti:'10\'lu ve üzeri: en az 1' },
    { ad:'Destansı',    oran:'%4,6',  garanti:'50\'li ve üzeri: en az 1' },
    { ad:'Efsanevi',    oran:'%0,9 + kötü şans koruması', garanti:'Vaat olarak SATILMAZ',
      satilmaz:true },
    { ad:'Gizli Pufi',  oran:'%0,5',  garanti:'Hiçbir pakette garanti yok — saf sürpriz' }
  ];

  Y.data.ODDS_NOTLAR = [
    'Kopya koruması: aynı parçanın tekrar gelme olasılığı her kopyada düşer.',
    'Kötü şans koruması: 15 yumurtada Nadir çıkmazsa 16.\'da garantidir.',
    'Efsanevi vaat olarak satılmaz — hiçbir pakette Efsanevi garantisi veya seçimi yoktur; ' +
      'her yumurta (kazanılmış ya da satın alınmış) aynı oranı ve aynı kötü şans korumasını taşır.'
  ];

  Y.data.DEMO_UYARI = 'DEMO — gerçek ödeme alınmaz';

  Y.data.STORE_LIMITS = {
    varsayilanAylik: 400,
    secenekler: [0, 100, 400, 750, 1500],
    yumusakOnayEsigi: 750,      // üstünde "emin misiniz?" onayı
    sogumaSaat: 24,             // limit ARTIRIMI bu süre sonra etkin olur
    kilerGunluk: 5              // Club ile +1
  };

  /* ---------- Yardımcılar ---------- */
  Y.data.packById = function (id) {
    var P = Y.data.PACKS, i;
    for (i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
    return null;
  };
  Y.data.tlYaz = function (n) {
    n = Math.round((Number(n) || 0) * 100) / 100;
    return '₺' + n.toFixed(2).replace('.', ',');
  };
  Y.data.birimFiyat = function (p) {
    if (!p || !p.adet) return '';
    return Y.data.tlYaz(p.tl / p.adet);
  };
  // Club bonusu: eksik teslim etmemek için yukarı yuvarlanır (10 → 11, 25 → 28).
  Y.data.clubBonusAdet = function (adet) {
    return Math.ceil((adet | 0) * (Y.data.CLUB.bonusYuzde / 100));
  };
})();
