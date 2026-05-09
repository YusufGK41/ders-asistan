# 📚 Ders Asistanım - Akıllı Çalışma Planlayıcı

Ders Asistanım, öğrencilerin karmaşık çalışma süreçlerini düzenlemek, konuları takip etmek ve haftalık çalışma planlarını optimize etmek için geliştirilmiş modern bir **bulut tabanlı** web uygulamasıdır.

Kullanıcının çalışma kapasitesini hesaplar ve esnek gün seçimiyle en verimli çalışma programını **Genetik Algoritma** ile otomatik olarak oluşturur.

## ✨ Özellikler (Supabase Entegrasyonlu Versiyon)

### 🔐 **Kullanıcı Kimlik Doğrulama**
- **Güvenli Kayıt/Giriş:** Supabase Auth ile email/password tabanlı kimlik doğrulama
- **Oturum Yönetimi:** React Context API ile global state yönetimi
- **Kullanıcı Profili:** Kişiselleştirilmiş kullanıcı deneyimi
- **Otomatik Çıkış:** Güvenli oturum sonlandırma

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
- **Toast Bildirimleri:** Başarı ve hata mesajları

### 💾 **Bulut Tabanlı Veri Yönetimi**
- **Supabase Entegrasyonu:** Gerçek zamanlı veritabanı
- **Kullanıcı Bazlı Güvenlik:** Row Level Security (RLS) ile veri izolasyonu
- **Real-time Senkronizasyon:** Anlık veri güncelleme
- **Data Kalıcılığı:** Bulutta kalıcı veri saklama
- **Otomatik Yedekleme:** Veri kaybı riski yok

## 🛠️ Kullanılan Teknolojiler

### **Frontend**
- **Framework:** React.js (Vite ile oluşturuldu)
- **Stilleme:** Tailwind CSS
- **Durum Yönetimi:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Bildirimler:** React Toastify
- **UI Components:** Modern ve responsive component yapısı

### **Backend & Veritabanı**
- **Veritabanı:** Supabase (PostgreSQL)
- **Kimlik Doğrulama:** Supabase Auth
- **API:** Supabase REST API
- **Güvenlik:** Row Level Security (RLS)
- **Real-time:** Supabase Realtime Engine

### **Algoritma**
- **Genetik Algoritma:** 445 satır optimize edilmiş kod
- **Optimizasyon:** 100 popülasyon, 50 nesil
- **Planlama:** Haftalık çalışma planı optimizasyonu

## 🚀 Kurulum ve Kullanım

### **Gereksinimler:**
- Node.js (v14 veya üzeri)
- npm veya yarn
- Supabase hesabı

### **Kurulum:**
```bash
# Projeyi klonla
git clone https://github.com/YusufGK41/ders-asistan.git

# Dizine gir
cd ders-asistan

# Bağımlılıkları yükle
npm install

# Supabase ayarları
# 1. .env.example dosyasını .env olarak kopyala
cp .env.example .env

# 2. .env dosyasını Supabase bilgilerini ile doldur
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Uygulamayı başlat
npm run dev
```

### **Supabase Kurulumu:**
1. **Supabase Projesi Oluştur:** [supabase.com](https://supabase.com) üzerinden yeni proje oluştur
2. **Database Tablolarını Oluştur:**
   ```sql
   -- users tablosu (otomatik oluşturulur)
   -- plans tablosu
   CREATE TABLE plans (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     ders_adi TEXT NOT NULL,
     konular JSONB,
     zorluk_seviyesi TEXT,
     sinav_tarihi DATE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. **RLS Kurallarını Ayarla:**
   ```sql
   -- RLS'i aktif et
   ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
   
   -- Kullanıcı sadece kendi verilerini görebilir
   CREATE POLICY "Users can view own plans" ON plans
     FOR SELECT USING (auth.uid() = user_id);
   
   -- Kullanıcı sadece kendi verilerini ekleyebilir
   CREATE POLICY "Users can insert own plans" ON plans
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   -- Kullanıcı sadece kendi verilerini güncelleyebilir
   CREATE POLICY "Users can update own plans" ON plans
     FOR UPDATE USING (auth.uid() = user_id);
   
   -- Kullanıcı sadece kendi verilerini silebilir
   CREATE POLICY "Users can delete own plans" ON plans
     FOR DELETE USING (auth.uid() = user_id);
   ```

### **Kullanım:**
1. **Kayıt Ol:** Email ve şifre ile yeni hesap oluştur
2. **Ders Ekle:** "Ders & Konu Ekle" sekmesinden derslerini ekle
3. **Plan Oluştur:** "Plan Oluştur" sekmesinde çalışma günlerini ve saatlerini seç
4. **Planı Gör:** Otomatik oluşturulan haftalık çalışma planını incele
5. **Düzenle:** Düzenleme butonu ile mevcut dersleri güncelle

## �️ Proje Yapısı

```
src/
├── components/
│   ├── Login.jsx              # Giriş/Kayıt component'i
│   ├── DersForm.jsx           # Ders ekleme/güncelleme formu
│   ├── DersListesi.jsx        # Ders listesi component'i
│   └── PlanGoster.jsx         # Plan gösterim component'i
├── context/
│   └── AuthContext.jsx        # Authentication context
├── utils/
│   ├── supabase.js           # Supabase client
│   ├── supabaseData.js       # Veritabanı işlemleri
│   ├── dataMigration.js       # Veri taşıma yardımcısı
│   ├── hesaplamalar.js       # Matematiksel hesaplamalar
│   └── genetikAlgoritma.js   # Genetik algoritma
├── App.jsx                   # Ana uygulama component'i
└── main.jsx                  # Uygulama giriş noktası
```

## 🔧 Geliştirme

### **Mimari Özellikler:**
- **Namespace Pattern:** `import * as supabaseData` ile fonksiyon çakışması önleme
- **Context API:** Global state management
- **Error Handling:** Toast bildirimleri ve hata yönetimi
- **Security:** Environment variables ve RLS
- **Performance:** Optimized genetik algoritma

### **Veri Akışı:**
1. **Kullanıcı Girişi** → Supabase Auth → Context Update
2. **Ders Ekleme** → Supabase Database → State Update → Toast Notification
3. **Plan Oluşturma** → Genetik Algoritma → Supabase → UI Update

## 🎯 **Projenin Amacı**

Bu proje, öğrencilerin çalışma verimliliğini artırmak için teknolojiyi kullanarak akıllı ve kişiselleştirilmiş çalışma planları oluşturmalarına olanak tanır. 

**Supabase entegrasyonu sayesinde:**
- ✅ **Güvenli çoklu kullanıcı desteği**
- ✅ **Bulut tabanlı veri yönetimi**
- ✅ **Real-time senkronizasyon**
- ✅ **Profesyonel SaaS mimarisi**

Genetik algoritma sayesinde her öğrenci için en uygun çalışma programını otomatik olarak belirler.

## 📊 **Performans Özellikleri**

- **Hızlı Yükleme:** Vite ile optimize edilmiş build süreci
- **Responsive:** Mobil ve masaüstü uyumlu tasarım
- **Real-time:** Anlık veri senkronizasyonu
- **Scalable:** Supabase ile ölçeklenebilir altyapı
- **Secure:** RLS ve environment variable güvenliği

---

**🔗 GitHub:** [https://github.com/YusufGK41/ders-asistan](https://github.com/YusufGK41/ders-asistan)

**🚀 Live Demo:** [Uygulamayı Test Et](https://ders-asistan-demo.vercel.app) *(örnek link)*

**📧 İletişim:** yusufgk41@example.com

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
