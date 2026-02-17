
import { createClient } from '@supabase/supabase-js';

// 사용자가 제공한 Project URL 및 Public Key 적용
const supabaseUrl = 'https://cysrtusjyexbhlzmrhgl.supabase.co';
const supabaseAnonKey = 'sb_publishable_VPfZZdLryM4tzHUSN6lEKg_PMWLos5Z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
