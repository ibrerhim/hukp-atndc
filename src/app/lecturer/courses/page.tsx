'use client'

import { useEffect, useState } from 'react'
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
    LoadingSpinner,
} from '@/components/ui'
import { BookOpen } from 'lucide-react'

interface Course {
    _id: string
    courseCode: string
    title: string
    creditUnits: number
    semester: string
    level: number
    departmentId: { name: string }
}

export default function LecturerCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/lecturer/courses')
            const data = await res.json()
            setCourses(data.courses || [])
        } catch (error) {
            console.error('Failed to fetch courses')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Courses</h1>
                <p className="text-muted-foreground mt-1">Courses assigned to you</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{courses.length} Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : courses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No courses assigned yet
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Credits</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course._id}>
                                        <TableCell className="font-mono font-bold">{course.courseCode}</TableCell>
                                        <TableCell>{course.title}</TableCell>
                                        <TableCell>{course.departmentId?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{course.level}L</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{course.semester}</Badge>
                                        </TableCell>
                                        <TableCell>{course.creditUnits}</TableCell>
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
