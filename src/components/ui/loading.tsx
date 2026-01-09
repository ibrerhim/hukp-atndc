'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    }

    return (
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
    )
}

export function LoadingPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}

export function LoadingCard() {
    return (
        <div className="flex h-32 w-full items-center justify-center">
            <LoadingSpinner />
        </div>
    )
}
