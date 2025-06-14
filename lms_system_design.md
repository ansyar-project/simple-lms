# Learning Management System - System Design Document

## Executive Summary

This document outlines the system design for a comprehensive Learning Management System (LMS) built with modern web technologies. The system is designed to handle course management, user authentication, content delivery, assessments, and real-time interactions.

## Implementation Phases

The LMS development is structured in multiple phases to ensure systematic implementation and testing of features. Each phase builds upon the previous one, creating a robust and scalable platform.

### Phase 1: Foundation Setup ✅ **COMPLETED**

**Status**: Completed on June 12, 2025  
**Duration**: Initial setup phase  
**Objective**: Establish core infrastructure and basic authentication

#### Deliverables:

- ✅ **Project Structure**: Complete Next.js 15 application with organized directory structure
- ✅ **Database Schema**: Full Prisma schema with all entities (Users, Courses, Enrollments, etc.)
- ✅ **Authentication System**: NextAuth.js v5 with email/password and Google OAuth
- ✅ **Authorization**: Role-based access control (Student, Instructor, Admin)
- ✅ **UI Foundation**: Shadcn UI components and responsive layouts
- ✅ **Basic Pages**: Landing page, login, register, and basic dashboard
- ✅ **Middleware**: Route protection and security
- ✅ **Development Environment**: Database seeding and development workflows

#### Key Features Implemented:

- Complete user authentication flow
- Role-based dashboard access
- Secure session management with Redis
- Database migrations and seeding
- Responsive UI components
- Type-safe development environment

### Phase 2: Core Course Management 🚧 **IN PROGRESS**

**Status**: Week 1-2 Complete ✅ | Week 3-4 Next 📋  
**Progress**: 2/4 weeks completed (50%)  
**Estimated Duration**: 4 weeks total  
**Objective**: Build upon completed course foundation with content management, enrollment, and learning experience

#### Week 1: Course Foundation & Management ✅ **COMPLETED**

**Status**: 100% Complete (June 12-13, 2025)  
**Objective**: Establish course creation and management infrastructure

**Completed Deliverables:**

- ✅ **Course CRUD Operations**: Full create, read, update, delete with status management
- ✅ **File Upload System**: Minio S3-compatible storage with 4 bucket structure
- ✅ **Instructor Dashboard**: Complete course management interface with statistics
- ✅ **Course Management Components**: CourseForm, CourseCard, CoursesList with search/filter
- ✅ **Validation & Type Safety**: Comprehensive Zod schemas and TypeScript types
- ✅ **Authentication & Authorization**: NextAuth.js v5 with role-based access control
- ✅ **Mobile-first Design**: Responsive layouts throughout

**Technical Implementation Completed:**

- Course creation wizard with form validation
- Course status management (DRAFT, PUBLISHED, ARCHIVED)
- File upload with type validation and secure storage
- Course search, filtering, and pagination
- Instructor dashboard with course statistics
- Database schema with proper indexing
- Server actions for all CRUD operations

#### Week 2: Module & Lesson Management 📚 ✅ **COMPLETED**

**Status**: 100% Complete (June 13-15, 2025)  
**Objective**: Implement hierarchical content structure and rich content creation

**Completed Deliverables:**

- ✅ **Module CRUD Operations**: Create, organize, and manage course modules
- ✅ **Lesson Management**: Rich content lessons with multiple content types
- ✅ **Content Organization**: Drag-and-drop reordering for modules and lessons
- ✅ **Rich Text Editor**: TipTap integration for lesson content creation
- ✅ **Content Types**: Support for text, video, quiz, and assignment lessons
- ✅ **Module Progress**: Basic completion tracking at module level

**Technical Implementation Completed:**

- Module and lesson server actions with full CRUD operations
- Rich text editor component with TipTap integration
- Drag-and-drop module reordering using @dnd-kit
- Content type selector with support for text, video, quiz, assignment
- Lesson preview functionality with content rendering
- Module management UI with lesson organization
- Content management page with comprehensive navigation
- Type-safe implementations with Zod validation
- Mobile-responsive design throughout

**Key Features Implemented:**

- ✅ Module creation and management interface
- ✅ Lesson editor with rich text capabilities
- ✅ Content type selection and management
- ✅ Module/lesson ordering with drag-and-drop
- ✅ Content preview functionality
- ✅ Basic content validation and saving

**Technical Goals Achieved:**

