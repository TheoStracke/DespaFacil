'use client';

import { useEffect, useState } from 'react';
import solicitacaoCodigoService, {
  SolicitacaoCodigo,
  EnviarCodigoData,
} from '@/services/solicitacaoCodigo.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Send, RefreshCw } from 'lucide-react';

export function SolicitacoesCodigoWidget() {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCodigo[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoCodigo, setEnviandoCodigo] = useState<string | null>(null);
  const [codigos, setCodigos] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadSolicitacoes();
  }, []);

  const loadSolicitacoes = async () => {
    try {
      setLoading(true);
      const data = await solicitacaoCodigoService.listPendentes();
      setSolicitacoes(data);
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
        title: 'Código enviado!',
        description: 'O código foi enviado para o email de destino',
      });

      // Limpar código do state
      setCodigos((prev) => {
        const newCodigos = { ...prev };
        delete newCodigos[solicitacaoId];
        return newCodigos;
      });

      // Recarregar lista
      loadSolicitacoes();
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

  if (loading && solicitacoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Código</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Código</CardTitle>
          <CardDescription>Não há solicitações pendentes no momento</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={loadSolicitacoes} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Solicitações de Código</CardTitle>
            <CardDescription>
              {solicitacoes.length} solicitação(ões) pendente(s)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSolicitacoes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {solicitacoes.map((sol) => {
          const motoristaEmail = sol.motorista?.email || '';
          const destino = sol.emailDestino || '';
          const emailMismatch = !motoristaEmail || motoristaEmail.trim().toLowerCase() !== destino.trim().toLowerCase();
          return (
          <div key={sol.id} className="p-4 border rounded-lg space-y-3 bg-blue-50">
            <div>
              <h4 className="font-semibold text-lg">{sol.motorista?.nome}</h4>
              <p className="text-sm text-muted-foreground">CPF: {sol.motorista?.cpf}</p>
              {sol.observacao && (
                <p className="text-sm mt-2 text-gray-700">
                  <strong>Observação:</strong> {sol.observacao}
                </p>
              )}
              {emailMismatch && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800 font-semibold">
                    Atenção: o e-mail destino desta solicitação não corresponde ao e-mail atual do motorista.
                    Atualize a Tabela de Dados com o e-mail correto e reenvie após registrar o código.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Digite o código aqui"
                value={codigos[sol.id] || ''}
                onChange={(e) =>
                  setCodigos((prev) => ({ ...prev, [sol.id]: e.target.value }))
                }
                disabled={enviandoCodigo === sol.id}
              />
              <Button
                onClick={() => handleEnviarCodigo(sol.id)}
                disabled={enviandoCodigo === sol.id}
              >
                <Send className="mr-2 h-4 w-4" />
                {enviandoCodigo === sol.id ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Solicitado em{' '}
              {new Date(sol.solicitadoEm).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        );})}
      </CardContent>
    </Card>
  );
}
