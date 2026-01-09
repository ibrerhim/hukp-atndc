'use client'

import { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    LoadingSpinner,
    Progress,
    Badge,
} from '@/components/ui'
import { BarChart3, TrendingUp, Users, BookOpen, Building2 } from 'lucide-react'

interface DepartmentStats {
    id: string
    name: string
    studentCount: number
    courseCount: number
    avgAttendance: number
}

interface AnalyticsData {
    departments: DepartmentStats[]
    recentActivity: {
        date: string
        sessions: number
        attendance: number
    }[]
    topCourses: {
        courseCode: string
        title: string
        avgAttendance: number
    }[]
    lowAttendanceStudents: number
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/admin/analytics')
            const analytics = await res.json()
            setData(analytics)
        } catch (error) {
            console.error('Failed to fetch analytics')
        } finally {
            setLoading(false)
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
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground mt-1">Institution-wide attendance analytics and insights</p>
            </div>

            {/* Department Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Attendance by Department
                    </CardTitle>
                    <CardDescription>
                        Average attendance rates across departments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!data?.departments?.length ? (
                        <p className="text-muted-foreground text-sm py-4 text-center">
                            No department data available yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {data.departments.map((dept) => (
                                <div key={dept.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{dept.name}</span>
                                            <span className="text-muted-foreground text-sm ml-2">
                                                ({dept.studentCount} students, {dept.courseCount} courses)
                                            </span>
                                        </div>
                                        <Badge
                                            variant={dept.avgAttendance >= 70 ? 'success' : dept.avgAttendance >= 50 ? 'warning' : 'destructive'}
                                        >
                                            {dept.avgAttendance}%
                                        </Badge>
                                    </div>
                                    <Progress value={dept.avgAttendance} className="h-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Performing Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Top Performing Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!data?.topCourses?.length ? (
                            <p className="text-muted-foreground text-sm py-4 text-center">
                                No course data available
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.topCourses.map((course, index) => (
                                    <div key={course.courseCode} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-muted-foreground">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <p className="font-mono font-bold">{course.courseCode}</p>
                                                <p className="text-sm text-muted-foreground">{course.title}</p>
                                            </div>
                                        </div>
                                        <Badge variant="success">{course.avgAttendance}%</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Quick Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-800 dark:text-yellow-400 font-medium">
                                    Students at Risk
                                </span>
                                <span className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
                                    {data?.lowAttendanceStudents || 0}
                                </span>
                            </div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                Students with attendance below 70%
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">
                                Total departments: <strong>{data?.departments?.length || 0}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Recent sessions (7 days): <strong>{data?.recentActivity?.reduce((sum, d) => sum + d.sessions, 0) || 0}</strong>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
