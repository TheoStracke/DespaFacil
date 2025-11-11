import * as React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ElementType
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb - Componente de navegação hierárquica
 * 
 * Mostra o caminho de navegação atual, permitindo que o usuário
 * volte facilmente para níveis anteriores da hierarquia.
 * 
 * @example
 * ```tsx
 * <Breadcrumb 
 *   items={[
 *     { label: 'Dashboard', href: '/dashboard', icon: Home },
 *     { label: 'Motoristas', href: '/dashboard/motoristas' },
 *     { label: 'João Silva' }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const Icon = item.icon

          return (
            <li key={index} className="flex items-center space-x-1">
              {/* Separador */}
              {index > 0 && (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}

              {/* Item do breadcrumb */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast && 'text-foreground font-semibold'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * BreadcrumbSkeleton - Skeleton loading para breadcrumb
 */
export function BreadcrumbSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      <div className="h-4 w-28 bg-muted animate-pulse rounded" />
    </div>
  )
}
