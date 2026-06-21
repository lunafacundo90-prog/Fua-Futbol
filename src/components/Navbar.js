'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const [cantidad, setCantidad] = useState(0)
  const [usuario, setUsuario] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    async function iniciarNotificaciones() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUsuario(null)
        return
      }

      setUsuario(user)

      async function cargarNotificaciones() {
        const { count, error } = await supabase
          .from('notificaciones')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .eq('leida', false)

        if (!error) {
          setCantidad(count || 0)
        }
      }

      cargarNotificaciones()

      const canal = supabase
        .channel(`notificaciones-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificaciones',
            filter: `usuario_id=eq.${user.id}`,
          },
          () => {
            cargarNotificaciones()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(canal)
      }
    }

    const limpiar = iniciarNotificaciones()

    return () => {
      limpiar.then((fn) => {
        if (fn) fn()
      })
    }
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const linksUsuario = (
    <>
      <Link href="/partidos">Partidos</Link>

      {usuario ? (
        <>
          <Link href="/mis-partidos">Mis partidos</Link>
          <Link href="/mis-solicitudes">Mis solicitudes</Link>

          <Link href="/notificaciones" className="flex items-center gap-2">
            <span>🔔 Notificaciones</span>

            {cantidad > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {cantidad}
              </span>
            )}
          </Link>

          <Link href="/perfil">Mi perfil</Link>

          <button onClick={cerrarSesion} className="text-red-400 font-bold text-left">
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link href="/login">Iniciar sesión</Link>
          <Link href="/registro">Registrarse</Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-black border-b border-green-900 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-bold text-green-400 text-xl">
          ⚽ FUA!
        </Link>

        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

        <div className="hidden md:flex gap-6 items-center">
          {linksUsuario}
        </div>
      </div>

      {menuAbierto && (
        <div className="md:hidden flex flex-col gap-4 mt-4">
          {linksUsuario}
        </div>
      )}
    </nav>
  )
} 