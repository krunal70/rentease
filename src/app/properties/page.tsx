"use client";

import { useState, useMemo } from "react";
import { Header, Footer } from "@/components/layout";
import { PropertyCard, SearchFilters } from "@/components/properties";
import { useProperties } from "@/hooks";
import { PropertyFilters, Property } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, AlertCircle } from "lucide-react";

export default function PropertiesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<PropertyFilters>({});

    // Fetch properties from API with filters
    const { properties, isLoading, error } = useProperties(filters);

    // Client-side search filtering (API handles price/beds/baths/type filters)
    const filteredProperties = useMemo(() => {
        if (!searchQuery) return properties;

        const query = searchQuery.toLowerCase();
        return properties.filter(
            (p) =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.address.city.toLowerCase().includes(query) ||
                p.address.state.toLowerCase().includes(query) ||
                p.address.street.toLowerCase().includes(query)
        );
    }, [searchQuery, properties]);

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
