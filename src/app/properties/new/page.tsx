"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash, UploadCloud, Building, MapPin, DollarSign, Home, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getCoordinatesFromAddress } from "@/lib/utils";

// Schema Definition
const propertySchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    propertyType: z.enum(["apartment", "house", "condo", "townhouse", "studio"]),
    petPolicy: z.enum(["allowed", "not_allowed", "case_by_case"]),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    deposit: z.coerce.number().min(0, "Deposit cannot be negative"),
    bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative"),
    bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative"),
    squareFeet: z.coerce.number().min(1, "Square feet must be greater than 0"),
    availableFrom: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Date must be in the future or today",
    }),
    address: z.object({
        street: z.string().min(5, "Street address is required"),
        city: z.string().min(2, "City is required"),
        state: z.string().min(2, "State is required"),
        zipCode: z.string().min(5, "Zip code is required"),
    }),
    amenities: z.array(z.string()).default([]),
    imageUrls: z.array(z.object({ value: z.string().url("Must be a valid URL") })).min(1, "At least one image is required"),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

const AMENITY_OPTIONS = [
    "Air Conditioning", "In-Unit Washer/Dryer", "Dishwasher", "Parking", "Gym",
    "Pool", "Elevator", "Doorman", "Balcony/Patio", "Garden", "Fireplace", "Wheelchair Access"
];

export default function NewPropertyPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            title: "",
            description: "",
            propertyType: "apartment",
            petPolicy: "allowed",
            price: 0,
            deposit: 0,
            bedrooms: 1,
            bathrooms: 1,
            squareFeet: 500,
            availableFrom: new Date().toISOString().split("T")[0],
            address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
            },
            amenities: [],
            imageUrls: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "imageUrls",
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("Access Denied", { description: "Please log in to list a property" });
            router.push("/login");
        } else if (!isLoading && user && user.role === "tenant") {
            toast.error("Access Denied", { description: "Tenants cannot list properties" });
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, user, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        console.log("Starting upload for", files.length, "files");
        const supabase = createClient();

        try {
            if (!user) {
                console.error("User not authenticated during upload");
                throw new Error("User not authenticated");
            }

            const uploadPromises = Array.from(files).map(async (file, idx) => {
                console.log(`Processing file ${idx + 1}: ${file.name}`);
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${fileName}`;

                console.log(`Uploading ${fileName} to bucket 'property-images'...`);
                const { error: uploadError, data } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error(`Error uploading ${fileName}:`, uploadError);
                    throw uploadError;
                }
                console.log(`Upload success for ${fileName}, getting public URL...`);

                const { data: { publicUrl } } = supabase.storage
                    .from('property-images')
                    .getPublicUrl(filePath);

                return publicUrl;
            });

            console.log("Awaiting all uploads...");
            const uploadedUrls = await Promise.all(uploadPromises);
            console.log("All uploads completed:", uploadedUrls);

            uploadedUrls.forEach(url => {
                append({ value: url });
            });

            toast.success("Images uploaded successfully");
        } catch (error: any) {
            console.error("Upload process error:", error);
            // Check specifically for bucket not found or permissions
            const msg = error.message || "Failed to upload images";

            if (msg.includes("bucket not found") || error.code === "404") {
                toast.error("Storage Error", {
                    description: "The 'property-images' bucket does not exist. Please create it in your Supabase dashboard."
                });
            } else if (error.code === "403" || msg.includes("policy")) {
                toast.error("Permission Error", {
                    description: "You don't have permission to upload images. Check your Storage RLS policies."
                });
            } else {
                toast.error("Upload Failed", {
                    description: msg
                });
            }
        } finally {
            console.log("Upload process finished, resetting state");
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const onSubmit = async (data: PropertyFormValues) => {
        setIsSubmitting(true);
        try {
            // Geocoding
            const fullAddress = `${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zipCode}`;
            const coordinates = await getCoordinatesFromAddress(fullAddress);

            // Transform form data to API format
            const apiData = {
                ...data,
                amenities: data.amenities, // Already an array of strings
                images: data.imageUrls.map(img => img.value), // Extract URL strings
                address: {
                    ...data.address,
                    latitude: coordinates?.latitude ?? 40.7128, // Fallback to NYC if fails
                    longitude: coordinates?.longitude ?? -74.0060,
                }
            };

            const response = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create property");
            }

            toast.success("Property Listed!", {
                description: "Your property has been successfully listed.",
            });
            router.push("/dashboard");
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-16 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30 pb-12">
                <div className="container py-8 px-4 max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">List a New Property</h1>
                        <p className="text-muted-foreground mt-2">
                            Fill in the details below to publish your property listing.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Basic Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Home className="h-5 w-5" />
                                        Basic Details
                                    </CardTitle>
                                    <CardDescription>The main information about your property</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Listing Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Modern 2-Bedroom Apartment in Downtown" {...field} />
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
                                                    <textarea
                                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        placeholder="Describe the property, features, and neighborhood..."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="propertyType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Property Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
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
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Financials & Specs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Financials & Specs
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                                        <Input type="number" min="0" step="0.5" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="squareFeet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Square Feet</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} />
                                                    </FormControl>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select policy" />
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

                            {/* Location */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="address.street"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Main St" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="address.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="New York" {...field} />
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
                                                        <Input placeholder="NY" {...field} />
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
                                                        <Input placeholder="10001" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        We'll automatically locate your property on the map based on this address.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Amenities */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Amenities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="amenities"
                                        render={() => (
                                            <FormItem>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {AMENITY_OPTIONS.map((item) => (
                                                        <FormField
                                                            key={item}
                                                            control={form.control}
                                                            name="amenities"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={item}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, item])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== item
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            {item}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UploadCloud className="h-5 w-5" />
                                        Images
                                    </CardTitle>
                                    <CardDescription>
                                        Upload images of your property. First image is the cover.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Upload Area */}
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="image-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-input hover:border-primary transition-colors"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {isUploading ? (
                                                    <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
                                                ) : (
                                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    {isUploading ? "Uploading..." : "Click to upload files (JPG, PNG)"}
                                                </p>
                                            </div>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>

                                    {/* Previews */}
                                    {fields.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                                                    <img
                                                        src={field.value}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center font-medium">
                                                            Cover Image
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {form.formState.errors.imageUrls && (
                                        <p className="text-sm font-medium text-destructive">
                                            {form.formState.errors.imageUrls.message}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting || isUploading}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Listing Property...
                                        </>
                                    ) : (
                                        "Create Listing"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
