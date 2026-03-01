import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, complaints, users } from '@/db/schema';
import { eq, desc, and, avg, count } from 'drizzle-orm';
import {
  calculateBaseTrustScoreFromFeedback,
  calculateCitizenTrustScore,
  calculateAuthorityTrustScore,
} from '@/lib/utils/trust-score';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

    if (isNaN(complaintId)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }

    const feedbackList = await db
      .select()
      .from(feedback)
      .where(eq(feedback.complaintId, complaintId))
      .orderBy(desc(feedback.createdAt));

    return NextResponse.json(feedbackList, { status: 200 });
  } catch (error) {
    console.error('GET feedback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);
    if (isNaN(complaintId)) {
      return NextResponse.json({ error: 'Invalid complaint ID' }, { status: 400 });
    }

    const body = await request.json();
    const { userId, rating, comment, type } = body;

    if (!userId || rating === undefined || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get complaint to find target user
    const complaintData = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (complaintData.length === 0) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const complaint = complaintData[0];
    let targetUserId: number | null = null;

    if (type === 'citizen_to_authority') {
      targetUserId = complaint.assignedTo ?? null;
      if (!targetUserId) {
        return NextResponse.json({ error: 'No authority assigned to this complaint' }, { status: 400 });
      }
    } else if (type === 'authority_to_citizen') {
      targetUserId = complaint.userId ?? null;
    } else {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    // Insert feedback
    await db.insert(feedback).values({
      complaintId,
      userId,
      targetUserId: targetUserId!,
      rating,
      comment,
      type,
      createdAt: new Date().toISOString(),
    });
    if (!targetUserId) {
      // Safety check – should be unreachable because of earlier guards
      return NextResponse.json({ error: 'Target user not found for feedback' }, { status: 400 });
    }

    // Get target user role to choose citizen/authority path
    const targetUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const targetUser = targetUsers[0];

    // 1) Feedback-based Bayesian core score (0–100)
    const [userFeedbackStats] = await db
      .select({
        averageRating: avg(feedback.rating),
        ratingCount: count(),
      })
      .from(feedback)
      .where(
        and(
          eq(feedback.targetUserId, targetUserId),
          eq(feedback.type, type),
        ),
      );

    const [globalFeedbackStats] = await db
      .select({
        averageRating: avg(feedback.rating),
      })
      .from(feedback)
      .where(eq(feedback.type, type));

    const userAverageRating = userFeedbackStats?.averageRating
      ? parseFloat(userFeedbackStats.averageRating as unknown as string)
      : 0;

    const ratingCount = Number(userFeedbackStats?.ratingCount ?? 0);

    const globalAverageRating = globalFeedbackStats?.averageRating
      ? parseFloat(globalFeedbackStats.averageRating as unknown as string)
      : 3.5; // reasonable default if no global data yet

    const baseScore = calculateBaseTrustScoreFromFeedback({
      userAverageRating,
      globalAverageRating,
      ratingCount,
      priorCount: 10,
    });

    let newTrustScore = baseScore;

    // 2) Role-specific behavior adjustments
    if (targetUser.role === 'citizen') {
      // Citizen: activity based on complaints submitted
      const complaintsCountResult = await db
        .select({ count: count() })
        .from(complaints)
        .where(eq(complaints.userId, targetUserId));

      const totalComplaints = Number(complaintsCountResult[0]?.count ?? 0);

      newTrustScore = calculateCitizenTrustScore({
        baseScore,
        totalComplaints,
      });
    } else if (targetUser.role === 'authority') {
      // Authority: resolution and escalation behavior based on assigned complaints
      const [assignedResult] = await db
        .select({ count: count() })
        .from(complaints)
        .where(eq(complaints.assignedTo, targetUserId));

      const [resolvedResult] = await db
        .select({ count: count() })
        .from(complaints)
        .where(
          and(
            eq(complaints.assignedTo, targetUserId),
            eq(complaints.status, 'resolved'),
          ),
        );

      const [escalatedResult] = await db
        .select({ count: count() })
        .from(complaints)
        .where(
          and(
            eq(complaints.assignedTo, targetUserId),
            eq(complaints.status, 'escalated'),
          ),
        );

      const assignedComplaints = Number(assignedResult?.count ?? 0);
      const resolvedComplaints = Number(resolvedResult?.count ?? 0);
      const escalatedComplaints = Number(escalatedResult?.count ?? 0);

      // For now, we leave avgResponseHours as undefined (neutral effect)
      newTrustScore = calculateAuthorityTrustScore({
        baseScore,
        assignedComplaints,
        resolvedComplaints,
        escalatedComplaints,
      });
    }

    await db
      .update(users)
      .set({ trustScore: newTrustScore })
      .where(eq(users.id, targetUserId));

    return NextResponse.json({ success: true, newTrustScore }, { status: 201 });
  } catch (error) {
    console.error('POST feedback error:', error);
    return NextResponse.json({ error: 'Internal error: ' + (error as Error).message }, { status: 500 });
  }
}
