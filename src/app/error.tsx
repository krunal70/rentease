"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* Icon */}
                <div className="mx-auto mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Something Went Wrong
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                {/* Error details for development */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                        <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" onClick={reset} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" size="lg" className="gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                {/* Back Link */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Go back to previous page
                </button>
            </div>
        </div>
    );
}
