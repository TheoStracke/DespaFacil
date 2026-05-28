'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MiniSparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function MiniSparkline({ data, color = '#22c55e', height = 40 }: MiniSparklineProps) {
  // Converter array de números em formato esperado pelo Recharts
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
