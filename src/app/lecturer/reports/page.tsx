'use client'

import { useEffect, useState } from 'react'
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Progress,
    LoadingSpinner,
    useToast,
} from '@/components/ui'
import { FileText, Download, BarChart3, Users, AlertTriangle } from 'lucide-react'

interface Course {
    _id: string
    courseCode: string
    title: string
}

interface ReportData {
    course: {
        code: string
        title: string
        department: string
    }
    generatedAt: string
    totalSessions: number
    totalStudents: number
    averageAttendance: number
    atRiskCount: number
    students: {
        matricNumber: string
        name: string
        email: string
        attended: number
        total: number
        percentage: number
        status: string
    }[]
}

export default function ReportsPage() {
    const { toast } = useToast()
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [report, setReport] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

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

    const generateReport = async () => {
        if (!selectedCourse) {
            toast({ title: 'Error', description: 'Please select a course', variant: 'destructive' })
            return
        }

        setGenerating(true)
        try {
            const res = await fetch(`/api/lecturer/courses/${selectedCourse}/report`)
            const data = await res.json()
            setReport(data)
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to generate report', variant: 'destructive' })
        } finally {
            setGenerating(false)
        }
    }

    const downloadCSV = () => {
        if (!selectedCourse) return
        window.open(`/api/lecturer/courses/${selectedCourse}/report?format=csv`, '_blank')
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
                <h1 className="text-3xl font-bold">Attendance Reports</h1>
                <p className="text-muted-foreground mt-1">Generate and download attendance reports</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                    <CardDescription>Select a course to generate an attendance report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course._id} value={course._id}>
                                        {course.courseCode} - {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={generateReport} disabled={generating || !selectedCourse}>
                            {generating ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                            ) : (
                                <FileText className="h-4 w-4 mr-2" />
                            )}
                            Generate
                        </Button>
                        {report && (
                            <Button variant="outline" onClick={downloadCSV}>
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {report && (
                <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-blue-500" />
                                    <span className="text-2xl font-bold">{report.totalSessions}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Students
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-green-500" />
                                    <span className="text-2xl font-bold">{report.totalStudents}</span>
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
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{report.averageAttendance}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={report.atRiskCount > 0 ? 'border-yellow-500' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    At Risk Students
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`h-5 w-5 ${report.atRiskCount > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                                    <span className="text-2xl font-bold">{report.atRiskCount}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {report.course.code} - {report.course.title}
                            </CardTitle>
                            <CardDescription>
                                Department: {report.course.department} | Generated: {new Date(report.generatedAt).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Matric No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Attended</TableHead>
                                        <TableHead>Attendance</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.students.map((student) => (
                                        <TableRow
                                            key={student.matricNumber}
                                            className={student.percentage < 70 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                                        >
                                            <TableCell className="font-mono">{student.matricNumber}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.attended} / {student.total}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={student.percentage} className="w-20 h-2" />
                                                    <span className="text-sm font-medium">{student.percentage}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={student.status === 'Good' ? 'success' : 'warning'}>
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
