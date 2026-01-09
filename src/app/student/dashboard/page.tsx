'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingCard, Progress, Badge } from '@/components/ui'
import { ScanLine, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { calculateAttendancePercentage, getAttendanceStatus } from '@/lib/utils'

interface CourseAttendance {
    courseId: string
    courseCode: string
    courseTitle: string
    attended: number
    total: number
    percentage: number
}

interface Stats {
    totalAttendance: number
    coursesEnrolled: number
    averagePercentage: number
    courseAttendance: CourseAttendance[]
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/student/stats')
            const data = await res.json()
            setStats(data)
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <LoadingCard />
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const attendanceStatus = getAttendanceStatus(stats?.averagePercentage || 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Your attendance overview</p>
                </div>
                <Link href="/student/scan">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <ScanLine className="h-4 w-4 mr-2" />
                        Scan QR Code
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">{stats?.totalAttendance || 0}</span>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">{stats?.coursesEnrolled || 0}</span>
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">{stats?.averagePercentage || 0}%</span>
                                <Badge
                                    variant={
                                        attendanceStatus.status === 'excellent' || attendanceStatus.status === 'good'
                                            ? 'success'
                                            : attendanceStatus.status === 'warning'
                                                ? 'warning'
                                                : 'destructive'
                                    }
                                >
                                    {attendanceStatus.label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Warning Banner */}
            {(stats?.averagePercentage || 0) < 70 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="flex items-center gap-4 py-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        <div>
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                                Low Attendance Warning
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                Your attendance is below 70%. Please attend more classes to avoid academic issues.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Course Attendance */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance by Course</CardTitle>
                </CardHeader>
                <CardContent>
                    {!stats?.courseAttendance?.length ? (
                        <p className="text-muted-foreground text-sm">No attendance records yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.courseAttendance.map((course) => {
                                const status = getAttendanceStatus(course.percentage)
                                return (
                                    <div key={course.courseId} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-mono font-bold">{course.courseCode}</span>
                                                <span className="text-muted-foreground ml-2 text-sm">
                                                    {course.courseTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                    {course.attended}/{course.total}
                                                </span>
                                                <Badge
                                                    variant={
                                                        status.status === 'excellent' || status.status === 'good'
                                                            ? 'success'
                                                            : status.status === 'warning'
                                                                ? 'warning'
                                                                : 'destructive'
                                                    }
                                                >
                                                    {course.percentage}%
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={course.percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
