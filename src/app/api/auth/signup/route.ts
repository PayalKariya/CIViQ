import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { sendAuthorityVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role, 
      department, 
      domain, 
      authorityLevel, 
      employeeId, 
      organizationRegion,
      organizationName,
      designation, 
      idPhotoUrl, 
      issueType 
    } = body;

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

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required', code: 'FULLNAME_REQUIRED' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase) {
      return NextResponse.json(
        { error: 'Password must contain at least 1 uppercase letter', code: 'PASSWORD_NO_UPPERCASE' },
        { status: 400 }
      );
    }

    if (!hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain at least 1 number', code: 'PASSWORD_NO_NUMBER' },
        { status: 400 }
      );
    }

    if (role === 'authority') {
      if (!organizationRegion) {
        return NextResponse.json(
          { error: 'Organization Region is required for authority accounts', code: 'REGION_REQUIRED' },
          { status: 400 }
        );
      }
      if (!organizationName) {
        return NextResponse.json(
          { error: 'Organization Name is required for authority accounts', code: 'ORG_NAME_REQUIRED' },
          { status: 400 }
        );
      }
      if (!authorityLevel || authorityLevel < 1 || authorityLevel > 3) {
        return NextResponse.json(
          { error: 'Valid authority level (1-3) is required', code: 'AUTHORITY_LEVEL_REQUIRED' },
          { status: 400 }
        );
      }
      if (!designation) {
        return NextResponse.json(
          { error: 'Designation is required for authority accounts', code: 'DESIGNATION_REQUIRED' },
          { status: 400 }
        );
      }
      if (!domain) {
        return NextResponse.json(
          { error: 'Domain is required for all authority accounts', code: 'DOMAIN_REQUIRED' },
          { status: 400 }
        );
      }
      if (authorityLevel !== 3 && !department) {
        return NextResponse.json(
          { error: 'Department is required for Level 1 & 2 authorities', code: 'DEPARTMENT_REQUIRED' },
          { status: 400 }
        );
      }
      if (authorityLevel === 1 && !issueType) {
        return NextResponse.json(
          { error: 'Issue type is required for Level 1 Ground Workers', code: 'ISSUE_TYPE_REQUIRED' },
          { status: 400 }
        );
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const ADMIN_EMAILS = ['anugawarrier@gmail.com', 'kariyapayal19@gmail.com', 'manalisuryavanshi666@gmail.com'];
    const isSpecialAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    const now = new Date().toISOString();
    const userData = {
      email: normalizedEmail,
      passwordHash,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : null,
      role: isSpecialAdmin ? 'admin' : (role || 'citizen'),
      trustScore: 100.0,
      department: (role === 'authority' && authorityLevel !== 3 && department) ? department.trim() : null,
      domain: (role === 'authority' && domain) ? domain.trim() : null,
        issueType: (role === 'authority' && authorityLevel === 1 && issueType) ? issueType.trim() : null,
        authorityLevel: role === 'authority' ? authorityLevel : null,
        employeeId: (role === 'authority' && employeeId) ? employeeId.trim() : null,
        organizationRegion: (role === 'authority' && organizationRegion) ? organizationRegion.trim() : null,
        organizationName: (role === 'authority' && organizationName) ? organizationName.trim() : null,
        designation: role === 'authority' ? designation.trim() : null,
        verificationStatus: isSpecialAdmin ? 'verified' : (role === 'authority' ? 'pending' : null),
      idPhotoUrl: role === 'authority' ? idPhotoUrl : null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const newUser = await db
      .insert(users)
      .values(userData)
      .returning();

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user', code: 'USER_CREATION_FAILED' },
        { status: 500 }
      );
    }

    const { passwordHash: _, ...userResponse } = newUser[0];

    if (role === 'authority' && !isSpecialAdmin) {
      await sendAuthorityVerificationEmail({
        fullName: fullName.trim(),
        email: normalizedEmail,
        department: authorityLevel === 3 ? domain.trim() : department.trim(),
        designation: designation.trim(),
        employeeId: employeeId ? employeeId.trim() : undefined,
        organizationRegion: organizationRegion.trim(),
        organizationName: organizationName.trim(),
        authorityLevel: authorityLevel,
      });
    }

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
