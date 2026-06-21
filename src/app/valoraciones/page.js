'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Valoraciones() {
  const [pendientes, setPendientes] = useState([])
  const [puntajes, setPuntajes] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [mensaje, setMensaje] = useState('Cargando valoraciones...')

  async function cargarPendientes() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMensaje('Debés iniciar sesión para ver tus valoraciones.')
      return
    }

    const { data, error } = await supabase
      .from('valoraciones_pendientes')
      .select(`
        *,
        partidos (
          tipo_futbol,
          zona,
          fecha,
          hora
        ),
        profiles (
          nombre,
          posicion,
          nivel
        )
      `)
      .eq('evaluador_id', user.id)
      .eq('completada', false)

    if (error) {
      setMensaje(error.message)
      return
    }

    setPendientes(data || [])
    setMensaje('')
  }

  useEffect(() => {
    cargarPendientes()
  }, [])

  async function enviarValoracion(pendiente) {
    const puntualidad = puntajes[`${pendiente.id}-puntualidad`]
    const actitud = puntajes[`${pendiente.id}-actitud`]
    const nivelReal = puntajes[`${pendiente.id}-nivel_real`]
    const comentario = comentarios[pendiente.id] || ''

    if (!puntualidad || !actitud || !nivelReal) {
      setMensaje('Completá puntualidad, actitud y nivel real.')
      return
    }

    const { error } = await supabase.from('valoraciones').insert({
      partido_id: pendiente.partido_id,
      evaluador_id: pendiente.evaluador_id,
      evaluado_id: pendiente.evaluado_id,
      puntualidad,
      actitud,
      nivel_real: nivelReal,
      comentario,
    })

    if (error) {
      setMensaje(error.message)
      return
    }

    const { error: updateError } = await supabase
      .from('valoraciones_pendientes')
      .update({ completada: true })
      .eq('id', pendiente.id)

    if (updateError) {
      setMensaje(updateError.message)
      return
    }

    setMensaje('Valoración enviada correctamente.')
    cargarPendientes()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-6">
          ⭐ Valoraciones
        </h1>

        {mensaje && (
          <p className="mb-4 text-sm md:text-base text-zinc-300 leading-relaxed">
            {mensaje}
          </p>
        )}

        {pendientes.length === 0 && !mensaje ? (
          <div className="bg-black/40 border border-green-900 rounded-xl p-5 text-center text-zinc-400">
            No tenés valoraciones pendientes.
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((pendiente) => (
              <div
                key={pendiente.id}
                className="bg-black/40 border border-green-800 rounded-xl p-4 md:p-6"
              >
                <p className="text-lg md:text-xl font-bold text-green-400 mb-3">
                  ⚽ Fútbol {pendiente.partidos?.tipo_futbol}
                </p>

                <div className="space-y-1 text-sm md:text-base text-zinc-200">
                  <p>📍 {pendiente.partidos?.zona}</p>
                  <p>📅 {pendiente.partidos?.fecha}</p>
                  <p>⏰ {pendiente.partidos?.hora}</p>
                </div>

                <div className="mt-4 bg-black/30 border border-green-900 rounded-xl p-4 text-sm md:text-base">
                  <p>
                    Jugador a evaluar:{' '}
                    <strong className="text-white">
                      {pendiente.profiles?.nombre}
                    </strong>
                  </p>

                  <p>⚽ {pendiente.profiles?.posicion}</p>
                  <p>🎯 {pendiente.profiles?.nivel}</p>
                </div>

                <div className="mt-5 space-y-5">
                  {[
                    ['puntualidad', 'Puntualidad'],
                    ['actitud', 'Actitud'],
                    ['nivel_real', 'Nivel real'],
                  ].map(([campo, label]) => {
                    const key = `${pendiente.id}-${campo}`

                    return (
                      <div key={campo}>
                        <p className="mb-2 font-semibold text-sm md:text-base">
                          {label}:
                        </p>

                        <div className="flex flex-wrap gap-2 text-3xl md:text-4xl">
                          {[1, 2, 3, 4, 5].map((estrella) => (
                            <button
                              key={estrella}
                              type="button"
                              onClick={() =>
                                setPuntajes({
                                  ...puntajes,
                                  [key]: estrella,
                                })
                              }
                              className={`leading-none ${
                                estrella <= (puntajes[key] || 0)
                                  ? 'text-yellow-400'
                                  : 'text-zinc-600'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <textarea
                  className="w-full min-h-24 mt-5 p-3 rounded-lg bg-black border border-green-800 text-white text-base"
                  placeholder="Comentario opcional..."
                  value={comentarios[pendiente.id] || ''}
                  onChange={(e) =>
                    setComentarios({
                      ...comentarios,
                      [pendiente.id]: e.target.value,
                    })
                  }
                />

                <button
                  onClick={() => enviarValoracion(pendiente)}
                  className="mt-4 w-full md:w-auto bg-green-600 hover:bg-green-700 px-5 py-3 rounded-lg font-bold transition"
                >
                  Enviar valoración
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}