import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid complaint ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const complaintId = parseInt(id);

    const logs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.complaintId, complaintId))
      .orderBy(desc(activityLogs.createdAt));

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('GET complaint activity logs error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
