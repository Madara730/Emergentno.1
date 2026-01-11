import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials as per requirements (no process.env)
const SUPABASE_URL = 'https://chusvhzyqvgxbxudmnsl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K3WeV8ieU_V3yxo1YQtQqg_NiDiXeVN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// RLS Error SQL Fix - to be shown in modal
export const RLS_FIX_SQL = `
-- Run this SQL in Supabase SQL Editor to enable public access:

-- Allow anyone to read courses
CREATE POLICY "Public read access" ON public.courses
  FOR SELECT USING (true);

-- Allow anyone to insert courses (for demo purposes)
CREATE POLICY "Public insert access" ON public.courses
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update courses (for demo purposes)
CREATE POLICY "Public update access" ON public.courses
  FOR UPDATE USING (true);

-- Allow anyone to delete courses (for demo purposes)
CREATE POLICY "Public delete access" ON public.courses
  FOR DELETE USING (true);
`;

export default supabase;
