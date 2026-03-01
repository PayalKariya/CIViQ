import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints } from '@/db/schema';
import { eq, isNotNull, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get optional filter parameters
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    // Build query conditions
    const conditions = [
      isNotNull(complaints.latitude),
      isNotNull(complaints.longitude)
    ];

    // Add optional filters
    if (category) {
      conditions.push(eq(complaints.category, category));
    }

    if (status) {
      conditions.push(eq(complaints.status, status));
    }

    if (priority) {
      conditions.push(eq(complaints.priority, priority));
    }

    // Execute query with filters
    const results = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        category: complaints.category,
        priority: complaints.priority,
        status: complaints.status,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        locationAddress: complaints.locationAddress,
        createdAt: complaints.createdAt,
      })
      .from(complaints)
      .where(and(...conditions))
      .orderBy(desc(complaints.createdAt))
      .limit(500);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET /api/complaints/map error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}