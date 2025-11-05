import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Calendar, Activity } from "lucide-react"
import { MoodChart } from "@/components/statistics/mood-chart"
import { SleepChart } from "@/components/statistics/sleep-chart"
import { MedicationAdherence } from "@/components/statistics/medication-adherence"
import { WeeklyOverview } from "@/components/statistics/weekly-overview"
import { AdvancedInsights } from "@/components/statistics/advanced-insights"

export default async function StatisticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch last 30 days of mood data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: moodLogs } = await supabase
    .from("mood_logs")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  const { data: sleepLogs } = await supabase
    .from("sleep_logs")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  const { data: medications } = await supabase
    .from("medications")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  const { data: appetiteLogs } = await supabase
    .from("appetite_logs")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  const { data: libidoLogs } = await supabase
    .from("libido_logs")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  const { data: concentrationLogs } = await supabase
    .from("concentration_logs")
    .select("*, daily_check_ins!inner(check_in_date)")
    .eq("user_id", user.id)
    .gte("daily_check_ins.check_in_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("created_at", { ascending: true })

  // Calculate averages
  const avgMood =
    moodLogs && moodLogs.length > 0
      ? (moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length).toFixed(1)
      : "N/A"

  const avgSleep =
    sleepLogs && sleepLogs.length > 0
      ? (sleepLogs.reduce((sum, log) => sum + Number.parseFloat(log.hours_slept), 0) / sleepLogs.length).toFixed(1)
      : "N/A"

  const medAdherence =
    medications && medications.length > 0
      ? Math.round((medications.filter((m) => m.taken).length / medications.length) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Suas Estatísticas
          </h1>
          <p className="text-gray-600">Visualize sua jornada de saúde mental ao longo do tempo</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Humor Médio</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{avgMood}</p>
                  <p className="text-sm text-gray-500 mt-1">últimos 30 dias</p>
                </div>
                <TrendingUp className="h-12 w-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sono Médio</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{avgSleep}h</p>
                  <p className="text-sm text-gray-500 mt-1">por noite</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aderência Medicamentosa</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{medAdherence}%</p>
                  <p className="text-sm text-gray-500 mt-1">taxa de conformidade</p>
                </div>
                <Activity className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="mood">Humor</TabsTrigger>
            <TabsTrigger value="sleep">Sono</TabsTrigger>
            <TabsTrigger value="medications">Medicamentos</TabsTrigger>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <AdvancedInsights
              moodData={moodLogs || []}
              sleepData={sleepLogs || []}
              medicationData={medications || []}
              appetiteData={appetiteLogs || []}
              libidoData={libidoLogs || []}
              concentrationData={concentrationLogs || []}
            />
          </TabsContent>

          <TabsContent value="mood">
            <MoodChart data={moodLogs || []} />
          </TabsContent>

          <TabsContent value="sleep">
            <SleepChart data={sleepLogs || []} />
          </TabsContent>

          <TabsContent value="medications">
            <MedicationAdherence data={medications || []} />
          </TabsContent>

          <TabsContent value="overview">
            <WeeklyOverview moodData={moodLogs || []} sleepData={sleepLogs || []} medicationData={medications || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
