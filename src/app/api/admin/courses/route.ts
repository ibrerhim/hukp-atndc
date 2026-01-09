import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Course } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// GET all courses
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const courses = await Course.find()
            .populate('departmentId', 'name code')
            .populate('lecturerId', 'name email')
            .sort({ courseCode: 1 })

        return NextResponse.json({ courses })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// POST create course
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const body = await request.json()
        const { courseCode, title, departmentId, lecturerId, creditUnits, semester, level } = body

        // Check if course exists
        const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() })
        if (existingCourse) {
            return NextResponse.json({ message: 'Course with this code already exists' }, { status: 400 })
        }

        const course = await Course.create({
            courseCode: courseCode.toUpperCase(),
            title,
            departmentId,
            lecturerId,
            creditUnits,
            semester,
            level,
        })

        const populatedCourse = await Course.findById(course._id)
            .populate('departmentId', 'name')
            .populate('lecturerId', 'name')

        return NextResponse.json({ message: 'Course created successfully', course: populatedCourse })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
