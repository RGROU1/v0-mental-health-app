"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Gamepad2, Trophy, BarChart3, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  displayName: string
}

export function DashboardNav({ displayName }: DashboardNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/check-in/sleep", label: "Registro Diário", icon: FileText },
    { href: "/games", label: "Jogos", icon: Gamepad2 },
    { href: "/statistics", label: "Estatísticas", icon: BarChart3 },
    { href: "/achievements", label: "Conquistas", icon: Trophy },
    { href: "/settings", label: "Configurações", icon: Menu },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">Lovable</h2>
              <p className="text-sm text-gray-500">Sua Saúde Mental</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-purple-100 text-purple-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Olá, {displayName}!</p>
            <p className="text-xs text-gray-600">Como você está se sentindo hoje?</p>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
