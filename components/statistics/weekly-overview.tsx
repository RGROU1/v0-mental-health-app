"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WeeklyOverviewProps {
  moodData: any[]
  sleepData: any[]
  medicationData: any[]
}

export function WeeklyOverview({ moodData, sleepData, medicationData }: WeeklyOverviewProps) {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const weeklyData = last7Days.map((date) => {
    const mood = moodData.find((m) => m.daily_check_ins.check_in_date === date)
    const sleep = sleepData.find((s) => s.daily_check_ins.check_in_date === date)
    const meds = medicationData.filter((m) => m.daily_check_ins.check_in_date === date)

    return {
      date,
      dayName: new Date(date).toLocaleDateString("pt-BR", { weekday: "short" }),
      mood: mood?.mood_score || null,
      sleep: sleep ? Number.parseFloat(sleep.hours_slept) : null,
      medsTaken: meds.length > 0 ? meds.filter((m) => m.taken).length : null,
      medsTotal: meds.length || null,
    }
  })

  return (
    <Card className="border-2 border-indigo-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Visão Geral Semanal</CardTitle>
        <CardDescription>Suas métricas de saúde dos últimos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weeklyData.map((day) => (
            <Card key={day.date} className="border border-indigo-100 bg-indigo-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{day.dayName}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  {day.mood === null && day.sleep === null && day.medsTaken === null && (
                    <span className="text-sm text-gray-500 italic">Sem dados</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-gray-600 mb-1">Humor</p>
                    <p className="text-2xl font-bold text-yellow-600">{day.mood !== null ? day.mood : "-"}</p>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Sono</p>
                    <p className="text-2xl font-bold text-blue-600">{day.sleep !== null ? `${day.sleep}h` : "-"}</p>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Meds</p>
                    <p className="text-2xl font-bold text-green-600">
                      {day.medsTaken !== null ? `${day.medsTaken}/${day.medsTotal}` : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
