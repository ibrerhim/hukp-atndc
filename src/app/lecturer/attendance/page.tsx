'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import QRCode from 'qrcode'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Badge,
    LoadingSpinner,
    useToast,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui'
import { QrCode, Play, Square, Users, Clock, RefreshCw, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface Course {
    _id: string
    courseCode: string
    title: string
}

interface Session {
    _id: string
    courseId: { _id: string; courseCode: string; title: string }
    isActive: boolean
    qrToken: string
    expiresAt: string
    attendanceCount: number
    createdAt: string
}

interface StudentRecord {
    id: string
    name: string
    email: string
    matricNumber: string
    markedAt: string
}

function AttendancePageContent() {
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState(searchParams.get('course') || '')
    const [activeSession, setActiveSession] = useState<Session | null>(null)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [sessionLoading, setSessionLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [students, setStudents] = useState<StudentRecord[]>([])

    useEffect(() => {
        fetchCourses()
        fetchActiveSession()
    }, [])

    useEffect(() => {
        if (activeSession && activeSession.isActive) {
            generateQRCode(activeSession.qrToken)
            fetchStudents(activeSession._id)

            const updateTime = () => {
                const expiry = new Date(activeSession.expiresAt).getTime()
                const now = Date.now()
                const diff = Math.max(0, Math.floor((expiry - now) / 1000))
                setTimeLeft(diff)

                if (diff === 0) {
                    fetchActiveSession()
                }
            }

            updateTime()
            const interval = setInterval(updateTime, 1000)

            // Auto-refresh students every 5 seconds
            const studentInterval = setInterval(() => {
                fetchStudents(activeSession._id)
            }, 5000)

            return () => {
                clearInterval(interval)
                clearInterval(studentInterval)
            }
        } else {
            setStudents([])
        }
    }, [activeSession])

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

    const fetchActiveSession = async () => {
        try {
            const res = await fetch('/api/lecturer/sessions/active')
            const data = await res.json()
            if (data.session) {
                setActiveSession(data.session)
                setSelectedCourse(data.session.courseId._id)
            } else {
                setActiveSession(null)
                setQrCodeUrl('')
            }
        } catch (error) {
            console.error('Failed to fetch active session')
        }
    }

    const fetchStudents = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/lecturer/sessions/${sessionId}/students`)
            const data = await res.json()
            setStudents(data.students || [])
        } catch (error) {
            console.error('Failed to fetch students')
        }
    }

    const generateQRCode = async (token: string) => {
        try {
            const url = `${window.location.origin}/student/scan?token=${token}`
            const qrUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            })
            setQrCodeUrl(qrUrl)
        } catch (error) {
            console.error('Failed to generate QR code')
        }
    }

    const startSession = async () => {
        if (!selectedCourse) {
            toast({ title: 'Error', description: 'Please select a course', variant: 'destructive' })
            return
        }

        setSessionLoading(true)
        try {
            const res = await fetch('/api/lecturer/sessions/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: selectedCourse }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            toast({ title: 'Success', description: 'Attendance session started', variant: 'success' })
            fetchActiveSession()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setSessionLoading(false)
        }
    }

    const closeSession = async () => {
        if (!activeSession) return

        setSessionLoading(true)
        try {
            const res = await fetch('/api/lecturer/sessions/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: activeSession._id }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            toast({ title: 'Success', description: 'Session closed', variant: 'success' })
            setActiveSession(null)
            setQrCodeUrl('')
            setStudents([])
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setSessionLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
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
                <h1 className="text-3xl font-bold">Attendance Session</h1>
                <p className="text-muted-foreground mt-1">Generate QR code for student attendance</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Session Control */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session Control</CardTitle>
                        <CardDescription>
                            {activeSession ? 'Session is currently active' : 'Start a new attendance session'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Course</label>
                            <Select
                                value={selectedCourse}
                                onValueChange={setSelectedCourse}
                                disabled={!!activeSession}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course._id} value={course._id}>
                                            {course.courseCode} - {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {activeSession ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                                        <span className="font-medium text-green-700 dark:text-green-400">
                                            Session Active
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-mono">{formatTime(timeLeft)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <span>Students Marked</span>
                                    </div>
                                    <Badge variant="secondary" className="text-lg px-3">
                                        {students.length}
                                    </Badge>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            fetchActiveSession()
                                            if (activeSession) fetchStudents(activeSession._id)
                                        }}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Refresh
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={closeSession}
                                        disabled={sessionLoading}
                                    >
                                        {sessionLoading ? (
                                            <LoadingSpinner size="sm" className="mr-2" />
                                        ) : (
                                            <Square className="h-4 w-4 mr-2" />
                                        )}
                                        End Session
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="lg"
                                onClick={startSession}
                                disabled={sessionLoading || !selectedCourse}
                            >
                                {sessionLoading ? (
                                    <LoadingSpinner size="sm" className="mr-2" />
                                ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                )}
                                Start Attendance Session
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* QR Code Display */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            QR Code
                        </CardTitle>
                        <CardDescription>
                            Students scan this code to mark attendance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activeSession && qrCodeUrl ? (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 bg-white rounded-xl shadow-lg">
                                    <img src={qrCodeUrl} alt="Attendance QR Code" className="w-64 h-64" />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Show this QR code to students
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <QrCode className="h-16 w-16 mb-4 opacity-20" />
                                <p>Start a session to generate QR code</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Real-time Student List */}
            {activeSession && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Students Present ({students.length})
                        </CardTitle>
                        <CardDescription>
                            Real-time list of students who have marked attendance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {students.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No students have marked attendance yet
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Matric No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Time Marked</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student, index) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-mono">{student.matricNumber}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{formatDateTime(student.markedAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default function AttendancePage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <AttendancePageContent />
        </Suspense>
    )
}
