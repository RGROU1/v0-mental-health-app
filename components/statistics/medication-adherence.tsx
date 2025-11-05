"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface Medication {
  medication_name: string
  taken: boolean
  daily_check_ins: { check_in_date: string }
}

export function MedicationAdherence({ data }: { data: Medication[] }) {
  const taken = data.filter((m) => m.taken).length
  const missed = data.length - taken

  const chartData = [
    { name: "Tomado", value: taken, color: "#10b981" },
    { name: "Perdido", value: missed, color: "#ef4444" },
  ]

  // Group by medication name
  const medicationGroups = data.reduce(
    (acc, med) => {
      if (!acc[med.medication_name]) {
        acc[med.medication_name] = { total: 0, taken: 0 }
      }
      acc[med.medication_name].total++
      if (med.taken) acc[med.medication_name].taken++
      return acc
    },
    {} as Record<string, { total: number; taken: number }>,
  )

  return (
    <Card className="border-2 border-green-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Aderência Medicamentosa</CardTitle>
        <CardDescription>Acompanhe sua conformidade com medicamentos</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Aderência por Medicamento</h3>
              {Object.entries(medicationGroups).map(([name, stats]) => {
                const percentage = Math.round((stats.taken / stats.total) * 100)
                return (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="text-gray-600">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {stats.taken} de {stats.total} doses tomadas
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            <p>
              Nenhum dado de medicamento disponível ainda. Complete seu primeiro registro de medicamento para ver
              aderência!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
