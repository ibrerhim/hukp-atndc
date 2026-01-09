import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession, Course } from '@/lib/models'
import { authOptions } from '@/lib/auth'
import { generateQRToken } from '@/lib/utils'

// Start attendance session
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const { courseId } = await request.json()

        // Verify lecturer owns this course
        const course = await Course.findOne({ _id: courseId, lecturerId: session.user.id })
        if (!course) {
            return NextResponse.json({ message: 'Course not found or not assigned to you' }, { status: 404 })
        }

        // Check for existing active session
        const existingSession = await AttendanceSession.findOne({
            lecturerId: session.user.id,
            isActive: true
        })
        if (existingSession) {
            return NextResponse.json({ message: 'You already have an active session' }, { status: 400 })
        }

        // Create new session (15 minutes expiry)
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + 15)

        const attendanceSession = await AttendanceSession.create({
            courseId,
            lecturerId: session.user.id,
            isActive: true,
            qrToken: generateQRToken(),
            expiresAt,
            attendanceCount: 0
        })

        const populatedSession = await AttendanceSession.findById(attendanceSession._id)
            .populate('courseId', 'courseCode title')

        return NextResponse.json({
            message: 'Session started successfully',
            session: populatedSession
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
