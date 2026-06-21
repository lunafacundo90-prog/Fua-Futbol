'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { tieneValoracionesPendientes } from '@/lib/tieneValoracionesPendientes'

export default function CrearPartido() {
  const router = useRouter()
  const [zona, setZona] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [tipoFutbol, setTipoFutbol] = useState('')
  const [jugadoresFaltan, setJugadoresFaltan] = useState('')
  const [nivel, setNivel] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [bloqueado, setBloqueado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function verificarPendientes() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const pendientes = await tieneValoracionesPendientes(user.id)

      if (pendientes) {
        setBloqueado(true)
      }

      setCargando(false)
    }

    verificarPendientes()
  }, [router])

  async function publicarPartido(e) {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMensaje('Debes iniciar sesión')
      return
    }

    const { data: pendientes, error: pendientesError } = await supabase
      .from('valoraciones_pendientes')
      .select('id')
      .eq('evaluador_id', user.id)
      .eq('completada', false)

    if (pendientesError) {
      setMensaje(pendientesError.message)
      return
    }

    if (pendientes && pendientes.length > 0) {
      setBloqueado(true)
      setMensaje('Tenés valoraciones pendientes')
      return
    }

    const { error } = await supabase.from('partidos').insert({
      creador_id: user.id,
      zona,
      fecha,
      hora,
      tipo_futbol: tipoFutbol,
      jugadores_faltan: Number(jugadoresFaltan),
      nivel,
      descripcion,
      ubicacion,
      maps_url: mapsUrl,
    })

    if (error) {
      setMensaje(error.message)
      return
    }

    setMensaje('Partido publicado correctamente')
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:px-6 md:py-12">
        <p className="text-center text-green-400">Cargando...</p>
      </main>
    )
  }

  if (bloqueado) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-xl mx-auto bg-black/40 border border-yellow-700 rounded-2xl p-5 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
            ⚠️ Tenés valoraciones pendientes
          </h1>

          <p className="text-zinc-300 mb-6 leading-relaxed">
            Antes de crear un partido, completá las valoraciones de tus partidos anteriores.
          </p>

          <a
            href="/valoraciones"
            className="inline-block w-full md:w-auto bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold"
          >
            Ir a valorar
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-xl mx-auto bg-black/40 border border-green-900 rounded-2xl p-5 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-6 text-center">
          Publicar Partido
        </h1>

        <form onSubmit={publicarPartido} className="space-y-4">
          <input
            type="text"
            placeholder="Zona"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <input
            type="text"
            placeholder="📍 Ubicación de la cancha"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
          />

          <input
            type="text"
            placeholder="🗺️ Link de Google Maps"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

          <select
            value={tipoFutbol}
            onChange={(e) => setTipoFutbol(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          >
            <option value="">Tipo de fútbol</option>
            <option value="5">Fútbol 5</option>
            <option value="7">Fútbol 7</option>
            <option value="8">Fútbol 8</option>
            <option value="11">Fútbol 11</option>
          </select>

          <input
            type="number"
            placeholder="Jugadores que faltan"
            value={jugadoresFaltan}
            onChange={(e) => setJugadoresFaltan(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
            required
          />

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

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full min-h-28 p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-base"
          />

          <button className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition">
            Publicar
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