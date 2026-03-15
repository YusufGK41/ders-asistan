import { useState, useEffect } from "react";
import DersForm from "./components/DersForm";
import DersListesi from "./components/DersListesi";
import { dersleriKaydet, dersleriYukle } from "./utils/storage";
import PlanForm from "./components/PlanForm";
import { konuSuresiHesapla } from "./utils/hesaplamalar";
import PlanGoster from "./components/PlanGoster";
import { planPuanla, rastgelePlanUret } from "./utils/genetikAlgoritma";

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

  // ARTIK gunSayisi DEĞİL, secilenGunler GELİYOR
  const planOlustur = (secilenGunler, saatSayisi) => {
    // 1. Planlanacak konuları filtrele
    const planlanacakDersler = dersler.map((ders) => ({
      ...ders,
      konular: ders.konular.filter((konu) => konu.bitti === false),
    }));

    // 2. Sıralama (Sınav tarihine ve zorluğa göre - Aynen koruduk)
    const siraliDersler = planlanacakDersler.sort((a, b) => {
      if (a.sinavTarihi && b.sinavTarihi) {
        const tarihFarki = new Date(a.sinavTarihi) - new Date(b.sinavTarihi);
        if (tarihFarki === 0) {
          const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
          return (
            zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi]
          );
        }
        return tarihFarki;
      }
      if (a.sinavTarihi && !b.sinavTarihi) return -1;
      if (!a.sinavTarihi && b.sinavTarihi) return 1;
      const zorlukSirasi = { zor: 1, orta: 2, kolay: 3 };
      return zorlukSirasi[a.zorlukSeviyesi] - zorlukSirasi[b.zorlukSeviyesi];
    });

    // 3. Süreleri hesapla
    const derslerVeSureler = siraliDersler.map((ders) => {
      const toplamSure = ders.konular.reduce((toplam, konu) => {
        return toplam + konuSuresiHesapla(ders.zorlukSeviyesi);
      }, 0);
      return {
        ...ders,
        toplamSure: toplamSure,
      };
    });

    // 4. KAPASİTE KONTROLÜ (YENİ MANTIK)
    const toplamIsYuku = derslerVeSureler.reduce((toplam, ders) => {
      return toplam + ders.toplamSure;
    }, 0);

    // Kapasite = Seçilen günlerin adedi * Günlük Saat
    const calismaKapasitesi = secilenGunler.length * saatSayisi;

    console.log("Seçilen Günler:", secilenGunler);
    console.log("Toplam iş yükü:", toplamIsYuku, "saat");
    console.log("Çalışma kapasitesi:", calismaKapasitesi, "saat");

    if (toplamIsYuku > calismaKapasitesi) {
      alert(
        `Uyarı! ${toplamIsYuku} saat iş yükün var ama seçtiğin ${secilenGunler.length} gün için kapasiten sadece ${calismaKapasitesi} saat. Daha fazla gün seç veya konuları azalt.`,
      );
      return;
    }

    // 5. GÜNLERE DAĞIT (BEYİN AMELİYATI BURADA)
    const plan = [];
    let gunIndex = 0;
    let gunKalanSaat = saatSayisi;

    derslerVeSureler.forEach((ders) => {
      ders.konular.forEach((konu) => {
        let konuKalanSaat = konuSuresiHesapla(ders.zorlukSeviyesi);

        while (konuKalanSaat > 0) {
          // Güvenlik: Eğer seçtiğimiz günleri aştıysak döngüyü kır
          if (gunIndex >= secilenGunler.length) break;

          const bugunCalisilacak = Math.min(konuKalanSaat, gunKalanSaat);

          if (!plan[gunIndex]) {
            plan[gunIndex] = {
              // ARTIK SIRADAN GÜNLERİ DEĞİL, KULLANICININ SEÇTİĞİ GÜNLERİ ALIYORUZ!
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

          // Günün saati dolduysa bir sonraki güne geç
          if (gunKalanSaat === 0) {
            gunIndex++;
            gunKalanSaat = saatSayisi;
          }
        }
      });
    });

    setPlan(plan);

    // Orijinal planın puanı
    const orijinalCeza = planPuanla(plan, dersler);
    console.log("📊 Orijinal Plan Puanı:", orijinalCeza);

    // 100 rastgele plan dene ve en iyisini bul
    console.log("\n🎲 100 RASTGELE PLAN DENENİYOR...");

    let enIyiPlan = plan;
    let enDusukCeza = orijinalCeza;

    for (let i = 0; i < 100; i++) {
      const rastgelePlan = rastgelePlanUret(dersler, secilenGunler, saatSayisi);
      const rastgeleCeza = planPuanla(rastgelePlan, dersler);

      if (rastgeleCeza < enDusukCeza) {
        enIyiPlan = rastgelePlan;
        enDusukCeza = rastgeleCeza;
        console.log(`✅ Yeni rekor! Plan ${i + 1}: ${rastgeleCeza} ceza`);
      }
    }

    console.log(`\n🏆 EN İYİ PLAN: ${enDusukCeza} ceza`);
    console.log(
      "📊 Orijinal: " +
        orijinalCeza +
        " | En İyi: " +
        enDusukCeza +
        " | İyileşme: " +
        (orijinalCeza - enDusukCeza) +
        " puan",
    );

    // En iyi planı göster
    setPlan(enIyiPlan);
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
