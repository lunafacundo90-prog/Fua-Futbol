'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function recuperarPassword(e) {
    e.preventDefault()

    setCargando(true)

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: 'http://localhost:3000/actualizar-password',
      }
    )

    if (error) {
      setMensaje(error.message)
      setCargando(false)
      return
    }

    setMensaje(
      '📩 Te enviamos un enlace para recuperar tu contraseña. Revisá tu correo.'
    )

    setCargando(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-6 py-12">
      <div className="max-w-md mx-auto bg-black/40 border border-green-900 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          Recuperar contraseña
        </h1>

        <form onSubmit={recuperarPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            required
          />

          <button
            disabled={cargando}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
          >
            {cargando
              ? 'Enviando...'
              : 'Enviar enlace de recuperación'}
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