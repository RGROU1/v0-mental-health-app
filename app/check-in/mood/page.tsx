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

const moodDescriptors = [
  { emoji: "😠", label: "Irritabilidade" },
  { emoji: "😢", label: "Tristeza" },
  { emoji: "😟", label: "Preocupação" },
  { emoji: "😔", label: "Culpa" },
  { emoji: "😄", label: "Euforia" },
  { emoji: "😐", label: "Apatia" },
  { emoji: "😰", label: "Inquietação" },
]

export default function MoodCheckInPage() {
  const [moodScore, setMoodScore] = useState(8)
  const [anxietyLevel, setAnxietyLevel] = useState(8)
  const [selectedDescriptors, setSelectedDescriptors] = useState<string[]>([])
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

  const toggleDescriptor = (label: string) => {
    setSelectedDescriptors((prev) => (prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

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

      await supabase.from("mood_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        mood_score: moodScore,
        emotions: selectedDescriptors,
        energy_level: 5,
        stress_level: anxietyLevel,
        notes: selectedDescriptors.join(", "),
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
        router.push("/check-in/libido")
      }, 2000)
    } catch (error) {
      console.error("Error saving mood log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 mb-2">Seção 4 de 11</div>
          <div className="text-6xl mb-4">💗</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Humor e Ansiedade
          </h1>
          <p className="text-gray-600">Como você se sente emocionalmente?</p>
        </div>

        <Card className="border-2 border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Estado Emocional</CardTitle>
            <CardDescription>Ganhe +20 moedas ao completar!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Nível de Humor</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>😢 Muito baixo</span>
                      <span className="text-2xl font-bold text-pink-600">{moodScore}/15</span>
                      <span>😊 Muito bom</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={moodScore}
                      onChange={(e) => setMoodScore(Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-pink-200 to-pink-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((moodScore - 1) / 14) * 100}%, #fce7f3 ${((moodScore - 1) / 14) * 100}%, #fce7f3 100%)`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Nível de Ansiedade</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>😌 Muito calmo</span>
                      <span className="text-2xl font-bold text-rose-600">{anxietyLevel}/15</span>
                      <span>😰 Muito ansioso</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={anxietyLevel}
                      onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-rose-200 to-rose-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${((anxietyLevel - 1) / 14) * 100}%, #ffe4e6 ${((anxietyLevel - 1) / 14) * 100}%, #ffe4e6 100%)`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Descritores de Humor</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {moodDescriptors.map((descriptor) => (
                      <button
                        key={descriptor.label}
                        type="button"
                        onClick={() => toggleDescriptor(descriptor.label)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedDescriptors.includes(descriptor.label)
                            ? "border-pink-500 bg-pink-50"
                            : "border-gray-200 hover:border-pink-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{descriptor.emoji}</div>
                        <div className="text-xs font-medium">{descriptor.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-lg py-6"
                  disabled={isLoading}
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
