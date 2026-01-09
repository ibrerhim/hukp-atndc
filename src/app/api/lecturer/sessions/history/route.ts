import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get session history for lecturer
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const sessions = await AttendanceSession.find({ lecturerId: session.user.id })
            .populate('courseId', 'courseCode title')
            .sort({ createdAt: -1 })
            .limit(50)

        return NextResponse.json({ sessions })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