- ✅ Extended existing course management with module hierarchy
- ✅ Integrated TipTap rich text editor
- ✅ Implemented content reordering functionality
- ✅ Added content type management system
- ✅ Created preview modes for different content types

**Performance Metrics Achieved:**

- ✅ Module creation workflow: < 2 minutes per module
- ✅ Lesson creation with rich text: < 5 minutes per lesson
- ✅ Content reordering: Instant drag-and-drop response
- ✅ Rich text editor load time: < 1 second

#### Week 3: Course Enrollment & Student Experience 🎓 **IN PROGRESS**

**Target**: June 16-20, 2025  
**Status**: Next priority - Week 3 implementation starting  
**Objective**: Enable student course access and basic learning experience

**Planned Deliverables:**

- **Enrollment System**: Course enrollment workflow and access control
- **Student Dashboard**: Enrolled courses overview and navigation
- **Course Player**: Student interface for consuming course content
- **Lesson Navigation**: Sequential lesson progression and navigation
- **Basic Progress Tracking**: Lesson completion and course progress
- **Course Catalog**: Public course browsing and enrollment

**Key Features to Implement:**

- Course enrollment process (free courses initially)
- Student dashboard with enrolled courses
- Course learning interface with lesson player
- Progress tracking and persistence
- Course catalog with search and filtering
- Basic course preview for non-enrolled users

**Technical Goals:**

- Build enrollment system with access control
- Create student learning interface
- Implement progress tracking system
- Add course catalog functionality
- Ensure proper access control between roles

#### Week 4: Progress Tracking & Learning Experience 📈 **PLANNED**

**Target**: June 23-27, 2025  
**Objective**: Complete learning experience with comprehensive progress tracking

**Planned Deliverables:**

- **Advanced Progress Tracking**: Detailed lesson and module completion
- **Learning Analytics**: Student progress insights and reporting
- **Course Completion**: Completion certificates and tracking
- **Instructor Analytics**: Course performance and student progress data
- **Enhanced Student Experience**: Bookmarks, notes, and learning preferences
- **Mobile Optimization**: Ensure full mobile compatibility

**Key Features to Implement:**

- Comprehensive progress tracking system
- Student analytics and progress reports
- Course completion and certification
- Instructor analytics dashboard
- Student note-taking and bookmarking
- Mobile-optimized learning experience

**Technical Goals:**

- Implement detailed progress tracking
- Create analytics and reporting system
- Add course completion logic
- Build instructor analytics dashboard
- Optimize mobile learning experience
- Performance optimization and caching

#### Architecture Overview

**Built Upon Week 1-2 Foundation:**

- ✅ Secure authentication and role-based access
- ✅ Course management infrastructure
- ✅ File upload and storage system
- ✅ Responsive UI components
- ✅ Database schema with proper relationships
- ✅ Module and lesson management system
- ✅ Rich text editor with TipTap
- ✅ Drag-and-drop content organization

**Week 3-4 Technical Stack Additions:**

- **Rich Text Editor**: ✅ TipTap for content creation (COMPLETED)
- **Content Management**: ✅ Hierarchical module/lesson structure (COMPLETED)
- **Progress Tracking**: Redis-cached progress data (PLANNED)
- **Analytics**: Course and student performance metrics (PLANNED)
- **Mobile Optimization**: Enhanced responsive design (PLANNED)

#### End-of-Phase Capabilities

Upon completion of Phase 2, the LMS will support:

- **Complete Course Lifecycle**: Creation → Content → Enrollment → Learning → Completion
- **Multi-Role Experience**: Instructor course management + Student learning interface
- **Content Management**: Rich text lessons, video content, organized modules
- **Progress Tracking**: Detailed analytics for both students and instructors
- **Mobile Learning**: Full mobile-responsive learning experience
- **Foundation for Assessments**: Ready for Phase 3 quiz and assessment features

#### Success Metrics for Phase 2

**Week 2 Targets (✅ ACHIEVED):**

- ✅ Module creation workflow: < 2 minutes per module
- ✅ Lesson creation with rich text: < 5 minutes per lesson
- ✅ Content reordering: Instant drag-and-drop response
- ✅ Rich text editor load time: < 1 second

**Week 3 Targets:**

- Course enrollment flow: < 30 seconds
- Student dashboard load: < 2 seconds
- Lesson navigation: < 1 second between lessons
- Progress tracking accuracy: 100%

**Week 4 Targets:**

- Analytics dashboard load: < 3 seconds
- Mobile learning experience: 100% feature parity
- Course completion flow: < 1 minute
- System performance: Support 100+ concurrent users

