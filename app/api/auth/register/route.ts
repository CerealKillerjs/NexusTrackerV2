import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/app/lib/prisma"
import { createSignUpSchema } from "@/app/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get language from request headers or default to Spanish
    const acceptLanguage = request.headers.get('accept-language') || 'es'
    const language = acceptLanguage.startsWith('en') ? 'en' : 'es'
    
    // Create validation schema with the appropriate language
    const signUpSchema = createSignUpSchema(language)
    
    // Validar los datos de entrada
    const validatedData = signUpSchema.parse(body)
    
    // Verificar si el email ya existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUserByEmail) {
      const errorMessage = language === 'en' 
        ? "Email already exists" 
        : "El correo electrónico ya existe"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Verificar si el username ya existe
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: validatedData.username }
    })
    
    if (existingUserByUsername) {
      const errorMessage = language === 'en' 
        ? "Username already exists" 
        : "El nombre de usuario ya existe"
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    })
    
    const successMessage = language === 'en' 
      ? "User registered successfully" 
      : "Usuario registrado exitosamente"
    
    return NextResponse.json(
      { 
        message: successMessage,
        user 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error("Error en el registro:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    const errorMessage = "Error interno del servidor"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 