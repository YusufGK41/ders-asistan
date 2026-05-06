import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Login() {
  // Mod kontrolü: true ise "Giriş Yap", false ise "Kayıt Ol"
  const [isLoginMode, setIsLoginMode] = useState(true);

  // useAuth'tan hem login hem de register fonksiyonlarını çekiyoruz
  const { login, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Kayıt olanlar için yeni alanımız
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLoginMode) {
        // GİRİŞ İŞLEMİ
        await login(email, password);
        toast.success('Giriş başarılı! 🎉');
      } else {
        // KAYIT İŞLEMİ
        if (!name.trim()) {
          toast.warning('Lütfen adınızı girin.');
          setLoading(false);
          return;
        }
        await register(email, password, name);
        toast.success('Kayıt başarılı! Aramıza hoş geldin. 🎉');
      }
    } catch (error) {
      toast.error(error.message || 'Bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 animate-in fade-in zoom-in duration-300">
        
        {/* Proje Başlığı ve Durum Metni */}
        <div className="text-center mb-6">
           <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
             📚 Ders <span className="text-blue-600">Asistanım</span>
           </h1>
           <h2 className="text-xl font-semibold text-slate-600">
             {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
           </h2>
        </div>
        
        {/* Sadece "Kayıt Ol" modundayken İsim inputunu göster */}
        {!isLoginMode && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız Soyadınız"
            className="w-full p-3 border border-slate-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required={!isLoginMode}
          />
        )}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-slate-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre (En az 6 karakter)"
          className="w-full p-3 border border-slate-300 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
          minLength={6}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold p-3 rounded hover:bg-blue-700 disabled:opacity-70 transition-colors"
        >
          {loading 
            ? 'İşlem yapılıyor...' 
            : (isLoginMode ? 'Giriş Yap' : 'Kayıt Ol')
          }
        </button>

        {/* Giriş ve Kayıt Ekranları Arasında Geçiş Butonu */}
        <div className="mt-5 text-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              // Mod değişince formun içini temizliyoruz ki eski yazılar kalmasın
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
          >
            {isLoginMode 
              ? "Hesabınız yok mu? Hemen Kayıt Olun" 
              : "Zaten hesabınız var mı? Giriş Yapın"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;