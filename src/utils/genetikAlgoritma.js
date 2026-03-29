import { konuSuresiHesapla } from "./hesaplamalar";

// Array'i karıştırır
export function arrayKaristir(array) {
  const yeniArray = [...array];
  for (let i = yeniArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [yeniArray[i], yeniArray[j]] = [yeniArray[j], yeniArray[i]];
  }
  return yeniArray;
}

// Dersleri düz liste haline getirir (sınav tarihine göre sıralı)
function dersleriDuzListeYap(dersler) {
  const konuListesi = [];

  // Önce sınav tarihine göre sırala
  const siraliDersler = [...dersler].sort((a, b) => {
    if (a.sinavTarihi && b.sinavTarihi) {
      const tarihFarki = new Date(a.sinavTarihi) - new Date(b.sinavTarihi);
      if (tarihFarki === 0) {
        const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
        return zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi];
      }
      return tarihFarki;
    }
    if (a.sinavTarihi && !b.sinavTarihi) return -1;
    if (!a.sinavTarihi && b.sinavTarihi) return 1;
    const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
    return zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi];
  });

  // Konuları düz listeye çevir
  siraliDersler.forEach((ders) => {
    ders.konular.forEach((konu) => {
      if (!konu.bitti) {
        konuListesi.push({
          dersAdi: ders.dersAdi,
          konuAdi: konu.ad,
          zorluk: ders.zorlukSeviyesi,
          sure: konuSuresiHesapla(ders.zorlukSeviyesi),
          sinavTarihi: ders.sinavTarihi,
        });
      }
    });
  });

  return konuListesi;
}

// ============================================
// PLAN ÜRETİMİ
// ============================================

export function rastgelePlanUret(dersler, secilenGunler, saatSayisi) {
  // Dersleri düz listeye çevir (ZATEN SIRALI!)
  const konuListesi = dersleriDuzListeYap(dersler);

  // Konuları KARIŞTIR (Rastgelelik buradan geliyor)
  const karisikKonular = arrayKaristir(konuListesi);

  // Boş plan oluştur
  const plan = secilenGunler.map((gun) => ({
    gun: gun,
    dersler: [],
    kalanSaat: saatSayisi,
  }));

  // Konuları günlere yerleştir
  karisikKonular.forEach((konu) => {
    let konuSaati = konu.sure;

    while (konuSaati > 0) {
      // Müsait günleri bul
      const musaitGunler = plan.filter((g) => g.kalanSaat > 0);

      if (musaitGunler.length === 0) break; // Yer kalmadı

      // Rastgele bir gün seç
      const rastgeleGun =
        musaitGunler[Math.floor(Math.random() * musaitGunler.length)];

      // Eklenecek saati hesapla
      const eklenecekSaat = Math.min(konuSaati, rastgeleGun.kalanSaat);

      // Derse ekle
      rastgeleGun.dersler.push({
        dersAdi: konu.dersAdi,
        konuAdi: konu.konuAdi,
        zorluk: konu.zorluk,
        sure: eklenecekSaat,
      });

      rastgeleGun.kalanSaat -= eklenecekSaat;
      konuSaati -= eklenecekSaat;
    }
  });

  // kalanSaat bilgisini kaldır, sadece gun ve dersler kalsın
  return plan.map((g) => ({ gun: g.gun, dersler: g.dersler }));
}

// ============================================
// CEZA SİSTEMİ
// ============================================

