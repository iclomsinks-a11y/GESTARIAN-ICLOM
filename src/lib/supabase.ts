import { createClient } from '@supabase/supabase-js'

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('gestarian_supabase_url') : null
const localKey = typeof window !== 'undefined' ? localStorage.getItem('gestarian_supabase_anon_key') : null

// URL y Clave con fallback seguro para que la aplicación nunca se quede en negro si aún no se han rellenado las claves
export const supabaseUrl = envUrl || localUrl || 'https://placeholder-gestarian.supabase.co'
export const supabaseAnonKey = envKey || localKey || 'placeholder-anon-key-gestarian'
export const isSupabaseConfigured = Boolean((envUrl && envKey) || (localUrl && localKey))

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
