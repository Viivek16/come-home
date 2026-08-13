import { supabase } from '../lib/supabase';

export type Meditation = {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration_sec: number | null;
  category_id: string | null;
  scene_id: string | null;
  is_free: boolean | null;
  sort: number | null;
};

const COLUMNS = 'id, title, description, audio_url, duration_sec, category_id, scene_id, is_free, sort';

// Public read (anon RLS), so this works for guests too.
export async function listMeditations(): Promise<Meditation[]> {
  const { data, error } = await supabase
    .from('meditations')
    .select(COLUMNS)
    .order('sort', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
