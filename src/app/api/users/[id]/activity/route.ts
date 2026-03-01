import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '50'),
      200
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query activity logs for the specified user
    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('GET activity logs error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}