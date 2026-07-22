// CONSTANTES Y DATOS MOCK DE HOMQUEST

export const PREDEFINED_TASKS = [
  // Limpieza
  { id: 'p1', title: 'Hacer la cama', difficulty: 'easy', points: 10, icon: '🛏️', category: 'Limpieza', frequency: 'daily' },
  { id: 'p2', title: 'Poner el lavavajillas', difficulty: 'easy', points: 15, icon: '🍽️', category: 'Limpieza', frequency: 'daily' },
  { id: 'p3', title: 'Aspirar el salón', difficulty: 'medium', points: 40, icon: '🧹', category: 'Limpieza', frequency: 'daily' },
  { id: 'p4', title: 'Fregar el suelo', difficulty: 'medium', points: 45, icon: '🧽', category: 'Limpieza', frequency: 'weekly' },
  { id: 'p5', title: 'Limpiar el baño', difficulty: 'medium', points: 50, icon: '🚿', category: 'Limpieza', frequency: 'weekly' },
  { id: 'p6', title: 'Limpieza profunda de la cocina', difficulty: 'epic', points: 150, icon: '✨', category: 'Limpieza', frequency: 'once' },
  
  // Cocina
  { id: 'p7', title: 'Preparar el desayuno', difficulty: 'easy', points: 15, icon: '☕', category: 'Cocina', frequency: 'daily' },
  { id: 'p8', title: 'Cocinar la comida', difficulty: 'hard', points: 70, icon: '🍳', category: 'Cocina', frequency: 'daily' },
  { id: 'p9', title: 'Cocinar la cena', difficulty: 'hard', points: 70, icon: '🍲', category: 'Cocina', frequency: 'daily' },
  { id: 'p10', title: 'Poner/quitar la mesa', difficulty: 'easy', points: 10, icon: '🍽️', category: 'Cocina', frequency: 'daily' },

  // Ropa
  { id: 'p11', title: 'Poner lavadora', difficulty: 'easy', points: 15, icon: '👕', category: 'Ropa', frequency: 'weekly' },
  { id: 'p12', title: 'Tender la ropa', difficulty: 'medium', points: 25, icon: '👔', category: 'Ropa', frequency: 'weekly' },
  { id: 'p13', title: 'Planchar', difficulty: 'medium', points: 40, icon: '🧺', category: 'Ropa', frequency: 'weekly' },
  { id: 'p14', title: 'Recoger y doblar ropa', difficulty: 'medium', points: 30, icon: '📦', category: 'Ropa', frequency: 'weekly' },

  // Hogar general
  { id: 'p15', title: 'Sacar la basura', difficulty: 'easy', points: 10, icon: '🗑️', category: 'Hogar', frequency: 'daily' },
  { id: 'p16', title: 'Pasear al perro', difficulty: 'medium', points: 30, icon: '🐕', category: 'Hogar', frequency: 'daily' },
  { id: 'p17', title: 'Regar las plantas', difficulty: 'easy', points: 10, icon: '🌱', category: 'Hogar', frequency: 'weekly' },
  { id: 'p18', title: 'Hacer la compra semanal', difficulty: 'hard', points: 80, icon: '🛒', category: 'Hogar', frequency: 'weekly' }
];

export const INITIAL_LEVELS = [
  { level: 1, xpNeeded: 0, title: 'Novato/a del Hogar', icon: '🧹' },
  { level: 2, xpNeeded: 100, title: 'Aprendiz Doméstico/a', icon: '🧽' },
  { level: 3, xpNeeded: 300, title: 'Asistente del Hogar', icon: '🧤' },
  { level: 4, xpNeeded: 600, title: 'Guardián/a del Orden', icon: '🛡️' },
  { level: 5, xpNeeded: 1000, title: 'Héroe/Heroína Doméstica', icon: '⚔️', rewardBonus: 10 }, // Opcional
  { level: 6, xpNeeded: 1500, title: 'Campeón/a del Hogar', icon: '🏆' },
  { level: 7, xpNeeded: 2200, title: 'Leyenda Familiar', icon: '👑' },
  { level: 8, xpNeeded: 3000, title: 'Maestro/a Supremo/a', icon: '🌟' },
  { level: 9, xpNeeded: 4000, title: 'Deidad del Hogar', icon: '✨' },
  { level: 10, xpNeeded: 5500, title: 'Mito Viviente', icon: '🔥', rewardBonus: 50 }
];

