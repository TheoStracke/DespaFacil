'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Download,
  FileText,
  Users,
  Award,
  Search,
  X,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DocumentStatusChart } from '@/components/charts/DocumentStatusChart'
import { CourseTypeChart } from '@/components/charts/CourseTypeChart'
import { CertificateTimelineChart } from '@/components/charts/CertificateTimelineChart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import authService from '@/services/auth.service'
import motoristaService from '@/services/motorista.service'
import documentoService from '@/services/documento.service'
import type { Motorista, Documento } from '@/types'
import Skeleton from 'react-loading-skeleton'

export default function AnalisePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isDespachante, setIsDespachante] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Dados
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [certificados, setCertificados] = useState<any[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [cursoFilter, setCursoFilter] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }

    const userData = authService.getUser()
    setUser(userData)
    setIsDespachante(userData?.role === 'DESPACHANTE')
    loadAllData()
  }, [router])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Carregar motoristas
      const motoristasResponse = await motoristaService.getAll({ limit: 1000 })
      setMotoristas(motoristasResponse.motoristas || [])
      
      // Carregar documentos (apenas admin)
      if (!isDespachante) {
        try {
          const documentosData = await documentoService.getAllAdmin({ limit: 1000 })
          setDocumentos(documentosData.data || [])
        } catch (error) {
          console.error('Erro ao carregar documentos:', error)
        }
      }
      
      // Carregar certificados
      try {
        const certificadosData = await documentoService.listCertificadosAdmin()
        setCertificados(certificadosData || [])
      } catch (error) {
        console.error('Erro ao carregar certificados:', error)
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados para análise')
    } finally {
      setLoading(false)
    }
  }

  // Filtros para Motoristas
  const filteredMotoristas = motoristas.filter(m => {
    const matchesSearch = !searchTerm || 
      m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf.includes(searchTerm)
    const matchesCurso = !cursoFilter || m.cursoTipo === cursoFilter
    return matchesSearch && matchesCurso
  })

  // Filtros para Documentos
  const filteredDocumentos = documentos.filter(d => {
    const matchesSearch = !searchTerm || 
      d.motorista?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.motorista?.cpf.includes(searchTerm)
    const matchesStatus = !statusFilter || d.status === statusFilter
    const matchesTipo = !tipoFilter || d.tipo === tipoFilter
    
    let matchesDate = true
    if (dateStart || dateEnd) {
      const docDate = new Date(d.uploadedAt)
      if (dateStart) matchesDate = matchesDate && docDate >= new Date(dateStart)
      if (dateEnd) matchesDate = matchesDate && docDate <= new Date(dateEnd)
    }
    
    return matchesSearch && matchesStatus && matchesTipo && matchesDate
  })

  // Filtros para Certificados
  const filteredCertificados = certificados.filter(c => {
    const matchesSearch = !searchTerm || 
      c.motorista?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.motorista?.cpf.includes(searchTerm)
    
    let matchesDate = true
    if (dateStart || dateEnd) {
      const certDate = new Date(c.enviadoEm)
      if (dateStart) matchesDate = matchesDate && certDate >= new Date(dateStart)
      if (dateEnd) matchesDate = matchesDate && certDate <= new Date(dateEnd)
    }
    
    return matchesSearch && matchesDate
  })

  // Estatísticas gerais
  const statsData = {
    totalMotoristas: motoristas.length,
    totalDocumentos: documentos.length,
    documentosPendentes: documentos.filter(d => d.status === 'PENDENTE').length,
    documentosAprovados: documentos.filter(d => d.status === 'APROVADO').length,
    documentosNegados: documentos.filter(d => d.status === 'NEGADO').length,
    totalCertificados: certificados.length,
    motoristasComCertificado: new Set(certificados.map(c => c.motoristaId)).size,
    cursosTAC: motoristas.filter(m => m.cursoTipo === 'TAC').length,
    cursosRT: motoristas.filter(m => m.cursoTipo === 'RT').length,
  }

  // Processar dados de timeline de certificados
  const certificadosTimeline = () => {
    const timeline: Record<string, number> = {}
    certificados.forEach(cert => {
      const date = new Date(cert.enviadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      timeline[date] = (timeline[date] || 0) + 1
    })
    return Object.entries(timeline).map(([data, enviados]) => ({ data, enviados }))
  }

  // Funções de exportação
  const exportToCSVUtil = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const value = row[h] || ''
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Arquivo CSV exportado com sucesso')
  }

  const exportMotoristas = () => {
    const data = filteredMotoristas.map(m => ({
      nome: m.nome,
      cpf: m.cpf,
      telefone: m.telefone || '',
      email: m.email || '',
      curso: m.cursoTipo,
      createdAt: new Date(m.createdAt).toLocaleDateString('pt-BR')
    }))
    exportToCSVUtil(data, 'motoristas', ['nome', 'cpf', 'telefone', 'email', 'curso', 'createdAt'])
  }

  const exportDocumentos = () => {
    const data = filteredDocumentos.map(d => ({
      motorista: d.motorista?.nome || '',
      cpf: d.motorista?.cpf || '',
      tipo: d.tipo,
      status: d.status,
      uploadedAt: new Date(d.uploadedAt).toLocaleDateString('pt-BR'),
      updatedAt: new Date(d.updatedAt).toLocaleDateString('pt-BR')
    }))
    exportToCSVUtil(data, 'documentos', ['motorista', 'cpf', 'tipo', 'status', 'uploadedAt', 'updatedAt'])
  }

  const exportCertificados = () => {
    const data = filteredCertificados.map(c => ({
      motorista: c.motorista?.nome || '',
      cpf: c.motorista?.cpf || '',
      filename: c.filename,
      enviadoEm: new Date(c.enviadoEm).toLocaleDateString('pt-BR'),
      baixadoEm: c.baixadoEm ? new Date(c.baixadoEm).toLocaleDateString('pt-BR') : 'Não baixado'
    }))
    exportToCSVUtil(data, 'certificados', ['motorista', 'cpf', 'filename', 'enviadoEm', 'baixadoEm'])
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTipoFilter('')
    setCursoFilter('')
    setDateStart('')
    setDateEnd('')
  }

  const formatTipoDocumento = (tipo: string) => {
    const tipos: Record<string, string> = {
      'CNH': 'CNH',
      'COMPROVANTE_PAGAMENTO': 'Comprovante de Pagamento',
      'DOCUMENTO1': 'Lista de Presença',
      'DOCUMENTO2': 'Tabela de Dados',
    }
    return tipos[tipo] || tipo
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'APROVADO': return 'default'
      case 'PENDENTE': return 'secondary'
      case 'NEGADO': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <DashboardLayout user={user} isDespachante={isDespachante}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Análise e Relatórios' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-orange">Análise e Relatórios</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise completa de dados, gráficos e exportação de relatórios
            </p>
          </div>
          <Button
            onClick={loadAllData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton height={100} count={4} />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="documentos">
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="motoristas">
                <Users className="h-4 w-4 mr-2" />
                Motoristas
              </TabsTrigger>
              <TabsTrigger value="certificados">
                <Award className="h-4 w-4 mr-2" />
                Certificados
              </TabsTrigger>
            </TabsList>

            {/* Tab: Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Motoristas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{statsData.totalMotoristas}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      TAC: {statsData.cursosTAC} | RT: {statsData.cursosRT}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Documentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{statsData.totalDocumentos}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Aprovados: {statsData.documentosAprovados}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{statsData.documentosPendentes}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      Aguardando análise
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Certificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{statsData.totalCertificados}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {statsData.motoristasComCertificado} motoristas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DocumentStatusChart 
                  pendente={statsData.documentosPendentes}
                  aprovado={statsData.documentosAprovados}
                  negado={statsData.documentosNegados}
                />
                <CourseTypeChart 
                  tac={statsData.cursosTAC}
                  rt={statsData.cursosRT}
                />
              </div>

              <CertificateTimelineChart data={certificadosTimeline()} />
            </TabsContent>

            {/* Tab: Documentos */}
            <TabsContent value="documentos" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros de Documentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pesquisar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Nome ou CPF..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="APROVADO">Aprovado</option>
                        <option value="NEGADO">Negado</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Tipo</label>
                      <Select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
                        <option value="">Todos os tipos</option>
                        <option value="CNH">CNH</option>
                        <option value="COMPROVANTE_PAGAMENTO">Comprovante de Pagamento</option>
                        <option value="DOCUMENTO1">Lista de Presença</option>
                        <option value="DOCUMENTO2">Tabela de Dados</option>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Início</label>
                      <Input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Fim</label>
                      <Input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                      <Button onClick={exportDocumentos} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos ({filteredDocumentos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Motorista</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Upload</TableHead>
                          <TableHead>Última Atualização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocumentos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Nenhum documento encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocumentos.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">{doc.motorista?.nome}</TableCell>
                              <TableCell>{doc.motorista?.cpf}</TableCell>
                              <TableCell>{formatTipoDocumento(doc.tipo)}</TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(doc.status)}>
                                  {doc.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>{new Date(doc.updatedAt).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Motoristas */}
            <TabsContent value="motoristas" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros de Motoristas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pesquisar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Nome ou CPF..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Curso</label>
                      <Select value={cursoFilter} onChange={(e) => setCursoFilter(e.target.value)}>
                        <option value="">Todos os cursos</option>
                        <option value="TAC">TAC</option>
                        <option value="RT">RT</option>
                      </Select>
                    </div>

                    <div className="flex items-end gap-2">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                      <Button onClick={exportMotoristas} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Motoristas */}
              <Card>
                <CardHeader>
                  <CardTitle>Motoristas ({filteredMotoristas.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead>Cadastro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMotoristas.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Nenhum motorista encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredMotoristas.map((motorista) => (
                            <TableRow key={motorista.id}>
                              <TableCell className="font-medium">{motorista.nome}</TableCell>
                              <TableCell>{motorista.cpf}</TableCell>
                              <TableCell>{motorista.telefone || '-'}</TableCell>
                              <TableCell>{motorista.email || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{motorista.cursoTipo}</Badge>
                              </TableCell>
                              <TableCell>{new Date(motorista.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Certificados */}
            <TabsContent value="certificados" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros de Certificados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pesquisar</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Nome ou CPF..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Início</label>
                      <Input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Data Fim</label>
                      <Input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button onClick={clearFilters} variant="outline" className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                      <Button onClick={exportCertificados} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Certificados */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificados ({filteredCertificados.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Motorista</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Curso</TableHead>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Enviado Em</TableHead>
                          <TableHead>Baixado Em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCertificados.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Nenhum certificado encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCertificados.map((cert) => (
                            <TableRow key={cert.id}>
                              <TableCell className="font-medium">{cert.motorista?.nome}</TableCell>
                              <TableCell>{cert.motorista?.cpf}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{cert.motorista?.cursoTipo}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{cert.filename}</TableCell>
                              <TableCell>{new Date(cert.enviadoEm).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell>
                                {cert.baixadoEm ? (
                                  <span className="text-green-600">
                                    {new Date(cert.baixadoEm).toLocaleDateString('pt-BR')}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Não baixado</span>
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
