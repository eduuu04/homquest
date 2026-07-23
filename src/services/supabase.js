import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

// HomQuest Production Supabase Cloud Credentials
const DEFAULT_SUPABASE_URL = 'https://boudgmhevayakohouiqg.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_cVkRn_uF8hkjt3YbE5tdJA_S7Y6VTkY';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('xyzcompany')
);

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true },
    realtime: { params: { eventsPerSecond: 10 } }
  }
);

export const STORAGE_BUCKET = 'task-proofs';
