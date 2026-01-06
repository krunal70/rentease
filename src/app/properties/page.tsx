"use client";

import { useState, useMemo } from "react";
import { Header, Footer } from "@/components/layout";
import { PropertyCard, SearchFilters } from "@/components/properties";
import { mockProperties } from "@/data/mock";
import { PropertyFilters, Property } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Building } from "lucide-react";

export default function PropertiesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [isLoading, setIsLoading] = useState(false);

    // Filter properties based on search and filters
    const filteredProperties = useMemo(() => {
        let results = [...mockProperties];

        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.address.city.toLowerCase().includes(query) ||
                    p.address.state.toLowerCase().includes(query) ||
                    p.address.street.toLowerCase().includes(query)
            );
        }

        // Price filter
        if (filters.minPrice !== undefined) {
            results = results.filter((p) => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            results = results.filter((p) => p.price <= filters.maxPrice!);
        }

        // Bedrooms filter
        if (filters.bedrooms !== undefined) {
            results = results.filter((p) => p.bedrooms >= filters.bedrooms!);
        }

        // Bathrooms filter
        if (filters.bathrooms !== undefined) {
            results = results.filter((p) => p.bathrooms >= filters.bathrooms!);
        }

        // Property type filter
        if (filters.propertyType && filters.propertyType.length > 0) {
            results = results.filter((p) => filters.propertyType!.includes(p.propertyType));
        }

        // Pet policy filter
        if (filters.petPolicy) {
            results = results.filter((p) => p.petPolicy === filters.petPolicy);
        }

        return results;
    }, [searchQuery, filters]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Browse Properties</h1>
                        <p className="text-muted-foreground mt-1">
                            {filteredProperties.length} properties available
                        </p>
                    </div>

                    {/* Search Bar (always visible) */}
                    <div className="lg:hidden">
                        <SearchFilters
                            filters={filters}
                            onFilterChange={setFilters}
                            onSearch={setSearchQuery}
                            searchQuery={searchQuery}
                        />
                    </div>

                    <div className="flex gap-8">
                        {/* Desktop Sidebar Filters */}
                        <aside className="hidden lg:block w-72 shrink-0">
                            <SearchFilters
                                filters={filters}
                                onFilterChange={setFilters}
                                onSearch={setSearchQuery}
                                searchQuery={searchQuery}
                            />
                        </aside>

                        {/* Properties Grid */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="space-y-3">
                                            <Skeleton className="aspect-[4/3] rounded-lg" />
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredProperties.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredProperties.map((property) => (
                                        <PropertyCard key={property.id} property={property} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="p-4 rounded-full bg-muted mb-4">
                                        <Building className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">No properties found</h3>
                                    <p className="text-muted-foreground mt-1 max-w-md">
                                        Try adjusting your search or filters to find more properties.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
