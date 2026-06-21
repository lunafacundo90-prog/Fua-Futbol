'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  const [cantidad, setCantidad] = useState(0)
  const [usuario, setUsuario] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    let canal = null

    async function cargarUsuarioYNotificaciones() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUsuario(user || null)

      if (!user) {
        setCantidad(0)
        return
      }

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

      await cargarNotificaciones()

      canal = supabase
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
    }

    cargarUsuarioYNotificaciones()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (canal) {
        supabase.removeChannel(canal)
        canal = null
      }

      cargarUsuarioYNotificaciones()
    })

    return () => {
      if (canal) {
        supabase.removeChannel(canal)
      }

      subscription.unsubscribe()
    }
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setUsuario(null)
    setCantidad(0)
    setMenuAbierto(false)
    window.location.href = '/login'
  }

  const linksUsuario = (
    <>
      <Link href="/partidos" onClick={() => setMenuAbierto(false)}>
        Partidos
      </Link>

      {usuario ? (
        <>
        <Link href="/crear-partido" onClick={() => setMenuAbierto(false)}>
  Crear partido
</Link>
          <Link href="/mis-partidos" onClick={() => setMenuAbierto(false)}>
            Mis partidos
          </Link>

          <Link href="/mis-solicitudes" onClick={() => setMenuAbierto(false)}>
            Mis solicitudes
          </Link>

          <Link
            href="/notificaciones"
            onClick={() => setMenuAbierto(false)}
            className="flex items-center gap-2"
          >
            <span>🔔 Notificaciones</span>

            {cantidad > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {cantidad}
              </span>
            )}
          </Link>

          <Link href="/perfil" onClick={() => setMenuAbierto(false)}>
            Mi perfil
          </Link>

          <button
            onClick={cerrarSesion}
            className="text-red-400 font-bold text-left"
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link href="/login" onClick={() => setMenuAbierto(false)}>
            Iniciar sesión
          </Link>

          <Link href="/registro" onClick={() => setMenuAbierto(false)}>
            Registrarse
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-black border-b border-green-900 px-4 md:px-6 py-4 text-white">
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