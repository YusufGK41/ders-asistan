import { useState, useEffect } from "react";
import DersForm from "./components/DersForm";
import DersListesi from "./components/DersListesi";
import PlanForm from "./components/PlanForm";
import { konuSuresiHesapla } from "./utils/hesaplamalar";
import PlanGoster from "./components/PlanGoster";
import { evrimiBaslat } from "./utils/genetikAlgoritma"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import * as supabaseData from "./utils/supabaseData";

function AppContent() {
  // Eğer kullanıcı giriş yapmamışsa
  const { user, logout } = useAuth();
  const [dersler, setDersler] = useState([]);
  const [plan, setPlan] = useState([]);
  const [aktifSekme, setAktifSekme] = useState("dersler");
  const [duzenlenecekDers, setDuzenlenecekDers] = useState(null);

  useEffect(() => {
    if (user) {
      // 1. Dersleri getir
      supabaseData.dersleriGetir(user.id)
        .then((data) => setDersler(data))
        .catch(console.error);

      // 2. YENİ EKLENEN KISIM: Varsa Supabase'den kayıtlı planı getir
      supabaseData.planiGetir(user.id)
        .then((kayitliPlan) => {
          if (kayitliPlan) {
            setPlan(kayitliPlan); // Planı state'e at ki ekranda görünsün
          }
        })
        .catch(console.error);
    }
  }, [user]); //

 

  const dersEkle = async (yeniDers) => {
    // BURAYI GÜNCELLEDİK: ders.dersAdi yerine ders.ders_adi yaptık
    const dersVarmi = dersler.some(
      (ders) =>
        ders.ders_adi.toLowerCase().trim() ===
        yeniDers.dersAdi.toLowerCase().trim(),
    );

    if (dersVarmi) {
      toast.error("Bu ders zaten listenizde var!");
      return;
    }
    
    try {
      // supabase ekle
      await supabaseData.dersEkle(user.id, yeniDers);

      // state güncelle
      const yeniDersler = await supabaseData.dersleriGetir(user.id);
      setDersler(yeniDersler);
      
      toast.success("Ders başarıyla eklendi! 🎉");
    } catch (error) {
      toast.error("Ders eklenirken hata oluştu!");
      console.error(error);
    }
  };

  const planOlustur = async (secilenGunler, saatSayisi) => {
    // 0. GÜNLERİ KRONOLOJİK SIRAYA DİZ
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

    // 1. SADECE BİTMEYEN KONULARI FİLTRELE (Düzleştirme yapmıyoruz, ham veriyi koruyoruz!)
    const planlanacakDersler = dersler
      .map((ders) => ({
        ...ders,
        dersAdi: ders.ders_adi, // Supabase'den geleni GA'nın anlayacağı şekle çevir
        zorlukSeviyesi: ders.zorluk_seviyesi, // Supabase'den geleni GA'nın anlayacağı şekle çevir
        konular: ders.konular.filter((konu) => konu.bitti === false),
      }))
      .filter((ders) => ders.konular.length > 0);
    if (planlanacakDersler.length === 0) {
      alert("Planlanacak bitmemiş konu bulunamadı!");
      return;
    }

    // 2. KAPASİTE KONTROLÜ İÇİN TOPLAM YÜKÜ HESAPLA
    let toplamIsYuku = 0;
    planlanacakDersler.forEach((ders) => {
      ders.konular.forEach((konu) => {
        toplamIsYuku += konuSuresiHesapla(ders.zorlukSeviyesi);
      });
    });

    const calismaKapasitesi = siraliSecilenGunler.length * saatSayisi;

    console.log("Seçilen Günler:", siraliSecilenGunler);
    console.log("Toplam İş Yükü:", toplamIsYuku, "saat");
    console.log("Çalışma Kapasitesi:", calismaKapasitesi, "saat");

    if (toplamIsYuku > calismaKapasitesi) {
      alert(
        `Uyarı! ${toplamIsYuku} saat iş yükün var ama kapasiten ${calismaKapasitesi} saat. Lütfen gün/saat artır veya konu azalt.`,
      );
      return;
    }

    // 3. GENETİK ALGORİTMAYI ÇALIŞTIR (Ham 'planlanacakDersler' dizisini yolluyoruz)
    console.log("🧬 Genetik Algoritma Evrimi Başlıyor...");

    // Parametreler: (dersler, secilenGunler, saatSayisi, populasyonBoyutu, jenerasyonSayisi)
    const enIyiPlan = evrimiBaslat(
      planlanacakDersler,
      siraliSecilenGunler,
      saatSayisi,
      100, // Popülasyonu 100 yaptık
      50, // 50 Nesil
    );

    setPlan(enIyiPlan);

    try {
      // user.id'yi, uygulamanın state'inde nerede tutuyorsan ona göre yaz. 
      // (Büyük ihtimalle auth'tan gelen 'user.id' veya benzeridir)
      await supabaseData.planiKaydet(user.id, enIyiPlan);
      toast.success("Yapay zeka planını oluşturdu ve veritabanına kaydetti! 🚀");
    } catch (error) {
      toast.error("Plan oluşturuldu ancak kaydedilirken hata oluştu.");
      console.error(error);
    }
  };

  const dersDuzenlemeModunaGec = (ders) => {
    setDuzenlenecekDers(ders);
    // DersForm'a veriyi gönderiyoruz - aynı mantık
  };

  const dersGuncelle = async (guncelDers) => {
    try {
      await supabaseData.dersGuncelle(user.id, guncelDers);

      // state i güncelle
      const yeniDersler = await supabaseData.dersleriGetir(user.id);
      setDersler(yeniDersler);

      toast.success("Ders başarıyla güncellendi! 🎉");
      setDuzenlenecekDers(null);
    } catch (error) {
      toast.error("Ders güncellenirken hata oluştu!");
      console.error(error);
    }
  };


  const dersSil = async (dersId) => {
  try {
    await supabaseData.dersSil(user.id, dersId);
    
    // State'i güncelle
    const yeniDersler = await supabaseData.dersleriGetir(user.id);
    setDersler(yeniDersler);
    
    toast.success("Ders başarıyla silindi! 🗑️");
    } catch (error) {
      toast.error("Ders silinirken hata oluştu!");
      console.error(error);
    }
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
  
  if (!user) {
    return <Login />;
  }
  
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
              📚 Ders <span className="text-blue-600">Asistanım</span>
            </h1>
            <p className="text-slate-500 font-medium italic">
              Hoş geldin, {user.user_metadata?.name || user.email}! 👋
            </p>
          </div>
          
          {/* İŞTE ÇIKIŞ YAP BUTONUMUZ */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg font-bold transition-colors duration-300 shadow-sm"
          >
            🚪 Çıkış Yap
          </button>
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
              <DersForm 
              onDersEkle={dersEkle}
              duzenlenecekDers={duzenlenecekDers}
              onDersGuncelle={dersGuncelle}
              />
              
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
                onDersDuzenle={dersDuzenlemeModunaGec}
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
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
