import Link from 'next/link'

export default function Legal() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-green-400 mb-6">
          Información Legal
        </h1>

        <div className="space-y-4">
          <Link href="/terminos" className="block p-4 rounded-xl border border-green-900 hover:bg-green-950">
            📄 Términos y Condiciones
          </Link>

          <Link href="/privacidad" className="block p-4 rounded-xl border border-green-900 hover:bg-green-950">
            🔒 Política de Privacidad
          </Link>
        </div>
      </div>
    </main>
  )
}