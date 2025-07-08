import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { UserRole } from "@/app/types/user"

/**
 * NextAuth.js Configuration
 * 
 * This file configures NextAuth.js for user authentication using credentials provider.
 * Features:
 * - Email/username and password authentication with bcrypt password hashing
 * - Database integration with Prisma ORM
 * - Custom session handling
 * - Secure password comparison
 * - User data validation
 * 
 * The configuration includes:
 * - Credentials provider for email/username and password login
 * - Session strategy and callbacks
 * - Database queries for user lookup
 * - Error handling for authentication failures
 */
export const authOptions = {
  // Configure authentication providers
  providers: [
    /**
     * Credentials Provider
     * 
     * Handles email/username and password authentication by:
     * - Validating user credentials against database
     * - Comparing hashed passwords securely
     * - Returning user data for session creation
     */
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      /**
       * Authorize function - validates user credentials
       * 
       * This function is called during sign-in to verify user credentials.
       * It performs the following steps:
       * 1. Find user by email or username in database
       * 2. Compare provided password with stored hash
       * 3. Return user data if authentication succeeds
       * 4. Return null if authentication fails
       * 
       * @param credentials - Object containing login (email or username) and password
       * @returns User object if authentication succeeds, null otherwise
       */
      async authorize(credentials) {
        // Validate that credentials are provided
        if (!credentials?.login || !credentials?.password) {
          return null
        }

        try {
          // Find user by email or username in database
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.login as string },
                { username: credentials.login as string }
              ]
            },
            select: {
              id: true,
              email: true,
              username: true,
              password: true,
              role: true,
              passkey: true,
              status: true,
              emailVerified: true,
            }
          })

          // Return null if user doesn't exist
          if (!user) {
            return null
          }

          // Check if user has a password (should always be true for credentials auth)
          if (!user.password) {
            return null
          }
          
          // Compare provided password with stored hash using bcrypt
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          // Return null if password is invalid
          if (!isPasswordValid) {
            return null
          }

          // Return user data (excluding password) for session creation
          return {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.username, // Use username as display name
            role: user.role as UserRole, // Include user role
            passkey: user.passkey, // Include passkey for announce URLs
            emailVerified: user.emailVerified, // Propagate emailVerified
          }
        } catch (error) {
          // Log error for debugging
          console.error("Error during authentication:", error)
          return null
        }
      }
    })
  ],
  
  // Session configuration
  session: {
    strategy: "jwt" as const, // Explicitly type as const to fix type error
  },
  
  // Callbacks for customizing authentication behavior
  callbacks: {
    /**
     * JWT callback - customizes JWT token content
     * 
     * This callback is called when a JWT is created or updated.
     * It allows us to add custom data to the JWT token.
     * 
     * @param token - The JWT token object
     * @param user - The user object from the authorize function
     * @returns Modified token object
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      // If user data is available (during sign-in), add it to token
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.passkey = user.passkey
        token.emailVerified = user.emailVerified // Propagate emailVerified
      }
      return token
    },
    
    /**
     * Session callback - customizes session data
     * 
     * This callback is called whenever a session is checked.
     * It allows us to customize what data is available in the session.
     * 
     * @param session - The session object
     * @param token - The JWT token object
     * @returns Modified session object
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      // Add custom user data to session
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.passkey = token.passkey as string
        session.user.emailVerified = token.emailVerified // Propagate emailVerified
      }
      return session
    }
  },
  
  // Pages configuration for custom authentication pages
  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    signUp: "/auth/signup", // Custom sign-up page
  },
  
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET, // Secret key for JWT signing
  
  // Debug mode (only in development)
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions) 