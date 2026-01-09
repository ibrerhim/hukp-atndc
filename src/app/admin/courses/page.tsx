'use client'

import { useEffect, useState } from 'react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Input,
    Label,
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Badge,
    LoadingSpinner,
    useToast,
} from '@/components/ui'
import { Plus, Search, Edit2, Trash2, RefreshCw, BookOpen } from 'lucide-react'

interface Course {
    _id: string
    courseCode: string
    title: string
    departmentId: { _id: string; name: string }
    lecturerId: { _id: string; name: string }
    creditUnits: number
    semester: 'FIRST' | 'SECOND'
    level: number
}

interface Department {
    _id: string
    name: string
}

interface Lecturer {
    _id: string
    name: string
}

export default function CoursesPage() {
    const { toast } = useToast()
    const [courses, setCourses] = useState<Course[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [lecturers, setLecturers] = useState<Lecturer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [formLoading, setFormLoading] = useState(false)

    const [formData, setFormData] = useState({
        courseCode: '',
        title: '',
        departmentId: '',
        lecturerId: '',
        creditUnits: 3,
        semester: 'FIRST' as 'FIRST' | 'SECOND',
        level: 100,
    })

    useEffect(() => {
        fetchCourses()
        fetchDepartments()
        fetchLecturers()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses')
            const data = await res.json()
            setCourses(data.courses || [])
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch courses', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments')
            const data = await res.json()
            setDepartments(data.departments || [])
        } catch (error) {
            console.error('Failed to fetch departments')
        }
    }

    const fetchLecturers = async () => {
        try {
            const res = await fetch('/api/admin/users?role=LECTURER')
            const data = await res.json()
            setLecturers(data.users || [])
        } catch (error) {
            console.error('Failed to fetch lecturers')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const url = editingCourse ? `/api/admin/courses/${editingCourse._id}` : '/api/admin/courses'
            const method = editingCourse ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to save course')
            }

            toast({
                title: 'Success',
                description: editingCourse ? 'Course updated' : 'Course created',
                variant: 'success',
            })
            setDialogOpen(false)
            resetForm()
            fetchCourses()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (courseId: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return

        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete course')

            toast({ title: 'Success', description: 'Course deleted', variant: 'success' })
            fetchCourses()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const openEditDialog = (course: Course) => {
        setEditingCourse(course)
        setFormData({
            courseCode: course.courseCode,
            title: course.title,
            departmentId: course.departmentId._id,
            lecturerId: course.lecturerId._id,
            creditUnits: course.creditUnits,
            semester: course.semester,
            level: course.level,
        })
        setDialogOpen(true)
    }

    const resetForm = () => {
        setEditingCourse(null)
        setFormData({
            courseCode: '',
            title: '',
            departmentId: '',
            lecturerId: '',
            creditUnits: 3,
            semester: 'FIRST',
            level: 100,
        })
    }

    const filteredCourses = courses.filter(
        (course) =>
            course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Courses</h1>
                    <p className="text-muted-foreground mt-1">Manage courses and lecturer assignments</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
                            <DialogDescription>
                                {editingCourse ? 'Update course details' : 'Create a new course'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="courseCode">Course Code</Label>
                                    <Input
                                        id="courseCode"
                                        value={formData.courseCode}
                                        onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                                        placeholder="e.g., CSC101"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="creditUnits">Credit Units</Label>
                                    <Select
                                        value={formData.creditUnits.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, creditUnits: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6].map((unit) => (
                                                <SelectItem key={unit} value={unit.toString()}>
                                                    {unit} Unit{unit > 1 ? 's' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Introduction to Computer Science"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.departmentId}
                                        onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept._id} value={dept._id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lecturer">Lecturer</Label>
                                    <Select
                                        value={formData.lecturerId}
                                        onValueChange={(value) => setFormData({ ...formData, lecturerId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select lecturer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lecturers.map((lect) => (
                                                <SelectItem key={lect._id} value={lect._id}>
                                                    {lect.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="semester">Semester</Label>
                                    <Select
                                        value={formData.semester}
                                        onValueChange={(value: any) => setFormData({ ...formData, semester: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIRST">First Semester</SelectItem>
                                            <SelectItem value="SECOND">Second Semester</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <Select
                                        value={formData.level.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[100, 200, 300, 400, 500].map((level) => (
                                                <SelectItem key={level} value={level.toString()}>
                                                    {level} Level
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                    {editingCourse ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by code or title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchCourses}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No courses found</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Lecturer</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCourses.map((course) => (
                                    <TableRow key={course._id}>
                                        <TableCell className="font-mono font-bold">{course.courseCode}</TableCell>
                                        <TableCell>{course.title}</TableCell>
                                        <TableCell>{course.lecturerId?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{course.level}L</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{course.semester}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(course)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(course._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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
