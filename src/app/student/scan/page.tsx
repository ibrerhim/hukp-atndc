'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    LoadingSpinner,
    useToast,
} from '@/components/ui'
import { ScanLine, CheckCircle, Camera, RefreshCw } from 'lucide-react'

function ScanPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    const [scanning, setScanning] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    // Check if we have a token from URL (direct link from QR)
    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            markAttendance(token)
        }
    }, [searchParams])

    const startScanner = () => {
        setScanning(true)
        setError('')
        setSuccess(false)

        // Initialize scanner after a tick to ensure DOM is ready
        setTimeout(() => {
            scannerRef.current = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                },
                false
            )

            scannerRef.current.render(
                (decodedText) => {
                    // Extract token from URL or use directly
                    let token = decodedText
                    try {
                        const url = new URL(decodedText)
                        token = url.searchParams.get('token') || decodedText
                    } catch {
                        // Not a URL, use as-is
                    }

                    stopScanner()
                    markAttendance(token)
                },
                (errorMessage) => {
                    // Ignore scan errors
                }
            )
        }, 100)
    }

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear()
            scannerRef.current = null
        }
        setScanning(false)
    }

    const markAttendance = async (token: string) => {
        setProcessing(true)
        setError('')

        try {
            const res = await fetch('/api/student/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrToken: token }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to mark attendance')
            }

            setSuccess(true)
            toast({
                title: 'Success',
                description: 'Attendance marked successfully!',
                variant: 'success',
            })

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/student/dashboard')
            }, 2000)
        } catch (err: any) {
            setError(err.message)
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            })
        } finally {
            setProcessing(false)
        }
    }

    const reset = () => {
        setSuccess(false)
        setError('')
        setProcessing(false)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Scan QR Code</h1>
                <p className="text-muted-foreground mt-1">Scan the attendance QR code to mark your presence</p>
            </div>

            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScanLine className="h-5 w-5" />
                        QR Scanner
                    </CardTitle>
                    <CardDescription>
                        Point your camera at the QR code displayed by your lecturer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                                Attendance Marked!
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                Your attendance has been recorded successfully.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Redirecting to dashboard...
                            </p>
                        </div>
                    ) : processing ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <LoadingSpinner size="lg" />
                            <p className="text-muted-foreground mt-4">Marking attendance...</p>
                        </div>
                    ) : scanning ? (
                        <div className="space-y-4">
                            <div id="qr-reader" className="w-full" />
                            <Button variant="outline" className="w-full" onClick={stopScanner}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            {error && (
                                <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                                    <p className="text-red-600 dark:text-red-400">{error}</p>
                                    <Button variant="link" onClick={reset} className="mt-2">
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                                <Camera className="h-12 w-12 text-purple-600" />
                            </div>

                            <Button
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={startScanner}
                            >
                                <ScanLine className="h-4 w-4 mr-2" />
                                Start Camera
                            </Button>

                            <p className="text-sm text-muted-foreground text-center max-w-xs">
                                Allow camera access when prompted to scan QR codes
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function ScanPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <ScanPageContent />
        </Suspense>
    )
}
