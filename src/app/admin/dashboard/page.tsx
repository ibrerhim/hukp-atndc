'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, LoadingCard } from '@/components/ui'
import { Users, BookOpen, Building2, ClipboardCheck, TrendingUp, UserCheck } from 'lucide-react'

interface DashboardStats {
    totalStudents: number
    totalLecturers: number
    totalCourses: number
    totalDepartments: number
    totalAttendanceToday: number
    averageAttendanceRate: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats')
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
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
            title: 'Total Students',
            value: stats?.totalStudents || 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Total Lecturers',
            value: stats?.totalLecturers || 0,
            icon: UserCheck,
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Total Courses',
            value: stats?.totalCourses || 0,
            icon: BookOpen,
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'Departments',
            value: stats?.totalDepartments || 0,
            icon: Building2,
            color: 'from-orange-500 to-orange-600',
        },
        {
            title: 'Attendance Today',
            value: stats?.totalAttendanceToday || 0,
            icon: ClipboardCheck,
            color: 'from-pink-500 to-pink-600',
        },
        {
            title: 'Avg Attendance Rate',
            value: `${stats?.averageAttendanceRate || 0}%`,
            icon: TrendingUp,
            color: 'from-cyan-500 to-cyan-600',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of the attendance system</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-bold">{stat.value}</span>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Recent Activity Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            No recent registrations to display.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            No active attendance sessions at the moment.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
