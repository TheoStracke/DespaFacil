'use client'

import { useState, ChangeEvent } from 'react'
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import documentoService from '@/services/documento.service'
import type { Motorista, DocumentoTipo } from '@/types'

interface DocumentoUploadProps {
  motorista: Motorista
  onSuccess: () => void
}

export function DocumentoUpload({ motorista, onSuccess }: DocumentoUploadProps) {
  const { toast } = useToast()
  const [uploadedDocs, setUploadedDocs] = useState<Record<DocumentoTipo, boolean>>({
    CNH: false,
    COMPROVANTE_PAGAMENTO: false,
    DOCUMENTO1: false,
    DOCUMENTO2: false,
  });

  const [selectedFiles, setSelectedFiles] = useState<Record<DocumentoTipo, File | null>>({
    CNH: null,
    COMPROVANTE_PAGAMENTO: null,
    DOCUMENTO1: null,
    DOCUMENTO2: null,
  });

  const [loading, setLoading] = useState<Record<DocumentoTipo, boolean>>({
    CNH: false,
    COMPROVANTE_PAGAMENTO: false,
    DOCUMENTO1: false,
    DOCUMENTO2: false,
  });

  const handleFileChange = (tipo: DocumentoTipo, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    console.log('📂 Arquivo selecionado:', { tipo, file: file?.name, size: file?.size, type: file?.type });
    
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Tipo de arquivo inválido:', file.type);
      toast({
        type: 'error',
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, JPG e PNG são permitidos',
      })
      return
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande:', file.size);
      toast({
        type: 'error',
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 10MB',
      })
      return
    }

    console.log('✅ Arquivo válido, salvando no estado');
    setSelectedFiles(prev => ({ ...prev, [tipo]: file }))
  }

  const handleUpload = async (tipo: DocumentoTipo) => {
    console.log('🚀 handleUpload chamado:', { tipo, motoristaId: motorista.id });
    
    const file = selectedFiles[tipo]
    
    console.log('📁 Arquivo selecionado:', file ? file.name : 'NENHUM');
    
    if (!file) {
      toast({
        type: 'error',
        title: 'Nenhum arquivo selecionado',
        description: 'Selecione um arquivo para enviar',
      })
      return
    }

    setLoading(prev => ({ ...prev, [tipo]: true }))

    try {
      console.log('⏳ Enviando para documentoService.upload...');
      await documentoService.upload(motorista.id, tipo, file)

      toast({
        type: 'success',
        title: 'Documento enviado!',
        description: `${tipo} foi enviado com sucesso`,
      })

      // Limpar arquivo selecionado
      setSelectedFiles(prev => ({ ...prev, [tipo]: null }))
      
      // Resetar input
      const input = document.getElementById(`file-${tipo}`) as HTMLInputElement
      if (input) input.value = ''

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error)
      toast({
        type: 'error',
        title: 'Erro ao enviar',
        description: error.response?.data?.message || 'Tente novamente',
      })
    } finally {
      setLoading(prev => ({ ...prev, [tipo]: false }))
    }
  }

  const getDocumentoStatus = (tipo: DocumentoTipo) => {
    // Buscar o documento do motorista pelo tipo
    const doc = motorista.documentos?.find(d => d.tipo === tipo)
    return doc?.status || null
  }

  const renderUploadCard = (tipo: DocumentoTipo, label: string) => {
    const file = selectedFiles[tipo]
    const isLoading = loading[tipo]
    const status = getDocumentoStatus(tipo)

    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{label}</h3>
            {status && <StatusBadge status={status} />}
          </div>

          {/* Status info */}
          {status && (
            <div className={`p-3 rounded-lg border-2 ${
              status === 'APROVADO' 
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                : status === 'NEGADO'
                ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-2">
                {status === 'APROVADO' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    status === 'NEGADO' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    status === 'APROVADO' 
                      ? 'text-green-700 dark:text-green-300' 
                      : status === 'NEGADO'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {status === 'APROVADO' && 'Documento aprovado'}
                    {status === 'NEGADO' && 'Documento negado'}
                    {status === 'PENDENTE' && 'Aguardando aprovação'}
                  </p>
                  {status === 'PENDENTE' && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      O documento está em análise pelo administrador
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload area */}
          <div className="space-y-2">
            <label htmlFor={`file-${tipo}`} className="text-sm font-medium">
              {status ? 'Substituir arquivo' : 'Selecionar arquivo'}
            </label>
            <input
              id={`file-${tipo}`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(tipo, e)}
              disabled={isLoading}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {file && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                <File className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Upload button */}
          <Button
            onClick={() => handleUpload(tipo)}
            disabled={!file || isLoading}
            loading={isLoading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Enviando...' : status ? 'Atualizar Documento' : 'Enviar Documento'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="CNH" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
          <TabsTrigger value="CNH" className="text-xs sm:text-sm px-2 py-2">
            CNH
          </TabsTrigger>
          <TabsTrigger value="COMPROVANTE_PAGAMENTO" className="text-xs sm:text-sm px-2 py-2">
            Comprovante
          </TabsTrigger>
          <TabsTrigger value="DOCUMENTO1" className="text-xs sm:text-sm px-2 py-2">
            Lista de Presença
          </TabsTrigger>
          <TabsTrigger value="DOCUMENTO2" className="text-xs sm:text-sm px-2 py-2">
            Tabela de Dados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="CNH">
          {renderUploadCard('CNH', 'CNH - Carteira Nacional de Habilitação')}
        </TabsContent>

        <TabsContent value="COMPROVANTE_PAGAMENTO">
          {renderUploadCard('COMPROVANTE_PAGAMENTO', 'Comprovante de Pagamento')}
        </TabsContent>

        <TabsContent value="DOCUMENTO1">
          {renderUploadCard('DOCUMENTO1', 'Lista de Presença')}
        </TabsContent>

        <TabsContent value="DOCUMENTO2">
          {renderUploadCard('DOCUMENTO2', 'Tabela de Dados')}
        </TabsContent>
      </Tabs>
    </div>
  )
}
