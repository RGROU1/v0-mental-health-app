"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InteractiveScale } from "@/components/check-in/interactive-scale"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

export default function ConcentrationCheckInPage() {
  const [concentrationLevel, setConcentrationLevel] = useState(5)
  const [focusDuration, setFocusDuration] = useState("")
  const [distractionsCount, setDistractionsCount] = useState("")
  const [notes, setNotes] = useState("")
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

      await supabase.from("concentration_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        concentration_level: concentrationLevel,
        focus_duration_minutes: focusDuration ? Number.parseInt(focusDuration) : null,
        distractions_count: distractionsCount ? Number.parseInt(distractionsCount) : null,
        notes,
      })

      const coinsEarned = 10
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
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error saving concentration log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Concentration Check-in
          </h1>
          <p className="text-gray-600">Assess your focus and attention</p>
        </div>

        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Focus & Attention Tracking</CardTitle>
            <CardDescription>
              Track your concentration and focus levels. Earn 10 coins for completing this section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Concentration Level *</Label>
                  <InteractiveScale
                    value={concentrationLevel}
                    onChange={setConcentrationLevel}
                    min={1}
                    max={10}
                    color="from-purple-400 to-violet-500"
                    icon="🎯"
                    labels={[
                      { value: 1, label: "Very distracted" },
                      { value: 5, label: "Moderate" },
                      { value: 10, label: "Highly focused" },
                    ]}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="duration">Longest Focus Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(e.target.value)}
                      placeholder="e.g., 45"
                      className="border-purple-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="distractions">Number of Distractions</Label>
                    <Input
                      id="distractions"
                      type="number"
                      min="0"
                      value={distractionsCount}
                      onChange={(e) => setDistractionsCount(e.target.value)}
                      placeholder="e.g., 5"
                      className="border-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What helped or hindered your concentration today..."
                    className="border-purple-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Complete & Earn 10 Coins 💰"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