export function planPuanla(plan, dersler) {
  let toplamCeza = 0;

  // Konu listesini al
  const konuListesi = dersleriDuzListeYap(dersler);

  // ============================================
  // CEZA 1 (ÖLÜMCÜL): EKSİK/FAZLA KONU CEZASI
  // ============================================
  const hedefDersSaatleri = {};
  konuListesi.forEach((k) => {
    const key = `${k.dersAdi} - ${k.konuAdi}`;
    hedefDersSaatleri[key] = (hedefDersSaatleri[key] || 0) + k.sure;
  });

  const plandakiDersSaatleri = {};
  plan.forEach((g) => {
    g.dersler.forEach((d) => {
      const key = `${d.dersAdi} - ${d.konuAdi}`;
      plandakiDersSaatleri[key] = (plandakiDersSaatleri[key] || 0) + d.sure;
    });
  });

  // Her konuyu tek tek kontrol et
  Object.keys(hedefDersSaatleri).forEach((key) => {
    const hedef = hedefDersSaatleri[key];
    const plandaki = plandakiDersSaatleri[key] || 0;

    if (plandaki < hedef) {
      toplamCeza += (hedef - plandaki) * 1000; // Eksik varsa ÖLÜMCÜL CEZA
    } else if (plandaki > hedef) {
      toplamCeza += (plandaki - hedef) * 1000; // Fazla varsa ÖLÜMCÜL CEZA
    }
  });

  // ============================================
  // CEZA 2: ZOR DERSİ GÜNÜN SONUNA KOYMA (+50)
  // ============================================
  plan.forEach((gunPlani) => {
    if (gunPlani.dersler.length > 0) {
      const sonDers = gunPlani.dersler[gunPlani.dersler.length - 1];
      if (sonDers.zorluk === "zor") {
        toplamCeza += 50;
      }
    }
  });

  // ============================================
  // CEZA 3: AYNI GÜN ARKA ARKAYA ZOR DERS (+60)
  // ============================================
  plan.forEach((gunPlani) => {
    for (let i = 0; i < gunPlani.dersler.length - 1; i++) {
      if (
        gunPlani.dersler[i].zorluk === "zor" &&
        gunPlani.dersler[i + 1].zorluk === "zor"
      ) {
        toplamCeza += 60;
      }
    }
  });

  // ============================================
  // CEZA 4: ARKA ARKAYA AYNI DERS (Günden güne) (+30)
  // ============================================
  for (let i = 0; i < plan.length - 1; i++) {
    const bugunDersler = plan[i].dersler.map((d) => d.dersAdi);
    const yarinDersler = plan[i + 1].dersler.map((d) => d.dersAdi);

    bugunDersler.forEach((ders) => {
      if (yarinDersler.includes(ders)) {
        toplamCeza += 30;
      }
    });
  }

  // ============================================
  // CEZA 5: GÜNLÜK YÜK DENGESİZLİĞİ (fark × 15)
  // ============================================
  if (plan.length > 0) {
    const gunlukSaatler = plan.map((g) =>
      g.dersler.reduce((sum, d) => sum + d.sure, 0),
    );

    const fark = Math.max(...gunlukSaatler) - Math.min(...gunlukSaatler);
    if (fark > 0) {
      toplamCeza += fark * 15;
    }
  }

  // ============================================
  // CEZA 6: AYNI DERSİN 3+ GÜN ÜST ÜSTE GELMESİ (maxArdArda × 40)
  // ============================================
  const dersGunleri = {};
  plan.forEach((gunPlani, index) => {
    const benzersizDersler = [
      ...new Set(gunPlani.dersler.map((d) => d.dersAdi)),
    ];
    benzersizDersler.forEach((dersAdi) => {
      if (!dersGunleri[dersAdi]) dersGunleri[dersAdi] = [];
      dersGunleri[dersAdi].push(index);
    });
    return toplamCeza;
  });

  // ============================================
  // CEZA 7: BİR GÜNE AYNI DERSTEN AŞIRI YÜKLENME (Örn: Max 2 saat kuralı)
  // ============================================
  plan.forEach((gunPlani) => {
    const gunlukDersSaatleri = {};

    // O günkü derslerin toplam sürelerini hesapla
    gunPlani.dersler.forEach((d) => {
      gunlukDersSaatleri[d.dersAdi] =
        (gunlukDersSaatleri[d.dersAdi] || 0) + d.sure;
    });

    // Eğer bir ders o gün 2 saatten fazla çalışılmışsa ceza ver!
    // (İstersen bu 2 rakamını 3 yapabilirsin, sana bağlı)
    Object.keys(gunlukDersSaatleri).forEach((ders) => {
      if (gunlukDersSaatleri[ders] > 3) {
        const asimMiktari = gunlukDersSaatleri[ders] - 3;
        toplamCeza += asimMiktari * 300; // Aştığı her saat için 300 ağır ceza!
      }
    });
  });

  Object.values(dersGunleri).forEach((gunIndexleri) => {
    if (gunIndexleri.length >= 3) {
      gunIndexleri.sort((a, b) => a - b);
      let ardArdaSayisi = 1;
      let maxArdArda = 1;

      for (let i = 1; i < gunIndexleri.length; i++) {
        if (gunIndexleri[i] === gunIndexleri[i - 1] + 1) {
          ardArdaSayisi++;
          maxArdArda = Math.max(maxArdArda, ardArdaSayisi);
        } else {
          ardArdaSayisi = 1;
        }
      }

      if (maxArdArda >= 3) {
        toplamCeza += maxArdArda * 40;
      }
    }
  });

  return toplamCeza;
}

// ============================================
// GENETİK OPERATÖRLER
// ============================================

// ÇAPRAZLAMA (Crossover) - İYİLEŞTİRİLMİŞ VERSİYON
function caprazlama(annePlan, babaPlan) {
  const cocukPlan = [];
  const kesimNoktasi = Math.floor(annePlan.length / 2);

  // İlk yarı anneden, ikinci yarı babadan
  for (let i = 0; i < annePlan.length; i++) {
    if (i < kesimNoktasi) {
      cocukPlan.push(JSON.parse(JSON.stringify(annePlan[i])));
    } else {
      cocukPlan.push(JSON.parse(JSON.stringify(babaPlan[i])));
    }
  }

  return cocukPlan;
}

