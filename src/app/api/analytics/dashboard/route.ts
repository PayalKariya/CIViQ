import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users, feedback } from '@/db/schema';
import { eq, or, sql, count, avg } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate total complaints
    const totalComplaintsResult = await db
      .select({ count: count() })
      .from(complaints);
    const totalComplaints = totalComplaintsResult[0]?.count || 0;

    // Calculate total users
    const totalUsersResult = await db
      .select({ count: count() })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Calculate total resolved complaints
    const totalResolvedResult = await db
      .select({ count: count() })
      .from(complaints)
      .where(eq(complaints.status, 'resolved'));
    const totalResolved = totalResolvedResult[0]?.count || 0;

    // Calculate total pending complaints (submitted OR assigned)
    const totalPendingResult = await db
      .select({ count: count() })
      .from(complaints)
      .where(
        or(
          eq(complaints.status, 'submitted'),
          eq(complaints.status, 'assigned')
        )
      );
    const totalPending = totalPendingResult[0]?.count || 0;

    // Calculate total in progress complaints
    const totalInProgressResult = await db
      .select({ count: count() })
      .from(complaints)
      .where(eq(complaints.status, 'in_progress'));
    const totalInProgress = totalInProgressResult[0]?.count || 0;

    // Calculate average rating from feedback
    const averageRatingResult = await db
      .select({ avgRating: avg(feedback.rating) })
      .from(feedback);
    const averageRating = averageRatingResult[0]?.avgRating 
      ? Math.round(parseFloat(averageRatingResult[0].avgRating) * 100) / 100 
      : 0;

    // Get complaints grouped by status
    const complaintsByStatusResult = await db
      .select({
        status: complaints.status,
        count: count()
      })
      .from(complaints)
      .groupBy(complaints.status);
    const complaintsByStatus = complaintsByStatusResult.map(item => ({
      status: item.status,
      count: item.count
    }));

    // Get complaints grouped by category
    const complaintsByCategoryResult = await db
      .select({
        category: complaints.category,
        count: count()
      })
      .from(complaints)
      .groupBy(complaints.category);
    const complaintsByCategory = complaintsByCategoryResult.map(item => ({
      category: item.category,
      count: item.count
    }));

    // Get complaints grouped by priority
    const complaintsByPriorityResult = await db
      .select({
        priority: complaints.priority,
        count: count()
      })
      .from(complaints)
      .groupBy(complaints.priority);
    const complaintsByPriority = complaintsByPriorityResult.map(item => ({
      priority: item.priority,
      count: item.count
    }));

    return NextResponse.json({
      totalComplaints,
      totalUsers,
      totalResolved,
      totalPending,
      totalInProgress,
      averageRating,
      complaintsByStatus,
      complaintsByCategory,
      complaintsByPriority
    }, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'ANALYTICS_ERROR'
    }, { status: 500 });
  }
}