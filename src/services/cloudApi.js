import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase.js';

/**
 * HomQuest Supabase Cloud API Service v3.0
 * 24/7 Real-Time Cloud Service for Database and Storage (Task Photos)
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

  // Register / Sync family in Supabase 24/7 Cloud Database
  async registerFamily(family) {
    try {
      if (!family || !family.code) return family;

      const cleanCode = family.code.trim().toUpperCase();
      const sanitized = sanitizeCode(cleanCode);

      const entry = {
        id: family.id,
        name: family.name,
        icon: family.icon || '🏠',
        code: cleanCode,
        sanitized_code: sanitized,
        created_at: family.created_at || new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('families').upsert([entry], { onConflict: 'id' });
        if (error) console.error('Error upserting family to Supabase:', error);
      }

      return entry;
    } catch (err) {
      console.error('Error registering family in Supabase:', err);
      return family;
    }
  },

  // Fetch all families from Supabase Cloud
  async fetchFamilies() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('families').select('*');
      if (error || !data) return [];
      return data.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon,
        code: f.code,
        sanitizedCode: f.sanitized_code
      }));
    } catch (err) {
      console.error('Error fetching families from Supabase:', err);
      return [];
    }
  },

  // Fetch family by invite code from Supabase 24/7 Cloud Database
  async fetchFamilyByCode(code) {
    try {
      if (!code) return null;
      const cleanCode = code.trim().toUpperCase();
      const targetSanitized = sanitizeCode(cleanCode);

      if (isSupabaseConfigured) {
        const { data: exactMatch, error: err1 } = await supabase
          .from('families')
          .select('*')
          .eq('code', cleanCode)
          .maybeSingle();

        if (exactMatch && !err1) {
          return { id: exactMatch.id, name: exactMatch.name, icon: exactMatch.icon, code: exactMatch.code };
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
            return { id: found.id, name: found.name, icon: found.icon, code: found.code };
          }
        }
      }

      return null;
    } catch (err) {
      console.error('Error fetching family from Supabase:', err);
      return null;
    }
  },

  // Irreversibly delete a family from Supabase Cloud DB
  async deleteFamily(familyId) {
    try {
      if (!familyId || !isSupabaseConfigured) return;
      await supabase.from('families').delete().eq('id', familyId);
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
        family_id: task.familyId || null,
        title: task.title,
        description: task.description || '',
        icon: task.icon || '📋',
        points: Number(task.points || 0),
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
        bonus_points: Number(task.bonusPoints || 0)
      };

      const { error } = await supabase.from('tasks').upsert([payload], { onConflict: 'id' });
      if (error) console.error('Error syncing task to Supabase:', error);
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
        family_id: member.familyId || null,
        name: member.name,
        email: member.email,
        role: member.role || 'member',
        avatar: member.avatar || '👤',
        level: Number(member.level || 1),
        total_xp: Number(member.totalXP || 0),
        coins: Number(member.coins || 0),
        weekly_points: Number(member.weeklyPoints || 0),
        monthly_points: Number(member.monthlyPoints || 0),
        current_streak: Number(member.currentStreak || 0)
      };

      const { error } = await supabase.from('members').upsert([payload], { onConflict: 'id' });
      if (error) console.error('Error syncing member to Supabase:', error);
    } catch (err) {
      console.error('Error syncing member to Supabase:', err);
    }
  },

  // Fetch all members from Supabase Cloud
  async fetchMembers(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('members').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
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

  // Fetch all tasks from Supabase Cloud
  async fetchTasks(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('tasks').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
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

  // Save/Update Reward in Supabase Cloud
  async syncReward(reward) {
    if (!isSupabaseConfigured || !reward) return;
    try {
      const payload = {
        id: reward.id,
        family_id: reward.familyId || null,
        title: reward.title,
        description: reward.description || '',
        cost: Number(reward.cost || 100),
        icon: reward.icon || '🎁'
      };
      await supabase.from('rewards').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing reward to Supabase:', err);
    }
  },

  // Delete Reward in Supabase Cloud
  async deleteReward(rewardId) {
    if (!isSupabaseConfigured || !rewardId) return;
    try {
      await supabase.from('rewards').delete().eq('id', rewardId);
    } catch (err) {
      console.error('Error deleting reward from Supabase:', err);
    }
  },

  // Fetch Rewards from Supabase Cloud
  async fetchRewards(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('rewards').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(r => ({
        id: r.id,
        familyId: r.family_id,
        title: r.title,
        description: r.description,
        cost: r.cost,
        icon: r.icon
      }));
    } catch (err) {
      console.error('Error fetching rewards from Supabase:', err);
      return [];
    }
  },

  // Save/Update Claimed Reward in Supabase Cloud
  async syncClaimedReward(claim) {
    if (!isSupabaseConfigured || !claim) return;
    try {
      const payload = {
        id: claim.id,
        family_id: claim.familyId || null,
        reward_id: claim.rewardId || null,
        title: claim.title,
        icon: claim.icon || '🎁',
        cost: Number(claim.cost || 0),
        claimed_by: claim.claimedBy,
        claimed_at: claim.claimedAt || new Date().toISOString(),
        status: claim.status || 'pending',
        fulfilled_at: claim.fulfilledAt || null,
        fulfilled_by: claim.fulfilledBy || null
      };
      await supabase.from('claimed_rewards').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing claimed reward to Supabase:', err);
    }
  },

  // Fetch Claimed Rewards from Supabase Cloud
  async fetchClaimedRewards(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('claimed_rewards').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(c => ({
        id: c.id,
        familyId: c.family_id,
        rewardId: c.reward_id,
        title: c.title,
        icon: c.icon,
        cost: c.cost,
        claimedBy: c.claimed_by,
        claimedAt: c.claimed_at,
        status: c.status,
        fulfilledAt: c.fulfilled_at,
        fulfilledBy: c.fulfilled_by
      }));
    } catch (err) {
      console.error('Error fetching claimed rewards from Supabase:', err);
      return [];
    }
  },

  // Save Activity Log to Supabase Cloud
  async syncActivityLog(log) {
    if (!isSupabaseConfigured || !log) return;
    try {
      const payload = {
        id: log.id,
        family_id: log.familyId || null,
        type: log.type,
        member_id: log.memberId || null,
        details: log.details || '',
        points_earned: Number(log.pointsEarned || 0),
        timestamp: log.timestamp || new Date().toISOString()
      };
      await supabase.from('activity_log').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing activity log to Supabase:', err);
    }
  },

  // Fetch Activity Log from Supabase Cloud
  async fetchActivityLog(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('activity_log').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(l => ({
        id: l.id,
        familyId: l.family_id,
        type: l.type,
        memberId: l.member_id,
        details: l.details,
        pointsEarned: l.points_earned,
        timestamp: l.timestamp
      }));
    } catch (err) {
      console.error('Error fetching activity log from Supabase:', err);
      return [];
    }
  },

  // Save Notification to Supabase Cloud
  async syncNotification(notif) {
    if (!isSupabaseConfigured || !notif) return;
    try {
      const payload = {
        id: notif.id,
        family_id: notif.familyId || null,
        title: notif.title,
        message: notif.message,
        read: !!notif.read,
        date: notif.date || new Date().toISOString()
      };
      await supabase.from('notifications').upsert([payload], { onConflict: 'id' });
    } catch (err) {
      console.error('Error syncing notification to Supabase:', err);
    }
  },

  // Fetch Notifications from Supabase Cloud
  async fetchNotifications(familyId = null) {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase.from('notifications').select('*');
      if (familyId) query = query.eq('family_id', familyId);

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map(n => ({
        id: n.id,
        familyId: n.family_id,
        title: n.title,
        message: n.message,
        read: n.read,
        date: n.date
      }));
    } catch (err) {
      console.error('Error fetching notifications from Supabase:', err);
      return [];
    }
  }
};