export const INITIAL_STREAKS = [
  { id: 's1', name: 'Racha Diaria', type: 'daily', threshold: 1, bonusPercent: 10, icon: '🔥', description: 'Completa al menos 1 tarea al día' },
  { id: 's2', name: 'Racha Semanal', type: 'weekly', threshold: 7, bonusPercent: 25, icon: '⭐', description: 'Completa todas las tareas asignadas esta semana' },
];

export const INITIAL_ACHIEVEMENTS = [
  { id: 'a1', title: 'Primer Paso', description: 'Completar tu primera tarea', icon: '👣', category: 'Constancia', countNeeded: 1, type: 'tasks' },
  { id: 'a2', title: 'Semana Perfecta', description: 'Completar todas las tareas asignadas en una semana', icon: '⭐', category: 'Constancia', countNeeded: 1, type: 'perfect_week' },
  { id: 'a3', title: 'Mes Imparable', description: 'Completar tareas durante 30 días seguidos', icon: '🔥', category: 'Constancia', countNeeded: 30, type: 'streak' },
  { id: 'a4', title: 'Centenario', description: '100 tareas completadas en total', icon: '💯', category: 'Constancia', countNeeded: 100, type: 'tasks' },
  { id: 'a5', title: 'Chef de la Casa', description: 'Completa 10 tareas de cocina', icon: '👨‍🍳', category: 'Especialista', countNeeded: 10, type: 'category_Cocina' },
  { id: 'a6', title: 'Manos de Cristal', description: 'Completa 5 tareas de limpieza del baño', icon: '🚿', category: 'Especialista', countNeeded: 5, type: 'task_🚿' },
  { id: 'a7', title: 'Trabajo en Equipo', description: 'Completa 5 tareas conjuntas', icon: '🤝', category: 'Social', countNeeded: 5, type: 'team' },
  { id: 'a8', title: 'Fotógrafo/a Pro', description: 'Sube 20 fotos de verificación', icon: '📸', category: 'Social', countNeeded: 20, type: 'photos' }
];

export const INITIAL_REWARDS = [
  { id: 'r1', title: '+5€ de paga extra', description: 'Añadido a tu paga semanal/mensual', cost: 500, icon: '💰' },
  { id: 'r2', title: 'Elegir la cena del viernes', description: 'Tú eliges el menú o restaurante', cost: 200, icon: '🍕' },
  { id: 'r3', title: 'Noche de película', description: 'Elige la película y snacks para toda la familia', cost: 300, icon: '🎬' },
  { id: 'r4', title: 'Día libre de tareas', description: 'Te saltas todas tus tareas de un día', cost: 400, icon: '🏖️' },
  { id: 'r5', title: '+10€ de paga extra', description: 'Añadido a tu paga semanal/mensual', cost: 900, icon: '💸' },
  { id: 'r6', title: 'Salida familiar especial', description: 'Elige una actividad o salida especial en familia', cost: 1500, icon: '🎉' }
];

