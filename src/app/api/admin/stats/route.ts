import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { User, Course, Department, AttendanceRecord, AttendanceSession } from '@/lib/models'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        // Get counts
        const [totalStudents, totalLecturers, totalCourses, totalDepartments] = await Promise.all([
            User.countDocuments({ role: 'STUDENT' }),
            User.countDocuments({ role: 'LECTURER' }),
            Course.countDocuments(),
            Department.countDocuments(),
        ])

        // Get today's attendance count
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const totalAttendanceToday = await AttendanceRecord.countDocuments({
            markedAt: { $gte: today, $lt: tomorrow },
        })

        // Calculate average attendance rate (simplified)
        const totalSessions = await AttendanceSession.countDocuments()
        const totalRecords = await AttendanceRecord.countDocuments()
        const averageAttendanceRate = totalSessions > 0 && totalStudents > 0
            ? Math.round((totalRecords / (totalSessions * totalStudents)) * 100)
            : 0

        return NextResponse.json({
            totalStudents,
            totalLecturers,
            totalCourses,
            totalDepartments,
            totalAttendanceToday,
            averageAttendanceRate: Math.min(averageAttendanceRate, 100),
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
