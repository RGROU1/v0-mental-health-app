"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface MoodLog {
  mood_score: number
  energy_level: number
  stress_level: number
  daily_check_ins: { check_in_date: string }
}

export function MoodChart({ data }: { data: MoodLog[] }) {
  const chartData = data.map((log) => ({
    date: new Date(log.daily_check_ins.check_in_date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    mood: log.mood_score,
    energy: log.energy_level,
    stress: log.stress_level,
  }))

  return (
    <Card className="border-2 border-yellow-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Tendências de Humor</CardTitle>
        <CardDescription>Acompanhe seus níveis de humor, energia e estresse ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorMood)"
                name="Humor"
              />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorEnergy)"
                name="Energia"
              />
              <Area
                type="monotone"
                dataKey="stress"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorStress)"
                name="Estresse"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>Nenhum dado de humor disponível ainda. Complete seu primeiro registro de humor para ver tendências!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
