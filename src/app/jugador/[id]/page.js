'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PerfilPublico({ params }) {
  const { id } = use(params)

  const [perfil, setPerfil] = useState(null)
  const [valoraciones, setValoraciones] = useState([])
  const [mensaje, setMensaje] = useState('Cargando perfil...')

  useEffect(() => {
    async function cargarPerfil() {
      const { data: perfilData, error: perfilError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (perfilError || !perfilData) {
        setMensaje('Jugador no encontrado')
        return
      }

      const { data: valoracionesData } = await supabase
        .from('valoraciones')
        .select('puntualidad, actitud, nivel_real, comentario')
        .eq('evaluado_id', id)

      setPerfil(perfilData)
      setValoraciones(valoracionesData || [])
      setMensaje('')
    }

    cargarPerfil()
  }, [id])

  const promedio = (campo) => {
    if (valoraciones.length === 0) return 0

    const total = valoraciones.reduce(
      (acc, item) => acc + (item[campo] || 0),
      0
    )

    return (total / valoraciones.length).toFixed(1)
  }

  const promedioGeneral = () => {
    if (valoraciones.length === 0) return 0

    const total = valoraciones.reduce((acc, item) => {
      return acc + (item.puntualidad || 0) + (item.actitud || 0) + (item.nivel_real || 0)
    }, 0)

    return (total / (valoraciones.length * 3)).toFixed(1)
  }

  const comentarios = valoraciones
    .filter((item) => item.comentario)
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-10">
      <div className="max-w-xl mx-auto bg-black/40 border border-green-900 rounded-2xl p-8">

        {mensaje && <p>{mensaje}</p>}

        {perfil && (
          <>
            <div className="flex flex-col items-center mb-6">
              <img
                src={perfil.avatar_url || 'https://via.placeholder.com/150'}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-2 border-green-500 mb-4"
              />

              <h1 className="text-3xl font-bold text-green-400">
                {perfil.nombre}
              </h1>
            </div>

            <div className="space-y-2 text-lg">
              <p>📍 {perfil.zona}</p>
              <p>⚽ {perfil.posicion}</p>
              <p>🎯 {perfil.nivel}</p>
            </div>

            <div className="mt-8 border-t border-green-900 pt-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                ⭐ Reputación
              </h2>

              <p className="text-3xl font-bold mb-2">
                ⭐ {promedioGeneral()} / 5
              </p>

              <p className="text-zinc-400 mb-4">
                Basado en {valoraciones.length} valoración/es
              </p>

              <div className="space-y-1">
                <p>⏱️ Puntualidad: {promedio('puntualidad')}</p>
                <p>🤝 Actitud: {promedio('actitud')}</p>
                <p>🎯 Nivel real: {promedio('nivel_real')}</p>
              </div>

              {comentarios.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-green-400 mb-3">
                    Comentarios
                  </h3>

                  <div className="space-y-2">
                    {comentarios.map((item, index) => (
                      <p
                        key={index}
                        className="bg-black/40 border border-green-900 rounded-lg p-3 text-zinc-300"
                      >
                        “{item.comentario}”
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}