'use client'

import { useEffect, useState } from 'react'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Input,
    Label,
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
    LoadingSpinner,
    useToast,
} from '@/components/ui'
import { Plus, Edit2, Trash2, RefreshCw, Building2 } from 'lucide-react'

interface Department {
    _id: string
    name: string
    code: string
    createdAt: string
}

export default function DepartmentsPage() {
    const { toast } = useToast()
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Department | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [formData, setFormData] = useState({ name: '', code: '' })

    useEffect(() => {
        fetchDepartments()
    }, [])

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments')
            const data = await res.json()
            setDepartments(data.departments || [])
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch departments', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const url = editingDept
                ? `/api/admin/departments/${editingDept._id}`
                : '/api/admin/departments'
            const method = editingDept ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to save department')
            }

            toast({
                title: 'Success',
                description: editingDept ? 'Department updated' : 'Department created',
                variant: 'success',
            })
            setDialogOpen(false)
            resetForm()
            fetchDepartments()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (deptId: string) => {
        if (!confirm('Are you sure you want to delete this department?')) return

        try {
            const res = await fetch(`/api/admin/departments/${deptId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete department')

            toast({ title: 'Success', description: 'Department deleted', variant: 'success' })
            fetchDepartments()
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        }
    }

    const openEditDialog = (dept: Department) => {
        setEditingDept(dept)
        setFormData({ name: dept.name, code: dept.code })
        setDialogOpen(true)
    }

    const resetForm = () => {
        setEditingDept(null)
        setFormData({ name: '', code: '' })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Departments</h1>
                    <p className="text-muted-foreground mt-1">Manage academic departments</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                            <DialogDescription>
                                {editingDept ? 'Update department details' : 'Create a new department'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Computer Science"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Department Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CSC"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formLoading}>
                                    {formLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                    {editingDept ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{departments.length} Departments</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchDepartments}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : departments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No departments found</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept._id}>
                                        <TableCell className="font-mono font-bold">{dept.code}</TableCell>
                                        <TableCell>{dept.name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(dept)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(dept._id)}
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
