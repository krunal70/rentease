import Link from "next/link";
import { Building, Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                <Building className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                RentEase
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Making rental experiences seamless for tenants, landlords, and property managers.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/properties" className="text-muted-foreground hover:text-primary transition-colors">
                                    Browse Properties
                                </Link>
                            </li>
                            <li>
                                <Link href="/properties/new" className="text-muted-foreground hover:text-primary transition-colors">
                                    List Your Property
                                </Link>
                            </li>
                            <li>
                                <Link href="/applications" className="text-muted-foreground hover:text-primary transition-colors">
                                    My Applications
                                </Link>
                            </li>
                            <li>
                                <Link href="/messages" className="text-muted-foreground hover:text-primary transition-colors">
                                    Messages
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>support@rentease.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>(555) 123-RENT</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} RentEase. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
