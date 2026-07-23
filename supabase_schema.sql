-- ==============================================================================
-- HOMQUEST SUPABASE CLOUD DATABASE SCHEMA & STORAGE SETUP v1.0
-- Copia y ejecuta este script en el "SQL Editor" de tu proyecto en Supabase.
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA FAMILIAS
CREATE TABLE IF NOT EXISTS public.families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🏠',
    code TEXT NOT NULL UNIQUE,
    sanitized_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA MIEMBROS
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    avatar TEXT DEFAULT '👤',
    level INT DEFAULT 1,
    total_xp INT DEFAULT 0,
    coins INT DEFAULT 0,
    weekly_points INT DEFAULT 0,
    monthly_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA TAREAS
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📋',
    points INT DEFAULT 10,
    difficulty TEXT DEFAULT 'easy',
    frequency TEXT DEFAULT 'daily',
    assigned_to JSONB DEFAULT '[]'::jsonb,
    requires_photo BOOLEAN DEFAULT FALSE,
    requires_admin_verification BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'pending', -- pending, sent, approved, rejected
    completed_by TEXT,
    completed_at TIMESTAMPTZ,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    photo_url TEXT,
    comment TEXT,
    custom_days JSONB DEFAULT '[]'::jsonb,
    is_rotative BOOLEAN DEFAULT FALSE,
    require_other_admin BOOLEAN DEFAULT FALSE,
    time_limit TEXT,
    bonus_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA RECOMPENSAS
CREATE TABLE IF NOT EXISTS public.rewards (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cost INT DEFAULT 100,
    icon TEXT DEFAULT '🎁',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA RECOMPENSAS CANJEADAS
CREATE TABLE IF NOT EXISTS public.claimed_rewards (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    reward_id TEXT,
    title TEXT NOT NULL,
    icon TEXT DEFAULT '🎁',
    cost INT DEFAULT 0,
    claimed_by TEXT NOT NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- pending, fulfilled
    fulfilled_at TIMESTAMPTZ,
    fulfilled_by TEXT
);

-- 7. TABLA LOG DE ACTIVIDAD
CREATE TABLE IF NOT EXISTS public.activity_log (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    member_id TEXT,
    details TEXT,
    points_earned INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES public.families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONFIGURACIÓN DE SEGURIDAD (ROW LEVEL SECURITY)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claimed_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público/anon para sincronización fluida entre dispositivos
CREATE POLICY "Acceso total a familias" ON public.families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a miembros" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a tareas" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a recompensas" ON public.rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a canjes" ON public.claimed_rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a actividad" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a notificaciones" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 10. SUPABASE STORAGE SETUP (BUCKET PARA FOTOS DE TAREAS)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-proofs', 'task-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas para permitir subir, leer y borrar fotos en el bucket 'task-proofs'
CREATE POLICY "Public Access Task Photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'task-proofs');

CREATE POLICY "Upload Task Photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'task-proofs');

CREATE POLICY "Update Task Photos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'task-proofs');

CREATE POLICY "Delete Task Photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'task-proofs');
