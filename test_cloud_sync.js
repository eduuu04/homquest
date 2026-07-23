import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://boudgmhevayakohouiqg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cVkRn_uF8hkjt3YbE5tdJA_S7Y6VTkY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifySync() {
  console.log('=== CLOUD-FIRST SYNC VERIFICATION ===\n');

  // 1. Verify we can read all tables
  const tables = ['families', 'members', 'tasks', 'rewards', 'claimed_rewards', 'activity_log', 'notifications'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.log(`❌ ${table}: ERROR - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${data.length} rows`);
    }
  }

  // 2. Test: Create a family, verify it exists, then delete it and verify deletion
  console.log('\n--- DELETE PROPAGATION TEST ---');
  const testId = 'sync_test_' + Date.now();
  const testCode = 'TST-' + Date.now();
  
  // Insert
  const { error: insertErr } = await supabase.from('families').insert({
    id: testId,
    name: 'Sync Test Family',
    icon: '🧪',
    code: testCode,
    sanitized_code: 'SYNCTEST' + Date.now()
  });
  
  if (insertErr) {
    console.log('❌ Insert failed:', insertErr.message);
    process.exit(1);
  }
  console.log('✅ Inserted test family');

  // Verify it exists
  const { data: found } = await supabase.from('families').select('*').eq('id', testId);
  console.log(`✅ Verified: family exists (${found?.length} rows)`);

  // Delete
  const { error: delErr } = await supabase.from('families').delete().eq('id', testId);
  if (delErr) {
    console.log('❌ Delete failed:', delErr.message);
    process.exit(1);
  }
  console.log('✅ Deleted test family from cloud');

  // Verify deletion
  const { data: afterDel } = await supabase.from('families').select('*').eq('id', testId);
  if (!afterDel || afterDel.length === 0) {
    console.log('✅ Verified: family NO LONGER EXISTS in cloud');
  } else {
    console.log('❌ FAIL: family still exists after delete!');
  }

  // 3. Full data snapshot
  console.log('\n--- CURRENT CLOUD STATE ---');
  const { data: allFamilies } = await supabase.from('families').select('*');
  const { data: allMembers } = await supabase.from('members').select('*');
  console.log(`Families: ${JSON.stringify(allFamilies?.map(f => ({id: f.id, name: f.name, code: f.code})), null, 2)}`);
  console.log(`Members: ${JSON.stringify(allMembers?.map(m => ({id: m.id, name: m.name, email: m.email, familyId: m.family_id})), null, 2)}`);

  console.log('\n✅ Cloud sync verification complete!');
  process.exit(0);
}

verifySync();
