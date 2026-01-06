"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Home,
    Building,
    MessageSquare,
    FileText,
    User,
    LogOut,
    Menu,
    Plus,
} from "lucide-react";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/properties", label: "Properties", icon: Building },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/applications", label: "Applications", icon: FileText },
];

export function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const pathname = usePathname();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                        <Building className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        RentEase
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {isAuthenticated && (
                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            {/* Add Property Button (Landlords/Property Managers) */}
                            {user && (user.role === "landlord" || user.role === "property_manager") && (
                                <Link href="/properties/new" className="hidden sm:block">
                                    <Button size="sm" className="gap-1">
                                        <Plus className="h-4 w-4" />
                                        List Property
                                    </Button>
                                </Link>
                            )}

                            {/* Mobile Menu */}
                            <Sheet>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-64">
                                    <nav className="flex flex-col space-y-4 mt-8">
                                        {navLinks.map((link) => {
                                            const Icon = link.icon;
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:bg-accent"
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span>{link.label}</span>
                                                </Link>
                                            );
                                        })}
                                        {user && (user.role === "landlord" || user.role === "property_manager") && (
                                            <Link
                                                href="/properties/new"
                                                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent"
                                            >
                                                <Plus className="h-5 w-5" />
                                                <span>List Property</span>
                                            </Link>
                                        )}
                                    </nav>
                                </SheetContent>
                            </Sheet>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                                {user?.name ? getInitials(user.name) : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">{user?.name}</p>
                                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {user?.role?.replace("_", " ")}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Sign up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
