"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Building } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* Icon */}
                <div className="mx-auto mb-8 relative">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                        <Building className="w-16 h-16 text-blue-600/50 dark:text-blue-400/50" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            404
                        </span>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Oops! The page you're looking for seems to have moved out.
                    Don't worry, let's find you a new place to go.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <Button size="lg" className="gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/properties">
                        <Button variant="outline" size="lg" className="gap-2">
                            <Search className="w-4 h-4" />
                            Browse Properties
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
