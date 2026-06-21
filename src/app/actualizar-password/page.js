'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ActualizarPassword() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function actualizarPassword(e) {
    e.preventDefault()

    setCargando(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    setMensaje('✅ Contraseña actualizada correctamente')

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-6 py-12">
      <div className="max-w-md mx-auto bg-black/40 border border-green-900 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          Nueva contraseña
        </h1>

        <form onSubmit={actualizarPassword} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            required
          />

          <button
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {cargando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>

          {mensaje && (
            <p className="text-center text-sm">
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}