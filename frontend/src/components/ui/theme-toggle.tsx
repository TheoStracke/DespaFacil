'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150"
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-700" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      </TooltipContent>
    </Tooltip>
  )
}
