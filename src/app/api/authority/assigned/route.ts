import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId');
    const statusParam = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate userId is provided
    if (!userIdParam) {
      return NextResponse.json(
        { 
          error: 'userId parameter is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    const userId = parseInt(userIdParam);
    if (isNaN(userId)) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(complaints.assignedTo, userId)];

    // Add optional status filter
    if (statusParam) {
      conditions.push(eq(complaints.status, statusParam));
    }

    // Query complaints assigned to the authority user
    const assignedComplaints = await db
      .select()
      .from(complaints)
      .where(and(...conditions))
      .orderBy(desc(complaints.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(assignedComplaints, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}