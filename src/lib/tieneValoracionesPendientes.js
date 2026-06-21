import { supabase } from '@/lib/supabaseClient'

export async function tieneValoracionesPendientes(userId) {
  const { data, error } = await supabase
    .from('valoraciones_pendientes')
    .select('id')
    .eq('evaluador_id', userId)
    .eq('completada', false)
    .limit(1)

  if (error) {
    console.error('Error verificando valoraciones pendientes:', error)
    return false
  }

  return data.length > 0
}