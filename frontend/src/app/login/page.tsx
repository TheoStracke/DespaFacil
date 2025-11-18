'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Image from 'next/image'
import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import authService from '@/services/auth.service'
import { maskCNPJ, validateCNPJ, unmaskCNPJ } from '@/lib/masks'
 

export default function LoginPage() {
  const router = useRouter()
  
  // Modo Manutenção controlado por variável de ambiente
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  
  const [cnpj, setCnpj] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ cnpj: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  

  // Aplicar máscara ao digitar CNPJ (se for email, não aplica máscara)
  const handleCnpjChange = (value: string) => {
    // Se contém @ é email, não aplica máscara
    if (value.includes('@')) {
      setCnpj(value)
    } else {
      // Se não contém @, aplica máscara de CNPJ
      setCnpj(maskCNPJ(value))
    }
    if (errors.cnpj) {
      setErrors(prev => ({ ...prev, cnpj: '' }))
    }
  }

  // Validação dos campos
  const validate = (): boolean => {
    const newErrors = { cnpj: '', password: '' }
    let isValid = true

    // Validar CNPJ ou Email
    if (!cnpj.trim()) {
      newErrors.cnpj = 'CNPJ ou Email é obrigatório'
      isValid = false
    } else {
      const value = cnpj.replace(/\D/g, "");
      // Se tem 14 dígitos, é CNPJ - validar apenas o formato
      if (value.length === 14) {
        // Apenas valida se tem 14 dígitos, não valida algoritmo para permitir CNPJs de teste
        // if (!validateCNPJ(cnpj)) {
        //   newErrors.cnpj = 'CNPJ inválido'
        //   isValid = false;
        // }
      } else if (!cnpj.includes('@')) {
        // Se não tem 14 dígitos e não tem @, é inválido
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos ou informe um email válido'
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
    
    // Bloquear login durante manutenção
    if (maintenanceMode) {
      toast.error('Sistema em manutenção. Login temporariamente indisponível.')
      return
    }

    if (!validate()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)

    try {
      // Se contém @, é email, senão remove máscara do CNPJ
      const emailOrCnpj = cnpj.includes('@') ? cnpj : unmaskCNPJ(cnpj)

      await authService.login({
        emailOrCnpj,
        password,
      })

      toast.success('Login realizado! Bem-vindo de volta.')
      // Redirecionar diretamente para o dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro no login:', error)
      // Mostra mensagem detalhada do backend, seja 'error' ou 'message'
      const backendMsg = error.response?.data?.error || error.response?.data?.message;
      toast.error(backendMsg || 'Credenciais inválidas. Verifique seus dados e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/ui/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Banner de Manutenção */}
      {maintenanceMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-4 relative z-10"
        >
          <div className="bg-yellow-500 text-yellow-900 px-6 py-4 rounded-lg shadow-lg border-2 border-yellow-600">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-lg">Sistema em Manutenção</p>
                <p className="text-sm">Login temporariamente indisponível. Tente novamente em breve.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <Image src="/ui/logo.png" alt="Logo" width={400} height={400} className="object-contain" priority />
            </motion.div>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Campo CNPJ ou Email */}
              <Input
                label="Email ou CNPJ"
                type="text"
                value={cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="email@exemplo.com ou 00.000.000/0000-00"
                error={errors.cnpj}
                required
                disabled={maintenanceMode || loading}
                autoFocus
                autoComplete="username"
              />

              {/* Campo Senha */}
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
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
                  disabled={maintenanceMode || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[2.65rem] text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Link Esqueci minha senha */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  disabled={loading}
                  onClick={() => router.push('/forgot-password')}
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
                disabled={maintenanceMode || loading}
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
                  onClick={() => maintenanceMode ? toast.error('Cadastro temporariamente indisponível durante manutenção.') : router.push('/register')}
                  className={maintenanceMode ? "text-gray-400 font-medium cursor-not-allowed" : "text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"}
                  disabled={maintenanceMode || loading}
                >
                  Cadastre-se
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
        <motion.div
          
        >
          
        </motion.div>
      </motion.div>
    </div>
  )
}