import { useState, useEffect } from "react";
import DersForm from "./components/DersForm";
import DersListesi from "./components/DersListesi";
import { dersleriKaydet, dersleriYukle } from "./utils/storage";
import PlanForm from "./components/PlanForm";
import { konuSuresiHesapla } from "./utils/hesaplamalar";
import PlanGoster from "./components/PlanGoster";
import { evrimiBaslat } from "./utils/genetikAlgoritma"; // <-- IMPORT GÜNCELLENDİ

function App() {
  const [dersler, setDersler] = useState(dersleriYukle());
  const [plan, setPlan] = useState([]);
  const [aktifSekme, setAktifSekme] = useState("dersler");

  useEffect(() => {
    dersleriKaydet(dersler);
  }, [dersler]);

  const dersEkle = (yeniDers) => {
    const dersVarmi = dersler.some(
      (ders) =>
        ders.dersAdi.toLowerCase().trim() ===
        yeniDers.dersAdi.toLowerCase().trim(),
    );
    if (dersVarmi) {
      alert("Bu ders zaten listenizde var! Lütfen farklı bir ders ekleyin.");
      return;
    }

    const dersWithId = {
      ...yeniDers,
      id: Date.now(),
    };

    setDersler([...dersler, dersWithId]);
  };

  const planOlustur = (secilenGunler, saatSayisi) => {
    // 0. GÜNLERİ KRONOLOJİK SIRAYA DİZ (Hangi sırayla tıklanırsa tıklansın takvim sırasına girer)
    const haftaninGunleri = [
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
      "Pazar",
    ];

    const siraliSecilenGunler = [...secilenGunler].sort(
      (a, b) => haftaninGunleri.indexOf(a) - haftaninGunleri.indexOf(b),
    );

    // 1. Planlanacak konuları filtrele
    const planlanacakDersler = dersler.map((ders) => ({
      ...ders,
      konular: ders.konular.filter((konu) => konu.bitti === false),
    }));

    // 2. SIRALAMA (Sınav tarihine ve zorluğa göre kendi mantığın)
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

    // 3. Algoritma İçin Verileri Düzleştir
    const islenecekKonular = [];
    let toplamIsYuku = 0;

    siraliDersler.forEach((ders) => {
      ders.konular.forEach((konu) => {
        const sure = konuSuresiHesapla(ders.zorlukSeviyesi);
        toplamIsYuku += sure;
        islenecekKonular.push({
          dersAdi: ders.dersAdi,
          konuAdi: konu.ad,
          zorluk: ders.zorlukSeviyesi,
          sure: sure,
        });
      });
    });

    if (islenecekKonular.length === 0) {
      alert("Planlanacak bitmemiş konu bulunamadı!");
      return;
    }

    // 4. KAPASİTE KONTROLÜ (Sıralı Günler ile)
    const calismaKapasitesi = siraliSecilenGunler.length * saatSayisi;

    console.log("Seçilen Günler:", siraliSecilenGunler);
    console.log("Toplam İş Yükü:", toplamIsYuku, "saat");
    console.log("Çalışma Kapasitesi:", calismaKapasitesi, "saat");

    if (toplamIsYuku > calismaKapasitesi) {
      alert(
        `Uyarı! ${toplamIsYuku} saat iş yükün var ama seçtiğin günlerin kapasitesi ${calismaKapasitesi} saat. Lütfen gün/saat artır veya konu azalt.`,
      );
      return;
    }

    // 5. GENETİK ALGORİTMAYI ÇALIŞTIR
    console.log("🧬 Genetik Algoritma Evrimi Başlıyor...");
    const enIyiPlan = evrimiBaslat(
      islenecekKonular,
      siraliSecilenGunler,
      saatSayisi,
      50,
    );

    // Ekrana yansıt
    setPlan(enIyiPlan);
  };

  const dersSil = (id) => {
    const yeniDersler = dersler.filter((ders) => ders.id !== id);
    setDersler(yeniDersler);
  };

  const konuDurumDegistir = (hedefDersId, hedefKonuId) => {
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
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
            📚 Ders <span className="text-blue-600">Asistanım</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            MVP-1: Kişisel Çalışma Planlayıcı
          </p>
        </header>

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
