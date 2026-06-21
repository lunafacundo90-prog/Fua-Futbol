'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function iniciarSesion(e) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMensaje(error.message)
      return
    }

    router.push('/perfil')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-6 py-12">
      <div className="max-w-md mx-auto bg-black/40 border border-green-900 rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          Iniciar sesión
        </h1>

        <form onSubmit={iniciarSesion} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700"
            required
          />

          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">
            Ingresar
          </button>
          <Link
  href="/recuperar-password"
  className="block text-center text-sm text-green-400 hover:underline"
>
  ¿Olvidaste tu contraseña?
</Link>

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