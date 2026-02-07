"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Loader2, Eye, EyeOff, User, Key, Home } from "lucide-react";
import { toast } from "sonner";

const roleOptions: { value: UserRole; label: string; description: string; icon: typeof User }[] = [
    {
        value: "tenant",
        label: "Tenant",
        description: "I'm looking for a place to rent",
        icon: User,
    },
    {
        value: "landlord",
        label: "Landlord",
        description: "I own properties and want to list them",
        icon: Key,
    },
    {
        value: "property_manager",
        label: "Property Manager",
        description: "I manage properties for owners",
        icon: Home,
    },
];

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "" as UserRole | "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.role) {
            newErrors.role = "Please select a role";
        }

        if (!agreedToTerms) {
            newErrors.terms = "You must agree to the terms";
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
            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role as UserRole
            );

            if (result.success) {
                toast.success("Account created!", {
                    description: "Welcome to RentEase. Let's find your perfect home!",
                });
                router.push("/dashboard");
            } else {
                toast.error("Registration failed", {
                    description: result.error || "An account with this email may already exist.",
                });
            }
        } catch {
            toast.error("An error occurred", {
                description: "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 py-12">
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
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Join RentEase to find your perfect rental or list your property
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Smith"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                disabled={isLoading}
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                disabled={isLoading}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label>I am a...</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: UserRole) =>
                                    setFormData({ ...formData, role: value })
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center">
                                                <option.icon className="mr-2 h-4 w-4" />
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formData.role && (
                                <p className="text-xs text-muted-foreground">
                                    {roleOptions.find((r) => r.value === formData.role)?.description}
                                </p>
                            )}
                            {errors.role && (
                                <p className="text-xs text-red-500">{errors.role}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
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

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                disabled={isLoading}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="terms"
                                checked={agreedToTerms}
                                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                disabled={isLoading}
                            />
                            <label
                                htmlFor="terms"
                                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I agree to the{" "}
                                <Link href="#" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-xs text-red-500">{errors.terms}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
