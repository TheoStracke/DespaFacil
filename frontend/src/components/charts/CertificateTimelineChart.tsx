'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

interface CertificateTimelineChartProps {
  data: Array<{
    data: string
    enviados: number
  }>
}

export function CertificateTimelineChart({ data }: CertificateTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificados Enviados - Timeline
          </CardTitle>
          <CardDescription>Evolução de envios ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Nenhum certificado enviado ainda
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" />
          Certificados Enviados - Timeline
        </CardTitle>
        <CardDescription>
          Evolução de envios ao longo do tempo ({data.reduce((acc, d) => acc + d.enviados, 0)} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value} certificados`, 'Enviados']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              formatter={() => 'Certificados Enviados'}
            />
            <Line 
              type="monotone" 
              dataKey="enviados" 
              stroke="#FF8601" 
              strokeWidth={2}
              dot={{ fill: '#FF8601', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Estatística rápida */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold text-primary">
              {data.reduce((acc, d) => acc + d.enviados, 0)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Média/Período</div>
            <div className="text-lg font-bold text-primary">
              {(data.reduce((acc, d) => acc + d.enviados, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Pico</div>
            <div className="text-lg font-bold text-primary">
              {Math.max(...data.map(d => d.enviados))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
