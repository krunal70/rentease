"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    User,
    Bell,
    Shield,
    Loader2,
    Camera,
    Eye,
    EyeOff,
    Check,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreferences {
    applicationUpdates: boolean;
    newMessages: boolean;
    propertyRecommendations: boolean;
    newsletter: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [notifications, setNotifications] = useState<NotificationPreferences>({
        applicationUpdates: true,
        newMessages: true,
        propertyRecommendations: true,
        newsletter: false,
    });

    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

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
            setAvatarUrl(user.avatar);
            // Load notification preferences from localStorage or defaults
            const savedPrefs = localStorage.getItem(`notifications_${user.id}`);
            if (savedPrefs) {
                setNotifications(JSON.parse(savedPrefs));
            }
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast.success("Profile updated!", {
                description: "Your changes have been saved.",
            });
        } catch (error) {
            toast.error("Failed to save", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Invalid file type", { description: "Please upload an image file." });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large", { description: "Maximum file size is 2MB." });
            return;
        }

        setIsUploadingAvatar(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

            // Update profile with new avatar URL
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: data.publicUrl }),
            });

            if (!response.ok) {
                throw new Error("Failed to update avatar");
            }

            setAvatarUrl(data.publicUrl + "?t=" + Date.now()); // Add timestamp to bust cache
            toast.success("Avatar updated!", {
                description: "Your new profile picture has been saved.",
            });
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload", {
                description: "Please try again later.",
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSaveNotifications = () => {
        if (user) {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
            toast.success("Preferences saved!", {
                description: "Your notification preferences have been updated.",
            });
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match", {
                description: "Please make sure both passwords are the same.",
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password too short", {
                description: "Password must be at least 6 characters.",
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword,
            });

            if (error) {
                throw error;
            }

            toast.success("Password changed!", {
                description: "Your password has been updated successfully.",
            });
            setShowPasswordDialog(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Failed to change password", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            // Note: Full account deletion requires server-side admin privileges
            // This would typically be handled by a backend endpoint
            toast.error("Account deletion", {
                description: "Please contact support to delete your account.",
            });
            setShowDeleteDialog(false);
        } catch (error) {
            toast.error("Failed to delete account", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsDeletingAccount(false);
        }
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
                                                    <AvatarImage src={avatarUrl} />
                                                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                                        {user.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarUpload}
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                                                    onClick={handleAvatarClick}
                                                    disabled={isUploadingAvatar}
                                                >
                                                    {isUploadingAvatar ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Camera className="h-4 w-4" />
                                                    )}
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
                                                    disabled
                                                    className="bg-muted"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Contact support to change your email
                                                </p>
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
                                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </>
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
                                        <div className="flex items-start justify-between py-3 border-b">
                                            <div className="space-y-1">
                                                <p className="font-medium">Application updates</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Get notified when your application status changes
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={notifications.applicationUpdates}
                                                onCheckedChange={(checked) =>
                                                    setNotifications({
                                                        ...notifications,
                                                        applicationUpdates: checked as boolean,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-start justify-between py-3 border-b">
                                            <div className="space-y-1">
                                                <p className="font-medium">New messages</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive email for new messages
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={notifications.newMessages}
                                                onCheckedChange={(checked) =>
                                                    setNotifications({
                                                        ...notifications,
                                                        newMessages: checked as boolean,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-start justify-between py-3 border-b">
                                            <div className="space-y-1">
                                                <p className="font-medium">Property recommendations</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Suggested properties based on your preferences
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={notifications.propertyRecommendations}
                                                onCheckedChange={(checked) =>
                                                    setNotifications({
                                                        ...notifications,
                                                        propertyRecommendations: checked as boolean,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="flex items-start justify-between py-3">
                                            <div className="space-y-1">
                                                <p className="font-medium">Newsletter</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Tips and news about renting
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={notifications.newsletter}
                                                onCheckedChange={(checked) =>
                                                    setNotifications({
                                                        ...notifications,
                                                        newsletter: checked as boolean,
                                                    })
                                                }
                                            />
                                        </div>
                                        <Button onClick={handleSaveNotifications}>
                                            <Check className="mr-2 h-4 w-4" />
                                            Save Preferences
                                        </Button>
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
                                                    Change your account password
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowPasswordDialog(true)}
                                            >
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
                                            <Button variant="outline" size="sm" disabled>
                                                Coming Soon
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium text-red-600">Delete Account</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Permanently delete your account and data
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
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

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your new password below. Make sure it&apos;s at least 6 characters.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                            {isChangingPassword ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Changing...
                                </>
                            ) : (
                                "Change Password"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete your account? This action is permanent
                            and cannot be undone. All your data, applications, and messages will be
                            permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                        >
                            {isDeletingAccount ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
