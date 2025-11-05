import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <Card className="border-2 border-teal-100 shadow-xl">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <CardTitle className="text-2xl">Verifique seu E-mail</CardTitle>
            <CardDescription className="text-base">Enviamos um link de confirmação para você</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Por favor, verifique seu e-mail e clique no link de confirmação para ativar sua conta.
            </p>
            <p className="text-sm text-gray-500">
              Após confirmar, você será redirecionado para completar a configuração do seu perfil.
            </p>
            <Button asChild variant="outline" className="mt-4 bg-transparent">
              <Link href="/auth/login">Voltar para Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
