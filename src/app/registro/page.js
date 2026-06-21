'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Registro() {
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [zona, setZona] = useState('')
  const [posicion, setPosicion] = useState('')
  const [nivel, setNivel] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [aceptoTerminos, setAceptoTerminos] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function registrarUsuario(e) {
    e.preventDefault()

    if (!aceptoTerminos) {
      setMensaje('Debés aceptar los Términos y Condiciones y la Política de Privacidad.')
      return
    }

    setMensaje('Creando cuenta...')

    const fechaAceptacion = new Date().toISOString()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          edad,
          zona,
          posicion,
          nivel,
          acepto_terminos: true,
          fecha_acepto_terminos: fechaAceptacion,
        },
      },
    })

    if (error) {
      setMensaje(error.message)
      return
    }

    const user = data.user

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        nombre,
        edad: Number(edad),
        zona,
        posicion,
        nivel,
        acepto_terminos: true,
        fecha_acepto_terminos: fechaAceptacion,
      })

    if (profileError) {
      setMensaje(profileError.message)
      return
    }

    setMensaje('Cuenta creada. Revisá tu email para confirmar el registro.')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-xl mx-auto bg-black/40 border border-green-900 rounded-2xl p-5 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-6 text-center">
          Crear cuenta
        </h1>

        <form onSubmit={registrarUsuario} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <input
            type="number"
            placeholder="Edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <input
            type="text"
            placeholder="Zona"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <select
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          >
            <option value="">Posición</option>
            <option value="Arquero">Arquero</option>
            <option value="Defensor">Defensor</option>
            <option value="Mediocampista">Mediocampista</option>
            <option value="Delantero">Delantero</option>
            <option value="Me adapto">Me adapto</option>
          </select>

          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          >
            <option value="">Nivel</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Bueno">Bueno</option>
            <option value="Competitivo">Competitivo</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <label className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
            <input
              type="checkbox"
              checked={aceptoTerminos}
              onChange={(e) => setAceptoTerminos(e.target.checked)}
              className="mt-1 shrink-0"
              required
            />

            <span>
              He leído y acepto los{' '}
              <Link href="/terminos" className="text-green-400 underline">
                Términos y Condiciones
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" className="text-green-400 underline">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>

          <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition text-base">
            Registrarme
          </button>

          {mensaje && (
            <p className="text-center text-sm text-zinc-300 leading-relaxed">
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}