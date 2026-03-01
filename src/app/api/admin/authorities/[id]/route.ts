import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendAuthorityApprovalEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = existingUser[0];

    if (user.role !== 'authority') {
      return NextResponse.json(
        { error: 'User is not an authority' },
        { status: 400 }
      );
    }

    const verificationStatus = action === 'approve' ? 'verified' : 'rejected';
    const isActive = action === 'approve';

    const updatedUser = await db
      .update(users)
      .set({
        verificationStatus,
        isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    await sendAuthorityApprovalEmail({
      email: user.email,
      fullName: user.fullName,
      approved: action === 'approve',
      reason: reason,
    });

    return NextResponse.json({
      message: `Authority ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('PATCH authority error:', error);
    return NextResponse.json(
      { error: 'Failed to update authority status' },
      { status: 500 }
    );
  }
}
