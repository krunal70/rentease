"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    User,
    Briefcase,
    Home,
    FileText,
    Calendar,
    Phone,
    Mail,
    DollarSign,
    MapPin,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
    pending: {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
    },
    under_review: {
        label: "Under Review",
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
    },
    approved: {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
    },
    rejected: {
        label: "Rejected",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
    },
};

interface Application {
    id: string;
    propertyId: string;
    applicantId: string;
    status: keyof typeof statusConfig;
    personalInfo: {
        fullName: string;
        dateOfBirth: string;
        phoneNumber: string;
    };
    employment: {
        employer: string;
        position: string;
        income: number;
        duration: string;
    };
    rentalHistory: {
        currentAddress: string;
        landlordName?: string;
        landlordPhone?: string;
        monthlyRent: number;
        duration: string;
    };
    documents: string[];
    submittedAt: string;
    property?: {
        id: string;
        title: string;
        city: string;
        state: string;
        image?: string;
        price: number;
    };
    applicant?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        async function fetchApplication() {
            try {
                const response = await fetch(`/api/applications/${params.id}`);
                if (!response.ok) {
                    throw new Error("Application not found");
                }
                const data = await response.json();
                setApplication(data.application);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load application");
            } finally {
                setIsLoading(false);
            }
        }

        if (params.id && isAuthenticated) {
            fetchApplication();
        }
    }, [params.id, isAuthenticated]);

    const handleUpdateStatus = async (newStatus: "under_review" | "approved" | "rejected") => {
        if (!application) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/applications/${application.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update application status");
            }

            const data = await response.json();
            setApplication(prev => prev ? { ...prev, status: newStatus } : null);

            toast.success(`Application ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "marked as under review"}`, {
                description: `The applicant has been notified.`,
            });

            setShowApproveDialog(false);
            setShowRejectDialog(false);
        } catch (err) {
            toast.error("Failed to update status", {
                description: err instanceof Error ? err.message : "Please try again.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-[200px] w-full" />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-16 text-center">
                    <h1 className="text-2xl font-bold">Application not found</h1>
                    <p className="text-muted-foreground mt-2">{error}</p>
                    <Link href="/applications">
                        <Button className="mt-4">Back to Applications</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const status = statusConfig[application.status];
    const StatusIcon = status.icon;
    const isOwner = user?.role === "landlord" || user?.role === "property_manager";
    const canUpdateStatus = isOwner && application.status !== "approved";

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/applications"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Applications
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Application Details</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={status.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Submitted {new Date(application.submittedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Status Actions for Property Owners */}
                            {canUpdateStatus && (
                                <div className="flex gap-2">
                                    {application.status === "pending" && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleUpdateStatus("under_review")}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Start Review
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => setShowRejectDialog(true)}
                                        disabled={isUpdating}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => setShowApproveDialog(true)}
                                        disabled={isUpdating}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                            <p className="font-medium">{application.personalInfo.fullName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date of Birth</p>
                                            <p className="font-medium">
                                                {new Date(application.personalInfo.dateOfBirth).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone Number</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                {application.personalInfo.phoneNumber}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Employment Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Employment Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Employer</p>
                                            <p className="font-medium">{application.employment.employer}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Position</p>
                                            <p className="font-medium">{application.employment.position}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Annual Income</p>
                                            <p className="font-medium flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                {application.employment.income.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Duration</p>
                                            <p className="font-medium">{application.employment.duration}</p>
                                        </div>
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
                                    <CardContent className="grid gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Address</p>
                                            <p className="font-medium flex items-start gap-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                {application.rentalHistory.currentAddress}
                                            </p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {application.rentalHistory.landlordName && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Previous Landlord</p>
                                                    <p className="font-medium">{application.rentalHistory.landlordName}</p>
                                                </div>
                                            )}
                                            {application.rentalHistory.landlordPhone && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Landlord Phone</p>
                                                    <p className="font-medium">{application.rentalHistory.landlordPhone}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm text-muted-foreground">Previous Rent</p>
                                                <p className="font-medium">
                                                    ${application.rentalHistory.monthlyRent.toLocaleString()}/mo
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Duration</p>
                                                <p className="font-medium">{application.rentalHistory.duration}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Property Card */}
                                {application.property && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Property</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Link href={`/properties/${application.property.id}`}>
                                                <div className="hover:opacity-80 transition-opacity">
                                                    {application.property.image && (
                                                        <img
                                                            src={application.property.image}
                                                            alt={application.property.title}
                                                            className="w-full h-32 object-cover rounded-lg mb-3"
                                                        />
                                                    )}
                                                    <h4 className="font-semibold">{application.property.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {application.property.city}, {application.property.state}
                                                    </p>
                                                    <p className="text-lg font-bold text-primary mt-2">
                                                        ${application.property.price.toLocaleString()}/mo
                                                    </p>
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Applicant Card (for landlords) */}
                                {isOwner && application.applicant && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Applicant</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={application.applicant.avatar} />
                                                    <AvatarFallback>
                                                        {application.applicant.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{application.applicant.name}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {application.applicant.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Income Ratio */}
                                {application.property && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Income Analysis</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {(() => {
                                                const monthlyIncome = application.employment.income / 12;
                                                const ratio = monthlyIncome / application.property.price;
                                                const isGood = ratio >= 3;

                                                return (
                                                    <div>
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-sm text-muted-foreground">
                                                                Income to Rent Ratio
                                                            </span>
                                                            <span className={`font-bold ${isGood ? "text-green-600" : "text-yellow-600"}`}>
                                                                {ratio.toFixed(1)}x
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${isGood ? "bg-green-500" : "bg-yellow-500"}`}
                                                                style={{ width: `${Math.min(ratio / 5 * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {isGood
                                                                ? "✓ Meets recommended 3x income requirement"
                                                                : "⚠ Below recommended 3x income requirement"}
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this application? The applicant will be notified
                            and the property status may be updated.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus("approved")}
                            disabled={isUpdating}
                        >
                            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Approve Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this application? The applicant will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isUpdating}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleUpdateStatus("rejected")}
                            disabled={isUpdating}
                        >
                            {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Reject Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
