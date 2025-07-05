import { z } from "zod"

// Helper function to get validation messages
const getValidationMessages = (language: string = 'es') => {
  const messages = {
    es: {
      invalidEmail: "Email inválido",
      passwordMin: "La contraseña debe tener al menos 6 caracteres",
      usernameMin: "El nombre de usuario debe tener al menos 3 caracteres",
      usernameMax: "El nombre de usuario no puede tener más de 20 caracteres",
      passwordsDoNotMatch: "Las contraseñas no coinciden"
    },
    en: {
      invalidEmail: "Invalid email",
      passwordMin: "Password must be at least 6 characters",
      usernameMin: "Username must be at least 3 characters",
      usernameMax: "Username cannot be more than 20 characters",
      passwordsDoNotMatch: "Passwords do not match"
    }
  }
  
  return messages[language as keyof typeof messages] || messages.es
}

// Create validation schemas with dynamic messages
export const createSignInSchema = (language: string = 'es') => {
  const messages = getValidationMessages(language)
  
  return z.object({
    email: z.string().email(messages.invalidEmail),
    password: z.string().min(6, messages.passwordMin),
  })
}

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
    path: ["confirmPassword"],
  })
}

// Default schemas (for backward compatibility)
export const signInSchema = createSignInSchema()
export const signUpSchema = createSignUpSchema()

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema> 