### Phase 3: Enhanced Learning Features & Assessments 📋 **PLANNED**

**Status**: Ready after Phase 2 completion  
**Estimated Duration**: 3 weeks (Week 5-7)  
**Objective**: Add interactive assessments, advanced media features, and communication tools

Building upon Phase 2's complete course management and student learning experience, Phase 3 focuses on enriching the learning experience with interactive assessments, multimedia integration, and communication features.

#### Week 5: Interactive Assessments & Quiz System 📝 **PLANNED**

**Target**: July 7-11, 2025  
**Objective**: Implement comprehensive quiz and assessment system within the lesson structure

**Planned Deliverables:**

- **Quiz Builder**: Interactive quiz creation tool for instructors
- **Multiple Question Types**: Multiple choice, true/false, fill-in-blank, essay questions
- **Quiz Integration**: Seamless integration with lesson content structure
- **Instant Feedback**: Real-time quiz results and explanations
- **Attempt Management**: Multiple attempts with score tracking
- **Question Bank**: Reusable question library for instructors

**Key Features to Implement:**

- Drag-and-drop quiz builder interface
- Question type selection and configuration
- Quiz preview and testing functionality
- Student quiz-taking interface with timer
- Automatic scoring for objective questions
- Manual grading interface for essay questions
- Quiz analytics and performance insights

**Technical Goals:**

- Extend existing lesson content types to include interactive quizzes
- Build upon Phase 2's progress tracking for quiz completion
- Integrate with existing module/lesson hierarchy
- Add quiz-specific database schemas and relationships
- Implement real-time quiz state management

#### Week 6: Assignment Management & Grading System 📄 **PLANNED**

**Target**: July 14-18, 2025  
**Objective**: Build comprehensive assignment submission and grading workflow

**Planned Deliverables:**

- **Assignment Creation**: Rich assignment briefs with file attachments
- **Submission System**: File upload and text submission interface
- **Grading Workflow**: Instructor grading dashboard with rubrics
- **Feedback System**: Detailed feedback and comments on submissions
- **Grade Management**: Grade book and analytics for instructors
- **Due Date Management**: Automatic notifications and late submission handling

**Key Features to Implement:**

- Assignment creation with rich text descriptions
- Multiple submission formats (file, text, or both)
- Bulk file download for instructor grading
- Rubric-based grading system
- Private feedback and public announcements
- Grade analytics and distribution insights
- Email notifications for submissions and grades

**Technical Goals:**

- Build upon existing file upload system for assignment submissions
- Extend instructor dashboard with grading workflows
- Integrate with existing notification system
- Add grade calculation and reporting features
- Implement deadline management and automated reminders

#### Week 7: Advanced Media & Communication Features 🎬 **PLANNED**

**Target**: July 21-25, 2025  
**Objective**: Enhance learning experience with video integration and communication tools

**Planned Deliverables:**

- **Video Player Integration**: Custom video player with learning features
- **Video Progress Tracking**: Detailed video watching analytics
- **Discussion Forums**: Course and lesson-specific discussion threads
- **Real-time Notifications**: Live updates for course activities
- **Announcement System**: Course-wide announcements and updates
- **Certificate Generation**: Automated course completion certificates

**Key Features to Implement:**

- Custom video player with playback speed control
- Video bookmark and note-taking functionality
- Threaded discussion forums with moderation
- Real-time notification system using WebSockets
- Announcement creation and distribution
- PDF certificate generation with custom templates
- Mobile-optimized video and discussion experience

**Technical Goals:**

- Integrate video streaming with existing file storage
- Build real-time communication using Redis Pub/Sub
- Extend notification system for forum and announcement updates
- Add certificate template system with dynamic content
- Optimize video delivery and streaming performance

#### Architecture Overview

**Built Upon Phase 2 Foundation:**

- ✅ Complete course and module management
- ✅ Student enrollment and learning interface
- ✅ Progress tracking and analytics system
- ✅ File upload and content management
- ✅ Mobile-responsive learning experience

**Phase 3 Technical Stack Additions:**

- **Assessment Engine**: Quiz and assignment creation and grading
- **Video Integration**: Custom video player with learning analytics
- **Real-time Communication**: WebSocket connections for live updates
- **Certificate System**: PDF generation with custom templates
- **Discussion Platform**: Threaded forums with moderation tools

#### End-of-Phase Capabilities

