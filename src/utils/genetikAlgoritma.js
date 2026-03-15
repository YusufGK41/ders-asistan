function arrayKaristir(array) {
  const yeniArray = [...array];
  for (let i = yeniArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [yeniArray[i], yeniArray[j]] = [yeniArray[j], yeniArray[i]];
  }
  return yeniArray;
}

export function planPuanla(plan, dersler) {
  let toplamCeza = 0;

  // CEZA 1: Arka arkaya aynı ders var mı?
  for (let i = 0; i < plan.length - 1; i++) {
    const bugun = plan[i];
    const yarin = plan[i + 1];

    // bugünkü dersleri al
    const bugunDersler = bugun.dersler.map((d) => d.dersAdi);
    // yarınki dersleri al
    const yarinDersler = yarin.dersler.map((d) => d.dersAdi);

    // ortak ders var mı kontrol et
    bugunDersler.forEach((ders) => {
      if (yarinDersler.includes(ders)) {
        toplamCeza += 15;
        console.log(
          `⚠️ ${bugun.gun} ve ${yarin.gun} günlerinde ${ders} arka arkaya! +15 ceza`,
        );
      }
    });
  }

  plan.forEach((gunPlani) => {
    for (let i = 0; i < gunPlani.dersler.length - 1; i++) {
      const simdikiDers = gunPlani.dersler[i];
      const sonrakiDers = gunPlani.dersler[i + 1];

      // bu derslerin zorluk seviyelerini bul
      const simdikiDersInfo = dersler.find(
        (d) => d.dersAdi === simdikiDers.dersAdi,
      );
      const sonrakiDersInfo = dersler.find(
        (d) => d.dersAdi === sonrakiDers.dersAdi,
      );

      // ikisi de zormu
      if (
        simdikiDersInfo?.zorlukSeviyesi === "zor" &&
        sonrakiDersInfo?.zorlukSeviyesi === "zor"
      ) {
        toplamCeza += 20;
        console.log(
          `⚠️ ${gunPlani.gun} gününde ${simdikiDers.dersAdi} ve ${sonrakiDers.dersAdi} arka arkaya zor dersler! +20 ceza`,
        );
      }
    }
  });

  // CEZA 3: günlük yük dengesi
  const gunlukSaatler = plan.map((gunPlani) => {
    return gunPlani.dersler.reduce((toplam, ders) => toplam + ders.sure, 0);
  });

  const enFazlaSaat = Math.max(...gunlukSaatler);
  const enAzSaat = Math.min(...gunlukSaatler);
  const fark = enFazlaSaat - enAzSaat;

  if (fark > 0) {
    toplamCeza += fark;
    /*console.log(
      `⚠️ Günlük yük dengesiz! En fazla: ${enFazlaSaat}h, En az: ${enAzSaat}h. Fark: ${fark}h → +${fark} ceza`,
    );*/
  }

  return toplamCeza;
}

// Rastgele bir plan üretir
export function rastgelePlanUret(dersler, secilenGunler, saatSayisi) {
  // 1. Planlanacak konuları filtrele
  const planlanacakDersler = dersler.map((ders) => ({
    ...ders,
    konular: ders.konular.filter((konu) => konu.bitti === false),
  }));

  // 2. DERSLERİ KARIŞTIR (Sıralama yerine!)
  const karisikDersler = arrayKaristir(planlanacakDersler);

  // 3. Konuları da karıştır
  const tumdenKarisikDersler = karisikDersler.map((ders) => ({
    ...ders,
    konular: arrayKaristir(ders.konular),
  }));

  // 4. Günlere dağıt (aynı mantık)
  const plan = [];
  let gunIndex = 0;
  let gunKalanSaat = saatSayisi;

  tumdenKarisikDersler.forEach((ders) => {
    ders.konular.forEach((konu) => {
      let konuKalanSaat = 5; // Şimdilik sabit (sonra düzeltiriz)

      while (konuKalanSaat > 0) {
        if (gunIndex >= secilenGunler.length) break;

        const bugunCalisilacak = Math.min(konuKalanSaat, gunKalanSaat);

        if (!plan[gunIndex]) {
          plan[gunIndex] = {
            gun: secilenGunler[gunIndex],
            dersler: [],
          };
        }

        plan[gunIndex].dersler.push({
          dersAdi: ders.dersAdi,
          konuAdi: konu.ad,
          sure: bugunCalisilacak,
        });

        konuKalanSaat -= bugunCalisilacak;
        gunKalanSaat -= bugunCalisilacak;

        if (gunKalanSaat === 0) {
          gunIndex++;
          gunKalanSaat = saatSayisi;
        }
      }
    });
  });

  return plan;
}
