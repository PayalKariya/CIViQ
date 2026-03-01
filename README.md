# CIViQ+ - Civic Complaint Management System

**"Not Just Civic, A Unified Voice Returns with a Response"**

A comprehensive, full-stack civic complaint management platform built with Next.js 15, TypeScript, and modern web technologies.

## 🌟 Features

### Core Functionality
- ✅ **Role-Based Authentication** - Separate dashboards for Citizens, Authorities, and Admins
- ✅ **Complaint Management** - Submit, track, and resolve civic issues with multimedia support
- ✅ **Interactive Map** - Visual representation of complaints with clustering for high-density areas
- ✅ **Real-Time Notifications** - Stay updated on complaint status changes
- ✅ **Trust Score System** - Dynamic reputation scoring for users and authorities
- ✅ **Anonymous Reporting** - Submit complaints without revealing identity
- ✅ **Smart Escalation** - Auto-escalate unresolved complaints based on SLA
- ✅ **Analytics Dashboard** - Comprehensive insights for administrators

### Dashboard Features

#### 👤 Citizen Dashboard
- Submit new complaints with images and location
- Track complaint status in real-time
- View trust score and complaint history
- Give feedback on resolved issues
- View complaints on interactive map
- Search and filter personal complaints

#### 🛡️ Authority Dashboard
- View assigned complaints by department
- Update complaint status (Assigned → In Progress → Resolved)
- Manage workload and track resolution stats
- Monitor trust score based on performance
- Receive notifications for new assignments

#### 👨‍💼 Admin Dashboard
- Full system oversight and analytics
- User management and activity monitoring
- View complaints by status, category, and priority
- Manage authorities and departments
- System-wide statistics and insights
- Monitor trust scores across all users

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser

### Installation

1. **Install dependencies**
```bash
npm install
# or
bun install
```

2. **Environment variables are already configured**
The `.env` file contains database credentials.

3. **Run the development server**
```bash
npm run dev
# or
bun dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Demo Credentials

### Admin Access
- **Email:** admin@civiq.com
- **Password:** Admin123!
- **Access:** Full system control, analytics, user management

### Authority Access (Infrastructure)
- **Email:** infra@civiq.com
- **Password:** Infra123!
- **Department:** Infrastructure

### Authority Access (Sanitation)
- **Email:** sanitation@civiq.com
- **Password:** Sanit123!
- **Department:** Sanitation

### Citizen Access
- **Email:** rajesh.kumar@gmail.com
- **Password:** Citizen123!
- **Access:** Submit complaints, track status, view map

## 🗄️ Database Schema

### Tables
- **users** - Authentication and user profiles (21 seeded users)
- **complaints** - Complaint submissions (50 seeded complaints in Mumbai)
- **feedback** - User feedback on resolved complaints (30 entries)
- **notifications** - Real-time notifications (40 entries)
- **activityLogs** - Audit trail of all actions (80+ logs)

### Key Features
- 1 Admin user
- 5 Authority users across different departments
- 15 Citizen users with varying trust scores
- 50 Complaints with realistic Mumbai locations
- Complaints clustered in high-density areas for map visualization

## 📱 Application Routes

### Public Routes
- `/` - Landing page with features
- `/login` - User authentication
- `/signup` - New user registration

### Citizen Routes
- `/citizen` - Dashboard home
- `/citizen/submit` - Submit new complaint
- `/citizen/complaints` - View all complaints
- `/citizen/map` - Interactive map view

### Authority Routes
- `/authority` - Dashboard with assigned complaints

### Admin Routes
- `/admin` - Full system oversight

## 🎨 Design System

### Status Colors
- **Submitted:** Yellow - New complaint
- **Assigned:** Blue - Assigned to authority
- **In Progress:** Purple - Being worked on
- **Resolved:** Green - Successfully resolved
- **Rejected:** Red - Cannot be resolved
- **Escalated:** Orange - Escalated for priority

### Priority Levels
- **Critical:** Red - 24h SLA
- **High:** Orange - 72h SLA
- **Medium:** Yellow - 7 days SLA
- **Low:** Green - 14 days SLA

### Trust Score Ranges
- **90-100:** Excellent (Green)
- **75-89:** Good (Blue)
- **60-74:** Fair (Yellow)
- **40-59:** Poor (Orange)
- **0-39:** Critical (Red)

## 📊 Key Features Explained

### Trust Score System
**Citizens:** Based on submission accuracy and engagement
**Authorities:** Based on resolution time, feedback ratings, and escalations

### Escalation Logic
- Automatically escalates complaints that exceed SLA
- Priority-based time limits
- Notifications sent to higher authorities

### Complaint Categories
- Infrastructure (roads, buildings)
- Sanitation (garbage, cleanliness)
- Transport (traffic, public transport)
- Street Light (lighting issues)
- Water Supply (leaks, shortages)
- Health & Safety
- Education
- Other

### Map Visualization
- Color-coded markers by priority
- Clustering for high-density areas (2+ complaints)
- Filter by category, status, priority
- Click markers to view details
- Shows complaint hotspots in Mumbai

## 🔧 Technology Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS 4, Shadcn UI
- **Database:** Turso (LibSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Custom context-based auth
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Animations:** Custom CSS animations

## 📈 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login

### Complaints
- `GET /api/complaints` - List with filters
- `POST /api/complaints` - Submit new
- `GET /api/complaints/[id]` - Get details
- `PATCH /api/complaints/[id]` - Update
- `GET /api/complaints/map` - Map data

### Analytics (Admin)
- `GET /api/analytics/dashboard` - System stats
- `GET /api/analytics/complaints-by-category`
- `GET /api/analytics/priority-areas`

### Authority
- `GET /api/authority/assigned` - Assigned complaints
- `PATCH /api/authority/complaints/[id]/status`

### Users (Admin)
- `GET /api/users` - List users
- `PATCH /api/users/[id]` - Update user

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/[id]/read` - Mark read

