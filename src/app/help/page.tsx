"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    HelpCircle,
    Search,
    Home,
    FileText,
    MessageSquare,
    CreditCard,
    Shield,
    Settings,
    ChevronRight,
    Mail,
    Phone,
    Clock,
} from "lucide-react";

const categories = [
    {
        icon: Home,
        title: "Getting Started",
        description: "New to RentEase? Learn the basics",
        articles: ["How to create an account", "Setting up your profile", "Finding your first rental"],
    },
    {
        icon: FileText,
        title: "Applications",
        description: "Everything about rental applications",
        articles: ["How to apply for a property", "Application requirements", "Tracking application status"],
    },
    {
        icon: MessageSquare,
        title: "Messaging",
        description: "Communication tools and tips",
        articles: ["Contacting landlords", "Message notifications", "Communication best practices"],
    },
    {
        icon: CreditCard,
        title: "Payments",
        description: "Payment methods and billing",
        articles: ["Setting up payments", "Payment security", "Refund policies"],
    },
    {
        icon: Shield,
        title: "Safety & Trust",
        description: "Your security matters",
        articles: ["Verifying listings", "Reporting scams", "Account security tips"],
    },
    {
        icon: Settings,
        title: "Account Settings",
        description: "Manage your account",
        articles: ["Updating profile info", "Notification settings", "Deleting your account"],
    },
];

const faqs = [
    {
        question: "How do I apply for a rental property?",
        answer: "To apply for a property, first browse our listings and find a property you're interested in. Click on the property to view details, then click the 'Apply Now' button. You'll need to fill out an application form with your personal information, employment details, and rental history.",
    },
    {
        question: "How long does the application process take?",
        answer: "Most landlords review applications within 24-48 hours. However, the timeline can vary depending on the landlord's availability and the number of applications they receive. You can track your application status in your dashboard.",
    },
    {
        question: "Can I apply to multiple properties at once?",
        answer: "Yes! RentEase allows you to apply to multiple properties simultaneously. Your application information is saved, making it easy to submit applications to different properties quickly.",
    },
    {
        question: "How do I contact a landlord?",
        answer: "You can message a landlord directly from the property listing page by clicking the 'Contact Owner' button. Make sure you're logged in to access this feature.",
    },
    {
        question: "Is my personal information secure?",
        answer: "Absolutely. We use industry-standard encryption to protect your data. Your personal information is only shared with landlords when you submit an application, and our systems are regularly audited for security.",
    },
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16">
                    <div className="container px-4 text-center">
                        <HelpCircle className="h-16 w-16 text-white mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-white mb-4">
                            How can we help you?
                        </h1>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Search our knowledge base or browse categories below to find answers to your questions.
                        </p>
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-lg bg-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-16 bg-muted/30">
                    <div className="container px-4">
                        <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <Icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{category.title}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {category.articles.map((article) => (
                                                    <li key={article}>
                                                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                                                            <ChevronRight className="h-4 w-4 mr-1" />
                                                            {article}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-16">
                    <div className="container px-4">
                        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-16 bg-muted/30">
                    <div className="container px-4">
                        <h2 className="text-2xl font-bold text-center mb-8">Still need help?</h2>
                        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">Email Support</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Get help via email within 24 hours
                                    </p>
                                    <Button variant="outline" size="sm">
                                        support@rentease.com
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">Phone Support</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Talk to our support team
                                    </p>
                                    <Button variant="outline" size="sm">
                                        (555) 123-RENT
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">Business Hours</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Mon-Fri: 9am - 6pm EST
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Sat-Sun: 10am - 4pm EST
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
