import { createClient } from '@supabase/supabase-js';

// Default Supabase project configuration (Can be overridden via .env file)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('xyzcompany') && 
  !SUPABASE_ANON_KEY.includes('placeholder_key')
);

// Fallback safety client
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : dummyUrl,
  isSupabaseConfigured ? SUPABASE_ANON_KEY : dummyKey,
  {
    auth: { persistSession: true },
    realtime: { params: { eventsPerSecond: 10 } }
  }
);

export const STORAGE_BUCKET = 'task-proofs';

