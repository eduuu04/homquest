// Script to enable Realtime on Supabase tables using the SQL function approach
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://boudgmhevayakohouiqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cVkRn_uF8hkjt3YbE5tdJA_S7Y6VTkY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Try to call the rpc to enable realtime - this requires the function to exist
// If it doesn't exist, we'll create it
async function enableRealtime() {
  console.log('🔧 Attempting to enable Realtime via RPC...\n');

  // First, try creating the helper function using raw SQL via PostgREST
  // Note: This may not work with anon key depending on RLS setup
  const tables = ['families', 'members', 'tasks', 'rewards', 'claimed_rewards', 'activity_log', 'notifications'];
  
  // Try to use the supabase management API endpoint directly
  const projectRef = 'boudgmhevayakohouiqg';
  
  // The SQL to execute
  const sqlStatements = [
    ...tables.map(t => `ALTER PUBLICATION supabase_realtime ADD TABLE public.${t}`),
    ...tables.map(t => `ALTER TABLE public.${t} REPLICA IDENTITY FULL`)
  ];

  console.log('SQL that needs to be executed in Supabase SQL Editor:\n');
  console.log('=' .repeat(60));
  
  // Combined SQL for copy-paste
  const combinedSQL = `
-- COPIAR Y PEGAR EN SQL EDITOR DE SUPABASE
-- URL: https://supabase.com/dashboard/project/${projectRef}/sql/new

-- 1. Habilitar Realtime en todas las tablas
${tables.map(t => `BEGIN; ALTER PUBLICATION supabase_realtime ADD TABLE public.${t}; EXCEPTION WHEN duplicate_object THEN NULL; END;`).join('\n')}

-- Alternativa simple (ignorar errores si ya existen):
DO $$
BEGIN
${tables.map(t => `  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.${t}; EXCEPTION WHEN duplicate_object THEN NULL; END;`).join('\n')}
END $$;

-- 2. Configurar REPLICA IDENTITY FULL
${tables.map(t => `ALTER TABLE public.${t} REPLICA IDENTITY FULL;`).join('\n')}

-- 3. Verificar resultado
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
`;

  console.log(combinedSQL);
  console.log('=' .repeat(60));
  console.log(`\n📋 Ve a: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('   Copia y pega el SQL de arriba.\n');

  // Try to check if any tables are already in the publication
  // by doing a simple query that indirectly verifies it
  const { data, error } = await supabase
    .from('families')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('✅ Conexión a Supabase funciona correctamente.');
    console.log(`   Familias encontradas: ${data?.length || 0}`);
  } else {
    console.log('❌ Error conectando:', error.message);
  }

  process.exit(0);
}

enableRealtime();
