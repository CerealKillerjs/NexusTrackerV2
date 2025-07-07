import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { createPasswordResetSchema } from "@/app/lib/validations"

/**
 * POST /api/auth/reset-password
 * 
 * Handles password reset by validating the reset token,
 * checking expiration, and updating the user's password.
 * 
 * Features:
 * - Token validation and expiration checking
 * - Secure password hashing with bcrypt
 * - Multilingual validation with language-specific error messages
 * - Automatic token cleanup after successful reset
 * 
 * @param request - NextRequest object containing token, password, and confirmPassword
 * @returns NextResponse with success/error status and appropriate messages
 */
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body from request
    const body = await request.json()
    
    // Extract language preference from request headers for localized validation
    const acceptLanguage = request.headers.get('accept-language') || 'es'
    const language = acceptLanguage.startsWith('en') ? 'en' : 'es'
    
    // Create validation schema with appropriate language for error messages
    const passwordResetSchema = createPasswordResetSchema(language)
    
    // Validate input data against schema (throws error if validation fails)
    const validatedData = passwordResetSchema.parse(body)
    
    // Find the reset token in database
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedData.token }
    })
    
    if (!resetToken) {
      const errorMessage = language === 'en' 
        ? "Invalid or expired reset token" 
        : "Token de restablecimiento inválido o expirado"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token: validatedData.token }
      })
      
      const errorMessage = language === 'en' 
        ? "Reset token has expired. Please request a new one." 
        : "El token de restablecimiento ha expirado. Por favor solicita uno nuevo."
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })
    
    if (!user) {
      const errorMessage = language === 'en' 
        ? "User not found" 
        : "Usuario no encontrado"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      )
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    // Delete the used reset token
    await prisma.passwordResetToken.delete({
      where: { token: validatedData.token }
    })
    
    // Return success response with localized message
    const successMessage = language === 'en' 
      ? "Password has been reset successfully. You can now sign in with your new password." 
      : "La contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña."
    
    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    )
    
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error in password reset:", error)
    
    // Handle Zod validation errors (invalid input data)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Handle unexpected server errors
    const errorMessage = "Error interno del servidor"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 