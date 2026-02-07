"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useApplications } from "@/hooks";
import { Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    MapPin,
    Calendar,
    Building,
} from "lucide-react";

const statusConfig = {
    pending: {
        label: "Pending",
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

export default function ApplicationsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const { applications, isLoading: appsLoading, error } = useApplications();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading || appsLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const pendingApps = applications.filter(
        (a) => a.status === "pending" || a.status === "under_review"
    );
    const approvedApps = applications.filter((a) => a.status === "approved");
    const rejectedApps = applications.filter((a) => a.status === "rejected");

    const ApplicationCard = ({ application }: { application: Application }) => {
        const property = application.property || {};
        const status = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.pending;
        const StatusIcon = status.icon;

        return (
            <Link href={`/applications/${application.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            {property.image && (
                                <img
                                    src={property.image}
                                    alt={property.title || "Property"}
                                    className="w-24 h-24 rounded-lg object-cover shrink-0"
                                />
                            )}
                            {/* Fallback if no image */}
                            {!property.image && (
                                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <Building className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold truncate">
                                            {property.title || "Unknown Property"}
                                        </h3>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {property.city}, {property.state}
                                        </div>
                                    </div>
                                    <Badge className={status.color}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(application.submittedAt).toLocaleDateString()}
                                    </span>
                                    {property.price && (
                                        <span className="flex items-center font-medium text-primary">
                                            ${property.price.toLocaleString()}/mo
                                        </span>
                                    )}
                                </div>

                                {user.role !== "tenant" && application.applicant && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Applicant: </span>
                                            <span className="font-medium">
                                                {application.applicant.name}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{message}</p>
            {user.role === "tenant" && (
                <Link href="/properties">
                    <Button className="mt-4">Browse Properties</Button>
                </Link>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Applications</h1>
                            <p className="text-muted-foreground mt-1">
                                {user.role === "tenant"
                                    ? "Track your rental applications"
                                    : "Review and manage applications"}
                            </p>
                        </div>
                        {user.role === "tenant" && (
                            <Link href="/properties">
                                <Button>
                                    <Building className="h-4 w-4 mr-2" />
                                    Find Properties
                                </Button>
                            </Link>
                        )}
                    </div>

                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">
                                All ({applications.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending">
                                Pending ({pendingApps.length})
                            </TabsTrigger>
                            <TabsTrigger value="approved">
                                Approved ({approvedApps.length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected">
                                Rejected ({rejectedApps.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {applications.length === 0 ? (
                                <EmptyState
                                    message={
                                        user.role === "tenant"
                                            ? "You haven't submitted any applications yet"
                                            : "No applications received yet"
                                    }
                                />
                            ) : (
                                applications.map((app) => (
                                    <ApplicationCard key={app.id} application={app} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="pending" className="space-y-4">
                            {pendingApps.length === 0 ? (
                                <EmptyState message="No pending applications" />
                            ) : (
                                pendingApps.map((app) => (
                                    <ApplicationCard key={app.id} application={app} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="approved" className="space-y-4">
                            {approvedApps.length === 0 ? (
                                <EmptyState message="No approved applications yet" />
                            ) : (
                                approvedApps.map((app) => (
                                    <ApplicationCard key={app.id} application={app} />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="rejected" className="space-y-4">
                            {rejectedApps.length === 0 ? (
                                <EmptyState message="No rejected applications" />
                            ) : (
                                rejectedApps.map((app) => (
                                    <ApplicationCard key={app.id} application={app} />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
