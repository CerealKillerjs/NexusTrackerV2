import "next-auth"

/**
 * TypeScript module augmentation for next-auth
 *
 * Extends the next-auth types to include custom user/session fields
 * for better type safety and autocompletion in the app.
 *
 * - Adds id, email, username, name, and image to Session.user and User
 * - Adds id and username to JWT
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    email: string
    username?: string | null
    name?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
  }
} 