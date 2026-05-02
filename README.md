# 📚 Ders Asistanım - Akıllı Çalışma Planlayıcı

Ders Asistanım, öğrencilerin karmaşık çalışma süreçlerini düzenlemek, konuları takip etmek ve haftalık çalışma planlarını optimize etmek için geliştirilmiş modern bir web uygulamasıdır.

Kullanıcının çalışma kapasitesini hesaplar ve esnek gün seçimiyle en verimli çalışma programını **Genetik Algoritma** ile otomatik olarak oluşturur.

## ✨ Özellikler (Gelişmiş Versiyon)

### 🎯 **Akıllı Planlama Sistemi**
- **Esnek Çalışma Günleri:** Kullanıcının belirlediği günlere göre plan oluşturma (Pazartesi, Salı, Çarşamba...)
- **Genetik Algoritma:** 100 popülasyon ve 50 nesil ile en optimal çalışma planını bulma
- **Akıllı Kapasite Kontrolü:** Toplam iş yükü ile kullanıcının haftalık boş vaktini karşılaştırma
- **Önceliklendirme:** Sınav tarihine ve ders zorluğuna göre konu sıralama
- **Ceza Puanlama Sistemi:** Odak dağılması ve ısınma turu cezaları ile plan kalitesi

### 📝 **Ders Yönetimi**
- **Ders Ekleme:** Ders adı, zorluk seviyesi, sınav tarihi ve konular
- **Ders Güncelleme:** Mevcut dersleri düzenleme (turuncu tema ile görsel feedback)
- **Konu Takibi:** Biten konuları işaretleme ve listeden düşme
- **Zorluk Seviyeleri:** Kolay, Orta, Zor olarak sınıflandırma

### 🎨 **Kullanıcı Deneyimi**
- **Sekmeli Arayüz:** Ders yönetimi ve plan oluşturma ayrı sekmeler
- **Dinamik Formlar:** Ekleme ve güncelleme modları arasında geçiş
- **Responsive Tasarım:** Mobil ve masaüstü uyumlu
- **Modern UI:** Tailwind CSS ile şık ve ferah tasarım

### 💾 **Veri Yönetimi**
- **Local Storage:** Tüm veriler tarayıcıda güvenle saklanır
- **Otomatik Kaydet:** Her değişiklik anında kaydedilir
- **Veri Kalıcılığı:** Sayfa yenilemede veriler kaybolmaz

## 🛠️ Kullanılan Teknolojiler

- **Frontend Framework:** React.js (Vite ile oluşturuldu)
- **Stilleme:** Tailwind CSS
- **Durum Yönetimi:** React Hooks (`useState`, `useEffect`)
- **Algoritma:** Genetik Algoritma (445 satır optimize edilmiş kod)
- **Veritabanı/Depolama:** Tarayıcı Yerel Depolaması (Local Storage)

## 🚀 Kurulum ve Kullanım

### **Gereksinimler:**
- Node.js (v14 veya üzeri)
- npm veya yarn

### **Kurulum:**
```bash
# Projeyi klonla
git clone https://github.com/YusufGK41/ders-asistan.git

# Dizine gir
cd ders-asistan

# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm run dev
```

### **Kullanım:**
1. **Ders Ekle:** "Ders & Konu Ekle" sekmesinden derslerini ekle
2. **Plan Oluştur:** "Plan Oluştur" sekmesinde çalışma günlerini ve saatlerini seç
3. **Planı Gör:** Otomatik oluşturulan haftalık çalışma planını incele
4. **Düzenle:** Düzenleme butonu ile mevcut dersleri güncelle

## 🎯 **Projenin Amacı**

Bu bitirme projesi, öğrencilerin çalışma verimliliğini artırmak için teknolojiyi kullanarak akıllı ve kişiselleştirilmiş çalışma planları oluşturmalarına olanak tanır. Genetik algoritma sayesinde her öğrenci için en uygun çalışma programını otomatik olarak belirler.

---

**🔗 GitHub:** [https://github.com/YusufGK41/ders-asistan](https://github.com/YusufGK41/ders-asistan)
