import { createClient } from '@supabase/supabase-js';

// .env dosyasındaki gizli şifrelerimizi Vite'ın import.meta.env yapısı ile çekiyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);