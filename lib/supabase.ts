
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cysrtusjyexbhlzmrhgl.supabase.co';
const supabaseAnonKey = 'sb_publishable_VPfZZdLryM4tzHUSN6lEKg_PMWLos5Z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
