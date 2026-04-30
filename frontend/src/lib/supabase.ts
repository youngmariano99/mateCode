import { createClient } from '@supabase/supabase-js';

// Las variables de entorno deberían estar en el .env de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("❌ ERROR: VITE_SUPABASE_URL no es válida o está ausente. Verifica las variables de entorno en Netlify.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);
