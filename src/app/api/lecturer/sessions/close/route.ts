import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Close attendance session
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const { sessionId } = await request.json()

        const attendanceSession = await AttendanceSession.findOneAndUpdate(
            { _id: sessionId, lecturerId: session.user.id },
            { isActive: false },
            { new: true }
        )

        if (!attendanceSession) {
            return NextResponse.json({ message: 'Session not found' }, { status: 404 })
        }

        return NextResponse.json({
            message: 'Session closed successfully',
            session: attendanceSession
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
