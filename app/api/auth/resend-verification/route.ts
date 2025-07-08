import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendVerificationEmail } from '@/app/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const login = body.login;
    if (!login) {
      return NextResponse.json({ error: 'Missing login.' }, { status: 400 });
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { username: login }
        ]
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified.' }, { status: 400 });
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires,
      }
    });

    // Send verification email
    await sendVerificationEmail(
      user.email,
      verificationToken,
      user.username,
      'en' // Optionally detect language
    );

    return NextResponse.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (error) {
    console.error('Error in resend verification:', error);
    return NextResponse.json({ error: 'Failed to resend verification email.' }, { status: 500 });
  }
} 