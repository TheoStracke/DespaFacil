'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  user: any
  isDespachante: boolean
}

export function DashboardLayout({ children, user, isDespachante }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} isDespachante={isDespachante} />
      
      {/* Main Content */}
      <main className="lg:pl-[72px] transition-all duration-200">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
