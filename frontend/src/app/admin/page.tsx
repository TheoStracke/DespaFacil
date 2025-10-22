'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  UserPlus,
  Download,
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
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import documentoService from '@/services/documento.service'
import { DocumentoActionDialog } from '@/components/admin/DocumentoActionDialog'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { Documento, DocumentoStatus } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  
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

  // Verificar autenticação e carregar dados
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    if (!authService.isAdmin()) {
      toast({
        type: 'error',
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
      })
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
        console.log(`  [${idx}] id=${doc.id} tipo=${doc.tipo} status=${doc.status}`)
      })
      setDocumentos(docs)
      setFilteredDocumentos(docs)
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error)
      toast({
        type: 'error',
        title: 'Erro ao carregar documentos',
        description: error.response?.data?.message || 'Tente novamente',
      })
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

  const handleConfirmAction = async (documentoId: string, status: string, motivo?: string) => {
    try {
      setActionLoading(true)
      
      await documentoService.updateStatus(documentoId, status as DocumentoStatus, motivo)

      toast({
        type: 'success',
        title: status === 'APROVADO' ? 'Documento aprovado!' : 'Documento negado',
        description: 'Status atualizado com sucesso',
      })

      // Atualizar lista
      await loadDocumentos()
      
      // Fechar modal
      setActionDialog({ open: false, documento: null, action: null })
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast({
        type: 'error',
        title: 'Erro ao atualizar status',
        description: error.response?.data?.message || 'Tente novamente',
      })
    } finally {
      setActionLoading(false)
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
                  <option value="COMPROVANTE_PAGAMENTO">Comprovante</option>
                  <option value="DOCUMENTO1">Documento 1</option>
                  <option value="DOCUMENTO2">Documento 2</option>
                </Select>
              </div>

              {/* Contadores */}
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

              {/* Tabela de documentos */}
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
                          <TableCell>{doc.tipo}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.originalName}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2"
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
                                } catch (err) {
                                  toast({
                                    type: 'error',
                                    title: 'Erro ao baixar documento',
                                    description: 'Tente novamente',
                                  })
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
      </motion.div>
    </DashboardLayout>
  )
}
