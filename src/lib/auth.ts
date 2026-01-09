import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectToDatabase from './db'
import User, { UserRole } from './models/User'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name: string
            email: string
            role: UserRole
            departmentId?: string
        }
    }

    interface User {
        id: string
        name: string
        email: string
        role: UserRole
        departmentId?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: UserRole
        departmentId?: string
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                await connectToDatabase()

                const user = await User.findOne({ email: credentials.email.toLowerCase() })

                if (!user) {
                    throw new Error('Invalid email or password')
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)

                if (!isPasswordValid) {
                    throw new Error('Invalid email or password')
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    departmentId: user.departmentId?.toString(),
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.departmentId = user.departmentId
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.departmentId = token.departmentId
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
