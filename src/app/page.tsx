import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    // Redirect based on role
    const dashboardMap: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        LECTURER: '/lecturer/dashboard',
        STUDENT: '/student/dashboard',
    }

    redirect(dashboardMap[session.user.role] || '/login')
}
