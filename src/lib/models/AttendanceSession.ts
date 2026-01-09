import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendanceSession extends Document {
    _id: mongoose.Types.ObjectId
    courseId: mongoose.Types.ObjectId
    lecturerId: mongoose.Types.ObjectId
    isActive: boolean
    qrToken: string
    expiresAt: Date
    attendanceCount: number
    createdAt: Date
    updatedAt: Date
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
        },
        lecturerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Lecturer is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        qrToken: {
            type: String,
            required: [true, 'QR token is required'],
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiry time is required'],
        },
        attendanceCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

AttendanceSessionSchema.index({ courseId: 1, lecturerId: 1 })
AttendanceSessionSchema.index({ qrToken: 1 })
AttendanceSessionSchema.index({ isActive: 1 })
AttendanceSessionSchema.index({ expiresAt: 1 })

const AttendanceSession: Model<IAttendanceSession> =
    mongoose.models.AttendanceSession ||
    mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema)

export default AttendanceSession
