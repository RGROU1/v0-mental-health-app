import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function GamesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch games played count
  const { count: gamesPlayed } = await supabase
    .from("games_played")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch total coins earned from games
  const { data: gameStats } = await supabase.from("games_played").select("coins_earned").eq("user_id", user.id)

  const totalCoinsFromGames = gameStats?.reduce((sum, game) => sum + (game.coins_earned || 0), 0) || 0

  const games = [
    {
      id: "memory",
      title: "Jogo da Memória",
      description: "Combine pares de cartas para melhorar a memória e ganhar moedas",
      icon: "🧠",
      color: "from-blue-400 to-indigo-500",
      borderColor: "border-blue-200",
      bgColor: "from-blue-50 to-indigo-50",
      route: "/games/memory",
    },
    {
      id: "breathing",
      title: "Exercício de Respiração",
      description: "Respiração guiada para reduzir estresse e ansiedade",
      icon: "🫁",
      color: "from-teal-400 to-cyan-500",
      borderColor: "border-teal-200",
      bgColor: "from-teal-50 to-cyan-50",
      route: "/games/breathing",
    },
    {
      id: "relaxation",
      title: "Atividades de Relaxamento",
      description: "Exercícios guiados de relaxamento muscular e visualização",
      icon: "🧘",
      color: "from-purple-400 to-pink-500",
      borderColor: "border-purple-200",
      bgColor: "from-purple-50 to-pink-50",
      route: "/games/relaxation",
    },
    {
      id: "workplace",
      title: "Exercícios Laborais",
      description: "Pausas ativas para melhorar sua saúde no trabalho",
      icon: "💼",
      color: "from-green-400 to-emerald-500",
      borderColor: "border-green-200",
      bgColor: "from-green-50 to-emerald-50",
      route: "/games/workplace",
    },
    {
      id: "mindfulness",
      title: "Práticas de Mindfulness",
      description: "Cultive a atenção plena e a consciência do momento presente",
      icon: "🧘‍♀️",
      color: "from-cyan-400 to-blue-500",
      borderColor: "border-cyan-200",
      bgColor: "from-cyan-50 to-blue-50",
      route: "/games/mindfulness",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Jogos de Bem-Estar
          </h1>
          <p className="text-gray-600">Jogue para relaxar, aprender e ganhar recompensas</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jogos Jogados</p>
                  <p className="text-4xl font-bold text-indigo-600 mt-2">{gamesPlayed || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">sessões totais</p>
                </div>
                <div className="text-5xl">🎯</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Moedas de Jogos</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{totalCoinsFromGames}</p>
                  <p className="text-sm text-gray-500 mt-1">ganhas</p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card
              key={game.id}
              className={`border-2 ${game.borderColor} bg-gradient-to-br ${game.bgColor} shadow-lg hover:shadow-xl transition-all`}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`text-5xl bg-gradient-to-br ${game.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-md`}
                  >
                    {game.icon}
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                </div>
                <CardDescription className="text-base">{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white`}>
                  <Link href={game.route}>Jogar Agora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
