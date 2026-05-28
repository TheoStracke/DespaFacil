'use client'

import { useState, ChangeEvent, useEffect, useRef, Fragment } from 'react'
import { Send, Upload, Search, User, AlertTriangle } from 'lucide-react'
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
import { FileDropzone } from '@/components/ui/file-dropzone'
import motoristaService from '@/services/motorista.service'
import documentoService from '@/services/documento.service'
import { Motorista } from '@/types'

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
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingMotoristas, setLoadingMotoristas] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null)
  const [existingCertCount, setExistingCertCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  // Buscar motoristas quando o usuário digita
  useEffect(() => {
    const fetchMotoristas = async () => {
      if (search.length >= 2) {
        setLoadingMotoristas(true)
        try {
          const response = await motoristaService.getAll({ search, limit: 10 })
          setMotoristas(response.motoristas || [])
          setShowSuggestions(true)
        } catch (error) {
          console.error('Erro ao buscar motoristas:', error)
          setMotoristas([])
        } finally {
          setLoadingMotoristas(false)
        }
      } else {
        setMotoristas([])
        setShowSuggestions(false)
      }
    }

    const debounce = setTimeout(() => {
      fetchMotoristas()
    }, 300)

    return () => clearTimeout(debounce)
  }, [search])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFileChange = (selectedFile: File) => {
    // Validar tipo de arquivo - permitir PDFs, imagens e planilhas
    const allowedTypes = [
      // PDFs
      'application/pdf',
      // Imagens
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Planilhas Excel
      'application/vnd.ms-excel',
      'application/msexcel',
      'application/x-msexcel',
      'application/x-ms-excel',
      'application/x-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/xlsx',
      // CSV
      'text/csv',
      'text/x-csv',
      'application/csv',
      'application/x-csv',
      'text/comma-separated-values',
      // Google Sheets
      'application/vnd.google-apps.spreadsheet',
      // ODS
      'application/vnd.oasis.opendocument.spreadsheet',
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrors(prev => ({ ...prev, file: 'Apenas PDFs, imagens e planilhas (XLS, XLSX, CSV) são permitidos' }))
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

  const handleClearFile = () => {
    setFile(null)
    setErrors(prev => ({ ...prev, file: '' }))
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

  const checkExistingCertificado = async () => {
    if (!validate() || !file) return

    try {
      // Buscar certificados para verificar se já existe
      const certificados = await documentoService.listCertificadosAdmin()
      const searchTerm = search.trim().toLowerCase()
      
      // Contar certificados para este motorista
      const count = certificados.filter((cert: any) => {
        const nome = cert.motorista?.nome?.toLowerCase() || ''
        const cpf = cert.motorista?.cpf?.replace(/\D/g, '') || ''
        const searchCPF = searchTerm.replace(/\D/g, '')
        
        return nome.includes(searchTerm) || cpf === searchCPF
      }).length

      if (count > 0) {
        setExistingCertCount(count)
        setShowConfirmDialog(true)
      } else {
        await handleSend()
      }
    } catch (error) {
      console.error('Erro ao verificar certificados:', error)
      // Se der erro na verificação, prossegue com o envio
      await handleSend()
    }
  }

  const handleConfirmSend = async () => {
    setShowConfirmDialog(false)
    await handleSend()
  }

  const handleSend = async () => {
    if (!validate() || !file) return

    await onSend(file, search.trim())
    
    // Resetar estado
    setFile(null)
    setSearch('')
    setErrors({ file: '', search: '' })
    setShowConfirmDialog(false)
    setExistingCertCount(0)
  }

  const handleClose = () => {
    setFile(null)
    setSearch('')
    setErrors({ file: '', search: '' })
    setMotoristas([])
    setShowSuggestions(false)
    setShowConfirmDialog(false)
    setExistingCertCount(0)
    onOpenChange(false)
  }

  const handleSelectMotorista = (motorista: Motorista) => {
    setSearch(`${motorista.nome} - ${motorista.cpf}`)
    setShowSuggestions(false)
    setErrors(prev => ({ ...prev, search: '' }))
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  return (
    <Fragment>
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
          {/* Upload de arquivo com Drag-and-Drop */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Arquivo do Certificado <span className="text-destructive">*</span>
            </label>
            
            <FileDropzone
              onFileSelect={handleFileChange}
              accept={{ 
                'application/pdf': ['.pdf'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'text/csv': ['.csv'],
                'image/*': ['.png', '.jpg', '.jpeg']
              }}
              maxSize={10 * 1024 * 1024}
              selectedFile={file}
              onClear={handleClearFile}
              disabled={loading}
            />

            {errors.file && (
              <p className="text-sm text-destructive animate-in fade-in-50 duration-200">
                {errors.file}
              </p>
            )}
          </div>

          {/* Busca de motorista */}
          <div className="space-y-2 relative" ref={searchRef}>
            <label className="text-sm font-medium leading-none">
              Nome ou CPF do Motorista <span className="text-destructive">*</span>
            </label>
            
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setErrors(prev => ({ ...prev, search: '' }))
                }}
                onFocus={() => {
                  if (motoristas.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                placeholder="Digite o nome ou CPF..."
                disabled={loading}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {errors.search && (
              <p className="text-sm text-destructive animate-in fade-in-50 duration-200">
                {errors.search}
              </p>
            )}

            {/* Lista de sugestões */}
            {showSuggestions && motoristas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {motoristas.map((motorista) => (
                  <button
                    key={motorista.id}
                    type="button"
                    onClick={() => handleSelectMotorista(motorista)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {motorista.nome}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        CPF: {formatCPF(motorista.cpf)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Mensagem de carregamento */}
            {loadingMotoristas && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Buscando motoristas...
              </p>
            )}

            {/* Mensagem quando não há resultados */}
            {showSuggestions && !loadingMotoristas && motoristas.length === 0 && search.length >= 2 && (
              <p className="text-sm text-muted-foreground">
                Nenhum motorista encontrado
              </p>
            )}
          </div>

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
          <Button onClick={checkExistingCertificado} disabled={loading} loading={loading}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Dialog de Confirmação */}
    {showConfirmDialog && (
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Certificado já enviado
            </DialogTitle>
            <DialogDescription>
              Este motorista já recebeu {existingCertCount} certificado{existingCertCount > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                ⚠️ Um certificado já foi enviado anteriormente para este motorista.
                Tem certeza que deseja enviar outro certificado?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSend}
              disabled={loading}
              loading={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Sim, estou ciente. Quero reenviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </Fragment>
  )
}
