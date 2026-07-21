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

export const FamilyProvider = ({ children }) => {
  // Current user state persistent on device
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hq_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // State entities stored local-first with Cloud sync
  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('hq_families');
    return saved ? JSON.parse(saved) : [{ id: 'f1', name: 'Los García', icon: '🏠', code: 'HOM-X4K9' }];
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('hq_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('hq_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
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
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOG;
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
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: '¡Bienvenido a HomQuest!', message: 'Comienza a organizar tu hogar de manera divertida.', read: false, date: new Date().toISOString() }
    ];
  });

  // Sync state changes to device localStorage for 100% offline resilience
  useEffect(() => {
    if (currentUser) localStorage.setItem('hq_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('hq_current_user');
  }, [currentUser]);

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

  // Auth
  const login = async (email) => {
    const found = members.find(m => m.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Usuario no encontrado' };
  };

  const register = async (name, email, role = 'member') => {
    if (members.some(m => m.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, message: 'El email ya está registrado' };
    }

    const newMember = {
      id: 'm_' + Date.now(),
      name,
      email,
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

  // Onboarding
  const createFamily = async (name, icon) => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newFamily = {
      id: 'f_' + Date.now(),
      name,
      icon,
      code: `HOM-${randomCode}`
    };

    setFamilies(prev => [...prev, newFamily]);

    // Update member with familyId
    const updatedUser = { ...currentUser, familyId: newFamily.id, role: 'admin' };
    setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
    setCurrentUser(updatedUser);

    // Initialize clean family settings
    setFamilySettings({
      familyName: name,
      familyIcon: icon,
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false,
    });

    addNotification('Familia Creada', `¡Has creado la familia "${name}" con código ${newFamily.code}!`);
    return { success: true, family: newFamily };
  };

  const joinFamily = async (code) => {
    const foundFamily = families.find(f => f.code.toUpperCase() === code.toUpperCase().trim());
    if (!foundFamily) {
      return { success: false, message: 'Código de familia inválido' };
    }

    const updatedUser = { ...currentUser, familyId: foundFamily.id };
    setMembers(prev => prev.map(m => m.id === currentUser.id ? updatedUser : m));
    setCurrentUser(updatedUser);

    addNotification('Unido a Familia', `¡Te has unido a la familia "${foundFamily.name}"!`);
    return { success: true, family: foundFamily };
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

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
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

    const updatedTask = {
      ...task,
      status: 'sent',
      completedBy: currentUser.id,
      completedAt: new Date().toISOString(),
      photoUrl: finalPhotoUrl,
      comment: comment || ''
    };

    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

    if (currentUser.role === 'admin' && !task.requireOtherAdmin) {
      await approveTask(taskId, currentUser.id);
    } else {
      addNotification('Tarea Completada', `${currentUser.name} completó "${task.title}". Pendiente de aprobación.`);
    }
  };

  // Approve Task (Auto-deletes photo from Cloud Storage!)
  const approveTask = async (taskId, approvedByUserId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // DIRECTIVE: Auto-delete photo from Cloud Server upon verification!
    if (task.photoUrl) {
      await cloudApi.deleteVerifiedPhoto(task.photoUrl);
    }

    const coinsEarned = task.points;
    const earnedXP = task.points;
    const completedUser = members.find(m => m.id === task.completedBy);

    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'approved',
      approvedBy: approvedByUserId,
      approvedAt: new Date().toISOString(),
      photoUrl: null // Clear photoUrl reference after auto-deletion!
    } : t));

    if (completedUser) {
      const newXP = completedUser.totalXP + earnedXP;
      const newCoins = completedUser.coins + coinsEarned;

      let newLvl = completedUser.level;
      const sortedLevels = [...levels].sort((a, b) => b.level - a.level);
      const reachedLevel = sortedLevels.find(l => newXP >= l.xpNeeded);
      if (reachedLevel && reachedLevel.level > completedUser.level) {
        newLvl = reachedLevel.level;
        addNotification('¡Subida de nivel!', `🎉 ¡${completedUser.name} ha subido al nivel ${newLvl}: ${reachedLevel.title}!`);

        setActivityLog(prev => [{
          id: 'l_' + Date.now(),
          type: 'level_up',
          memberId: completedUser.id,
          details: `Nivel ${newLvl}`,
          pointsEarned: 0,
          timestamp: new Date().toISOString()
        }, ...prev]);
      }

      setMembers(prev => prev.map(m => m.id === completedUser.id ? {
        ...m,
        totalXP: newXP,
        coins: newCoins,
        level: newLvl,
        currentStreak: m.currentStreak + 1,
        weeklyPoints: m.weeklyPoints + coinsEarned,
        monthlyPoints: m.monthlyPoints + coinsEarned
      } : m));

      if (currentUser?.id === completedUser.id) {
        setCurrentUser(prev => ({
          ...prev,
          totalXP: newXP,
          coins: newCoins,
          level: newLvl,
          currentStreak: prev.currentStreak + 1,
          weeklyPoints: prev.weeklyPoints + coinsEarned,
          monthlyPoints: prev.monthlyPoints + coinsEarned
        }));
      }

      setActivityLog(prev => [{
        id: 'l_' + Date.now(),
        type: 'task_completed',
        memberId: completedUser.id,
        details: task.title,
        pointsEarned: coinsEarned,
        timestamp: new Date().toISOString()
      }, ...prev]);

      checkAchievementsForUser(completedUser.id, newXP, completedUser.currentStreak + 1);
    }
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
      login,
      register,
      logout,
      createFamily,
      joinFamily,
      families,
      addTask,
      editTask,
      deleteTask,
      completeTask,
      approveTask,
      rejectTask,
      claimReward,
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
