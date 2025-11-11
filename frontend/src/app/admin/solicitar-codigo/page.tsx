'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import solicitacaoCodigoService, {
  SolicitacaoCodigo,
  CreateSolicitacaoData,
} from '@/services/solicitacaoCodigo.service';
import motoristaService from '@/services/motorista.service';
import authService from '@/services/auth.service';
import { Motorista } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

export default function SolicitarCodigoPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCodigo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(false);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Form
  const [motoristaId, setMotoristaId] = useState('');
  const [emailDestino, setEmailDestino] = useState('');
  const [observacao, setObservacao] = useState('');
  const [searchMotorista, setSearchMotorista] = useState('');

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    loadMotoristas();
    loadSolicitacoes();
  }, []);

  useEffect(() => {
    loadSolicitacoes();
  }, [filtroStatus]);

  const loadMotoristas = async () => {
    try {
      const response = await motoristaService.getAll({ limit: 1000 }); // Buscar todos
      setMotoristas(response.motoristas || []);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao carregar motoristas',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const loadSolicitacoes = async () => {
    try {
      setLoadingSolicitacoes(true);
      const data = await solicitacaoCodigoService.listAll(filtroStatus);
      setSolicitacoes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao carregar solicitações',
        description: error.response?.data?.message || error.message,
      });
      setSolicitacoes([]); // Garantir que seja array em caso de erro
    } finally {
      setLoadingSolicitacoes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motoristaId || !emailDestino) {
      toast({
        type: 'error',
        title: 'Campos obrigatórios',
        description: 'Selecione um motorista e informe o email de destino',
      });
      return;
    }

    try {
      setLoading(true);
      const data: CreateSolicitacaoData = {
        motoristaId,
        emailDestino,
        observacao: observacao || undefined,
      };

      await solicitacaoCodigoService.create(data);

      toast({
        type: 'success',
        title: 'Solicitação criada!',
        description: 'O despachante foi notificado por email',
      });

      // Limpar form
      setMotoristaId('');
      setEmailDestino('');
      setObservacao('');

      // Recarregar lista
      loadSolicitacoes();
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao criar solicitação',
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return;

    try {
      await solicitacaoCodigoService.cancel(id);
      toast({
        type: 'success',
        title: 'Solicitação cancelada',
      });
      loadSolicitacoes();
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao cancelar solicitação',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'warning';
      case 'ENVIADO':
        return 'success';
      case 'CANCELADO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Filtrar motoristas pela busca
  const filteredMotoristas = motoristas.filter((m) => {
    if (!searchMotorista) return true;
    const search = searchMotorista.toLowerCase();
    return (
      m.nome.toLowerCase().includes(search) ||
      m.cpf.includes(searchMotorista.replace(/\D/g, ''))
    );
  });

  return (
    <DashboardLayout user={user} isDespachante={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-orange">Solicitar Código</h1>
          <p className="text-muted-foreground mt-1">
            Solicite códigos aos despachantes para envio ao motorista
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Nova Solicitação</CardTitle>
              <CardDescription>
                Preencha os dados para solicitar um código ao despachante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="motorista" className="block text-sm font-medium mb-2">
                    Motorista *
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar por nome ou CPF..."
                      value={searchMotorista}
                      onChange={e => {
                        setSearchMotorista(e.target.value);
                        setMotoristaId('');
                      }}
                      className="mb-2"
                    />
                    {searchMotorista && filteredMotoristas.length > 0 && !motoristaId && (
                      <div className="border rounded bg-white dark:bg-gray-800 shadow z-10 max-h-48 overflow-y-auto">
                        {filteredMotoristas.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            className="block w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700"
                            onClick={() => {
                              setMotoristaId(m.id);
                              setSearchMotorista(`${m.nome} - ${m.cpf}`);
                            }}
                          >
                            {m.nome} - {m.cpf}
                          </button>
                        ))}
                      </div>
                    )}
                    {searchMotorista && filteredMotoristas.length === 0 && !motoristaId && (
                      <p className="text-xs text-red-500">Nenhum motorista encontrado</p>
                    )}
                    {motoristaId && (
                      <div className="text-xs text-green-600">Motorista selecionado!</div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="emailDestino" className="block text-sm font-medium mb-2">
                    Email de Destino *
                  </label>
                  <Input
                    id="emailDestino"
                    type="email"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email onde o código será enviado após o despachante fornecer
                  </p>
                </div>

                <div>
                  <label htmlFor="observacao" className="block text-sm font-medium mb-2">
                    Observação (opcional)
                  </label>
                  <Textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Informações adicionais sobre a solicitação..."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? 'Criando...' : 'Criar Solicitação'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Filtros e Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtre as solicitações por status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full"
                >
                  <option value="">Todos</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="CANCELADO">Cancelado</option>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={loadSolicitacoes}
                disabled={loadingSolicitacoes}
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingSolicitacoes ? 'animate-spin' : ''}`} />
                Atualizar Lista
              </Button>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {solicitacoes.filter((s) => s.status === 'PENDENTE').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {solicitacoes.filter((s) => s.status === 'ENVIADO').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {solicitacoes.filter((s) => s.status === 'CANCELADO').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Cancelados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Solicitações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Solicitações</CardTitle>
            <CardDescription>
              {solicitacoes.length} solicitação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Email Destino</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Solicitado Em</TableHead>
                    <TableHead>Enviado Em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma solicitação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    solicitacoes.map((sol) => (
                      <TableRow key={sol.id}>
                        <TableCell className="font-medium">
                          {sol.motorista?.nome || '-'}
                          <div className="text-xs text-muted-foreground">
                            {sol.motorista?.cpf || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{sol.emailDestino}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {sol.observacao || '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={sol.status} />
                        </TableCell>
                        <TableCell>
                          {sol.codigo ? (
                            <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-mono">
                              {sol.codigo}
                            </code>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(sol.solicitadoEm).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sol.enviadoEm
                            ? new Date(sol.enviadoEm).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {sol.status === 'PENDENTE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(sol.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>
    </DashboardLayout>
  );
}
