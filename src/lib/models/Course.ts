import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICourse extends Document {
    _id: mongoose.Types.ObjectId
    courseCode: string
    title: string
    departmentId: mongoose.Types.ObjectId
    lecturerId: mongoose.Types.ObjectId
    creditUnits: number
    semester: 'FIRST' | 'SECOND'
    level: number
    createdAt: Date
    updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
    {
        courseCode: {
            type: String,
            required: [true, 'Course code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: [true, 'Department is required'],
        },
        lecturerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Lecturer is required'],
        },
        creditUnits: {
            type: Number,
            default: 3,
            min: 1,
            max: 6,
        },
        semester: {
            type: String,
            enum: ['FIRST', 'SECOND'],
            default: 'FIRST',
        },
        level: {
            type: Number,
            enum: [100, 200, 300, 400, 500],
            default: 100,
        },
    },
    {
        timestamps: true,
    }
)

CourseSchema.index({ courseCode: 1 })
CourseSchema.index({ departmentId: 1 })
CourseSchema.index({ lecturerId: 1 })

const Course: Model<ICourse> =
    mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course
