"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InteractiveScale } from "@/components/check-in/interactive-scale"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

export default function LibidoCheckInPage() {
  const [libidoLevel, setLibidoLevel] = useState(5)
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

      await supabase.from("libido_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        libido_level: libidoLevel,
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
      console.error("Error saving libido log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Libido Check-in
          </h1>
          <p className="text-gray-600">Monitor your sexual health and wellness</p>
        </div>

        <Card className="border-2 border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Sexual Health Tracking</CardTitle>
            <CardDescription>
              Track your libido levels. This information is private and secure. Earn 10 coins for completing this
              section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Libido Level *</Label>
                  <InteractiveScale
                    value={libidoLevel}
                    onChange={setLibidoLevel}
                    min={1}
                    max={10}
                    color="from-pink-400 to-rose-500"
                    icon="❤️"
                    labels={[
                      { value: 1, label: "Very low" },
                      { value: 5, label: "Normal" },
                      { value: 10, label: "Very high" },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any observations or factors affecting your libido..."
                    className="border-pink-200"
                  />
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Privacy Note:</p>
                  <p>
                    Your sexual health data is completely private and encrypted. Only you can access this information
                    unless you explicitly choose to share it with a healthcare provider.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-lg py-6"
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
