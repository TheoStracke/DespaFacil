'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import { getStatus } from '@/services/parceiro.service'
import { maskCNPJ, unmaskCNPJ, validateCNPJ } from '@/lib/masks'
import { SolicitarParceiraModal } from '@/components/SolicitarParceiraModal'

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnpj: '',
    telefone: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    // Aplicar máscara de CNPJ
    if (field === 'cnpj') {
      value = maskCNPJ(value)
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Senha deve ter no mínimo 8 caracteres'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra maiúscula'
    }
    if (!/[a-z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra minúscula'
    }
    if (!/[0-9]/.test(password)) {
      return 'Senha deve conter pelo menos um número'
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)'
    }
    return null
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
      isValid = false
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
      isValid = false
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
      isValid = false
    }

    // CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório'
      isValid = false
    } else {
      const cnpjClean = unmaskCNPJ(formData.cnpj)
      if (cnpjClean.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos'
        isValid = false
      }
      // TODO: Reativar validação de CNPJ após verificar algoritmo
      // } else if (!validateCNPJ(formData.cnpj)) {
      //   newErrors.cnpj = 'CNPJ inválido'
      //   isValid = false
      // }
    }

    // Senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
      isValid = false
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        newErrors.password = passwordError
        isValid = false
      }
    }

    // Confirmar senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

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
      // Checar status de parceiro antes de registrar
      const cnpjClean = unmaskCNPJ(formData.cnpj)
      try {
        const status = await getStatus(cnpjClean)
        if (!status.canRegister) {
          setLoading(false)
          if (status.status === 'LEAD') {
            toast({ type: 'warning', title: 'Aguardando aprovação', description: 'Seu CNPJ está em análise. Aguarde a aprovação antes de se cadastrar.' })
          } else if (status.status === 'REJEITADO') {
            toast({ type: 'error', title: 'CNPJ rejeitado', description: 'Sua solicitação foi rejeitada. Você poderá solicitar novamente após 24 horas.' })
          } else {
            // CNPJ não é parceiro - abrir modal para solicitar
            toast({ type: 'info', title: 'CNPJ não aprovado', description: 'Envie uma solicitação de parceria para continuar.' })
            setShowModal(true)
          }
          return
        }
      } catch {}

      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cnpj: cnpjClean,
        telefone: formData.telefone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }

      console.log('📤 Dados de cadastro:', dataToSend)

      await authService.register(dataToSend)

      toast({
        type: 'success',
        title: 'Cadastro realizado!',
        description: 'Sua conta foi criada com sucesso. Faça login para continuar.',
      })

      // Aguardar 2 segundos para mostrar o toast antes de redirecionar
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar:', error)
      console.error('📋 Resposta do servidor:', error.response?.data)
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro ao criar conta. Tente novamente.'
      
      toast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*]/.test(password)) score++

    if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500' }
    if (score <= 3) return { score, label: 'Média', color: 'bg-yellow-500' }
    if (score <= 4) return { score, label: 'Boa', color: 'bg-blue-500' }
    return { score, label: 'Forte', color: 'bg-green-500' }
  }

  const strength = formData.password ? passwordStrength(formData.password) : null

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/ui/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <img src="/ui/logo.png" alt="Logo" width="120" height="120" className="object-contain" />
          </motion.div>
          <h1 className="text-3xl font-bold text-brand-orange">Criar Conta</h1>
          <p className="text-muted-foreground mt-2">
            Cadastre-se para gerenciar motoristas e documentos
          </p>
        </div>

        {/* Card de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Despachante</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <Input
                label="Nome Completo"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="João da Silva"
                error={errors.name}
                required
                disabled={loading}
              />

              {/* Email */}
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seuemail@exemplo.com"
                error={errors.email}
                required
                disabled={loading}
              />

              {/* CNPJ (apenas CNPJ, não aceita email) */}
              <Input
                label="CNPJ"
                value={formData.cnpj}
                onChange={(e) => {
                  // Permitir apenas números e máscara de CNPJ
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  // Limitar a 14 dígitos
                  if (onlyNumbers.length <= 14) {
                    handleChange('cnpj', e.target.value);
                  }
                }}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj}
                required
                disabled={loading}
                inputMode="numeric"
                pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                maxLength={18}
                autoComplete="off"
              />

              {/* Telefone */}
              <Input
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                error={errors.telefone}
                required
                disabled={loading}
              />

              {/* Senha */}
              <div>
                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    error={errors.password}
                    required
                    disabled={loading}
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
                
                {/* Indicador de força da senha */}
                {formData.password && strength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${(strength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{strength.label}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {formData.password.length >= 8 ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Letras maiúsculas e minúsculas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[0-9]/.test(formData.password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Pelo menos um número</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[!@#$%^&*]/.test(formData.password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span>Caractere especial (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="relative">
                <Input
                  label="Confirmar Senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[2.65rem] text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Botão de Cadastro */}
              <Button type="submit" className="w-full" disabled={loading} loading={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Conta
              </Button>

              {/* Link para Login */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Faça login
                </Link>
              </div>

              {/* Voltar */}
              <Link href="/">
                <Button type="button" variant="ghost" className="w-full" disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Home
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="/termos-de-uso" className="text-blue-600 hover:text-blue-800 underline">
            Termos de Uso
          </Link>
          {' '}e{' '}
          <Link href="/politica-de-privacidade" className="text-blue-600 hover:text-blue-800 underline">
            Política de Privacidade
          </Link>
        </p>
      </motion.div>

      {/* Modal de Solicitação de Parceria */}
      <SolicitarParceiraModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        formData={formData}
      />
    </div>
  )
}
