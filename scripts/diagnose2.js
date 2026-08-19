/**
 * More detailed diagnosis: test the exact query that the component uses.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vfofxbibxabvvgoswawk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmb2Z4YmlieGFidnZnb3N3YXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTYwNzEsImV4cCI6MjA5NTAzMjA3MX0.jictXXNHO05X0k4eXhsqWLEqkFIc8yFCQhXfa8zWd4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('=== Detailed Diagnosis ===\n');
  
  // Generate date range (same as in getSupplementCalendar)
  const days = 14;
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  console.log('Date range:', dates[0], '→', dates[dates.length-1]);
  
  // Test 1: Select with count
  console.log('\n1. SELECT count from user_supplement_calendar...');
  const { count, error: countError } = await supabase
    .from('user_supplement_calendar')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('   ✗ Error:', JSON.stringify(countError, null, 2));
    console.log('   Error code:', countError.code);
    console.log('   Error message:', countError.message);
    console.log('   Error details:', countError.details);
    console.log('   Error hint:', countError.hint);
  } else {
    console.log('   ✓ Success:', count, 'rows');
  }
  
  // Test 2: Direct select with where
  console.log('\n2. SELECT * with filters (simulating component query)...');
  const { data, error } = await supabase
    .from('user_supplement_calendar')
    .select('*')
    .eq('user_id', 'test-user-id')
    .eq('supplement_id', 1)
    .in('date', dates.slice(0, 3))
    .order('date', { ascending: true });
  
  if (error) {
    console.log('   ✗ Error:', JSON.stringify(error, null, 2));
    console.log('   Error code:', error.code);
    console.log('   Error message:', error.message);
    console.log('   Error details:', error.details);
    console.log('   Error hint:', error.hint);
  } else {
    console.log('   ✓ Success:', data?.length || 0, 'rows');
    console.log('   Data:', JSON.stringify(data));
  }
  
  // Test 3: Check if the table exists in information_schema via raw SQL
  console.log('\n3. Checking if table exists in information_schema...');
  // We can use a trick: query a known table and check the error for hints
  const { error: fakeError } = await supabase
    .from('user_supplement_calendar')
    .select('*')
    .limit(1);
  
  if (fakeError) {
    console.log('   ✗ Error:', JSON.stringify(fakeError, null, 2));
    // Check if error contains hint about schema cache
    if (fakeError.hint && fakeError.hint.includes('schema cache')) {
      console.log('\n   ⚠️ SCHEMA CACHE ISSUE DETECTED!');
      console.log('   The table exists in the database but PostgREST needs a schema cache refresh.');
      console.log('   Solution: Go to Supabase Dashboard > SQL Editor and run:');
      console.log('   ALTER TABLE user_supplement_calendar ENABLE ROW LEVEL SECURITY;');
    }
  } else {
    console.log('   ✓ Query succeeded without error');
  }
}

main().catch(console.error);