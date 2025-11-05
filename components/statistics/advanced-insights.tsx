"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain, Moon, Pill } from "lucide-react"

interface AdvancedInsightsProps {
  moodData: any[]
  sleepData: any[]
  medicationData: any[]
  appetiteData: any[]
  libidoData: any[]
  concentrationData: any[]
}

export function AdvancedInsights({
  moodData,
  sleepData,
  medicationData,
  appetiteData,
  libidoData,
  concentrationData,
}: AdvancedInsightsProps) {
  // Análise de correlação entre sono e humor
  const analyzeSleepMoodCorrelation = () => {
    if (sleepData.length < 3 || moodData.length < 3) return null

    const correlationData = sleepData
      .map((sleep) => {
        const mood = moodData.find((m) => m.daily_check_ins.check_in_date === sleep.daily_check_ins.check_in_date)
        if (!mood) return null
        return {
          sleep: Number.parseFloat(sleep.hours_slept),
          mood: mood.mood_score,
        }
      })
      .filter(Boolean)

    if (correlationData.length < 3) return null

    const avgSleep = correlationData.reduce((sum, d) => sum + d.sleep, 0) / correlationData.length
    const avgMood = correlationData.reduce((sum, d) => sum + d.mood, 0) / correlationData.length

    const goodSleepDays = correlationData.filter((d) => d.sleep >= 7)
    const poorSleepDays = correlationData.filter((d) => d.sleep < 6)

    const avgMoodGoodSleep =
      goodSleepDays.length > 0 ? goodSleepDays.reduce((sum, d) => sum + d.mood, 0) / goodSleepDays.length : 0
    const avgMoodPoorSleep =
      poorSleepDays.length > 0 ? poorSleepDays.reduce((sum, d) => sum + d.mood, 0) / poorSleepDays.length : 0

    const impact = avgMoodGoodSleep - avgMoodPoorSleep

    return {
      avgSleep: avgSleep.toFixed(1),
      avgMood: avgMood.toFixed(1),
      impact: impact.toFixed(1),
      hasPositiveCorrelation: impact > 1,
      goodSleepCount: goodSleepDays.length,
      poorSleepCount: poorSleepDays.length,
    }
  }

  // Análise de aderência medicamentosa e humor
  const analyzeMedicationMoodCorrelation = () => {
    if (medicationData.length < 5 || moodData.length < 5) return null

    const daysWithMeds = new Set(medicationData.filter((m) => m.taken).map((m) => m.daily_check_ins.check_in_date))
    const daysWithoutMeds = new Set(medicationData.filter((m) => !m.taken).map((m) => m.daily_check_ins.check_in_date))

    const moodWithMeds = moodData.filter((m) => daysWithMeds.has(m.daily_check_ins.check_in_date))
    const moodWithoutMeds = moodData.filter((m) => daysWithoutMeds.has(m.daily_check_ins.check_in_date))

    if (moodWithMeds.length === 0 || moodWithoutMeds.length === 0) return null

    const avgMoodWithMeds = moodWithMeds.reduce((sum, m) => sum + m.mood_score, 0) / moodWithMeds.length
    const avgMoodWithoutMeds = moodWithoutMeds.reduce((sum, m) => sum + m.mood_score, 0) / moodWithoutMeds.length

    const adherenceRate = (daysWithMeds.size / medicationData.length) * 100

    return {
      avgMoodWithMeds: avgMoodWithMeds.toFixed(1),
      avgMoodWithoutMeds: avgMoodWithoutMeds.toFixed(1),
      difference: (avgMoodWithMeds - avgMoodWithoutMeds).toFixed(1),
      adherenceRate: adherenceRate.toFixed(0),
      hasPositiveImpact: avgMoodWithMeds > avgMoodWithoutMeds,
    }
  }

  // Análise de padrões de concentração
  const analyzeConcentrationPatterns = () => {
    if (concentrationData.length < 5) return null

    const avgConcentration =
      concentrationData.reduce((sum, c) => sum + c.concentration_level, 0) / concentrationData.length

    const recentData = concentrationData.slice(-7)
    const avgRecentConcentration = recentData.reduce((sum, c) => sum + c.concentration_level, 0) / recentData.length

    const trend = avgRecentConcentration - avgConcentration

    return {
      avgConcentration: avgConcentration.toFixed(1),
      avgRecentConcentration: avgRecentConcentration.toFixed(1),
      trend: trend.toFixed(1),
      isImproving: trend > 0.5,
      isDeclining: trend < -0.5,
    }
  }

  // Análise de qualidade do sono
  const analyzeSleepQuality = () => {
    if (sleepData.length < 5) return null

    const avgHours = sleepData.reduce((sum, s) => sum + Number.parseFloat(s.hours_slept), 0) / sleepData.length
    const avgQuality = sleepData.reduce((sum, s) => sum + s.sleep_quality, 0) / sleepData.length

    const optimalSleepDays = sleepData.filter(
      (s) => Number.parseFloat(s.hours_slept) >= 7 && Number.parseFloat(s.hours_slept) <= 9,
    )
    const optimalPercentage = (optimalSleepDays.length / sleepData.length) * 100

    return {
      avgHours: avgHours.toFixed(1),
      avgQuality: avgQuality.toFixed(1),
      optimalPercentage: optimalPercentage.toFixed(0),
      needsImprovement: avgHours < 7 || avgQuality < 6,
    }
  }

  // Análise de tendências de humor
  const analyzeMoodTrends = () => {
    if (moodData.length < 7) return null

    const recentWeek = moodData.slice(-7)
    const previousWeek = moodData.slice(-14, -7)

    if (previousWeek.length === 0) return null

    const avgRecentMood = recentWeek.reduce((sum, m) => sum + m.mood_score, 0) / recentWeek.length
    const avgPreviousMood = previousWeek.reduce((sum, m) => sum + m.mood_score, 0) / previousWeek.length

    const change = avgRecentMood - avgPreviousMood
    const changePercentage = ((change / avgPreviousMood) * 100).toFixed(0)

    return {
      avgRecentMood: avgRecentMood.toFixed(1),
      avgPreviousMood: avgPreviousMood.toFixed(1),
      change: change.toFixed(1),
      changePercentage,
      isImproving: change > 0.5,
      isDeclining: change < -0.5,
    }
  }

  const sleepMoodCorr = analyzeSleepMoodCorrelation()
  const medMoodCorr = analyzeMedicationMoodCorrelation()
  const concentrationPattern = analyzeConcentrationPatterns()
  const sleepQuality = analyzeSleepQuality()
  const moodTrend = analyzeMoodTrends()

  return (
    <div className="space-y-6">
      <Card className="border-2 border-indigo-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            Insights Avançados
          </CardTitle>
          <CardDescription>Análises de correlação e padrões nos seus dados de saúde</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tendência de Humor */}
          {moodTrend && (
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-yellow-900 mb-1">Tendência de Humor</h3>
                  <p className="text-sm text-gray-600">Comparação: última semana vs. semana anterior</p>
                </div>
                {moodTrend.isImproving ? (
                  <Badge className="bg-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Melhorando
                  </Badge>
                ) : moodTrend.isDeclining ? (
                  <Badge className="bg-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Declinando
                  </Badge>
                ) : (
                  <Badge variant="outline">Estável</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Semana Anterior</p>
                  <p className="text-2xl font-bold text-yellow-700">{moodTrend.avgPreviousMood}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Semana</p>
                  <p className="text-2xl font-bold text-yellow-700">{moodTrend.avgRecentMood}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                Mudança: {moodTrend.change > 0 ? "+" : ""}
                {moodTrend.change} pontos ({moodTrend.changePercentage > 0 ? "+" : ""}
                {moodTrend.changePercentage}%)
              </p>
            </div>
          )}

          {/* Correlação Sono-Humor */}
          {sleepMoodCorr && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-blue-900 mb-1 flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Impacto do Sono no Humor
                  </h3>
                  <p className="text-sm text-gray-600">Análise de correlação</p>
                </div>
                {sleepMoodCorr.hasPositiveCorrelation ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Correlação Positiva
                  </Badge>
                ) : (
                  <Badge variant="outline">Correlação Fraca</Badge>
                )}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sono Adequado (≥7h)</p>
                    <p className="text-xl font-bold text-blue-700">{sleepMoodCorr.goodSleepCount} dias</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sono Insuficiente (&lt;6h)</p>
                    <p className="text-xl font-bold text-blue-700">{sleepMoodCorr.poorSleepCount} dias</p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Descoberta:</strong> Quando você dorme bem (≥7h), seu humor é em média{" "}
                    <strong className="text-blue-700">{sleepMoodCorr.impact} pontos</strong> maior do que quando dorme
                    mal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Correlação Medicação-Humor */}
          {medMoodCorr && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-green-900 mb-1 flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Impacto da Medicação
                  </h3>
                  <p className="text-sm text-gray-600">Aderência: {medMoodCorr.adherenceRate}%</p>
                </div>
                {medMoodCorr.hasPositiveImpact ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Impacto Positivo
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Revisar
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Com Medicação</p>
                    <p className="text-2xl font-bold text-green-700">{medMoodCorr.avgMoodWithMeds}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sem Medicação</p>
                    <p className="text-2xl font-bold text-green-700">{medMoodCorr.avgMoodWithoutMeds}</p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Descoberta:</strong> Nos dias em que você toma a medicação, seu humor é em média{" "}
                    <strong className="text-green-700">{medMoodCorr.difference} pontos</strong>{" "}
                    {medMoodCorr.hasPositiveImpact ? "maior" : "diferente"}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Qualidade do Sono */}
          {sleepQuality && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-purple-900 mb-1">Qualidade do Sono</h3>
                  <p className="text-sm text-gray-600">Análise de padrões de sono</p>
                </div>
                {sleepQuality.needsImprovement ? (
                  <Badge className="bg-orange-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Precisa Melhorar
                  </Badge>
                ) : (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Bom
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Média de Horas</p>
                  <p className="text-2xl font-bold text-purple-700">{sleepQuality.avgHours}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualidade Média</p>
                  <p className="text-2xl font-bold text-purple-700">{sleepQuality.avgQuality}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sono Ideal</p>
                  <p className="text-2xl font-bold text-purple-700">{sleepQuality.optimalPercentage}%</p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-700">
                  {sleepQuality.needsImprovement ? (
                    <>
                      <strong>Recomendação:</strong> Tente dormir entre 7-9 horas por noite para melhorar seu bem-estar
                      geral.
                    </>
                  ) : (
                    <>
                      <strong>Parabéns!</strong> Você está mantendo bons hábitos de sono. Continue assim!
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Padrões de Concentração */}
          {concentrationPattern && (
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-orange-900 mb-1">Níveis de Concentração</h3>
                  <p className="text-sm text-gray-600">Tendência recente</p>
                </div>
                {concentrationPattern.isImproving ? (
                  <Badge className="bg-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Melhorando
                  </Badge>
                ) : concentrationPattern.isDeclining ? (
                  <Badge className="bg-red-600">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Declinando
                  </Badge>
                ) : (
                  <Badge variant="outline">Estável</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <p className="text-2xl font-bold text-orange-700">{concentrationPattern.avgConcentration}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Semana</p>
                  <p className="text-2xl font-bold text-orange-700">{concentrationPattern.avgRecentConcentration}/10</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                Tendência: {concentrationPattern.trend > 0 ? "+" : ""}
                {concentrationPattern.trend} pontos
              </p>
            </div>
          )}

          {/* Mensagem quando não há dados suficientes */}
          {!sleepMoodCorr && !medMoodCorr && !concentrationPattern && !sleepQuality && !moodTrend && (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Dados Insuficientes</h3>
              <p className="text-gray-600">
                Continue registrando seus dados diários para desbloquear insights avançados e análises de correlação.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
