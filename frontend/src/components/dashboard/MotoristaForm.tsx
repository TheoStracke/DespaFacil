'use client'

import { useState, FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import motoristaService from '@/services/motorista.service'
import { maskCPF, unmaskCPF, validateCPF } from '@/lib/masks'
import type { MotoristaFormData } from '@/types'

interface MotoristaFormProps {
  onSuccess: () => void
}

export function MotoristaForm({ onSuccess }: MotoristaFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<MotoristaFormData>({
    nome: '',
    cpf: '',
    email: '',
    dataNascimento: '',
    sexo: 'M',
    identidade: '',
    orgaoEmissor: '',
    ufEmissor: 'SP',
    telefone: '',
    cursoTipo: 'TAC',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof MotoristaFormData, string>>>({})

  const handleChange = (field: keyof MotoristaFormData, value: string) => {
    // Aplicar máscara de CPF
    if (field === 'cpf') {
      value = maskCPF(value)
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof MotoristaFormData, string>> = {}
    let isValid = true

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
      isValid = false
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido'
      isValid = false
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório'
      isValid = false
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
      isValid = false
    }

    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória'
      isValid = false
    }

    if (!formData.identidade?.trim()) {
      newErrors.identidade = 'Identidade é obrigatória'
      isValid = false
    }

    if (!formData.orgaoEmissor?.trim()) {
      newErrors.orgaoEmissor = 'Órgão emissor é obrigatório'
      isValid = false
    }

    if (!formData.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
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
      // Preparar dados para envio
      const dataToSend: any = {
        nome: formData.nome.trim(),
        cpf: unmaskCPF(formData.cpf), // Remove máscara do CPF
        cursoTipo: formData.cursoTipo,
      }

      // Adicionar campos opcionais apenas se preenchidos
      if (formData.email?.trim()) {
        dataToSend.email = formData.email.trim()
      }

      if (formData.dataNascimento) {
        dataToSend.dataNascimento = formData.dataNascimento
      }

      if (formData.sexo) {
        dataToSend.sexo = formData.sexo
      }

      if (formData.identidade?.trim()) {
        dataToSend.identidade = formData.identidade.trim()
      }

      if (formData.orgaoEmissor?.trim()) {
        dataToSend.orgaoEmissor = formData.orgaoEmissor.trim()
      }

      if (formData.ufEmissor) {
        dataToSend.ufEmissor = formData.ufEmissor
      }

      if (formData.telefone?.trim()) {
        dataToSend.telefone = formData.telefone.trim()
      }

      console.log('📤 Dados sendo enviados:', dataToSend)
      console.log('📋 CPF sem máscara:', dataToSend.cpf)
      console.log('✅ CPF válido?', validateCPF(formData.cpf))

      await motoristaService.create(dataToSend)

      toast({
        type: 'success',
        title: 'Motorista cadastrado!',
        description: 'O motorista foi adicionado com sucesso',
      })

      // Resetar formulário
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        dataNascimento: '',
        sexo: 'M',
        identidade: '',
        orgaoEmissor: '',
        ufEmissor: 'SP',
        telefone: '',
        cursoTipo: 'TAC',
      })

      onSuccess()
    } catch (error: any) {
      console.error('❌ Erro ao cadastrar motorista:', error)
      console.error('📋 Resposta do servidor:', error.response?.data)
      console.error('📊 Status HTTP:', error.response?.status)
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Tente novamente'
      
      toast({
        type: 'error',
        title: 'Erro ao cadastrar',
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastrar Motorista
        </CardTitle>
        <CardDescription>
          Preencha os dados do motorista para cadastrá-lo no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <Input
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              error={errors.nome}
              required
              disabled={loading}
            />

            {/* CPF */}
            <Input
              label="CPF"
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
              error={errors.cpf}
              required
              disabled={loading}
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              error={errors.email}
              required
              disabled={loading}
            />

            {/* Data de Nascimento */}
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleChange('dataNascimento', e.target.value)}
              error={errors.dataNascimento}
              required
              disabled={loading}
            />

            {/* Sexo */}
            <Select
              label="Sexo"
              value={formData.sexo}
              onChange={(e) => handleChange('sexo', e.target.value)}
              required
              disabled={loading}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </Select>

            {/* Identidade */}
            <Input
              label="Identidade (RG)"
              value={formData.identidade}
              onChange={(e) => handleChange('identidade', e.target.value)}
              placeholder="00.000.000-0"
              error={errors.identidade}
              required
              disabled={loading}
            />

            {/* Órgão Emissor */}
            <Input
              label="Órgão Emissor"
              value={formData.orgaoEmissor}
              onChange={(e) => handleChange('orgaoEmissor', e.target.value)}
              placeholder="SSP"
              error={errors.orgaoEmissor}
              required
              disabled={loading}
            />

            {/* UF Emissor */}
            <Select
              label="UF Emissor"
              value={formData.ufEmissor}
              onChange={(e) => handleChange('ufEmissor', e.target.value)}
              required
              disabled={loading}
            >
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </Select>

            {/* Telefone */}
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
              error={errors.telefone}
              required
              disabled={loading}
            />

            {/* Curso */}
            <Select
              label="Tipo de Curso"
              value={formData.cursoTipo}
              onChange={(e) => handleChange('cursoTipo', e.target.value)}
              required
              disabled={loading}
            >
              <option value="TAC">TAC</option>
              <option value="RT">RT</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={loading} loading={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Motorista
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
