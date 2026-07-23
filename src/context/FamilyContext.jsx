import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
  // Current user state persistent
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hq_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto Login toggle state
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(() => {
    const saved = localStorage.getItem('hq_auto_login');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // State entities initialized from LocalStorage (fallback before cloud sync)
  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('hq_families');
    return saved ? JSON.parse(saved) : [];
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('hq_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('hq_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [rewards, setRewards] = useState(() => {
    const saved = localStorage.getItem('hq_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('hq_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [levels, setLevels] = useState(() => {
    const saved = localStorage.getItem('hq_levels');
    return saved ? JSON.parse(saved) : INITIAL_LEVELS;
  });

  const [streaks, setStreaks] = useState(() => {
    const saved = localStorage.getItem('hq_streaks');
    return saved ? JSON.parse(saved) : INITIAL_STREAKS;
  });

  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem('hq_activity_log');
    return saved ? JSON.parse(saved) : [];
  });

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

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hq_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [claimedRewards, setClaimedRewards] = useState(() => {
    const saved = localStorage.getItem('hq_claimed_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  // --- CLOUD FIRST (SINGLE SOURCE OF TRUTH) ---
  // The cloud strictly dictates current state. Local items never re-upload if deleted from cloud.

  const syncEverythingWithCloud = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      // 1. Fetch exact current state from Supabase Cloud
      const cloudFamilies = await cloudApi.fetchFamilies();
      const cloudMembers = await cloudApi.fetchMembers();
      const cloudTasks = await cloudApi.fetchTasks();
      const cloudRewards = await cloudApi.fetchRewards();
      const cloudClaimed = await cloudApi.fetchClaimedRewards();
      const cloudLogs = await cloudApi.fetchActivityLog();
      const cloudNotifs = await cloudApi.fetchNotifications();

      // 2. Overwrite local state with exact Cloud state (NO MERGING OF DELETED LOCAL ITEMS)
      setFamilies(cloudFamilies);
      setMembers(cloudMembers);
      setTasks(cloudTasks);
      if (cloudRewards.length > 0) setRewards(cloudRewards);
      setClaimedRewards(cloudClaimed);
      setActivityLog(cloudLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setNotifications(cloudNotifs.sort((a, b) => new Date(b.date) - new Date(a.date)));

      // 3. Verify currentUser consistency with Cloud
      setCurrentUser(prev => {
        if (!prev) return null;
        const existsInCloud = cloudMembers.find(m => m.id === prev.id);
        if (!existsInCloud) return null; // Logged out if user deleted from Cloud

        // If user's family was deleted from Cloud, unbind familyId
        if (existsInCloud.familyId && !cloudFamilies.some(f => f.id === existsInCloud.familyId)) {
          const unbound = { ...existsInCloud, familyId: null, role: 'member' };
          cloudApi.syncMember(unbound);
          return unbound;
        }

        return existsInCloud;
      });

    } catch (err) {
      console.error('Error during cloud-first sync:', err);
    }
  }, []);

  // Real-Time Postgres Subscription: Listen to any INSERT, UPDATE, DELETE on Supabase Cloud
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Initial pull
    syncEverythingWithCloud();

    // Subscribe to real-time database changes (instant <1s sync across devices)
    const channel = supabase
      .channel('homquest-realtime-cloud')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          // Instantly sync state whenever ANY change occurs in Supabase Cloud
          syncEverythingWithCloud();
        }
      )
      .subscribe();

    // Secondary safety polling every 1.5 seconds
    const interval = setInterval(syncEverythingWithCloud, 1500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [syncEverythingWithCloud]);

  // Mirror current state to localStorage as offline view cache
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hq_current_user', JSON.stringify(currentUser));
      localStorage.setItem('hq_last_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hq_current_user');
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('hq_auto_login', JSON.stringify(autoLoginEnabled)); }, [autoLoginEnabled]);
  useEffect(() => { localStorage.setItem('hq_families', JSON.stringify(families)); }, [families]);
  useEffect(() => { localStorage.setItem('hq_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('hq_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('hq_rewards', JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem('hq_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('hq_levels', JSON.stringify(levels)); }, [levels]);
  useEffect(() => { localStorage.setItem('hq_streaks', JSON.stringify(streaks)); }, [streaks]);
  useEffect(() => { localStorage.setItem('hq_activity_log', JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem('hq_family_settings', JSON.stringify(familySettings)); }, [familySettings]);
  useEffect(() => { localStorage.setItem('hq_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('hq_claimed_rewards', JSON.stringify(claimedRewards)); }, [claimedRewards]);

  // Auth
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

    setMembers(prev => [...prev, newMember]);
    setCurrentUser(newMember);

    await cloudApi.syncMember(newMember);

    const logEntry = {
      id: 'l_' + Date.now(),
      type: 'member_registered',
      memberId: newMember.id,
      details: 'Se registró en HomQuest',
      pointsEarned: 0,
      timestamp: new Date().toISOString()
    };
    setActivityLog(prev => [logEntry, ...prev]);
    await cloudApi.syncActivityLog(logEntry);

    return { success: true, user: newMember };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addNotification = async (title, message) => {
    const notif = {
      id: 'notif_' + Date.now(),
      familyId: currentUser?.familyId || null,
      title,
      message,
      read: false,
      date: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
    await cloudApi.syncNotification(notif);
  };

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
        localStorage.setItem('hq_invite_code', clean);
        return clean;
      }
    } catch (e) {}
    return sessionStorage.getItem('hq_invite_code') || localStorage.getItem('hq_invite_code') || null;
  };

  useEffect(() => {
    captureInviteCode();
  }, []);

  const createFamily = async (name, icon) => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newFamily = {
      id: 'f_' + Date.now(),
      name,
      icon,
      code: `HOM-${randomCode}`
    };

    setFamilies(prev => [...prev, newFamily]);
    await cloudApi.registerFamily(newFamily);

    let updatedUser = null;
    if (currentUser) {
      updatedUser = { ...currentUser, familyId: newFamily.id, role: 'admin' };
      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);
      await cloudApi.syncMember(updatedUser);
    }

    setFamilySettings({
      familyName: name,
      familyIcon: icon,
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false,
    });

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

    let foundFamily = families.find(f => sanitizeCode(f.code) === targetSanitized);

    if (!foundFamily) {
      try {
        const cloudFamily = await cloudApi.fetchFamilyByCode(cleanInput);
        if (cloudFamily) {
          foundFamily = cloudFamily;
          setFamilies(prev => {
            if (prev.some(f => f.id === cloudFamily.id)) return prev;
            return [...prev, cloudFamily];
          });
        }
      } catch (cloudErr) {}
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

      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);

      await cloudApi.syncMember(updatedUser);

      const cloudMembers = await cloudApi.fetchMembers(foundFamily.id);
      if (cloudMembers.length > 0) setMembers(cloudMembers);

      const cloudTasks = await cloudApi.fetchTasks(foundFamily.id);
      if (cloudTasks.length > 0) setTasks(cloudTasks);

      sessionStorage.removeItem('hq_invite_code');
      localStorage.removeItem('hq_invite_code');
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

    await cloudApi.deleteFamily(targetId);

    setFamilies(prev => prev.filter(f => f.id !== targetId));
    setMembers(prev => prev.filter(m => m.familyId !== targetId));
    setTasks(prev => prev.filter(t => t.familyId !== targetId));

    if (currentUser && currentUser.familyId === targetId) {
      const resetUser = { ...currentUser, familyId: null, role: 'member' };
      setCurrentUser(resetUser);
      await cloudApi.syncMember(resetUser);
    }

    await addNotification('Familia Eliminada', 'La familia ha sido eliminada por completo de la nube.');
    return { success: true };
  };

  // Tasks
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

    setTasks(prev => [newTask, ...prev]);
    await cloudApi.syncTask(newTask);
    await addNotification('Nueva Tarea', `Se ha creado la tarea: ${taskData.title}`);
  };

  const editTask = async (id, updatedData) => {
    setTasks(prev => {
      const updatedList = prev.map(t => {
        if (t.id === id) {
          const merged = { ...t, ...updatedData };
          cloudApi.syncTask(merged);
          return merged;
        }
        return t;
      });
      return updatedList;
    });
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await cloudApi.deleteTask(id);
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
    setCurrentUser(updatedUser);
    setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
    await cloudApi.syncMember(updatedUser);
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

    const completedByUserId = currentUser.id;

    const updatedTask = {
      ...task,
      status: 'sent',
      completedBy: completedByUserId,
      completedAt: new Date().toISOString(),
      photoUrl: finalPhotoUrl,
      comment: comment || ''
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    await cloudApi.syncTask(updatedTask);

    if (currentUser.role === 'admin' && !task.requireOtherAdmin) {
      await approveTask(taskId, currentUser.id, completedByUserId);
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

    setTasks(prev => prev.map(t => t.id === taskId ? approvedTask : t));
    await cloudApi.syncTask(approvedTask);

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
        if (reachedLevel && reachedLevel.level > newLvl) {
          newLvl = reachedLevel.level;
        }

        const updated = {
          ...prev,
          totalXP: newXP,
          coins: newCoins,
          level: newLvl,
          currentStreak: newStreak,
          weeklyPoints: newWeekly,
          monthlyPoints: newMonthly
        };
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
    setActivityLog(prev => [logEntry, ...prev]);
    await cloudApi.syncActivityLog(logEntry);
  };

  const rejectTask = async (taskId, approvedByUserId, reason) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.photoUrl) {
      await cloudApi.deleteVerifiedPhoto(task.photoUrl);
    }

    const rejectedTask = {
      ...task,
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null
    };

    setTasks(prev => prev.map(t => t.id === taskId ? rejectedTask : t));
    await cloudApi.syncTask(rejectedTask);

    await addNotification('Tarea Rechazada', `❌ Tu tarea "${task.title}" fue rechazada. Motivo: ${reason}`);
  };

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

    setClaimedRewards(prev => [newClaim, ...prev]);
    await cloudApi.syncClaimedReward(newClaim);

    setMembers(prev => prev.map(m => {
      if (m.id === currentUser.id) {
        const updated = { ...m, coins: updatedCoins };
        cloudApi.syncMember(updated);
        return updated;
      }
      return m;
    }));
    setCurrentUser(prev => {
      const updated = { ...prev, coins: updatedCoins };
      cloudApi.syncMember(updated);
      return updated;
    });

    const logEntry = {
      id: 'l_' + Date.now(),
      familyId: currentUser.familyId || null,
      type: 'reward_claimed',
      memberId: currentUser.id,
      details: reward.title,
      pointsEarned: -reward.cost,
      timestamp: new Date().toISOString()
    };
    setActivityLog(prev => [logEntry, ...prev]);
    await cloudApi.syncActivityLog(logEntry);

    await addNotification('Recompensa Canjeada', `🎁 ${currentUser.name} canjeó: "${reward.title}" (-${reward.cost}🪙)`);
    return { success: true, message: '¡Recompensa canjeada con éxito!' };
  };

  const fulfillRewardClaim = async (claimId) => {
    const updatedClaim = claimedRewards.find(c => c.id === claimId);
    if (updatedClaim) {
      const merged = {
        ...updatedClaim,
        status: 'fulfilled',
        fulfilledAt: new Date().toISOString(),
        fulfilledBy: currentUser?.id
      };
      setClaimedRewards(prev => prev.map(c => c.id === claimId ? merged : c));
      await cloudApi.syncClaimedReward(merged);
    }
    await addNotification('Recompensa Entregada', `🎉 Se ha entregado la recompensa.`);
  };

  const addReward = async (rewardData) => {
    const newRew = { id: 'rew_' + Date.now(), familyId: currentUser?.familyId || null, ...rewardData };
    setRewards(prev => [...prev, newRew]);
    await cloudApi.syncReward(newRew);
  };

  const deleteReward = async (id) => {
    setRewards(prev => prev.filter(r => r.id !== id));
    await cloudApi.deleteReward(id);
  };

  const addLevel = (lvlData) => { setLevels(prev => [...prev, lvlData].sort((a, b) => a.level - b.level)); };
  const deleteLevel = (levelNumber) => { setLevels(prev => prev.filter(l => l.level !== levelNumber)); };
  const editLevel = (levelNumber, updatedData) => { setLevels(prev => prev.map(l => l.level === levelNumber ? { ...l, ...updatedData } : l)); };
  const addStreak = (streakData) => { setStreaks(prev => [...prev, { id: 'str_' + Date.now(), ...streakData }]); };
  const deleteStreak = (id) => { setStreaks(prev => prev.filter(s => s.id !== id)); };
  const addAchievement = (achData) => { setAchievements(prev => [...prev, { id: 'ach_' + Date.now(), ...achData, unlockedBy: [] }]); };
  const deleteAchievement = (id) => { setAchievements(prev => prev.filter(a => a.id !== id)); };
  const markNotificationsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  const currentFamilyId = currentUser?.familyId;
  const filteredMembers = currentFamilyId ? members.filter(m => m.familyId === currentFamilyId || !m.familyId) : members;
  const filteredTasks = currentFamilyId ? tasks.filter(t => t.familyId === currentFamilyId || !t.familyId) : tasks;

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
      markNotificationsRead
    }}>
      {children}
    </FamilyContext.Provider>
  );
};
