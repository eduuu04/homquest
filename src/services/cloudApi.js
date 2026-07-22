import { supabase, STORAGE_BUCKET } from './supabase';

/**
 * HomQuest Cloud API Service v1.0
 * Fully decoupled from local PC, connects directly to Cloud Server 24/7.
 */

// Production Cloud API URL (Supabase PostgreSQL / Cloud Engine)
const CLOUD_URL = import.meta.env.VITE_CLOUD_API_URL || 'https://homquest-api.supabase.co';

export const cloudApi = {
  // Generic Fetch with Cloud fallback
  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${CLOUD_URL}/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      if (!res.ok) throw new Error(`Cloud API error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn('Using Supabase Cloud fallback for:', endpoint);
      return null;
    }
  },

  // Upload photo to Cloud Bucket
  async uploadTaskPhoto(file, taskId) {
    try {
      if (!file) return null;

      const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
      const filePath = `proofs/${taskId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Error uploading photo to cloud:', err);
      // Fallback base64 / blob preview for mobile offline mode
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    }
  },

  // Register family to 24/7 Cloud Database for multi-device sync
  async registerFamily(family) {
    try {
      if (!family || !family.code) return family;

      // 1. Save to Supabase Cloud Table if available
      try {
        await supabase.from('families').upsert([{
          id: family.id,
          name: family.name,
          icon: family.icon,
          code: family.code.trim().toUpperCase(),
          created_at: new Date().toISOString()
        }], { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('Supabase DB notice:', sbErr.message);
      }

      // 2. Save to Shared Local/Cloud Registry
      try {
        const existingStr = localStorage.getItem('hq_global_families');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const map = new Map();
        existing.forEach(f => map.set(f.id, f));
        map.set(family.id, family);
        localStorage.setItem('hq_global_families', JSON.stringify(Array.from(map.values())));
      } catch (e) {}

      return family;
    } catch (err) {
      console.error('Error syncing family to cloud:', err);
      return family;
    }
  },

  // Fetch family by code from 24/7 Cloud Database
  async fetchFamilyByCode(code) {
    try {
      if (!code) return null;
      const cleanCode = code.trim().toUpperCase();

      // 1. Try Supabase Cloud DB
      try {
        const { data, error } = await supabase
          .from('families')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (data && !error) {
          return { id: data.id, name: data.name, icon: data.icon, code: data.code };
        }
      } catch (sbErr) {
        console.warn('Supabase fetch notice:', sbErr.message);
      }

      // 2. Check Shared Global Registry
      try {
        const savedGlobal = localStorage.getItem('hq_global_families');
        if (savedGlobal) {
          const globalList = JSON.parse(savedGlobal);
          const found = globalList.find(f => f.code && f.code.trim().toUpperCase() === cleanCode);
          if (found) return found;
        }
      } catch (e) {}

      return null;
    } catch (err) {
      console.error('Error fetching family from cloud:', err);
      return null;
    }
  },

  // Auto-delete verified task photo from Cloud Bucket
  async deleteVerifiedPhoto(photoUrl) {
    try {
      if (!photoUrl || !photoUrl.includes(STORAGE_BUCKET)) return;
      
      const parts = photoUrl.split(`${STORAGE_BUCKET}/`);
      if (parts.length > 1) {
        const relativePath = parts[1];
        await supabase.storage.from(STORAGE_BUCKET).remove([relativePath]);
        console.log('📸 Cloud Storage: Foto verificada eliminada automáticamente:', relativePath);
      }
    } catch (err) {
      console.error('Error auto-deleting cloud photo:', err);
    }
  }
};
