import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-8">
          Configurações
        </h1>

        <div className="space-y-6">
          <Card className="border-2 border-teal-100 shadow-lg">
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nome de Exibição</p>
                <p className="text-lg">{profile?.display_name || "Não definido"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">E-mail</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Idade</p>
                <p className="text-lg">{profile?.age || "Não definido"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Gênero</p>
                <p className="text-lg">{profile?.gender || "Não definido"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle>Links Rápidos</CardTitle>
              <CardDescription>Navegue para outras seções</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/statistics">Ver Estatísticas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/achievements">Ver Conquistas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/sos">Contatos SOS</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
