import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/db'
import { Department } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// PUT update department
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
        const { name, code } = body

        const department = await Department.findByIdAndUpdate(
            params.id,
            { name, code: code.toUpperCase() },
            { new: true }
        )

        if (!department) {
            return NextResponse.json({ message: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Department updated successfully', department })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// DELETE department
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

        const department = await Department.findByIdAndDelete(params.id)

        if (!department) {
            return NextResponse.json({ message: 'Department not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Department deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
