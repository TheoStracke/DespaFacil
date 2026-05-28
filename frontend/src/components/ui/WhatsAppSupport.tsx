'use client'

import { useState } from 'react'
import { Headset, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppSupport() {
  const [isOpen, setIsOpen] = useState(false)

  // Suporte técnico
  const handleTechSupport = () => {
    window.open('https://wa.me/5548988614963', '_blank')
    setIsOpen(false)
  }
  // Suporte educacional
  const handleEduSupport = () => {
    window.open('https://wa.me/5548996073477', '_blank')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-80 border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Suporte DespaFacil</h3>
                <p className="text-sm text-muted-foreground">Escolha o tipo de atendimento:</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleTechSupport}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Headset className="h-5 w-5" />
                Suporte Técnico (Sistema)
                <span className="ml-2 text-xs">48 99178-3993</span>
              </button>
              <button
                onClick={handleEduSupport}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Headset className="h-5 w-5" />
                Suporte Educacional (Processos)
                <span className="ml-2 text-xs">48 99607-3477</span>
              </button>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div><span className="font-semibold">Técnico:</span> dúvidas sobre erros, bugs ou funcionamento do sistema.</div>
              <div><span className="font-semibold">Educacional:</span> dúvidas sobre processos, preenchimento de dados, documentação etc.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-2xl transition-colors flex items-center justify-center"
        aria-label="Suporte via WhatsApp"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Headset className="h-6 w-6" />
        )}
      </motion.button>
    </div>
  )
}
