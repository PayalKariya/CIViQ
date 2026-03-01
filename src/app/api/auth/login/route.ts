import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'EMAIL_REQUIRED' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'PASSWORD_REQUIRED' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    // Query database to find user by email (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Check if user exists
    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Check if user account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
        { status: 403 }
      );
    }

    if (user.role === 'authority' && user.verificationStatus === 'pending') {
      return NextResponse.json(
        { error: 'Your authority account is pending verification. Please wait for admin approval.', code: 'VERIFICATION_PENDING' },
        { status: 403 }
      );
    }

    if (user.role === 'authority' && user.verificationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Your authority account request was rejected. Please contact administration.', code: 'VERIFICATION_REJECTED' },
        { status: 403 }
      );
    }

    // Return user object without passwordHash
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}