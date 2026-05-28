'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Send, ArrowLeft, History, Download, FileArchive, CheckCircle, XCircle, Clock, Search, Filter, Home, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import authService from '@/services/auth.service'
import documentoService from '@/services/documento.service'
import motoristaService from '@/services/motorista.service'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SendCertificadoDialog } from '@/components/admin/SendCertificadoDialog'
import { Certificado, Motorista } from '@/types'

export default function EnviarCertificadoPage() {
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [loadingCertificados, setLoadingCertificados] = useState(false)
  const [loadingMotoristas, setLoadingMotoristas] = useState(false)
  
  // Filtros para download em lote
  const [searchMotorista, setSearchMotorista] = useState('')
  const [cursoFilter, setCursoFilter] = useState<string>('TODOS')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Filtros para histórico
  const [searchHistorico, setSearchHistorico] = useState('')
  const [cursoFilterHistorico, setCursoFilterHistorico] = useState<string>('TODOS')
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast.error('Acesso negado. Você não tem permissão para acessar esta página.')
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    setUser(userData)
    setLoading(false)
    loadCertificados()
    loadMotoristas()
  }, [router])

  const loadCertificados = async () => {
    try {
      setLoadingCertificados(true)
      const data = await documentoService.listCertificadosAdmin()
      setCertificados(data)
    } catch (error: any) {
      console.error('Erro ao carregar certificados:', error)
      toast.error(error.response?.data?.message || 'Erro ao carregar histórico. Tente novamente.')
    } finally {
      setLoadingCertificados(false)
    }
  }

  const loadMotoristas = async () => {
    try {
      setLoadingMotoristas(true)
      const response = await motoristaService.getAll({ limit: 1000 })
      setMotoristas(response.motoristas || [])
    } catch (error: any) {
      console.error('Erro ao carregar motoristas:', error)
    } finally {
      setLoadingMotoristas(false)
    }
  }

  // Filtrar motoristas por busca e tipo de curso
  const filteredMotoristas = motoristas.filter((motorista) => {
    // Filtro de busca por nome ou CPF
    const matchesSearch = 
      motorista.nome.toLowerCase().includes(searchMotorista.toLowerCase()) ||
      motorista.cpf.includes(searchMotorista)

    // Filtro por tipo de curso
    const matchesCurso = 
      cursoFilter === 'TODOS' || 
      motorista.cursoTipo === cursoFilter

    return matchesSearch && matchesCurso
  }).sort((a, b) => {
    // Ordenar por nome
    if (sortOrder === 'asc') {
      return a.nome.localeCompare(b.nome)
    } else {
      return b.nome.localeCompare(a.nome)
    }
  })

  const handleSendCertificado = async (file: File, search: string) => {
    try {
      setActionLoading(true)
      
      await documentoService.sendCertificado(file, search)

      toast.success('Certificado enviado! O despachante foi notificado por e-mail.')

      setSendDialogOpen(false)
      loadCertificados() // Recarregar histórico
    } catch (error: any) {
      console.error('Erro ao enviar certificado:', error)
      toast.error(error.response?.data?.error || 'Erro ao enviar certificado. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadZip = async (motorista: Motorista) => {
    try {
      setActionLoading(true)
      
      // Verificar se todos documentos estão aprovados
      const todosAprovados = motorista.documentos?.every(doc => doc.status === 'APROVADO')
      
      if (!todosAprovados) {
        toast.error('Download bloqueado. Todos os documentos precisam estar aprovados.')
        return
      }

      await documentoService.downloadZipMotorista(motorista.id, motorista.nome)

      toast.success(`Download iniciado: Documentos de ${motorista.nome}`)
    } catch (error: any) {
      console.error('Erro ao baixar ZIP:', error)
      toast.error(error.response?.data?.error || 'Erro ao baixar documentos. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Filtrar certificados do histórico
  const filteredCertificados = certificados.filter((cert) => {
    // Filtro de busca por nome ou CPF
    const matchesSearch = 
      !searchHistorico ||
      cert.motorista?.nome.toLowerCase().includes(searchHistorico.toLowerCase()) ||
      cert.motorista?.cpf.includes(searchHistorico.replace(/\D/g, ''))

    // Filtro por tipo de curso
    const matchesCurso = 
      cursoFilterHistorico === 'TODOS' || 
      cert.motorista?.cursoTipo === cursoFilterHistorico

    // Filtro por status (baixado ou não)
    const matchesStatus =
      statusFilter === 'TODOS' ||
      (statusFilter === 'BAIXADO' && cert.baixadoEm) ||
      (statusFilter === 'PENDENTE' && !cert.baixadoEm)

    return matchesSearch && matchesCurso && matchesStatus
  })

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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-brand-orange dark:text-brand-orange">Certificados e Documentos</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400">Gerencie certificados e faça download em lote</p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: Home },
              { label: 'Painel Admin', href: '/admin', icon: Shield },
              { label: 'Enviar Certificado', icon: Send }
            ]}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentos">
              <FileArchive className="mr-2 h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="enviar">
              <Send className="mr-2 h-4 w-4" />
              Enviar Certificado
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History className="mr-2 h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba: Enviar Certificado */}
          <TabsContent value="enviar">
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
                      PDF, imagens e planilhas (XLS, XLSX, CSV) com tamanho máximo de 10MB
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
          </TabsContent>

          {/* Aba: Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Certificados Enviados
                </CardTitle>
                <CardDescription>
                  Todos os certificados enviados aos despachantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros de Pesquisa */}
                <div className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Busca por Nome/CPF */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou CPF..."
                        value={searchHistorico}
                        onChange={(e) => setSearchHistorico(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Filtro por Curso */}
                    <Select
                      value={cursoFilterHistorico}
                      onChange={(e) => setCursoFilterHistorico(e.target.value)}
                    >
                      <option value="TODOS">Todos os Cursos</option>
                      <option value="TAC">TAC</option>
                      <option value="RT">RT</option>
                    </Select>

                    {/* Filtro por Status */}
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="BAIXADO">Baixados</option>
                      <option value="PENDENTE">Pendentes</option>
                    </Select>
                  </div>

                  {/* Contador de Resultados */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {filteredCertificados.length} de {certificados.length} certificado(s)
                    </span>
                    {(searchHistorico || cursoFilterHistorico !== 'TODOS' || statusFilter !== 'TODOS') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchHistorico('')
                          setCursoFilterHistorico('TODOS')
                          setStatusFilter('TODOS')
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </div>

                {loadingCertificados ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                    </div>
                  </div>
                ) : filteredCertificados.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {certificados.length === 0 
                        ? 'Nenhum certificado enviado ainda'
                        : 'Nenhum certificado encontrado com os filtros aplicados'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">Motorista</th>
                          <th className="text-left p-3 text-sm font-medium">CPF</th>
                          <th className="text-left p-3 text-sm font-medium">Curso</th>
                          <th className="text-left p-3 text-sm font-medium">Enviado em</th>
                          <th className="text-left p-3 text-sm font-medium">Baixado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCertificados.map((cert) => (
                          <tr key={cert.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm">{cert.motorista?.nome}</td>
                            <td className="p-3 text-sm font-mono">{formatCPF(cert.motorista?.cpf || '')}</td>
                            <td className="p-3 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {cert.motorista?.cursoTipo}
                              </span>
                            </td>
                            <td className="p-3 text-sm">{formatDate(cert.enviadoEm)}</td>
                            <td className="p-3 text-sm">
                              {cert.baixadoEm ? (
                                <span className="inline-flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  {formatDate(cert.baixadoEm)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileArchive className="h-5 w-5 text-primary" />
                  Download de Documentos em Lote
                </CardTitle>
                <CardDescription>
                  Baixe todos os documentos de um motorista em um arquivo ZIP (apenas se todos estiverem aprovados)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filtros e Busca */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Campo de busca */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou CPF..."
                        value={searchMotorista}
                        onChange={(e) => setSearchMotorista(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Filtro por tipo de curso */}
                    <div className="flex gap-2 sm:w-auto w-full">
                      <div className="relative flex-1 sm:w-48">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                        <select
                          value={cursoFilter}
                          onChange={(e) => setCursoFilter(e.target.value)}
                          className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer"
                        >
                          <option value="TODOS">Todos os cursos</option>
                          <option value="TAC">TAC</option>
                          <option value="RT">RT</option>
                        </select>
                      </div>

                      {/* Ordenação */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          >
                            {sortOrder === 'asc' ? '↓' : '↑'}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Ordenar {sortOrder === 'asc' ? 'Z-A' : 'A-Z'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Contador de resultados */}
                  {(searchMotorista || cursoFilter !== 'TODOS') && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {filteredMotoristas.length} motorista{filteredMotoristas.length !== 1 ? 's' : ''} encontrado{filteredMotoristas.length !== 1 ? 's' : ''}
                      </span>
                      {(searchMotorista || cursoFilter !== 'TODOS') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchMotorista('')
                            setCursoFilter('TODOS')
                          }}
                          className="h-6 text-xs"
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {loadingMotoristas ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                    </div>
                  </div>
                ) : filteredMotoristas.length === 0 ? (
                  <div className="text-center py-12">
                    <FileArchive className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {motoristas.length === 0 
                        ? 'Nenhum motorista cadastrado'
                        : 'Nenhum motorista encontrado com os filtros aplicados'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMotoristas.map((motorista) => {
                      const totalDocs = motorista.documentos?.length || 0
                      const aprovados = motorista.documentos?.filter(d => d.status === 'APROVADO').length || 0
                      const todosAprovados = totalDocs > 0 && aprovados === totalDocs

                      return (
                        <div
                          key={motorista.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{motorista.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              CPF: {formatCPF(motorista.cpf)} • {motorista.cursoTipo}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {aprovados}/{totalDocs} documentos aprovados
                              </span>
                              {todosAprovados ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadZip(motorista)}
                            disabled={!todosAprovados || actionLoading}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Baixar ZIP
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
