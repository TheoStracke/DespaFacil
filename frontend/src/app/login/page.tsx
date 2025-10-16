'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import { maskCPFOrCNPJ, unmaskCPF, validateCPFOrCNPJ } from '@/lib/masks'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [cpfOrEmail, setCpfOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ cpfOrEmail: '', password: '' })

  // Aplicar máscara ao digitar CPF
  const handleCpfOrEmailChange = (value: string) => {
    // Se contém @ é email, senão aplica máscara de CPF/CNPJ
    if (value.includes('@')) {
      setCpfOrEmail(value)
    } else {
      setCpfOrEmail(maskCPFOrCNPJ(value))
    }
    
    // Limpar erro ao digitar
    if (errors.cpfOrEmail) {
      setErrors(prev => ({ ...prev, cpfOrEmail: '' }))
    }
  }

  // Validação dos campos
  const validate = (): boolean => {
    const newErrors = { cpfOrEmail: '', password: '' }
    let isValid = true

    // Validar CPF/Email
    if (!cpfOrEmail.trim()) {
      newErrors.cpfOrEmail = 'CPF/CNPJ ou Email é obrigatório'
      isValid = false
    } else if (!cpfOrEmail.includes('@')) {
      // Se não é email, validar como CPF/CNPJ
      if (!validateCPFOrCNPJ(cpfOrEmail)) {
        newErrors.cpfOrEmail = 'CPF/CNPJ inválido'
        isValid = false
      }
    }

    // Validar senha
    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória'
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Submit do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast({
        type: 'error',
        title: 'Erro de validação',
        description: 'Por favor, corrija os erros no formulário',
      })
      return
    }

    setLoading(true)

    try {
      // Remover máscara se for CPF/CNPJ
      const emailOrCnpj = cpfOrEmail.includes('@') 
        ? cpfOrEmail 
        : unmaskCPF(cpfOrEmail)

      await authService.login({
        emailOrCnpj,
        password,
      })

      toast({
        type: 'success',
        title: 'Login realizado!',
        description: 'Bem-vindo de volta 👋',
      })

      // Redirecionar para dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      toast({
        type: 'error',
        title: 'Erro ao fazer login',
        description: error.response?.data?.message || 'Credenciais inválidas. Verifique seus dados e tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold">DespaFacil</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Campo CPF/CNPJ ou Email */}
              <Input
                label="CPF/CNPJ ou Email"
                type="text"
                value={cpfOrEmail}
                onChange={(e) => handleCpfOrEmailChange(e.target.value)}
                placeholder="000.000.000-00 ou email@example.com"
                error={errors.cpfOrEmail}
                required
                disabled={loading}
                autoFocus
              />

              {/* Campo Senha */}
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: '' }))
                  }
                }}
                placeholder="••••••••"
                error={errors.password}
                required
                disabled={loading}
              />

              {/* Link Esqueci minha senha */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  disabled={loading}
                >
                  Esqueci minha senha
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Botão Entrar */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                loading={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>

              {/* Link para Cadastro */}
              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  disabled={loading}
                >
                  Cadastre-se
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Credenciais de teste */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            🔐 Credenciais de teste:
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <strong>Admin:</strong> theostracke11@gmail.com
            </p>
            <p>
              <strong>Senha:</strong> SenhaForte123!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
