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

const sleepDescriptors = [
  { emoji: "😴", label: "Sono Leve" },
  { emoji: "😵", label: "Interrompido" },
  { emoji: "😰", label: "Pesadelos" },
  { emoji: "😫", label: "Insônia" },
  { emoji: "😊", label: "Reparador" },
  { emoji: "🌙", label: "Difícil Adormecer" },
]

const sleepFeelings = [
  { emoji: "😫", label: "Péssimo" },
  { emoji: "😕", label: "Ruim" },
  { emoji: "😐", label: "Ok" },
  { emoji: "🙂", label: "Bom" },
  { emoji: "😊", label: "Ótimo" },
]

export default function SleepCheckInPage() {
  const [bedTime, setBedTime] = useState("22:00")
  const [wakeTime, setWakeTime] = useState("07:00")
  const [sleepFeeling, setSleepFeeling] = useState<string>("")
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

  const calculateSleepHours = () => {
    const bed = new Date(`2000-01-01T${bedTime}`)
    let wake = new Date(`2000-01-01T${wakeTime}`)

    if (wake < bed) {
      wake = new Date(`2000-01-02T${wakeTime}`)
    }

    const diff = wake.getTime() - bed.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}min`
  }

  const toggleDescriptor = (label: string) => {
    setSelectedDescriptors((prev) => (prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !sleepFeeling) return

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

      const bed = new Date(`2000-01-01T${bedTime}`)
      let wake = new Date(`2000-01-01T${wakeTime}`)
      if (wake < bed) wake = new Date(`2000-01-02T${wakeTime}`)
      const hoursSlept = (wake.getTime() - bed.getTime()) / (1000 * 60 * 60)

      await supabase.from("sleep_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        hours_slept: hoursSlept,
        sleep_quality: sleepFeelings.findIndex((f) => f.label === sleepFeeling) + 1,
        dreams: selectedDescriptors.includes("Reparador"),
        nightmares: selectedDescriptors.includes("Pesadelos"),
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
        router.push("/check-in/appetite")
      }, 2000)
    } catch (error) {
      console.error("Error saving sleep log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 mb-2">Seção 2 de 11</div>
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sono
          </h1>
          <p className="text-gray-600">Como você dormiu?</p>
        </div>

        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Período de Sono</CardTitle>
            <CardDescription>Ganhe +20 moedas ao completar!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bedTime" className="text-lg font-semibold">
                      Dormi às
                    </Label>
                    <input
                      id="bedTime"
                      type="time"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                      className="w-full mt-2 px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wakeTime" className="text-lg font-semibold">
                      Acordei às
                    </Label>
                    <input
                      id="wakeTime"
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full mt-2 px-4 py-3 text-lg border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">Total de sono</div>
                  <div className="text-3xl font-bold text-blue-600">{calculateSleepHours()}</div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Como me sinto em relação ao meu sono</Label>
                  <div className="flex justify-between gap-2">
                    {sleepFeelings.map((feeling) => (
                      <button
                        key={feeling.label}
                        type="button"
                        onClick={() => setSleepFeeling(feeling.label)}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          sleepFeeling === feeling.label
                            ? "border-blue-500 bg-blue-50 scale-110"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-4xl mb-2">{feeling.emoji}</div>
                        <div className="text-xs text-gray-600">{feeling.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Descritores do Sono</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sleepDescriptors.map((descriptor) => (
                      <button
                        key={descriptor.label}
                        type="button"
                        onClick={() => toggleDescriptor(descriptor.label)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedDescriptors.includes(descriptor.label)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{descriptor.emoji}</div>
                        <div className="text-sm font-medium">{descriptor.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg py-6"
                  disabled={isLoading || !sleepFeeling}
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
