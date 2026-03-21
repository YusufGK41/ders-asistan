// 1. RASTGELE PLAN ÜRETİMİ (Sıralamayı bozmadan rastgele gün seçer)
export function rastgelePlanUret(islenecekKonular, secilenGunler, saatSayisi) {
  const plan = secilenGunler.map((gun) => ({
    gun: gun,
    dersler: [],
    kalanSaat: saatSayisi,
  }));

  // islenecekKonular artık App.jsx'ten SINAV TARİHİ ve ZORLUĞA göre sıralı geliyor!
  islenecekKonular.forEach((konu) => {
    let konuSaati = konu.sure;

    while (konuSaati > 0) {
      const musaitGunler = plan.filter((g) => g.kalanSaat > 0);

      // Kapasite dolarsa çık (Dışarıda kalan ders ölümcül ceza yiyecek)
      if (musaitGunler.length === 0) break;

      // Sadece müsait günlerden rastgele birini seç
      const rastgeleIndex = Math.floor(Math.random() * musaitGunler.length);
      const secilenGun = musaitGunler[rastgeleIndex];

      const eklenecekSaat = Math.min(konuSaati, secilenGun.kalanSaat);

      secilenGun.dersler.push({
        dersAdi: konu.dersAdi,
        konuAdi: konu.konuAdi,
        zorluk: konu.zorluk,
        sure: eklenecekSaat,
      });

      secilenGun.kalanSaat -= eklenecekSaat;
      konuSaati -= eklenecekSaat;
    }
  });

  return plan.map((g) => ({ gun: g.gun, dersler: g.dersler }));
}

