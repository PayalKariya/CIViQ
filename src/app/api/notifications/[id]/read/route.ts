import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract and validate ID from route parameter
    const { id } = await params;
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid notification ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const notificationId = parseInt(id);

    // Check if notification exists
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId))
      .limit(1);

    if (existingNotification.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update notification to mark as read
    const updatedNotification = await db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    if (updatedNotification.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update notification', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedNotification[0], { status: 200 });
  } catch (error) {
    console.error('PATCH /api/notifications/[id]/read error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}