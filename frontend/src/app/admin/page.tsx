'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserPlus,
  Download,
  Home,
  Shield,
  Activity,
  Eye,
  KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/ui/badge'
import { DocumentViewer } from '@/components/ui/document-viewer'
import { SkeletonDashboardStats } from '@/components/skeletons/SkeletonCard'
import { SkeletonTable } from '@/components/skeletons/SkeletonTable'
import authService from '@/services/auth.service'
import documentoService from '@/services/documento.service'
import { DocumentoActionDialog } from '@/components/admin/DocumentoActionDialog'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import type { Documento, DocumentoStatus } from '@/types'
import solicitacaoCodigoService from '@/services/solicitacaoCodigo.service'

export default function AdminPage() {
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DocumentoStatus | 'TODOS'>('TODOS')
  const [tipoFilter, setTipoFilter] = useState('TODOS')
  
  // Modais
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    documento: Documento | null
    action: 'APROVAR' | 'NEGAR' | null
  }>({
    open: false,
    documento: null,
    action: null,
  })
  const [actionLoading, setActionLoading] = useState(false)

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

  // Função para formatar o tipo do documento
  const formatTipoDocumento = (tipo: string): string => {
    const tiposMap: Record<string, string> = {
      'CNH': 'CNH',
      'COMPROVANTE_PAGAMENTO': 'Comprovante de Pagamento',
      'DOCUMENTO1': 'Lista de Presença',
      'DOCUMENTO2': 'Tabela de Dados'
    }
    return tiposMap[tipo] || tipo
  }

  // Verificar autenticação e carregar dados
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    if (!authService.isAdmin()) {
      toast.error('Acesso negado. Você não tem permissão para acessar esta página.')
      router.push('/dashboard')
      return
    }

    setUser(userData)
    loadDocumentos()
  }, [router])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...documentos]

    // Filtro de busca (motorista)
    if (searchTerm) {
      filtered = filtered.filter((doc) => {
        const motoristaNome = doc.motorista?.nome?.toLowerCase() || ''
        const motoristaCpf = doc.motorista?.cpf || ''
        const search = searchTerm.toLowerCase()
        return motoristaNome.includes(search) || motoristaCpf.includes(search)
      })
    }

    // Filtro de status
    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter((doc) => doc.status === statusFilter)
    }

    // Filtro de tipo
    if (tipoFilter !== 'TODOS') {
      filtered = filtered.filter((doc) => doc.tipo === tipoFilter)
    }

    setFilteredDocumentos(filtered)
  }, [documentos, searchTerm, statusFilter, tipoFilter])

  const loadDocumentos = async () => {
    try {
      setLoading(true)
      const response = await documentoService.getAllAdmin({})
      const docs = Array.isArray(response.documentos) ? response.documentos : []
      console.log('🟦 Documentos recebidos do backend:', docs)
      docs.forEach((doc: Documento, idx: number) => {
        console.log(`  [${idx}] id=${doc.id} tipo=${doc.tipo} status=${doc.status} originalName=${doc.originalName || 'AUSENTE'}`)
      })
      setDocumentos(docs)
      setFilteredDocumentos(docs)
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error)
      toast.error(error.response?.data?.message || 'Erro ao carregar documentos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAprovarNegar = (documento: Documento, action: 'APROVAR' | 'NEGAR') => {
    setActionDialog({
      open: true,
      documento,
      action,
    })
  }

  const handleViewDocument = async (documento: Documento) => {
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
      const errorMessage = error.message || error.response?.data?.error || 'Erro ao carregar documento para visualização'
      toast.error(errorMessage)
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
      toast.error('Erro ao baixar documento')
    }
  }

  const handleConfirmAction = async (documentoId: string, status: string, motivo?: string) => {
    try {
      setActionLoading(true)
      
      await documentoService.updateStatus(documentoId, status as DocumentoStatus, motivo)

      toast.success(
        status === 'APROVADO' ? 'Documento aprovado com sucesso!' : 'Documento negado'
      )

      // Atualizar lista
      await loadDocumentos()
      
      // Fechar modal
      setActionDialog({ open: false, documento: null, action: null })
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast.error(error.response?.data?.message || 'Erro ao atualizar status. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSolicitarCodigo = async (documento: Documento) => {
    try {
      // Apenas para DOCUMENTO2 (Tabela de Dados)
      if (documento.tipo !== 'DOCUMENTO2') {
        toast.error('A solicitação de código é apenas para Tabela de Dados')
        return
      }

      // Criar solicitação sem emailDestino (usa email do motorista)
      await solicitacaoCodigoService.create({
        motoristaId: documento.motoristaId,
        observacao: 'Email na tabela divergente. Va em "Códigos" e confirme o código enviado ao "Email destino" do motorista.',
      })

      toast.success('Solicitação de código registrada e Tabela de Dados negada com instruções.')
      await loadDocumentos()
    } catch (error: any) {
      console.error('Erro ao solicitar código:', error)
      toast.error(error.response?.data?.error || 'Erro ao solicitar código')
    }
  }

  return (
    <DashboardLayout user={user} isDespachante={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: Home },
              { label: 'Painel Admin', icon: Shield }
            ]}
          />

          {/* Ações principais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestão de Documentos</CardTitle>
                  <CardDescription>
                    Gerencie aprovações e envie certificados
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/auditoria')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Auditoria
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin/solicitacoes')}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Solicitações
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadDocumentos}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Buscar motorista (nome ou CPF)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="TODOS">Todos os status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="NEGADO">Negado</option>
                </Select>

                <Select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <option value="TODOS">Todos os tipos</option>
                  <option value="CNH">CNH</option>
                  <option value="COMPROVANTE_PAGAMENTO">Comprovante de Pagamento</option>
                  <option value="DOCUMENTO1">Lista de Presença</option>
                  <option value="DOCUMENTO2">Tabela de Dados</option>
                </Select>
              </div>

              {/* Contadores */}
              {loading ? (
                <SkeletonDashboardStats />
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {documentos.filter(d => d.status === 'PENDENTE').length}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Pendentes</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {documentos.filter(d => d.status === 'APROVADO').length}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">Aprovados</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {documentos.filter(d => d.status === 'NEGADO').length}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">Negados</p>
                  </div>
                </div>
              )}

              {/* Tabela de documentos */}
              {loading ? (
                <SkeletonTable rows={8} />
              ) : (
                <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Motorista</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Carregando...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredDocumentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum documento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocumentos.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            {doc.motorista?.nome || 'N/A'}
                          </TableCell>
                          <TableCell>{doc.motorista?.cpf || 'N/A'}</TableCell>
                          <TableCell>{formatTipoDocumento(doc.tipo)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {doc.originalName}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Visualizar documento"
                                onClick={() => handleViewDocument(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Baixar documento"
                                onClick={async () => {
                                  try {
                                    const blob = await documentoService.download(doc.id)
                                    const url = window.URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = doc.originalName || 'documento'
                                    document.body.appendChild(a)
                                    a.click()
                                    a.remove()
                                    window.URL.revokeObjectURL(url)
                                    toast.success('Documento baixado com sucesso!')
                                  } catch (err) {
                                    toast.error('Erro ao baixar documento. Tente novamente.')
                                  }
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={doc.status} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {doc.status === 'PENDENTE' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleAprovarNegar(doc, 'APROVAR')}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleAprovarNegar(doc, 'NEGAR')}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  {doc.tipo === 'DOCUMENTO2' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      title="Solicitar código e negar Tabela de Dados automaticamente"
                                      onClick={() => handleSolicitarCodigo(doc)}
                                    >
                                      <KeyRound className="h-4 w-4" />
                                    </Button>
                                  )}
                                </>
                              )}
                              {doc.status !== 'PENDENTE' && (
                                <span className="text-sm text-muted-foreground px-2">
                                  {doc.status === 'APROVADO' ? '✓ Aprovado' : '✗ Negado'}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>

      {/* Modais */}
      <DocumentoActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, documento: null, action: null })}
        documento={actionDialog.documento}
        action={actionDialog.action}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
      />

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
      </motion.div>
    </DashboardLayout>
  )
}
