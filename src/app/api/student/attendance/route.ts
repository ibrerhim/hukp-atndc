import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceRecord } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get student's attendance history
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const records = await AttendanceRecord.find({ studentId: session.user.id })
            .populate('courseId', 'courseCode title')
            .sort({ markedAt: -1 })
            .limit(100)

        return NextResponse.json({ records })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
