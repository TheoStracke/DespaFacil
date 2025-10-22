'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Send, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import documentoService from '@/services/documento.service'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SendCertificadoDialog } from '@/components/admin/SendCertificadoDialog'

export default function EnviarCertificadoPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast({
        type: 'error',
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
      })
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    setUser(userData)
    setLoading(false)
  }, [router])

  const handleSendCertificado = async (file: File, search: string) => {
    try {
      setActionLoading(true)
      
      await documentoService.sendCertificado(file, search)

      toast({
        type: 'success',
        title: 'Certificado enviado!',
        description: 'O despachante foi notificado por e-mail',
      })

      setSendDialogOpen(false)
    } catch (error: any) {
      console.error('Erro ao enviar certificado:', error)
      toast({
        type: 'error',
        title: 'Erro ao enviar certificado',
        description: error.response?.data?.message || 'Tente novamente',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user} isDespachante={false}>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} isDespachante={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Enviar Certificado</h1>
              <p className="text-sm text-slate-600">Envie certificados para os motoristas</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Envio de Certificados
            </CardTitle>
            <CardDescription>
              Selecione um arquivo PDF e informe o motorista destinatário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#010E9B] to-[#FF8601] flex items-center justify-center">
                <Send className="h-10 w-10 text-white" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Enviar Novo Certificado</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Clique no botão abaixo para selecionar o certificado e o motorista destinatário.
                  O despachante responsável será notificado por e-mail.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setSendDialogOpen(true)}
                className="mt-4"
              >
                <Send className="h-5 w-5 mr-2" />
                Enviar Certificado
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 mt-8">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                  📄 Formato Aceito
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Apenas arquivos PDF com tamanho máximo de 10MB
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2">
                  ✉️ Notificação Automática
                </h4>
                <p className="text-xs text-green-700 dark:text-green-300">
                  O despachante receberá um e-mail com o link para download
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog */}
      <SendCertificadoDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onSend={handleSendCertificado}
        loading={actionLoading}
      />
    </DashboardLayout>
  )
}
