"use client";

import { Header, Footer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function PrivacyPolicyPage() {
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
                            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                            <p className="text-muted-foreground">
                                Last updated: January 10, 2026
                            </p>
                        </div>

                        <Card>
                            <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
                                <h2 className="text-2xl font-semibold mt-0">1. Introduction</h2>
                                <p>
                                    Welcome to RentEase. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
                                </p>

                                <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
                                <p>We collect information that you provide directly to us, including:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
                                    <li><strong>Profile Information:</strong> Additional details you provide such as profile pictures and preferences.</li>
                                    <li><strong>Application Data:</strong> Employment information, rental history, and references when you apply for properties.</li>
                                    <li><strong>Communications:</strong> Messages you send through our platform.</li>
                                    <li><strong>Payment Information:</strong> When applicable, billing details for premium services.</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide, maintain, and improve our services</li>
                                    <li>Process rental applications and facilitate connections between tenants and landlords</li>
                                    <li>Send you technical notices, updates, and support messages</li>
                                    <li>Respond to your comments and questions</li>
                                    <li>Protect against fraud and unauthorized access</li>
                                    <li>Comply with legal obligations</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">4. Information Sharing</h2>
                                <p>We share your information only in the following circumstances:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>With Landlords/Tenants:</strong> When you submit an application or initiate communication</li>
                                    <li><strong>Service Providers:</strong> Third parties that help us operate our services</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">5. Data Security</h2>
                                <p>
                                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, and access controls.
                                </p>

                                <h2 className="text-2xl font-semibold">6. Your Rights</h2>
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Access the personal information we hold about you</li>
                                    <li>Request correction of inaccurate information</li>
                                    <li>Request deletion of your account and associated data</li>
                                    <li>Object to processing of your information</li>
                                    <li>Request data portability</li>
                                    <li>Withdraw consent where applicable</li>
                                </ul>

                                <h2 className="text-2xl font-semibold">7. Cookies and Tracking</h2>
                                <p>
                                    We use cookies and similar technologies to provide functionality, analyze usage, and personalize content. You can control cookie preferences through your browser settings.
                                </p>

                                <h2 className="text-2xl font-semibold">8. Data Retention</h2>
                                <p>
                                    We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legal compliance, dispute resolution, or legitimate business purposes.
                                </p>

                                <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
                                <p>
                                    Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us.
                                </p>

                                <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
                                <p>
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                                </p>

                                <h2 className="text-2xl font-semibold">11. Contact Us</h2>
                                <p>
                                    If you have questions about this Privacy Policy or our practices, please contact us at:
                                </p>
                                <ul className="list-none pl-0 space-y-1">
                                    <li>Email: privacy@rentease.com</li>
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
