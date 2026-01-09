import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course, AttendanceSession, AttendanceRecord, User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const lecturerId = session.user.id

        // Get course count
        const totalCourses = await Course.countDocuments({ lecturerId })

        // Get course IDs for this lecturer
        const courses = await Course.find({ lecturerId }).select('_id departmentId')
        const courseIds = courses.map(c => c._id)

        // Get student count (students in the same departments as the courses)
        const departmentIds = Array.from(new Set(courses.map(c => c.departmentId?.toString()).filter(Boolean)))
        const totalStudents = await User.countDocuments({
            role: 'STUDENT',
            departmentId: { $in: departmentIds }
        })

        // Get active sessions count
        const activeSessions = await AttendanceSession.countDocuments({
            lecturerId,
            isActive: true
        })

        // Get today's attendance
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAttendance = await AttendanceRecord.countDocuments({
            courseId: { $in: courseIds },
            markedAt: { $gte: today, $lt: tomorrow }
        })

        return NextResponse.json({
            totalCourses,
            totalStudents,
            activeSessions,
            todayAttendance
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
