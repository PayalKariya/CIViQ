import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build query with filters
    let query = db.select().from(complaints);

    // Build filter conditions
    const conditions = [];

    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        conditions.push(eq(complaints.userId, userIdInt));
      }
    }

    if (category) {
      conditions.push(eq(complaints.category, category));
    }

    if (status) {
      conditions.push(eq(complaints.status, status));
    }

    if (priority) {
      conditions.push(eq(complaints.priority, priority));
    }

    if (search) {
      const searchCondition = or(
        like(complaints.title, `%${search}%`),
        like(complaints.description, `%${search}%`),
        like(complaints.locationAddress, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering and pagination
    const results = await query
      .orderBy(desc(complaints.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      description,
      domain,
      department,
      issueType,
      category,
      priority,
      latitude,
      longitude,
      locationAddress,
      organizationRegion,
      organizationName,
      imageUrl,
      isAnonymous
    } = body;

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!domain || !department || !issueType || !organizationRegion) {
      return NextResponse.json({ error: 'Missing required fields for assignment' }, { status: 400 });
    }

    const now = new Date().toISOString();
    
    // Automatic Assignment Logic
    let assignedTo = null;
    let status = 'submitted';

    // 1. Try matching Level 1 Ground Worker (Specific Issue Type)
    const groundWorker = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'authority'),
          eq(users.verificationStatus, 'verified'),
          eq(users.authorityLevel, 1),
          eq(users.organizationRegion, organizationRegion),
          eq(users.organizationName, organizationName),
          eq(users.issueType, issueType)
        )
      )
      .limit(1);

    if (groundWorker.length > 0) {
      assignedTo = groundWorker[0].id;
      status = 'assigned';
    } else {
      // 2. Try matching Level 2 Supervisor (Department Wide)
      const supervisor = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, 'authority'),
            eq(users.verificationStatus, 'verified'),
            eq(users.authorityLevel, 2),
            eq(users.organizationRegion, organizationRegion),
            eq(users.organizationName, organizationName),
            eq(users.department, department)
          )
        )
        .limit(1);

      if (supervisor.length > 0) {
        assignedTo = supervisor[0].id;
        status = 'assigned';
      } else {
        // 3. Try matching Level 3 Domain Officer (Domain Wide)
        const domainOfficer = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.role, 'authority'),
              eq(users.verificationStatus, 'verified'),
              eq(users.authorityLevel, 3),
              eq(users.organizationRegion, organizationRegion),
              eq(users.organizationName, organizationName),
              eq(users.domain, domain)
            )
          )
          .limit(1);

        if (domainOfficer.length > 0) {
          assignedTo = domainOfficer[0].id;
          status = 'assigned';
        }
      }
    }

    const insertData: any = {
      userId: userId ? parseInt(userId) : null,
      title: title.trim(),
      description: description.trim(),
      domain: domain.trim(),
      department: department.trim(),
      issueType: issueType.trim(),
      organizationRegion: organizationRegion.trim(),
      organizationName: organizationName.trim(),
      category: category || department,
      priority: priority || 'medium',
      status,
      assignedTo,
      isAnonymous: isAnonymous ?? false,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      locationAddress: locationAddress?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      escalationLevel: 1,
      createdAt: now,
      updatedAt: now
    };

    const newComplaint = await db.insert(complaints)
      .values(insertData)
      .returning();

    return NextResponse.json(newComplaint[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
