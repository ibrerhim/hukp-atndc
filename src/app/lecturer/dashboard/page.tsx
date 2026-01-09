'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingCard, Badge } from '@/components/ui'
import { BookOpen, Users, QrCode, ClipboardCheck } from 'lucide-react'

interface Course {
    _id: string
    courseCode: string
    title: string
    level: number
}

interface Stats {
    totalCourses: number
    totalStudents: number
    activeSessions: number
    todayAttendance: number
}

export default function LecturerDashboard() {
    const [courses, setCourses] = useState<Course[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [coursesRes, statsRes] = await Promise.all([
                fetch('/api/lecturer/courses'),
                fetch('/api/lecturer/stats'),
            ])
            const coursesData = await coursesRes.json()
            const statsData = await statsRes.json()
            setCourses(coursesData.courses || [])
            setStats(statsData)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <LoadingCard />
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const statCards = [
        {
            title: 'My Courses',
            value: stats?.totalCourses || 0,
            icon: BookOpen,
            color: 'from-green-500 to-emerald-600',
        },
        {
            title: 'Total Students',
            value: stats?.totalStudents || 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Active Sessions',
            value: stats?.activeSessions || 0,
            icon: QrCode,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Today\'s Attendance',
            value: stats?.todayAttendance || 0,
            icon: ClipboardCheck,
            color: 'from-orange-500 to-orange-600',
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your courses and attendance</p>
                </div>
                <Link href="/lecturer/attendance">
                    <Button className="bg-green-600 hover:bg-green-700">
                        <QrCode className="h-4 w-4 mr-2" />
                        Start Session
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold">{stat.value}</span>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {courses.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No courses assigned yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Card key={course._id} className="border bg-muted/50">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-mono font-bold text-lg">{course.courseCode}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
                                            </div>
                                            <Badge variant="outline">{course.level}L</Badge>
                                        </div>
                                        <div className="mt-4">
                                            <Link href={`/lecturer/attendance?course=${course._id}`}>
                                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                    Take Attendance
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
