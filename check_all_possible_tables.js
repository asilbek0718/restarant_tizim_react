import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgeobpflzcjvwtqehamd.supabase.co';
const supabaseKey = 'sb_publishable_l-MvSuVpbvIHj00t18oApw_6bWBGXFc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tables = [
    'users', 'profiles', 'staff', 'employees', 'members', 'managers', 
    'admins', 'settings', 'user_roles', 'roles', 'credentials'
  ];
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*').limit(3);
      if (error) {
        console.log(`Table '${t}' check failed:`, error.message);
      } else {
        console.log(`Table '${t}' exists! Data:`, data);
      }
    } catch (e) {
      console.log(`Table '${t}' threw exception:`, e.message);
    }
  }
}

run();
