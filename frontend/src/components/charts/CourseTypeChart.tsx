'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

interface CourseTypeChartProps {
  tac: number
  rt: number
}

const COLORS = {
  TAC: '#FF8601', // brand orange
  RT: '#010E9B',  // brand blue
}

export function CourseTypeChart({ tac, rt }: CourseTypeChartProps) {
  const data = [
    { name: 'TAC', value: tac, fullName: 'Treinamento de Atualização de Condutores' },
    { name: 'RT', value: rt, fullName: 'Reciclagem de Trânsito' },
  ]

  const total = tac + rt

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Motoristas por Curso
          </CardTitle>
          <CardDescription>Distribuição por tipo de curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            Nenhum motorista cadastrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Motoristas por Curso
        </CardTitle>
        <CardDescription>Distribuição por tipo de curso ({total} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} motoristas`,
                props.payload.fullName
              ]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legenda */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <div 
                className="w-3 h-3 rounded flex-shrink-0" 
                style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground truncate">{item.fullName}</div>
              </div>
              <div className="font-bold text-lg">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
