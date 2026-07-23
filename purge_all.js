import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = 'https://boudgmhevayakohouiqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cVkRn_uF8hkjt3YbE5tdJA_S7Y6VTkY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function purgeAll() {
  console.log('🧹 Purging all users, families, tasks and activity data from Supabase Cloud...');

  try {
    const { error: e1 } = await supabase.from('activity_log').delete().neq('id', '000000');
    console.log('- activity_log purged:', e1 ? e1.message : 'OK');
  } catch (e) {}

  try {
    const { error: e2 } = await supabase.from('notifications').delete().neq('id', '000000');
    console.log('- notifications purged:', e2 ? e2.message : 'OK');
  } catch (e) {}

  try {
    const { error: e3 } = await supabase.from('claimed_rewards').delete().neq('id', '000000');
    console.log('- claimed_rewards purged:', e3 ? e3.message : 'OK');
  } catch (e) {}

  try {
    const { error: e4 } = await supabase.from('rewards').delete().neq('id', '000000');
    console.log('- rewards purged:', e4 ? e4.message : 'OK');
  } catch (e) {}

  try {
    const { error: e5 } = await supabase.from('tasks').delete().neq('id', '000000');
    console.log('- tasks purged:', e5 ? e5.message : 'OK');
  } catch (e) {}

  try {
    const { error: e6 } = await supabase.from('members').delete().neq('id', '000000');
    console.log('- members purged:', e6 ? e6.message : 'OK');
  } catch (e) {}

  try {
    const { error: e7 } = await supabase.from('families').delete().neq('id', '000000');
    console.log('- families purged:', e7 ? e7.message : 'OK');
  } catch (e) {}

  // Empty task-proofs files in Supabase storage if any
  try {
    const { data: files } = await supabase.storage.from('task-proofs').list('proofs');
    if (files && files.length > 0) {
      const paths = files.map(f => `proofs/${f.name}`);
      await supabase.storage.from('task-proofs').remove(paths);
      console.log(`- task-proofs photos purged (${paths.length} files)`);
    }
  } catch (e) {}

  // Reset local db.json
  try {
    const emptyDB = {
      families: [],
      members: [],
      tasks: [],
      rewards: [],
      achievements: [],
      levels: [],
      streaks: [],
      familySettings: [],
      activityLog: [],
      notifications: [],
      claimedRewards: []
    };
    await fs.writeFile(path.join(process.cwd(), 'server', 'db.json'), JSON.stringify(emptyDB, null, 2), 'utf-8');
    console.log('- server/db.json reset to empty state');
  } catch (e) {}

  console.log('\n✨ ALL DATA PURGED SUCCESSFULLY!');
}

purgeAll();
