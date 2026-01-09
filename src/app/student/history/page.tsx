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
import { History, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface AttendanceRecord {
    _id: string
    courseId: { courseCode: string; title: string }
    markedAt: string
}

export default function StudentHistoryPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/student/attendance')
            const data = await res.json()
            setRecords(data.records || [])
        } catch (error) {
            console.error('Failed to fetch history')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Attendance</h1>
                <p className="text-muted-foreground mt-1">Your attendance history</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : records.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No attendance records yet
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record._id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-mono font-bold">{record.courseId?.courseCode}</p>
                                                <p className="text-sm text-muted-foreground">{record.courseId?.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDateTime(record.markedAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant="success" className="flex items-center gap-1 w-fit">
                                                <CheckCircle className="h-3 w-3" />
                                                Present
                                            </Badge>
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
