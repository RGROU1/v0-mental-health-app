"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const workplaceExercises = [
  {
    id: 1,
    title: "Alongamento de Pescoço",
    description: "Alivie a tensão do pescoço e ombros",
    steps: [
      "Sente-se com a coluna reta",
      "Incline a cabeça para a direita, aproximando a orelha do ombro",
      "Segure por 15 segundos",
      "Repita do lado esquerdo",
      "Faça 3 repetições de cada lado",
    ],
    icon: "🦒",
    duration: "2 min",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 2,
    title: "Exercício para os Olhos",
    description: "Reduza a fadiga ocular da tela",
    steps: [
      "Olhe para um ponto distante (6 metros) por 20 segundos",
      "Pisque 10 vezes lentamente",
      "Faça movimentos circulares com os olhos (5x cada direção)",
      "Cubra os olhos com as palmas por 30 segundos",
      "Repita a cada 20 minutos de tela",
    ],
    icon: "👁️",
    duration: "2 min",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: 3,
    title: "Alongamento de Punhos",
    description: "Previna lesões por esforço repetitivo",
    steps: [
      "Estenda o braço à frente com a palma para cima",
      "Com a outra mão, puxe os dedos para baixo suavemente",
      "Segure por 15 segundos",
      "Repita com a palma para baixo",
      "Faça 3 repetições em cada braço",
    ],
    icon: "✋",
    duration: "3 min",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: 4,
    title: "Respiração Energizante",
    description: "Aumente o foco e a energia",
    steps: [
      "Sente-se confortavelmente com a coluna reta",
      "Inspire profundamente pelo nariz contando até 4",
      "Segure a respiração por 4 segundos",
      "Expire pela boca contando até 6",
      "Repita 5 vezes",
    ],
    icon: "💨",
    duration: "2 min",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 5,
    title: "Alongamento de Costas",
    description: "Alivie a tensão da postura sentada",
    steps: [
      "Fique em pé com os pés afastados na largura dos ombros",
      "Entrelace os dedos e estenda os braços acima da cabeça",
      "Incline-se suavemente para a direita",
      "Segure por 15 segundos",
      "Repita do lado esquerdo",
      "Faça 3 repetições de cada lado",
    ],
    icon: "🤸",
    duration: "3 min",
    color: "from-teal-400 to-blue-500",
  },
  {
    id: 6,
    title: "Rotação de Ombros",
    description: "Libere a tensão dos ombros",
    steps: [
      "Sente-se ou fique em pé com a postura ereta",
      "Levante os ombros em direção às orelhas",
      "Faça movimentos circulares para trás 10 vezes",
      "Faça movimentos circulares para frente 10 vezes",
      "Relaxe e respire profundamente",
    ],
    icon: "💪",
    duration: "2 min",
    color: "from-yellow-400 to-orange-500",
  },
]

export default function WorkplaceExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<(typeof workplaceExercises)[0] | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
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

  const startExercise = (exercise: (typeof workplaceExercises)[0]) => {
    setSelectedExercise(exercise)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleComplete = async () => {
    setShowConfetti(true)

    if (!userId) return

    const supabase = createClient()
    const coinsEarned = 15

    try {
      await supabase.from("games_played").insert({
        user_id: userId,
        game_type: "workplace",
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
    setCurrentStep(0)
    setShowConfetti(false)
  }

  if (showConfetti && selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-100">
        <ConfettiAnimation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Ótimo Trabalho!</h2>
            <p className="text-xl text-gray-700 mb-4">Você completou o exercício laboral</p>
            <p className="text-lg text-yellow-600 font-semibold mb-6">Ganhou 15 moedas! 💰</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={reset} className="bg-gradient-to-r from-blue-500 to-teal-600">
                Fazer Outro Exercício
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button onClick={reset} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-5xl">{selectedExercise.icon}</div>
                <div>
                  <CardTitle className="text-2xl">{selectedExercise.title}</CardTitle>
                  <CardDescription>
                    Passo {currentStep + 1} de {selectedExercise.steps.length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="py-8">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / selectedExercise.steps.length) * 100}%` }}
                  />
                </div>

                <div className="text-center mb-8">
                  <p className="text-2xl text-gray-700 leading-relaxed">{selectedExercise.steps[currentStep]}</p>
                </div>

                <div className="flex gap-4 justify-center">
                  {currentStep > 0 && (
                    <Button onClick={previousStep} variant="outline" size="lg">
                      Anterior
                    </Button>
                  )}
                  <Button
                    onClick={nextStep}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-teal-600 text-white px-8"
                  >
                    {currentStep < selectedExercise.steps.length - 1 ? "Próximo" : "Concluir"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💼</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Exercícios Laborais
          </h1>
          <p className="text-gray-600">Pausas ativas para melhorar sua saúde no trabalho</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workplaceExercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-teal-50 shadow-lg hover:shadow-xl transition-all"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`text-5xl bg-gradient-to-br ${exercise.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-md`}
                  >
                    {exercise.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription className="text-sm">{exercise.duration}</CardDescription>
                  </div>
                </div>
                <CardDescription className="text-base">{exercise.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startExercise(exercise)}
                  className={`w-full bg-gradient-to-r ${exercise.color} hover:opacity-90 text-white`}
                >
                  Começar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
