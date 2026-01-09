import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession, AttendanceRecord } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Mark attendance via QR token
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const { qrToken } = await request.json()

        if (!qrToken) {
            return NextResponse.json({ message: 'QR token is required' }, { status: 400 })
        }

        // Find the active session with this token
        const attendanceSession = await AttendanceSession.findOne({
            qrToken,
            isActive: true,
            expiresAt: { $gt: new Date() }
        })

        if (!attendanceSession) {
            return NextResponse.json(
                { message: 'Invalid or expired QR code. Please ask your lecturer for a new code.' },
                { status: 400 }
            )
        }

        // Check if student already marked attendance for this session
        const existingRecord = await AttendanceRecord.findOne({
            sessionId: attendanceSession._id,
            studentId: session.user.id
        })

        if (existingRecord) {
            return NextResponse.json(
                { message: 'You have already marked attendance for this session' },
                { status: 400 }
            )
        }

        // Create attendance record
        await AttendanceRecord.create({
            sessionId: attendanceSession._id,
            studentId: session.user.id,
            courseId: attendanceSession.courseId,
            markedAt: new Date()
        })

        // Increment attendance count on session
        await AttendanceSession.findByIdAndUpdate(
            attendanceSession._id,
            { $inc: { attendanceCount: 1 } }
        )

        return NextResponse.json({ message: 'Attendance marked successfully' })
    } catch (error: any) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'You have already marked attendance for this session' },
                { status: 400 }
            )
        }
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
