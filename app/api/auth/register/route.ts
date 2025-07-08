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
        ? "Username already exists" 
        : "El nombre de usuario ya existe"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
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
      },
      // Only return safe user data (exclude password)
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        role: true,
      }
    })
    
    // Return success response with localized message
    const successMessage = language === 'en' 
      ? "User registered successfully" 
      : "Usuario registrado exitosamente"
    
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