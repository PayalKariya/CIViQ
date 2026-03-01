import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback, complaints, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { complaintId, userId, rating, comment } = body;

    // Validate required fields
    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required', code: 'MISSING_COMPLAINT_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: 'Rating is required', code: 'MISSING_RATING' },
        { status: 400 }
      );
    }

    // Validate complaintId is valid integer
    const complaintIdInt = parseInt(complaintId);
    if (isNaN(complaintIdInt)) {
      return NextResponse.json(
        { error: 'Complaint ID must be a valid integer', code: 'INVALID_COMPLAINT_ID' },
        { status: 400 }
      );
    }

    // Validate userId is valid integer
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'User ID must be a valid integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Validate rating is integer
    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt)) {
      return NextResponse.json(
        { error: 'Rating must be a valid integer', code: 'INVALID_RATING_TYPE' },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    if (ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5', code: 'INVALID_RATING_RANGE' },
        { status: 400 }
      );
    }

    // Verify complaint exists
    const existingComplaint = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, complaintIdInt))
      .limit(1);

    if (existingComplaint.length === 0) {
      return NextResponse.json(
        { error: 'Complaint not found', code: 'COMPLAINT_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Verify user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userIdInt))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Prepare feedback data
    const feedbackData = {
      complaintId: complaintIdInt,
      userId: userIdInt,
      rating: ratingInt,
      comment: comment ? comment.trim() : null,
      createdAt: new Date().toISOString(),
    };

    // Insert feedback
    const newFeedback = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();

    return NextResponse.json(newFeedback[0], { status: 201 });
  } catch (error) {
    console.error('POST feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}