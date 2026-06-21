'use client'

import { useEffect } from 'react'

export default function Toast({
  mensaje,
  tipo = 'success',
  visible,
  onClose,
}) {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-white font-semibold ${
          tipo === 'error'
            ? 'bg-red-600'
            : 'bg-green-600'
        }`}
      >
        {mensaje}
      </div>
    </div>
  )
}