import { createClient } from '@supabase/supabase-js';

// Default Supabase project configuration (Can be overridden via .env file)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

export const STORAGE_BUCKET = 'task-proofs';
