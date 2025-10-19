'use client'

import { useRouter } from 'next/navigation'

type Props = {
  className?: string
  children?: React.ReactNode
}

export default function BackButton({ className, children }: Props) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className={className ?? 'text-sm text-blue-600 hover:text-blue-800 underline'}
      aria-label="Voltar"
      type="button"
    >
      {children ?? '← Voltar'}
    </button>
  )
}
