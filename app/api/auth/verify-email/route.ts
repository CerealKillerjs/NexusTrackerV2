import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  }

  // Find the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return NextResponse.json({ error: 'Invalid or expired verification token.' }, { status: 400 });
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: 'Verification token has expired.' }, { status: 400 });
  }

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  // Set emailVerified
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ message: 'Email verified successfully.' });
} 