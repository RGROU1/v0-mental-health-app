import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CheckInSections } from "@/components/dashboard/check-in-sections"
import { StreakTracker } from "@/components/dashboard/streak-tracker"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user coins
  const { data: coins } = await supabase.from("user_coins").select("*").eq("user_id", user.id).single()

  const today = new Date().toISOString().split("T")[0]
  const { data: todayProgress } = await supabase
    .from("check_in_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("check_in_date", today)
    .single()

  // Check today's check-in status
  const { data: todayCheckIn } = await supabase
    .from("daily_check_ins")
    .select("*")
    .eq("user_id", user.id)
    .eq("check_in_date", today)
    .single()

  // Calculate streak
  const { data: recentCheckIns } = await supabase
    .from("daily_check_ins")
    .select("check_in_date, completed")
    .eq("user_id", user.id)
    .order("check_in_date", { ascending: false })
    .limit(30)

  let currentStreak = 0
  if (recentCheckIns && recentCheckIns.length > 0) {
    const sortedDates = recentCheckIns.sort(
      (a, b) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime(),
    )

    for (let i = 0; i < sortedDates.length; i++) {
      const checkInDate = new Date(sortedDates[i].check_in_date)
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (
        checkInDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0] &&
        sortedDates[i].completed
      ) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Count total check-ins
  const { count: totalCheckIns } = await supabase
    .from("daily_check_ins")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)

  const monitoringDays = profile?.monitoring_days
  const completionPercentage = monitoringDays
    ? Math.min(100, Math.round(((totalCheckIns || 0) / monitoringDays) * 100))
    : totalCheckIns
      ? Math.min(100, (totalCheckIns / 14) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <DashboardNav displayName={profile?.display_name || "Usuário"} />

      <div className="container mx-auto px-4 py-8 max-w-7xl md:ml-64">
        <DashboardHeader
          displayName={profile?.display_name || "Usuário"}
          coins={coins?.current_balance || 0}
          currentStreak={currentStreak}
          totalCheckIns={totalCheckIns || 0}
          completionPercentage={completionPercentage}
          monitoringDays={monitoringDays}
        />

        <StreakTracker
          currentStreak={currentStreak}
          recentCheckIns={recentCheckIns || []}
          monitoringDays={monitoringDays}
        />

        <CheckInSections todayCheckIn={todayCheckIn} todayProgress={todayProgress} userId={user.id} />
      </div>
    </div>
  )
}
