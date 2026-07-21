import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
await fs.mkdir(uploadsDir, { recursive: true });

// Seed Templates for new families
const DEFAULT_LEVELS = [
  { level: 1, xpNeeded: 0, title: 'Novato/a del Hogar', icon: '🧹' },
  { level: 2, xpNeeded: 100, title: 'Aprendiz Doméstico/a', icon: '🧽' },
  { level: 3, xpNeeded: 300, title: 'Asistente del Hogar', icon: '🧤' },
  { level: 4, xpNeeded: 600, title: 'Guardián/a del Orden', icon: '🛡️' },
  { level: 5, xpNeeded: 1000, title: 'Héroe/Heroína Doméstica', icon: '⚔️', rewardBonus: 10 },
  { level: 6, xpNeeded: 1500, title: 'Campeón/a del Hogar', icon: '🏆' },
  { level: 7, xpNeeded: 2200, title: 'Leyenda Familiar', icon: '👑' },
  { level: 8, xpNeeded: 3000, title: 'Maestro/a Supremo/a', icon: '🌟' },
  { level: 9, xpNeeded: 4000, title: 'Deidad del Hogar', icon: '✨' },
  { level: 10, xpNeeded: 5500, title: 'Mito Viviente', icon: '🔥', rewardBonus: 50 }
];

const DEFAULT_STREAKS = [
  { id: 's1', name: 'Racha Diaria', type: 'daily', threshold: 1, bonusPercent: 10, icon: '🔥', description: 'Completa al menos 1 tarea al día' },
  { id: 's2', name: 'Racha Semanal', type: 'weekly', threshold: 7, bonusPercent: 25, icon: '⭐', description: 'Completa todas las tareas asignadas esta semana' }
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'a1', title: 'Primer Paso', description: 'Completar tu primera tarea', icon: '👣', category: 'Constancia', countNeeded: 1, type: 'tasks', unlockedBy: [] },
  { id: 'a2', title: 'Semana Perfecta', description: 'Completar todas las tareas asignadas en una semana', icon: '⭐', category: 'Constancia', countNeeded: 1, type: 'perfect_week', unlockedBy: [] },
  { id: 'a3', title: 'Mes Imparable', description: 'Completar tareas durante 30 días seguidos', icon: '🔥', category: 'Constancia', countNeeded: 30, type: 'streak', unlockedBy: [] },
  { id: 'a4', title: 'Centenario', description: '100 tareas completadas en total', icon: '💯', category: 'Constancia', countNeeded: 100, type: 'tasks', unlockedBy: [] }
];

const DEFAULT_REWARDS = [
  { id: 'r1', title: '+5€ de paga extra', description: 'Añadido a tu paga semanal/mensual', cost: 500, icon: '💰' },
  { id: 'r2', title: 'Elegir la cena del viernes', description: 'Tú eliges el menú o restaurante', cost: 200, icon: '🍕' },
  { id: 'r3', title: 'Noche de película', description: 'Elige la película y snacks para toda la familia', cost: 300, icon: '🎬' },
  { id: 'r4', title: 'Día libre de tareas', description: 'Te saltas todas tus tareas de un día', cost: 400, icon: '🏖️' }
];

// Helper to read DB
const readDB = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database, resetting...', err);
    return {};
  }
};

// Helper to write DB
const writeDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ==========================================================
   REST API ENDPOINTS (Partitioned by familyId query filter)
   ========================================================== */

// --- FAMILIES ---
app.get('/api/families', async (req, res) => {
  const db = await readDB();
  res.json(db.families || []);
});

app.post('/api/families', async (req, res) => {
  const { name, icon } = req.body;
  const db = await readDB();
  
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newFamily = {
    id: 'f_' + Date.now(),
    name,
    icon,
    code: `HOM-${randomCode}`
  };
  
  // Create family entry
  db.families = [...(db.families || []), newFamily];
  
  // Seed default levels, streaks, achievements, rewards, settings
  db.familySettings = [
    ...(db.familySettings || []),
    {
      familyId: newFamily.id,
      familyName: name,
      familyIcon: icon,
      weeklyResetDay: 'Monday',
      streaksEnabled: true,
      leaderboardVisible: true,
      autoApproveNoPhoto: false
    }
  ];
  
  db.levels = [...(db.levels || []), ...DEFAULT_LEVELS.map(l => ({ ...l, familyId: newFamily.id }))];
  db.streaks = [...(db.streaks || []), ...DEFAULT_STREAKS.map(s => ({ ...s, id: s.id + '_' + Date.now(), familyId: newFamily.id }))];
  db.achievements = [...(db.achievements || []), ...DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, id: a.id + '_' + Date.now(), familyId: newFamily.id }))];
  db.rewards = [...(db.rewards || []), ...DEFAULT_REWARDS.map(r => ({ ...r, id: r.id + '_' + Date.now(), familyId: newFamily.id }))];
  
  // Seed welcome notification
  db.notifications = [
    {
      id: 'notif_' + Date.now(),
      title: '¡Bienvenido a HomQuest!',
      message: `Comienza a organizar tu hogar de manera divertida en la familia "${name}".`,
      read: false,
      date: new Date().toISOString(),
      familyId: newFamily.id
    },
    ...(db.notifications || [])
  ];

  await writeDB(db);
  res.status(201).json(newFamily);
});

