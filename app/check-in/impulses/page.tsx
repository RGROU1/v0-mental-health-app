"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InteractiveScale } from "@/components/check-in/interactive-scale"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

const impulseTypes = ["Shopping", "Eating", "Substance use", "Self-harm", "Risky behavior", "Anger outbursts", "Other"]

export default function ImpulsesCheckInPage() {
  const [impulseControlLevel, setImpulseControlLevel] = useState(5)
  const [selectedImpulses, setSelectedImpulses] = useState<string[]>([])
  const [actedOnImpulse, setActedOnImpulse] = useState(false)
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

  const toggleImpulse = (impulse: string) => {
    setSelectedImpulses((prev) => (prev.includes(impulse) ? prev.filter((i) => i !== impulse) : [...prev, impulse]))
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

      await supabase.from("impulse_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        impulse_control_level: impulseControlLevel,
        impulse_types: selectedImpulses,
        acted_on_impulse: actedOnImpulse,
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
      console.error("Error saving impulse log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Impulses Check-in
          </h1>
          <p className="text-gray-600">Track impulse control and urges</p>
        </div>

        <Card className="border-2 border-amber-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Impulse Control Tracking</CardTitle>
            <CardDescription>
              Monitor your impulse control and identify patterns. Earn 10 coins for completing this section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Impulse Control Level *</Label>
                  <InteractiveScale
                    value={impulseControlLevel}
                    onChange={setImpulseControlLevel}
                    min={1}
                    max={10}
                    color="from-amber-400 to-orange-500"
                    icon="⚡"
                    labels={[
                      { value: 1, label: "Very difficult" },
                      { value: 5, label: "Moderate" },
                      { value: 10, label: "Excellent control" },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Types of Impulses Experienced</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {impulseTypes.map((impulse) => (
                      <Button
                        key={impulse}
                        type="button"
                        variant={selectedImpulses.includes(impulse) ? "default" : "outline"}
                        onClick={() => toggleImpulse(impulse)}
                        className={
                          selectedImpulses.includes(impulse)
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                            : "border-amber-300 hover:bg-amber-50"
                        }
                      >
                        {impulse}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acted"
                    checked={actedOnImpulse}
                    onCheckedChange={(checked) => setActedOnImpulse(checked as boolean)}
                  />
                  <Label htmlFor="acted" className="cursor-pointer">
                    I acted on an impulse today
                  </Label>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the impulses and how you managed them..."
                    className="border-amber-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg py-6"
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
