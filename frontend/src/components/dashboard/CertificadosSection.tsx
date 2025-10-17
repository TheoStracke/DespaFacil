'use client'

import { useEffect, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import certificadoService, { Certificado } from '@/services/certificado.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'


export function CertificadosSection() {
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [cpfFilter, setCpfFilter] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [filtered, setFiltered] = useState<Certificado[]>([])

  useEffect(() => {
    loadCertificados()
  }, [])

  useEffect(() => {
    let result = certificados
    if (cpfFilter) {
      result = result.filter(c => c.motorista.cpf.replace(/\D/g, '').includes(cpfFilter.replace(/\D/g, '')))
    }
    if (dateStart) {
      result = result.filter(c => c.enviadoEm.slice(0, 10) >= dateStart)
    }
    if (dateEnd) {
      result = result.filter(c => c.enviadoEm.slice(0, 10) <= dateEnd)
    }
    setFiltered(result)
  }, [certificados, cpfFilter, dateStart, dateEnd])

  const loadCertificados = async () => {
    try {
      setLoading(true)
      const data = await certificadoService.getAll()
      setCertificados(data)
    } catch (error) {
      console.error('Erro ao carregar certificados:', error)
      alert('Erro ao carregar certificados. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (certificado: Certificado) => {
    try {
      setDownloading(certificado.id)
      const blob = await certificadoService.download(certificado.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = certificado.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      await loadCertificados()
    } catch (error) {
      console.error('Erro ao baixar certificado:', error)
      alert('Erro ao baixar certificado. Tente novamente.')
    } finally {
      setDownloading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificados
          </CardTitle>
          <CardDescription>Certificados enviados pela administração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-lg md:text-xl">Certificados Disponíveis</CardTitle>
          </div>
          <CardDescription className="text-sm">
            {filtered.length} {filtered.length === 1 ? 'certificado' : 'certificados'} disponível{filtered.length !== 1 ? 'is' : ''}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-xs text-muted-foreground mb-2 font-medium">Filtros de pesquisa</label>
          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">CPF do motorista</span>
              <Input
                placeholder="Buscar por CPF"
                value={cpfFilter}
                onChange={e => setCpfFilter(e.target.value)}
                className="max-w-xs"
                type="text"
                inputMode="numeric"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Data início do período</span>
              <Input
                placeholder="Data início"
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="max-w-xs"
                type="date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Data fim do período</span>
              <Input
                placeholder="Data fim"
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="max-w-xs"
                type="date"
              />
            </div>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md bg-muted/40">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum certificado encontrado</p>
            <p className="text-sm mt-1">Ajuste os filtros ou aguarde o envio de certificados</p>
          </div>
        ) : (
        <div className="divide-y divide-border rounded-md bg-muted/40 border">
          {filtered.map((cert, idx) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex items-center justify-between py-3 px-2 md:px-4">
                <div className="flex flex-col">
                  <span className="font-medium text-base truncate">{cert.motorista.nome}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(cert.enviadoEm)}</span>
                </div>
                <Button
                  onClick={() => handleDownload(cert)}
                  disabled={downloading === cert.id}
                  size="sm"
                  className="ml-4"
                >
                  {downloading === cert.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
