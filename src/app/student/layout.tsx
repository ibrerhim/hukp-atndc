'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button, Avatar, AvatarFallback } from '@/components/ui'
import {
    LayoutDashboard,
    ScanLine,
    History,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Moon,
    Sun,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const sidebarLinks = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/scan', label: 'Scan QR', icon: ScanLine },
    { href: '/student/history', label: 'My Attendance', icon: History },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen bg-background">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center justify-between px-4 border-b">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">Student</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                                <AvatarFallback className="bg-purple-600 text-white">
                                    {session?.user?.name?.charAt(0) || 'S'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => signOut({ callbackUrl: '/login' })}
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="ml-auto flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            Welcome, {session?.user?.name?.split(' ')[0]}
                        </span>
                    </div>
                </header>

                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    )
}
