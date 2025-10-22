import { useEffect, useState } from 'react'
import documentoService from '@/services/documento.service'
import api from '@/lib/api'

interface NotificationCounts {
  documentosPendentes: number
  solicitacoesPendentes: number
  loading: boolean
}

export function useNotifications(isAdmin: boolean) {
  const [counts, setCounts] = useState<NotificationCounts>({
    documentosPendentes: 0,
    solicitacoesPendentes: 0,
    loading: true,
  })

  const fetchCounts = async () => {
    if (!isAdmin) {
      setCounts({
        documentosPendentes: 0,
        solicitacoesPendentes: 0,
        loading: false,
      })
      return
    }

    try {
      // Buscar documentos pendentes
      const docsResponse = await documentoService.getAllAdmin({ status: 'PENDENTE' })
      const documentosPendentes = docsResponse.documentos?.length || 0

      // Buscar solicitações pendentes
      let solicitacoesPendentes = 0
      try {
        const solicitacoesResponse = await api.get('/parceiros/solicitacoes')
        const solicitacoes = solicitacoesResponse.data || []
        solicitacoesPendentes = solicitacoes.filter((s: any) => s.status === 'PENDENTE').length
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error)
      }

      setCounts({
        documentosPendentes,
        solicitacoesPendentes,
        loading: false,
      })
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
      setCounts({
        documentosPendentes: 0,
        solicitacoesPendentes: 0,
        loading: false,
      })
    }
  }

  useEffect(() => {
    fetchCounts()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchCounts, 30000)
    
    return () => clearInterval(interval)
  }, [isAdmin])

  return { ...counts, refresh: fetchCounts }
}
