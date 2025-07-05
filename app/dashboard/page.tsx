import { auth } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/app/components/auth/LogoutButton"

/**
 * Dashboard Page Component
 * 
 * A protected page that displays user information and dashboard content.
 * Features:
 * - Server-side session validation
 * - Automatic redirect for unauthenticated users
 * - Display of user information from session
 * - Logout functionality
 * - Responsive layout
 * 
 * This page demonstrates:
 * - Server-side authentication checks
 * - Session data access
 * - Protected route implementation
 * - User interface for authenticated users
 */
export default async function DashboardPage() {
  // Get user session from server-side
  // This ensures the page is protected and only accessible to authenticated users
  const session = await auth()

  // Redirect unauthenticated users to the sign-in page
  // This prevents unauthorized access to the dashboard
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header section with navigation and user info */}
      <header className="bg-background-secondary shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Dashboard title */}
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard
            </h1>
            
            {/* User section with name and logout button */}
            <div className="flex items-center space-x-4">
              {/* User information display */}
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-foreground-muted">
                  {session.user.email}
                </p>
              </div>
              
              {/* Logout button */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome message */}
          <div className="bg-background-secondary overflow-hidden shadow rounded-lg border border-border">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Welcome to your Dashboard
              </h2>
              
              {/* User details card */}
              <div className="bg-background-tertiary rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Account Information
                </h3>
                <dl className="space-y-2">
                  {/* Username display */}
                  <div>
                    <dt className="text-xs text-foreground-muted">
                      Username
                    </dt>
                    <dd className="text-sm text-foreground">
                      {session.user.name || "Not provided"}
                    </dd>
                  </div>
                  
                  {/* Email display */}
                  <div>
                    <dt className="text-xs text-foreground-muted">
                      Email
                    </dt>
                    <dd className="text-sm text-foreground">
                      {session.user.email}
                    </dd>
                  </div>
                  
                  {/* Account creation date (if available) */}
                  {/* Note: createdAt field is not included in the session by default */}
                  {/* To display this, you would need to modify the session callback in auth config */}
                </dl>
              </div>
              
              {/* Placeholder for future dashboard content */}
              <div className="mt-6">
                <p className="text-sm text-foreground-secondary">
                  This is your personal dashboard. More features and content will be added here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 