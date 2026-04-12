import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    let body: { userId?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const raw = body.userId;
    const userId =
      typeof raw === 'number' && !Number.isNaN(raw)
        ? raw
        : typeof raw === 'string'
          ? parseInt(raw, 10)
          : NaN;

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { error: 'userId is required in the request body', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning({ id: notifications.id });

    return NextResponse.json({ cleared: updated.length }, { status: 200 });
  } catch (error) {
    console.error('POST /api/notifications/read-all error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
