import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users } from '@/db/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
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
    const userLevel = authUser.authorityLevel || 1;
    const userDepartment = authUser.department;
    const userDomain = authUser.domain;
    const userIssueType = authUser.issueType;
    const userRegion = authUser.organizationRegion;
    const userOrgName = authUser.organizationName;

    let conditions: any[] = [];

    // Base filtering by organization and region
    if (userRegion) {
      conditions.push(eq(complaints.organizationRegion, userRegion));
    }
    if (userOrgName) {
      conditions.push(eq(complaints.organizationName, userOrgName));
    }

    if (userLevel === 1) {
      if (!userIssueType) {
        conditions.push(eq(complaints.assignedTo, authUser.id));
      } else {
        conditions.push(
          or(
            eq(complaints.assignedTo, authUser.id),
            and(
              eq(complaints.issueType, userIssueType),
              eq(complaints.domain, userDomain || ''),
              eq(complaints.department, userDepartment || ''),
              or(
                eq(complaints.status, 'submitted'),
                eq(complaints.status, 'assigned')
              )
            )
          )!
        );
      }
    } else if (userLevel === 2) {
      if (!userDepartment || !userDomain) {
        return NextResponse.json({ error: 'No department or domain assigned' }, { status: 400 });
      }
      conditions.push(eq(complaints.department, userDepartment));
      conditions.push(eq(complaints.domain, userDomain));
    } else if (userLevel === 3) {
      if (!userDomain) {
        return NextResponse.json({ error: 'No domain assigned' }, { status: 400 });
      }
      conditions.push(eq(complaints.domain, userDomain));
    }

    if (status && status !== 'all') {
      conditions.push(eq(complaints.status, status));
    }

    const results = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        description: complaints.description,
        domain: complaints.domain,
        department: complaints.department,
        issueType: complaints.issueType,
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
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
          domain: c.domain,
          department: c.department,
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
        userLevel,
      });
    }

    return NextResponse.json({
      complaints: results,
      stats: { total, pending, inProgress, resolved, escalated, critical },
      userLevel,
    });
  } catch (error) {
    console.error('Error fetching authority complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
