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
