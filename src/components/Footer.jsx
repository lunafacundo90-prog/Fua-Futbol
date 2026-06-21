import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-green-900 text-zinc-400 px-6 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p>© 2026 FUA! - Falta Un Amigo</p>

        <div className="flex gap-4">
          <Link href="/legal" className="hover:text-green-400">
            Legal
          </Link>

          <Link href="/terminos" className="hover:text-green-400">
            Términos
          </Link>

          <Link href="/privacidad" className="hover:text-green-400">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  )
}