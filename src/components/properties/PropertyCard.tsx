"use client";

import Link from "next/link";
import { Property } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
    property: Property;
    variant?: "default" | "compact";
}

export function PropertyCard({ property, variant = "default" }: PropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFavorite(!isFavorite);
    };

    const petPolicyLabels = {
        allowed: "Pets Allowed",
        not_allowed: "No Pets",
        case_by_case: "Pets Negotiable",
    };

    if (variant === "compact") {
        return (
            <Link href={`/properties/${property.id}`}>
                <div className="flex gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{property.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {property.address.city}, {property.address.state}
                        </div>
                        <div className="flex items-center gap-3 text-sm mt-2">
                            <span className="flex items-center">
                                <Bed className="mr-1 h-3 w-3" />
                                {property.bedrooms}
                            </span>
                            <span className="flex items-center">
                                <Bath className="mr-1 h-3 w-3" />
                                {property.bathrooms}
                            </span>
                        </div>
                        <p className="text-lg font-bold text-primary mt-1">
                            ${property.price.toLocaleString()}/mo
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/properties/${property.id}`}>
            <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-primary capitalize">{property.propertyType}</Badge>
                        {property.status !== "available" && (
                            <Badge variant="secondary" className="capitalize">
                                {property.status}
                            </Badge>
                        )}
                    </div>
                    {/* Favorite Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                        onClick={handleFavoriteClick}
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                        />
                    </Button>
                    {/* Pet Policy Badge */}
                    <div className="absolute bottom-3 left-3">
                        <Badge
                            variant={property.petPolicy === "allowed" ? "default" : "secondary"}
                            className="text-xs"
                        >
                            {petPolicyLabels[property.petPolicy]}
                        </Badge>
                    </div>
                </div>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-1 flex-1">{property.title}</h3>
                        <div className="flex items-center text-amber-500 shrink-0">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="ml-1 text-sm font-medium">4.8</span>
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        {property.address.city}, {property.address.state}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                        <span className="flex items-center">
                            <Bed className="mr-1 h-4 w-4" />
                            {property.bedrooms} bed
                        </span>
                        <span className="flex items-center">
                            <Bath className="mr-1 h-4 w-4" />
                            {property.bathrooms} bath
                        </span>
                        <span className="flex items-center">
                            <Square className="mr-1 h-4 w-4" />
                            {property.squareFeet.toLocaleString()} sqft
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <div>
                            <span className="text-2xl font-bold text-primary">
                                ${property.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                        <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-white">
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
