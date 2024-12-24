'use client'

import { useEffect } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Précharge le dégradé de fond
    document.body.style.opacity = '1'
  }, [])

  return <>{children}</>
}
