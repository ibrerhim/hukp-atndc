import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT'

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    passwordHash: string
    role: UserRole
    departmentId?: mongoose.Types.ObjectId
    matricNumber?: string // For students
    staffId?: string // For lecturers and admins
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        role: {
            type: String,
            enum: ['ADMIN', 'LECTURER', 'STUDENT'],
            required: [true, 'Role is required'],
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
        },
        matricNumber: {
            type: String,
            sparse: true,
        },
        staffId: {
            type: String,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for better query performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ departmentId: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
