import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Free Soul
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 text-balance mb-4">
              Seu Companheiro Pessoal de Saúde Mental
            </p>
            <p className="text-lg text-gray-600 text-pretty max-w-2xl mx-auto">
              Acompanhe sua jornada diária de bem-estar com check-ins interativos, ganhe recompensas e obtenha insights
              sobre seus padrões de saúde mental.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Check-ins Diários</h3>
              <p className="text-gray-600 text-sm">
                Registre medicamentos, sono, humor e muito mais em apenas 2 minutos por seção
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Gamificação</h3>
              <p className="text-gray-600 text-sm">
                Ganhe moedas, desbloqueie conquistas e jogue mini-games conforme você progride
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-indigo-100">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Insights</h3>
              <p className="text-gray-600 text-sm">
                Visualize padrões e compartilhe dados com seu profissional de saúde
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-6 text-lg"
            >
              <Link href="/auth/sign-up">Comece Grátis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-6 text-lg bg-transparent"
            >
              <Link href="/auth/login">Entrar</Link>
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="mt-8 text-sm text-gray-500">
            Seus dados são privados e seguros. Usamos criptografia padrão da indústria e você controla quem vê suas
            informações.
          </p>
        </div>
      </div>
    </div>
  )
}
