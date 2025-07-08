import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { createSignUpSchema } from "@/app/lib/validations"

/**
 * POST /api/auth/register
 * 
 * Handles user registration requests by validating input data,
 * checking for duplicate users, hashing passwords, and creating new user accounts.
 * 
 * Features:
 * - Multilingual validation with language-specific error messages
 * - Duplicate email and username checking
 * - Secure password hashing with bcrypt
 * - Database transaction safety
 * - Comprehensive error handling
 * 
 * @param request - NextRequest object containing registration data
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
    const signUpSchema = createSignUpSchema(language)
    
    // Validate input data against schema (throws error if validation fails)
    const validatedData = signUpSchema.parse(body)
    
    // Check if email already exists in database
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUserByEmail) {
      // Return localized error message for duplicate email
      const errorMessage = language === 'en' 
        ? "Email already exists" 
        : "El correo electrónico ya existe"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Check if username already exists in database
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    
    if (existingUserByUsername) {
      // Return localized error message for duplicate username
      const errorMessage = language === 'en' 
        : "El nombre de usuario ya existe"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Verificar modo de registro y validar invitación si es necesario
    const registrationMode = await prisma.configuration.findUnique({
      where: { key: 'REGISTRATION_MODE' }
    });

    if (registrationMode?.value === 'closed') {
      const errorMessage = language === 'en' 
        ? "Registration is currently closed" 
        : "El registro está cerrado actualmente"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      )
    }

    if (registrationMode?.value === 'invite_only') {
      // Verificar que se proporcionó un código de invitación
      if (!validatedData.inviteCode) {
        const errorMessage = language === 'en' 
          ? "Invitation code is required" 
          : "Se requiere un código de invitación"
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }

      // Validar la invitación
      const invite = await prisma.inviteCode.findUnique({
        where: { code: validatedData.inviteCode.toUpperCase() }
      });

      if (!invite) {
        const errorMessage = language === 'en' 
          ? "Invalid invitation code" 
          : "Código de invitación inválido"
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }

      // Verificar si ya fue usada
      if (invite.usedBy) {
        const errorMessage = language === 'en' 
          ? "This invitation has already been used" 
          : "Esta invitación ya ha sido utilizada"
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }

      // Verificar si está activa
      if (!invite.isActive) {
        const errorMessage = language === 'en' 
          ? "This invitation has been deactivated" 
          : "Esta invitación ha sido desactivada"
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }

      // Verificar si ha expirado
      const now = new Date();
      if (invite.expiresAt < now) {
        const errorMessage = language === 'en' 
          ? "This invitation has expired" 
          : "Esta invitación ha expirado"
        
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }
    }
    
    // Hash password using bcrypt with salt rounds of 12 for security
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Check if this is the first user
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0

    // Create new user in database with hashed password
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: isFirstUser ? 'ADMIN' : undefined, // Assign ADMIN role to first user
        emailVerified: isFirstUser ? new Date() : undefined, // Auto-verify first user
      },
      // Only return safe user data (exclude password)
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        role: true,
        emailVerified: true,
      }
    })

    // Consumir la invitación si se proporcionó un código
    if (registrationMode?.value === 'invite_only' && validatedData.inviteCode) {
      await prisma.inviteCode.update({
        where: { code: validatedData.inviteCode.toUpperCase() },
        data: {
          usedBy: user.id,
          usedAt: new Date()
        }
      });
    }

    if (!isFirstUser) {
      // Generate email verification token
      const crypto = await import('crypto')
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: verificationToken,
          expires,
        }
      })

      // Send verification email
      try {
        const { sendVerificationEmail } = await import('@/app/lib/email')
        await sendVerificationEmail(
          user.email,
          verificationToken,
          user.username,
          language
        )
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Do not block registration
      }
    }
    
    // Return success response with localized message
    const successMessage = language === 'en' 
      ? (isFirstUser
        ? "User registered successfully. You are the admin and your email is automatically verified."
        : "User registered successfully. Please check your email to verify your account.")
      : (isFirstUser
        ? "Usuario registrado exitosamente. Eres el administrador y tu correo ha sido verificado automáticamente."
        : "Usuario registrado exitosamente. Por favor revisa tu correo para verificar tu cuenta.")

    return NextResponse.json(
      { 
        message: successMessage,
        user 
      },
      { status: 201 } // 201 Created status code
    )
    
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error en el registro:", error)
    
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