Upon completion of Phase 3, the LMS will support:

- **Complete Assessment Lifecycle**: Quiz creation → Student taking → Automatic grading → Analytics
- **Assignment Workflow**: Assignment creation → Student submission → Instructor grading → Feedback
- **Rich Media Learning**: Video lessons with progress tracking and interactive features
- **Community Features**: Discussion forums and real-time communication
- **Achievement System**: Course completion certificates and recognition
- **Comprehensive Analytics**: Detailed insights for both students and instructors

#### Success Metrics for Phase 3

**Week 5 Targets:**

- Quiz creation workflow: < 3 minutes per quiz
- Quiz-taking experience: < 2 seconds between questions
- Automatic grading accuracy: 100% for objective questions
- Quiz analytics generation: < 1 second

**Week 6 Targets:**

- Assignment submission process: < 1 minute for file uploads
- Grading workflow efficiency: < 2 minutes per submission review
- Grade calculation accuracy: 100%
- Feedback delivery: Real-time notifications

**Week 7 Targets:**

- Video player load time: < 3 seconds
- Discussion forum response time: < 500ms
- Real-time notification delivery: < 1 second
- Certificate generation: < 5 seconds per certificate

#### Integration with Existing Systems

**Database Extensions:**

- Quiz and question management tables
- Assignment and submission tracking
- Discussion forum and thread management
- Video progress and analytics data
- Certificate generation and tracking

**UI/UX Enhancements:**

- Enhanced lesson player with assessment integration
- Instructor grading and feedback interfaces
- Student submission and quiz-taking experiences
- Discussion forum and communication tools
- Mobile-optimized assessment and video features

### Phase 4: Advanced Platform Features 🎯 **PLANNED**

**Estimated Duration**: 4-5 weeks  
**Objective**: Add advanced features for scaling and platform management

#### Planned Deliverables:

- **Payment Integration**: Course pricing and payment processing
- **Advanced Admin Panel**: User management and platform analytics
- **Communication Tools**: Messaging system between users
- **Mobile Responsiveness**: Enhanced mobile experience
- **API Documentation**: Public API for integrations
- **Advanced Search**: Full-text search with filters
- **Reporting System**: Comprehensive reporting tools

#### Key Features to Implement:

- Stripe payment integration
- Advanced admin dashboard
- Internal messaging system
- PWA capabilities
- REST API endpoints
- Elasticsearch integration
- Custom reporting engine

### Phase 5: Performance & Scaling 🚀 **FUTURE**

**Estimated Duration**: 3-4 weeks  
**Objective**: Optimize performance and prepare for scale

#### Planned Deliverables:

- **Performance Optimization**: Caching strategies and optimization
- **Monitoring & Logging**: Application performance monitoring
- **Testing Suite**: Comprehensive test coverage
- **Documentation**: Complete API and user documentation
- **Deployment Automation**: CI/CD pipelines
- **Security Hardening**: Security audit and improvements
- **Backup Systems**: Automated backup and recovery

#### Key Features to Implement:

- Advanced caching with Redis
- Application monitoring (Sentry, DataDog)
- Automated testing suite
- Comprehensive documentation
- Docker optimization
- Security audit implementation

### Phase 6: AI & Innovation Features 🤖 **FUTURE**

**Estimated Duration**: 5-6 weeks  
**Objective**: Integrate AI-powered features and innovative learning tools

#### Planned Deliverables:

- **AI Content Recommendations**: Personalized course suggestions
- **Automated Grading**: AI-powered assignment evaluation
- **Chatbot Support**: Intelligent student support system
- **Learning Analytics**: AI-driven learning insights
- **Content Generation**: AI-assisted content creation tools
- **Virtual Classroom**: Live video conferencing integration
- **Advanced Personalization**: Adaptive learning paths

#### Key Features to Implement:

- Machine learning recommendation engine
- OpenAI integration for grading
- Chatbot with course-specific knowledge
- Learning behavior analytics
- AI content generation tools
- WebRTC video conferencing
- Adaptive learning algorithms

## Current Status Summary

### ✅ What's Working Now:

- **Authentication**: Full login/register with Google OAuth
- **Database**: Complete schema with relationships and seeding
- **UI**: Responsive components and layouts with Shadcn UI
- **Security**: Role-based access control and route protection
- **Development**: Hot reload, type safety, linting, and testing
- **Course Management**: Complete CRUD operations with status management
- **File Upload**: Minio S3-compatible storage system
- **Module System**: Full module creation, editing, and organization
- **Lesson Management**: Rich text lessons with TipTap editor
- **Content Organization**: Drag-and-drop reordering for modules
- **Content Types**: Support for text, video, quiz, and assignment types
- **Instructor Dashboard**: Course management interface with statistics

