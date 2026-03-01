import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isReadParam = searchParams.get('isRead');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate userId is provided
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId query parameter is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { 
          error: 'userId must be a valid integer',
          code: 'INVALID_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = [eq(notifications.userId, parsedUserId)];

    // Add isRead filter if provided
    if (isReadParam !== null) {
      const isRead = isReadParam === 'true';
      conditions.push(eq(notifications.isRead, isRead));
    }

    // Execute query with filters
    const results = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET notifications error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}