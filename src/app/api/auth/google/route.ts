import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const oauthClient = googleClientId ? new OAuth2Client(googleClientId) : null;

export async function POST(request: NextRequest) {
  try {
    if (!googleClientId || !oauthClient) {
      return NextResponse.json(
        { error: 'Google Sign-In is not configured on server', code: 'GOOGLE_NOT_CONFIGURED' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const credential = body?.credential;

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json(
        { error: 'Google credential is required', code: 'GOOGLE_CREDENTIAL_REQUIRED' },
        { status: 400 }
      );
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json(
        { error: 'Google account email is not verified', code: 'GOOGLE_EMAIL_NOT_VERIFIED' },
        { status: 401 }
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const displayName = payload.name?.trim() || normalizedEmail.split('@')[0];

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let authUser = existing[0];

    if (!authUser) {
      const now = new Date().toISOString();
      const generatedPasswordHash = await bcrypt.hash(randomUUID(), 10);

      const created = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash: generatedPasswordHash,
          fullName: displayName,
          phone: null,
          role: 'citizen',
          trustScore: 100.0,
          department: null,
          domain: null,
          issueType: null,
          authorityLevel: null,
          employeeId: null,
          organizationRegion: null,
          organizationName: null,
          designation: null,
          verificationStatus: null,
          idPhotoUrl: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (created.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create user', code: 'USER_CREATION_FAILED' },
          { status: 500 }
        );
      }

      authUser = created[0];
    }

    if (!authUser.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated', code: 'ACCOUNT_DEACTIVATED' },
        { status: 403 }
      );
    }

    if (authUser.role === 'authority' && authUser.verificationStatus === 'pending') {
      return NextResponse.json(
        { error: 'Your authority account is pending verification. Please wait for admin approval.', code: 'VERIFICATION_PENDING' },
        { status: 403 }
      );
    }

    if (authUser.role === 'authority' && authUser.verificationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Your authority account request was rejected. Please contact administration.', code: 'VERIFICATION_REJECTED' },
        { status: 403 }
      );
    }

    const { passwordHash, ...userWithoutPassword } = authUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
