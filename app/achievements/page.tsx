import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Lock, Trophy } from "lucide-react"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch all achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("coins_reward", { ascending: false })

  // Fetch user's unlocked achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id)

  const unlockedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || [])

  // Fetch user coins
  const { data: coins } = await supabase.from("user_coins").select("*").eq("user_id", user.id).single()

  const unlockedCount = userAchievements?.length || 0
  const totalCount = allAchievements?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Conquistas
          </h1>
          <p className="text-gray-600">Acompanhe seu progresso e desbloqueie recompensas</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Desbloqueadas</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{unlockedCount}</p>
                  <p className="text-sm text-gray-500 mt-1">de {totalCount}</p>
                </div>
                <Trophy className="h-12 w-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Moedas</p>
                  <p className="text-4xl font-bold text-orange-600 mt-2">{coins?.total_coins || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">ganhas</p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progresso</p>
                  <p className="text-4xl font-bold text-amber-600 mt-2">
                    {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">completo</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allAchievements?.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id)
            const unlockedDate = userAchievements?.find((ua) => ua.achievement_id === achievement.id)?.unlocked_at

            return (
              <Card
                key={achievement.id}
                className={`border-2 shadow-lg transition-all ${
                  isUnlocked
                    ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl ${isUnlocked ? "" : "grayscale"}`}>{achievement.icon || "🏆"}</div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        {isUnlocked ? (
                          <Badge className="mt-1 bg-green-600">Desbloqueada</Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1">
                            <Lock className="h-3 w-3 mr-1" />
                            Bloqueada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">{achievement.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <span className="font-bold text-yellow-600">{achievement.coins_reward} moedas</span>
                    </div>
                    {isUnlocked && unlockedDate && (
                      <p className="text-xs text-gray-500">{new Date(unlockedDate).toLocaleDateString("pt-BR")}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
