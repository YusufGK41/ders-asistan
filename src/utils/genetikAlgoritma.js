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

  return toplamCeza;
}
