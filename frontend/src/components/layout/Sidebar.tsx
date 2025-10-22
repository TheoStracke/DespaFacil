'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Shield,
  User,
  UserPlus,
  Send,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import authService from '@/services/auth.service'
import { useToast } from '@/components/ui/toast'
import { useNotifications } from '@/hooks/useNotifications'

interface SidebarProps {
  user: any
  isDespachante: boolean
}

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
  show: boolean
  badge?: number
}

export function Sidebar({ user, isDespachante }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  // Buscar notificações
  const { documentosPendentes, solicitacoesPendentes } = useNotifications(!isDespachante)

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      show: true,
    },
    {
      icon: Shield,
      label: 'Painel Admin',
      href: '/admin',
      show: !isDespachante,
      badge: documentosPendentes,
    },
    {
      icon: UserPlus,
      label: 'Solicitações',
      href: '/admin/solicitacoes',
      show: !isDespachante,
      badge: solicitacoesPendentes,
    },
    {
      icon: Send,
      label: 'Enviar Certificado',
      href: '/admin/enviar-certificado',
      show: !isDespachante,
    },
  ]

  const handleLogout = () => {
    authService.logout()
    toast({
      type: 'success',
      title: 'Logout realizado',
      description: 'Até logo!',
    })
    router.push('/login')
  }

  const NavItem = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    const showBadge = item.badge && item.badge > 0

    return (
      <motion.button
        onClick={() => {
          router.push(item.href)
          setIsMobileOpen(false)
        }}
        className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-lg
          transition-colors relative group
          ${isActive 
            ? 'bg-[#010E9B] text-white' 
            : 'text-gray-700 hover:bg-[#F4F0E5]'
          }
        `}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex-shrink-0">
          <Icon className="w-5 h-5" />
          {showBadge && !isExpanded && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8601] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {item.badge! > 9 ? '9+' : item.badge}
            </motion.span>
          )}
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap overflow-hidden flex-1 text-left"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {showBadge && isExpanded && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="ml-auto px-2 py-0.5 bg-[#FF8601] text-white text-xs font-bold rounded-full flex-shrink-0"
          >
            {item.badge! > 99 ? '99+' : item.badge}
          </motion.span>
        )}

        {/* Tooltip on hover (desktop only) */}
        {!isExpanded && (
          <div className="
            absolute left-full ml-2 px-2 py-1 bg-[#010E9B] text-white text-sm
            rounded opacity-0 pointer-events-none group-hover:opacity-100
            transition-opacity whitespace-nowrap z-50 hidden lg:block
          ">
            {item.label}
            {showBadge && (
              <span className="ml-2 px-1.5 py-0.5 bg-[#FF8601] text-white text-xs font-bold rounded">
                {item.badge! > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded ? 240 : 72,
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200
          flex flex-col z-40 transition-all duration-200
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <motion.div
            className="flex items-center gap-2"
            layout
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#010E9B] to-[#FF8601] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              DF
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-gray-900 whitespace-nowrap overflow-hidden"
                >
                  DespaFacil
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems
            .filter(item => item.show)
            .map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* User Info */}
          <div
            onClick={() => router.push('/profile')}
            className={`
            flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
            bg-[#F4F0E5] relative group hover:ring-1 hover:ring-[#010E9B]/30
          `}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#010E9B] to-[#FF8601] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {isDespachante ? 'Despachante' : 'Admin'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tooltip for user (desktop only) */}
            {!isExpanded && (
              <div className="
                absolute left-full ml-2 px-2 py-1 bg-[#010E9B] text-white text-sm
                rounded opacity-0 pointer-events-none group-hover:opacity-100
                transition-opacity whitespace-nowrap z-50 hidden lg:block
              ">
                Editar perfil
              </div>
            )}
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            className="
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-red-600 hover:bg-red-50 transition-colors
              relative group
            "
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sair
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip (desktop only) */}
            {!isExpanded && (
              <div className="
                absolute left-full ml-2 px-2 py-1 bg-[#010E9B] text-white text-sm
                rounded opacity-0 pointer-events-none group-hover:opacity-100
                transition-opacity whitespace-nowrap z-50 hidden lg:block
              ">
                Sair
              </div>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}