### Feedback
- `POST /api/feedback` - Submit feedback

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Protected routes (client & server)
- Anonymous reporting support
- Input validation
- SQL injection prevention

## 📊 Seeded Data Highlights

- **Mumbai Locations:** Realistic coordinates around 19.0760°N, 72.8777°E
- **Complaint Clusters:** Multiple complaints in Dadar, Andheri, Bandra, Kurla, Worli
- **Various Statuses:** Mix of submitted, assigned, in progress, resolved
- **Trust Scores:** Range from 70-100 for realistic diversity
- **Activity Logs:** Complete audit trail of all actions

## 🎯 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── signup/page.tsx             # Registration
│   ├── citizen/                    # Citizen dashboard
│   ├── authority/                  # Authority dashboard
│   ├── admin/                      # Admin dashboard
│   └── api/                        # API routes
├── components/
│   ├── ui/                         # Shadcn components
│   ├── ProtectedRoute.tsx          # Route protection
│   ├── DashboardLayout.tsx         # Layout wrapper
│   └── NotificationsPanel.tsx      # Notifications UI
├── lib/
│   ├── auth-context.tsx            # Auth context
│   └── utils/                      # Utilities
└── db/
    ├── schema.ts                   # Database schema
    └── seeds/                      # Seed data
```

## 🌟 Highlights

### For Citizens
- **Easy Submission:** Simple form with location capture
- **Real-Time Tracking:** Know exactly where your complaint stands
- **Anonymous Option:** Report sensitive issues safely
- **Trust Score:** Build reputation through accurate reporting
- **Interactive Map:** See issues in your area

### For Authorities
- **Workload Management:** Clear view of assigned tasks
- **Status Updates:** Easy complaint lifecycle management
- **Performance Tracking:** Monitor your trust score
- **Department Focus:** Only see relevant complaints
- **Quick Actions:** Update status with one click

### For Admins
- **Complete Overview:** See everything happening in the system
- **Analytics:** Detailed insights and trends
- **User Management:** Control user accounts and permissions
- **Activity Monitoring:** Track all actions
- **Priority Areas:** Identify hotspots needing attention

## 📝 Academic Context

**Institution:** USHA MITTAL INSTITUTE OF TECHNOLOGY, S.N.D.T WOMEN'S UNIVERSITY

**Team:**
- Payal Kariya (30)
- Manali Suryavanshi (63)
- Anuga Warrier (67)

**Guide:** Prof. Shehnaz Siddique

**Year:** 2025-2026

## 🚀 Future Enhancements

- Real Google Maps API integration
- Image upload to cloud storage
- Email/SMS notifications
- Mobile app (React Native)
- AI-powered categorization
- Chatbot interface
- IoT sensor integration
- Predictive analytics
- Multi-language support
- Export reports (PDF/CSV)

---

**Built with ❤️ for better civic engagement**

CIViQ+ © 2025 - Making cities better, one complaint at a time.