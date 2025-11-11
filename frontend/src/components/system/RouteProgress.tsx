"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'

// Simple route-change progress for Next.js App Router
// Starts when pathname/search changes and completes shortly after mount,
// with a tiny delay to avoid flicker on super fast transitions.
export function RouteProgress() {
  const pathname = usePathname()
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cancel any pending timers
    if (timer.current) clearTimeout(timer.current)

    // Start after a small delay to avoid flicker
    timer.current = setTimeout(() => {
      NProgress.start()
    }, 120)

    // Complete shortly after route change is reflected
    // This relies on component re-render; tweak as needed.
    const doneTimer = setTimeout(() => {
      NProgress.done()
    }, 600)

    return () => {
      if (timer.current) clearTimeout(timer.current)
      clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}

export default RouteProgress
