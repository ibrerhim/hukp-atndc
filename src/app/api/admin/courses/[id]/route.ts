import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// PUT update course
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const body = await request.json()
        const { courseCode, title, departmentId, lecturerId, creditUnits, semester, level } = body

        const course = await Course.findByIdAndUpdate(
            params.id,
            {
                courseCode: courseCode.toUpperCase(),
                title,
                departmentId,
                lecturerId,
                creditUnits,
                semester,
                level,
            },
            { new: true }
        )
            .populate('departmentId', 'name')
            .populate('lecturerId', 'name')

        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Course updated successfully', course })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// DELETE course
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const course = await Course.findByIdAndDelete(params.id)

        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Course deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
