import React from "react";
import { planiPDFIndir } from '../utils/pdfGenerator';

function PlanGoster({ plan }) {

  const handlePDFIndir = () => {
      // plan ayarları olustur (varsayılan değer)
      const ayarlar = {
        gunSayisi: 7,
        gunlukSaat: 6,
        baslangicSaati: "09:00"
      };

      planiPDFIndir(plan, null, 'calisma-plani.pdf');
    };

  if (!plan || plan.length === 0) {
    return;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">📅 Haftalık Çalışma Planı</h2>
      <button 
      onClick={handlePDFIndir}
      className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        📄 PDF İndir
      </button>

      {plan.map((gunPlani, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">
            {gunPlani.gun}
          </h3>

          <ul className="space-y-2">
            {gunPlani.dersler.map((ders, dersIndex) => (
              <li key={dersIndex} className="bg-gray-50 p-3 rounded">
                <span className="font-medium">{ders.dersAdi}</span>
                <span className="text-gray-600"> - {ders.konuAdi}</span>
                <span className="text-green-600 font-semibold ml-2">
                  ({ders.sure} saat)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default PlanGoster;
