import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints } from '@/db/schema';
import { sql, eq, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Query to get complaints grouped by category with status counts
    const categoryStats = await db
      .select({
        category: complaints.category,
        total: sql<number>`count(*)`,
        resolved: sql<number>`sum(case when ${complaints.status} = 'resolved' then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${complaints.status} in ('submitted', 'assigned') then 1 else 0 end)`,
        inProgress: sql<number>`sum(case when ${complaints.status} = 'in_progress' then 1 else 0 end)`,
      })
      .from(complaints)
      .groupBy(complaints.category)
      .orderBy(sql`count(*) desc`);

    // Transform the results to ensure proper number types
    const formattedStats = categoryStats.map((stat) => ({
      category: stat.category,
      total: Number(stat.total),
      resolved: Number(stat.resolved),
      pending: Number(stat.pending),
      inProgress: Number(stat.inProgress),
    }));

    return NextResponse.json(formattedStats, { status: 200 });
  } catch (error) {
    console.error('GET complaints-by-category error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}