# Classroom Interface - Product Requirements Document

## Original Problem Statement
Build a responsive, single-page "Classroom Interface" web application using React, Tailwind CSS, and Supabase. The app serves as a dashboard where users can view course cards, and an "Admin" can create cards, edit titles, and upload content (descriptions and files).

## User Personas
1. **Viewer/Student**: Can browse course cards, view course details, download files
2. **Admin/Instructor**: Can create/edit/delete courses, upload files, edit descriptions

## Core Requirements
- React frontend with Tailwind CSS
- Supabase database integration (hardcoded credentials)
- Client-side admin authentication (access code: "PV")
- Course CRUD operations
- File upload as Base64 in JSONB
- RLS error handling with SQL fix modal

## Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Shadcn/UI

## What's Been Implemented (January 2025)

### Core Features ✅
1. **Dashboard View**
   - Responsive course card grid (1/2/3 columns)
   - Course cards with image, title, description, progress bar
   - Hover animations with play icon overlay
   - AIS+ tag badges

2. **Admin Mode**
   - Lock/unlock icon toggle in header
   - Access code modal (code: "PV")
   - Admin-only: Create Card button, Edit buttons on cards

3. **Create Course**
   - Modal with title, description, cover image upload
   - Random placeholder image if none provided

4. **Edit Course**
   - Update title and cover image
   - Delete course functionality

5. **Course Detail View**
   - Full-page view with hero image
   - Editable content description (admin mode)
   - Drag-and-drop file upload area (admin mode)
   - File list with download/delete functionality
   - Files stored as Base64 in JSONB

6. **Backend API**
   - GET /api/courses - List all courses
   - GET /api/courses/{id} - Get single course
   - POST /api/courses - Create course
   - PUT /api/courses/{id} - Update course
   - DELETE /api/courses/{id} - Delete course

7. **Error Handling**
   - RLS error detection with SQL fix modal
   - Toast notifications for success/error

### Design Implementation
- Clean, minimalist, academic aesthetic
- White backgrounds with gray-50/100 sections
- Black primary buttons, blue accents
- Inter font, rounded corners (rounded-xl)
- Glassmorphism modals
- Smooth animations (Framer Motion)

## Prioritized Backlog

### P0 (Must Have) - DONE ✅
- [x] Course card grid dashboard
- [x] Admin mode toggle
- [x] Create/Edit/Delete courses
- [x] Course detail view
- [x] File upload/download
- [x] Supabase integration

### P1 (Should Have)
- [ ] Search/filter functionality
- [ ] Course categories
- [ ] User-specific progress tracking
- [ ] Real-time updates (Supabase subscriptions)

### P2 (Nice to Have)
- [ ] Dark mode toggle
- [ ] Drag-and-drop card reordering
- [ ] Course completion certificates
- [ ] Student enrollment management

## Next Action Items
1. Configure Supabase RLS policies if seeing permission errors
2. Add search/filter for courses
3. Implement real progress tracking per user
4. Add course categories/tags filtering
