import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendanceRecord extends Document {
    _id: mongoose.Types.ObjectId
    sessionId: mongoose.Types.ObjectId
    studentId: mongoose.Types.ObjectId
    courseId: mongoose.Types.ObjectId
    markedAt: Date
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
    {
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'AttendanceSession',
            required: [true, 'Session is required'],
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student is required'],
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course is required'],
        },
        markedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
)

// Compound index to prevent duplicate attendance
AttendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true })
AttendanceRecordSchema.index({ studentId: 1 })
AttendanceRecordSchema.index({ courseId: 1 })

const AttendanceRecord: Model<IAttendanceRecord> =
    mongoose.models.AttendanceRecord ||
    mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema)

export default AttendanceRecord
