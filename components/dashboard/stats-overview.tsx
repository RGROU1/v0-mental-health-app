import { Card, CardContent } from "@/components/ui/card"

interface StatsOverviewProps {
  streak: number
  totalCheckIns: number
  coins: number
}

export function StatsOverview({ streak, totalCheckIns, coins }: StatsOverviewProps) {
  return (
    <>
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{streak}</p>
              <p className="text-sm text-gray-500 mt-1">dias seguidos</p>
            </div>
            <div className="text-5xl">🔥</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registros Totais</p>
              <p className="text-4xl font-bold text-teal-600 mt-2">{totalCheckIns}</p>
              <p className="text-sm text-gray-500 mt-1">completados</p>
            </div>
            <div className="text-5xl">✅</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moedas Ganhas</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{coins}</p>
              <p className="text-sm text-gray-500 mt-1">saldo total</p>
            </div>
            <div className="text-5xl">💰</div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
