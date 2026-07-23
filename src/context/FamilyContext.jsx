import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { cloudApi, sanitizeCode } from '../services/cloudApi';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  PREDEFINED_TASKS,
  INITIAL_LEVELS,
  INITIAL_STREAKS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REWARDS
} from '../utils/constants';

const FamilyContext = createContext();

export const useFamily = () => useContext(FamilyContext);

export const FamilyProvider = ({ children }) => {
  // ========================================================================
  // CLOUD-FIRST ARCHITECTURE v4.0
  // La nube (Supabase) es la ÚNICA fuente de verdad.
  // localStorage es SÓLO una caché de lectura para arranque rápido.
  // Si algo se borra en la nube, se borra aquí. Sin excepciones.
  // ========================================================================

  // cloudReady = false hasta que la primera sync con la nube termine.
  // Mientras sea false, NO se escribe a localStorage (evita resurrección).
  const [cloudReady, setCloudReady] = useState(false);
  const cloudReadyRef = useRef(false);

  // Current user (solo se persiste en localStorage para session restore)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hq_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [autoLoginEnabled, setAutoLoginEnabled] = useState(() => {
    const saved = localStorage.getItem('hq_auto_login');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Entities: arrancan con cache local, pero se sobreescriben con la nube
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [levels, setLevels] = useState(INITIAL_LEVELS);
  const [streaks, setStreaks] = useState(INITIAL_STREAKS);
  const [activityLog, setActivityLog] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);

  const [familySettings, setFamilySettings] = useState(() => {
    const saved = localStorage.getItem('hq_family_settings');
    return saved ? JSON.parse(saved) : {
      familyName: 'Hogar',
      familyIcon: '🏠',
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false,
    };
  });

  // ========================================================================
  // SYNC ENGINE: Cloud → Local (la nube SIEMPRE gana)
  // ========================================================================

  const syncEverythingWithCloud = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      // Fetch EVERYTHING from cloud in parallel
      const [
        cloudFamilies,
        cloudMembers,
        cloudTasks,
        cloudRewards,
        cloudClaimed,
        cloudLogs,
        cloudNotifs
      ] = await Promise.all([
        cloudApi.fetchFamilies(),
        cloudApi.fetchMembers(),
        cloudApi.fetchTasks(),
        cloudApi.fetchRewards(),
        cloudApi.fetchClaimedRewards(),
        cloudApi.fetchActivityLog(),
        cloudApi.fetchNotifications()
      ]);

      // OVERWRITE local state with exact cloud state. 
      // Empty array = cloud is empty = local must be empty. NO EXCEPTIONS.
      setFamilies(cloudFamilies);
      setMembers(cloudMembers);
      setTasks(cloudTasks);
      setRewards(cloudRewards.length > 0 ? cloudRewards : INITIAL_REWARDS);
      setClaimedRewards(cloudClaimed);
      setActivityLog(cloudLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setNotifications(cloudNotifs.sort((a, b) => new Date(b.date) - new Date(a.date)));

      // Validate currentUser against cloud
      setCurrentUser(prev => {
        if (!prev) return null;

        const existsInCloud = cloudMembers.find(m => m.id === prev.id);
        if (!existsInCloud) {
          // User was deleted from cloud → force logout
          localStorage.removeItem('hq_current_user');
          localStorage.removeItem('hq_last_user');
          return null;
        }

        // If user's family was deleted from cloud, unbind
        if (existsInCloud.familyId && !cloudFamilies.some(f => f.id === existsInCloud.familyId)) {
          const unbound = { ...existsInCloud, familyId: null, role: 'member' };
          cloudApi.syncMember(unbound);
          return unbound;
        }

        return existsInCloud;
      });

      // Mark cloud as ready (first sync complete)
      if (!cloudReadyRef.current) {
        cloudReadyRef.current = true;
        setCloudReady(true);
      }

    } catch (err) {
      console.error('Cloud sync error:', err);
      // If first sync fails, still allow app to render with empty state
      if (!cloudReadyRef.current) {
        cloudReadyRef.current = true;
        setCloudReady(true);
      }
    }
  }, []);

  // ========================================================================
  // REALTIME + POLLING: Detect cloud changes instantly
  // ========================================================================

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCloudReady(true);
      return;
    }

    // Initial sync (blocks rendering via cloudReady)
    syncEverythingWithCloud();

    // Supabase Realtime subscriptions (per-table for reliability)
    const tables = ['families', 'members', 'tasks', 'rewards', 'claimed_rewards', 'activity_log', 'notifications'];
    const channels = tables.map(table =>
      supabase
        .channel(`hq-rt-${table}-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            // Any change on any table → full re-sync from cloud
            syncEverythingWithCloud();
          }
        )
        .subscribe()
    );

    // Backup polling every 3 seconds (in case Realtime is not enabled on tables)
    const interval = setInterval(syncEverythingWithCloud, 3000);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
      clearInterval(interval);
    };
  }, [syncEverythingWithCloud]);

  // ========================================================================
  // localStorage CACHE (ONLY writes when cloudReady is true)
  // This prevents stale localStorage data from "resurrecting" deleted items.
  // ========================================================================

  useEffect(() => {
    if (!cloudReady) return;
    if (currentUser) {
      localStorage.setItem('hq_current_user', JSON.stringify(currentUser));
      localStorage.setItem('hq_last_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hq_current_user');
    }
  }, [currentUser, cloudReady]);

  useEffect(() => { if (cloudReady) localStorage.setItem('hq_auto_login', JSON.stringify(autoLoginEnabled)); }, [autoLoginEnabled, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_families', JSON.stringify(families)); }, [families, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_members', JSON.stringify(members)); }, [members, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_tasks', JSON.stringify(tasks)); }, [tasks, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_rewards', JSON.stringify(rewards)); }, [rewards, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_achievements', JSON.stringify(achievements)); }, [achievements, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_levels', JSON.stringify(levels)); }, [levels, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_streaks', JSON.stringify(streaks)); }, [streaks, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_activity_log', JSON.stringify(activityLog)); }, [activityLog, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_family_settings', JSON.stringify(familySettings)); }, [familySettings, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_notifications', JSON.stringify(notifications)); }, [notifications, cloudReady]);
  useEffect(() => { if (cloudReady) localStorage.setItem('hq_claimed_rewards', JSON.stringify(claimedRewards)); }, [claimedRewards, cloudReady]);

  // ========================================================================
  // AUTO-LOGIN (only after cloud is ready)
  // ========================================================================

  useEffect(() => {
    if (!cloudReady || !autoLoginEnabled || currentUser || members.length === 0) return;

    const savedUserStr = localStorage.getItem('hq_last_user');
    let matchedUser = null;
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        matchedUser = members.find(m => m.id === parsed.id || m.email === parsed.email);
      } catch (e) {
        matchedUser = null;
      }
    }
    if (!matchedUser) matchedUser = members[0];
    if (matchedUser) setCurrentUser(matchedUser);
  }, [autoLoginEnabled, members, currentUser, cloudReady]);

  // ========================================================================
  // AUTH
  // ========================================================================

  const login = (email) => {
    const found = members.find(m => m.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'No existe ninguna cuenta con ese email en esta app.' };
  };

  const register = async (name, email, role = 'member') => {
    const cleanEmail = email.toLowerCase().trim();
    if (members.some(m => m.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'El email ya está registrado. Inicia sesión con él.' };
    }

    const newMember = {
      id: 'm_' + Date.now(),
      name,
      email: cleanEmail,
      role: role || 'member',
      avatar: name.substring(0, 2).toUpperCase(),
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      coins: 0,
      familyId: null
    };

    // Write to cloud FIRST, then update local
    await cloudApi.syncMember(newMember);
    setMembers(prev => [...prev, newMember]);
    setCurrentUser(newMember);

    const logEntry = {
      id: 'l_' + Date.now(),
      type: 'member_registered',
      memberId: newMember.id,
      details: 'Se registró en HomQuest',
      pointsEarned: 0,
      timestamp: new Date().toISOString()
    };
    await cloudApi.syncActivityLog(logEntry);
    setActivityLog(prev => [logEntry, ...prev]);

    return { success: true, user: newMember };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // ========================================================================
  // NOTIFICATIONS (cloud-first)
  // ========================================================================

  const addNotification = async (title, message) => {
    const notif = {
      id: 'notif_' + Date.now(),
      familyId: currentUser?.familyId || null,
      title,
      message,
      read: false,
      date: new Date().toISOString()
    };
    await cloudApi.syncNotification(notif);
    setNotifications(prev => [notif, ...prev]);
  };

  // ========================================================================
  // INVITE CODE CAPTURE
  // ========================================================================

  const captureInviteCode = () => {
    try {
      const href = window.location.href;
      let code = null;
      if (href.includes('code=')) {
        code = href.split('code=')[1].split('&')[0].split('#')[0];
      } else if (href.includes('join=')) {
        code = href.split('join=')[1].split('&')[0].split('#')[0];
      }
      if (code) {
        const clean = decodeURIComponent(code).trim();
        sessionStorage.setItem('hq_invite_code', clean);
        return clean;
      }
    } catch (e) {}
    return sessionStorage.getItem('hq_invite_code') || null;
  };

  useEffect(() => { captureInviteCode(); }, []);

  // ========================================================================
  // FAMILY MANAGEMENT (all writes go to cloud FIRST)
  // ========================================================================

  const createFamily = async (name, icon) => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newFamily = {
      id: 'f_' + Date.now(),
      name,
      icon,
      code: `HOM-${randomCode}`
    };

    // 1. Write family to cloud
    await cloudApi.registerFamily(newFamily);
    setFamilies(prev => [...prev, newFamily]);

    // 2. Update member as admin
    let updatedUser = null;
    if (currentUser) {
      updatedUser = { ...currentUser, familyId: newFamily.id, role: 'admin' };
      await cloudApi.syncMember(updatedUser);
      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);
    }

    setFamilySettings({
      familyName: name,
      familyIcon: icon,
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false,
    });

    // 3. Seed starter tasks to cloud
    if (updatedUser) {
      const starterTasks = PREDEFINED_TASKS.slice(0, 4).map((pt, idx) => {
        const t = {
          id: 't_seed_' + Date.now() + '_' + idx,
          title: pt.title,
          description: `Tarea inicial recomendada para el hogar`,
          icon: pt.icon,
          points: pt.points,
          difficulty: pt.difficulty,
          frequency: pt.frequency,
          assignedTo: [updatedUser.id],
          requiresPhoto: pt.difficulty === 'medium' || pt.difficulty === 'hard',
          requiresAdminVerification: true,
          status: 'pending',
          completedBy: null,
          completedAt: null,
          photoUrl: null,
          familyId: newFamily.id
        };
        cloudApi.syncTask(t);
        return t;
      });
      setTasks(prev => [...starterTasks, ...prev]);
    }

    await addNotification('Familia Creada', `¡Has creado la familia "${name}" con código ${newFamily.code}!`);
    return { success: true, family: newFamily };
  };

  const joinFamily = async (code, role = 'member') => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Por favor, introduce un código de familia válido.' };
    }

    const cleanInput = code.trim();
    const targetSanitized = sanitizeCode(cleanInput);

    // Search cloud first, then local
    let foundFamily = null;
    try {
      foundFamily = await cloudApi.fetchFamilyByCode(cleanInput);
    } catch (e) {}

    if (!foundFamily) {
      foundFamily = families.find(f => sanitizeCode(f.code) === targetSanitized);
    }

    if (!foundFamily) {
      return { success: false, message: `Código de familia "${code.trim()}" no encontrado en la nube.` };
    }

    if (currentUser) {
      const newRole = currentUser.role === 'admin' ? 'admin' : (role || 'member');
      const updatedUser = {
        ...currentUser,
        familyId: foundFamily.id,
        role: newRole
      };

      // Write to cloud first
      await cloudApi.syncMember(updatedUser);
      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);

      // Pull latest family data from cloud
      const [cloudMembers, cloudTasks] = await Promise.all([
        cloudApi.fetchMembers(foundFamily.id),
        cloudApi.fetchTasks(foundFamily.id)
      ]);
      if (cloudMembers.length > 0) setMembers(cloudMembers);
      if (cloudTasks.length > 0) setTasks(cloudTasks);

      sessionStorage.removeItem('hq_invite_code');
    }

    setFamilySettings(prev => ({
      ...prev,
      familyName: foundFamily.name,
      familyIcon: foundFamily.icon || '🏠'
    }));

    await addNotification('Unido a Familia', `¡Te has unido a la familia "${foundFamily.name}"!`);
    return { success: true, family: foundFamily };
  };

  const deleteFamily = async (familyIdToDelete) => {
    const targetId = familyIdToDelete || currentUser?.familyId;
    if (!targetId) return { success: false, message: 'No hay familia activa para eliminar.' };

    // Delete from cloud FIRST
    await cloudApi.deleteFamily(targetId);

    setFamilies(prev => prev.filter(f => f.id !== targetId));
    setMembers(prev => prev.filter(m => m.familyId !== targetId));
    setTasks(prev => prev.filter(t => t.familyId !== targetId));

    if (currentUser && currentUser.familyId === targetId) {
      const resetUser = { ...currentUser, familyId: null, role: 'member' };
      await cloudApi.syncMember(resetUser);
      setCurrentUser(resetUser);
    }

    await addNotification('Familia Eliminada', 'La familia ha sido eliminada de la nube.');
    return { success: true };
  };

  // ========================================================================
  // TASK MANAGEMENT (all writes go to cloud FIRST)
  // ========================================================================

  const addTask = async (taskData) => {
    const newTask = {
      id: 't_' + Date.now(),
      title: taskData.title,
      description: taskData.description || '',
      icon: taskData.icon || '📋',
      points: Number(taskData.points),
      difficulty: taskData.difficulty,
      frequency: taskData.frequency,
      assignedTo: taskData.assignedTo || [],
      requiresPhoto: !!taskData.requiresPhoto,
      requiresAdminVerification: true,
      status: 'pending',
      completedBy: null,
      completedAt: null,
      photoUrl: null,
      customDays: taskData.customDays || [],
      isRotative: !!taskData.isRotative,
      requireOtherAdmin: !!taskData.requireOtherAdmin,
      timeLimit: taskData.timeLimit || '',
      bonusPoints: Number(taskData.bonusPoints || 0),
      familyId: currentUser?.familyId || null
    };

    await cloudApi.syncTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    await addNotification('Nueva Tarea', `Se ha creado la tarea: ${taskData.title}`);
  };

  const editTask = async (id, updatedData) => {
    setTasks(prev => {
      return prev.map(t => {
        if (t.id === id) {
          const merged = { ...t, ...updatedData };
          cloudApi.syncTask(merged);
          return merged;
        }
        return t;
      });
    });
  };

  const deleteTask = async (id) => {
    await cloudApi.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskAssignment = async (taskId, memberId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const alreadyAssigned = t.assignedTo?.includes(memberId);
        const newAssigned = alreadyAssigned
          ? t.assignedTo.filter(id => id !== memberId)
          : [...(t.assignedTo || []), memberId];
        const updated = { ...t, assignedTo: newAssigned };
        cloudApi.syncTask(updated);
        return updated;
      }
      return t;
    }));
  };

  const updateUserAvatar = async (avatar) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar };
    await cloudApi.syncMember(updatedUser);
    setCurrentUser(updatedUser);
    setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
  };

  const completeTask = async (taskId, photoBlobOrUrl, comment = '') => {
    let finalPhotoUrl = null;

    if (photoBlobOrUrl instanceof Blob || photoBlobOrUrl instanceof File) {
      finalPhotoUrl = await cloudApi.uploadTaskPhoto(photoBlobOrUrl, taskId);
    } else if (typeof photoBlobOrUrl === 'string') {
      finalPhotoUrl = photoBlobOrUrl;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: 'sent',
      completedBy: currentUser.id,
      completedAt: new Date().toISOString(),
      photoUrl: finalPhotoUrl,
      comment: comment || ''
    };

    await cloudApi.syncTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    if (currentUser.role === 'admin' && !task.requireOtherAdmin) {
      await approveTask(taskId, currentUser.id, currentUser.id);
    } else {
      await addNotification('Tarea Completada', `${currentUser.name} completó "${task.title}". Pendiente de aprobación.`);
    }
  };

  const approveTask = async (taskId, approvedByUserId, completedByUserId = null) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.photoUrl) {
      await cloudApi.deleteVerifiedPhoto(task.photoUrl);
    }

    const coinsEarned = Number(task.points || 0);
    const earnedXP = Number(task.points || 0);
    const targetUserId = completedByUserId || task.completedBy || currentUser?.id;

    const approvedTask = {
      ...task,
      status: 'approved',
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null
    };

    await cloudApi.syncTask(approvedTask);
    setTasks(prev => prev.map(t => t.id === taskId ? approvedTask : t));

    setMembers(prev => prev.map(m => {
      if (m.id === targetUserId) {
        const newXP = (m.totalXP || 0) + earnedXP;
        const newCoins = (m.coins || 0) + coinsEarned;
        const newWeekly = (m.weeklyPoints || 0) + coinsEarned;
        const newMonthly = (m.monthlyPoints || 0) + coinsEarned;
        const newStreak = (m.currentStreak || 0) + 1;

        let newLvl = m.level || 1;
        const sortedLevels = [...levels].sort((a, b) => b.level - a.level);
        const reachedLevel = sortedLevels.find(l => newXP >= l.xpNeeded);
        if (reachedLevel && reachedLevel.level > newLvl) {
          newLvl = reachedLevel.level;
          addNotification('¡Subida de nivel!', `🎉 ¡${m.name} ha subido al nivel ${newLvl}: ${reachedLevel.title}!`);
        }

        const updatedMember = {
          ...m,
          totalXP: newXP,
          coins: newCoins,
          level: newLvl,
          currentStreak: newStreak,
          weeklyPoints: newWeekly,
          monthlyPoints: newMonthly
        };
        cloudApi.syncMember(updatedMember);
        return updatedMember;
      }
      return m;
    }));

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser(prev => {
        const newXP = (prev.totalXP || 0) + earnedXP;
        const newCoins = (prev.coins || 0) + coinsEarned;
        const newWeekly = (prev.weeklyPoints || 0) + coinsEarned;
        const newMonthly = (prev.monthlyPoints || 0) + coinsEarned;
        const newStreak = (prev.currentStreak || 0) + 1;
        let newLvl = prev.level || 1;
        const sortedLevels = [...levels].sort((a, b) => b.level - a.level);
        const reachedLevel = sortedLevels.find(l => newXP >= l.xpNeeded);
        if (reachedLevel && reachedLevel.level > newLvl) newLvl = reachedLevel.level;

        const updated = { ...prev, totalXP: newXP, coins: newCoins, level: newLvl, currentStreak: newStreak, weeklyPoints: newWeekly, monthlyPoints: newMonthly };
        cloudApi.syncMember(updated);
        return updated;
      });
    }

    const logEntry = {
      id: 'l_' + Date.now(),
      familyId: task.familyId || currentUser?.familyId || null,
      type: 'task_completed',
      memberId: targetUserId,
      details: task.title,
      pointsEarned: coinsEarned,
      timestamp: new Date().toISOString()
    };
    await cloudApi.syncActivityLog(logEntry);
    setActivityLog(prev => [logEntry, ...prev]);
  };

  const rejectTask = async (taskId, approvedByUserId, reason) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.photoUrl) await cloudApi.deleteVerifiedPhoto(task.photoUrl);

    const rejectedTask = {
      ...task,
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null
    };

    await cloudApi.syncTask(rejectedTask);
    setTasks(prev => prev.map(t => t.id === taskId ? rejectedTask : t));
    await addNotification('Tarea Rechazada', `❌ Tu tarea "${task.title}" fue rechazada. Motivo: ${reason}`);
  };

  // ========================================================================
  // REWARDS (cloud-first)
  // ========================================================================

  const claimReward = async (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || currentUser.coins < reward.cost) return { success: false, message: 'Monedas insuficientes' };

    const updatedCoins = currentUser.coins - reward.cost;
    const newClaim = {
      id: 'claim_' + Date.now(),
      rewardId: reward.id,
      title: reward.title,
      icon: reward.icon,
      cost: reward.cost,
      claimedBy: currentUser.id,
      claimedAt: new Date().toISOString(),
      status: 'pending',
      familyId: currentUser.familyId || null
    };

    await cloudApi.syncClaimedReward(newClaim);
    setClaimedRewards(prev => [newClaim, ...prev]);

    const updatedMember = { ...currentUser, coins: updatedCoins };
    await cloudApi.syncMember(updatedMember);
    setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedMember : m));
    setCurrentUser(updatedMember);

    const logEntry = {
      id: 'l_' + Date.now(),
      familyId: currentUser.familyId || null,
      type: 'reward_claimed',
      memberId: currentUser.id,
      details: reward.title,
      pointsEarned: -reward.cost,
      timestamp: new Date().toISOString()
    };
    await cloudApi.syncActivityLog(logEntry);
    setActivityLog(prev => [logEntry, ...prev]);

    await addNotification('Recompensa Canjeada', `🎁 ${currentUser.name} canjeó: "${reward.title}" (-${reward.cost}🪙)`);
    return { success: true, message: '¡Recompensa canjeada con éxito!' };
  };

  const fulfillRewardClaim = async (claimId) => {
    const found = claimedRewards.find(c => c.id === claimId);
    if (found) {
      const merged = { ...found, status: 'fulfilled', fulfilledAt: new Date().toISOString(), fulfilledBy: currentUser?.id };
      await cloudApi.syncClaimedReward(merged);
      setClaimedRewards(prev => prev.map(c => c.id === claimId ? merged : c));
    }
    await addNotification('Recompensa Entregada', `🎉 Se ha entregado la recompensa.`);
  };

  const addReward = async (rewardData) => {
    const newRew = { id: 'rew_' + Date.now(), familyId: currentUser?.familyId || null, ...rewardData };
    await cloudApi.syncReward(newRew);
    setRewards(prev => [...prev, newRew]);
  };

  const deleteReward = async (id) => {
    await cloudApi.deleteReward(id);
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  // ========================================================================
  // LOCAL-ONLY CONFIG (levels, streaks, achievements)
  // ========================================================================

  const addLevel = (lvlData) => { setLevels(prev => [...prev, lvlData].sort((a, b) => a.level - b.level)); };
  const deleteLevel = (levelNumber) => { setLevels(prev => prev.filter(l => l.level !== levelNumber)); };
  const editLevel = (levelNumber, updatedData) => { setLevels(prev => prev.map(l => l.level === levelNumber ? { ...l, ...updatedData } : l)); };
  const addStreak = (streakData) => { setStreaks(prev => [...prev, { id: 'str_' + Date.now(), ...streakData }]); };
  const deleteStreak = (id) => { setStreaks(prev => prev.filter(s => s.id !== id)); };
  const addAchievement = (achData) => { setAchievements(prev => [...prev, { id: 'ach_' + Date.now(), ...achData, unlockedBy: [] }]); };
  const deleteAchievement = (id) => { setAchievements(prev => prev.filter(a => a.id !== id)); };
  const markNotificationsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  // ========================================================================
  // FILTERED OUTPUT (scope to current family)
  // ========================================================================

  const currentFamilyId = currentUser?.familyId;
  const filteredMembers = currentFamilyId ? members.filter(m => m.familyId === currentFamilyId || !m.familyId) : members;
  const filteredTasks = currentFamilyId ? tasks.filter(t => t.familyId === currentFamilyId || !t.familyId) : tasks;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <FamilyContext.Provider value={{
      currentUser,
      setCurrentUser,
      members: filteredMembers,
      setMembers,
      tasks: filteredTasks,
      setTasks,
      rewards,
      achievements,
      levels,
      streaks,
      activityLog,
      familySettings,
      setFamilySettings,
      notifications,
      autoLoginEnabled,
      setAutoLoginEnabled,
      getPendingInviteCode: captureInviteCode,
      login,
      register,
      logout,
      createFamily,
      joinFamily,
      deleteFamily,
      families,
      addTask,
      editTask,
      deleteTask,
      toggleTaskAssignment,
      updateUserAvatar,
      completeTask,
      approveTask,
      rejectTask,
      claimReward,
      claimedRewards,
      fulfillRewardClaim,
      addLevel,
      deleteLevel,
      editLevel,
      addReward,
      deleteReward,
      addStreak,
      deleteStreak,
      addAchievement,
      deleteAchievement,
      markNotificationsRead,
      cloudReady
    }}>
      {children}
    </FamilyContext.Provider>
  );
};
