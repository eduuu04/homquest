import React, { createContext, useState, useEffect, useContext } from 'react';
import { cloudApi } from '../services/cloudApi';
import {
  PREDEFINED_TASKS,
  INITIAL_LEVELS,
  INITIAL_STREAKS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REWARDS,
  INITIAL_MEMBERS,
  INITIAL_TASKS,
  INITIAL_ACTIVITY_LOG
} from '../utils/constants';

const FamilyContext = createContext();

export const useFamily = () => useContext(FamilyContext);

const resetHomQuestStorage = () => {
  Object.keys(localStorage)
    .filter(key => key.startsWith('hq_'))
    .forEach(key => localStorage.removeItem(key));
};

export const FamilyProvider = ({ children }) => {
  // Purge all legacy test families and users cleanly on update
  if (!localStorage.getItem('hq_v4_clean_purge')) {
    resetHomQuestStorage();
    cloudApi.purgeAllCloudData();
    localStorage.setItem('hq_v4_clean_purge', 'true');
  }

  // Current user state persistent on device
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hq_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto Login toggle state (persisted, default true)
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(() => {
    const saved = localStorage.getItem('hq_auto_login');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // State entities stored local-first with Cloud sync
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
    if (!localStorage.getItem('hq_v3_clean')) return [];
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
    if (!localStorage.getItem('hq_v3_clean')) return [];
    const saved = localStorage.getItem('hq_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [claimedRewards, setClaimedRewards] = useState(() => {
    if (!localStorage.getItem('hq_v3_clean')) return [];
    const saved = localStorage.getItem('hq_claimed_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state changes to device localStorage for 100% offline resilience
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hq_current_user', JSON.stringify(currentUser));
      localStorage.setItem('hq_last_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hq_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hq_auto_login', JSON.stringify(autoLoginEnabled));
  }, [autoLoginEnabled]);

  // Automatic session restoration for future sessions
  useEffect(() => {
    if (autoLoginEnabled && !currentUser && members.length > 0) {
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
      if (!matchedUser) {
        matchedUser = members[0];
      }
      if (matchedUser) {
        setCurrentUser(matchedUser);
      }
    }
  }, [autoLoginEnabled, members, currentUser]);

  useEffect(() => { 
    localStorage.setItem('hq_families', JSON.stringify(families)); 
    try {
      const existingStr = localStorage.getItem('hq_global_families');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const map = new Map();
      existing.forEach(f => map.set(f.id, f));
      families.forEach(f => map.set(f.id, f));
      localStorage.setItem('hq_global_families', JSON.stringify(Array.from(map.values())));
    } catch (e) {}
  }, [families]);
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

  const register = (name, email, role = 'member') => {
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

    // Log activity
    setActivityLog(prev => [{
      id: 'l_' + Date.now(),
      type: 'member_registered',
      memberId: newMember.id,
      details: 'Se registró en HomQuest',
      pointsEarned: 0,
      timestamp: new Date().toISOString()
    }, ...prev]);

    return { success: true, user: newMember };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addNotification = (title, message) => {
    setNotifications(prev => [{
      id: 'notif_' + Date.now(),
      title,
      message,
      read: false,
      date: new Date().toISOString()
    }, ...prev]);
  };

  // Auto-capture invite code from URL on app load
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

  // Onboarding
  const createFamily = (name, icon) => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newFamily = {
      id: 'f_' + Date.now(),
      name,
      icon,
      code: `HOM-${randomCode}`
    };

    setFamilies(prev => [...prev, newFamily]);
    
    // Sync to 24/7 Cloud Database for multi-device joining
    cloudApi.registerFamily(newFamily);

    // Update member with familyId
    let updatedUser = null;
    if (currentUser) {
      updatedUser = { ...currentUser, familyId: newFamily.id, role: 'admin' };
      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);
    }

    // Initialize clean family settings
    setFamilySettings({
      familyName: name,
      familyIcon: icon,
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false,
    });

    // Seed initial recommended tasks for the new family
    if (updatedUser) {
      const starterTasks = PREDEFINED_TASKS.slice(0, 4).map((pt, idx) => ({
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
      }));

      setTasks(prev => [...starterTasks, ...prev]);
    }

    addNotification('Familia Creada', `¡Has creado la familia "${name}" con código ${newFamily.code}!`);
    return { success: true, family: newFamily };
  };

  // Self-healing safety check: If a family has no admin or currentUser is the only member, preserve/restore admin role!
  useEffect(() => {
    if (currentUser && currentUser.familyId) {
      const familyMembers = members.filter(m => m.familyId === currentUser.familyId);
      const hasAdmin = familyMembers.some(m => m.role === 'admin');
      
      if (!hasAdmin || familyMembers.length <= 1) {
        if (currentUser.role !== 'admin') {
          const promotedUser = { ...currentUser, role: 'admin' };
          setCurrentUser(promotedUser);
          setMembers(prev => prev.map(m => m.id === currentUser.id ? promotedUser : m));
        }
      }
    }
  }, [currentUser, members]);

  const joinFamily = async (code, role = 'member') => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Por favor, introduce un código de familia válido.' };
    }

    const cleanInput = code.trim().toLowerCase();

    // 1. Search in current state families
    let foundFamily = families.find(f => f.code && f.code.trim().toLowerCase() === cleanInput);

    // 2. Search in global registry in localStorage (for cross-tab/device sync)
    if (!foundFamily) {
      try {
        const savedGlobal = localStorage.getItem('hq_global_families');
        if (savedGlobal) {
          const globalList = JSON.parse(savedGlobal);
          foundFamily = globalList.find(f => f.code && f.code.trim().toLowerCase() === cleanInput);
          if (foundFamily) {
            setFamilies(prev => {
              if (prev.some(f => f.id === foundFamily.id)) return prev;
              return [...prev, foundFamily];
            });
          }
        }
      } catch (e) {}
    }

    // 3. Search in 24/7 Cloud Database for multi-device joining
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

    // 4. Fallback demo check: default initial demo family HOM-RVS9
    if (!foundFamily && cleanInput === 'hom-rvs9') {
      foundFamily = { id: 'f1', name: 'Hogar RVS9', icon: '🏠', code: 'HOM-RVS9' };
      setFamilies(prev => {
        if (prev.some(f => f.id === foundFamily.id)) return prev;
        return [...prev, foundFamily];
      });
    }

    if (!foundFamily) {
      return { success: false, message: `Código de familia "${code.trim()}" no encontrado. Comprueba las mayúsculas y minúsculas.` };
    }

    if (currentUser) {
      // Check if user ALREADY belongs to this family -> PRESERVE EVERYTHING 100%!
      if (currentUser.familyId === foundFamily.id) {
        sessionStorage.removeItem('hq_invite_code');
        localStorage.removeItem('hq_invite_code');
        return { success: true, family: foundFamily, alreadyMember: true };
      }

      // Check if user already exists in this family members list
      const existingInFamily = members.find(m => (m.id === currentUser.id || m.email === currentUser.email) && m.familyId === foundFamily.id);
      if (existingInFamily) {
        setCurrentUser(existingInFamily);
        sessionStorage.removeItem('hq_invite_code');
        localStorage.removeItem('hq_invite_code');
        return { success: true, family: foundFamily, alreadyMember: true };
      }

      // If joining a new family for the first time:
      // Preserve existing admin status if user was already an admin
      const newRole = currentUser.role === 'admin' ? 'admin' : (role || 'member');
      const updatedUser = { 
        ...currentUser, 
        familyId: foundFamily.id,
        role: newRole
      };
      setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
      setCurrentUser(updatedUser);
      sessionStorage.removeItem('hq_invite_code');
      localStorage.removeItem('hq_invite_code');
    }

    addNotification('Unido a Familia', `¡Te has unido a la familia "${foundFamily.name}"!`);
    return { success: true, family: foundFamily };
  };

  // Irreversibly delete a family and all associated data
  const deleteFamily = async (familyIdToDelete) => {
    const targetId = familyIdToDelete || currentUser?.familyId;
    if (!targetId) return { success: false, message: 'No hay familia activa para eliminar.' };

    const familyObj = families.find(f => f.id === targetId);

    // 1. Delete from Cloud Server DB and shared global registries
    await cloudApi.deleteFamily(targetId, familyObj?.code);

    // 2. Remove family from local state
    setFamilies(prev => prev.filter(f => f.id !== targetId));

    // 3. Remove all members and tasks of this family
    setMembers(prev => prev.filter(m => m.familyId !== targetId));
    setTasks(prev => prev.filter(t => t.familyId !== targetId));

    // 4. Reset currentUser familyId
    if (currentUser && currentUser.familyId === targetId) {
      const resetUser = { ...currentUser, familyId: null, role: 'member' };
      setCurrentUser(resetUser);
    }

    addNotification('Familia Eliminada', 'La familia ha sido eliminada por completo de forma irreversible.');
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
    addNotification('Nueva Tarea', `Se ha creado la tarea: ${taskData.title}`);
  };

  const editTask = async (id, updatedData) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskAssignment = (taskId, memberId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const alreadyAssigned = t.assignedTo?.includes(memberId);
        const newAssigned = alreadyAssigned
          ? t.assignedTo.filter(id => id !== memberId)
          : [...(t.assignedTo || []), memberId];
        return { ...t, assignedTo: newAssigned };
      }
      return t;
    }));
  };

  const updateUserAvatar = (avatar) => {
    if (!currentUser) return;
    setCurrentUser(prev => ({ ...prev, avatar }));
    setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, avatar } : m));
  };

  // Complete Task (with Cloud Photo Upload!)
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

    if (currentUser.role === 'admin' && !task.requireOtherAdmin) {
      await approveTask(taskId, currentUser.id, completedByUserId);
    } else {
      addNotification('Tarea Completada', `${currentUser.name} completó "${task.title}". Pendiente de aprobación.`);
    }
  };

  // Approve Task (Auto-deletes photo from Cloud Storage!)
  const approveTask = async (taskId, approvedByUserId, completedByUserId = null) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.photoUrl) {
      await cloudApi.deleteVerifiedPhoto(task.photoUrl);
    }

    const coinsEarned = Number(task.points || 0);
    const earnedXP = Number(task.points || 0);
    const targetUserId = completedByUserId || task.completedBy || currentUser?.id;

    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'approved',
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null
    } : t));

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

        return {
          ...m,
          totalXP: newXP,
          coins: newCoins,
          level: newLvl,
          currentStreak: newStreak,
          weeklyPoints: newWeekly,
          monthlyPoints: newMonthly
        };
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

        return {
          ...prev,
          totalXP: newXP,
          coins: newCoins,
          level: newLvl,
          currentStreak: newStreak,
          weeklyPoints: newWeekly,
          monthlyPoints: newMonthly
        };
      });
    }

    setActivityLog(prev => [{
      id: 'l_' + Date.now(),
      type: 'task_completed',
      memberId: targetUserId,
      details: task.title,
      pointsEarned: coinsEarned,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const rejectTask = async (taskId, approvedByUserId, reason) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // DIRECTIVE: Auto-delete photo from Cloud Server upon rejection!
    if (task.photoUrl) {
      await cloudApi.deleteVerifiedPhoto(task.photoUrl);
    }

    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null
    } : t));

    addNotification('Tarea Rechazada', `❌ Tu tarea "${task.title}" fue rechazada. Motivo: ${reason}`);
  };

  const checkAchievementsForUser = (userId, newXP, newStreak) => {
    const userCompletedTasksCount = tasks.filter(t => t.completedBy === userId && t.status === 'approved').length + 1;

    setAchievements(prev => prev.map(ach => {
      if (ach.unlockedBy?.includes(userId)) return ach;

      let unlock = false;
      if (ach.type === 'tasks' && userCompletedTasksCount >= ach.countNeeded) {
        unlock = true;
      } else if (ach.type === 'streak' && newStreak >= ach.countNeeded) {
        unlock = true;
      }

      if (unlock) {
        addNotification('Logro Desbloqueado', `🏅 ¡Un miembro desbloqueó: "${ach.title}"!`);
        return { ...ach, unlockedBy: [...(ach.unlockedBy || []), userId] };
      }
      return ach;
    }));
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
      status: 'pending', // pending, fulfilled
      familyId: currentUser.familyId || null
    };

    setClaimedRewards(prev => [newClaim, ...prev]);

    setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, coins: updatedCoins } : m));
    setCurrentUser(prev => ({ ...prev, coins: updatedCoins }));

    setActivityLog(prev => [{
      id: 'l_' + Date.now(),
      type: 'reward_claimed',
      memberId: currentUser.id,
      details: reward.title,
      pointsEarned: -reward.cost,
      timestamp: new Date().toISOString()
    }, ...prev]);

    addNotification('Recompensa Canjeada', `🎁 ${currentUser.name} canjeó: "${reward.title}" (-${reward.cost}🪙)`);
    return { success: true, message: '¡Recompensa canjeada con éxito!' };
  };

  const fulfillRewardClaim = (claimId) => {
    setClaimedRewards(prev => prev.map(c => c.id === claimId ? {
      ...c,
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString(),
      fulfilledBy: currentUser?.id
    } : c));
    addNotification('Recompensa Entregada', `🎉 Se ha entregado la recompensa.`);
  };

  // Customizers
  const addLevel = (lvlData) => { setLevels(prev => [...prev, lvlData].sort((a, b) => a.level - b.level)); };
  const deleteLevel = (levelNumber) => { setLevels(prev => prev.filter(l => l.level !== levelNumber)); };
  const editLevel = (levelNumber, updatedData) => { setLevels(prev => prev.map(l => l.level === levelNumber ? { ...l, ...updatedData } : l)); };
  const addReward = (rewardData) => { setRewards(prev => [...prev, { id: 'rew_' + Date.now(), ...rewardData }]); };
  const deleteReward = (id) => { setRewards(prev => prev.filter(r => r.id !== id)); };
  const addStreak = (streakData) => { setStreaks(prev => [...prev, { id: 'str_' + Date.now(), ...streakData }]); };
  const deleteStreak = (id) => { setStreaks(prev => prev.filter(s => s.id !== id)); };
  const addAchievement = (achData) => { setAchievements(prev => [...prev, { id: 'ach_' + Date.now(), ...achData, unlockedBy: [] }]); };
  const deleteAchievement = (id) => { setAchievements(prev => prev.filter(a => a.id !== id)); };
  const markNotificationsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  // Filter entities by family scope when user belongs to a family
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
