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

-- ============================================================================
-- POLÍTICAS RLS v2.0 — Acceso anon con aislamiento por family_id
-- ============================================================================
-- NOTA: HomQuest usa la anon key de Supabase (sin Supabase Auth / JWT).
-- Por eso las políticas permiten acceso anon, pero el FRONTEND SIEMPRE
-- filtra por family_id en todas las queries. Esto impide que un usuario
-- normal vea datos de otras familias desde la app.
--
-- Para seguridad total a nivel de BD (impedir acceso directo con la key),
-- migrar a Supabase Auth y usar auth.uid() en las políticas.
-- ============================================================================

-- FAMILIAS: lectura pública (necesario para buscar por código de invitación)
-- Escritura pública (necesario para crear/unirse sin Supabase Auth)
CREATE POLICY "Acceso total a familias" ON public.families FOR ALL USING (true) WITH CHECK (true);

-- MIEMBROS: acceso total (necesario para registro y login sin Supabase Auth)
CREATE POLICY "Acceso total a miembros" ON public.members FOR ALL USING (true) WITH CHECK (true);

-- TAREAS: acceso total (el frontend SIEMPRE filtra por family_id)
CREATE POLICY "Acceso total a tareas" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- RECOMPENSAS: acceso total (el frontend SIEMPRE filtra por family_id)
CREATE POLICY "Acceso total a recompensas" ON public.rewards FOR ALL USING (true) WITH CHECK (true);

-- CANJES: acceso total (el frontend SIEMPRE filtra por family_id)
CREATE POLICY "Acceso total a canjes" ON public.claimed_rewards FOR ALL USING (true) WITH CHECK (true);

-- ACTIVIDAD: acceso total (el frontend SIEMPRE filtra por family_id)
CREATE POLICY "Acceso total a actividad" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

-- NOTIFICACIONES: acceso total (el frontend SIEMPRE filtra por family_id)
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

-- 11. SUPABASE REALTIME (para sincronización instantánea entre dispositivos)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.families; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.claimed_rewards; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- REPLICA IDENTITY FULL para recibir datos completos en eventos DELETE
ALTER TABLE public.families REPLICA IDENTITY FULL;
ALTER TABLE public.members REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.rewards REPLICA IDENTITY FULL;
ALTER TABLE public.claimed_rewards REPLICA IDENTITY FULL;
ALTER TABLE public.activity_log REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
