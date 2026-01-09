import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceRecord, AttendanceSession, Course, User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get student's attendance stats
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const studentId = session.user.id

        // Get student info for department
        const student = await User.findById(studentId)
        if (!student) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 })
        }

        // Get courses in student's department
        const courses = await Course.find({ departmentId: student.departmentId })
        const courseIds = courses.map(c => c._id)

        // Get total attendance
        const totalAttendance = await AttendanceRecord.countDocuments({ studentId })

        // Get attendance per course
        const courseAttendance = await Promise.all(
            courses.map(async (course) => {
                // Total sessions for this course
                const totalSessions = await AttendanceSession.countDocuments({
                    courseId: course._id
                })

                // Student's attendance for this course
                const attended = await AttendanceRecord.countDocuments({
                    studentId,
                    courseId: course._id
                })

                const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0

                return {
                    courseId: course._id.toString(),
                    courseCode: course.courseCode,
                    courseTitle: course.title,
                    attended,
                    total: totalSessions,
                    percentage
                }
            })
        )

        // Filter out courses with no sessions
        const activeCourses = courseAttendance.filter(c => c.total > 0)

        // Calculate average percentage
        const averagePercentage = activeCourses.length > 0
            ? Math.round(activeCourses.reduce((sum, c) => sum + c.percentage, 0) / activeCourses.length)
            : 0

        return NextResponse.json({
            totalAttendance,
            coursesEnrolled: courses.length,
            averagePercentage,
            courseAttendance: activeCourses
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