// --- MEMBERS ---
app.get('/api/members', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.members || [];
  if (familyId) list = list.filter(m => m.familyId === familyId);
  res.json(list);
});

app.post('/api/members', async (req, res) => {
  const { name, email, role, avatar, familyId } = req.body;
  const db = await readDB();
  
  const newMember = {
    id: 'm_' + Date.now(),
    name,
    email,
    role: role || 'member',
    avatar: avatar || name.substring(0, 2).toUpperCase(),
    level: 1,
    totalXP: 0,
    currentStreak: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    coins: 0,
    familyId: familyId || null
  };
  
  db.members = [...(db.members || []), newMember];
  await writeDB(db);
  res.status(201).json(newMember);
});

app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = await readDB();
  
  db.members = (db.members || []).map(m => m.id === id ? { ...m, ...updatedData } : m);
  await writeDB(db);
  
  const updated = db.members.find(m => m.id === id);
  res.json(updated);
});

app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  
  db.members = (db.members || []).filter(m => m.id !== id);
  await writeDB(db);
  res.status(204).end();
});

// --- TASKS ---
app.get('/api/tasks', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.tasks || [];
  if (familyId) list = list.filter(t => t.familyId === familyId);
  res.json(list);
});

app.post('/api/tasks', async (req, res) => {
  const { familyId } = req.query;
  const taskData = req.body;
  const db = await readDB();
  
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
    familyId: familyId || null
  };
  
  db.tasks = [newTask, ...(db.tasks || [])];
  await writeDB(db);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const db = await readDB();
  
  const existingTask = (db.tasks || []).find(t => t.id === id);
  
  // Directiva: Borrar automáticamente la foto del servidor al verificar (aprobar o rechazar)
  if (existingTask && existingTask.photoUrl && (updatedData.status === 'approved' || updatedData.status === 'rejected')) {
    try {
      const urlParts = existingTask.photoUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (filename) {
        const filePath = path.join(uploadsDir, filename);
        await fs.unlink(filePath).catch(() => {});
        console.log(`📸 Foto auto-eliminada tras verificación: ${filename}`);
      }
    } catch (e) {
      console.error('Error al auto-eliminar la foto de la tarea:', e);
    }
    updatedData.photoUrl = null;
  }
  
  db.tasks = (db.tasks || []).map(t => t.id === id ? { ...t, ...updatedData } : t);
  await writeDB(db);
  
  const updated = db.tasks.find(t => t.id === id);
  res.json(updated);
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  
  db.tasks = (db.tasks || []).filter(t => t.id !== id);
  await writeDB(db);
  res.status(204).end();
});

// --- UPLOAD & COMPLETE TASK ---
app.post('/api/tasks/:id/complete', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { completedBy, comment } = req.body;
  const db = await readDB();
  
  let photoUrl = null;
  if (req.file) {
    const host = req.headers.host || `localhost:${PORT}`;
    photoUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }
  
  db.tasks = (db.tasks || []).map(t => {
    if (t.id === id) {
      return {
        ...t,
        status: 'sent',
        completedBy,
        completedAt: new Date().toISOString(),
        photoUrl,
        comment: comment || ''
      };
    }
    return t;
  });
  
  await writeDB(db);
  const updated = db.tasks.find(t => t.id === id);
  res.json(updated);
});

// --- REWARDS ---
app.get('/api/rewards', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.rewards || [];
  if (familyId) list = list.filter(r => r.familyId === familyId);
  res.json(list);
});

app.post('/api/rewards', async (req, res) => {
  const { familyId } = req.query;
  const rewardData = req.body;
  const db = await readDB();
  
  const newReward = {
    id: 'rew_' + Date.now(),
    title: rewardData.title,
    description: rewardData.description || '',
    cost: Number(rewardData.cost),
    icon: rewardData.icon || '🎁',
    familyId: familyId || null
  };
  
  db.rewards = [...(db.rewards || []), newReward];
  await writeDB(db);
  res.status(201).json(newReward);
});

app.delete('/api/rewards/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  
  db.rewards = (db.rewards || []).filter(r => r.id !== id);
  await writeDB(db);
  res.status(204).end();
});

// --- ACHIEVEMENTS ---
app.get('/api/achievements', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.achievements || [];
  if (familyId) list = list.filter(a => a.familyId === familyId);
  res.json(list);
});

app.post('/api/achievements', async (req, res) => {
  const { familyId } = req.query;
  const achData = req.body;
  const db = await readDB();
  
  const newAch = {
    id: 'ach_' + Date.now(),
    title: achData.title,
    description: achData.description || '',
    icon: achData.icon || '🏅',
    category: achData.category || 'Personalizado',
    countNeeded: Number(achData.countNeeded),
    unlockedBy: [],
    familyId: familyId || null
  };
  
  db.achievements = [...(db.achievements || []), newAch];
  await writeDB(db);
  res.status(201).json(newAch);
});

