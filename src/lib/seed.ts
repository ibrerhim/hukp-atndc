import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local manually since tsx doesn't do it automatically
try {
    const envPath = join(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=')
        if (key && !key.startsWith('#') && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim()
        }
    })
} catch (e) {
    console.log('No .env.local found, using environment variables')
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hukp-attendance'

// Define schemas inline for seeding
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ['ADMIN', 'LECTURER', 'STUDENT'] },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    matricNumber: String,
    staffId: String,
}, { timestamps: true })

const DepartmentSchema = new mongoose.Schema({
    name: String,
    code: { type: String, unique: true, uppercase: true },
}, { timestamps: true })

const CourseSchema = new mongoose.Schema({
    courseCode: { type: String, unique: true, uppercase: true },
    title: String,
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creditUnits: { type: Number, default: 3 },
    semester: { type: String, enum: ['FIRST', 'SECOND'], default: 'FIRST' },
    level: { type: Number, default: 100 },
}, { timestamps: true })

async function seed() {
    console.log('🌱 Starting database seed...')

    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        const User = mongoose.models.User || mongoose.model('User', UserSchema)
        const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema)
        const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)

        // Clear existing data
        await User.deleteMany({})
        await Department.deleteMany({})
        await Course.deleteMany({})
        console.log('🗑️  Cleared existing data')

        // Create departments
        const departments = await Department.insertMany([
            { name: 'Computer Science', code: 'CSC' },
            { name: 'Electrical Engineering', code: 'EE' },
            { name: 'Business Administration', code: 'BUS' },
            { name: 'Mass Communication', code: 'MCM' },
        ])
        console.log(`✅ Created ${departments.length} departments`)

        const cscDept = departments.find(d => d.code === 'CSC')!

        // Hash password
        const passwordHash = await bcrypt.hash('password123', 12)

        // Create admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@hukp.edu.ng',
            passwordHash,
            role: 'ADMIN',
            staffId: 'ADMIN001',
        })
        console.log('✅ Created admin user')

        // Create lecturers
        const lecturer1 = await User.create({
            name: 'Dr. Abubakar Ibrahim',
            email: 'abubakar.ibrahim@hukp.edu.ng',
            passwordHash,
            role: 'LECTURER',
            departmentId: cscDept._id,
            staffId: 'LECT001',
        })

        const lecturer2 = await User.create({
            name: 'Prof. Fatima Yusuf',
            email: 'fatima.yusuf@hukp.edu.ng',
            passwordHash,
            role: 'LECTURER',
            departmentId: cscDept._id,
            staffId: 'LECT002',
        })
        console.log('✅ Created 2 lecturers')

        // Create students
        const students = await User.insertMany([
            {
                name: 'Muhammad Sani',
                email: 'muhammad.sani@student.hukp.edu.ng',
                passwordHash,
                role: 'STUDENT',
                departmentId: cscDept._id,
                matricNumber: 'CSC/2023/001',
            },
            {
                name: 'Aisha Bello',
                email: 'aisha.bello@student.hukp.edu.ng',
                passwordHash,
                role: 'STUDENT',
                departmentId: cscDept._id,
                matricNumber: 'CSC/2023/002',
            },
            {
                name: 'Ibrahim Musa',
                email: 'ibrahim.musa@student.hukp.edu.ng',
                passwordHash,
                role: 'STUDENT',
                departmentId: cscDept._id,
                matricNumber: 'CSC/2023/003',
            },
        ])
        console.log(`✅ Created ${students.length} students`)

        // Create courses
        const courses = await Course.insertMany([
            {
                courseCode: 'CSC101',
                title: 'Introduction to Computer Science',
                departmentId: cscDept._id,
                lecturerId: lecturer1._id,
                creditUnits: 3,
                semester: 'FIRST',
                level: 100,
            },
            {
                courseCode: 'CSC102',
                title: 'Introduction to Programming',
                departmentId: cscDept._id,
                lecturerId: lecturer1._id,
                creditUnits: 4,
                semester: 'FIRST',
                level: 100,
            },
            {
                courseCode: 'CSC201',
                title: 'Data Structures and Algorithms',
                departmentId: cscDept._id,
                lecturerId: lecturer2._id,
                creditUnits: 3,
                semester: 'FIRST',
                level: 200,
            },
            {
                courseCode: 'CSC202',
                title: 'Database Management Systems',
                departmentId: cscDept._id,
                lecturerId: lecturer2._id,
                creditUnits: 3,
                semester: 'SECOND',
                level: 200,
            },
        ])
        console.log(`✅ Created ${courses.length} courses`)

        console.log('\n🎉 Seed completed successfully!')
        console.log('\n📋 Login credentials (password: password123):')
        console.log('   Admin:    admin@hukp.edu.ng')
        console.log('   Lecturer: abubakar.ibrahim@hukp.edu.ng')
        console.log('   Lecturer: fatima.yusuf@hukp.edu.ng')
        console.log('   Student:  muhammad.sani@student.hukp.edu.ng')
        console.log('   Student:  aisha.bello@student.hukp.edu.ng')
        console.log('   Student:  ibrahim.musa@student.hukp.edu.ng')

    } catch (error) {
        console.error('❌ Seed failed:', error)
        process.exit(1)
    } finally {
        await mongoose.disconnect()
        console.log('\n👋 Disconnected from MongoDB')
    }
}

seed()
