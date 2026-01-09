import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course, AttendanceSession, AttendanceRecord, User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Generate attendance report for a course
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

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'

        // Verify course belongs to this lecturer
        const course = await Course.findOne({
            _id: params.courseId,
            lecturerId: session.user.id
        }).populate('departmentId', 'name code')

        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 })
        }

        // Get all sessions
        const sessions = await AttendanceSession.find({ courseId: params.courseId })
            .sort({ createdAt: -1 })

        // Get all students in department
        const students = await User.find({
            role: 'STUDENT',
            departmentId: course.departmentId
        }).select('name email matricNumber')

        // Get attendance for each student
        const studentData = await Promise.all(
            students.map(async (student) => {
                const records = await AttendanceRecord.find({
                    studentId: student._id,
                    courseId: params.courseId
                })

                const attended = records.length
                const total = sessions.length
                const percentage = total > 0 ? Math.round((attended / total) * 100) : 0

                return {
                    matricNumber: student.matricNumber,
                    name: student.name,
                    email: student.email,
                    attended,
                    total,
                    percentage,
                    status: percentage >= 70 ? 'Good' : 'At Risk'
                }
            })
        )

        // Sort by matric number
        studentData.sort((a, b) => (a.matricNumber || '').localeCompare(b.matricNumber || ''))

        const reportData = {
            course: {
                code: course.courseCode,
                title: course.title,
                department: (course.departmentId as any)?.name || 'N/A'
            },
            generatedAt: new Date().toISOString(),
            totalSessions: sessions.length,
            totalStudents: students.length,
            averageAttendance: studentData.length > 0
                ? Math.round(studentData.reduce((sum, s) => sum + s.percentage, 0) / studentData.length)
                : 0,
            atRiskCount: studentData.filter(s => s.percentage < 70).length,
            students: studentData
        }

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Matric Number', 'Name', 'Email', 'Attended', 'Total Sessions', 'Percentage', 'Status']
            const rows = studentData.map(s => [
                s.matricNumber,
                s.name,
                s.email,
                s.attended,
                s.total,
                `${s.percentage}%`,
                s.status
            ])

            const csv = [
                `Course: ${course.courseCode} - ${course.title}`,
                `Generated: ${new Date().toLocaleString()}`,
                `Total Sessions: ${sessions.length}`,
                '',
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n')

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${course.courseCode}_attendance_report.csv"`
                }
            })
        }

        return NextResponse.json(reportData)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
