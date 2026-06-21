'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ChatPartido({ params }) {
  const router = useRouter()
  const { id: partidoId } = use(params)

  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [mensaje, setMensaje] = useState('Cargando chat...')

  useEffect(() => {
    async function cargarMensajes() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('mensajes_chat')
        .select(`
          id,
          mensaje,
          created_at,
          profiles (
            id,
            nombre,
            avatar_url
          )
        `)
        .eq('partido_id', partidoId)
        .order('created_at', { ascending: true })

      if (error) {
        setMensaje(error.message)
        return
      }

      setMensajes(data || [])
      setMensaje('')
    }

    cargarMensajes()

    const canal = supabase
      .channel(`chat-partido-${partidoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `partido_id=eq.${partidoId}`,
        },
        () => {
          cargarMensajes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [partidoId, router])

  async function enviarMensaje(e) {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !nuevoMensaje.trim()) return

    const texto = nuevoMensaje.trim()

    setNuevoMensaje('')

    const { error } = await supabase.from('mensajes_chat').insert({
      partido_id: partidoId,
      usuario_id: user.id,
      mensaje: texto,
    })

    if (error) {
      setMensaje(error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-6 md:p-8">
      <div className="max-w-3xl mx-auto flex min-h-[calc(100vh-180px)] flex-col">
        <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-4">
          💬 Chat del partido
        </h1>

        <div className="flex-1 bg-black/40 border border-green-900 rounded-xl p-4 md:p-6 mb-4 space-y-4 overflow-y-auto">
          {mensaje && (
            <p className="text-sm md:text-base text-zinc-300">
              {mensaje}
            </p>
          )}

          {!mensaje && mensajes.length === 0 && (
            <p className="text-sm md:text-base text-zinc-400 text-center">
              Todavía no hay mensajes. Sé el primero en escribir.
            </p>
          )}

          {mensajes.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                alt="Avatar"
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0 border border-green-800"
              />

              <div className="min-w-0 max-w-full bg-black/30 border border-green-900 rounded-xl px-3 py-2">
                <p className="font-bold text-green-400 text-sm">
                  {item.profiles?.nombre || 'Jugador'}
                </p>

                <p className="text-sm md:text-base text-zinc-200 leading-relaxed break-words">
                  {item.mensaje}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={enviarMensaje} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
          />

          <button className="w-full md:w-auto bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold transition">
            Enviar
          </button>
        </form>
      </div>
    </main>
  )
}