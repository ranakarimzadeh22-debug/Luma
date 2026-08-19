/**
 * Diagnostic script to check if the user_supplement_calendar table exists
 * and test Supabase connectivity.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vfofxbibxabvvgoswawk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmb2Z4YmlieGFidnZnb3N3YXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTYwNzEsImV4cCI6MjA5NTAzMjA3MX0.jictXXNHO05X0k4eXhsqWLEqkFIc8yFCQhXfa8zWd4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('=== Diagnosis ===\n');
  
  // Test 1: Check if we can reach the API
  console.log('1. Testing Supabase connection...');
  const { data: healthData, error: healthError } = await supabase.from('user_supplements').select('count', { count: 'exact', head: true });
  if (healthError) {
    console.log(`   user_supplements table error: ${JSON.stringify(healthError)}`);
  } else {
    console.log('   ✓ user_supplements table accessible');
  }
  
  // Test 2: Check if user_supplement_calendar table exists
  console.log('\n2. Checking user_supplement_calendar table...');
  try {
    // Try to access the table directly
    const { data: calData, error: calError } = await supabase
      .from('user_supplement_calendar')
      .select('count', { count: 'exact', head: true });
    
    if (calError) {
      console.log(`   ✗ Error: ${JSON.stringify(calError)}`);
      console.log('   → The table user_supplement_calendar likely does NOT exist.');
      console.log('   → You need to apply migration 011_supplement_calendar.sql');
    } else {
      console.log('   ✓ Table exists!');
    }
  } catch (e) {
    console.log(`   ✗ Exception: ${e.message}`);
  }
  
  // Test 3: Try to query the migration table directly via REST
  console.log('\n3. Testing REST API directly...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_supplement_calendar?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    console.log(`   Status: ${response.status}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 500)}`);
  } catch (e) {
    console.log(`   Fetch error: ${e.message}`);
  }
}

main().catch(console.error);