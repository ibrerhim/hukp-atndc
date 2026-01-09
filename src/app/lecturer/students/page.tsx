'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Progress,
    LoadingSpinner,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui'
import { AlertTriangle, Users, TrendingDown } from 'lucide-react'

interface Course {
    _id: string
    courseCode: string
    title: string
}

interface StudentAttendance {
    id: string
    name: string
    email: string
    matricNumber: string
    attended: number
    totalSessions: number
    percentage: number
    isLow: boolean
}

export default function LowAttendancePage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <LowAttendanceContent />
        </Suspense>
    )
}

function LowAttendanceContent() {
    const searchParams = useSearchParams()
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '')
    const [students, setStudents] = useState<StudentAttendance[]>([])
    const [lowCount, setLowCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [loadingStudents, setLoadingStudents] = useState(false)

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            fetchAttendance(selectedCourse)
        }
    }, [selectedCourse])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/lecturer/courses')
            const data = await res.json()
            setCourses(data.courses || [])
            if (data.courses?.length > 0 && !selectedCourse) {
                setSelectedCourse(data.courses[0]._id)
            }
        } catch (error) {
            console.error('Failed to fetch courses')
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendance = async (courseId: string) => {
        setLoadingStudents(true)
        try {
            const res = await fetch(`/api/lecturer/courses/${courseId}/attendance`)
            const data = await res.json()
            setStudents(data.allStudents || [])
            setLowCount(data.students?.length || 0)
        } catch (error) {
            console.error('Failed to fetch attendance')
        } finally {
            setLoadingStudents(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Student Attendance</h1>
                <p className="text-muted-foreground mt-1">Monitor student attendance and identify at-risk students</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold">{students.length}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={lowCount > 0 ? 'border-yellow-500' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Low Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${lowCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                            <span className="text-2xl font-bold">{lowCount}</span>
                            <span className="text-sm text-muted-foreground">students below 70%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Select Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.courseCode} - {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Student Attendance Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingStudents ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : students.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No attendance data available for this course
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Matric No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Attended</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id} className={student.isLow ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                                        <TableCell className="font-mono">{student.matricNumber}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>
                                            {student.attended} / {student.totalSessions}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={student.percentage} className="w-20 h-2" />
                                                <span className="text-sm font-medium">{student.percentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {student.isLow ? (
                                                <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    At Risk
                                                </Badge>
                                            ) : (
                                                <Badge variant="success">Good</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
