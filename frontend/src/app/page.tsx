'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Se já está autenticado, vai para dashboard
    if (authService.isAuthenticated()) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
