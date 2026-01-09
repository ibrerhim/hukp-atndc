import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get active session for lecturer
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        // Check and close expired sessions
        await AttendanceSession.updateMany(
            { lecturerId: session.user.id, isActive: true, expiresAt: { $lt: new Date() } },
            { isActive: false }
        )

        const activeSession = await AttendanceSession.findOne({
            lecturerId: session.user.id,
            isActive: true
        }).populate('courseId', 'courseCode title')

        return NextResponse.json({ session: activeSession })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
