-- ==============================================================================
-- HOMQUEST: ACTIVAR SUPABASE REALTIME EN TODAS LAS TABLAS
-- Ejecuta este script en el SQL Editor de Supabase Dashboard
-- ==============================================================================

-- 1. Añadir todas las tablas a la publicación de Realtime
-- (Si alguna ya está añadida, el comando fallará silenciosamente para esa tabla)
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

-- 2. Configurar REPLICA IDENTITY FULL para recibir datos completos en eventos DELETE
ALTER TABLE public.families REPLICA IDENTITY FULL;
ALTER TABLE public.members REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.rewards REPLICA IDENTITY FULL;
ALTER TABLE public.claimed_rewards REPLICA IDENTITY FULL;
ALTER TABLE public.activity_log REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 3. Verificar que Realtime está activo
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