// MUTASYON - DAHA ÇEŞİTLİ VERSİYON
function mutasyon(plan) {
  // %10 ihtimalle mutasyon
  if (Math.random() > 0.1) return plan;

  const yeniPlan = JSON.parse(JSON.stringify(plan)); // Derin kopya

  // Rastgele bir mutasyon tipi seç
  const mutasyonTipi = Math.floor(Math.random() * 2);

  if (mutasyonTipi === 0) {
    // TİP 1: Bir dersi başka güne taşı
    const kaynakGunIndex = Math.floor(Math.random() * yeniPlan.length);
    const hedefGunIndex = Math.floor(Math.random() * yeniPlan.length);

    if (yeniPlan[kaynakGunIndex].dersler.length > 0) {
      const dersIndex = Math.floor(
        Math.random() * yeniPlan[kaynakGunIndex].dersler.length,
      );
      const tasınanDers = yeniPlan[kaynakGunIndex].dersler.splice(
        dersIndex,
        1,
      )[0];
      yeniPlan[hedefGunIndex].dersler.push(tasınanDers);
    }
  } else {
    // TİP 2: İki günün derslerini yer değiştir
    const gun1 = Math.floor(Math.random() * yeniPlan.length);
    const gun2 = Math.floor(Math.random() * yeniPlan.length);

    [yeniPlan[gun1].dersler, yeniPlan[gun2].dersler] = [
      yeniPlan[gun2].dersler,
      yeniPlan[gun1].dersler,
    ];
  }

  return yeniPlan;
}

// ============================================
// EVRİM MOTORU (ANA FONKSİYON)
// ============================================

export function evrimiBaslat(
  dersler,
  secilenGunler,
  saatSayisi,
  populasyonBoyutu = 100,
  jenerasyonSayisi = 50,
) {
  console.log("\n🧬 GENETİK ALGORİTMA BAŞLIYOR...\n");

  // İLK POPÜLASYON
  let populasyon = [];
  for (let i = 0; i < populasyonBoyutu; i++) {
    const plan = rastgelePlanUret(dersler, secilenGunler, saatSayisi);
    const ceza = planPuanla(plan, dersler);
    populasyon.push({ plan, ceza });
  }

  console.log(`📊 İlk nesil oluşturuldu (${populasyonBoyutu} plan)`);
  populasyon.sort((a, b) => a.ceza - b.ceza);
  console.log(`   En iyi: ${populasyon[0].ceza} ceza`);
  console.log(`   En kötü: ${populasyon[populasyonBoyutu - 1].ceza} ceza\n`);

  // EVRİM DÖNGÜSÜ
  for (let nesil = 0; nesil < jenerasyonSayisi; nesil++) {
    // Sırala
    populasyon.sort((a, b) => a.ceza - b.ceza);

    // En iyi 20'yi seç (elitizm)
    const elitler = populasyon.slice(0, 20);

    // Yeni nesil oluştur
    const yeniNesil = [...elitler]; // Elitleri koru

    // Kalan 80'i çiftleştirme + mutasyon ile üret
    while (yeniNesil.length < populasyonBoyutu) {
      const anne = elitler[Math.floor(Math.random() * elitler.length)].plan;
      const baba = elitler[Math.floor(Math.random() * elitler.length)].plan;

      let cocuk = caprazlama(anne, baba);
      cocuk = mutasyon(cocuk);

      yeniNesil.push({
        plan: cocuk,
        ceza: planPuanla(cocuk, dersler),
      });
    }

    populasyon = yeniNesil;

    // Her 10 nesilte bir bilgi ver
    if ((nesil + 1) % 10 === 0) {
      populasyon.sort((a, b) => a.ceza - b.ceza);
      console.log(
        `🔄 Nesil ${nesil + 1}: En iyi plan ${populasyon[0].ceza} ceza`,
      );
    }
  }

  // SON SIRA VE SONUÇLAR
  populasyon.sort((a, b) => a.ceza - b.ceza);

  console.log("\n🏆 GENETİK ALGORİTMA TAMAMLANDI!\n");
  console.log("📊 En İyi 5 Plan:");
  populasyon.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. Plan: ${p.ceza} ceza`);
  });

  console.log("\n📉 En Kötü 5 Plan:");
  populasyon.slice(-5).forEach((p, i) => {
    console.log(`   ${populasyonBoyutu - 4 + i}. Plan: ${p.ceza} ceza`);
  });

  console.log(`\n✅ En iyi plan seçildi: ${populasyon[0].ceza} ceza\n`);

  return populasyon[0].plan;
}
