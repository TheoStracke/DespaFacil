'use client'

import { useState } from 'react'
import { Headset, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppSupport() {
  const [isOpen, setIsOpen] = useState(false)

  const handleStartChat = () => {
    window.open('https://wa.me/5548988614963', '_blank')
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
                <p className="text-sm text-muted-foreground">Estamos aqui para ajudar!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm mb-4 text-muted-foreground">
              Clique no botão abaixo para iniciar uma conversa no WhatsApp com nossa equipe de suporte.
            </p>
            <button
              onClick={handleStartChat}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Headset className="h-5 w-5" />
              Iniciar Atendimento
            </button>
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
