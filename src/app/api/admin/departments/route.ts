import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Department } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// GET all departments
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const departments = await Department.find().sort({ name: 1 })

        return NextResponse.json({ departments })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// POST create department
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const body = await request.json()
        const { name, code } = body

        // Check if department exists
        const existingDept = await Department.findOne({ code: code.toUpperCase() })
        if (existingDept) {
            return NextResponse.json({ message: 'Department with this code already exists' }, { status: 400 })
        }

        const department = await Department.create({
            name,
            code: code.toUpperCase(),
        })

        return NextResponse.json({ message: 'Department created successfully', department })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
