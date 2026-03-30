import { useState, useEffect } from 'react'

let toastTimer

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => setToast(null), 3000)
  }

  return { toast, showToast }
}

export default function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`toast ${toast.type}`}>
      {toast.message}
    </div>
  )
}
