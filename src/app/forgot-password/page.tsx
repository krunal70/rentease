"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw error;
            }

            setIsSuccess(true);
            toast.success("Check your email", {
                description: "We've sent you a password reset link.",
            });
        } catch (error) {
            console.error("Password reset error:", error);
            toast.error("Failed to send reset email", {
                description: error instanceof Error ? error.message : "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                    <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    RentEase
                </span>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    {isSuccess ? (
                        <>
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                            <CardDescription className="text-center">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Please check your inbox and follow the instructions.
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Mail className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
                            <CardDescription>
                                No worries! Enter your email and we'll send you a reset link.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setEmail("");
                                    }}
                                >
                                    Try a different email
                                </Button>
                                <Link href="/login" className="w-full">
                                    <Button className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    )}

                    {!isSuccess && (
                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
