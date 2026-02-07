"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    MapPin,
    Bed,
    Bath,
    Square,
    Calendar,
    DollarSign,
    PawPrint,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Phone,
    Mail,
    MessageSquare,
    Check,
    Star,
    Edit2,
} from "lucide-react";
import { toast } from "sonner";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { property, isLoading, error } = useProperty(params.id as string);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);

    // Cast property to any to access owner details which are not in the base type yet
    // In a real app we'd update the Property type definition
    const owner = property ? property.owner : null;

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-16">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-[400px] w-full rounded-lg" />
                            <Skeleton className="h-40 w-full rounded-lg" />
                            <Skeleton className="h-40 w-full rounded-lg" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-60 w-full rounded-lg" />
                            <Skeleton className="h-40 w-full rounded-lg" />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-16 text-center">
                    <h1 className="text-2xl font-bold">Property not found</h1>
                    <p className="text-muted-foreground mt-2">
                        {error || "The property you're looking for doesn't exist."}
                    </p>
                    <Link href="/properties">
                        <Button className="mt-4">Browse Properties</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === property.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        );
    };

    const handleApply = () => {
        if (!isAuthenticated) {
            toast.error("Please log in to apply", {
                description: "You need an account to submit an application.",
            });
            router.push("/login");
            return;
        }
        router.push(`/applications/new?propertyId=${property.id}`);
    };

    const handleContact = () => {
        if (!isAuthenticated) {
            toast.error("Please log in to contact", {
                description: "You need an account to message the owner.",
            });
            router.push("/login");
            return;
        }
        setShowContactDialog(true);
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: property.title,
                text: `Check out this property: ${property.title}`,
                url: window.location.href,
            });
        } catch {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!", {
                description: "Property link has been copied to clipboard.",
            });
        }
    };

    const petPolicyInfo = {
        allowed: { label: "Pets Allowed", color: "bg-green-100 text-green-800" },
        not_allowed: { label: "No Pets", color: "bg-red-100 text-red-800" },
        case_by_case: { label: "Pets Negotiable", color: "bg-yellow-100 text-yellow-800" },
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    {/* Back Button */}
                    <Link href="/properties" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Properties
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Gallery */}
                            <Card className="overflow-hidden">
                                <div className="relative aspect-[16/10]">
                                    <img
                                        src={property.images[currentImageIndex] || "/placeholder-property.jpg"}
                                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                    {/* Navigation Arrows */}
                                    {property.images.length > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                                                onClick={prevImage}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                                                onClick={nextImage}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </>
                                    )}
                                    {/* Image Counter */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                                        {currentImageIndex + 1} / {property.images.length}
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        {/* Edit Button for Owners */}
                                        {user && property.ownerId === user.id && (
                                            <Link href={`/properties/${property.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="bg-white/80 hover:bg-white rounded-full"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="bg-white/80 hover:bg-white rounded-full"
                                            onClick={() => setIsFavorite(!isFavorite)}
                                        >
                                            <Heart
                                                className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""
                                                    }`}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="bg-white/80 hover:bg-white rounded-full"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                                {/* Thumbnail Strip */}
                                {property.images.length > 1 && (
                                    <div className="flex gap-2 p-4 overflow-x-auto">
                                        {property.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImageIndex
                                                    ? "border-primary"
                                                    : "border-transparent hover:border-muted-foreground/50"
                                                    }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            {/* Property Info */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="capitalize">{property.propertyType}</Badge>
                                                <Badge variant="secondary" className="capitalize">
                                                    {property.status}
                                                </Badge>
                                            </div>
                                            <h1 className="text-2xl font-bold">{property.title}</h1>
                                            <div className="flex items-center text-muted-foreground mt-2">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {property.address.street}, {property.address.city},{" "}
                                                {property.address.state} {property.address.zipCode}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center text-amber-500">
                                                <Star className="h-5 w-5 fill-current" />
                                                <span className="ml-1 font-semibold">4.8</span>
                                                <span className="text-muted-foreground ml-1">(24 reviews)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                                        <div className="flex items-center gap-2">
                                            <Bed className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{property.bedrooms}</p>
                                                <p className="text-sm text-muted-foreground">Bedrooms</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Bath className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{property.bathrooms}</p>
                                                <p className="text-sm text-muted-foreground">Bathrooms</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Square className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{property.squareFeet.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">Sq Ft</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <PawPrint className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <Badge variant="secondary" className={petPolicyInfo[property.petPolicy].color}>
                                                    {petPolicyInfo[property.petPolicy].label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {property.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Amenities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Amenities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {property.amenities.map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <span className="text-sm">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Pricing Card */}
                            <Card className="sticky top-20">
                                <CardContent className="p-6">
                                    <div className="text-center mb-6">
                                        <p className="text-3xl font-bold text-primary">
                                            ${property.price.toLocaleString()}
                                            <span className="text-lg font-normal text-muted-foreground">
                                                /mo
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Deposit: ${property.deposit.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Available From
                                            </span>
                                            <span className="font-medium">
                                                {new Date(property.availableFrom).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button className="w-full" size="lg" onClick={handleApply}>
                                            Apply Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="lg"
                                            onClick={handleContact}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Contact Owner
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Owner Info */}
                            {owner && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Listed by</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={owner.avatar} />
                                                <AvatarFallback>
                                                    {owner.name
                                                        .split(" ")
                                                        .map((n: string) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{owner.name}</p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    Landlord
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex items-center text-muted-foreground">
                                                <Mail className="h-4 w-4 mr-2" />
                                                {owner.email}
                                            </div>
                                            {owner.phone && (
                                                <div className="flex items-center text-muted-foreground">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    {owner.phone}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Contact Dialog */}
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contact {owner?.name}</DialogTitle>
                        <DialogDescription>
                            Send a message about {property.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <textarea
                            className="w-full min-h-[100px] p-3 rounded-lg border resize-none"
                            placeholder={`Hi, I'm interested in ${property.title}. Is it still available?`}
                        />
                        <Button
                            className="w-full"
                            onClick={() => {
                                toast.success("Message sent!", {
                                    description: "The owner will respond to your inquiry.",
                                });
                                setShowContactDialog(false);
                            }}
                        >
                            Send Message
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
