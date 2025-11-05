import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StreakTrackerProps {
  currentStreak: number
  recentCheckIns: Array<{ check_in_date: string; completed: boolean }>
}

export function StreakTracker({ currentStreak, recentCheckIns }: StreakTrackerProps) {
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const checkInMap = new Map(recentCheckIns.map((ci) => [ci.check_in_date, ci.completed]))

  return (
    <Card className="mt-6 border-2 border-indigo-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span>🔥</span>
          Sua Sequência de 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2">
          {last7Days.map((date) => {
            const dayName = new Date(date).toLocaleDateString("pt-BR", { weekday: "short" })
            const isCompleted = checkInMap.get(date) === true
            const isToday = date === new Date().toISOString().split("T")[0]

            return (
              <div key={date} className="flex-1 text-center">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-2xl mb-2 transition-all ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg scale-105"
                      : isToday
                        ? "bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-400"
                        : "bg-gray-100"
                  }`}
                >
                  {isCompleted ? "✓" : isToday ? "📅" : ""}
                </div>
                <p className={`text-xs font-medium ${isToday ? "text-teal-600 font-bold" : "text-gray-600"}`}>
                  {dayName}
                </p>
              </div>
            )
          })}
        </div>
        {currentStreak > 0 && (
          <p className="text-center mt-4 text-sm text-gray-600">
            Continue assim! Você está em uma{" "}
            <span className="font-bold text-orange-600">sequência de {currentStreak} dias</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
