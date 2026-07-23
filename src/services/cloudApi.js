import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';

/**
 * HomQuest Supabase Cloud API Service v2.0
 * 24/7 Serverless Cloud Service for Database and Storage (Task Photos)
 */

export const sanitizeCode = (c) => {
  if (!c) return '';
  return c.toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};

export const cloudApi = {
  // Upload task proof photo to Supabase Storage bucket
  async uploadTaskPhoto(file, taskId) {
    try {
      if (!file) return null;

      // If Supabase is configured with real credentials
      if (isSupabaseConfigured) {
        const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
        const filePath = `proofs/${taskId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Supabase Storage upload error:', uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Falling back to local DataURL for photo preview:', err);
    }

    // Local fallback: Convert to Data URL (base64) for offline / local preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  // Auto-delete verified task photo from Supabase Storage bucket
  async deleteVerifiedPhoto(photoUrl) {
    try {
      if (!photoUrl || !isSupabaseConfigured) return;

      if (photoUrl.includes(STORAGE_BUCKET)) {
        const parts = photoUrl.split(`${STORAGE_BUCKET}/`);
        if (parts.length > 1) {
          const relativePath = parts[1];
          const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([relativePath]);
          if (error) {
            console.error('Error auto-deleting cloud photo:', error);
          } else {
            console.log('📸 Supabase Storage: Foto verificada eliminada automáticamente:', relativePath);
          }
        }
      }
    } catch (err) {
      console.error('Error in deleteVerifiedPhoto:', err);
    }
  },

  // Register family in Supabase 24/7 Cloud Database
  async registerFamily(family) {
    try {
      if (!family || !family.code) return family;

      const cleanCode = family.code.trim().toUpperCase();
      const sanitized = sanitizeCode(cleanCode);

      const entry = {
        id: family.id,
        name: family.name,
        icon: family.icon,
        code: cleanCode,
        sanitized_code: sanitized,
        created_at: new Date().toISOString()
      };

      // 1. Save to Local Shared Registry for instant access
      try {
        const existingStr = localStorage.getItem('hq_global_families');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const map = new Map();
        existing.forEach(f => map.set(f.id, f));
        map.set(family.id, { id: entry.id, name: entry.name, icon: entry.icon, code: entry.code, sanitizedCode: sanitized });
        localStorage.setItem('hq_global_families', JSON.stringify(Array.from(map.values())));

        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('hq_family_sync');
          bc.postMessage({ type: 'FAMILY_REGISTERED', family: entry });
          bc.close();
        }
      } catch (e) {}

      // 2. Publish to Supabase Cloud DB
      if (isSupabaseConfigured) {
        await supabase.from('families').upsert([entry], { onConflict: 'id' });
      }

      return entry;
    } catch (err) {
      console.error('Error registering family in Supabase:', err);
      return family;
    }
  },

  // Fetch family by invite code from Supabase 24/7 Cloud Database
  async fetchFamilyByCode(code) {
    try {
      if (!code) return null;
      const cleanCode = code.trim().toUpperCase();
      const targetSanitized = sanitizeCode(cleanCode);

      // 1. Check Local Registry first for instant response
      try {
        const savedGlobal = localStorage.getItem('hq_global_families');
        if (savedGlobal) {
          const globalList = JSON.parse(savedGlobal);
          const found = globalList.find(f => 
            sanitizeCode(f.code) === targetSanitized || 
            (f.code && f.code.trim().toUpperCase() === cleanCode)
          );
          if (found) return found;
        }
      } catch (e) {}

      // 2. Query Supabase Cloud Database
      if (isSupabaseConfigured) {
        const { data: exactMatch, error: err1 } = await supabase
          .from('families')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (exactMatch && !err1) {
          const familyObj = { id: exactMatch.id, name: exactMatch.name, icon: exactMatch.icon, code: exactMatch.code };
          // Cache in local registry
          this._cacheFamilyLocally(familyObj);
          return familyObj;
        }

        const { data: allFamilies, error: err2 } = await supabase
          .from('families')
          .select('*');

        if (allFamilies && !err2 && Array.isArray(allFamilies)) {
          const found = allFamilies.find(f => 
            sanitizeCode(f.code) === targetSanitized || 
            (f.sanitized_code && f.sanitized_code === targetSanitized)
          );
          if (found) {
            const familyObj = { id: found.id, name: found.name, icon: found.icon, code: found.code };
            this._cacheFamilyLocally(familyObj);
            return familyObj;
          }
        }
      }

      return null;
    } catch (err) {
      console.error('Error fetching family from Supabase:', err);
      return null;
    }
  },

  // Cache family in localStorage for instant access across tabs
  _cacheFamilyLocally(familyObj) {
    try {
      const savedGlobal = localStorage.getItem('hq_global_families');
      const existing = savedGlobal ? JSON.parse(savedGlobal) : [];
      const map = new Map();
      existing.forEach(f => map.set(f.id, f));
      map.set(familyObj.id, familyObj);
      localStorage.setItem('hq_global_families', JSON.stringify(Array.from(map.values())));
    } catch (e) {}
  },

  // Irreversibly delete a family from Supabase Cloud DB
  async deleteFamily(familyId, code) {
    try {
      if (!familyId) return;

      // 1. Remove from Local Registry
      try {
        const savedGlobal = localStorage.getItem('hq_global_families');
        if (savedGlobal) {
          const list = JSON.parse(savedGlobal);
          const filtered = list.filter(f => f.id !== familyId && (code ? f.code !== code.trim().toUpperCase() : true));
          localStorage.setItem('hq_global_families', JSON.stringify(filtered));
        }
      } catch (e) {}

      // 2. Remove from Supabase Cloud DB
      if (isSupabaseConfigured) {
        await supabase.from('families').delete().eq('id', familyId);
      }
    } catch (err) {
      console.error('Error deleting family from Supabase:', err);
    }
  },

  // Save/Update Task in Supabase Cloud
  async syncTask(task) {
    if (!isSupabaseConfigured || !task) return;
    try {
      const payload = {
        id: task.id,
        family_id: task.familyId,
        title: task.title,
        description: task.description || '',
        icon: task.icon || '📋',
        points: task.points || 0,
        difficulty: task.difficulty || 'easy',
        frequency: task.frequency || 'daily',
        assigned_to: task.assignedTo || [],
        requires_photo: !!task.requiresPhoto,
        requires_admin_verification: !!task.requiresAdminVerification,
        status: task.status || 'pending',
        completed_by: task.completedBy || null,
        completed_at: task.completedAt || null,
        approved_by: task.approvedBy || null,
        approved_at: task.approvedAt || null,
        rejection_reason: task.rejectionReason || null,
        photo_url: task.photoUrl || null,
        comment: task.comment || '',
        custom_days: task.customDays || [],
        is_rotative: !!task.isRotative,
        require_other_admin: !!task.requireOtherAdmin,
        time_limit: task.timeLimit || '',
        bonus_points: task.bonusPoints || 0
      };

      await supabase.from('tasks').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing task to Supabase:', err);
    }
  },

  // Delete Task in Supabase Cloud
  async deleteTask(taskId) {
    if (!isSupabaseConfigured || !taskId) return;
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (err) {
      console.error('Error deleting task from Supabase:', err);
    }
  },

  // Save/Update Member in Supabase Cloud
  async syncMember(member) {
    if (!isSupabaseConfigured || !member) return;
    try {
      const payload = {
        id: member.id,
        family_id: member.familyId,
        name: member.name,
        email: member.email,
        role: member.role || 'member',
        avatar: member.avatar || '👤',
        level: member.level || 1,
        total_xp: member.totalXP || 0,
        coins: member.coins || 0,
        weekly_points: member.weeklyPoints || 0,
        monthly_points: member.monthlyPoints || 0,
        current_streak: member.currentStreak || 0
      };

      await supabase.from('members').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing member to Supabase:', err);
    }
  },

  // Fetch members for a family from Supabase
  async fetchMembers(familyId) {
    if (!isSupabaseConfigured || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', familyId);

      if (error || !data) return [];

      return data.map(m => ({
        id: m.id,
        familyId: m.family_id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: m.avatar,
        level: m.level,
        totalXP: m.total_xp,
        coins: m.coins,
        weeklyPoints: m.weekly_points,
        monthlyPoints: m.monthly_points,
        currentStreak: m.current_streak
      }));
    } catch (err) {
      console.error('Error fetching members from Supabase:', err);
      return [];
    }
  },

  // Fetch tasks for a family from Supabase
  async fetchTasks(familyId) {
    if (!isSupabaseConfigured || !familyId) return [];
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', familyId);

      if (error || !data) return [];

      return data.map(t => ({
        id: t.id,
        familyId: t.family_id,
        title: t.title,
        description: t.description,
        icon: t.icon,
        points: t.points,
        difficulty: t.difficulty,
        frequency: t.frequency,
        assignedTo: t.assigned_to || [],
        requiresPhoto: t.requires_photo,
        requiresAdminVerification: t.requires_admin_verification,
        status: t.status,
        completedBy: t.completed_by,
        completedAt: t.completed_at,
        approvedBy: t.approved_by,
        approvedAt: t.approved_at,
        rejectionReason: t.rejection_reason,
        photoUrl: t.photo_url,
        comment: t.comment,
        customDays: t.custom_days || [],
        isRotative: t.is_rotative,
        requireOtherAdmin: t.require_other_admin,
        timeLimit: t.time_limit,
        bonusPoints: t.bonus_points
      }));
    } catch (err) {
      console.error('Error fetching tasks from Supabase:', err);
      return [];
    }
  },

  // Purge legacy test data
  async purgeAllCloudData() {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('families').delete().neq('id', '0');
        await supabase.from('members').delete().neq('id', '0');
        await supabase.from('tasks').delete().neq('id', '0');
      }
      localStorage.removeItem('hq_global_families');
    } catch (e) {}
  }
};
