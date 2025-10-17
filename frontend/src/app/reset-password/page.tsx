"use client";

import { useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import authService from '@/services/auth.service';

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ type: 'error', title: 'Link inválido' });
      return;
    }
    if (!password || password.length < 8) {
      toast({ type: 'error', title: 'A senha deve ter no mínimo 8 caracteres' });
      return;
    }
    if (password !== confirm) {
      toast({ type: 'error', title: 'As senhas não coincidem' });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast({ type: 'success', title: 'Senha redefinida com sucesso' });
      router.push('/login');
    } catch (err: any) {
      toast({ type: 'error', title: err.response?.data?.error || 'Link inválido ou expirado' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Definir nova senha</CardTitle>
            <CardDescription>Crie uma senha forte (mínimo 8 caracteres)</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <Input
                label="Nova senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <Input
                label="Confirmar senha"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redefinindo...</>) : 'Redefinir senha'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
