'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { tieneValoracionesPendientes } from '@/lib/tieneValoracionesPendientes'
import Link from 'next/link'
import Toast from '@/components/Toast'

export default function Partidos() {
  const [partidos, setPartidos] = useState([])
  const [toast, setToast] = useState({
    visible: false,
    mensaje: '',
    tipo: 'success',
  })
  const [perfiles, setPerfiles] = useState({})
  const [reputaciones, setReputaciones] = useState({})

  function mostrarToast(mensaje, tipo = 'success') {
    setToast({
      visible: true,
      mensaje,
      tipo,
    })
  }

  useEffect(() => {
    async function cargarPartidos() {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .order('fecha', { ascending: true })

      if (error) {
        mostrarToast(error.message, 'error')
        return
      }

      setPartidos(data || [])

      if (!data || data.length === 0) return

      const ids = [...new Set(data.map((partido) => partido.creador_id))]

      const { data: perfilesData } = await supabase
        .from('profiles')
        .select('id, nombre, avatar_url')
        .in('id', ids)

      const perfilesObj = {}

      perfilesData?.forEach((perfil) => {
        perfilesObj[perfil.id] = perfil
      })

      setPerfiles(perfilesObj)

      const { data: valoracionesData } = await supabase
        .from('valoraciones')
        .select('evaluado_id, puntualidad, actitud, nivel_real')
        .in('evaluado_id', ids)

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
    }

    cargarPartidos()
  }, [])

  async function solicitarUnirse(partido) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      mostrarToast('Debes iniciar sesión', 'error')
      return
    }

    const pendientes = await tieneValoracionesPendientes(user.id)

    if (pendientes) {
      mostrarToast(
        'Tenés valoraciones pendientes. Completalas antes de sumarte a un partido.',
        'error'
      )
      return
    }

    const { data: solicitudExistente, error: errorConsulta } = await supabase
      .from('solicitudes_partido')
      .select('id, estado')
      .eq('partido_id', partido.id)
      .eq('jugador_id', user.id)
      .maybeSingle()

    if (errorConsulta) {
      mostrarToast(errorConsulta.message, 'error')
      return
    }

    if (solicitudExistente) {
      if (solicitudExistente.estado === 'pendiente') {
        mostrarToast('Ya enviaste una solicitud para este partido', 'error')
      } else if (solicitudExistente.estado === 'aceptado') {
        mostrarToast('Ya estás confirmado en este partido', 'error')
      } else if (solicitudExistente.estado === 'rechazado') {
        mostrarToast('Tu solicitud para este partido fue rechazada', 'error')
      } else if (solicitudExistente.estado === 'lista_espera') {
        mostrarToast('Ya estás en lista de espera para este partido', 'error')
      }

      return
    }

    const { error } = await supabase.from('solicitudes_partido').insert({
      partido_id: partido.id,
      jugador_id: user.id,
      estado: partido.jugadores_faltan === 0 ? 'lista_espera' : 'pendiente',
    })

    if (error) {
      mostrarToast(error.message, 'error')
      return
    }

    mostrarToast(
      partido.jugadores_faltan === 0
        ? 'Te sumaste a la lista de espera'
        : 'Solicitud enviada'
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-6 md:p-8">
      <Toast
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-6">
          Partidos disponibles
        </h1>

        {partidos.length === 0 ? (
          <div className="bg-black/40 border border-green-900 rounded-xl p-5 text-center text-zinc-300">
            Todavía no hay partidos publicados.
          </div>
        ) : (
          partidos.map((partido) => (
            <div
              key={partido.id}
              className="bg-black/40 border border-green-900 rounded-xl p-4 md:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  ⚽ Fútbol {partido.tipo_futbol}
                </h2>

                <Link
                  href={`/jugador/${partido.creador_id}`}
                  className="flex items-center gap-3 bg-black/30 rounded-lg p-3 md:bg-transparent md:p-0"
                >
                  <img
                    src={
                      perfiles[partido.creador_id]?.avatar_url ||
                      'https://via.placeholder.com/40'
                    }
                    alt="Organizador"
                    className="w-10 h-10 rounded-full object-cover border border-green-500 shrink-0"
                  />

                  <div className="min-w-0 md:text-right">
                    <p className="text-sm text-green-400 font-semibold truncate">
                      {perfiles[partido.creador_id]?.nombre || 'Organizador'}
                    </p>

                    <p className="text-xs text-yellow-400">
                      ⭐ {reputaciones[partido.creador_id] || 'Sin valoraciones'}
                    </p>

                    <p className="text-xs text-zinc-400">Ver perfil</p>
                  </div>
                </Link>
              </div>

              <div className="space-y-1 text-sm md:text-base text-zinc-200">
                <p>📍 {partido.zona}</p>
                <p>📅 {partido.fecha}</p>
                <p>⏰ {partido.hora}</p>
                <p>👥 Faltan {partido.jugadores_faltan} jugadores</p>
                <p>🎯 Nivel: {partido.nivel}</p>
              </div>

              {partido.descripcion && (
                <p className="mt-3 text-sm md:text-base text-zinc-300 leading-relaxed">
                  {partido.descripcion}
                </p>
              )}

              <button
                onClick={() => solicitarUnirse(partido)}
                className={`mt-4 w-full md:w-auto px-4 py-3 md:py-2 rounded-lg font-bold ${
                  partido.jugadores_faltan === 0
                    ? 'bg-yellow-500 text-black'
                    : 'bg-green-600'
                }`}
              >
                {partido.jugadores_faltan === 0
                  ? '🟡 Sumarme a lista de espera'
                  : '⚽ Me sumo'}
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}