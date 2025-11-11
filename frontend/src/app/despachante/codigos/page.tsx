'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import solicitacaoCodigoService, {
  SolicitacaoCodigo,
  EnviarCodigoData,
} from '@/services/solicitacaoCodigo.service';
import authService from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Send, RefreshCw, CheckCircle, RotateCcw, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DespachanteCodigosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCodigo[]>([]);
  const [solicitacoesEnviadas, setSolicitacoesEnviadas] = useState<SolicitacaoCodigo[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState<string | null>(null);
  const [codigos, setCodigos] = useState<{ [key: string]: string }>({});
  const [confirmadas, setConfirmadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Verificar autenticação
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userData = authService.getUser();
    if (userData?.role !== 'DESPACHANTE') {
      toast({
        type: 'error',
        title: 'Acesso negado',
        description: 'Esta página é apenas para despachantes',
      });
      router.push('/dashboard');
      return;
    }

    setUser(userData);
    loadSolicitacoes();
  }, [router]);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const data = await solicitacaoCodigoService.listPendentes();
      
      // Separar pendentes e enviadas
      const pendentes = data.filter((s: SolicitacaoCodigo) => s.status === 'PENDENTE');
      const enviadas = data.filter((s: SolicitacaoCodigo) => s.status === 'ENVIADO');
      
      setSolicitacoes(pendentes);
      setSolicitacoesEnviadas(enviadas);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao carregar solicitações',
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarCodigo = async (solicitacaoId: string) => {
    const codigo = codigos[solicitacaoId];
    if (!codigo || codigo.trim() === '') {
      toast({
        type: 'error',
        title: 'Código obrigatório',
        description: 'Por favor, digite o código antes de enviar',
      });
      return;
    }

    try {
      setEnviandoCodigo(solicitacaoId);
      const data: EnviarCodigoData = { codigo: codigo.trim() };
      await solicitacaoCodigoService.enviarCodigo(solicitacaoId, data);

      toast({
        type: 'success',
        title: 'Código registrado!',
        description: 'O código foi salvo no sistema. Você pode enviá-lo manualmente ao destinatário.',
      });

      // Marcar como confirmada
      setConfirmadas((prev) => new Set(prev).add(solicitacaoId));

      // Limpar código do state
      setCodigos((prev) => {
        const newCodigos = { ...prev };
        delete newCodigos[solicitacaoId];
        return newCodigos;
      });

      // Recarregar lista após 2 segundos
      setTimeout(() => {
        loadSolicitacoes();
      }, 2000);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Erro ao enviar código',
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setEnviandoCodigo(null);
    }
  };

  const handleReenviar = (solicitacao: SolicitacaoCodigo) => {
    // Remover da lista de confirmadas para permitir reedição
    setConfirmadas((prev) => {
      const newSet = new Set(prev);
      newSet.delete(solicitacao.id);
      return newSet;
    });

    // Colocar código no campo
    if (solicitacao.codigo) {
      setCodigos((prev) => ({ ...prev, [solicitacao.id]: solicitacao.codigo! }));
    }

    // Mover de volta para pendentes
    setSolicitacoes((prev) => [solicitacao, ...prev]);
    setSolicitacoesEnviadas((prev) => prev.filter((s) => s.id !== solicitacao.id));

    toast({
      type: 'info',
      title: 'Pronto para reenvio',
      description: 'Você pode editar e reenviar o código agora',
    });
  };

  if (loading && solicitacoes.length === 0 && solicitacoesEnviadas.length === 0) {
    return (
      <DashboardLayout user={user} isDespachante={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} isDespachante={true}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-orange">Gerenciar Códigos</h1>
            <p className="text-muted-foreground mt-1">
              Registre os códigos solicitados e compartilhe manualmente com os destinatários
            </p>
          </div>
          <Button variant="outline" onClick={loadSolicitacoes} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {solicitacoes.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Pendentes
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {solicitacoesEnviadas.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Registrados
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {confirmadas.size}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Confirmados
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Solicitações Pendentes */}
        {solicitacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>
                {solicitacoes.length} solicitação(ões) aguardando registro de código
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {solicitacoes.map((sol, index) => {
                const isConfirmada = confirmadas.has(sol.id);
                
                return (
                  <motion.div
                    key={sol.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-5 border rounded-lg space-y-4 ${
                      isConfirmada ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    {isConfirmada && (
                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Código Registrado! Envie manualmente ao destinatário.</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">
                          {sol.motorista?.nome}
                        </h4>
                        <p className="text-sm text-gray-600">
                          CPF: {sol.motorista?.cpf}
                        </p>
                        <p className="text-sm text-gray-600">
                          Curso: {sol.motorista?.cursoTipo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <strong>Email destino:</strong> {sol.emailDestino}
                        </p>
                        {sol.observacao && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Observação:</strong> {sol.observacao}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isConfirmada ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite o código aqui"
                          value={codigos[sol.id] || ''}
                          onChange={(e) =>
                            setCodigos((prev) => ({ ...prev, [sol.id]: e.target.value }))
                          }
                          disabled={enviandoCodigo === sol.id}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleEnviarCodigo(sol.id)}
                          disabled={enviandoCodigo === sol.id}
                          className="min-w-[120px]"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {enviandoCodigo === sol.id ? 'Registrando...' : 'Registrar'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-300 dark:border-green-700">
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Código registrado - Enviar manualmente para {sol.emailDestino}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReenviar(sol)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reenviar
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Solicitado em{' '}
                      {new Date(sol.solicitadoEm).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Solicitações Registradas Recentemente */}
        {solicitacoesEnviadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Registrados Recentemente</CardTitle>
              <CardDescription>
                {solicitacoesEnviadas.length} código(s) registrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {solicitacoesEnviadas.map((sol) => (
                <div
                  key={sol.id}
                  className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{sol.motorista?.nome}</h4>
                    <p className="text-sm text-gray-600">
                      Código: <code className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">{sol.codigo}</code>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Registrado em{' '}
                      {sol.enviadoEm
                        ? new Date(sol.enviadoEm).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReenviar(sol)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mensagem quando não há solicitações */}
        {solicitacoes.length === 0 && solicitacoesEnviadas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <KeyRound className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação no momento
              </h3>
              <p className="text-gray-500">
                Quando o admin solicitar códigos, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
