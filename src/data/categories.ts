import { supabase } from '../lib/supabase';

export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  sort: number | null;
};

const COLUMNS = 'id, name, slug, color, icon, sort';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(COLUMNS)
    .order('sort', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select(COLUMNS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
