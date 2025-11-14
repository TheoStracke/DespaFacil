'use client'

import { useState, ChangeEvent, useEffect } from 'react'
import { Upload, File, CheckCircle, AlertCircle, Info, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/ui/badge'
import { DocumentViewer } from '@/components/ui/document-viewer'
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

  // Estado para visualizador de documentos
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{
    url: string
    name: string
    type: string
    id: string
  } | null>(null)

  // Limpar blob URL quando o visualizador fecha
  useEffect(() => {
    if (!viewerOpen && viewingDocument?.url) {
      window.URL.revokeObjectURL(viewingDocument.url)
      setViewingDocument(null)
    }
  }, [viewerOpen])

  const handleFileChange = (tipo: DocumentoTipo, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    console.log('📂 Arquivo selecionado:', { tipo, file: file?.name, size: file?.size, type: file?.type });
    
    if (!file) return

    // Validar tipo de arquivo - inclui planilhas
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
      'text/plain', // Alguns navegadores retornam text/plain para CSV
      // Google Sheets
      'application/vnd.google-apps.spreadsheet',
      // ODS (OpenOffice/LibreOffice)
      'application/vnd.oasis.opendocument.spreadsheet',
      // Word
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    // Extensões permitidas (fallback se MIME type não for reconhecido)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.xls', '.xlsx', '.csv', '.ods', '.doc', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    
    if (!isValidType) {
      console.log('❌ Tipo de arquivo inválido:', file.type, 'Extensão:', fileExtension);
      toast({
        type: 'error',
        title: 'Tipo de arquivo inválido',
        description: 'Apenas PDF, imagens, planilhas (XLS, XLSX, CSV, ODS) e documentos Word são permitidos',
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

  const getDocumento = (tipo: DocumentoTipo) => {
    return motorista.documentos?.find(d => d.tipo === tipo)
  }

  const handleViewDocument = async (documento: any) => {
    try {
      console.log('🔍 Documento completo recebido:', JSON.stringify(documento, null, 2))
      console.log('🔍 Iniciando visualização de documento:', documento.id, documento.originalName)
      
      // Validar dados do documento - usar filename como fallback
      const nomeDocumento = documento.originalName || documento.filename
      if (!nomeDocumento) {
        console.error('❌ Nem originalName nem filename disponíveis. Documento:', documento)
        throw new Error('Nome do documento não encontrado')
      }
      
      // Limpar URL anterior se existir
      if (viewingDocument?.url) {
        console.log('🧹 Limpando blob URL anterior')
        window.URL.revokeObjectURL(viewingDocument.url)
      }

      console.log('📥 Buscando documento do servidor...')
      const url = await documentoService.getViewUrl(documento.id)
      console.log('✅ Blob URL criado:', url.substring(0, 50) + '...')
      
      // Determinar o tipo MIME do documento
      const ext = nomeDocumento.substring(nomeDocumento.lastIndexOf('.')).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls': 'application/vnd.ms-excel',
        '.csv': 'text/csv',
        '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
      
      const mimeType = mimeTypes[ext] || 'application/octet-stream'
      console.log('📄 Tipo de documento:', ext, '->', mimeType)
      
      setViewingDocument({
        url,
        name: nomeDocumento,
        type: mimeType,
        id: documento.id,
      })
      setViewerOpen(true)
      console.log('👁️ Visualizador aberto')
    } catch (error: any) {
      console.error('❌ Erro ao visualizar documento:', error)
      const errorMessage = error.message || error.response?.data?.error || 'Não foi possível visualizar o documento'
      toast({
        type: 'error',
        title: 'Erro ao carregar documento',
        description: errorMessage
      })
    }
  }

  const handleDownloadDocument = async (documento: any) => {
    try {
      const blob = await documentoService.download(documento.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documento.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast({
        type: 'success',
        title: 'Download concluído',
        description: 'Documento baixado com sucesso'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o documento'
      })
    }
  }

  const handleDownloadFromViewer = async () => {
    if (!viewingDocument) return
    
    try {
      const blob = await documentoService.download(viewingDocument.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = viewingDocument.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast({
        type: 'error',
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o documento'
      })
    }
  }

  const renderUploadCard = (tipo: DocumentoTipo, label: string) => {
    const file = selectedFiles[tipo]
    const isLoading = loading[tipo]
    const status = getDocumentoStatus(tipo)
    const documento = getDocumento(tipo)

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
                <div className="flex-1">
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
                  {documento && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(documento)}
                        className="h-8"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(documento)}
                        className="h-8"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Baixar
                      </Button>
                    </div>
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
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.csv,.ods,.doc,.docx"
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
            Formatos aceitos: PDF, Imagens (JPG, PNG), Planilhas (XLS, XLSX, CSV, ODS), Word (DOC, DOCX) - máx. 10MB
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

      {/* Visualizador de Documentos */}
      {viewingDocument && (
        <DocumentViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          documentUrl={viewingDocument.url}
          documentName={viewingDocument.name}
          documentType={viewingDocument.type}
          onDownload={handleDownloadFromViewer}
        />
      )}
    </div>
  )
}
