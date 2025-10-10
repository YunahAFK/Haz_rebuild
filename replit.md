# HAZ Learning Platform

## Overview

HAZ is a modern web-based learning platform that enables teachers to create and publish educational lectures for students. The platform provides a content management system for educators and an intuitive browsing experience for learners, with features including lecture categorization, search functionality, rich text editing, and view tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI System**
- Radix UI primitives for accessible, unstyled component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- shadcn/ui component library built on Radix UI and Tailwind
- Custom CSS variables for theming support (light/dark modes)

**State Management Approach**
- Context API for global application state (AuthContext, LectureContext)
- Local component state with React hooks for UI-specific state
- React Query for caching and synchronizing server state
- Firebase Authentication state managed through AuthContext

**Key Design Patterns**
- Provider pattern for sharing auth and lecture state across components
- Custom hooks for reusable logic (useAuth, useLectures, useToast, useIsMobile)
- Component composition with Radix UI's slot pattern
- Responsive design with mobile-first approach using Tailwind breakpoints

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- ESM (ES Modules) format for modern JavaScript module system

**Data Storage Strategy**
The application uses a **dual-storage architecture**:

1. **In-Memory Storage (Development/Fallback)**
   - MemStorage class implements IStorage interface
   - Stores users in a Map for quick prototyping
   - Stateless - data resets on server restart

2. **PostgreSQL + Drizzle ORM (Production-Ready)**
   - Drizzle ORM configured for PostgreSQL dialect
   - Schema-first approach with TypeScript types
   - Migrations stored in `/migrations` directory
   - Uses Neon serverless driver for connection pooling

3. **Firebase Integration**
   - Firebase Authentication for user identity management
   - Cloud Firestore for real-time lecture data storage
   - Security rules enforce role-based access control
   - Firestore handles: lectures collection with author, content, metadata
   - Users collection stores role (student/teacher) and profile data

**Rationale**: The dual-storage pattern allows rapid development with in-memory storage while maintaining production-ready PostgreSQL infrastructure. Firebase adds real-time capabilities and managed authentication without managing database servers.

**API Design**
- RESTful conventions with `/api` prefix for all endpoints
- Middleware for request logging and JSON parsing
- Raw body parsing support for webhook integrations
- Session management with connect-pg-simple for PostgreSQL-backed sessions

### Authentication & Authorization

**Authentication Mechanism**
- Firebase Authentication with email/password sign-in
- JWT tokens managed by Firebase SDK
- Session state synchronized between client and server
- onAuthStateChanged listener for real-time auth state updates

**Authorization Model**
- Role-based access control (RBAC) with two roles: `student` and `teacher`
- Teachers can create, edit, delete lectures
- Students have read-only access to published lectures
- Firestore security rules enforce server-side authorization
- Client-side route protection based on user role

**Security Considerations**
- Firestore rules prevent unauthorized access to user data
- Teachers must be authenticated to modify lectures
- Published lectures publicly readable, unpublished require authentication
- Environment variables for sensitive Firebase configuration

### Data Schema

**User Entity**
```typescript
{
  id: string (UUID)
  name: string
  email: string (validated)
  role: "student" | "teacher"
  createdAt: Date
}
```

**Lecture Entity**
```typescript
{
  id: string (UUID)
  title: string
  content: string (rich text HTML)
  author: string
  category: string (mathematics, science, programming, etc.)
  createdAt: Date
  updatedAt: Date
  published: boolean (default: false)
  featured: boolean (default: false)
  allowComments: boolean (default: true)
  views: number (default: 0)
}
```

**Design Decisions**
- Zod schemas provide runtime validation and TypeScript types
- Separate insert schemas omit auto-generated fields (id, timestamps)
- Rich text content stored as HTML for rendering flexibility
- Category as string allows easy extension without schema changes
- View count tracked client-side and incremented in Firestore

## External Dependencies

### Third-Party Services

**Firebase (Primary Backend Services)**
- **Firebase Authentication**: User identity and session management
- **Cloud Firestore**: NoSQL database for lectures and user profiles
- **Configuration**: Via environment variables (VITE_FIREBASE_*)
- **Purpose**: Provides managed authentication and real-time database without server infrastructure

**Neon PostgreSQL (Alternative Database)**
- **Service**: Serverless PostgreSQL hosting
- **Driver**: @neondatabase/serverless for connection pooling
- **Purpose**: Relational data storage with Drizzle ORM support
- **Note**: Currently configured but Firebase Firestore is actively used

### Key Libraries

**UI & Styling**
- @radix-ui/* (v1.x): Accessible component primitives (20+ components)
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe variant styles
- react-quill: WYSIWYG rich text editor for lecture content

**Data & State Management**
- @tanstack/react-query: Server state synchronization and caching
- firebase (v10): Authentication and Firestore SDK
- drizzle-orm: Type-safe SQL query builder
- zod: Runtime type validation and schema definition

**Form Handling**
- react-hook-form: Performant form state management
- @hookform/resolvers: Zod integration for form validation

**Development Tools**
- vite: Build tool and dev server
- typescript: Type checking and IntelliSense
- @replit/vite-plugin-*: Replit-specific development enhancements
- esbuild: Server-side bundling for production

### API Integrations

**External APIs**
- Firebase REST API: Implicit via Firebase SDK
- Firestore REST API: Implicit via Firestore SDK
- No third-party content or payment APIs currently integrated

**Asset Delivery**
- Google Fonts CDN: Inter and Roboto font families
- Self-hosted: All other assets bundled via Vite

### Database Configuration

**PostgreSQL Setup (via Drizzle)**
- Connection: DATABASE_URL environment variable
- Schema: Defined in `/shared/schema.ts`
- Migration: Manual via `npm run db:push`
- Dialect: PostgreSQL with Neon serverless driver

**Firestore Setup**
- Collections: `users`, `lectures`
- Indexes: Auto-generated by Firebase
- Security: Rules defined in FIREBASE_SETUP.md
- Real-time: Snapshot listeners in LectureContext