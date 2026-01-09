import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// GET lecturer's courses
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'LECTURER') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const courses = await Course.find({ lecturerId: session.user.id })
            .populate('departmentId', 'name code')
            .sort({ courseCode: 1 })

        return NextResponse.json({ courses })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