### 🔄 Currently in Development:

- Week 3: Course Enrollment & Student Experience
- Student dashboard and learning interface
- Course catalog and enrollment system

### 🎯 Next Immediate Steps:

1. Begin Week 3: Course Enrollment & Student Experience
2. Implement course enrollment workflow and access control
3. Create student dashboard with enrolled courses
4. Build course learning interface with lesson player
5. Add basic progress tracking and persistence

### 📊 Progress Tracking:

- **Phase 1**: 100% Complete ✅
- **Phase 2**: 50% Complete (2/4 weeks) 🚧
  - Week 1: Course Foundation ✅
  - Week 2: Module & Lesson Management ✅
  - Week 3: Enrollment & Student Experience 🔄
  - Week 4: Progress Tracking & Analytics �
- **Phase 3**: 0% Planned 📋
- **Overall Project**: ~30% Complete

## Technology Stack

### Frontend & Backend

- **Framework**: Next.js 15 with App Router
- **Server Actions**: For form handling and server-side operations
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI + Aceternity UI

### Database & Caching

- **Primary Database**: Self-hosted PostgreSQL (independent instance)
- **ORM**: Prisma
- **Caching & Real-time**: Redis (independent instance)
- **Session Store**: Redis

### Authentication

- **Authentication Provider**: NextAuth.js v5
- **Session Management**: Database sessions with Redis caching
- **Authorization**: Role-based access control (RBAC)

### Deployment

- **Containerization**: Docker (single application container)
- **Deployment Platform**: Coolify
- **Database**: Independent PostgreSQL instance
- **Cache**: Independent Redis instance
- **File Storage**: Docker volumes (with future S3 compatibility)

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN/Static    │    │   File Storage  │
│   (Coolify)     │    │   Assets        │    │   (Volumes)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 15 Application                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │   App Router  │  │ Server Actions│  │  Internal     │      │
│  │   (Pages)     │  │  (Mutations)  │  │  API Routes   │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
└─────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│   PostgreSQL    │                           │     Redis       │
│ (External Host) │                           │ (External Host) │
└─────────────────┘                           └─────────────────┘
```

### Data Flow Architecture

1. **User Request** → Load Balancer → Next.js App
2. **Authentication** → NextAuth.js → PostgreSQL/Redis
3. **Data Queries** → Prisma ORM → PostgreSQL (with Redis caching)
4. **Real-time Updates** → Redis Pub/Sub → WebSocket/SSE
5. **Background Jobs** → Redis Queues → Worker Processes
6. **File Operations** → Local File System → Docker Volumes

## Database Design

### Core Entities

#### User Management

```sql
-- Users table with role-based access
Users {
  id: UUID (PK)
  email: String (unique)
  name: String
  role: Enum (STUDENT, INSTRUCTOR, ADMIN)
  avatar: String?
  emailVerified: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}

-- NextAuth.js required tables
Accounts {
  id: UUID (PK)
  userId: UUID (FK -> Users.id)
  type: String
  provider: String
  providerAccountId: String
  // OAuth fields
}

Sessions {
  id: UUID (PK)
  sessionToken: String (unique)
  userId: UUID (FK -> Users.id)
  expires: DateTime
}
```

#### Course Management

```sql
Categories {
  id: UUID (PK)
  name: String
  description: String?
  slug: String (unique)
}

Courses {
  id: UUID (PK)
  title: String
  description: Text
  slug: String (unique)
  instructorId: UUID (FK -> Users.id)
  categoryId: UUID (FK -> Categories.id)
  price: Decimal?
  thumbnail: String?
  status: Enum (DRAFT, PUBLISHED, ARCHIVED)
  createdAt: DateTime
  updatedAt: DateTime
}

Modules {
  id: UUID (PK)
  courseId: UUID (FK -> Courses.id)
  title: String
  description: Text?
  order: Integer
  createdAt: DateTime
}

