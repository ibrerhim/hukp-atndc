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
import { History, CheckCircle, XCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface SessionHistory {
    _id: string
    courseId: { courseCode: string; title: string }
    isActive: boolean
    attendanceCount: number
    createdAt: string
    expiresAt: string
}

export default function HistoryPage() {
    const [sessions, setSessions] = useState<SessionHistory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/lecturer/sessions/history')
            const data = await res.json()
            setSessions(data.sessions || [])
        } catch (error) {
            console.error('Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Attendance History</h1>
                <p className="text-muted-foreground mt-1">Past attendance sessions</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Session History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No attendance sessions yet
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Attendance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-mono font-bold">{session.courseId?.courseCode}</p>
                                                <p className="text-sm text-muted-foreground">{session.courseId?.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDateTime(session.createdAt)}</TableCell>
                                        <TableCell>
                                            {session.isActive ? (
                                                <Badge variant="success" className="flex items-center gap-1 w-fit">
                                                    <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Closed</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold">{session.attendanceCount}</span>
                                            <span className="text-muted-foreground"> students</span>
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
