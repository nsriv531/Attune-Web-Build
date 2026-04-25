// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── DB helpers ─────────────────────────────────────────────────────────────

export async function saveSession(session: {
  subject: string;
  subject_id: string;
  duration_minutes: number;
  started_at: string;
  ended_at: string;
  focus_score: number;
  distraction_count: number;
  feeling: string | null;
  reflection_note: string | null;
  xp_earned: number;
  completed: boolean;
}) {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRecentSessions(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateStreak(userId: string, streakDays: number, totalXp: number) {
  const { error } = await supabase
    .from('profiles')
    .update({ streak_days: streakDays, total_xp: totalXp, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}
