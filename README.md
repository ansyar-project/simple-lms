# Learning Management System (LMS)

A modern, full-featured Learning Management System built with Next.js 15, featuring course management, real-time content delivery, and comprehensive user authentication.

## ✨ Features

### 🎓 Course Management

- **Course Creation & Management**: Complete CRUD operations for courses with rich content support
- **Modular Structure**: Organize courses into modules and lessons with drag-and-drop reordering
- **Content Types**: Support for videos, documents, quizzes, and interactive content
- **Course Status Management**: Draft, published, and archived states
- **Rich Text Editor**: TipTap-powered content editor with images and links

### 👥 User Management & Authentication

- **Multi-role System**: Students, Instructors, and Administrators
- **Secure Authentication**: NextAuth.js v5 with email/password and Google OAuth
- **Role-based Access Control**: Granular permissions and route protection
- **Session Management**: Redis-backed session storage for scalability

### 📊 Learning Experience

- **Student Dashboard**: Personalized learning experience with course progress
- **Instructor Portal**: Course management and student progress tracking
- **File Management**: MinIO-powered file storage for course materials
- **Progress Tracking**: Comprehensive learning analytics

### 🔧 Technical Features

- **Modern Stack**: Next.js 15 with React 19 and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Features**: Redis integration for caching and sessions
- **Responsive Design**: Mobile-first UI with Shadcn components
- **Docker Support**: Complete containerization for development and production

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v5
- **Storage**: MinIO (S3-compatible)
- **Cache**: Redis
- **UI Components**: Shadcn UI, Radix UI
- **Rich Text**: TipTap Editor
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Redis server
- MinIO server (for file storage)

## 🛠️ Installation

### Quick Start with Docker

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd lms
   ```

2. **Start development environment:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access the application:**
   - Application: http://localhost:3000
   - Database Studio: Run `pnpm db:studio`

### Manual Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Configure your database, Redis, and MinIO connections
   ```

3. **Set up the database:**

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

## 📝 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production

```bash
docker-compose up -d
```

For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md).

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Student dashboard
│   └── instructor/        # Instructor portal
├── components/            # Reusable components
│   ├── course/           # Course-related components
│   ├── forms/            # Form components
│   └── ui/               # UI components
├── lib/                  # Utilities and configurations
├── types/                # TypeScript type definitions
└── actions/              # Server actions
```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
```

## 🚀 Production Deployment

### NextAuth.js Configuration for Production

When deploying to production, you **must** configure the `NEXTAUTH_URL` environment variable to match your production domain to avoid the `UntrustedHost` error.

#### For your deployment at `simple-lms.ansyar-world.top`:

1. **Set the correct NEXTAUTH_URL** in your production environment:

   ```env
   NEXTAUTH_URL="https://simple-lms.ansyar-world.top"
   ```

2. **Ensure NEXTAUTH_SECRET is secure** (generate a random 32+ character string):

   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

3. **For Docker deployments**, update your `.env` file:
   ```env
   NEXTAUTH_URL="https://simple-lms.ansyar-world.top"
   NEXTAUTH_SECRET="your-super-secure-randomly-generated-secret"
   ```

#### Troubleshooting UntrustedHost Error

If you encounter the `UntrustedHost` error:

1. **Verify NEXTAUTH_URL** matches your production domain exactly
2. **Check environment variables** are loaded correctly in your deployment
3. **Restart your application** after changing environment variables
4. **For reverse proxy setups**, ensure the `Host` header is forwarded correctly

#### Security Considerations

- Always use HTTPS in production (`https://` not `http://`)
- Keep `NEXTAUTH_SECRET` secure and never commit it to version control
- Regularly rotate your authentication secrets
- Configure proper CORS policies for your domain

## 🎯 Development Phases

The project is developed in structured phases:

- ✅ **Phase 1**: Foundation Setup (Authentication, Database, UI)
- 🚧 **Phase 2**: Core Course Management (In Progress)
- 📋 **Phase 3**: Student Experience & Enrollment
- 📋 **Phase 4**: Assessments & Quizzes
- 📋 **Phase 5**: Analytics & Reporting

For detailed development roadmap, see [lms_system_design.md](./lms_system_design.md).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the [system design document](./lms_system_design.md)
- Review the [Docker setup guide](./DOCKER.md)
- Open an issue on GitHub
