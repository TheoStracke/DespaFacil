'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import authService from '@/services/auth.service'
import { getMe, updateMe } from '@/services/user.service'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    ;(async () => {
      try {
        const me = await getMe()
        setName(me.name || '')
        setEmail(me.email || '')
      } catch (err: any) {
        toast({ type: 'error', title: 'Erro', description: err.response?.data?.error || 'Falha ao carregar perfil' })
      } finally {
        setLoading(false)
      }
    })()
  }, [router, toast])

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateMe({ name, email })
      // Atualizar o user no localStorage também
      const current = authService.getUser()
      if (current) {
        const merged = { ...current, name: updated.name, email: updated.email }
        localStorage.setItem('user', JSON.stringify(merged))
      }
      toast({ type: 'success', title: 'Perfil atualizado' })
    } catch (err: any) {
      toast({ type: 'error', title: 'Erro', description: err.response?.data?.error || 'Falha ao salvar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Editar dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