Lessons {
  id: UUID (PK)
  moduleId: UUID (FK -> Modules.id)
  title: String
  content: Text?
  contentType: Enum (VIDEO, TEXT, QUIZ, ASSIGNMENT)
  videoUrl: String?
  duration: Integer? // in seconds
  order: Integer
  createdAt: DateTime
}
```

#### Enrollment & Progress

```sql
Enrollments {
  id: UUID (PK)
  userId: UUID (FK -> Users.id)
  courseId: UUID (FK -> Courses.id)
  enrolledAt: DateTime
  completedAt: DateTime?
  progress: Float (0-1)
}

LessonProgress {
  id: UUID (PK)
  userId: UUID (FK -> Users.id)
  lessonId: UUID (FK -> Lessons.id)
  completed: Boolean
  completedAt: DateTime?
  timeSpent: Integer // in seconds
}

QuizAttempts {
  id: UUID (PK)
  userId: UUID (FK -> Users.id)
  lessonId: UUID (FK -> Lessons.id)
  score: Float
  answers: JSON
  attemptedAt: DateTime
}
```

#### Assessment System

```sql
Assignments {
  id: UUID (PK)
  lessonId: UUID (FK -> Lessons.id)
  title: String
  description: Text
  dueDate: DateTime?
  maxScore: Integer
  submissionFormat: Enum (TEXT, FILE, BOTH)
}

Submissions {
  id: UUID (PK)
  assignmentId: UUID (FK -> Assignments.id)
  userId: UUID (FK -> Users.id)
  content: Text?
  fileUrl: String?
  submittedAt: DateTime
  gradedAt: DateTime?
  score: Integer?
  feedback: Text?
}
```

## Authentication & Authorization

### NextAuth.js Configuration

```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Custom credential validation
        const user = await validateUser(credentials);
        return user
          ? { id: user.id, email: user.email, role: user.role }
          : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
};
```

### Role-Based Access Control

```typescript
// Authorization middleware
export const authorize = (allowedRoles: Role[]) => {
  return async (req: Request) => {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!allowedRoles.includes(session.user.role)) {
      throw new Error("Forbidden");
    }

    return session.user;
  };
};

// Usage in Server Actions
export async function createCourse(formData: FormData) {
  const user = await authorize(["INSTRUCTOR", "ADMIN"]);
  // Course creation logic
}
```

## Redis Integration

### Caching Strategy

```typescript
// Course content caching
const CACHE_KEYS = {
  COURSE: (id: string) => `course:${id}`,
  USER_COURSES: (userId: string) => `user:${userId}:courses`,
  COURSE_PROGRESS: (userId: string, courseId: string) =>
    `progress:${userId}:${courseId}`,
  POPULAR_COURSES: "courses:popular",
};

// Cache TTL values
const CACHE_TTL = {
  COURSE_CONTENT: 3600, // 1 hour
  USER_DATA: 1800, // 30 minutes
  POPULAR_COURSES: 7200, // 2 hours
};
```

### Real-time Features

```typescript
// Notification system
export class NotificationService {
  static async sendNotification(userId: string, notification: Notification) {
    await redis.publish(
      `user:${userId}:notifications`,
      JSON.stringify(notification)
    );

    // Store for offline users
    await redis.lpush(`notifications:${userId}`, JSON.stringify(notification));
  }

  static async getNotifications(userId: string) {
    const cached = await redis.lrange(`notifications:${userId}`, 0, -1);
    return cached.map((n) => JSON.parse(n));
  }
}
```

### Background Job Processing

Since PostgreSQL and Redis are hosted independently, background job processing will run within the main application container or as separate worker processes that connect to the same external services.

```typescript
// Job queue system
export class JobQueue {
  static async addJob(queueName: string, jobData: any) {
    const redis = new Redis(process.env.REDIS_URL!);
    await redis.lpush(
      `queue:${queueName}`,
      JSON.stringify({
        id: generateId(),
        data: jobData,
        createdAt: new Date().toISOString(),
      })
    );
    await redis.disconnect();
  }

  static async processQueue(queueName: string, processor: Function) {
    const redis = new Redis(process.env.REDIS_URL!);
    while (true) {
      const job = await redis.brpop(`queue:${queueName}`, 10);
      if (job) {
        const jobData = JSON.parse(job[1]);
        await processor(jobData);
      }
    }
  }
}

