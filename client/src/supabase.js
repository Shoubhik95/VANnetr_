import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxeexwefnrzqcvftzemk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bsPjjnqP_EY1AMes2RXH-w_ovHv4XZi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
