import React from "react";

function PlanForm({ onPlanOlustur }) {
  // 1. Günlerin Listesi
  const haftaninGunleri = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ];

  // 2. State (Seçilen günler ve saat)
  const [planAyarlari, setPlanAyarlari] = React.useState({
    secilenGunler: ["Pazartesi", "Çarşamba", "Cuma"],
    saatSayisi: 3,
  });

  // 3. İŞTE EKSİK OLAN FONKSİYON BURADA (PlanForm'un İÇİNDE!)
  const gunSecimiDegistir = (tiklananGun) => {
    const { secilenGunler } = planAyarlari;

    if (secilenGunler.includes(tiklananGun)) {
      setPlanAyarlari({
        ...planAyarlari,
        secilenGunler: secilenGunler.filter((g) => g !== tiklananGun),
      });
    } else {
      setPlanAyarlari({
        ...planAyarlari,
        secilenGunler: [...secilenGunler, tiklananGun],
      });
    }
  };

  // 4. Form Gönderme Fonksiyonu
  const handleSubmit = (e) => {
    e.preventDefault();
    if (planAyarlari.secilenGunler.length === 0) {
      alert("Lütfen en az 1 çalışma günü seçin!");
      return;
    }
    onPlanOlustur(planAyarlari.secilenGunler, planAyarlari.saatSayisi);
  };

  // 5. Arayüz
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Plan Ayarları</h2>
        <p className="text-gray-500 text-sm">Hangi günler çalışmak istersin?</p>
      </div>

      <div className="mb-6">
        <span className="text-sm font-semibold text-gray-700 mb-3 block">
          Çalışma Günleri
        </span>
        <div className="flex flex-wrap gap-2">
          {haftaninGunleri.map((gun) => {
            const seciliMi = planAyarlari.secilenGunler.includes(gun);
            return (
              <button
                key={gun}
                type="button"
                onClick={() => gunSecimiDegistir(gun)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  seciliMi
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {gun}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700 mb-2 block">
            Günde kaç saat çalışabilirsin?
          </span>
          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition-all cursor-pointer"
            value={planAyarlari.saatSayisi}
            onChange={(e) =>
              setPlanAyarlari({
                ...planAyarlari,
                saatSayisi: Number(e.target.value),
              })
            }
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((saat) => (
              <option key={saat} value={saat}>
                {saat} saat
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
      >
        Plan Oluştur
      </button>
    </form>
  );
}

export default PlanForm;
