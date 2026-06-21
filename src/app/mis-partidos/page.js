'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function MisPartidos() {
  const router = useRouter()
  const [partidos, setPartidos] = useState([])
  const [valoraciones, setValoraciones] = useState([])

  useEffect(() => {
    async function cargarMisPartidos() {
      const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
  router.push('/login')
  return
}

      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          solicitudes_partido (
            id,
            estado,
            jugador_id,
            profiles (
              nombre,
              zona,
              posicion,
              nivel
            )
          )
        `)
        .eq('creador_id', user.id)

      if (error) {
        console.log(error.message)
        return
      }

      const { data: valoracionesData, error: valoracionesError } = await supabase
        .from('valoraciones')
        .select('evaluado_id, puntualidad, actitud, nivel_real')

      if (valoracionesError) {
        console.log(valoracionesError.message)
      }

      setValoraciones(valoracionesData || [])
      setPartidos(data || [])
    }

    cargarMisPartidos()
  }, [])

  async function cambiarEstadoSolicitud(solicitudId, nuevoEstado) {
    const { error } = await supabase
      .from('solicitudes_partido')
      .update({ estado: nuevoEstado })
      .eq('id', solicitudId)

    if (error) {
      alert(error.message)
      console.log(error)
      return
    }

    if (nuevoEstado === 'aceptado') {
      const partidoEncontrado = partidos.find((partido) =>
        partido.solicitudes_partido.some(
          (solicitud) => solicitud.id === solicitudId
        )
      )

      const solicitudEncontrada = partidoEncontrado?.solicitudes_partido.find(
        (solicitud) => solicitud.id === solicitudId
      )

      if (partidoEncontrado && solicitudEncontrada) {
        const { error: notificacionError } = await supabase
          .from('notificaciones')
          .insert({
            usuario_id: solicitudEncontrada.jugador_id,
            tipo: 'solicitud_aceptada',
            mensaje: `Tu solicitud para el partido de Fútbol ${partidoEncontrado.tipo_futbol} fue aceptada.`,
            partido_id: partidoEncontrado.id,
          })

        if (notificacionError) {
          console.log(notificacionError)
        }
      }
    }

    setPartidos((partidosActuales) =>
      partidosActuales.map((partido) => ({
        ...partido,
        jugadores_faltan:
          nuevoEstado === 'aceptado' &&
          partido.solicitudes_partido.some(
            (solicitud) => solicitud.id === solicitudId
          )
            ? Math.max(0, partido.jugadores_faltan - 1)
            : partido.jugadores_faltan,

        solicitudes_partido: partido.solicitudes_partido.map((solicitud) =>
          solicitud.id === solicitudId
            ? { ...solicitud, estado: nuevoEstado }
            : solicitud
        ),
      }))
    )
  }

  async function finalizarPartido(partido) {
    const { error } = await supabase
      .from('partidos')
      .update({ finalizado: true })
      .eq('id', partido.id)

    if (error) {
      alert(error.message)
      return
    }

    const jugadoresAceptados = partido.solicitudes_partido.filter(
      (solicitud) => solicitud.estado === 'aceptado'
    )

    const valoracionesPendientes = jugadoresAceptados.flatMap((solicitud) => {
  const valoraciones = []

  if (partido.creador_id !== solicitud.jugador_id) {
    valoraciones.push({
      partido_id: partido.id,
      evaluador_id: partido.creador_id,
      evaluado_id: solicitud.jugador_id,
    })

    valoraciones.push({
      partido_id: partido.id,
      evaluador_id: solicitud.jugador_id,
      evaluado_id: partido.creador_id,
    })
  }

  return valoraciones
})

    if (valoracionesPendientes.length > 0) {
      const { error: valoracionError } = await supabase
        .from('valoraciones_pendientes')
        .insert(valoracionesPendientes)

      if (valoracionError) {
        alert(valoracionError.message)
        return
      }
    }

    setPartidos((partidosActuales) =>
      partidosActuales.map((p) =>
        p.id === partido.id
          ? { ...p, finalizado: true }
          : p
      )
    )
  }

  function obtenerReputacion(jugadorId) {
    const recibidas = valoraciones.filter(
      (valoracion) => valoracion.evaluado_id === jugadorId
    )

    if (recibidas.length === 0) return null

    const promedio = (campo) => {
      const total = recibidas.reduce(
        (acc, item) => acc + (item[campo] || 0),
        0
      )

      return (total / recibidas.length).toFixed(1)
    }

    const general = (
      recibidas.reduce((acc, item) => {
        return acc + (item.puntualidad || 0) + (item.actitud || 0) + (item.nivel_real || 0)
      }, 0) / (recibidas.length * 3)
    ).toFixed(1)

    return {
      cantidad: recibidas.length,
      general,
      puntualidad: promedio('puntualidad'),
      actitud: promedio('actitud'),
      nivel_real: promedio('nivel_real'),
    }
  }

  function BloqueReputacion({ jugadorId }) {
    const reputacion = obtenerReputacion(jugadorId)

    if (!reputacion) {
      return (
        <p className="text-zinc-500 text-sm mt-1">
          ⭐ Sin valoraciones todavía
        </p>
      )
    }

    return (
      <div className="text-sm text-zinc-300 mt-1">
        <p>⭐ {reputacion.general} / 5 ({reputacion.cantidad})</p>
        <p>
          ⏱️ {reputacion.puntualidad} | 🤝 {reputacion.actitud} | 🎯 {reputacion.nivel_real}
        </p>
      </div>
    )
  }

  function TarjetaPartido({ partido, historial = false }) {
    return (
      <div
        className={`rounded-xl p-6 mb-4 ${
          historial
            ? 'bg-black/20 border border-zinc-800 opacity-80'
            : 'bg-black/40 border border-green-900'
        }`}
      >
        <h2 className="text-2xl font-bold">
          ⚽ Fútbol {partido.tipo_futbol}
        </h2>

        <p>📍 {partido.zona}</p>
        <p>📅 {partido.fecha}</p>
        <p>⏰ {partido.hora}</p>
        <p>👥 Faltan {partido.jugadores_faltan} jugadores</p>

        {historial ? (
          <p className="mt-4 text-green-400 font-bold">
            ✅ Partido finalizado
          </p>
        ) : (
          <button
            onClick={() => finalizarPartido(partido)}
            className="mt-4 bg-blue-600 px-4 py-2 rounded-lg font-bold"
          >
            Finalizar partido
          </button>
        )}

        {!historial && (
          <div className="mt-4">
            <h3 className="font-bold text-green-400 mb-2">
              Solicitudes
            </h3>

            <div className="mt-4">
              <h4 className="text-green-500 font-bold mb-2">
                ✅ Jugadores Confirmados
              </h4>

              {partido.solicitudes_partido
                .filter((solicitud) => solicitud.estado === 'aceptado')
                .map((solicitud) => (
                  <div key={solicitud.id} className="text-zinc-200 mb-3">
                    <p>- {solicitud.profiles?.nombre}</p>
                    <BloqueReputacion jugadorId={solicitud.jugador_id} />
                  </div>
                ))}
            </div>

            <div className="mt-4">
              <h4 className="text-yellow-400 font-bold mb-2">
                ⏳ Solicitudes Pendientes
              </h4>

              {partido.solicitudes_partido
                .filter((solicitud) => solicitud.estado === 'pendiente')
                .map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="border border-yellow-700 rounded-lg p-3 mb-2"
                  >
                    <p>⏳ <strong>{solicitud.profiles?.nombre}</strong></p>
                    <p>📍 {solicitud.profiles?.zona}</p>
                    <p>⚽ {solicitud.profiles?.posicion}</p>
                    <p>🎯 {solicitud.profiles?.nivel}</p>

                    <BloqueReputacion jugadorId={solicitud.jugador_id} />

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => cambiarEstadoSolicitud(solicitud.id, 'aceptado')}
                        className="bg-green-600 px-4 py-2 rounded-lg font-bold"
                      >
                        Aceptar
                      </button>

                      <button
                        onClick={() => cambiarEstadoSolicitud(solicitud.id, 'rechazado')}
                        className="bg-red-600 px-4 py-2 rounded-lg font-bold"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4">
              <h4 className="text-red-500 font-bold mb-2">
                ❌ Solicitudes Rechazadas
              </h4>

              {partido.solicitudes_partido
                .filter((solicitud) => solicitud.estado === 'rechazado')
                .map((solicitud) => (
                  <p key={solicitud.id} className="text-zinc-200 mb-1">
                    - {solicitud.profiles?.nombre}
                  </p>
                ))}
            </div>

            {partido.solicitudes_partido.length === 0 && (
              <p className="text-zinc-400">
                Todavía no hay solicitudes.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  const partidosActivos = partidos.filter((partido) => !partido.finalizado)
  const historial = partidos.filter((partido) => partido.finalizado)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Mis Partidos
      </h1>

      <h2 className="text-2xl font-bold text-green-400 mb-4">
        🟢 Partidos activos
      </h2>

      {partidosActivos.length === 0 ? (
        <p className="text-zinc-400 mb-8">
          No tenés partidos activos.
        </p>
      ) : (
        partidosActivos.map((partido) => (
          <TarjetaPartido key={partido.id} partido={partido} />
        ))
      )}

      <h2 className="text-2xl font-bold text-zinc-400 mt-10 mb-4">
        📚 Historial
      </h2>

      {historial.length === 0 ? (
        <p className="text-zinc-500">
          Todavía no tenés partidos finalizados.
        </p>
      ) : (
        historial.map((partido) => (
          <TarjetaPartido key={partido.id} partido={partido} historial />
        ))
      )}
    </main>
  )
}