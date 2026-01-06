"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    Bell,
    CreditCard,
    Loader2,
    Camera,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("Profile updated!", {
            description: "Your changes have been saved.",
        });
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const roleLabels = {
        tenant: "Tenant",
        landlord: "Landlord",
        property_manager: "Property Manager",
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

                        <Tabs defaultValue="profile" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile" className="space-y-6">
                                {/* Avatar Section */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <Avatar className="h-24 w-24">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                                        {user.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                                <Badge variant="secondary" className="mt-1">
                                                    {roleLabels[user.role]}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Member since{" "}
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your personal details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="(555) 123-4567"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
                                            />
                                        </div>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="notifications" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bell className="h-5 w-5" />
                                            Notification Preferences
                                        </CardTitle>
                                        <CardDescription>
                                            Choose how you want to be notified
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { id: "email-apps", label: "Application updates", desc: "Get notified when your application status changes" },
                                            { id: "email-msgs", label: "New messages", desc: "Receive email for new messages" },
                                            { id: "email-props", label: "Property recommendations", desc: "Suggested properties based on your preferences" },
                                            { id: "email-news", label: "Newsletter", desc: "Tips and news about renting" },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-start justify-between py-3 border-b last:border-0">
                                                <div>
                                                    <p className="font-medium">{item.label}</p>
                                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="h-5 w-5 rounded border-gray-300"
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Security Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your account security
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Password</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Last changed 30 days ago
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Change Password
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b">
                                            <div>
                                                <p className="font-medium">Two-Factor Authentication</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Add an extra layer of security
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Enable
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium text-red-600">Delete Account</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Permanently delete your account and data
                                                </p>
                                            </div>
                                            <Button variant="destructive" size="sm">
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
