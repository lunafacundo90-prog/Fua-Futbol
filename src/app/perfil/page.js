'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Perfil() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [valoraciones, setValoraciones] = useState([])
  const [mensaje, setMensaje] = useState('Cargando perfil...')
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    async function cargarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        setMensaje(error.message)
        return
      }

      const { data: valoracionesData, error: valoracionesError } = await supabase
        .from('valoraciones')
        .select('puntualidad, actitud, nivel_real, comentario')
        .eq('evaluado_id', user.id)

      if (valoracionesError) {
        console.log(valoracionesError.message)
      }

      setPerfil(data)
      setValoraciones(valoracionesData || [])
      setMensaje('')
    }

    cargarPerfil()
  }, [router])

  async function subirAvatar(e) {
    const archivo = e.target.files[0]

    if (!archivo) return

    setSubiendo(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMensaje('No hay usuario logueado')
      setSubiendo(false)
      return
    }

    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${user.id}-${Date.now()}.${extension}`

    const { error: errorSubida } = await supabase.storage
      .from('avatars')
      .upload(nombreArchivo, archivo)

    if (errorSubida) {
      setMensaje(errorSubida.message)
      setSubiendo(false)
      return
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(nombreArchivo)

    const avatarUrl = data.publicUrl

    const { error: errorPerfil } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    if (errorPerfil) {
      setMensaje(errorPerfil.message)
      setSubiendo(false)
      return
    }

    setPerfil({ ...perfil, avatar_url: avatarUrl })
    setMensaje('Foto actualizada correctamente')
    setSubiendo(false)
  }

  const promedio = (campo) => {
    if (valoraciones.length === 0) return 0

    const total = valoraciones.reduce((acc, item) => acc + (item[campo] || 0), 0)
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
    .filter((item) => item.comentario && item.comentario.trim() !== '')
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:p-10">
      <div className="max-w-xl mx-auto bg-black/40 border border-green-900 rounded-2xl p-5 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-green-400 mb-6 text-center md:text-left">
          Mi Perfil
        </h1>

        {mensaje && (
          <p className="text-center text-sm text-zinc-300 mb-4 leading-relaxed">
            {mensaje}
          </p>
        )}

        {perfil && (
          <div className="space-y-4 text-base md:text-lg">
            <div className="flex flex-col items-center mb-6">
              <img
                src={perfil.avatar_url || 'https://via.placeholder.com/150'}
                alt="Foto de perfil"
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-2 border-green-500 mb-4"
              />

              <label className="w-full md:w-auto text-center bg-green-600 hover:bg-green-500 px-4 py-3 md:py-2 rounded-lg font-bold cursor-pointer transition">
                {subiendo ? 'Subiendo...' : '📷 Cambiar foto'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={subirAvatar}
                  className="hidden"
                  disabled={subiendo}
                />
              </label>
            </div>

            <div className="bg-black/30 border border-green-900 rounded-xl p-4 space-y-2">
              <p><strong>Nombre:</strong> {perfil.nombre}</p>
              <p><strong>Edad:</strong> {perfil.edad}</p>
              <p><strong>Zona:</strong> {perfil.zona}</p>
              <p><strong>Posición:</strong> {perfil.posicion}</p>
              <p><strong>Nivel:</strong> {perfil.nivel}</p>
            </div>

            <div className="mt-8 border-t border-green-900 pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mb-4">
                ⭐ Reputación
              </h2>

              {valoraciones.length === 0 ? (
                <p className="text-zinc-400">
                  Todavía no tenés valoraciones.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-2xl md:text-3xl font-bold">
                    ⭐ {promedioGeneral()} / 5
                  </p>

                  <p className="text-sm md:text-base text-zinc-400">
                    Basado en {valoraciones.length} valoración/es recibida/s
                  </p>

                  <div className="mt-4 bg-black/30 border border-green-900 rounded-xl p-4 space-y-2 text-sm md:text-base">
                    <p>⏱️ <strong>Puntualidad:</strong> {promedio('puntualidad')} / 5</p>
                    <p>🤝 <strong>Actitud:</strong> {promedio('actitud')} / 5</p>
                    <p>🎯 <strong>Nivel real:</strong> {promedio('nivel_real')} / 5</p>
                  </div>

                  {comentarios.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg md:text-xl font-bold text-green-400 mb-3">
                        Últimos comentarios
                      </h3>

                      <div className="space-y-2">
                        {comentarios.map((item, index) => (
                          <p
                            key={index}
                            className="bg-black/40 border border-green-900 rounded-lg p-3 text-sm md:text-base text-zinc-300 leading-relaxed break-words"
                          >
                            “{item.comentario}”
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}