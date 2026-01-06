"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    mockProperties,
    mockApplications,
    mockConversations,
    getApplicationsByApplicantId,
} from "@/data/mock";
import {
    Building,
    MessageSquare,
    FileText,
    Home,
    DollarSign,
    Users,
    TrendingUp,
    Clock,
    ArrowRight,
    Plus,
    Star,
    MapPin,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-32" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    // Get user-specific data
    const userApplications =
        user.role === "tenant" ? getApplicationsByApplicantId(user.id) : mockApplications;
    const userProperties =
        user.role === "landlord" || user.role === "property_manager"
            ? mockProperties.filter((p) => p.ownerId === user.id || user.role === "property_manager")
            : [];
    const unreadMessages = mockConversations.filter(
        (c) => c.lastMessage && !c.lastMessage.read && c.participants.includes(user.id)
    ).length;

    // Stats based on role
    const tenantStats = [
        {
            title: "Active Applications",
            value: userApplications.length,
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Saved Properties",
            value: 5,
            icon: Home,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Unread Messages",
            value: unreadMessages,
            icon: MessageSquare,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Property Views",
            value: 24,
            icon: TrendingUp,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    const landlordStats = [
        {
            title: "Listed Properties",
            value: userProperties.length,
            icon: Building,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Total Revenue",
            value: `$${(userProperties.reduce((sum, p) => sum + p.price, 0)).toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Applications",
            value: mockApplications.length,
            icon: FileText,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Active Tenants",
            value: 3,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
        },
    ];

    const stats = user.role === "tenant" ? tenantStats : landlordStats;

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">
                            Welcome back, {user.name.split(" ")[0]}!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {user.role === "tenant"
                                ? "Here's your rental journey overview"
                                : "Here's your property management overview"}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card key={stat.title}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {stat.title}
                                                </p>
                                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                            </div>
                                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                                <Icon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {user.role === "tenant" ? (
                                            <>
                                                <Link href="/properties">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <Home className="mr-2 h-4 w-4" />
                                                        Browse Properties
                                                    </Button>
                                                </Link>
                                                <Link href="/applications">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Applications
                                                    </Button>
                                                </Link>
                                                <Link href="/messages">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Messages
                                                        {unreadMessages > 0 && (
                                                            <Badge className="ml-auto" variant="destructive">
                                                                {unreadMessages}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </Link>
                                                <Link href="/profile">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Edit Profile
                                                    </Button>
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/properties/new">
                                                    <Button className="w-full justify-start">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Property
                                                    </Button>
                                                </Link>
                                                <Link href="/properties">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <Building className="mr-2 h-4 w-4" />
                                                        Manage Properties
                                                    </Button>
                                                </Link>
                                                <Link href="/applications">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Review Applications
                                                    </Button>
                                                </Link>
                                                <Link href="/messages">
                                                    <Button variant="outline" className="w-full justify-start">
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Messages
                                                    </Button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Properties */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">
                                        {user.role === "tenant" ? "Recommended Properties" : "Your Properties"}
                                    </CardTitle>
                                    <Link href="/properties">
                                        <Button variant="ghost" size="sm">
                                            View all
                                            <ArrowRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(user.role === "tenant" ? mockProperties.slice(0, 3) : userProperties.slice(0, 3)).map(
                                            (property) => (
                                                <Link key={property.id} href={`/properties/${property.id}`}>
                                                    <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                                                        <img
                                                            src={property.images[0]}
                                                            alt={property.title}
                                                            className="w-20 h-20 rounded-lg object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between">
                                                                <h4 className="font-medium truncate">{property.title}</h4>
                                                                <Badge variant="secondary" className="ml-2 shrink-0">
                                                                    {property.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                                <MapPin className="mr-1 h-3 w-3" />
                                                                {property.address.city}, {property.address.state}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="font-semibold text-primary">
                                                                    ${property.price.toLocaleString()}/mo
                                                                </span>
                                                                <div className="flex items-center text-amber-500 text-sm">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                    <span className="ml-1">4.8</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-full bg-blue-100">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Application Submitted</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Modern Downtown Apartment
                                                </p>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />2 days ago
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-full bg-green-100">
                                                <MessageSquare className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">New Message</p>
                                                <p className="text-xs text-muted-foreground">
                                                    From Sarah Johnson
                                                </p>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />1 hour ago
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-full bg-purple-100">
                                                <Home className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Property Viewed</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Cozy Suburban House
                                                </p>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />3 days ago
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Upcoming */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Upcoming</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">SAT</p>
                                                <p className="text-lg font-bold">11</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Property Viewing</p>
                                                <p className="text-xs text-muted-foreground">
                                                    2:00 PM - Modern Downtown Apt
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">TUE</p>
                                                <p className="text-lg font-bold">14</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Lease Signing</p>
                                                <p className="text-xs text-muted-foreground">
                                                    10:00 AM - Video Call
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
