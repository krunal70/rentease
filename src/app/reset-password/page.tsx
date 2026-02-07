"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Loader2, Eye, EyeOff, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check if we have a valid session from the reset link
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            // If no session, user might have accessed this page directly
            if (!session) {
                // Check if there's an error in the URL hash (from Supabase redirect)
                const hash = window.location.hash;
                if (!hash.includes("access_token")) {
                    toast.error("Invalid or expired reset link", {
                        description: "Please request a new password reset.",
                    });
                    router.push("/forgot-password");
                }
            }
        };

        checkSession();
    }, [router]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: formData.password,
            });

            if (error) {
                throw error;
            }

            setIsSuccess(true);
            toast.success("Password updated!", {
                description: "You can now log in with your new password.",
            });
        } catch (error) {
            console.error("Password update error:", error);
            toast.error("Failed to update password", {
                description: error instanceof Error ? error.message : "Please try again.",
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
                            <CardTitle className="text-2xl font-bold">Password Updated!</CardTitle>
                            <CardDescription>
                                Your password has been successfully reset.
                            </CardDescription>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <Lock className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
                            <CardDescription>
                                Enter your new password below.
                            </CardDescription>
                        </>
                    )}
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                You can now log in with your new password.
                            </p>
                            <Link href="/login" className="block">
                                <Button className="w-full">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your new password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                        disabled={isLoading}
                                        className={errors.password ? "border-red-500" : ""}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your new password"
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, confirmPassword: e.target.value })
                                    }
                                    required
                                    disabled={isLoading}
                                    className={errors.confirmPassword ? "border-red-500" : ""}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
