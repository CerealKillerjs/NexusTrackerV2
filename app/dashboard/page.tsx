import { auth } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/app/components/auth/LogoutButton"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                NexusTracker V2
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {session.user.name || session.user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido al Dashboard!
              </h2>
              <p className="text-gray-600">
                Tu sistema de autenticación está funcionando correctamente.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {session.user.email}
                </p>
                {session.user.name && (
                  <p className="text-sm text-blue-800">
                    <strong>Nombre:</strong> {session.user.name}
                  </p>
                )}
                <p className="text-sm text-blue-800">
                  <strong>Usuario:</strong> {session.user.username || "No disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 