import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { createPasswordResetRequestSchema } from "@/app/lib/validations"
import { sendPasswordResetEmail } from "@/app/lib/email"
import crypto from "crypto"
import i18next from 'i18next'


/**
 * POST /api/auth/forgot-password
 * 
 * Handles password reset requests by validating the user exists,
 * generating a secure reset token, and sending a reset email.
 * 
 * Features:
 * - Multilingual validation with language-specific error messages
 * - Secure token generation using crypto
 * - Email sending with localized content
 * - Token expiration (1 hour)
 * - Duplicate token prevention
 * 
 * @param request - NextRequest object containing login (email or username)
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
    const passwordResetSchema = createPasswordResetRequestSchema(language)
    
    // Validate input data against schema (throws error if validation fails)
    const validatedData = passwordResetSchema.parse(body)
    
    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.login },
          { username: validatedData.login }
        ]
      }
    })
    
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      const successMessage = language === 'en' 
        ? "If an account with that email/username exists, a password reset link has been sent." 
        : "Si existe una cuenta con ese correo/usuario, se ha enviado un enlace de restablecimiento de contraseña."
      
      return NextResponse.json(
        { message: successMessage },
        { status: 200 }
      )
    }
    
    // Check if email sending is enabled
    const emailEnabledConfig = await prisma.configuration.findUnique({ where: { key: 'EMAIL_ENABLED' } })
    const emailEnabled = !emailEnabledConfig || String(emailEnabledConfig.value).toLowerCase() !== 'false'
    if (!emailEnabled) {
      const errorMessage = i18next.t('auth.forgotPassword.resetPasswordError', { lng: language })
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      )
    }
    
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Set expiration time (1 hour from now)
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    
    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })
    
    // Create new reset token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: resetToken,
        expires: expires,
      }
    })
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
        language
      )
    } catch (emailError) {
      // If email fails, delete the token and return error
      await prisma.passwordResetToken.delete({
        where: { token: resetToken }
      })
      console.error('Email sending failed:', emailError)
      const errorMessage = i18next.t('auth.forgotPassword.error', { lng: language })
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
    
    // Return success response with localized message
    const successMessage = language === 'en' 
      ? "If an account with that email/username exists, a password reset link has been sent." 
      : "Si existe una cuenta con ese correo/usuario, se ha enviado un enlace de restablecimiento de contraseña."
    
    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    )
    
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error in password reset request:", error)
    
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