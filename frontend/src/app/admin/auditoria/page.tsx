'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Shield,
  Search,
  Download,
  Calendar,
  User,
  Activity,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import authService from '@/services/auth.service'
import auditLogService, { AuditLog } from '@/services/auditLog.service'

export default function AuditLogPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Autenticação da página
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifying, setVerifying] = useState(false)
  
  // Logs
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loadingLogs, setLoadingLogs] = useState(false)
  
  // Filtros
  const [searchUser, setSearchUser] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(0)
  const [limit] = useState(50)

  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast.error('Acesso negado. Apenas administradores.')
      router.push('/dashboard')
      return
    }

    const userData = authService.getUser()
    setUser(userData)
    setLoading(false)
  }, [router])

  const handleVerifyPassword = async () => {
    if (!password) {
      toast.error('Digite a senha de acesso')
      return
    }

    setVerifying(true)
    try {
      const success = await auditLogService.verifyPassword(password)
      if (success) {
        setIsAuthenticated(true)
        toast.success('Acesso autorizado')
        loadLogs()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Senha incorreta')
    } finally {
      setVerifying(false)
    }
  }

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const filters: any = {
        limit,
        offset: page * limit,
      }
      
      if (searchUser) filters.userId = searchUser
      if (actionFilter) filters.action = actionFilter
      if (entityTypeFilter) filters.entityType = entityTypeFilter
      if (startDate) filters.startDate = new Date(startDate).toISOString()
      if (endDate) filters.endDate = new Date(endDate).toISOString()

      const result = await auditLogService.getLogs(filters)
      setLogs(result.logs)
      setTotal(result.total)
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error)
      toast.error('Erro ao carregar logs de auditoria')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleExport = async () => {
    try {
      const filters: any = {}
      if (searchUser) filters.userId = searchUser
      if (actionFilter) filters.action = actionFilter
      if (entityTypeFilter) filters.entityType = entityTypeFilter
      if (startDate) filters.startDate = new Date(startDate).toISOString()
      if (endDate) filters.endDate = new Date(endDate).toISOString()

      const result = await auditLogService.exportLogs(filters)
      
      // Converter para CSV
      const csv = convertToCSV(result.logs)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `audit-logs-${new Date().toISOString()}.csv`
      link.click()
      
      toast.success(`${result.logs.length} logs exportados`)
    } catch (error: any) {
      console.error('Erro ao exportar logs:', error)
      toast.error('Erro ao exportar logs')
    }
  }

  const convertToCSV = (data: AuditLog[]): string => {
    const headers = ['Data/Hora', 'Usuário', 'Email', 'Ação', 'Tipo', 'Entidade', 'IP', 'User Agent']
    const rows = data.map(log => [
      new Date(log.createdAt).toLocaleString('pt-BR'),
      log.user.name,
      log.user.email,
      auditLogService.translateAction(log.action),
      log.entityType || '-',
      log.entityName || '-',
      log.ipAddress || '-',
      log.userAgent || '-',
    ])
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const clearFilters = () => {
    setSearchUser('')
    setActionFilter('')
    setEntityTypeFilter('')
    setStartDate('')
    setEndDate('')
    setPage(0)
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadLogs()
    }
  }, [page, searchUser, actionFilter, entityTypeFilter, startDate, endDate, isAuthenticated])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} isDespachante={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-brand-orange dark:text-brand-orange">Logs de Auditoria</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400">Histórico completo de ações no sistema</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Início', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'Auditoria', href: '/admin/auditoria' },
          ]}
        />

        {/* Modal de Senha */}
        <Dialog open={!isAuthenticated} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Lock className="h-8 w-8 text-brand-orange" />
                </div>
              </div>
              <DialogTitle className="text-center">Acesso Restrito</DialogTitle>
              <DialogDescription className="text-center">
                Digite a senha de segurança para acessar os logs de auditoria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                onClick={handleVerifyPassword}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? 'Verificando...' : 'Acessar Logs'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Conteúdo Principal - Apenas quando autenticado */}
        {isAuthenticated && (
          <>
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Usuário (ID ou Email)</label>
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ação</label>
                    <Select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                    >
                      <option value="">Todas as ações</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                      <option value="MOTORISTA_CREATE">Motorista Criado</option>
                      <option value="MOTORISTA_UPDATE">Motorista Atualizado</option>
                      <option value="MOTORISTA_DELETE">Motorista Excluído</option>
                      <option value="DOCUMENTO_APROVAR">Documento Aprovado</option>
                      <option value="DOCUMENTO_NEGAR">Documento Negado</option>
                      <option value="CERTIFICADO_ENVIAR">Certificado Enviado</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Entidade</label>
                    <Select
                      value={entityTypeFilter}
                      onChange={(e) => setEntityTypeFilter(e.target.value)}
                    >
                      <option value="">Todos os tipos</option>
                      <option value="Motorista">Motorista</option>
                      <option value="Documento">Documento</option>
                      <option value="Certificado">Certificado</option>
                      <option value="User">Usuário</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Início</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Fim</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      onClick={handleExport}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  {total} registro(s) encontrado(s)
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Registros de Auditoria
                </CardTitle>
                <CardDescription>
                  Histórico de todas as ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-4 text-sm text-muted-foreground">Nenhum log encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">Data/Hora</th>
                          <th className="text-left p-3 text-sm font-medium">Usuário</th>
                          <th className="text-left p-3 text-sm font-medium">Ação</th>
                          <th className="text-left p-3 text-sm font-medium">Entidade</th>
                          <th className="text-left p-3 text-sm font-medium">IP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm">
                              {new Date(log.createdAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="p-3 text-sm">
                              <div>
                                <div className="font-medium">{log.user.name}</div>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  auditLogService.getActionColor(log.action) === 'green'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : auditLogService.getActionColor(log.action) === 'red'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                    : auditLogService.getActionColor(log.action) === 'blue'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                    : auditLogService.getActionColor(log.action) === 'purple'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                }`}
                              >
                                {auditLogService.translateAction(log.action)}
                              </span>
                            </td>
                            <td className="p-3 text-sm">
                              {log.entityType && log.entityName ? (
                                <div>
                                  <div className="font-medium">{log.entityType}</div>
                                  <div className="text-xs text-muted-foreground">{log.entityName}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {log.ipAddress || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paginação */}
                {total > limit && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {page + 1} de {Math.ceil(total / limit)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page + 1) * limit >= total}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
