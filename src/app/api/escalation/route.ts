import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users, notifications } from '@/db/schema';
import { eq, and, lte, or, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Level 1 -> Level 2: Unresolved after 2 weeks
    const l1Complaints = await db
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.escalationLevel, 1),
          lte(complaints.createdAt, twoWeeksAgo),
          or(
            eq(complaints.status, 'submitted'),
            eq(complaints.status, 'assigned'),
            eq(complaints.status, 'in_progress')
          )
        )
      );

    for (const comp of l1Complaints) {
      await db
        .update(complaints)
        .set({
          escalationLevel: 2,
          status: 'escalated',
          escalatedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .where(eq(complaints.id, comp.id));

      if (comp.userId) {
        await db.insert(notifications).values({
          userId: comp.userId,
          complaintId: comp.id,
          title: 'Complaint Escalated (Level 2)',
          message: `Your complaint "${comp.title}" has been automatically escalated to Level 2 (Supervisor) as it remained unresolved for 2 weeks.`,
          type: 'escalation',
          createdAt: now.toISOString(),
        });
      }
    }

    // 2. Level 2 -> Level 3: Unresolved after 1 week of being at Level 2
    const l2Complaints = await db
      .select()
      .from(complaints)
      .where(
        and(
          eq(complaints.escalationLevel, 2),
          lte(complaints.escalatedAt, oneWeekAgo),
          or(
            eq(complaints.status, 'submitted'),
            eq(complaints.status, 'assigned'),
            eq(complaints.status, 'in_progress'),
            eq(complaints.status, 'escalated')
          )
        )
      );

    for (const comp of l2Complaints) {
      await db
        .update(complaints)
        .set({
          escalationLevel: 3,
          status: 'escalated',
          escalatedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
        .where(eq(complaints.id, comp.id));

      if (comp.userId) {
        await db.insert(notifications).values({
          userId: comp.userId,
          complaintId: comp.id,
          title: 'Complaint Escalated (Level 3)',
          message: `Your complaint "${comp.title}" has been escalated to Level 3 (Domain Officer) for final resolution.`,
          type: 'escalation',
          createdAt: now.toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      escalatedToL2: l1Complaints.length,
      escalatedToL3: l2Complaints.length,
    });
  } catch (error) {
    console.error('Escalation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
