import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDepartment extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    code: string
    createdAt: Date
    updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Department code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

DepartmentSchema.index({ code: 1 })

const Department: Model<IDepartment> =
    mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema)

export default Department