export const INITIAL_MEMBERS = [
  { id: 'm1', name: 'Eduardo', email: 'eduardo@homquest.com', role: 'admin', avatar: 'ED', level: 4, totalXP: 680, currentStreak: 5, weeklyPoints: 280, monthlyPoints: 680, coins: 1250, familyId: 'f1' },
  { id: 'm2', name: 'María', email: 'maria@homquest.com', role: 'admin', avatar: 'MA', level: 5, totalXP: 1050, currentStreak: 8, weeklyPoints: 320, monthlyPoints: 1050, coins: 1680, familyId: 'f1' },
  { id: 'm3', name: 'Carlos', email: 'carlos@homquest.com', role: 'member', avatar: 'CA', level: 3, totalXP: 380, currentStreak: 3, weeklyPoints: 210, monthlyPoints: 380, coins: 890, familyId: 'f1' },
  { id: 'm4', name: 'Ana', email: 'ana@homquest.com', role: 'member', avatar: 'AN', level: 2, totalXP: 190, currentStreak: 0, weeklyPoints: 120, monthlyPoints: 190, coins: 420, familyId: 'f1' },
  { id: 'm5', name: 'Luis', email: 'luis@homquest.com', role: 'member', avatar: 'LU', level: 2, totalXP: 150, currentStreak: 1, weeklyPoints: 90, monthlyPoints: 150, coins: 350, familyId: 'f1' }
];

export const INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Aspirar el salón',
    description: 'Aspirar todo el salón incluyendo debajo del sofá y las esquinas.',
    icon: '🧹',
    points: 40,
    difficulty: 'medium',
    frequency: 'daily',
    assignedTo: ['m1', 'm3'], // Eduardo y Carlos
    requiresPhoto: true,
    requiresAdminVerification: true,
    status: 'pending',
    completedBy: null,
    completedAt: null,
    photoUrl: null
  },
  {
    id: 't2',
    title: 'Cocinar la cena',
    description: 'Preparar la cena para todos y dejar la cocina recogida.',
    icon: '🍲',
    points: 70,
    difficulty: 'hard',
    frequency: 'daily',
    assignedTo: ['m2'], // María
    requiresPhoto: false,
    requiresAdminVerification: true,
    status: 'pending',
    completedBy: null,
    completedAt: null,
    photoUrl: null
  },
  {
    id: 't3',
    title: 'Hacer la cama',
    description: 'Hacer la cama y ordenar la habitación.',
    icon: '🛏️',
    points: 10,
    difficulty: 'easy',
    frequency: 'daily',
    assignedTo: ['m3'], // Carlos
    requiresPhoto: false,
    requiresAdminVerification: true,
    status: 'sent', // Carlos ya la marcó
    completedBy: 'm3',
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    photoUrl: null
  },
  {
    id: 't4',
    title: 'Limpiar el baño',
    description: 'Limpiar lavabo, espejo, ducha e inodoro.',
    icon: '🚿',
    points: 50,
    difficulty: 'medium',
    frequency: 'weekly',
    assignedTo: ['m1'], // Eduardo
    requiresPhoto: true,
    status: 'pending',
    completedBy: null,
    completedAt: null,
    photoUrl: null
  },
  {
    id: 't5',
    title: 'Sacar la basura',
    description: 'Separar orgánica, envases, papel y vidrio.',
    icon: '🗑️',
    points: 10,
    difficulty: 'easy',
    frequency: 'daily',
    assignedTo: ['m4'], // Ana
    requiresPhoto: false,
    requiresAdminVerification: true,
    status: 'approved', // Ya validada por admin
    completedBy: 'm4',
    completedAt: new Date(Date.now() - 10800000).toISOString(),
    approvedBy: 'm1',
    approvedAt: new Date(Date.now() - 10000000).toISOString()
  }
];

export const INITIAL_ACTIVITY_LOG = [
  { id: 'l1', type: 'task_completed', memberId: 'm4', details: 'Sacar la basura', pointsEarned: 10, timestamp: new Date(Date.now() - 10000000).toISOString() },
  { id: 'l2', type: 'level_up', memberId: 'm2', details: 'Nivel 5', pointsEarned: 0, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'l3', type: 'achievement_unlocked', memberId: 'm1', details: 'Chef de la Casa', pointsEarned: 0, timestamp: new Date(Date.now() - 172800000).toISOString() }
];
