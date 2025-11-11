'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCheck, FileClock, FileX } from 'lucide-react'

interface DocumentStatusChartProps {
  pendente: number
  aprovado: number
  negado: number
}

const COLORS = {
  pendente: '#f59e0b', // amber-500
  aprovado: '#22c55e', // green-500
  negado: '#ef4444',   // red-500
}

export function DocumentStatusChart({ pendente, aprovado, negado }: DocumentStatusChartProps) {
  const data = [
    { name: 'Pendente', value: pendente, icon: FileClock },
    { name: 'Aprovado', value: aprovado, icon: FileCheck },
    { name: 'Negado', value: negado, icon: FileX },
  ].filter(item => item.value > 0) // Só mostrar categorias com valores

  const total = pendente + aprovado + negado

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status dos Documentos</CardTitle>
          <CardDescription>Distribuição por status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Nenhum documento cadastrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status dos Documentos</CardTitle>
        <CardDescription>Distribuição por status ({total} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} documentos`, 'Quantidade']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legenda personalizada */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[item.name.toLowerCase() as keyof typeof COLORS] }}
                />
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                <span className="font-semibold ml-auto">{item.value}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
