'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { toast } from 'sonner'
import NProgress from 'nprogress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Shield,
  User,
  UserPlus,
  Send,
  LogOut,
  Menu,
  X,
  Phone,
  Code,
  KeyRound,
  FileText,
  Key,
  BarChart3,
  BarChart2,
  BarChart4,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import authService from '@/services/auth.service'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      show: true,
    },
    {
      icon: Shield,
      label: 'Administração',
      href: '/admin',
      show: !isDespachante,
    },
    {
      icon: UserPlus,
      label: 'Solicitações',
      href: '/admin/solicitacoes',
      show: !isDespachante,
    },
    {
      icon: FileText,
      label: 'Documentos',
      href: '/admin/enviar-certificado',
      show: !isDespachante,
    },
    {
      icon: Key,
      label: 'Código',
      href: '/admin/solicitar-codigo',
      show: !isDespachante,
    },
    {
      icon: Key,
      label: 'Códigos',
      href: '/despachante/codigos',
      show: isDespachante,
    },
    {
      icon: FileText,
      label: 'Certificados',
      href: '/despachante/certificados',
      show: isDespachante,
    },
    {
      icon: BarChart4,
      label: 'Relatórios',
      href: '/analise',
      show: true,
    },
    {
      icon: Phone,
      label: 'Contato',
      href: '/contato',
      show: true,
    },
  ]

  const handleLogout = () => {
    setNavigating(true)
    NProgress.start()
    authService.logout()
    toast.success('Logout realizado! Até logo!')
    router.push('/login')
    
    // Limpar após navegação
    setTimeout(() => {
      setNavigating(false)
      NProgress.done()
    }, 1000)
  }

  const NavItem = ({ item }: { item: MenuItem }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    const showBadge = item.badge && item.badge > 0

    const buttonContent = (
      <motion.button
        onClick={() => {
          // Iniciar loading imediatamente
          setNavigating(true)
          NProgress.start()
          
          // Navegação
          router.push(item.href)
          setIsMobileOpen(false)
          
          // Limpar loading após um tempo (fallback caso RouteProgress não pegue)
          setTimeout(() => {
            setNavigating(false)
          }, 1000)
        }}
        disabled={navigating}
        className={`
          w-full flex items-center gap-3 px-3 py-3 rounded-lg
          transition-colors duration-150 relative group min-h-[44px]
          ${isActive 
            ? 'bg-brand-blue dark:bg-brand-orange text-white' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          ${navigating ? 'opacity-50 cursor-wait' : ''}
        `}
        whileHover={{ x: navigating ? 0 : 2 }}
        whileTap={{ scale: navigating ? 1 : 0.98 }}
      >
        <div className="relative flex-shrink-0">
          <Icon className={`w-5 h-5 ${navigating ? 'animate-pulse' : ''}`} />
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
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center justify-between gap-2 min-w-0"
            >
              <span className={`text-left break-words leading-tight ${navigating ? 'animate-pulse' : ''}`}>
                {item.label}
              </span>
              {showBadge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 py-0.5 bg-[#FF8601] text-white text-xs font-bold rounded-full flex-shrink-0"
                >
                  {item.badge! > 99 ? '99+' : item.badge}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )

    // Se sidebar não expandida, mostrar tooltip
    if (!isExpanded) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="hidden lg:flex">
            <p>{item.label}</p>
            {showBadge && <span className="ml-2 text-[#FF8601]">({item.badge})</span>}
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonContent
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
          width: isExpanded ? 280 : 72,
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          flex flex-col z-40 transition-[width] duration-200
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 px-2 bg-white dark:bg-gray-900">
          <motion.div
            className="flex items-center justify-center w-full"
            layout
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="logo-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-12 flex items-center justify-center"
                >
                  <Image
                    src="/ui/logo.png"
                    alt="DespaFacil Logo"
                    width={180}
                    height={48}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="favicon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-10 h-10 flex items-center justify-center"
                >
                  <Image
                    src="/favicon.ico"
                    alt="DespaFacil"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </motion.div>
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

        {/* Theme Toggle */}
        <div className="px-4 pb-2 space-y-2">
          <div className={`flex gap-2 ${isExpanded ? 'justify-start pl-3' : 'justify-center'}`}>
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {/* User Info */}
          <div
            onClick={() => router.push('/profile')}
            className={`
            flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
            bg-gray-100 dark:bg-gray-800 relative group hover:bg-gray-200 dark:hover:bg-gray-700
            transition-colors duration-150
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
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
            disabled={navigating}
            className="
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
              transition-colors duration-150
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
