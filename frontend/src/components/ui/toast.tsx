'use client'

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

/**
 * ToastProvider - Provider de contexto para toasts
 * 
 * Deve envolver a aplicação para permitir toasts globais
 */
function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-remover após 5 segundos
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * useToast - Hook para usar toasts
 * 
 * @example
 * const { toast } = useToast()
 * toast({ type: "success", title: "Login realizado!", description: "Bem-vindo de volta" })
 */
function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return {
    toast: context.addToast,
    toasts: context.toasts,
    removeToast: context.removeToast,
  }
}

/**
 * ToastContainer - Container de toasts
 * 
 * Renderiza todos os toasts ativos no canto superior direito
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 sm:p-6 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * ToastItem - Item individual de toast
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const variants = {
    success: "border-green-500/50 bg-green-50 dark:bg-green-950/20",
    error: "border-red-500/50 bg-red-50 dark:bg-red-950/20",
    warning: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
    info: "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border-2 p-4 shadow-lg",
        variants[toast.type]
      )}
    >
      {/* Ícone */}
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-muted-foreground">{toast.description}</p>
        )}
      </div>

      {/* Botão fechar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </button>
    </motion.div>
  )
}

export { ToastProvider, useToast }
