'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Notificaciones() {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    async function cargarNotificaciones() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
  router.push('/login')
  return
}

      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.log(error.message)
        return
      }

      setNotificaciones(data || [])

      if (data?.length > 0) {
  const ids = data
    .filter((notificacion) => !notificacion.leida)
    .map((notificacion) => notificacion.id)

  if (ids.length > 0) {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .in('id', ids)
  }
}
    }

    cargarNotificaciones()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        🔔 Notificaciones
      </h1>

      {notificaciones.length === 0 ? (
        <p className="text-zinc-400">
          No tenés notificaciones.
        </p>
      ) : (
        <div className="space-y-4">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`border rounded-xl p-4 ${
                notificacion.leida
                  ? 'border-zinc-700 bg-zinc-900/40'
                  : 'border-green-700 bg-green-950/30'
              }`}
            >
              <p>{notificacion.mensaje}</p>

              <p className="text-xs text-zinc-500 mt-2">
                {new Date(notificacion.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}