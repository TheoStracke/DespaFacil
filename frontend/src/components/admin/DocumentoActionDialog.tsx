'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Documento } from '@/types'

interface DocumentoActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documento: Documento | null
  action: 'APROVAR' | 'NEGAR' | null
  onConfirm: (documentoId: string, status: string, motivo?: string) => Promise<void>
  loading: boolean
}

export function DocumentoActionDialog({
  open,
  onOpenChange,
  documento,
  action,
  onConfirm,
  loading,
}: DocumentoActionDialogProps) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!documento || !action) return

    // Validar motivo se for negação
    if (action === 'NEGAR' && !motivo.trim()) {
      setError('Motivo é obrigatório para negar um documento')
      return
    }

    const status = action === 'APROVAR' ? 'APROVADO' : 'NEGADO'
    await onConfirm(documento.id, status, motivo.trim() || undefined)
    
    // Resetar estado
    setMotivo('')
    setError('')
  }

  const handleClose = () => {
    setMotivo('')
    setError('')
    onOpenChange(false)
  }

  if (!documento || !action) return null

  const isApproval = action === 'APROVAR'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Aprovar Documento
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Negar Documento
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApproval
              ? 'Tem certeza que deseja aprovar este documento?'
              : 'Informe o motivo da negação do documento'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do documento */}
          <div className="p-4 rounded-lg bg-muted space-y-1">
            <p className="text-sm">
              <strong>Tipo:</strong> {documento.tipo}
            </p>
            <p className="text-sm">
              <strong>Arquivo:</strong> {documento.originalName}
            </p>
            <p className="text-sm text-muted-foreground">
              Enviado em {new Date(documento.uploadedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Campo de motivo (apenas para negação) */}
          {!isApproval && (
            <Textarea
              label="Motivo da Negação"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                setError('')
              }}
              placeholder="Ex: Documento ilegível, data vencida, informações incorretas..."
              error={error}
              required
              rows={4}
              disabled={loading}
              autoFocus
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={isApproval ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={loading}
            loading={loading}
          >
            {isApproval ? 'Aprovar' : 'Negar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
