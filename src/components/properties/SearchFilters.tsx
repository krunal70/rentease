"use client";

import { PropertyFilters, PropertyType, PetPolicy } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SearchFiltersProps {
    filters: PropertyFilters;
    onFilterChange: (filters: PropertyFilters) => void;
    onSearch: (query: string) => void;
    searchQuery: string;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "condo", label: "Condo" },
    { value: "townhouse", label: "Townhouse" },
    { value: "studio", label: "Studio" },
];

const petPolicies: { value: PetPolicy; label: string }[] = [
    { value: "allowed", label: "Pets Allowed" },
    { value: "case_by_case", label: "Pets Negotiable" },
    { value: "not_allowed", label: "No Pets" },
];

const bedroomOptions = ["Any", "Studio", "1", "2", "3", "4+"];
const bathroomOptions = ["Any", "1", "1.5", "2", "2.5", "3+"];

export function SearchFilters({
    filters,
    onFilterChange,
    onSearch,
    searchQuery,
}: SearchFiltersProps) {
    const handlePropertyTypeToggle = (type: PropertyType) => {
        const currentTypes = filters.propertyType || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter((t) => t !== type)
            : [...currentTypes, type];
        onFilterChange({ ...filters, propertyType: newTypes.length > 0 ? newTypes : undefined });
    };

    const handleClearFilters = () => {
        onFilterChange({});
        onSearch("");
    };

    const hasActiveFilters =
        Object.values(filters).some((v) => v !== undefined) || searchQuery;

    const filterContent = (
        <div className="space-y-6">
            {/* Price Range */}
            <div className="space-y-4">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                minPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                        }
                        className="w-full"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) =>
                            onFilterChange({
                                ...filters,
                                maxPrice: e.target.value ? Number(e.target.value) : undefined,
                            })
                        }
                        className="w-full"
                    />
                </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Bedrooms</Label>
                <Select
                    value={filters.bedrooms?.toString() || "any"}
                    onValueChange={(value) =>
                        onFilterChange({
                            ...filters,
                            bedrooms: value === "any" ? undefined : Number(value),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        {bedroomOptions.map((option) => (
                            <SelectItem
                                key={option}
                                value={option === "Any" ? "any" : option === "Studio" ? "0" : option.replace("+", "")}
                            >
                                {option} {option !== "Any" && option !== "Studio" ? "Bed" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Bathrooms */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Bathrooms</Label>
                <Select
                    value={filters.bathrooms?.toString() || "any"}
                    onValueChange={(value) =>
                        onFilterChange({
                            ...filters,
                            bathrooms: value === "any" ? undefined : Number(value),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        {bathroomOptions.map((option) => (
                            <SelectItem
                                key={option}
                                value={option === "Any" ? "any" : option.replace("+", "")}
                            >
                                {option} {option !== "Any" ? "Bath" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Property Type */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="space-y-2">
                    {propertyTypes.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                            <Checkbox
                                id={type.value}
                                checked={filters.propertyType?.includes(type.value) || false}
                                onCheckedChange={() => handlePropertyTypeToggle(type.value)}
                            />
                            <label
                                htmlFor={type.value}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {type.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pet Policy */}
            <div className="space-y-3">
                <Label className="text-sm font-medium">Pet Policy</Label>
                <Select
                    value={filters.petPolicy || "any"}
                    onValueChange={(value) =>
                        onFilterChange({
                            ...filters,
                            petPolicy: value === "any" ? undefined : (value as PetPolicy),
                        })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        {petPolicies.map((policy) => (
                            <SelectItem key={policy.value} value={policy.value}>
                                {policy.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearFilters}
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <>
            {/* Search Bar (Always Visible) */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by location, property name..."
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {/* Mobile Filter Toggle */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            {filterContent}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Filter Sidebar */}
            <Card className="hidden lg:block sticky top-20">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        Filters
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-xs"
                            >
                                Clear
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filterContent}
                </CardContent>
            </Card>
        </>
    );
}
