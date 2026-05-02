import React from "react";

function DersListesi({ dersler, onDersDuzenle, onDersSil, onKonuToggle }) {
  if (dersler.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8 bg-white p-4 rounded shadow-sm">
        Henüz bir ders planı oluşturulmadı.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {dersler.map((ders) => (
        <div
          key={ders.id}
          className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500 flex justify-between items-start transition-all hover:shadow-lg"
        >
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-800">
                {ders.dersAdi}
              </h2>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${
                  ders.zorlukSeviyesi === "zor"
                    ? "bg-red-100 text-red-600"
                    : ders.zorlukSeviyesi === "orta"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                }`}
              >
                {ders.zorlukSeviyesi}
              </span>
            </div>

            {/* SINAV TARİHİ BURADA */}
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="mr-1">📅</span>
              <span className="font-medium">Sınav Tarihi:</span>
              <span className="ml-1 text-blue-600">
                {ders.sinavTarihi
                  ? new Date(ders.sinavTarihi).toLocaleDateString("tr-TR")
                  : "Belirtilmedi"}
              </span>
            </div>

            {/* KONULAR LİSTESİ */}
            <div className="mt-2 bg-slate-50 p-3 rounded-md">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">
                Çalışılacak Konular:
              </h4>
              <ul className="space-y-1">
                {ders.konular && ders.konular.length > 0 ? (
                  ders.konular.map((konu) => (
                    <li
                      key={konu.id}
                      className="text-gray-600 text-sm flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={konu.bitti}
                        onChange={() => onKonuToggle(ders.id, konu.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-200 ease-in-out cursor-pointer"
                      />

                      {/* Mavi nokta */}
                      <span className="text-blue-400">•</span>

                      {/* Konu adı İÇERİDE olmalı ki CSS etki etsin */}
                      <span
                        className={
                          konu.bitti
                            ? "line-through text-gray-400 italic"
                            : "text-gray-700"
                        }
                      >
                        {konu.ad}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-xs italic">
                    Henüz konu eklenmemiş.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <button 
          onClick={() => onDersDuzenle(ders.id)}
          className="ml-2 bg-blue-50 text-blue-500 p-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors border border-blue-100"
          title="Dersi Düzenle"
          >
            <svg
            className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDersSil(ders.id)}
            className="ml-4 bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-red-100"
            title="Dersi Sil"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          
        </div>
      ))}
    </div>
  );
}

export default DersListesi;
