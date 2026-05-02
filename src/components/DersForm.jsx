import React from "react";

function DersForm({ onDersEkle, duzenlenecekDers, onDersGuncelle }) {
  const [formData, setFormData] = React.useState({
    dersAdi: "",
    konular: [],
    zorlukSeviyesi: "kolay",
    sinavTarihi: "",
  });

  React.useEffect(() => {
  if (duzenlenecekDers) {
    // Düzenleme modu - form u doldur
    setFormData({
      dersAdi: duzenlenecekDers.dersAdi,
      konular: duzenlenecekDers.konular || [],
      zorlukSeviyesi: duzenlenecekDers.zorlukSeviyesi,
      sinavTarihi: duzenlenecekDers.sinavTarihi || "",
    });
  } else {
    // YEni ders ekleme modu - form u temizle
    setFormData({
      dersAdi: "",
      konular: [],
      zorlukSeviyesi: "kolay",
      sinavTarihi: "",
    });
  }
}, [duzenlenecekDers]);

  const [konuInput, setKonuInput] = React.useState("");

  const konuEkle = () => {
    if (konuInput.trim() === "") {
      alert("Konu adı boş olamaz!");
      return;
    }

    const yeniKonu = {
      id: Date.now(),
      ad: konuInput,
      bitti: false,
    };

    setFormData({
      ...formData,
      konular: [...formData.konular, yeniKonu],
    });
    setKonuInput("");
  };

  const konuSil = (id) => {
    const yeniKonular = formData.konular.filter((konu) => konu.id !== id);
    setFormData({ ...formData, konular: yeniKonular });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Önce kopyamızı alıyoruz
    let guncelKonular = [...formData.konular];

    // 2. AKILLI KONTROL: Eğer konu inputu doluysa ama '+' butonuna basılmamışsa, onu da dahil et!
    if (konuInput.trim() !== "") {
      const unutulanKonu = {
        id: Date.now(),
        ad: konuInput.trim(),
        bitti: false,
      };
      guncelKonular.push(unutulanKonu);
    }

    // 3. Validasyonlar (Artık guncelKonular üzerinden yapıyoruz)
    if (formData.dersAdi.trim() === "") {
      alert("Ders adı boş olamaz!");
      return;
    }

    if (guncelKonular.length === 0) {
      alert("En az bir konu eklemelisiniz!");
      return;
    }

    if (formData.sinavTarihi && isNaN(Date.parse(formData.sinavTarihi))) {
      alert("Geçersiz sınav tarihi!");
      return;
    }

    // 4. Düzenleme moduna göre doğru fonksiyonu çağır
    const gonderilecekVeri = {
      ...formData,
      konular: guncelKonular,
    };

    if (duzenlenecekDers) {
      // Düzenleme modu - ID yi koru
      gonderilecekVeri.id = duzenlenecekDers.id;
      onDersGuncelle(gonderilecekVeri);
    } else {
      // Yeni ders ekleme modu
      onDersEkle(gonderilecekVeri);
    }

    // 5. Formu ve inputu tamamen temizle
    setFormData({
      dersAdi: "",
      konular: [],
      zorlukSeviyesi: "kolay",
      sinavTarihi: "",
    });
    setKonuInput("");
  };

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-xl border-2 max-w-md w-full transition-all duration-300 ${
  duzenlenecekDers 
    ? "border-orange-500 bg-orange-50" 
    : "border-gray-100"
}`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold mb-6 ${
  duzenlenecekDers 
    ? "text-orange-600" 
    : "text-blue-600"
}`}>
  {duzenlenecekDers ? "📝 Ders Güncelle" : "➕ Ders Ekle"}
</h2>
        <p className="text-gray-500 text-sm">Çalışma planını detaylandır.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ders Adı */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
            Ders Adı
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
            value={formData.dersAdi}
            onChange={(e) =>
              setFormData({ ...formData, dersAdi: e.target.value })
            }
            type="text"
            placeholder="Örn: Modern Fizik"
          />
        </div>

        {/* Konu Ekleme Bölümü */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
            Konular
          </label>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all bg-gray-50/50"
              type="text"
              value={konuInput}
              onChange={(e) => setKonuInput(e.target.value)}
              placeholder="Konu ekle..."
            />
            <button
              type="button"
              onClick={konuEkle}
              className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-black transition-colors font-bold"
            >
              +
            </button>
          </div>

          {/* Konu Etiketleri */}
          <div className="flex flex-wrap gap-2">
            {formData.konular.map((konu) => (
              <span
                key={konu.id}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100 shadow-sm"
              >
                {konu.ad}
                <button
                  type="button"
                  onClick={() => konuSil(konu.id)}
                  className="hover:text-red-500 font-bold ml-1 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Zorluk Seviyesi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
              Zorluk
            </label>
            <select
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition-all cursor-pointer"
              value={formData.zorlukSeviyesi}
              onChange={(e) =>
                setFormData({ ...formData, zorlukSeviyesi: e.target.value })
              }
            >
              <option value="kolay">🟢 Kolay</option>
              <option value="orta">🟡 Orta</option>
              <option value="zor">🔴 Zor</option>
            </select>
          </div>

          {/* Sınav Tarihi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
              Sınav Tarihi
            </label>
            <input
              className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition-all"
              value={formData.sinavTarihi}
              onChange={(e) =>
                setFormData({ ...formData, sinavTarihi: e.target.value })
              }
              type="date"
            />
          </div>
        </div>

        <button
  type="submit"
  className={`w-full px-4 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] mt-4 ${
    duzenlenecekDers
      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200"
      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200"
  }`} /* <-- İŞTE EKSİK OLAN KISIM BURASI (Ters tırnak ve süslü parantez) */
>
  {duzenlenecekDers ? "🔄 Ders Güncelle" : "➕ Ders Ekle"}
</button>
      </form>
    </div>
  );
}

export default DersForm;
