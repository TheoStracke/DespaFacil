'use client'

import { useState, ChangeEvent } from 'react'
import { Send, Upload, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SendCertificadoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: (file: File, search: string) => Promise<void>
  loading: boolean
}

export function SendCertificadoDialog({
  open,
  onOpenChange,
  onSend,
  loading,
}: SendCertificadoDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({ file: '', search: '' })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    if (selectedFile) {
      // Validar tipo de arquivo
      if (selectedFile.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, file: 'Apenas arquivos PDF são permitidos' }))
        setFile(null)
        return
      }

      // Validar tamanho (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'Arquivo muito grande. Máximo 10MB' }))
        setFile(null)
        return
      }

      setFile(selectedFile)
      setErrors(prev => ({ ...prev, file: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors = { file: '', search: '' }
    let isValid = true

    if (!file) {
      newErrors.file = 'Selecione um arquivo PDF'
      isValid = false
    }

    if (!search.trim()) {
      newErrors.search = 'Informe nome ou CPF do motorista'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSend = async () => {
    if (!validate() || !file) return

    await onSend(file, search.trim())
    
    // Resetar estado
    setFile(null)
    setSearch('')
    setErrors({ file: '', search: '' })
  }

  const handleClose = () => {
    setFile(null)
    setSearch('')
    setErrors({ file: '', search: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Enviar Certificado
          </DialogTitle>
          <DialogDescription>
            Anexe o certificado e informe o motorista destinatário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload de arquivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Arquivo PDF <span className="text-destructive">*</span>
            </label>
            
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="cursor-pointer"
              />
              <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>

            {file && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}

            {errors.file && (
              <p className="text-sm text-destructive animate-in fade-in-50 duration-200">
                {errors.file}
              </p>
            )}
          </div>

          {/* Busca de motorista */}
          <Input
            label="Nome ou CPF do Motorista"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setErrors(prev => ({ ...prev, search: '' }))
            }}
            placeholder="João Silva ou 123.456.789-00"
            error={errors.search}
            required
            disabled={loading}
          />

          {/* Info */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <Search className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                O certificado será enviado por e-mail para o despachante responsável pelo motorista
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={loading} loading={loading}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
