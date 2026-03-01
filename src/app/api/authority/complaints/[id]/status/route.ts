import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length || user[0].role !== 'authority') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const complaint = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (!complaint.length) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const authUser = user[0];
    const userLevel = authUser.authorityLevel || 1;
    const comp = complaint[0];

    let canUpdate = false;
    if (userLevel === 1 && comp.assignedTo === authUser.id) {
      canUpdate = true;
    } else if (userLevel === 2 && comp.department === authUser.department) {
      canUpdate = true;
    } else if (userLevel === 3 && comp.domain === authUser.domain) {
      canUpdate = true;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'You do not have permission to update this complaint' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'assigned' && !comp.assignedTo && userLevel === 1) {
      updateData.assignedTo = userId;
    }

    if (status === 'in_progress' && !comp.assignedTo) {
      updateData.assignedTo = userId;
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }

    await db
      .update(complaints)
      .set(updateData)
      .where(eq(complaints.id, complaintId));

    // Create notification for the citizen
    if (comp.userId) {
      const statusTitles: Record<string, string> = {
        'in_progress': 'Complaint In Progress',
        'resolved': 'Complaint Resolved',
        'rejected': 'Complaint Rejected',
        'assigned': 'Complaint Assigned'
      };

      const statusMessages: Record<string, string> = {
        'in_progress': `Your complaint "${comp.title}" is now being processed.`,
        'resolved': `Great news! Your complaint "${comp.title}" has been marked as resolved.`,
        'rejected': `Your complaint "${comp.title}" was not accepted. Please check the details.`,
        'assigned': `Your complaint "${comp.title}" has been assigned to an official.`
      };

      await db.insert(notifications).values({
        userId: comp.userId,
        complaintId: comp.id,
        title: statusTitles[status] || 'Complaint Updated',
        message: statusMessages[status] || `The status of your complaint "${comp.title}" has been updated to ${status}.`,
        type: 'complaint_status',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
