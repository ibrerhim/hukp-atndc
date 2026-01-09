import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// GET single user
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const user = await User.findById(params.id)
            .populate('departmentId', 'name')
            .select('-passwordHash')

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// PUT update user
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
        const { name, email, password, role, departmentId, matricNumber, staffId } = body

        const updateData: any = {
            name,
            email: email.toLowerCase(),
            role,
            departmentId: departmentId || undefined,
            matricNumber: role === 'STUDENT' ? matricNumber : undefined,
            staffId: role !== 'STUDENT' ? staffId : undefined,
        }

        // Only update password if provided
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 12)
        }

        const user = await User.findByIdAndUpdate(params.id, updateData, { new: true })
            .populate('departmentId', 'name')
            .select('-passwordHash')

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'User updated successfully', user })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// DELETE user
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

        const user = await User.findByIdAndDelete(params.id)

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
