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
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

interface Substance {
  substance_type: string
  amount: string
  time_consumed?: string
  notes?: string
}

export default function SubstancesCheckInPage() {
  const [substances, setSubstances] = useState<Substance[]>([{ substance_type: "", amount: "", notes: "" }])
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

  const addSubstance = () => {
    setSubstances([...substances, { substance_type: "", amount: "", notes: "" }])
  }

  const removeSubstance = (index: number) => {
    setSubstances(substances.filter((_, i) => i !== index))
  }

  const updateSubstance = (index: number, field: keyof Substance, value: string) => {
    const updated = [...substances]
    updated[index] = { ...updated[index], [field]: value }
    setSubstances(updated)
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

      const substancesToSave = substances.filter((s) => s.substance_type.trim() !== "")

      for (const substance of substancesToSave) {
        await supabase.from("substance_logs").insert({
          user_id: userId,
          check_in_id: checkIn!.id,
          substance_type: substance.substance_type,
          amount: substance.amount,
          time_consumed: new Date().toISOString(),
          notes: substance.notes,
        })
      }

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
      console.error("Error saving substance log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚬</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent mb-2">
            Substances Check-in
          </h1>
          <p className="text-gray-600">Track substance use for health monitoring</p>
        </div>

        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Substance Use Tracking</CardTitle>
            <CardDescription>
              Record any substances used today. This helps identify patterns. Earn 10 coins for completing this section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {substances.map((substance, index) => (
                  <Card key={index} className="border border-gray-200 bg-gray-50/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">Substance {index + 1}</h3>
                          {substances.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSubstance(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`type-${index}`}>Substance Type *</Label>
                            <Input
                              id={`type-${index}`}
                              value={substance.substance_type}
                              onChange={(e) => updateSubstance(index, "substance_type", e.target.value)}
                              placeholder="e.g., Alcohol, Caffeine, Cannabis"
                              required
                              className="border-gray-300"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`amount-${index}`}>Amount</Label>
                            <Input
                              id={`amount-${index}`}
                              value={substance.amount}
                              onChange={(e) => updateSubstance(index, "amount", e.target.value)}
                              placeholder="e.g., 2 drinks, 1 cup"
                              className="border-gray-300"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                          <Textarea
                            id={`notes-${index}`}
                            value={substance.notes}
                            onChange={(e) => updateSubstance(index, "notes", e.target.value)}
                            placeholder="Context or observations..."
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addSubstance}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Substance
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Privacy & Non-Judgment:</p>
                  <p>
                    This tracking is for your health awareness only. Your data is private and helps identify patterns
                    that may affect your mental health.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white text-lg py-6"
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
