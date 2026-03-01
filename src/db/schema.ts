import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table with role-based access
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('citizen'), // 'citizen', 'authority', 'admin'
  trustScore: real('trust_score').notNull().default(100.0),
  department: text('department'), // Department ID from complaint-categories (e.g., 'edu_sanitation', 'civic_roads')
  domain: text('domain'), // Domain ID (e.g., 'education', 'civic', 'health', 'transport', 'workplace')
  issueType: text('issue_type'), // Specific issue type ID for Level 1 workers (e.g., 'potholes', 'dirty_classrooms')
    authorityLevel: integer('authority_level'), // 1: Ground worker, 2: Supervisor, 3: Domain Officer
    employeeId: text('employee_id'), // Authority employee/staff ID
    organizationRegion: text('organization_region'), // e.g., 'Zone A', 'Downtown', 'Locality X'
    organizationName: text('organization_name'), // e.g., 'Educational', 'Offices', 'Workplace'
    designation: text('designation'), // Authority job title/designation
  verificationStatus: text('verification_status').default('pending'), // 'pending', 'verified', 'rejected'
  idPhotoUrl: text('verification_doc_url'), // ID card photo for verification
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Complaints table
export const complaints = sqliteTable('complaints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  domain: text('domain').default('civic'), // 'education', 'workplace', 'transport', 'health', 'civic'
  department: text('department').default('civic_roads'), // e.g., 'edu_sanitation', 'civic_roads', etc.
    issueType: text('issue_type').default('potholes'), // specific issue id from categories
    organizationRegion: text('organization_region'), // Area where complaint occurred
    organizationName: text('organization_name'), // Type of organization (e.g. Educational)
    category: text('category').notNull(), // kept for backward compatibility
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  status: text('status').notNull().default('submitted'), // 'submitted', 'assigned', 'in_progress', 'resolved', 'rejected', 'escalated'
  latitude: real('latitude'),
  longitude: real('longitude'),
  locationAddress: text('location_address'),
  imageUrl: text('image_url'),
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(false),
  assignedTo: integer('assigned_to').references(() => users.id),
  escalationLevel: integer('escalation_level').default(1), // Current escalation level (1, 2, or 3)
  escalationDeadline: text('escalation_deadline'), // Deadline before auto-escalation
  resolvedAt: text('resolved_at'),
  escalatedAt: text('escalated_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Feedback table
export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  complaintId: integer('complaint_id').notNull().references(() => complaints.id),
  userId: integer('user_id').notNull().references(() => users.id), // Who gave the feedback
  targetUserId: integer('target_user_id').notNull().references(() => users.id), // Who is receiving the feedback
  rating: integer('rating').notNull(), // 0-5
  comment: text('comment'),
  type: text('type').notNull(), // 'citizen_to_authority', 'authority_to_citizen'
  createdAt: text('created_at').notNull(),
});

// Notifications table
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  complaintId: integer('complaint_id').references(() => complaints.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'complaint_status', 'assignment', 'escalation', 'feedback', 'system'
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

// Activity logs table
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  complaintId: integer('complaint_id').references(() => complaints.id),
  action: text('action').notNull(), // 'complaint_submitted', 'status_updated', 'assigned', 'resolved', 'feedback_given'
  details: text('details', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});