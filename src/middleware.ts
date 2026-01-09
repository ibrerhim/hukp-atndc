import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define route access rules
const routeRules: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/lecturer': ['LECTURER'],
    '/student': ['STUDENT'],
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for public routes and API
    if (
        pathname.startsWith('/api/auth') ||
        pathname === '/login' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next()
    }

    // Get the user's session
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // If not logged in, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(routeRules)) {
        if (pathname.startsWith(route)) {
            if (!allowedRoles.includes(token.role as string)) {
                // Redirect to appropriate dashboard based on role
                const dashboardMap: Record<string, string> = {
                    ADMIN: '/admin/dashboard',
                    LECTURER: '/lecturer/dashboard',
                    STUDENT: '/student/dashboard',
                }
                return NextResponse.redirect(new URL(dashboardMap[token.role as string] || '/login', request.url))
            }
        }
    }

    // Redirect root to appropriate dashboard
    if (pathname === '/') {
        const dashboardMap: Record<string, string> = {
            ADMIN: '/admin/dashboard',
            LECTURER: '/lecturer/dashboard',
            STUDENT: '/student/dashboard',
        }
        return NextResponse.redirect(new URL(dashboardMap[token.role as string] || '/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
