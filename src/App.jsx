import { useState, useEffect } from "react";
import DersForm from "./components/DersForm";
import DersListesi from "./components/DersListesi";
import { dersleriKaydet, dersleriYukle } from "./utils/storage";
import PlanForm from "./components/PlanForm";
import { konuSuresiHesapla } from "./utils/hesaplamalar";
import PlanGoster from "./components/PlanGoster";

function App() {
  const [dersler, setDersler] = useState(dersleriYukle());
  const [plan, setPlan] = useState([]);

  const [aktifSekme, setAktifSekme] = useState("dersler");

  useEffect(() => {
    dersleriKaydet(dersler);
  }, [dersler]);

  const dersEkle = (yeniDers) => {
    const dersVarmi = dersler.some((ders) => {
      ders.dersAdi.toLowerCase().trim() ===
        yeniDers.dersAdi.toLowerCase().trim();
    });
    if (dersVarmi) {
      alert("Bu ders zaten listenizde var! Lütfen farklı bir ders ekleyin.");
      return; // Fonksiyonu durdur, ekleme yapma
    }

    const dersWithId = {
      ...yeniDers,
      id: Date.now(), // Unique ID ekle
    };

    setDersler([...dersler, dersWithId]);
    console.log("Yeni ders eklendi:", dersWithId);
  };

  const planOlustur = (gunSayisi, saatSayisi) => {
    const planlanacakDersler = dersler.map((ders) => ({
      ...ders,
      konular: ders.konular.filter((konu) => konu.bitti === false),
    }));

    const siraliDersler = planlanacakDersler.sort((a, b) => {
      // İkisinin de sınav tarihi VAR
      if (a.sinavTarihi && b.sinavTarihi) {
        const tarihFarki = new Date(a.sinavTarihi) - new Date(b.sinavTarihi);

        // Tarihler AYNI ise → Zorluğa bak
        if (tarihFarki === 0) {
          const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
          return (
            zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi]
          );
        }

        // Tarihler FARKLI ise → Yakın olan önce (zorluk önemsiz)
        return tarihFarki;
      }

      // a'nın sınav tarihi VAR, b'nin YOK → a önce
      if (a.sinavTarihi && !b.sinavTarihi) {
        return -1;
      }

      // b'nin sınav tarihi VAR, a'nın YOK → b önce
      if (!a.sinavTarihi && b.sinavTarihi) {
        return 1;
      }

      // İkisinin de sınav tarihi YOK → Zorluğa bak
      const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
      return zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi];
    });

    const derslerVeSureler = siraliDersler.map((ders) => {
      const toplamSure = ders.konular.reduce((toplam, konu) => {
        return toplam + konuSuresiHesapla(ders.zorlukSeviyesi);
      }, 0);
      return {
        ...ders,
        toplamSure: toplamSure,
      };
    });
    const toplamIsYuku = derslerVeSureler.reduce((toplam, ders) => {
      return toplam + ders.toplamSure;
    }, 0);
    const calismaKapasitesi = gunSayisi * saatSayisi;
    console.log("Toplam iş yükü:", toplamIsYuku, "saat");
    console.log("Çalışma kapasitesi:", calismaKapasitesi, "saat");

    if (toplamIsYuku > calismaKapasitesi) {
      alert(
        `Uyarı! ${toplamIsYuku} saat ders var ama sadece ${calismaKapasitesi} saat çalışabilirsin. Daha fazla gün/saat ekle veya bazı dersleri tamamla.`,
      );
      return; // Plan oluşturma
    }
    // 5. Günlere dağıt
    const gunler = [
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
      "Pazar",
    ];
    const plan = [];

    let gunIndex = 0;
    let gunKalanSaat = saatSayisi;

    // Her ders için
    derslerVeSureler.forEach((ders) => {
      // Her konu için
      ders.konular.forEach((konu) => {
        let konuKalanSaat = konuSuresiHesapla(ders.zorlukSeviyesi);

        // Konu bitene kadar
        while (konuKalanSaat > 0) {
          // Bugün çalışılacak saat
          const bugunCalisilacak = Math.min(konuKalanSaat, gunKalanSaat);

          // Plana ekle
          if (!plan[gunIndex]) {
            plan[gunIndex] = {
              gun: gunler[gunIndex % 7],
              dersler: [],
            };
          }

          plan[gunIndex].dersler.push({
            dersAdi: ders.dersAdi,
            konuAdi: konu.ad,
            sure: bugunCalisilacak,
          });

          // Süreleri güncelle
          konuKalanSaat -= bugunCalisilacak;
          gunKalanSaat -= bugunCalisilacak;

          // Gün doldu mu?
          if (gunKalanSaat === 0) {
            gunIndex++;
            gunKalanSaat = saatSayisi;

            // Gün sayısı doldu mu?
            if (gunIndex >= gunSayisi) {
              console.log("⚠️ Günler bitti ama işler tamamlanmadı!");
              return;
            }
          }
        }
      });
    });

    console.log("📅 PLAN:", plan);
    console.log("✅ Süre yeterli, plan oluşturuluyor...");
    console.log("Dersler ve süreleri:", derslerVeSureler);
    console.log("Sıralı dersler:", siraliDersler);
    console.log("Planlanacak dersler:", planlanacakDersler);
    console.log("Plan oluşturuluyor...");
    console.log("Gün:", gunSayisi, "Saat:", saatSayisi);
    // 6. Planı kaydet
    setPlan(plan);
    console.log("✅ Plan oluşturuldu ve kaydedildi!");
  };

  const dersSil = (id) => {
    const yeniDersler = dersler.filter((ders) => ders.id !== id);
    setDersler(yeniDersler);
    console.log("Ders silindi, ID:", id);
  };

  const konuDurumDegistir = (hedefDersId, hedefKonuId) => {
    console.log(
      "Konu durum değiştiriliyor - Ders ID:",
      hedefDersId,
      "Konu ID:",
      hedefKonuId,
    );
    const yeniDersler = dersler.map((ders) => {
      if (ders.id !== hedefDersId) {
        return ders;
      }
      return {
        ...ders,

        konular: ders.konular.map((konu) => {
          if (konu.id === hedefKonuId) {
            return { ...konu, bitti: !konu.bitti };
          }

          return konu;
        }),
      };
    });
    setDersler(yeniDersler);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Üst Başlık Bölümü */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
            📚 Ders <span className="text-blue-600">Asistanım</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            MVP-1: Kişisel Çalışma Planlayıcı
          </p>
        </header>

        {/* YENİ: SEKMELER (TABS) BÖLÜMÜ */}
        <div className="flex justify-center gap-4 mb-8 border-b border-slate-200 pb-2">
          <button
            onClick={() => setAktifSekme("dersler")}
            className={`px-6 py-3 font-bold rounded-t-lg transition-all duration-300 ${
              aktifSekme === "dersler"
                ? "bg-blue-600 text-white shadow-md transform -translate-y-1"
                : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            ✏️ Ders & Konu Ekle
          </button>

          <button
            onClick={() => setAktifSekme("plan")}
            className={`px-6 py-3 font-bold rounded-t-lg transition-all duration-300 ${
              aktifSekme === "plan"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md transform -translate-y-1"
                : "bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            📅 Haftalık Plan Oluştur
          </button>
        </div>

        {/* İÇERİK BÖLÜMÜ - Hangi sekme aktifse o görünür */}

        {/* SEKME 1: DERSLER */}
        {aktifSekme === "dersler" && (
          <main className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            <aside className="w-full lg:w-[400px] lg:sticky lg:top-8">
              <DersForm onDersEkle={dersEkle} />
            </aside>
            <section className="flex-1 w-full">
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Aktif Derslerim
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-md">
                    {dersler.length}
                  </span>
                </h3>
              </div>
              <DersListesi
                dersler={dersler}
                onDersSil={dersSil}
                onKonuToggle={konuDurumDegistir}
              />
            </section>
          </main>
        )}

        {/* SEKME 2: PLANLAMA */}
        {aktifSekme === "plan" && (
          <main className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            <aside className="w-full lg:w-[350px] lg:sticky lg:top-8">
              <PlanForm onPlanOlustur={planOlustur} />
            </aside>
            <section className="flex-1 w-full">
              <PlanGoster plan={plan} />
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
