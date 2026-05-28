'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import NotificationBell from '@/components/NotificationBell'

interface DashboardLayoutProps {
  children: ReactNode
  user: any
  isDespachante: boolean
}

export function DashboardLayout({ children, user, isDespachante }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} isDespachante={isDespachante} />
      
      {/* Header fixo com notificações */}
      <header className="lg:pl-[72px] fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
        <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-end">
          <NotificationBell />
        </div>
      </header>
      
      {/* Main Content com padding-top para compensar o header fixo */}
      <main className="lg:pl-[72px] pt-16 transition-all duration-200">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