// 2. CEZA VE PUANLAMA MANTIĞI
// 2. CEZA VE PUANLAMA MANTIĞI (Açığı Kapatılmış Versiyon)
export function planPuanla(plan, islenecekKonular) {
  let toplamCeza = 0;

  // CEZA 1: EKSİK VEYA KLONLANMIŞ KONU CEZASI (ÖLÜMCÜL)
  // Sadece toplam saate değil, HER BİR KONUNUN KENDİ SAATİNE bakıyoruz!
  const hedefDersSaatleri = {};
  islenecekKonular.forEach((k) => {
    const key = k.dersAdi + " - " + k.konuAdi;
    hedefDersSaatleri[key] = (hedefDersSaatleri[key] || 0) + k.sure;
  });

  const plandakiDersSaatleri = {};
  plan.forEach((g) => {
    g.dersler.forEach((d) => {
      const key = d.dersAdi + " - " + d.konuAdi;
      plandakiDersSaatleri[key] = (plandakiDersSaatleri[key] || 0) + d.sure;
    });
  });

  // Her bir konuyu tek tek kontrol et
  Object.keys(hedefDersSaatleri).forEach((key) => {
    const hedef = hedefDersSaatleri[key];
    const plandaOlan = plandakiDersSaatleri[key] || 0;

    if (plandaOlan < hedef) {
      toplamCeza += (hedef - plandaOlan) * 2000; // Matematik eksikse 2000 ceza!
    } else if (plandaOlan > hedef) {
      toplamCeza += (plandaOlan - hedef) * 2000; // Başka ders klonlanıp saati aştıysa 2000 ceza!
    }
  });

  for (let i = 0; i < plan.length; i++) {
    const gunPlani = plan[i];

    // CEZA 2: ZOR DERS GÜNÜN SONUNA KALMASIN
    if (gunPlani.dersler.length > 0) {
      const sonDers = gunPlani.dersler[gunPlani.dersler.length - 1];
      if (sonDers.zorluk === "zor") {
        toplamCeza += 50;
      }
    }

    // CEZA 3: AYNI GÜN İÇİNDE ZOR DERSLERİN PEŞ PEŞE GELMESİ
    for (let j = 0; j < gunPlani.dersler.length - 1; j++) {
      if (
        gunPlani.dersler[j].zorluk === "zor" &&
        gunPlani.dersler[j + 1].zorluk === "zor"
      ) {
        toplamCeza += 60;
      }
    }

    // CEZA 4: ARKA ARKAYA AYNI DERS (Günden Güne Kontrol)
    if (i < plan.length - 1) {
      const bugunDersler = gunPlani.dersler.map((d) => d.dersAdi);
      const yarinDersler = plan[i + 1].dersler.map((d) => d.dersAdi);
      bugunDersler.forEach((ders) => {
        if (yarinDersler.includes(ders)) toplamCeza += 30;
      });
    }
  }

  // CEZA 5: GÜNLÜK YÜK DENGESİZLİĞİ
  if (plan.length > 0) {
    const saatler = plan.map((g) =>
      g.dersler.reduce((sum, d) => sum + d.sure, 0),
    );
    const fark = Math.max(...saatler) - Math.min(...saatler);
    if (fark > 0) toplamCeza += fark * 15;
  }

  // CEZA 6: AYNI DERSİN 3+ GÜN ÜST ÜSTE GELMESİ
  const dersGunleri = {};
  plan.forEach((gunPlani, index) => {
    const benzersizDersler = [
      ...new Set(gunPlani.dersler.map((d) => d.dersAdi)),
    ];
    benzersizDersler.forEach((d) => {
      if (!dersGunleri[d]) dersGunleri[d] = [];
      dersGunleri[d].push(index);
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
      if (maxArdArda >= 3) toplamCeza += maxArdArda * 40;
    }
  });

  return toplamCeza || 0;
}

// 3. ÇAPRAZLAMA (Crossover)
function caprazlama(annePlan, babaPlan) {
  const yavruPlan = [];
  for (let i = 0; i < annePlan.length; i++) {
    if (Math.random() > 0.5) {
      yavruPlan.push(JSON.parse(JSON.stringify(annePlan[i])));
    } else {
      yavruPlan.push(JSON.parse(JSON.stringify(babaPlan[i])));
    }
  }
  return yavruPlan;
}

// 4. MUTASYON
function mutasyon(plan) {
  if (Math.random() > 0.1) return plan;

  const kaynakGunIndex = Math.floor(Math.random() * plan.length);
  const kaynakGun = plan[kaynakGunIndex];

  if (kaynakGun.dersler.length === 0) return plan;

  const dersIndex = Math.floor(Math.random() * kaynakGun.dersler.length);
  const cikarilanDers = kaynakGun.dersler.splice(dersIndex, 1)[0];

  const hedefGunIndex = Math.floor(Math.random() * plan.length);
  plan[hedefGunIndex].dersler.push(cikarilanDers);

  return plan;
}

// 5. ANA EVRİM MOTORU
export function evrimiBaslat(
  islenecekKonular,
  secilenGunler,
  saatSayisi,
  jenerasyonSayisi = 50,
) {
  let populasyon = [];
  const populasyonBoyutu = 100;

  for (let i = 0; i < populasyonBoyutu; i++) {
    const plan = rastgelePlanUret(islenecekKonular, secilenGunler, saatSayisi);
    populasyon.push({ plan, ceza: planPuanla(plan, islenecekKonular) });
  }

  for (let j = 0; j < jenerasyonSayisi; j++) {
    populasyon.sort((a, b) => a.ceza - b.ceza);
    const elitler = populasyon.slice(0, 20);

    const yeniNesil = [...elitler];

    while (yeniNesil.length < populasyonBoyutu) {
      const anne = elitler[Math.floor(Math.random() * elitler.length)].plan;
      const baba = elitler[Math.floor(Math.random() * elitler.length)].plan;

      let yavru = caprazlama(anne, baba);
      yavru = mutasyon(yavru);

      yeniNesil.push({
        plan: yavru,
        ceza: planPuanla(yavru, islenecekKonular),
      });
    }
    populasyon = yeniNesil;
  }

  populasyon.sort((a, b) => a.ceza - b.ceza);

  console.log("\n🏆 GENETİK ALGORİTMA SONUÇLARI 🏆");
  console.log("📊 En İyi 5 Plan:");
  populasyon
    .slice(0, 5)
    .forEach((p, i) => console.log(`  ${i + 1}. Plan: ${p.ceza} ceza`));

  console.log("\n📉 En Kötü 5 Plan:");
  populasyon
    .slice(-5)
    .forEach((p, i) =>
      console.log(`  ${populasyonBoyutu - 4 + i}. Plan: ${p.ceza} ceza`),
    );

  return populasyon[0].plan;
}
