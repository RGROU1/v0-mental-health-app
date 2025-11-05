"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, Pause } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

export default function BreathingGamePage() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)
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
    if (!isActive) return

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1

        if (phase === "inhale") {
          setPhase("hold")
          return 4
        } else if (phase === "hold") {
          setPhase("exhale")
          return 4
        } else {
          setPhase("inhale")
          setCycles((c) => c + 1)
          return 4
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, phase])

  useEffect(() => {
    if (cycles === 5 && isActive) {
      handleComplete()
    }
  }, [cycles, isActive])

  const handleComplete = async () => {
    setIsActive(false)
    setShowConfetti(true)

    if (!userId) return

    const supabase = createClient()
    const coinsEarned = 20

    try {
      await supabase.from("games_played").insert({
        user_id: userId,
        game_type: "breathing",
        score: 5,
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
      console.error("Error saving game:", error)
    }
  }

  const reset = () => {
    setIsActive(false)
    setPhase("inhale")
    setCount(4)
    setCycles(0)
    setShowConfetti(false)
  }

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-teal-400 to-cyan-500"
      case "hold":
        return "from-yellow-400 to-orange-500"
      case "exhale":
        return "from-blue-400 to-indigo-500"
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Inspire"
      case "hold":
        return "Segure"
      case "exhale":
        return "Expire"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🫁</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Exercício de Respiração
          </h1>
          <p className="text-gray-600">Complete 5 ciclos para ganhar moedas</p>
        </div>

        <Card className="border-2 border-teal-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Respiração 4-4-4</CardTitle>
            <CardDescription className="text-center">Ciclos completados: {cycles} / 5</CardDescription>
          </CardHeader>
          <CardContent>
            {cycles >= 5 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-600 mb-2">Muito Bem!</h2>
                <p className="text-xl text-gray-700 mb-4">Você completou 5 ciclos de respiração</p>
                <p className="text-lg text-yellow-600 font-semibold mb-6">Ganhou 20 moedas! 💰</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={reset} className="bg-gradient-to-r from-teal-500 to-cyan-600">
                    Começar Novamente
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/games">Voltar aos Jogos</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12">
                <div
                  className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl transition-all duration-1000 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                >
                  <div className="text-center text-white">
                    <p className="text-6xl font-bold mb-2">{count}</p>
                    <p className="text-2xl font-semibold">{getPhaseText()}</p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  {!isActive ? (
                    <Button
                      onClick={() => setIsActive(true)}
                      size="lg"
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Iniciar
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsActive(false)}
                      size="lg"
                      variant="outline"
                      className="border-2 border-teal-600 text-teal-700 px-8"
                    >
                      <Pause className="mr-2 h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={reset} size="lg" variant="outline">
                    Reiniciar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
