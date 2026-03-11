# 📚 Ders Asistanım - Akıllı Çalışma Planlayıcı

Ders Asistanım, öğrencilerin karmaşık çalışma süreçlerini düzenlemek, konuları takip etmek ve haftalık çalışma planlarını optimize etmek için geliştirilmiş modern bir web uygulamasıdır.

Kullanıcının çalışma kapasitesini hesaplar ve esnek gün seçimiyle en verimli çalışma programını otomatik olarak oluşturur.

## ✨ Özellikler (MVP-1)

- **Esnek Çalışma Günleri:** Sistemin dayattığı değil, kullanıcının belirlediği günlere (Örn: Sadece Salı ve Cuma) göre plan oluşturma.
- **Akıllı Kapasite Kontrolü:** Toplam iş yükü ile kullanıcının haftalık boş vaktini karşılaştırarak imkansız planların önüne geçme.
- **Dinamik Planlama Algoritması:** Sınav tarihi ve ders zorluğuna göre konuları önceliklendiren Greedy (Açgözlü) algoritma altyapısı.
- **Detaylı Ders/Konu Yönetimi:** Derslere birden fazla alt konu ekleme ve biten konuları işaretleyip listeden düşme.
- **Veri Güvenliği:** Tüm verilerin tarayıcıda (Local Storage) güvenle saklanması.
- **Modern ve Ferah Arayüz:** Tailwind CSS ile tasarlanmış, sekmeli (Tab) ve kullanıcı dostu panel.

## 🛠️ Kullanılan Teknolojiler

- **Frontend Framework:** React.js (Vite ile oluşturuldu)
- **Stilleme:** Tailwind CSS
- **Durum Yönetimi (State):** React Hooks (`useState`, `useEffect`)
- **Veritabanı/Depolama:** Tarayıcı Yerel Depolaması (Local Storage)
