import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { AttendanceSession, AttendanceRecord } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// Get students who marked attendance for a session
export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        // Verify session belongs to this lecturer
        const attendanceSession = await AttendanceSession.findOne({
            _id: params.sessionId,
            lecturerId: session.user.id
        })

        if (!attendanceSession) {
            return NextResponse.json({ message: 'Session not found' }, { status: 404 })
        }

        // Get all attendance records for this session
        const records = await AttendanceRecord.find({ sessionId: params.sessionId })
            .populate('studentId', 'name email matricNumber')
            .sort({ markedAt: -1 })

        return NextResponse.json({
            students: records.map(r => {
                const student = r.studentId as any
                return {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    matricNumber: student.matricNumber,
                    markedAt: r.markedAt
                }
            }),
            count: records.length
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
