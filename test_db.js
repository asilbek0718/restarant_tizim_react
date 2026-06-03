import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgeobpflzcjvwtqehamd.supabase.co';
const supabaseKey = 'sb_publishable_l-MvSuVpbvIHj00t18oApw_6bWBGXFc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name')
    .limit(1);

  if (error) {
    console.error('Error fetching menu items:', error);
  } else {
    console.log('Fetched menu item:', data);
  }
}

run();
