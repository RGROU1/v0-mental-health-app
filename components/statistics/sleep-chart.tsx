"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface SleepLog {
  hours_slept: string
  sleep_quality: number
  daily_check_ins: { check_in_date: string }
}

export function SleepChart({ data }: { data: SleepLog[] }) {
  const chartData = data.map((log) => ({
    date: new Date(log.daily_check_ins.check_in_date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    hours: Number.parseFloat(log.hours_slept),
    quality: log.sleep_quality,
  }))

  return (
    <Card className="border-2 border-blue-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Padrões de Sono</CardTitle>
        <CardDescription>Monitore a duração e qualidade do seu sono</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" domain={[0, 12]} />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Horas Dormidas" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="quality" fill="#8b5cf6" name="Qualidade do Sono" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>Nenhum dado de sono disponível ainda. Complete seu primeiro registro de sono para ver padrões!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
