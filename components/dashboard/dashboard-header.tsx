"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Settings, AlertCircle } from "lucide-react"

interface DashboardHeaderProps {
  displayName: string
  coins: number
}

export function DashboardHeader({ displayName, coins }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Olá, {displayName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Como você está se sentindo hoje?</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="border-2 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
          onClick={() => router.push("/sos")}
        >
          <AlertCircle className="h-5 w-5" />
        </Button>

        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span>{coins} moedas</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="border-2 border-gray-300 bg-transparent"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="border-2 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
