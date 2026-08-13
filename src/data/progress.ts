import { supabase } from '../lib/supabase';

// No unique(user_id, meditation_id) on the table, so upsert-by-conflict isn't
// available: update the existing row, insert if none. Best-effort — a failed
// write (e.g. RLS) is logged, never thrown, so it can't break playback.
export async function saveProgress(userId: string, meditationId: string, seconds: number) {
  const { data, error } = await supabase
    .from('progress')
    .update({ seconds_listened: seconds })
    .eq('user_id', userId)
    .eq('meditation_id', meditationId)
    .select('id');

  if (error) {
    console.warn('progress update failed:', error.message);
    return;
  }
  if (data && data.length > 0) return;

  const { error: insertErr } = await supabase
    .from('progress')
    .insert({ user_id: userId, meditation_id: meditationId, seconds_listened: seconds });
  if (insertErr) console.warn('progress insert failed:', insertErr.message);
}
