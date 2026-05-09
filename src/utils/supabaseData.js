import { supabase } from "./supabase";

// 1. Kullanıcıya özel dersleri getir
export const dersleriGetir = async (userId) => {
    const { data, error } = await supabase
    .from("subjects") // plans DEĞİL, subjects
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

export const dersEkle = async (userId, yeniDers) => {
    const { data, error } = await supabase
    .from("subjects")
    .insert([{
        user_id: userId,
        ders_adi: yeniDers.dersAdi,
        konular: yeniDers.konular,
        zorluk_seviyesi: yeniDers.zorlukSeviyesi,
        // EĞER TARİH BOŞSA NULL GÖNDER:
        sinav_tarihi: yeniDers.sinavTarihi === "" ? null : yeniDers.sinavTarihi 
    }])
    .select();

    if (error) throw error;
    return data[0]; 
};

// 3. Ders Güncelleme
export const dersGuncelle = async (userId, guncelDers) => {
    const { data, error } = await supabase
    .from('subjects')
    .update({
      ders_adi: guncelDers.dersAdi,
      konular: guncelDers.konular,
      zorluk_seviyesi: guncelDers.zorlukSeviyesi,
      // EĞER TARİH BOŞSA NULL GÖNDER:
      sinav_tarihi: guncelDers.sinavTarihi === "" ? null : guncelDers.sinavTarihi
    })
    .eq('id', guncelDers.id)
    .eq('user_id', userId)
    .select();
  
  if (error) throw error;
  return data;
};

// 4. Ders Silme
export const dersSil = async (userId, dersId) => {
  const { error } = await supabase
    .from('subjects') // plans DEĞİL, subjects
    .delete()
    .eq('id', dersId)
    .eq('user_id', userId);
  
  if (error) throw error;
};


// 5. Genetik Algoritmanın Ürettiği Planı Kaydet (Eski planı silip yenisini yazar)
export const planiKaydet = async (userId, planVerisi) => {
    // Önce kullanıcının önceki haftadan kalan eski planını silelim ki çöplük olmasın
    await supabase
        .from("plans")
        .delete()
        .eq("user_id", userId);

    // Şimdi yepyeni evrimleşmiş planı kaydedelim
    const { data, error } = await supabase
        .from("plans")
        .insert([{
            user_id: userId,
            plan_verisi: planVerisi // JSONB olarak tüm planı tek kalemde atıyoruz
        }])
        .select();

    if (error) throw error;
    return data[0]; 
};

// 6. Kaydedilmiş Planı Getir (Sayfa yüklendiğinde çalışacak)
export const planiGetir = async (userId) => {
    const { data, error } = await supabase
        .from("plans")
        .select("plan_verisi")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;
    // Eğer plan varsa içindeki veriyi dön, yoksa null dön
    return data.length > 0 ? data[0].plan_verisi : null;
};