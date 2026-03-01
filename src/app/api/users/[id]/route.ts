import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Query database to find user by id
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user[0];

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET user error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const { fullName, phone, department, trustScore, isActive } = body;

    // Check if user exists first
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: {
      fullName?: string;
      phone?: string | null;
      department?: string | null;
      trustScore?: number;
      isActive?: boolean;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim() === '') {
        return NextResponse.json(
          { error: 'Full name must be a non-empty string', code: 'INVALID_FULL_NAME' },
          { status: 400 }
        );
      }
      updateData.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (department !== undefined) {
      updateData.department = department;
    }

    if (trustScore !== undefined) {
      if (typeof trustScore !== 'number') {
        return NextResponse.json(
          { error: 'Trust score must be a number', code: 'INVALID_TRUST_SCORE' },
          { status: 400 }
        );
      }
      updateData.trustScore = trustScore;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean', code: 'INVALID_IS_ACTIVE' },
          { status: 400 }
        );
      }
      updateData.isActive = isActive;
    }

    // Update user with provided fields
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('PATCH user error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}