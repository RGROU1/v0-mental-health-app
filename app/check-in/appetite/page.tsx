"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const appetiteLevels = [
  { emoji: "😔", label: "Diminuído", value: 3 },
  { emoji: "😊", label: "Normal", value: 5 },
  { emoji: "😋", label: "Aumentado", value: 8 },
]

const behaviorDescriptors = [
  { emoji: "🍔", label: "Comer Compulsivamente" },
  { emoji: "🙁", label: "Falta de Apetite" },
  { emoji: "🤰", label: "Estômago Cheio" },
  { emoji: "🤢", label: "Aversão à Comida" },
  { emoji: "🤤", label: "Desejos Intensos" },
]

export default function AppetiteCheckInPage() {
  const [appetiteLevel, setAppetiteLevel] = useState<number | null>(null)
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
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

  const toggleBehavior = (label: string) => {
    setSelectedBehaviors((prev) => (prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || appetiteLevel === null) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const today = new Date().toISOString().split("T")[0]

      let { data: checkIn } = await supabase
        .from("daily_check_ins")
        .select("*")
        .eq("user_id", userId)
        .eq("check_in_date", today)
        .single()

      if (!checkIn) {
        const { data: newCheckIn } = await supabase
          .from("daily_check_ins")
          .insert({
            user_id: userId,
            check_in_date: today,
            completed: false,
            coins_earned: 0,
          })
          .select()
          .single()
        checkIn = newCheckIn
      }

      await supabase.from("appetite_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        appetite_level: appetiteLevel,
        meals_count: 0,
        hydration_level: 5,
        notes: selectedBehaviors.join(", "),
      })

      const coinsEarned = 20
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

      setShowConfetti(true)
      setTimeout(() => {
        router.push("/check-in/mood")
      }, 2000)
    } catch (error) {
      console.error("Error saving appetite log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 mb-2">Seção 3 de 11</div>
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Apetite
          </h1>
          <p className="text-gray-600">Como está sua relação com a comida?</p>
        </div>

        <Card className="border-2 border-orange-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Nível de Apetite</CardTitle>
            <CardDescription>Ganhe +20 moedas ao completar!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Como está seu apetite?</Label>
                  <div className="flex justify-between gap-4">
                    {appetiteLevels.map((level) => (
                      <button
                        key={level.label}
                        type="button"
                        onClick={() => setAppetiteLevel(level.value)}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                          appetiteLevel === level.value
                            ? "border-orange-500 bg-orange-50 scale-105"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="text-5xl mb-3">{level.emoji}</div>
                        <div className="text-sm font-medium">{level.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Comportamentos Relacionados</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {behaviorDescriptors.map((behavior) => (
                      <button
                        key={behavior.label}
                        type="button"
                        onClick={() => toggleBehavior(behavior.label)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedBehaviors.includes(behavior.label)
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{behavior.emoji}</div>
                        <div className="text-xs font-medium">{behavior.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg py-6"
                  disabled={isLoading || appetiteLevel === null}
                >
                  {isLoading ? "Salvando..." : "Continuar 💰 +20"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
