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
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { InteractiveScale } from "@/components/check-in/interactive-scale"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

export default function ThoughtsCheckInPage() {
  const [intrusiveThoughts, setIntrusiveThoughts] = useState(false)
  const [racingThoughts, setRacingThoughts] = useState(false)
  const [negativeThoughtsIntensity, setNegativeThoughtsIntensity] = useState(5)
  const [suicidalIdeation, setSuicidalIdeation] = useState(false)
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

      await supabase.from("thought_logs").insert({
        user_id: userId,
        check_in_id: checkIn!.id,
        intrusive_thoughts: intrusiveThoughts,
        racing_thoughts: racingThoughts,
        negative_thoughts_intensity: negativeThoughtsIntensity,
        suicidal_ideation: suicidalIdeation,
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
      console.error("Error saving thought log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💭</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Thoughts Check-in
          </h1>
          <p className="text-gray-600">Monitor your thought patterns</p>
        </div>

        {suicidalIdeation && (
          <Card className="mb-6 border-2 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 mb-2">Crisis Support Available</h3>
                  <p className="text-sm text-red-800 mb-3">
                    If you&apos;re having thoughts of suicide, please reach out for help immediately.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-red-900">Crisis Resources:</p>
                    <p>National Suicide Prevention Lifeline: 988</p>
                    <p>Crisis Text Line: Text HOME to 741741</p>
                  </div>
                  <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
                    <Link href="/sos">View My SOS Contacts</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-cyan-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Thought Pattern Tracking</CardTitle>
            <CardDescription>
              Monitor your thoughts and mental patterns. Earn 10 coins for completing this section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="intrusive"
                      checked={intrusiveThoughts}
                      onCheckedChange={(checked) => setIntrusiveThoughts(checked as boolean)}
                    />
                    <Label htmlFor="intrusive" className="cursor-pointer">
                      I experienced intrusive thoughts today
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="racing"
                      checked={racingThoughts}
                      onCheckedChange={(checked) => setRacingThoughts(checked as boolean)}
                    />
                    <Label htmlFor="racing" className="cursor-pointer">
                      I experienced racing thoughts today
                    </Label>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Negative Thoughts Intensity *</Label>
                  <InteractiveScale
                    value={negativeThoughtsIntensity}
                    onChange={setNegativeThoughtsIntensity}
                    min={1}
                    max={10}
                    color="from-cyan-400 to-blue-500"
                    icon="💭"
                    labels={[
                      { value: 1, label: "Minimal" },
                      { value: 5, label: "Moderate" },
                      { value: 10, label: "Severe" },
                    ]}
                  />
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="suicidal"
                      checked={suicidalIdeation}
                      onCheckedChange={(checked) => setSuicidalIdeation(checked as boolean)}
                    />
                    <Label htmlFor="suicidal" className="cursor-pointer font-semibold">
                      I had thoughts of suicide or self-harm today
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your thought patterns or any triggers..."
                    className="border-cyan-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg py-6"
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
