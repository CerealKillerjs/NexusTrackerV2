/**
 * GET /api/auth/check-user-status
 * 
 * Checks if a user exists and their status
 * Used to provide specific error messages for banned users
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const login = searchParams.get('login');

    if (!login) {
      return NextResponse.json(
        { error: 'Login parameter is required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { username: login }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { exists: false, status: null }
      );
    }

    return NextResponse.json({
      exists: true,
      status: user.status,
      username: user.username,
      email: user.email
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 