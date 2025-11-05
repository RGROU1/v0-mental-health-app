"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Calendar, Infinity } from "lucide-react"

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const router = useRouter()

  // Form state
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [monitoringDays, setMonitoringDays] = useState<number | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      console.log("[v0] Checking user authentication status")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("[v0] User found:", user.id)
      setUserId(user.id)

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profile?.onboarding_completed) {
        console.log("[v0] Onboarding already completed, redirecting to dashboard")
        router.push("/dashboard")
      }
    }

    checkUser()
  }, [router])

  const handleDaySelection = (days: number | null) => {
    setMonitoringDays(days)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Submitting onboarding data")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          age: age ? Number.parseInt(age) : null,
          gender: gender || null,
          diagnosis: diagnosis || null,
          monitoring_days: monitoringDays,
          monitoring_start_date: new Date().toISOString().split("T")[0],
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.log("[v0] Onboarding update error:", updateError.message)
        throw updateError
      }

      console.log("[v0] Onboarding completed successfully, redirecting to dashboard")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!userId) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Skipping onboarding")

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.log("[v0] Skip onboarding error:", updateError.message)
        throw updateError
      }

      console.log("[v0] Onboarding skipped, redirecting to dashboard")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Bem-vindo ao Free Soul
            </h1>
            <p className="text-gray-600 text-lg">Escolha o período de monitoramento da sua saúde mental</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card
              className="border-2 border-teal-200 hover:border-teal-400 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleDaySelection(7)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">7 Dias</CardTitle>
                <CardDescription className="text-base mt-2">
                  Ideal para começar e entender seus padrões básicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                  Escolher 7 Dias
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-indigo-200 hover:border-indigo-400 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleDaySelection(14)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">14 Dias</CardTitle>
                <CardDescription className="text-base mt-2">
                  Recomendado para análise mais completa e insights profundos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  Escolher 14 Dias
                </Button>
              </CardContent>
            </Card>

            <Card
              className="border-2 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleDaySelection(null)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Infinity className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl">Indeterminado</CardTitle>
                <CardDescription className="text-base mt-2">
                  Continue monitorando pelo tempo que precisar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  Escolher Indeterminado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Complete seu Perfil
          </h1>
          <p className="text-gray-600 text-lg">
            Período selecionado: {monitoringDays ? `${monitoringDays} dias` : "Indeterminado"}
          </p>
        </div>

        <Card className="border-2 border-teal-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
            <CardDescription>
              Essas informações nos ajudam a fornecer melhores insights e recomendações. Todos os campos são opcionais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Sua idade"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="13"
                    max="120"
                    className="border-gray-300"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Selecione seu gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="non-binary">Não-binário</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiro não dizer</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="diagnosis">Condição de Saúde Mental (Opcional)</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="ex: Depressão, Ansiedade, Transtorno Bipolar, etc."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="border-gray-300 min-h-24"
                  />
                  <p className="text-xs text-gray-500">
                    Isso nos ajuda a adaptar o aplicativo às suas necessidades específicas. Seus dados são privados e
                    seguros.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="flex-1 bg-transparent"
                  >
                    Pular por enquanto
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Salvando..." : "Continuar para o Dashboard"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
