"use client";

import { Header, Footer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                    <Building className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    RentEase
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                            <p className="text-muted-foreground">
                                Last updated: January 10, 2026
                            </p>
                        </div>

                        <Card>
                            <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
                                <h2 className="text-2xl font-semibold mt-0">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing or using RentEase, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We may modify these terms at any time, and your continued use constitutes acceptance of any changes.
                                </p>

                                <h2 className="text-2xl font-semibold">2. Description of Services</h2>
                                <p>
                                    RentEase provides an online platform that connects tenants with landlords and property managers. Our services include:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Property listing and search functionality</li>
                                    <li>Rental application submission and management</li>
                                    <li>Messaging between tenants and property owners</li>
                                    <li>Profile management and account services</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">3. User Accounts</h2>
                                <p>To use certain features, you must create an account. You agree to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide accurate and complete information</li>
                                    <li>Maintain the security of your password</li>
                                    <li>Promptly update any changes to your information</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                    <li>Notify us immediately of any unauthorized use</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">4. User Conduct</h2>
                                <p>You agree not to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Post false, misleading, or fraudulent content</li>
                                    <li>Harass, threaten, or discriminate against other users</li>
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Use automated means to access our services without permission</li>
                                    <li>Interfere with the proper functioning of the platform</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">5. Property Listings</h2>
                                <p>
                                    Landlords and property managers are responsible for ensuring their listings are accurate, current, and comply with all applicable laws. RentEase does not verify all listing information and is not responsible for any inaccuracies.
                                </p>

                                <h2 className="text-2xl font-semibold">6. Rental Applications</h2>
                                <p>
                                    When you submit a rental application, you authorize landlords to review your information. Landlords make independent decisions about applications. RentEase does not guarantee approval of any application.
                                </p>

                                <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
                                <p>
                                    All content, features, and functionality on RentEase are owned by us and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.
                                </p>

                                <h2 className="text-2xl font-semibold">8. Disclaimers</h2>
                                <p>
                                    RentEase is provided "as is" without warranties of any kind. We do not guarantee:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>The accuracy of listing information</li>
                                    <li>The quality or safety of any property</li>
                                    <li>The behavior of any users</li>
                                    <li>Uninterrupted or error-free service</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
                                <p>
                                    RentEase shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our services. Our total liability shall not exceed the amount you paid us in the past twelve months.
                                </p>

                                <h2 className="text-2xl font-semibold">10. Indemnification</h2>
                                <p>
                                    You agree to indemnify and hold harmless RentEase and its affiliates from any claims, damages, or expenses arising from your use of our services or violation of these terms.
                                </p>

                                <h2 className="text-2xl font-semibold">11. Termination</h2>
                                <p>
                                    We may suspend or terminate your account at any time for violation of these terms or for any other reason. Upon termination, your right to use our services ceases immediately.
                                </p>

                                <h2 className="text-2xl font-semibold">12. Governing Law</h2>
                                <p>
                                    These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes shall be resolved in the courts of San Francisco County, California.
                                </p>

                                <h2 className="text-2xl font-semibold">13. Contact Information</h2>
                                <p>
                                    For questions about these Terms of Service, please contact us at:
                                </p>
                                <ul className="list-none pl-0 space-y-1">
                                    <li>Email: legal@rentease.com</li>
                                    <li>Phone: (555) 123-RENT</li>
                                    <li>Address: 123 Main Street, San Francisco, CA 94102</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
