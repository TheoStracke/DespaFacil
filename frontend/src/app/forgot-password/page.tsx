"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import authService from '@/services/auth.service';
import HcaptchaWidget from '@/components/ui/HcaptchaWidget';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ type: 'error', title: 'Informe seu email' });
      return;
    }
    if (!captcha) {
      toast({ type: 'error', title: 'Confirme o captcha antes de enviar' });
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim(), captcha);
      toast({ type: 'success', title: 'Se existir uma conta, enviaremos um email com instruções.' });
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      toast({ type: 'success', title: 'Se existir uma conta, enviaremos um email com instruções.' });
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/login')}
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
            <CardDescription>Informe seu email para receber o link de redefinição</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
                disabled={loading}
              />
              <div className="flex justify-center">
                <HcaptchaWidget
                  sitekey="2a34c8f0-3768-4e80-93da-68cc6592b8e6"
                  onVerify={setCaptcha}
                  onExpire={() => setCaptcha(null)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || !captcha}>
                {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>) : 'Enviar link'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
