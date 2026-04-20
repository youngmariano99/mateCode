import { createClient } from '@supabase/supabase-js';

// Las variables de entorno deberían estar en el .env de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yavppbxrgzcpixhyqaoa.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdnBwYnhyZ3pjcGl4aHlxYW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTA2MzMsImV4cCI6MjA4OTU4NjYzM30.OgSiY-0SzmIAOaZA5seGYdOxfbIlnPJ2VqmV9U5cD0s';

export const supabase = createClient(supabaseUrl, supabaseKey);
