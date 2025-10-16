'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  LogOut,
  User,
  RefreshCw,
  Search,
  UserPlus,
  Upload,
  Filter,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import motoristaService from '@/services/motorista.service'
import { MotoristaForm } from '@/components/dashboard/MotoristaForm'
import { DocumentoUpload } from '@/components/dashboard/DocumentoUpload'
import type { Motorista, DocumentoStatus } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(null)
  const [isDespachante, setIsDespachante] = useState(false)
  const [loading, setLoading] = useState(true)
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [filteredMotoristas, setFilteredMotoristas] = useState<Motorista[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DocumentoStatus | 'TODOS'>('TODOS')
  
  // Modais
  const [showFormModal, setShowFormModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null)

  // Verificar autenticação e carregar dados
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

  const userData = authService.getUser()
  setUser(userData)
  setIsDespachante(userData?.role === 'DESPACHANTE')
  loadMotoristas()
  }, [router])

  // Aplicar filtros
  useEffect(() => {
    if (!motoristas || !Array.isArray(motoristas)) {
      setFilteredMotoristas([])
      return
    }

    let filtered = [...motoristas]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter((m) => {
        const nome = m.nome?.toLowerCase() || ''
        const cpf = m.cpf || ''
        const search = searchTerm.toLowerCase()
        return nome.includes(search) || cpf.includes(search)
      })
    }

    // Filtro de status
    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter((m) => {
        return m.documentos?.some(d => d.status === statusFilter)
      })
    }

    setFilteredMotoristas(filtered)
  }, [motoristas, searchTerm, statusFilter])

  const loadMotoristas = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando motoristas...')
      const response = await motoristaService.getAll({})
      console.log('📦 Resposta completa:', response)
      console.log('📋 response.motoristas:', response.motoristas)
      console.log('📋 response.data:', response.data)
      
      // O backend retorna { success: true, motoristas: [...], pagination: {...} }
      const data = response.motoristas || response.data || []
      console.log('✅ Motoristas carregados:', data.length, data)
      
      setMotoristas(data)
      setFilteredMotoristas(data)
    } catch (error: any) {
      console.error('❌ Erro ao carregar motoristas:', error)
      console.error('📋 Erro detalhado:', error.response?.data)
      setMotoristas([])
      setFilteredMotoristas([])
      toast({
        type: 'error',
        title: 'Erro ao carregar motoristas',
        description: error.response?.data?.error || error.response?.data?.message || 'Tente novamente',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const handleOpenUpload = (motorista: Motorista) => {
    setSelectedMotorista(motorista)
    setShowUploadModal(true)
  }

  const handleFormSuccess = () => {
    setShowFormModal(false)
    loadMotoristas()
  }

  const handleUploadSuccess = () => {
    loadMotoristas()
  }

  const getDocumentoStatus = (motorista: Motorista, tipo: string) => {
    const doc = motorista.documentos?.find(d => d.tipo === tipo)
    return doc?.status || null
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">DespaFacil</h1>
              <p className="text-xs text-muted-foreground">Dashboard Despachante</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
            </div>
            {user?.role === 'ADMIN' && (
              <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                Painel Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Motoristas</CardDescription>
                <CardTitle className="text-3xl">{motoristas?.length || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Documentos Pendentes</CardDescription>
                <CardTitle className="text-3xl text-yellow-600">
                  {motoristas?.reduce((acc, m) => 
                    acc + (m.documentos?.filter(d => d.status === 'PENDENTE').length || 0), 0
                  ) || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Documentos Aprovados</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {motoristas?.reduce((acc, m) => 
                    acc + (m.documentos?.filter(d => d.status === 'APROVADO').length || 0), 0
                  ) || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Ações e Filtros */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Motoristas</CardTitle>
                  <CardDescription>
                    Gerencie seus motoristas e documentos
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMotoristas}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                  <Button size="sm" onClick={() => setShowFormModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Motorista
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Buscar por nome ou CPF..."
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
              </div>

              {/* Tabela */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>CNH</TableHead>
                      <TableHead>Comprovante</TableHead>
                      <TableHead>Doc 1</TableHead>
                      <TableHead>Doc 2</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Carregando...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : !filteredMotoristas || filteredMotoristas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          {searchTerm || statusFilter !== 'TODOS'
                            ? 'Nenhum motorista encontrado com os filtros aplicados'
                            : 'Nenhum motorista cadastrado. Clique em "Novo Motorista" para começar.'
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMotoristas.map((motorista) => (
                        <TableRow key={motorista.id}>
                          <TableCell className="font-medium">{motorista.nome}</TableCell>
                          <TableCell>{motorista.cpf}</TableCell>
                          <TableCell>{motorista.email || '-'}</TableCell>
                          <TableCell>{motorista.cursoTipo}</TableCell>
                          <TableCell>
                            {getDocumentoStatus(motorista, 'CNH') ? (
                              <StatusBadge status={getDocumentoStatus(motorista, 'CNH')!} />
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getDocumentoStatus(motorista, 'COMPROVANTE_PAGAMENTO') ? (
                              <StatusBadge status={getDocumentoStatus(motorista, 'COMPROVANTE_PAGAMENTO')!} />
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getDocumentoStatus(motorista, 'DOCUMENTO1') ? (
                              <StatusBadge status={getDocumentoStatus(motorista, 'DOCUMENTO1')!} />
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getDocumentoStatus(motorista, 'DOCUMENTO2') ? (
                              <StatusBadge status={getDocumentoStatus(motorista, 'DOCUMENTO2')!} />
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isDespachante && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenUpload(motorista)}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Modal de Cadastro */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Motorista</DialogTitle>
          </DialogHeader>
          <MotoristaForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Modal de Upload */}
      {isDespachante && (
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                Upload de Documentos - {selectedMotorista?.nome}
              </DialogTitle>
            </DialogHeader>
            {selectedMotorista && (
              <DocumentoUpload
                motorista={selectedMotorista}
                onSuccess={handleUploadSuccess}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
