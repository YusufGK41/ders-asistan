import React from "react";

function PlanForm({ onPlanOlustur }) {
  const [planAyarlari, setPlanAyarlari] = React.useState({
    gunSayisi: 5,
    saatSayisi: 3,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onPlanOlustur(planAyarlari.gunSayisi, planAyarlari.saatSayisi);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-100 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Plan Ayarları</h2>

      <div className="mb-4">
        <label className="block">
          <span className="text-gray-700 font-medium mb-2 block">
            Haftada kaç gün çalışacaksın?
          </span>
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full"
            value={planAyarlari.gunSayisi}
            onChange={(e) =>
              setPlanAyarlari({
                ...planAyarlari,
                gunSayisi: Number(e.target.value),
              })
            }
          >
            <option value="1">1 gün</option>
            <option value="2">2 gün</option>
            <option value="3">3 gün</option>
            <option value="4">4 gün</option>
            <option value="5">5 gün</option>
            <option value="6">6 gün</option>
            <option value="7">7 gün</option>
          </select>
        </label>
      </div>

      <div className="mb-4">
        <label className="block">
          <span className="text-gray-700 font-medium mb-2 block">
            Günde kaç saat çalışabilirsin?
          </span>
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full"
            value={planAyarlari.saatSayisi}
            onChange={(e) =>
              setPlanAyarlari({
                ...planAyarlari,
                saatSayisi: Number(e.target.value),
              })
            }
          >
            <option value="1">1 saat</option>
            <option value="2">2 saat</option>
            <option value="3">3 saat</option>
            <option value="4">4 saat</option>
            <option value="5">5 saat</option>
            <option value="6">6 saat</option>
            <option value="7">7 saat</option>
            <option value="8">8 saat</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-green-700 text-white px-4 py-3 rounded hover:bg-green-600 font-medium"
      >
        Plan Oluştur
      </button>
    </form>
  );
}

export default PlanForm;
