import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateQRToken(): string {
    return `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export function formatTime(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} at ${formatTime(date)}`
}

export function calculateAttendancePercentage(attended: number, total: number): number {
    if (total === 0) return 0
    return Math.round((attended / total) * 100)
}

export function getAttendanceStatus(percentage: number): {
    status: 'excellent' | 'good' | 'warning' | 'danger'
    label: string
} {
    if (percentage >= 80) return { status: 'excellent', label: 'Excellent' }
    if (percentage >= 70) return { status: 'good', label: 'Good' }
    if (percentage >= 60) return { status: 'warning', label: 'At Risk' }
    return { status: 'danger', label: 'Critical' }
}
