import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Phone } from "lucide-react"

export default async function SOSPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: contacts } = await supabase
    .from("sos_contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🆘</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Emergency Support
          </h1>
          <p className="text-gray-600">Crisis resources and your emergency contacts</p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-red-300 bg-red-50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-red-900">Crisis Hotlines</CardTitle>
              <CardDescription className="text-red-700">Available 24/7 for immediate support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">National Suicide Prevention Lifeline</p>
                  <p className="text-sm text-gray-600">24/7 Crisis Support</p>
                </div>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <a href="tel:988">
                    <Phone className="mr-2 h-4 w-4" />
                    988
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Crisis Text Line</p>
                  <p className="text-sm text-gray-600">Text support available</p>
                </div>
                <Button asChild variant="outline" className="border-2 border-red-600 text-red-600 bg-transparent">
                  <a href="sms:741741?body=HOME">Text HOME to 741741</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Your Emergency Contacts</CardTitle>
              <CardDescription>People you trust who can help in a crisis</CardDescription>
            </CardHeader>
            <CardContent>
              {contacts && contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{contact.contact_name}</p>
                        <p className="text-sm text-gray-600">{contact.relationship}</p>
                      </div>
                      <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <a href={`tel:${contact.phone_number}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No emergency contacts added yet</p>
                  <Button variant="outline">Add Emergency Contact</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
