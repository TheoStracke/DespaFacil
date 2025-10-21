'use client'

import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { solicitar } from '@/services/parceiro.service'

interface SolicitarParceiraModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    name: string
    email: string
    cnpj: string
    telefone: string
    password: string
  }
}

export function SolicitarParceiraModal({ isOpen, onClose, formData }: SolicitarParceiraModalProps) {
  const { toast } = useToast()
  const [mensagem, setMensagem] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!mensagem.trim()) {
      toast({
        type: 'warning',
        title: 'Mensagem obrigatória',
        description: 'Por favor, escreva uma mensagem sobre sua empresa',
      })
      return
    }

    try {
      setLoading(true)
      
      const cleanCnpj = formData.cnpj.replace(/\D/g, '')
      
      const result = await solicitar({
        cnpj: cleanCnpj,
        empresa: formData.name, // Usamos o nome como empresa
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.password,
        nomeResponsavel: formData.name,
        mensagem,
      })

      if (result.ok) {
        toast({
          type: 'success',
          title: 'Solicitação enviada com sucesso!',
          description: 'Você receberá um email quando sua solicitação for aprovada. Para garantir que receba nossos emails, adicione despafacilrepo@gmail.com aos seus contatos.',
        })
        onClose()
      } else {
        const errorMessages: Record<string, string> = {
          'AGUARDE_24H': 'Você já enviou uma solicitação recentemente. Aguarde 24 horas.',
          'EMAIL_JA_CADASTRADO': 'Este email já está cadastrado no sistema.',
          'CNPJ_JA_CADASTRADO': 'Este CNPJ já possui cadastro no sistema.',
          'SENHA_MINIMO_8': 'A senha deve ter no mínimo 8 caracteres.',
        }
        const message = errorMessages[result.error || ''] || 'Não foi possível enviar a solicitação.'
        toast({
          type: 'error',
          title: 'Erro ao solicitar',
          description: message,
        })
      }
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao enviar solicitação',
        description: error.response?.data?.error || error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">CNPJ não aprovado</h2>
            <p className="mt-1 text-sm text-slate-600">
              Seu CNPJ ainda não é parceiro. Envie uma solicitação para ser aprovado.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dados preenchidos */}
        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Dados informados:</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p><strong>Nome/Empresa:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>CNPJ:</strong> {formData.cnpj}</p>
            <p><strong>Telefone:</strong> {formData.telefone}</p>
          </div>
        </div>

        {/* Mensagem */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Fale sobre sua empresa *
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Ex: Atuo no ramo de transportes há 5 anos, com frota própria de 10 veículos..."
            className="h-32 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={loading}
          />
        </div>

        {/* Info */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          <p>
            ℹ️ <strong>Importante:</strong> Após a aprovação, você poderá fazer login diretamente com o email e senha que cadastrou.
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </div>
    </div>
  )
}
