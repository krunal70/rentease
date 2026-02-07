"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    Loader2,
    Building,
    MapPin,
    DollarSign,
    Home,
    Trash2,
    Save,
} from "lucide-react";
import { toast } from "sonner";

const propertySchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    propertyType: z.enum(["apartment", "house", "condo", "townhouse", "studio"]),
    bedrooms: z.coerce.number().min(0),
    bathrooms: z.coerce.number().min(0.5),
    squareFeet: z.coerce.number().min(100, "Must be at least 100 sq ft"),
    price: z.coerce.number().min(1, "Price is required"),
    deposit: z.coerce.number().min(0),
    availableFrom: z.string(),
    petPolicy: z.enum(["allowed", "not_allowed", "case_by_case"]),
    address: z.object({
        street: z.string().min(5, "Street address is required"),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        zipCode: z.string().min(5, "Zip code is required"),
    }),
    amenities: z.array(z.string()),
    status: z.enum(["available", "pending", "rented"]),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const amenitiesList = [
    "In-unit Washer/Dryer",
    "Laundry Facility",
    "Central AC",
    "Central Heat",
    "Gym",
    "Pool",
    "Rooftop Deck",
    "Balcony",
    "Parking",
    "Garage",
    "Concierge",
    "Doorman",
    "Pet Friendly",
    "Hardwood Floors",
    "Fireplace",
    "Dishwasher",
    "Storage",
    "Elevator",
    "Wheelchair Accessible",
    "Smart Home",
];

export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const { property, isLoading: propertyLoading, error: propertyError } = useProperty(params.id as string);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            title: "",
            description: "",
            propertyType: "apartment",
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: 500,
            price: 0,
            deposit: 0,
            availableFrom: "",
            petPolicy: "not_allowed",
            address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
            },
            amenities: [],
            status: "available",
        },
    });

    // Check authorization
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!authLoading && user && user.role === "tenant") {
            toast.error("Access denied", {
                description: "Only landlords and property managers can edit properties.",
            });
            router.push("/dashboard");
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Check property ownership
    useEffect(() => {
        if (property && user && property.ownerId !== user.id) {
            toast.error("Access denied", {
                description: "You can only edit your own properties.",
            });
            router.push("/dashboard");
        }
    }, [property, user, router]);

    // Populate form when property loads
    useEffect(() => {
        if (property) {
            const availableFrom = property.availableFrom
                ? new Date(property.availableFrom).toISOString().split("T")[0]
                : "";

            form.reset({
                title: property.title,
                description: property.description,
                propertyType: property.propertyType as any,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                squareFeet: property.squareFeet,
                price: property.price,
                deposit: property.deposit,
                availableFrom,
                petPolicy: property.petPolicy as any,
                address: {
                    street: property.address.street,
                    city: property.address.city,
                    state: property.address.state,
                    zipCode: property.address.zipCode,
                },
                amenities: property.amenities || [],
                status: property.status as any,
            });
        }
    }, [property, form]);

    const onSubmit = async (data: PropertyFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/properties/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to update property");
            }

            toast.success("Property updated!", {
                description: "Your changes have been saved.",
            });
            router.push(`/properties/${params.id}`);
        } catch (error) {
            toast.error("Failed to save", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/properties/${params.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to delete property");
            }

            toast.success("Property deleted", {
                description: "The property has been removed.",
            });
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to delete", {
                description: error instanceof Error ? error.message : "Please try again.",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (authLoading || propertyLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </main>
            </div>
        );
    }

    if (propertyError || !property) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-16 text-center">
                    <h1 className="text-2xl font-bold">Property not found</h1>
                    <p className="text-muted-foreground mt-2">{propertyError}</p>
                    <Link href="/dashboard">
                        <Button className="mt-4">Go to Dashboard</Button>
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href={`/properties/${params.id}`}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Property
                        </Link>

                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold">Edit Property</h1>
                                <p className="text-muted-foreground mt-1">
                                    Update your property listing details
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Property
                            </Button>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Modern Downtown Apartment" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your property..."
                                                            className="min-h-[120px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="propertyType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Type</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="apartment">Apartment</SelectItem>
                                                                <SelectItem value="house">House</SelectItem>
                                                                <SelectItem value="condo">Condo</SelectItem>
                                                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                                                <SelectItem value="studio">Studio</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bedrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bedrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="bathrooms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bathrooms</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0.5" step="0.5" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="squareFeet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Square Feet</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="100" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Location */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="address.street"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Street Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123 Main St, Apt 4B" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="address.city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="San Francisco" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="address.state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>State</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="CA" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="address.zipCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Zip Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="94102" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pricing & Availability */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Pricing & Availability
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Monthly Rent ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="deposit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Security Deposit ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="availableFrom"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Available From</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="available">Available</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="rented">Rented</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="petPolicy"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pet Policy</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="allowed">Pets Allowed</SelectItem>
                                                            <SelectItem value="not_allowed">No Pets</SelectItem>
                                                            <SelectItem value="case_by_case">Case by Case</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Amenities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Home className="h-5 w-5" />
                                            Amenities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="amenities"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                        {amenitiesList.map((amenity) => (
                                                            <div
                                                                key={amenity}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <Checkbox
                                                                    id={amenity}
                                                                    checked={field.value.includes(amenity)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            field.onChange([...field.value, amenity]);
                                                                        } else {
                                                                            field.onChange(
                                                                                field.value.filter((a) => a !== amenity)
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={amenity}
                                                                    className="text-sm cursor-pointer"
                                                                >
                                                                    {amenity}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                <div className="flex justify-end gap-4">
                                    <Link href={`/properties/${params.id}`}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Property</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this property? This action cannot be undone.
                            All associated applications and messages will also be deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Property
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
