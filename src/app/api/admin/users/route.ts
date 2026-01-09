import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import connectToDatabase from '@/lib/db'
import { User } from '@/lib/models'
import { authOptions } from '@/lib/auth'

// GET all users
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')

        const query = role ? { role } : {}
        const users = await User.find(query)
            .populate('departmentId', 'name')
            .select('-passwordHash')
            .sort({ createdAt: -1 })

        return NextResponse.json({ users })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

// POST create user
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        await connectToDatabase()

        const body = await request.json()
        const { name, email, password, role, departmentId, matricNumber, staffId } = body

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 })
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12)

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            passwordHash,
            role,
            departmentId: departmentId || undefined,
            matricNumber: role === 'STUDENT' ? matricNumber : undefined,
            staffId: role !== 'STUDENT' ? staffId : undefined,
        })

        return NextResponse.json({
            message: 'User created successfully',
            user: { ...user.toObject(), passwordHash: undefined },
        })
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
