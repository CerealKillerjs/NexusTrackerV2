import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/prisma"
import { validateInviteLimit } from "@/app/lib/invite-limits"

/**
 * GET /api/admin/users/[id]
 * 
 * Gets a user by ID for editing
 * Only accessible by administrators
 * 
 * @param request - NextRequest object
 * @param params - Object containing user ID
 * @returns NextResponse with user data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        uploaded: true,
        downloaded: true,
        ratio: true,
        bonusPoints: true,
        passkey: true,
        availableInvites: true,
        _count: {
          select: {
            torrents: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Format user data
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      uploaded: user.uploaded.toString(),
      downloaded: user.downloaded.toString(),
      ratio: user.ratio,
      bonusPoints: user.bonusPoints,
      passkey: user.passkey,
      uploadCount: user._count.torrents,
      availableInvites: user.availableInvites
    }

    return NextResponse.json(formattedUser)

  } catch (error) {
    console.error('Error fetching user:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[id]
 * 
 * Updates a user by ID
 * Only accessible by administrators
 * 
 * @param request - NextRequest object
 * @param params - Object containing user ID
 * @returns NextResponse with success/error status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { id: userId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.username || !body.email || !body.role || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check for duplicate username (if changed)
    if (body.username !== existingUser.username) {
      const duplicateUsername = await prisma.user.findUnique({
        where: { username: body.username }
      })
      if (duplicateUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate email (if changed)
    let emailChanged = false;
    if (body.email !== existingUser.email) {
      emailChanged = true;
      const duplicateEmail = await prisma.user.findUnique({
        where: { email: body.email }
      })
      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      username: body.username,
      email: body.email,
      role: body.role,
      status: body.status
    }

    // Handle email verification and notifications if email changed
    if (emailChanged) {
      updateData.emailVerified = null;
      // Generate new verification token
      const crypto = await import('crypto');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await prisma.verificationToken.deleteMany({ where: { identifier: body.email } });
      await prisma.verificationToken.create({
        data: {
          identifier: body.email,
          token: verificationToken,
          expires,
        }
      });
      // Send verification email to new email
      try {
        const { sendVerificationEmail, sendEmailChangeSecurityAlert } = await import('@/app/lib/email');
        await sendVerificationEmail(
          body.email,
          verificationToken,
          body.username,
          'en'
        );
        // Send security alert to old email
        await sendEmailChangeSecurityAlert(
          existingUser.email,
          existingUser.email,
          body.email,
          body.username,
          'en'
        );
      } catch (emailError) {
        console.error('Failed to send verification or security alert email:', emailError);
      }
    } else {
      // Handle email verification toggle (if not changed)
      if (body.isEmailVerified && !existingUser.emailVerified) {
        updateData.emailVerified = new Date();
      } else if (!body.isEmailVerified && existingUser.emailVerified) {
        updateData.emailVerified = null;
      }
    }

    // Handle available invitations update
    if (typeof body.availableInvites === 'number' && body.availableInvites >= 0) {
      // Validate invitation limit
      const validation = await validateInviteLimit(
        existingUser.availableInvites || 0,
        body.availableInvites,
        body.role
      );

      if (!validation.valid) {
        return NextResponse.json({ 
          error: validation.error,
          maxAllowed: validation.maxAllowed
        }, { status: 400 });
      }

      updateData.availableInvites = body.availableInvites;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        isEmailVerified: !!updatedUser.emailVerified
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * 
 * Deletes a user by ID
 * Only accessible by administrators
 * 
 * @param request - NextRequest object
 * @param params - Object containing user ID
 * @returns NextResponse with success/error status
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the current session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const { id: userId } = await params

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true }
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (userToDelete.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Prevent deletion of other admins (optional security measure)
    if (userToDelete.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete admin accounts' },
        { status: 400 }
      )
    }

    // Delete user (this will cascade delete related data due to Prisma relations)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: `User ${userToDelete.username} deleted successfully`
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 