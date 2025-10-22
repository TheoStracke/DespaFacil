'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import authService from '@/services/auth.service'
import { useToast } from '@/components/ui/toast'

export default function ContatoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isDespachante, setIsDespachante] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    setUser(userData)
    setIsDespachante(userData?.role === 'DESPACHANTE')

    const checkBusinessHours = () => {
      const now = new Date()
      const day = now.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
      const hour = now.getHours()
      const minute = now.getMinutes()
      const currentTime = hour * 60 + minute // Minutos desde meia-noite

      // Verifica se é dia útil (segunda a sexta)
      const isWeekday = day >= 1 && day <= 5

      // Horários de funcionamento em minutos
      const morningStart = 8 * 60 + 15 // 08:15
      const morningEnd = 12 * 60 // 12:00
      const afternoonStart = 13 * 60 // 13:00
      const afternoonEnd = 18 * 60 // 18:00

      // Verifica se está dentro do horário
      const isMorningShift = currentTime >= morningStart && currentTime < morningEnd
      const isAfternoonShift = currentTime >= afternoonStart && currentTime < afternoonEnd

      setIsOpen(isWeekday && (isMorningShift || isAfternoonShift))
    }

    // Verifica imediatamente
    checkBusinessHours()

    // Atualiza a cada minuto
    const interval = setInterval(checkBusinessHours, 60000)

    return () => clearInterval(interval)
  }, [router])

  const contactInfo = [
    {
      icon: Building2,
      label: 'CNPJ',
      value: '43.403.910/0001-28',
      color: 'text-[#010E9B]',
    },
    {
      icon: Mail,
      label: 'E-mail',
      value: 'suporte@redevellum.com.br',
      color: 'text-[#FF8601]',
      link: 'mailto:suporte@redevellum.com.br',
    },
    {
      icon: Phone,
      label: 'Suporte Técnico (Sistema)',
      value: '48 99178-3993',
      color: 'text-green-600',
      link: 'https://wa.me/5548991783993',
      description: 'Dúvidas sobre erros, bugs ou funcionamento do sistema.'
    },
    {
      icon: Phone,
      label: 'Suporte Educacional (Processos)',
      value: '48 99607-3477',
      color: 'text-emerald-600',
      link: 'https://wa.me/5548996073477',
      description: 'Dúvidas sobre processos, preenchimento de dados, documentação etc.'
    },
    {
      icon: MapPin,
      label: 'Endereço',
      value: 'Rua Joaquim Carneiro, 120 - Sala 305\nCapoeiras - Florianópolis, SC - Brasil',
      color: 'text-blue-600',
    },
    {
      icon: Clock,
      label: 'Horário de Funcionamento',
      value: 'Segunda a Sexta\n08:15 - 12:00 | 13:00 - 18:00',
      color: 'text-purple-600',
    },
  ]

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} isDespachante={isDespachante}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#010E9B] to-[#FF8601] rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Entre em Contato
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Estamos aqui para ajudar você
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  const content = (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`
                        flex items-start gap-4 p-4 rounded-lg border border-gray-200
                        bg-white hover:shadow-md transition-all duration-200
                        ${info.link ? 'cursor-pointer hover:border-[#FF8601]' : ''}
                      `}
                    >
                      <div className={`p-3 rounded-full bg-gray-50 ${info.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {info.label}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {info.value}
                        </p>
                        {info.description && (
                          <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                        )}
                      </div>
                    </motion.div>
                  )

                  if (info.link) {
                    return (
                      <a
                        key={index}
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    )
                  }

                  return content
                })}

                {/* Indicador de status de atendimento */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`mt-8 p-6 rounded-lg border ${
                    isOpen
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}
                    ></span>
                    {isOpen ? 'Atendimento Disponível' : 'Fora do Horário de Atendimento'}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {isOpen
                      ? 'Nossa equipe está pronta para atender suas dúvidas e solicitações durante nosso horário comercial. Para urgências, utilize nosso WhatsApp.'
                      : 'Estamos fora do horário comercial. Deixe sua mensagem pelo WhatsApp ou e-mail que responderemos assim que possível.'}
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
