import { z } from "zod"

/**
 * Helper function to get validation messages based on language
 * Returns appropriate error messages in Spanish or English for form validation
 * @param language - The language code ('es' for Spanish, 'en' for English)
 * @returns Object containing validation messages in the specified language
 */
const getValidationMessages = (language: string = 'es') => {
  const messages = {
    es: {
      invalidEmail: "Email inválido",
      invalidLogin: "Ingresa un email válido o un nombre de usuario",
      passwordMin: "La contraseña debe tener al menos 6 caracteres",
      usernameMin: "El nombre de usuario debe tener al menos 3 caracteres",
      usernameMax: "El nombre de usuario no puede tener más de 20 caracteres",
      passwordsDoNotMatch: "Las contraseñas no coinciden"
    },
    en: {
      invalidEmail: "Invalid email",
      invalidLogin: "Please enter a valid email or username",
      passwordMin: "Password must be at least 6 characters",
      usernameMin: "Username must be at least 3 characters",
      usernameMax: "Username cannot be more than 20 characters",
      passwordsDoNotMatch: "Passwords do not match"
    }
  }
  
  // Return messages for specified language, fallback to Spanish if language not found
  return messages[language as keyof typeof messages] || messages.es
}

/**
 * Creates a dynamic sign-in validation schema with language-specific error messages
 * Validates login (email or username) and password fields for user authentication
 * @param language - The language code for error messages
 * @returns Zod schema for sign-in form validation
 */
export const createSignInSchema = (language: string = 'es') => {
  const messages = getValidationMessages(language)
  
  return z.object({
    login: z.string().min(1, messages.invalidLogin),
    password: z.string().min(6, messages.passwordMin),
  })
}

/**
 * Creates a dynamic sign-up validation schema with language-specific error messages
 * Validates username, email, password, and confirm password fields for user registration
 * Includes custom validation to ensure passwords match
 * @param language - The language code for error messages
 * @returns Zod schema for sign-up form validation
 */
export const createSignUpSchema = (language: string = 'es') => {
  const messages = getValidationMessages(language)
  
  return z.object({
    username: z.string()
      .min(3, messages.usernameMin)
      .max(20, messages.usernameMax),
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(6, messages.passwordMin),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsDoNotMatch,
    path: ["confirmPassword"], // Specify which field the error belongs to
  })
}

// Default schemas for backward compatibility (using Spanish as default)
export const signInSchema = createSignInSchema()
export const signUpSchema = createSignUpSchema()

// TypeScript types inferred from the validation schemas
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema> 