import React from "react";

function PlanGoster({ plan }) {
  if (!plan || plan.length === 0) {
    return;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">📅 Haftalık Çalışma Planı</h2>

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
