/**
 * Supabase Configuration
 * 
 * This file will hold the Supabase client initialization.
 * Currently a placeholder — fill in your project URL and anon key
 * after creating your Supabase project.
 * 
 * Usage:
 *   import { supabase } from '@/shared/api/supabase';
 *   const { data, error } = await supabase.from('orders').select('*');
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client will be initialized here once credentials are provided.
 * 
 * Example (uncomment when ready):
 * 
 * import { createClient } from '@supabase/supabase-js';
 * export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
 *   auth: {
 *     persistSession: true,
 *     autoRefreshToken: true,
 *   },
 *   realtime: {
 *     params: {
 *       eventsPerSecond: 10,
 *     },
 *   },
 * });
 */

// Placeholder export — replace with real client when Supabase is connected
export const supabase = null;

export const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export default { supabase, isSupabaseConfigured };
