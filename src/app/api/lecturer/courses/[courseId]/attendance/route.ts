import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course, AttendanceSession, AttendanceRecord, User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get students with low attendance for a course
export async function GET(
    request: NextRequest,
    { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        // Verify course belongs to this lecturer
        const course = await Course.findOne({
            _id: params.courseId,
            lecturerId: session.user.id
        })

        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 })
        }

        // Get total sessions for this course
        const totalSessions = await AttendanceSession.countDocuments({ courseId: params.courseId })

        if (totalSessions === 0) {
            return NextResponse.json({ students: [], totalSessions: 0 })
        }

        // Get all students in this department
        const students = await User.find({
            role: 'STUDENT',
            departmentId: course.departmentId
        }).select('name email matricNumber')

        // Get attendance for each student
        const studentAttendance = await Promise.all(
            students.map(async (student) => {
                const attended = await AttendanceRecord.countDocuments({
                    studentId: student._id,
                    courseId: params.courseId
                })

                const percentage = Math.round((attended / totalSessions) * 100)

                return {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    matricNumber: student.matricNumber,
                    attended,
                    totalSessions,
                    percentage,
                    isLow: percentage < 70
                }
            })
        )

        // Filter and sort by percentage (lowest first)
        const lowAttendanceStudents = studentAttendance
            .filter(s => s.isLow)
            .sort((a, b) => a.percentage - b.percentage)

        return NextResponse.json({
            students: lowAttendanceStudents,
            totalSessions,
            allStudents: studentAttendance.sort((a, b) => a.percentage - b.percentage)
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
