"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const mindfulnessExercises = [
  {
    id: 1,
    title: "Atenção Plena na Respiração",
    duration: 300, // 5 minutos
    description: "Foque sua atenção na respiração natural",
    instructions: [
      "Encontre uma posição confortável",
      "Feche os olhos suavemente",
      "Observe sua respiração natural, sem tentar mudá-la",
      "Note o ar entrando e saindo",
      "Quando sua mente divagar, gentilmente traga a atenção de volta à respiração",
      "Continue por 5 minutos",
    ],
    icon: "🌬️",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: 2,
    title: "Escaneamento Corporal",
    duration: 420, // 7 minutos
    description: "Consciência completa do corpo",
    instructions: [
      "Deite-se ou sente-se confortavelmente",
      "Comece pelos pés, observe as sensações",
      "Mova sua atenção lentamente pelas pernas",
      "Continue pelo abdômen, peito e costas",
      "Observe os braços, mãos e dedos",
      "Finalize com o pescoço, rosto e topo da cabeça",
      "Note todas as sensações sem julgamento",
    ],
    icon: "🧘",
    color: "from-purple-400 to-indigo-500",
  },
  {
    id: 3,
    title: "Meditação dos 5 Sentidos",
    duration: 240, // 4 minutos
    description: "Conecte-se com o momento presente",
    instructions: [
      "Identifique 5 coisas que você pode VER",
      "Identifique 4 coisas que você pode TOCAR",
      "Identifique 3 coisas que você pode OUVIR",
      "Identifique 2 coisas que você pode CHEIRAR",
      "Identifique 1 coisa que você pode SABOREAR",
      "Respire profundamente e agradeça pelo momento presente",
    ],
    icon: "👃",
    color: "from-green-400 to-teal-500",
  },
  {
    id: 4,
    title: "Meditação Loving-Kindness",
    duration: 360, // 6 minutos
    description: "Cultive compaixão por si e pelos outros",
    instructions: [
      "Sente-se confortavelmente e respire fundo",
      "Repita mentalmente: 'Que eu seja feliz'",
      "Repita: 'Que eu seja saudável'",
      "Repita: 'Que eu viva com tranquilidade'",
      "Agora pense em alguém querido e repita as frases para essa pessoa",
      "Expanda para todas as pessoas, desejando bem-estar a todos",
    ],
    icon: "💝",
    color: "from-pink-400 to-rose-500",
  },
]

export default function MindfulnessPage() {
  const [selectedExercise, setSelectedExercise] = useState<(typeof mindfulnessExercises)[0] | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUserId(user.id)
    }
    checkUser()
  }, [router])

  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, timeRemaining])

  const startExercise = (exercise: (typeof mindfulnessExercises)[0]) => {
    setSelectedExercise(exercise)
    setTimeRemaining(exercise.duration)
    setIsActive(true)
  }

  const handleComplete = async () => {
    setIsActive(false)
    setShowConfetti(true)

    if (!userId) return

    const supabase = createClient()
    const coinsEarned = 25

    try {
      await supabase.from("games_played").insert({
        user_id: userId,
        game_type: "mindfulness",
        score: selectedExercise?.id || 0,
        coins_earned: coinsEarned,
      })

      const { data: currentCoins } = await supabase.from("user_coins").select("*").eq("user_id", userId).single()

      if (currentCoins) {
        await supabase
          .from("user_coins")
          .update({
            total_coins: currentCoins.total_coins + coinsEarned,
            current_balance: currentCoins.current_balance + coinsEarned,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
    } catch (error) {
      console.error("Error saving exercise:", error)
    }
  }

  const reset = () => {
    setSelectedExercise(null)
    setIsActive(false)
    setTimeRemaining(0)
    setShowConfetti(false)
  }

  if (showConfetti && selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-100">
        <ConfettiAnimation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Mindfulness Completo!</h2>
            <p className="text-xl text-gray-700 mb-4">Você completou a prática de mindfulness</p>
            <p className="text-lg text-yellow-600 font-semibold mb-6">Ganhou 25 moedas! 💰</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={reset} className="bg-gradient-to-r from-purple-500 to-pink-600">
                Fazer Outra Prática
              </Button>
              <Button asChild variant="outline">
                <Link href="/games">Voltar aos Jogos</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button onClick={reset} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-5xl">{selectedExercise.icon}</div>
                <div>
                  <CardTitle className="text-2xl">{selectedExercise.title}</CardTitle>
                  <CardDescription>{selectedExercise.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mb-8">
                  <div className="text-5xl font-bold text-purple-600 mb-4">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all"
                      style={{
                        width: `${((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mb-8 text-left bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 text-purple-900">Instruções:</h3>
                  <ul className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-purple-600 font-bold">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4 justify-center">
                  {!isActive ? (
                    <Button
                      onClick={() => setIsActive(true)}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Iniciar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsActive(false)}
                      size="lg"
                      variant="outline"
                      className="border-2 border-purple-600 text-purple-700 px-8"
                    >
                      <Pause className="mr-2 h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧘‍♀️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Práticas de Mindfulness
          </h1>
          <p className="text-gray-600">Cultive a atenção plena e a consciência do momento presente</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mindfulnessExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`text-5xl bg-gradient-to-br ${exercise.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-md`}
                  >
                    {exercise.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{exercise.title}</CardTitle>
                    <CardDescription className="text-sm">{Math.floor(exercise.duration / 60)} minutos</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-base">{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startExercise(exercise)}
                  className={`w-full bg-gradient-to-r ${exercise.color} hover:opacity-90 text-white`}
                >
                  Começar Prática
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
