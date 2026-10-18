import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabase = Boolean(url && anonKey);

export const supabase = hasSupabase
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null;

const FALLBACK_MODELS = [
  { id: 'fallback-1', display_name: 'Lumi', file_path: 'cat-1.glb', strip_order: 1 },
  { id: 'fallback-2', display_name: 'Pip', file_path: 'cat-2.glb', strip_order: 2 },
  { id: 'fallback-3', display_name: 'Mochi', file_path: 'cat-3.glb', strip_order: 3 },
];

export async function fetchModels() {
  if (!hasSupabase) {
    console.warn('Supabase keys not configured, using bundled model list');
    return FALLBACK_MODELS;
  }
  try {
    const { data, error } = await supabase
      .from('models')
      .select('id, display_name, file_path, strip_order')
      .order('strip_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return FALLBACK_MODELS;
    return data;
  } catch (err) {
    console.warn('Supabase unreachable, using fallback model list:', err);
    return FALLBACK_MODELS;
  }
}

export function resolveModelUrl(filePath) {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  if (hasSupabase) {
    return `${url}/storage/v1/object/public/models/${filePath}`;
  }
  return localFallbackUrl(filePath);
}

export function localFallbackUrl(filePath) {
  return `${import.meta.env.BASE_URL}models/${filePath}`;
}
