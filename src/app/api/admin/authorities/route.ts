import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const authorities = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        department: users.department,
        domain: users.domain,
        designation: users.designation,
        employeeId: users.employeeId,
        authorityLevel: users.authorityLevel,
        verificationStatus: users.verificationStatus,
        idPhotoUrl: users.idPhotoUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          eq(users.role, 'authority'),
          eq(users.verificationStatus, status)
        )
      );

    return NextResponse.json(authorities);
  } catch (error) {
    console.error('GET authorities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authorities' },
      { status: 500 }
    );
  }
}
