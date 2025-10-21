'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Building2, Clock, CheckCircle2, Ban, Send, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getStatus, solicitar } from '@/services/parceiro.service';
import { maskCNPJ, unmaskCNPJ } from '@/lib/masks';

export default function SolicitarParceriaPage() {
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<null | { status: string; canRegister: boolean; cooldownSeconds: number }>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkStatus = async () => {
    const clean = unmaskCNPJ(cnpj);
    if (clean.length !== 14) {
      toast({ type: 'error', title: 'CNPJ inválido', description: 'Informe um CNPJ com 14 dígitos.' });
      return;
    }
    try {
      setChecking(true);
      const s = await getStatus(clean);
      setStatus(s);
    } catch (e: any) {
      toast({ type: 'error', title: 'Erro ao consultar', description: e.response?.data?.error || e.message });
    } finally {
      setChecking(false);
    }
  };

  const submit = async () => {
    const clean = unmaskCNPJ(cnpj);
    if (clean.length !== 14 || !empresa || !telefone || !email || !senha) {
      toast({ type: 'error', title: 'Preencha os campos obrigatórios', description: 'CNPJ, Empresa, Nome, Telefone, Email e Senha são obrigatórios.' });
      return;
    }

    if (senha.length < 8) {
      toast({ type: 'error', title: 'Senha muito curta', description: 'A senha deve ter no mínimo 8 caracteres.' });
      return;
    }

    if (senha !== confirmarSenha) {
      toast({ type: 'error', title: 'Senhas não coincidem', description: 'As senhas digitadas não são iguais.' });
      return;
    }

    try {
      setSubmitting(true);
      const r = await solicitar({ cnpj: clean, empresa, telefone, email, senha, nomeResponsavel, mensagem });
      if (r.ok) {
        toast({ type: 'success', title: 'Solicitação enviada com sucesso!', description: 'Assim que aprovada, você poderá fazer login com seu email e senha.' });
        setStatus({ status: 'LEAD', canRegister: false, cooldownSeconds: 24 * 60 * 60 });
        // Limpar campos sensíveis
        setSenha('');
        setConfirmarSenha('');
      } else {
        const errorMessages: Record<string, string> = {
          'AGUARDE_24H': 'Você já enviou uma solicitação recentemente. Aguarde 24 horas.',
          'EMAIL_JA_CADASTRADO': 'Este email já está cadastrado no sistema.',
          'CNPJ_JA_CADASTRADO': 'Este CNPJ já possui cadastro no sistema.',
          'SENHA_MINIMO_8': 'A senha deve ter no mínimo 8 caracteres.',
        };
        const message = errorMessages[r.error || ''] || 'Não foi possível enviar a solicitação.';
        toast({ type: 'warning', title: 'Atenção', description: message });
        if (typeof r.cooldownSeconds === 'number') setStatus({ status: 'LEAD', canRegister: false, cooldownSeconds: r.cooldownSeconds });
      }
    } catch (e: any) {
      toast({ type: 'error', title: 'Erro', description: e.response?.data?.error || e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Solicitar Parceria</h1>
          <p className="text-muted-foreground mt-2">Informe seus dados para que possamos aprovar seu acesso ao sistema</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Preencha os dados e envie sua solicitação. Você também pode consultar o status pelo CNPJ.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="CNPJ *" value={cnpj} onChange={(e) => setCnpj(maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
              <div className="flex gap-2 items-end">
                <Button type="button" variant="secondary" onClick={checkStatus} loading={checking}>Consultar Status</Button>
              </div>
              <Input label="Empresa *" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" />
              <Input label="Nome do Responsável" value={nomeResponsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Seu nome completo" />
              <Input label="Telefone *" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
              <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" />
              
              <div className="relative">
                <Input 
                  label="Senha *" 
                  type={showPassword ? "text" : "password"} 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
                  placeholder="Mínimo 8 caracteres" 
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input 
                  label="Confirmar Senha *" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmarSenha} 
                  onChange={(e) => setConfirmarSenha(e.target.value)} 
                  placeholder="Repita a senha" 
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Mensagem (opcional)</label>
                <textarea className="w-full border rounded-md p-2 h-24" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Conte-nos brevemente sobre sua operação" />
              </div>
              
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-900">
                  ℹ️ <strong>Importante:</strong> Após a aprovação, você poderá fazer login diretamente com o email e senha cadastrados aqui.
                </p>
              </div>
            </div>

            {status && (
              <div className="mt-4 p-3 rounded-md border bg-muted/50">
                {status.status === 'PARCEIRO' && (
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /> CNPJ aprovado. Você já pode se cadastrar.</div>
                )}
                {status.status === 'LEAD' && (
                  <div className="flex items-center gap-2 text-blue-600"><Clock className="h-5 w-5" /> Solicitação em análise. Aguarde aprovação. {status.cooldownSeconds > 0 && `Próxima solicitação em ~${Math.ceil(status.cooldownSeconds/3600)}h`}</div>
                )}
                {status.status === 'REJEITADO' && (
                  <div className="flex items-center gap-2 text-red-600"><Ban className="h-5 w-5" /> Sua solicitação foi rejeitada. Você poderá solicitar novamente após 24 horas.</div>
                )}
                {status.status === 'NONE' && (
                  <div className="flex items-center gap-2 text-orange-600"><Send className="h-5 w-5" /> Nenhuma solicitação encontrada. Envie agora para iniciar o processo.</div>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button onClick={submit} loading={submitting}><Send className="h-4 w-4 mr-2" /> Enviar solicitação</Button>
              <Link href="/"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" /> Voltar</Button></Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
