# HUKP Digital Attendance System

A full-stack digital attendance tracking system for Hassan Usman Katsina Polytechnic (HUKP) built with Next.js, MongoDB, and NextAuth.

## Features

- **QR Code-based Attendance** - Lecturers generate time-bound QR codes that students scan to mark attendance
- **Role-based Access Control** - Admin, Lecturer, and Student roles with protected routes
- **Real-time Attendance Tracking** - Live attendance count during sessions
- **Attendance Analytics** - View attendance percentages and warnings
- **Dark/Light Mode** - Full theme support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Credentials
- **UI Components**: shadcn/ui + Tailwind CSS
- **QR Code**: qrcode (generation) + html5-qrcode (scanning)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- pnpm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables in `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/hukp-attendance
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key
```

3. Seed the database with sample data:
```bash
pnpm seed
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

After seeding, use these credentials (password: `password123`):

| Role | Email |
|------|-------|
| Admin | admin@hukp.edu.ng |
| Lecturer | abubakar.ibrahim@hukp.edu.ng |
| Lecturer | fatima.yusuf@hukp.edu.ng |
| Student | muhammad.sani@student.hukp.edu.ng |

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── admin/         # Admin pages
│   ├── lecturer/      # Lecturer pages
│   ├── student/       # Student pages
│   └── login/         # Auth page
├── components/
│   └── ui/            # shadcn/ui components
├── lib/
│   ├── models/        # MongoDB models
│   ├── auth.ts        # NextAuth config
│   ├── db.ts          # Database connection
│   └── utils.ts       # Utility functions
└── middleware.ts      # Route protection
```

## Usage

### Admin
- Manage users (create/edit/delete students, lecturers)
- Manage departments and courses
- View system-wide analytics

### Lecturer
- View assigned courses
- Start attendance sessions with QR code
- Monitor live attendance count
- View attendance history

### Student
- Scan QR codes to mark attendance
- View attendance history
- Check attendance percentage per course
- Receive low attendance warnings
