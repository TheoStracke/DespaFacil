'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
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
import api from '@/lib/api'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface SolicitacaoCadastro {
  id: string
  empresa: string
  cnpj: string
  email: string
  telefone: string
  nomeResponsavel?: string
  mensagem?: string
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO'
  observacoes?: string
  analisadoPor?: string
  createdAt: string
  updatedAt: string
}

export default function SolicitacoesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCadastro[]>([])
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<SolicitacaoCadastro[]>([])
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('PENDENTE')
  
  // Verificar autenticação
  useEffect(() => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      toast({
        type: 'error',
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
      })
      router.push('/login')
      return
    }
    // Seta usuário para layout e carrega dados
    const userData = authService.getUser()
    setUser(userData)
    loadSolicitacoes()
  }, [router])

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...solicitacoes]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter((sol) => {
        const search = searchTerm.toLowerCase()
        return (
          sol.empresa.toLowerCase().includes(search) ||
          sol.cnpj.includes(search) ||
          sol.email.toLowerCase().includes(search)
        )
      })
    }

    // Filtro de status
    if (statusFilter !== 'TODOS') {
      filtered = filtered.filter((sol) => sol.status === statusFilter)
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredSolicitacoes(filtered)
  }, [searchTerm, statusFilter, solicitacoes])

  const loadSolicitacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/parceiros/solicitacoes')
      setSolicitacoes(response.data)
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao carregar solicitações',
        description: error.response?.data?.message || 'Erro ao buscar solicitações',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAprovar = async (id: string) => {
    try {
      await api.post(`/parceiros/solicitacoes/${id}/aprovar`)
      toast({
        type: 'success',
        title: 'Solicitação aprovada',
        description: 'O parceiro foi aprovado com sucesso',
      })
      loadSolicitacoes()
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao aprovar',
        description: error.response?.data?.message || 'Erro ao aprovar solicitação',
      })
    }
  }

  const handleNegar = async (id: string) => {
    const motivo = prompt('Motivo da rejeição (opcional):')
    try {
      await api.post(`/parceiros/solicitacoes/${id}/rejeitar`, { motivo })
      toast({
        type: 'success',
        title: 'Solicitação negada',
        description: 'O parceiro foi rejeitado',
      })
      loadSolicitacoes()
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao negar',
        description: error.response?.data?.message || 'Erro ao negar solicitação',
      })
    }
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning'
      case 'APROVADO':
        return 'success'
      case 'REJEITADO':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'Pendente'
      case 'APROVADO':
        return 'Aprovado'
      case 'REJEITADO':
        return 'Rejeitado'
      default:
        return status
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Solicitações de Cadastro</h1>
              <p className="text-sm text-slate-600">Gerencie as solicitações de novos parceiros</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-sm text-muted-foreground">Carregando solicitações...</p>
            </div>
          </div>
        ) : (
        <>
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar por empresa, CNPJ ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="TODOS">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <UserPlus className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {solicitacoes.filter((s) => s.status === 'PENDENTE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {solicitacoes.filter((s) => s.status === 'APROVADO').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {solicitacoes.filter((s) => s.status === 'REJEITADO').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Solicitações ({filteredSolicitacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSolicitacoes.length === 0 ? (
              <div className="py-12 text-center">
                <UserPlus className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-sm font-medium text-slate-900">
                  Nenhuma solicitação encontrada
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {searchTerm || statusFilter !== 'TODOS'
                    ? 'Tente ajustar os filtros'
                    : 'Não há solicitações de cadastro'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSolicitacoes.map((solicitacao) => (
                      <TableRow key={solicitacao.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{solicitacao.empresa}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{formatCNPJ(solicitacao.cnpj)}</code>
                        </TableCell>
                        <TableCell>
                            <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="h-4 w-4" />
                              {solicitacao.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-4 w-4" />
                              {solicitacao.telefone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            {formatDate(solicitacao.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getStatusLabel(solicitacao.status)} />
                          {solicitacao.observacoes && (
                            <p className="mt-1 text-xs text-slate-500">
                              Motivo: {solicitacao.observacoes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {solicitacao.status === 'PENDENTE' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAprovar(solicitacao.id)}
                                className="border-green-600 text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleNegar(solicitacao.id)}
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Negar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}
