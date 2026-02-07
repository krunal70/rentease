"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    ChevronDown,
    ChevronUp,
    Home,
    FileText,
    CreditCard,
    Shield,
    MessageSquare,
    Settings,
} from "lucide-react";

const faqCategories = [
    {
        id: "getting-started",
        icon: Home,
        title: "Getting Started",
        faqs: [
            {
                question: "How do I create a RentEase account?",
                answer: "Creating an account is easy! Click the 'Get Started' button on our homepage and fill out the registration form with your name, email, and password. You can choose your role as a tenant, landlord, or property manager. Once registered, you'll have access to all our features.",
            },
            {
                question: "Is RentEase free to use?",
                answer: "Yes! RentEase is completely free for tenants to use. You can browse properties, submit applications, and communicate with landlords at no cost. Landlords and property managers can list properties for free, with optional premium features available for enhanced visibility.",
            },
            {
                question: "What types of properties can I find on RentEase?",
                answer: "RentEase features a wide variety of rental properties including apartments, houses, condos, townhouses, and studios. You can filter by price, location, number of bedrooms/bathrooms, pet policies, and more to find your perfect home.",
            },
        ],
    },
    {
        id: "applications",
        icon: FileText,
        title: "Applications",
        faqs: [
            {
                question: "How do I apply for a rental property?",
                answer: "To apply, first find a property you're interested in and click 'Apply Now'. You'll need to fill out an application with personal information, employment details, and rental history. You can apply to multiple properties with the same information saved in your profile.",
            },
            {
                question: "What information do I need for an application?",
                answer: "Typically, you'll need to provide: full name, contact information, current and previous addresses, employment information (employer name, income, length of employment), references, and consent for background/credit checks. Some landlords may have additional requirements.",
            },
            {
                question: "How long does the application review take?",
                answer: "Most landlords review applications within 24-48 hours. However, timing can vary based on the landlord's availability and number of applications received. You can track your application status in real-time through your dashboard.",
            },
            {
                question: "Can I apply to multiple properties at once?",
                answer: "Absolutely! There's no limit to how many properties you can apply to. Your application information is saved, making it quick and easy to apply to additional properties. Just keep in mind that each landlord reviews applications independently.",
            },
        ],
    },
    {
        id: "payments",
        icon: CreditCard,
        title: "Payments & Fees",
        faqs: [
            {
                question: "Are there any application fees?",
                answer: "RentEase does not charge application fees. However, some landlords may require a separate application fee to cover background check costs. This will be clearly disclosed on the property listing before you apply.",
            },
            {
                question: "How do I pay my security deposit?",
                answer: "Security deposits are handled directly between tenants and landlords. Once your application is approved, the landlord will provide instructions for submitting your security deposit and first month's rent.",
            },
            {
                question: "What payment methods are accepted?",
                answer: "Payment methods vary by landlord. Common options include bank transfers, checks, and online payment platforms. The landlord will specify their preferred payment methods after your application is approved.",
            },
        ],
    },
    {
        id: "security",
        icon: Shield,
        title: "Safety & Security",
        faqs: [
            {
                question: "Is my personal information secure?",
                answer: "Yes, we take security seriously. All data is encrypted using industry-standard protocols. Your sensitive information is only shared with landlords when you submit an application. We never sell your data to third parties.",
            },
            {
                question: "How do I report a suspicious listing?",
                answer: "If you encounter a listing that seems fraudulent, click the 'Report' button on the property page or contact our support team directly. We investigate all reports promptly and take action to protect our community.",
            },
            {
                question: "How can I verify a landlord is legitimate?",
                answer: "Look for verified badges on landlord profiles. You can also check their reviews from other tenants, request to see the property in person, and never send money without proper documentation. If something seems off, trust your instincts and report it.",
            },
        ],
    },
    {
        id: "messaging",
        icon: MessageSquare,
        title: "Communication",
        faqs: [
            {
                question: "How do I contact a landlord?",
                answer: "You can message any landlord directly from their property listing by clicking 'Contact Owner'. You must be logged in to send messages. All communications are saved in your Messages inbox for easy reference.",
            },
            {
                question: "Will I be notified of new messages?",
                answer: "Yes! You'll receive notifications for new messages based on your notification preferences. You can choose to receive email notifications, push notifications, or both. Manage these settings in your profile.",
            },
            {
                question: "Can landlords message me first?",
                answer: "Landlords can respond to your applications and inquiries but cannot initiate contact without your prior interaction. This helps protect your privacy while still enabling effective communication.",
            },
        ],
    },
    {
        id: "account",
        icon: Settings,
        title: "Account Management",
        faqs: [
            {
                question: "How do I update my profile information?",
                answer: "Go to your Profile page (accessible from the menu) and click on the information you want to update. You can change your name, phone number, and notification preferences. Remember to save your changes!",
            },
            {
                question: "How do I change my password?",
                answer: "Navigate to Profile > Security tab, and click 'Change Password'. You can also use the 'Forgot Password' link on the login page to reset your password via email.",
            },
            {
                question: "How do I delete my account?",
                answer: "If you wish to delete your account, go to Profile > Security and click 'Delete Account'. Please note this action is permanent and will remove all your data, applications, and message history.",
            },
        ],
    },
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openItems, setOpenItems] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const filteredCategories = faqCategories.map((category) => ({
        ...category,
        faqs: category.faqs.filter(
            (faq) =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter((category) => category.faqs.length > 0);

    const displayCategories = activeCategory
        ? filteredCategories.filter((c) => c.id === activeCategory)
        : filteredCategories;

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-16">
                    <div className="container px-4 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Find answers to common questions about using RentEase.
                        </p>
                        <div className="max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-lg bg-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Category Tabs */}
                <section className="border-b sticky top-16 bg-background z-10">
                    <div className="container px-4">
                        <div className="flex gap-2 overflow-x-auto py-4">
                            <Button
                                variant={activeCategory === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveCategory(null)}
                            >
                                All
                            </Button>
                            {faqCategories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <Button
                                        key={category.id}
                                        variant={activeCategory === category.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveCategory(category.id)}
                                        className="whitespace-nowrap"
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {category.title}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ Content */}
                <section className="py-12 bg-muted/30">
                    <div className="container px-4">
                        <div className="max-w-3xl mx-auto space-y-8">
                            {displayCategories.map((category) => {
                                const Icon = category.icon;
                                return (
                                    <div key={category.id}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <h2 className="text-xl font-semibold">{category.title}</h2>
                                        </div>
                                        <div className="space-y-3">
                                            {category.faqs.map((faq, index) => {
                                                const itemId = `${category.id}-${index}`;
                                                const isOpen = openItems.includes(itemId);
                                                return (
                                                    <Card key={itemId}>
                                                        <button
                                                            onClick={() => toggleItem(itemId)}
                                                            className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
                                                        >
                                                            <span className="font-medium pr-4">{faq.question}</span>
                                                            {isOpen ? (
                                                                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                                                            )}
                                                        </button>
                                                        {isOpen && (
                                                            <CardContent className="pt-0 pb-4 px-4">
                                                                <p className="text-muted-foreground">{faq.answer}</p>
                                                            </CardContent>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                            {displayCategories.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No FAQs found matching your search.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveCategory(null);
                                        }}
                                    >
                                        Clear Search
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Still Have Questions */}
                <section className="py-12">
                    <div className="container px-4 text-center">
                        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                        <p className="text-muted-foreground mb-6">
                            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/help">
                                <Button>Visit Help Center</Button>
                            </Link>
                            <Button variant="outline">
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
