"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, User, Briefcase, Home, FileText } from "lucide-react";
import { toast } from "sonner";

const applicationSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().min(2, "Full name is required"),
        dateOfBirth: z.string().refine((date) => new Date(date) < new Date(), {
            message: "Date of birth must be in the past",
        }),
        phoneNumber: z.string().min(10, "Valid phone number is required"),
        ssn: z.string().optional(),
    }),
    employment: z.object({
        employer: z.string().min(2, "Employer name is required"),
        position: z.string().min(2, "Position is required"),
        income: z.coerce.number().min(0, "Income cannot be negative"),
        duration: z.string().min(1, "Duration is required"),
    }),
    rentalHistory: z.object({
        currentAddress: z.string().min(5, "Current address is required"),
        landlordName: z.string().optional(),
        landlordPhone: z.string().optional(),
        monthlyRent: z.coerce.number().min(0, "Rent cannot be negative"),
        duration: z.string().min(1, "Duration is required"),
    }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

function NewApplicationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId");
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch property details to show context
    const { property, isLoading: propertyLoading } = useProperty(propertyId || "");

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema) as any,
        defaultValues: {
            personalInfo: {
                fullName: "",
                dateOfBirth: "",
                phoneNumber: "",
            },
            employment: {
                employer: "",
                position: "",
                income: 0,
                duration: "",
            },
            rentalHistory: {
                currentAddress: "",
                landlordName: "",
                landlordPhone: "",
                monthlyRent: 0,
                duration: "",
            },
        },
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("Please log in to apply");
            router.push("/login");
        } else if (!authLoading && user && user.role !== "tenant") {
            toast.error("Only tenants can submit applications");
            router.push("/dashboard");
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fill in name/email from auth user if available
    useEffect(() => {
        if (user && !form.getValues("personalInfo.fullName")) {
            form.setValue("personalInfo.fullName", user.name);
        }
    }, [user, form]);

    if (!propertyId) {
        return (
            <div className="container py-16 text-center">
                <h1 className="text-2xl font-bold">Invalid Application Request</h1>
                <p className="text-muted-foreground mt-2">No property specified.</p>
                <Button className="mt-4" onClick={() => router.push("/properties")}>
                    Browse Properties
                </Button>
            </div>
        );
    }

    const onSubmit = async (data: ApplicationFormValues) => {
        setIsSubmitting(true);
        try {
            const apiData = {
                propertyId,
                ...data,
            };

            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit application");
            }

            toast.success("Application Submitted!", {
                description: "The landlord will review your application shortly.",
            });
            router.push("/applications");
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || (propertyId && propertyLoading)) {
        return (
            <div className="container py-16 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Submit Application</h1>
                {property && (
                    <div className="mt-2 text-muted-foreground">
                        Applying for <span className="font-semibold text-foreground">{property.title}</span>
                        <div className="text-sm mt-1">
                            ${property.price.toLocaleString()}/mo • {property.address.street}, {property.address.city}
                        </div>
                    </div>
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="personalInfo.fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personalInfo.dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personalInfo.phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="personalInfo.ssn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SSN (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="***-**-****" {...field} />
                                        </FormControl>
                                        <FormDescription>Encrypted and secure</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Employment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Employment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="employment.employer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Employer</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Company Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employment.position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employment.income"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Income ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="employment.duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Length of Employment</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 2 years" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Rental History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5" />
                                Rental History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="rentalHistory.currentAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St, City, State" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="rentalHistory.landlordName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Landlord Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentalHistory.landlordPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Landlord Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentalHistory.monthlyRent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Rent ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentalHistory.duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration of Stay</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1 year" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default function NewApplicationPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-muted/30 py-8 px-4">
                <Suspense fallback={
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                }>
                    <NewApplicationContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
