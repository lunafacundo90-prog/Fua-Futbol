import Link from 'next/link'

export default function Home() {
  return (
   <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white px-4 py-8 md:px-6 md:py-12">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-green-400 leading-tight">
            ⚽ La hora que esperaste toda la semana no puede suspenderse porque faltan uno o dos.
          </h1>

          <h2 className="text-2xl md:text-3xl font-light mb-8 text-zinc-200">
            Para eso estamos. Para eso nacimos.
          </h2>

          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-zinc-300 leading-relaxed">
            Conectamos jugadores de una misma zona para completar equipos,
            organizar partidos y mantener vivo el fútbol amateur.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link
              href="/registro"
              className="bg-white text-green-700 font-bold px-8 py-4 rounded-xl text-lg hover:scale-105 transition"
            >
              Registrarse
            </Link>

            <Link
              href="/login"
              className="border-2 border-white px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-green-700 transition"
            >
              Iniciar sesión
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-green-950/40 p-4 md:p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-3">⚽ Jugadores</h3>
              <p>Encontrá futboleros de tu zona para completar equipos.</p>
            </div>

            <div className="bg-green-950/40 p-4 md:p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-3">💬 Chat Privado</h3>
              <p>Contactate directamente con otros jugadores.</p>
            </div>

            <div className="bg-green-950/40 p-4 md:p-6 rounded-xl">
              <h3 className="font-bold text-xl mb-3">📍 Por Zonas</h3>
              <p>Conectate con personas cerca de donde jugás.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}