"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause, SkipForward } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const relaxationExercises = [
  {
    id: 1,
    title: "Relaxamento Muscular Progressivo",
    duration: 300, // 5 minutos
    steps: [
      "Sente-se confortavelmente e feche os olhos",
      "Tensione os músculos dos pés por 5 segundos, depois relaxe",
      "Tensione as panturrilhas por 5 segundos, depois relaxe",
      "Tensione as coxas por 5 segundos, depois relaxe",
      "Tensione o abdômen por 5 segundos, depois relaxe",
      "Tensione os braços por 5 segundos, depois relaxe",
      "Tensione os ombros por 5 segundos, depois relaxe",
      "Tensione o rosto por 5 segundos, depois relaxe",
      "Respire profundamente e sinta todo o corpo relaxado",
    ],
    icon: "💆",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: 2,
    title: "Visualização Guiada",
    duration: 240, // 4 minutos
    steps: [
      "Feche os olhos e respire profundamente",
      "Imagine um lugar tranquilo e seguro",
      "Visualize os detalhes: cores, sons, aromas",
      "Sinta a paz deste lugar envolvendo você",
      "Permita-se estar completamente presente",
      "Absorva a energia positiva do ambiente",
      "Quando estiver pronto, abra os olhos lentamente",
    ],
    icon: "🌅",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 3,
    title: "Meditação de Gratidão",
    duration: 180, // 3 minutos
    steps: [
      "Sente-se confortavelmente e respire fundo",
      "Pense em 3 coisas pelas quais você é grato hoje",
      "Sinta a gratidão preenchendo seu coração",
      "Agradeça por sua saúde e bem-estar",
      "Agradeça pelas pessoas em sua vida",
      "Agradeça pelas oportunidades que você tem",
      "Respire profundamente e sorria",
    ],
    icon: "🙏",
    color: "from-green-400 to-teal-500",
  },
]

export default function RelaxationPage() {
  const [selectedExercise, setSelectedExercise] = useState<(typeof relaxationExercises)[0] | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
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
    if (!isActive || !selectedExercise) return

    const stepDuration = selectedExercise.duration / selectedExercise.steps.length

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (currentStep < selectedExercise.steps.length - 1) {
            setCurrentStep((s) => s + 1)
            return stepDuration
          } else {
            handleComplete()
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, currentStep, selectedExercise])

  const startExercise = (exercise: (typeof relaxationExercises)[0]) => {
    setSelectedExercise(exercise)
    setCurrentStep(0)
    setTimeRemaining(exercise.duration / exercise.steps.length)
    setIsActive(true)
  }

  const handleComplete = async () => {
    setIsActive(false)
    setShowConfetti(true)

    if (!userId) return

    const supabase = createClient()
    const coinsEarned = 30

    try {
      await supabase.from("games_played").insert({
        user_id: userId,
        game_type: "relaxation",
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

  const nextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep((s) => s + 1)
      setTimeRemaining(selectedExercise.duration / selectedExercise.steps.length)
    }
  }

  const reset = () => {
    setSelectedExercise(null)
    setCurrentStep(0)
    setIsActive(false)
    setTimeRemaining(0)
    setShowConfetti(false)
  }

  if (showConfetti && selectedExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-100">
        <ConfettiAnimation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">Parabéns!</h2>
            <p className="text-xl text-gray-700 mb-4">Você completou o exercício de relaxamento</p>
            <p className="text-lg text-yellow-600 font-semibold mb-6">Ganhou 30 moedas! 💰</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={reset} className="bg-gradient-to-r from-purple-500 to-pink-600">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-100">
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
                  <CardDescription>
                    Passo {currentStep + 1} de {selectedExercise.steps.length}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mb-8">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentStep + 1) / selectedExercise.steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-2xl text-gray-700 mb-8 leading-relaxed">{selectedExercise.steps[currentStep]}</p>

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
                    <>
                      <Button
                        onClick={() => setIsActive(false)}
                        size="lg"
                        variant="outline"
                        className="border-2 border-purple-600 text-purple-700 px-8"
                      >
                        <Pause className="mr-2 h-5 w-5" />
                        Pausar
                      </Button>
                      <Button onClick={nextStep} size="lg" variant="outline">
                        <SkipForward className="mr-2 h-5 w-5" />
                        Próximo
                      </Button>
                    </>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Atividades de Relaxamento
          </h1>
          <p className="text-gray-600">Escolha um exercício guiado para relaxar e reduzir o estresse</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relaxationExercises.map((exercise) => (
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
                  <CardTitle className="text-xl">{exercise.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Duração: {Math.floor(exercise.duration / 60)} minutos
                </CardDescription>
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
