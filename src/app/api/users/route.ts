import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const isActiveParam = searchParams.get('isActive');

    // Build conditions array
    const conditions = [];

    // Add role filter if provided
    if (role) {
      conditions.push(eq(users.role, role));
    }

    // Add department filter if provided
    if (department) {
      conditions.push(eq(users.department, department));
    }

    // Add isActive filter if provided
    if (isActiveParam !== null) {
      const isActive = isActiveParam === 'true';
      conditions.push(eq(users.isActive, isActive));
    }

    // Add search filter if provided
    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    // Build query
    let query = db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      role: users.role,
      trustScore: users.trustScore,
      department: users.department,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);

    // Apply filters if any conditions exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination and execute query
    const results = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}