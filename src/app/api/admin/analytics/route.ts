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

        // Get departments with stats
        const departments = await Department.find()
        const departmentStats = await Promise.all(
            departments.map(async (dept) => {
                const studentCount = await User.countDocuments({ role: 'STUDENT', departmentId: dept._id })
                const courseCount = await Course.countDocuments({ departmentId: dept._id })

                // Calculate avg attendance for department
                const courses = await Course.find({ departmentId: dept._id })
                const courseIds = courses.map(c => c._id)

                const totalSessions = await AttendanceSession.countDocuments({ courseId: { $in: courseIds } })
                const totalRecords = await AttendanceRecord.countDocuments({ courseId: { $in: courseIds } })

                const avgAttendance = totalSessions > 0 && studentCount > 0
                    ? Math.min(100, Math.round((totalRecords / (totalSessions * studentCount)) * 100))
                    : 0

                return {
                    id: dept._id.toString(),
                    name: dept.name,
                    studentCount,
                    courseCount,
                    avgAttendance
                }
            })
        )

        // Get top performing courses
        const courses = await Course.find().populate('departmentId', 'name')
        const courseStats = await Promise.all(
            courses.map(async (course) => {
                const sessions = await AttendanceSession.countDocuments({ courseId: course._id })
                const students = await User.countDocuments({
                    role: 'STUDENT',
                    departmentId: course.departmentId
                })
                const records = await AttendanceRecord.countDocuments({ courseId: course._id })

                const avgAttendance = sessions > 0 && students > 0
                    ? Math.min(100, Math.round((records / (sessions * students)) * 100))
                    : 0

                return {
                    courseCode: course.courseCode,
                    title: course.title,
                    avgAttendance
                }
            })
        )

        const topCourses = courseStats
            .filter(c => c.avgAttendance > 0)
            .sort((a, b) => b.avgAttendance - a.avgAttendance)
            .slice(0, 5)

        // Count low attendance students
        const students = await User.find({ role: 'STUDENT' })
        let lowAttendanceCount = 0

        for (const student of students) {
            const totalRecords = await AttendanceRecord.countDocuments({ studentId: student._id })
            const totalPossible = await AttendanceSession.countDocuments({
                courseId: { $in: await Course.find({ departmentId: student.departmentId }).distinct('_id') }
            })

            if (totalPossible > 0) {
                const percentage = (totalRecords / totalPossible) * 100
                if (percentage < 70) {
                    lowAttendanceCount++
                }
            }
        }

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentSessions = await AttendanceSession.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        })
        const recentRecords = await AttendanceRecord.countDocuments({
            markedAt: { $gte: sevenDaysAgo }
        })

        return NextResponse.json({
            departments: departmentStats,
            topCourses,
            lowAttendanceStudents: lowAttendanceCount,
            recentActivity: [{ sessions: recentSessions, attendance: recentRecords }]
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
