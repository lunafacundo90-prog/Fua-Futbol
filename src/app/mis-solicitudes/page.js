'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function MisSolicitudes() {
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [reputaciones, setReputaciones] = useState({})

  async function cargarSolicitudes() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
  router.push('/login')
  return
}

    const { data, error } = await supabase
      .from('solicitudes_partido')
      .select(`
        *,
        partidos (
          id,
          fecha,
          hora,
          zona,
          tipo_futbol,
          ubicacion,
          jugadores_faltan,
          solicitudes_partido (
            id,
            estado,
            profiles (
  id,
  nombre,
  posicion,
  nivel,
  avatar_url
)
          )
        )
      `)
      .eq('jugador_id', user.id)

    if (error) {
      console.log(error.message)
      return
    }
const jugadoresIds = []

data?.forEach((solicitud) => {
  solicitud.partidos?.solicitudes_partido?.forEach((s) => {
    if (s.profiles?.id) {
      jugadoresIds.push(s.profiles.id)
    }
  })
})

const idsUnicos = [...new Set(jugadoresIds)]

const { data: valoracionesData } = await supabase
  .from('valoraciones')
  .select('evaluado_id, puntualidad, actitud, nivel_real')
  .in('evaluado_id', idsUnicos)

const reputacionesObj = {}

valoracionesData?.forEach((valoracion) => {
  if (!reputacionesObj[valoracion.evaluado_id]) {
    reputacionesObj[valoracion.evaluado_id] = {
      total: 0,
      cantidad: 0,
    }
  }

  reputacionesObj[valoracion.evaluado_id].total +=
    (valoracion.puntualidad || 0) +
    (valoracion.actitud || 0) +
    (valoracion.nivel_real || 0)

  reputacionesObj[valoracion.evaluado_id].cantidad += 3
})

const promediosObj = {}

Object.keys(reputacionesObj).forEach((id) => {
  const item = reputacionesObj[id]
  promediosObj[id] = (item.total / item.cantidad).toFixed(1)
})

setReputaciones(promediosObj)

    setSolicitudes(data || [])
  }

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  async function darseDeBaja(solicitud) {
    const confirmar = window.confirm('¿Seguro que querés darte de baja de este partido?')

    if (!confirmar) return

    const { data: solicitudActualizada, error: solicitudError } = await supabase
  .from('solicitudes_partido')
  .update({ estado: 'baja' })
  .eq('id', solicitud.id)
  .select()

if (solicitudError) {
  setMensaje(solicitudError.message)
  return
}

if (!solicitudActualizada || solicitudActualizada.length === 0) {
  setMensaje('No se pudo actualizar la solicitud')
  return
}

console.log('Solicitud actualizada:', solicitudActualizada)

  const { data: espera, error: esperaError } = await supabase
  .from('solicitudes_partido')
  .select('id')
  .eq('partido_id', solicitud.partidos?.id)
  .eq('estado', 'lista_espera')
  .order('created_at', { ascending: true })
  .limit(1)

if (esperaError) {
  setMensaje(esperaError.message)
  return
}

if (espera && espera.length > 0) {
  const { error: aceptarError } = await supabase
    .from('solicitudes_partido')
    .update({ estado: 'aceptado' })
    .eq('id', espera[0].id)

  if (aceptarError) {
    setMensaje(aceptarError.message)
    return
  }

  setMensaje('Te diste de baja. Un jugador de la lista de espera ocupó tu lugar.')
} else {
  const jugadoresFaltanActual = solicitud.partidos?.jugadores_faltan || 0

  const { error: partidoError } = await supabase
    .from('partidos')
    .update({ jugadores_faltan: jugadoresFaltanActual + 1 })
    .eq('id', solicitud.partidos?.id)

  if (partidoError) {
    setMensaje(partidoError.message)
    return
  }

  setMensaje('Te diste de baja del partido')
}

    cargarSolicitudes()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-6">
        Mis Solicitudes
      </h1>

      {mensaje && (
        <p className="mb-4 text-yellow-400 font-bold">
          {mensaje}
        </p>
      )}

      {solicitudes.map((solicitud) => (
        <div
          key={solicitud.id}
          className="bg-black/40 border border-green-900 rounded-xl p-6 mb-4"
        >
          <h2 className="text-2xl font-bold">
            ⚽ Fútbol {solicitud.partidos?.tipo_futbol}
          </h2>

          <p>📍 {solicitud.partidos?.zona}</p>
          <p>📅 {solicitud.partidos?.fecha}</p>
          <p>⏰ {solicitud.partidos?.hora}</p>

          <p className="mt-3">
            Estado:{' '}
            <strong>
              {solicitud.estado === 'aceptado' && '✅ Aceptado'}
              {solicitud.estado === 'pendiente' && '⏳ Pendiente'}
              {solicitud.estado === 'rechazado' && '❌ Rechazado'}
              {solicitud.estado === 'baja' && '🚪 Te diste de baja'}
              {solicitud.estado === 'lista_espera' && '🟡 Lista de espera'}
            </strong>
          </p>

          {solicitud.estado === 'aceptado' && (
  <div className="flex gap-3 mt-4">
    <Link
      href={`/chat/${solicitud.partidos?.id}`}
      className="bg-green-600 px-4 py-2 rounded-lg font-bold"
    >
      💬 Ir al chat
    </Link>

    <button
      onClick={() => darseDeBaja(solicitud)}
      className="bg-red-600 px-4 py-2 rounded-lg font-bold"
    >
      Darme de baja
    </button>
  </div>
)}

          {solicitud.estado === 'aceptado' && (
            <div className="mt-4 border border-green-700 rounded-lg p-3">
              <p className="font-bold text-green-400 mb-2">
                👥 Jugadores confirmados
              </p>

              {solicitud.partidos?.solicitudes_partido
  ?.filter((s) => s.estado === 'aceptado')
  .map((s) => (
    <Link
      key={s.id}
      href={`/jugador/${s.profiles?.id}`}
      className="flex items-center gap-3 bg-black/30 border border-green-900 rounded-lg p-3 mb-2"
    >
      <img
        src={s.profiles?.avatar_url || 'https://via.placeholder.com/40'}
        alt="Jugador"
        className="w-10 h-10 rounded-full object-cover border border-green-500"
      />

      <div>
        <p className="text-green-400 font-bold">
          {s.profiles?.nombre}
        </p>

        <p className="text-sm text-yellow-400">
  ⭐ {reputaciones[s.profiles?.id] || 'Sin valoraciones'}
</p>

<p className="text-sm text-zinc-300">
  {s.profiles?.posicion} • {s.profiles?.nivel}
</p>
      </div>
    </Link>
  ))}
            </div>
          )}

          {solicitud.estado === 'aceptado' && solicitud.partidos?.ubicacion && (
            <div className="mt-4 border border-green-700 rounded-lg p-3">
              <p className="font-bold text-green-400">
                📍 Ubicación de la cancha
              </p>

              <p>{solicitud.partidos.ubicacion}</p>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(solicitud.partidos.ubicacion)}`}
                target="_blank"
                className="inline-block mt-3 bg-green-600 px-4 py-2 rounded-lg font-bold"
              >
                Abrir en Maps
              </a>
            </div>
          )}
        </div>
      ))}
    </main>
  )
}