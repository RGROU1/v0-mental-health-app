"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { ConfettiAnimation } from "@/components/check-in/confetti-animation"

interface Medication {
  id?: string
  medication_name: string
  dosage: string
  taken: boolean
  time_taken?: string
  notes?: string
}

export default function MedicationsCheckInPage() {
  const [medications, setMedications] = useState<Medication[]>([
    { medication_name: "", dosage: "", taken: false, notes: "" },
  ])
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

  const addMedication = () => {
    setMedications([...medications, { medication_name: "", dosage: "", taken: false, notes: "" }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: any) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const today = new Date().toISOString().split("T")[0]

      // Create or get today's check-in
      let { data: checkIn, error: checkInError } = await supabase
        .from("daily_check_ins")
        .select("*")
        .eq("user_id", userId)
        .eq("check_in_date", today)
        .single()

      if (checkInError || !checkIn) {
        const { data: newCheckIn, error: createError } = await supabase
          .from("daily_check_ins")
          .insert({
            user_id: userId,
            check_in_date: today,
            completed: false,
            coins_earned: 0,
          })
          .select()
          .single()

        if (createError) throw createError
        checkIn = newCheckIn
      }

      // Save medications
      const medicationsToSave = medications.filter((m) => m.medication_name.trim() !== "")

      for (const med of medicationsToSave) {
        await supabase.from("medications").insert({
          user_id: userId,
          check_in_id: checkIn.id,
          medication_name: med.medication_name,
          dosage: med.dosage,
          taken: med.taken,
          time_taken: med.taken ? new Date().toISOString() : null,
          notes: med.notes,
        })
      }

      // Award coins
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
      console.error("Error saving medications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      {showConfetti && <ConfettiAnimation />}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💊</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Medications Check-in
          </h1>
          <p className="text-gray-600">Track your daily medications and adherence</p>
        </div>

        <Card className="border-2 border-green-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Today&apos;s Medications</CardTitle>
            <CardDescription>
              Record all medications you&apos;re taking today. Earn 10 coins for completing this section!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {medications.map((med, index) => (
                  <Card key={index} className="border border-green-100 bg-green-50/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">Medication {index + 1}</h3>
                          {medications.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedication(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`med-name-${index}`}>Medication Name *</Label>
                            <Input
                              id={`med-name-${index}`}
                              value={med.medication_name}
                              onChange={(e) => updateMedication(index, "medication_name", e.target.value)}
                              placeholder="e.g., Sertraline"
                              required
                              className="border-green-200"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                            <Input
                              id={`dosage-${index}`}
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                              placeholder="e.g., 50mg"
                              className="border-green-200"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`taken-${index}`}
                            checked={med.taken}
                            onCheckedChange={(checked) => updateMedication(index, "taken", checked)}
                          />
                          <Label htmlFor={`taken-${index}`} className="cursor-pointer">
                            I took this medication today
                          </Label>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${index}`}>Notes (Optional)</Label>
                          <Textarea
                            id={`notes-${index}`}
                            value={med.notes}
                            onChange={(e) => updateMedication(index, "notes", e.target.value)}
                            placeholder="Any side effects or observations..."
                            className="border-green-200"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addMedication}
                  className="w-full border-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Medication
                </Button>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg py-6"
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