// Usage
await JobQueue.addJob("video-processing", {
  videoUrl: uploadedVideo.url,
  courseId: course.id,
  userId: user.id,
});
```

## Application Routes & Pages

### Public Routes

```
/ - Landing page with course catalog
/about - About the platform
/contact - Contact information
/login - User authentication
/register - User registration
/courses - Public course catalog with search/filter
/courses/[slug] - Course detail page (preview for non-enrolled users)
/pricing - Pricing information (if applicable)
```

### Student Dashboard Routes

```
/dashboard - Student overview (enrolled courses, progress)
/dashboard/courses - All enrolled courses
/dashboard/courses/[slug] - Course learning interface
/dashboard/courses/[slug]/lessons/[lessonId] - Individual lesson view
/dashboard/progress - Detailed progress tracking
/dashboard/assignments - All assignments and submissions
/dashboard/assignments/[id] - Assignment detail and submission
/dashboard/grades - Grade overview
/dashboard/certificates - Earned certificates
/dashboard/profile - User profile management
/dashboard/settings - Account settings
```

### Instructor Dashboard Routes

```
/instructor - Instructor overview and analytics
/instructor/courses - Manage created courses
/instructor/courses/new - Create new course
/instructor/courses/[id] - Course management dashboard
/instructor/courses/[id]/edit - Edit course details
/instructor/courses/[id]/modules - Manage course modules
/instructor/courses/[id]/modules/[moduleId] - Edit specific module
/instructor/courses/[id]/lessons - Manage lessons
/instructor/courses/[id]/lessons/new - Create new lesson
/instructor/courses/[id]/lessons/[lessonId]/edit - Edit lesson
/instructor/courses/[id]/students - View enrolled students
/instructor/courses/[id]/analytics - Course performance analytics
/instructor/assignments - All course assignments
/instructor/assignments/[id] - Grade assignments
/instructor/profile - Instructor profile
```

### Admin Routes

```
/admin - Admin dashboard with system overview
/admin/users - User management (students, instructors)
/admin/users/[id] - Individual user management
/admin/courses - All courses management
/admin/courses/[id] - Course moderation and approval
/admin/categories - Course category management
/admin/analytics - Platform-wide analytics
/admin/settings - System configuration
/admin/reports - Generate system reports
```

### Shared Protected Routes

```
/notifications - User notifications center
/messages - Internal messaging system
/messages/[conversationId] - Individual conversation
/help - Help documentation
/support - Support ticket system
```

### API Routes Structure

```
/api/auth/[...nextauth] - NextAuth.js authentication
/api/upload - File upload handling
/api/courses/[id]/progress - Course progress tracking
/api/notifications/sse - Server-sent events for real-time notifications
/api/search - Course and content search
/api/analytics - Analytics data endpoints
/api/health - Health check endpoint
```

### Route Protection & Middleware

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Admin routes protection
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Instructor routes protection
    if (
      pathname.startsWith("/instructor") &&
      !["INSTRUCTOR", "ADMIN"].includes(token?.role)
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Student dashboard protection
    if (pathname.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        const publicRoutes = [
          "/",
          "/about",
          "/contact",
          "/courses",
          "/login",
          "/register",
          "/pricing",
        ];
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};
```

### Dynamic Route Patterns

```typescript
// Course slug generation and validation
export async function generateStaticParams() {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });

  return courses.map((course) => ({
    slug: course.slug,
  }));
}

// Course enrollment check
export async function checkCourseAccess(slug: string, userId: string) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      enrollments: {
        where: { userId },
      },
    },
  });

  return {
    course,
    isEnrolled: course?.enrollments.length > 0,
    isInstructor: course?.instructorId === userId,
  };
}
```

## API Design

### Server Actions Structure

```typescript
// Course management actions
export async function createCourse(formData: FormData) {
  const user = await authorize(["INSTRUCTOR", "ADMIN"]);

  const course = await db.course.create({
    data: {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      instructorId: user.id,
      // ...other fields
    },
  });

  // Invalidate cache
  await redis.del(CACHE_KEYS.USER_COURSES(user.id));

  revalidatePath("/dashboard/courses");
  return { success: true, courseId: course.id };
}

export async function enrollInCourse(courseId: string) {
  const user = await authorize(["STUDENT"]);

  const enrollment = await db.enrollment.create({
    data: {
      userId: user.id,
      courseId,
      enrolledAt: new Date(),
    },
  });

  // Send notification
  await NotificationService.sendNotification(user.id, {
    type: "ENROLLMENT_SUCCESS",
    courseId,
    message: "Successfully enrolled in course",
  });

  revalidatePath("/dashboard");
  return { success: true };
}
```

### Internal API Routes

