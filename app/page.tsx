import { auth } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

/**
 * Home Page Component
 * 
 * The main landing page that serves as the entry point for the application.
 * Features:
 * - Server-side session checking for authentication status
 * - Automatic redirect to dashboard for authenticated users
 * - Clean, centered layout with gradient background
 * - Clear call-to-action buttons for authentication flows
 * - Repository link for project information
 * 
 * This page serves as:
 * - Entry point for new and returning users
 * - Authentication flow navigation hub
 * - Project showcase and information display
 * - Redirect logic for authenticated users
 */
export default async function Home() {
  // Check if user is authenticated on server-side
  const session = await auth()

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NexusTracker V2
          </h1>
          <p className="text-lg text-gray-600">
            Torrent Tracker Moderno con Next.js
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bienvenido
            </h2>
            <p className="text-gray-600">
              Inicia sesión o regístrate para continuar
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Iniciar Sesión
            </Link>
            
            <Link
              href="/auth/signup"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Registrarse
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Enlace al repositorio: <a href="https://github.com/CerealKillerjs/NexusTrackerV2" className="text-blue-600 hover:text-blue-700">https://github.com/NexusTracker/NexusTracker</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
