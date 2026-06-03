import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgeobpflzcjvwtqehamd.supabase.co';
const supabaseKey = 'sb_publishable_l-MvSuVpbvIHj00t18oApw_6bWBGXFc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's test querying different tables to see if they exist
  const tables = ['orders', 'order_items', 'menu_items', 'tables'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table '${t}' error:`, error.message);
    } else {
      console.log(`Table '${t}' exists! Sample data:`, data);
    }
  }
}

run();
