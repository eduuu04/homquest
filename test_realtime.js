import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://boudgmhevayakohouiqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_cVkRn_uF8hkjt3YbE5tdJA_S7Y6VTkY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// We can't run DDL via the anon key, but we CAN verify if realtime is working
// by inserting a row and listening for the event.
// Instead, let's use the REST API to check if the publication exists.

async function testRealtimeWorks() {
  console.log('🔍 Testing Supabase Realtime connectivity...\n');

  let realtimeReceived = false;

  const channel = supabase
    .channel('test-realtime-' + Date.now())
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'families' },
      (payload) => {
        console.log('✅ REALTIME EVENT RECEIVED:', payload.eventType, payload);
        realtimeReceived = true;
      }
    )
    .subscribe((status) => {
      console.log('📡 Channel status:', status);
    });

  // Wait for subscription to establish
  await new Promise(r => setTimeout(r, 2000));

  // Insert a test row
  const testId = 'rt_test_' + Date.now();
  console.log('📝 Inserting test family...');
  await supabase.from('families').upsert([{
    id: testId,
    name: 'Realtime Test Family',
    icon: '🧪',
    code: 'RT-TEST-' + Date.now(),
    sanitized_code: 'RTTEST' + Date.now()
  }], { onConflict: 'id' });

  // Wait for realtime event
  await new Promise(r => setTimeout(r, 3000));

  if (realtimeReceived) {
    console.log('\n🎉 REALTIME IS WORKING! Events are being received.');
  } else {
    console.log('\n❌ REALTIME NOT WORKING. No events received.');
    console.log('You need to run enable_realtime.sql in the Supabase SQL Editor.');
  }

  // Cleanup
  await supabase.from('families').delete().eq('id', testId);
  supabase.removeChannel(channel);

  // Wait a moment for cleanup
  await new Promise(r => setTimeout(r, 1000));
  process.exit(0);
}

testRealtimeWorks();
