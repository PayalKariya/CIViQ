import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { complaints, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid complaint ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const complaintId = parseInt(id);

    // Query database for complaint with assigned authority details
    const result = await db
      .select({
        complaint: complaints,
          assignedOfficer: {
            id: usersTable.id,
            fullName: usersTable.fullName,
            trustScore: usersTable.trustScore,
            designation: usersTable.designation,
            employeeId: usersTable.employeeId,
          },
      })
      .from(complaints)
      .leftJoin(usersTable, eq(complaints.assignedTo, usersTable.id))
      .where(eq(complaints.id, complaintId))
      .limit(1);

    // Check if complaint exists
    if (result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Complaint not found',
          code: 'COMPLAINT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const complaintData = {
      ...result[0].complaint,
      assignedOfficer: result[0].assignedOfficer
    };

    // Return complaint object
    return NextResponse.json(complaintData, { status: 200 });

  } catch (error) {
    console.error('GET complaint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid complaint ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const complaintId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      priority,
      status,
      assignedTo,
      latitude,
      longitude,
      locationAddress,
      imageUrl,
      resolvedAt,
      escalatedAt
    } = body;

    // Check if complaint exists
    const existingComplaint = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintId))
      .limit(1);

    if (existingComplaint.length === 0) {
      return NextResponse.json(
        { 
          error: 'Complaint not found',
          code: 'COMPLAINT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Prepare update object
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    // Add fields if provided
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;
    if (locationAddress !== undefined) updates.locationAddress = locationAddress;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    // Handle status changes
    if (status !== undefined) {
      updates.status = status;

      // Auto-set resolvedAt if status changed to 'resolved' and not provided
      if (status === 'resolved' && resolvedAt === undefined) {
        updates.resolvedAt = new Date().toISOString();
      } else if (resolvedAt !== undefined) {
        updates.resolvedAt = resolvedAt;
      }

      // Auto-set escalatedAt if status changed to 'escalated' and not provided
      if (status === 'escalated' && escalatedAt === undefined) {
        updates.escalatedAt = new Date().toISOString();
      } else if (escalatedAt !== undefined) {
        updates.escalatedAt = escalatedAt;
      }
    } else {
      // If status not being changed but timestamps provided, update them
      if (resolvedAt !== undefined) updates.resolvedAt = resolvedAt;
      if (escalatedAt !== undefined) updates.escalatedAt = escalatedAt;
    }

    // Update complaint
    const updatedComplaint = await db
      .update(complaints)
      .set(updates)
      .where(eq(complaints.id, complaintId))
      .returning();

    if (updatedComplaint.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update complaint',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }

    // Return updated complaint
    return NextResponse.json(updatedComplaint[0], { status: 200 });

  } catch (error) {
    console.error('PATCH complaint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
