import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints } from '@/db/schema';
import { sql, isNotNull, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Query complaints with location data, group by address, and count by status
    const priorityAreas = await db
      .select({
        locationAddress: complaints.locationAddress,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        totalComplaints: sql<number>`COUNT(*)`,
        resolvedCount: sql<number>`SUM(CASE WHEN ${complaints.status} = 'resolved' THEN 1 ELSE 0 END)`,
        pendingCount: sql<number>`SUM(CASE WHEN ${complaints.status} = 'submitted' THEN 1 ELSE 0 END)`,
        inProgressCount: sql<number>`SUM(CASE WHEN ${complaints.status} IN ('assigned', 'in_progress') THEN 1 ELSE 0 END)`,
      })
      .from(complaints)
      .where(sql`${complaints.latitude} IS NOT NULL AND ${complaints.longitude} IS NOT NULL`)
      .groupBy(complaints.locationAddress)
      .having(sql`COUNT(*) >= 2`)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(20);

    // Transform the results to ensure proper typing
    const formattedAreas = priorityAreas.map(area => ({
      locationAddress: area.locationAddress || '',
      latitude: area.latitude || 0,
      longitude: area.longitude || 0,
      totalComplaints: Number(area.totalComplaints),
      resolvedCount: Number(area.resolvedCount),
      pendingCount: Number(area.pendingCount),
      inProgressCount: Number(area.inProgressCount),
    }));

    return NextResponse.json(formattedAreas, { status: 200 });
  } catch (error) {
    console.error('GET priority-areas error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}