app.put('/api/achievements/:id', async (req, res) => {
  const { id } = req.params;
  const { unlockedBy } = req.body;
  const db = await readDB();
  
  db.achievements = (db.achievements || []).map(a => a.id === id ? { ...a, unlockedBy } : a);
  await writeDB(db);
  res.json(db.achievements.find(a => a.id === id));
});

app.delete('/api/achievements/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  
  db.achievements = (db.achievements || []).filter(a => a.id !== id);
  await writeDB(db);
  res.status(204).end();
});

// --- LEVELS ---
app.get('/api/levels', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.levels || [];
  if (familyId) list = list.filter(l => l.familyId === familyId);
  res.json(list);
});

app.post('/api/levels', async (req, res) => {
  const { familyId } = req.query;
  const lvlData = req.body;
  const db = await readDB();
  
  const newLvl = {
    level: Number(lvlData.level),
    xpNeeded: Number(lvlData.xpNeeded),
    title: lvlData.title,
    icon: lvlData.icon,
    familyId: familyId || null
  };
  
  db.levels = [...(db.levels || []), newLvl].sort((a, b) => a.level - b.level);
  await writeDB(db);
  res.status(201).json(newLvl);
});

app.delete('/api/levels/:level', async (req, res) => {
  const { familyId } = req.query;
  const levelNo = Number(req.params.level);
  const db = await readDB();
  
  db.levels = (db.levels || []).filter(l => !(l.level === levelNo && l.familyId === familyId));
  await writeDB(db);
  res.status(204).end();
});

// --- STREAKS ---
app.get('/api/streaks', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.streaks || [];
  if (familyId) list = list.filter(s => s.familyId === familyId);
  res.json(list);
});

app.post('/api/streaks', async (req, res) => {
  const { familyId } = req.query;
  const streakData = req.body;
  const db = await readDB();
  
  const newStreak = {
    id: 'str_' + Date.now(),
    name: streakData.name,
    type: streakData.type || 'custom',
    threshold: Number(streakData.threshold),
    bonusPercent: Number(streakData.bonusPercent),
    icon: streakData.icon || '🔥',
    description: streakData.description || '',
    familyId: familyId || null
  };
  
  db.streaks = [...(db.streaks || []), newStreak];
  await writeDB(db);
  res.status(201).json(newStreak);
});

app.delete('/api/streaks/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  
  db.streaks = (db.streaks || []).filter(s => s.id !== id);
  await writeDB(db);
  res.status(204).end();
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  const settingsList = db.familySettings || [];
  const found = settingsList.find(s => s.familyId === familyId);
  res.json(found || {});
});

app.put('/api/settings', async (req, res) => {
  const { familyId } = req.query;
  const newSettings = req.body;
  const db = await readDB();
  
  db.familySettings = (db.familySettings || []).map(s => {
    if (s.familyId === familyId) {
      return { ...s, ...newSettings };
    }
    return s;
  });
  
  if (!(db.familySettings || []).some(s => s.familyId === familyId)) {
    db.familySettings = [...(db.familySettings || []), { familyId, ...newSettings }];
  }
  
  await writeDB(db);
  res.json((db.familySettings || []).find(s => s.familyId === familyId));
});

// --- ACTIVITY LOG ---
app.get('/api/activity', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.activityLog || [];
  if (familyId) list = list.filter(l => l.familyId === familyId);
  res.json(list);
});

app.post('/api/activity', async (req, res) => {
  const { familyId } = req.query;
  const logData = req.body;
  const db = await readDB();
  
  const newLog = {
    id: 'l_' + Date.now(),
    ...logData,
    timestamp: new Date().toISOString(),
    familyId: familyId || null
  };
  
  db.activityLog = [newLog, ...(db.activityLog || [])];
  await writeDB(db);
  res.status(201).json(newLog);
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  let list = db.notifications || [];
  if (familyId) list = list.filter(n => n.familyId === familyId);
  res.json(list);
});

app.post('/api/notifications', async (req, res) => {
  const { familyId } = req.query;
  const { title, message } = req.body;
  const db = await readDB();
  
  const newNotification = {
    id: 'notif_' + Date.now(),
    title,
    message,
    read: false,
    date: new Date().toISOString(),
    familyId: familyId || null
  };
  
  db.notifications = [newNotification, ...(db.notifications || [])];
  await writeDB(db);
  res.status(201).json(newNotification);
});

app.put('/api/notifications/read', async (req, res) => {
  const { familyId } = req.query;
  const db = await readDB();
  
  db.notifications = (db.notifications || []).map(n => {
    if (n.familyId === familyId) {
      return { ...n, read: true };
    }
    return n;
  });
  
  await writeDB(db);
  res.json({ success: true });
});

/* ==========================================================
   START SERVER (Bind to 0.0.0.0 to enable local Wi-Fi access)
   ========================================================== */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`HomQuest Backend running on:`);
  console.log(`➜ Local:   http://localhost:${PORT}/`);
  console.log(`=============================================`);
});
