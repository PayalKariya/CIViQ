import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users } from '@/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const department = searchParams.get('department');
    const authorityLevel = searchParams.get('authorityLevel');
    const status = searchParams.get('status');
    const includeMap = searchParams.get('includeMap') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!user.length || user[0].role !== 'authority') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const authUser = user[0];
    const userDepartment = department || authUser.department;
    const userLevel = authorityLevel ? parseInt(authorityLevel) : authUser.authorityLevel;

    if (!userDepartment) {
      return NextResponse.json({ error: 'No department assigned' }, { status: 400 });
    }

    const conditions = [eq(complaints.category, userDepartment)];

    if (userLevel && userLevel < 3) {
      conditions.push(
        or(
          sql`${complaints.escalationLevel} IS NULL`,
          sql`${complaints.escalationLevel} <= ${userLevel}`
        )!
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(complaints.status, status));
    }

    const results = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        description: complaints.description,
        category: complaints.category,
        priority: complaints.priority,
        status: complaints.status,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        locationAddress: complaints.locationAddress,
        imageUrl: complaints.imageUrl,
        isAnonymous: complaints.isAnonymous,
        assignedTo: complaints.assignedTo,
        escalationLevel: complaints.escalationLevel,
        escalationDeadline: complaints.escalationDeadline,
        resolvedAt: complaints.resolvedAt,
        escalatedAt: complaints.escalatedAt,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
      })
      .from(complaints)
      .where(and(...conditions))
      .orderBy(
        sql`CASE ${complaints.priority} 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
          ELSE 5 END`,
        desc(complaints.createdAt)
      );

    const total = results.length;
    const pending = results.filter(c => c.status === 'submitted' || c.status === 'assigned').length;
    const inProgress = results.filter(c => c.status === 'in_progress').length;
    const resolved = results.filter(c => c.status === 'resolved').length;
    const escalated = results.filter(c => c.status === 'escalated').length;
    const critical = results.filter(c => c.priority === 'critical' && c.status !== 'resolved').length;

    if (includeMap) {
      const mapData = results
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          priority: c.priority,
          status: c.status,
          latitude: c.latitude,
          longitude: c.longitude,
          locationAddress: c.locationAddress,
          escalationLevel: c.escalationLevel,
        }));

      return NextResponse.json({
        complaints: results,
        mapData,
        stats: { total, pending, inProgress, resolved, escalated, critical },
      });
    }

    return NextResponse.json({
      complaints: results,
      stats: { total, pending, inProgress, resolved, escalated, critical },
    });
  } catch (error) {
    console.error('Error fetching department complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { complaintId, userId, status, notes } = body;

    if (!complaintId || !userId || !status) {
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

    if (complaint[0].category !== user[0].department) {
      return NextResponse.json(
        { error: 'You can only update complaints in your department' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'in_progress' && !complaint[0].assignedTo) {
      updateData.assignedTo = userId;
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date().toISOString();
    }

    if (status === 'escalated') {
      const newLevel = (complaint[0].escalationLevel || 1) + 1;
      updateData.escalationLevel = Math.min(newLevel, 3);
      updateData.escalatedAt = new Date().toISOString();
    }

    await db
      .update(complaints)
      .set(updateData)
      .where(eq(complaints.id, complaintId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
