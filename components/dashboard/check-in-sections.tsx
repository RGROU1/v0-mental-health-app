"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"

interface CheckInSectionsProps {
  todayCheckIn: any
  userId: string
}

const sections = [
  {
    id: "sleep",
    title: "Sono",
    description: "Como você dormiu?",
    icon: "🌙",
    color: "from-indigo-500 to-blue-600",
    borderColor: "border-indigo-200",
    bgColor: "from-indigo-50 to-blue-50",
    route: "/check-in/sleep",
    tags: ["Qualidade", "Duração", "Descanso"],
  },
  {
    id: "appetite",
    title: "Apetite",
    description: "Sua alimentação",
    icon: "🍽️",
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-200",
    bgColor: "from-orange-50 to-red-50",
    route: "/check-in/appetite",
    tags: ["Nível", "Comportamento", "Padrões"],
  },
  {
    id: "mood",
    title: "Humor",
    description: "Suas emoções",
    icon: "💗",
    color: "from-pink-500 to-rose-600",
    borderColor: "border-pink-200",
    bgColor: "from-pink-50 to-rose-50",
    route: "/check-in/mood",
    tags: ["Humor", "Ansiedade", "Desconforto"],
  },
  {
    id: "libido",
    title: "Libido",
    description: "Energia vital",
    icon: "⚡",
    color: "from-red-500 to-pink-600",
    borderColor: "border-red-200",
    bgColor: "from-red-50 to-pink-50",
    route: "/check-in/libido",
    tags: ["Desejo", "Satisfação", "Dificuldades"],
  },
  {
    id: "concentration",
    title: "Concentração",
    description: "Seu foco",
    icon: "🧠",
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-200",
    bgColor: "from-blue-50 to-cyan-50",
    route: "/check-in/concentration",
    tags: ["Nível", "Atenção", "Memória"],
  },
  {
    id: "social",
    title: "Vida Social",
    description: "Conexões",
    icon: "🤝",
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-200",
    bgColor: "from-green-50 to-emerald-50",
    route: "/check-in/social",
    tags: ["Satisfação", "Eventos", "Qualidade"],
  },
  {
    id: "events",
    title: "Eventos",
    description: "Seu dia",
    icon: "📅",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-200",
    bgColor: "from-amber-50 to-orange-50",
    route: "/check-in/events",
    tags: ["Acontecimentos", "Intensidade", "Impacto"],
  },
]

export function CheckInSections({ todayCheckIn }: CheckInSectionsProps) {
  const router = useRouter()

  return (
    <div className="mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📝 Registro Diário</h2>
        <p className="text-gray-600">Reserve 5 minutos para o seu bem-estar</p>
        <div className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
          <p className="text-sm font-medium">+50 pontos ao completar</p>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-6">Suas Áreas de Bem-Estar</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const isCompleted = false // TODO: Check if section is completed

          return (
            <Card
              key={section.id}
              className={`border-2 ${section.borderColor} bg-gradient-to-br ${section.bgColor} shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden`}
              onClick={() => router.push(section.route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`text-5xl bg-gradient-to-br ${section.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-md`}
                  >
                    {section.icon}
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <CardTitle className="text-2xl group-hover:text-violet-600 transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-base">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {section.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-white/60 px-2 py-1 rounded-full text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button
                  className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 text-white group-hover:scale-105 transition-transform`}
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(section.route)
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isCompleted ? "Revisar" : "Iniciar"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="ml-auto text-sm">+20</span>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
