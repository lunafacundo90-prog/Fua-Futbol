'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Chat() {
  const router = useRouter()
  const [partidos, setPartidos] = useState([])
  const [mensaje, setMensaje] = useState('Cargando chats...')

  useEffect(() => {
    async function cargarChats() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('solicitudes_partido')
        .select(`
          id,
          estado,
          partidos (
            id,
            zona,
            fecha,
            hora,
            tipo_futbol
          )
        `)
        .eq('jugador_id', user.id)
        .eq('estado', 'aceptado')

      if (error) {
        setMensaje(error.message)
        return
      }

      setPartidos(data || [])
      setMensaje('')
    }

    cargarChats()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-6">
          💬 Chats
        </h1>

        {mensaje && (
          <p className="text-sm md:text-base text-zinc-300 mb-4">
            {mensaje}
          </p>
        )}

        {partidos.length === 0 && !mensaje && (
          <div className="bg-black/40 border border-green-900 rounded-xl p-5 text-center text-zinc-400">
            Todavía no tenés chats disponibles.
          </div>
        )}

        <div className="space-y-4">
          {partidos.map((item) => (
            <Link
              key={item.id}
              href={`/chat/${item.partidos?.id}`}
              className="block bg-black/40 border border-green-900 rounded-xl p-4 md:p-6 hover:border-green-500 transition"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-3">
                ⚽ Fútbol {item.partidos?.tipo_futbol}
              </h2>

              <div className="space-y-1 text-sm md:text-base text-zinc-200">
                <p>📍 {item.partidos?.zona}</p>
                <p>📅 {item.partidos?.fecha}</p>
                <p>⏰ {item.partidos?.hora}</p>
              </div>

              <p className="mt-3 text-sm text-green-400">
                Entrar al chat →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}