```typescript
// /api/courses/[id]/progress - Internal progress tracking
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authConfig);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await getCourseProgress(session.user.id, params.id);
  return NextResponse.json(progress);
}

// /api/upload - File upload handling
export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const result = await uploadFile(file, session.user.id);
  return NextResponse.json(result);
}

// /api/notifications/sse - Server-Sent Events for real-time notifications
export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    start(controller) {
      // Setup Redis subscription for user notifications
      setupNotificationStream(session.user.id, controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## File Storage Strategy

### Current Implementation (Docker Volumes)

```dockerfile
# docker-compose.yml
volumes:
  - ./uploads:/app/uploads
  - postgres_data:/var/lib/postgresql/data
  - redis_data:/data
```

### File Upload Handling

```typescript
export async function uploadCourseContent(formData: FormData) {
  const user = await authorize(["INSTRUCTOR", "ADMIN"]);
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(process.cwd(), "uploads", fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Queue video processing if needed
  if (file.type.startsWith("video/")) {
    await JobQueue.addJob("video-processing", {
      filePath,
      fileName,
      userId: user.id,
    });
  }

  return { success: true, fileUrl: `/uploads/${fileName}` };
}
```

## Performance Optimization

### Caching Strategy

1. **Static Assets**: CDN + browser caching
2. **Database Queries**: Redis caching with TTL
3. **User Sessions**: Redis session store
4. **Course Content**: Aggressive caching with smart invalidation

### Database Optimization

1. **Indexing**: Strategic indexes on frequently queried fields
2. **Connection Pooling**: Prisma connection pooling
3. **Query Optimization**: Efficient joins and data fetching
4. **Read Replicas**: Future consideration for scaling

### Code Splitting & Lazy Loading

```typescript
// Dynamic imports for heavy components
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  loading: () => <VideoPlayerSkeleton />,
});

const CourseEditor = dynamic(() => import("@/components/CourseEditor"), {
  ssr: false,
});
```

## Security Considerations

### Authentication Security

- Secure session management with NextAuth.js
- CSRF protection built into Next.js
- Rate limiting on authentication endpoints
- Password hashing with bcrypt

### Data Security

- Input validation and sanitization
- SQL injection prevention through Prisma
- File upload security (type checking, size limits)
- XSS protection through React's built-in escaping

### Access Control

- Role-based permissions on all endpoints
- Course access validation
- File access authorization
- API rate limiting

## Deployment Architecture

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
COPY . .
RUN pnpm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Coolify Deployment Configuration

```yaml
# .coolify/docker-compose.yml (for Coolify)
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

volumes:
  uploads:
```

### Environment Variables Setup

```bash
# .env.production
DATABASE_URL=postgresql://username:password@postgres-host:5432/lms_db
REDIS_URL=redis://redis-host:6379
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=https://your-lms-domain.com

# Optional: Database connection pooling
DATABASE_URL=postgresql://username:password@postgres-host:5432/lms_db?connection_limit=20&pool_timeout=20

# Optional: Redis with password
REDIS_URL=redis://:password@redis-host:6379
```

## Monitoring & Logging

### Application Monitoring

- Health check endpoints
- Performance metrics collection
- Error tracking and reporting
- User activity logging

### Infrastructure Monitoring

- Application performance metrics
- External database connection health
- External Redis connection health
- File storage capacity
- Container resource usage
- Network latency to external services

## Future Enhancements

### Phase 2 Features

- Video streaming optimization
- Mobile-responsive improvements
- Advanced analytics dashboard
- Bulk operations for course management
- Advanced search and filtering
- Discussion forums and messaging

### Scalability Improvements

- Microservices architecture
- Kubernetes deployment
- CDN integration
- Database sharding

### Advanced Features

- AI-powered content recommendations
- Automated grading with ML
- Virtual classroom capabilities
- Advanced reporting and analytics

## Development Workflow

### Environment Setup

1. Clone repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run database migrations: `pnpm dlx prisma migrate dev`
5. Seed initial data: `pnpm run seed`
6. Start development server: `pnpm run dev`

### Database Management

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Create and apply migrations
pnpm dlx prisma migrate dev --name migration_name

# Reset database (development only)
pnpm dlx prisma migrate reset

# View database in Prisma Studio
pnpm dlx prisma studio
```

### Testing Strategy

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for scalability

## Implementation Timeline & Milestones

For detailed progress tracking, milestones, and achievement records, see: **[milestones.md](./milestones.md)**

This system design provides a solid foundation for building a comprehensive Learning Management System that can scale with your user base and feature requirements.
