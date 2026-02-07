"use client";

import { useState, useEffect, useCallback } from "react";
import { Property, PropertyFilters } from "@/types";

interface UsePropertiesResult {
    properties: Property[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface ApiResponse {
    properties: Property[];
    pagination: {
        page: number;
        limit: number;
        total: number | null;
    };
}

export function useProperties(filters?: PropertyFilters): UsePropertiesResult {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query string from filters
            const params = new URLSearchParams();

            if (filters?.minPrice) {
                params.set("minPrice", filters.minPrice.toString());
            }
            if (filters?.maxPrice) {
                params.set("maxPrice", filters.maxPrice.toString());
            }
            if (filters?.bedrooms) {
                params.set("bedrooms", filters.bedrooms.toString());
            }
            if (filters?.bathrooms) {
                params.set("bathrooms", filters.bathrooms.toString());
            }
            if (filters?.propertyType && filters.propertyType.length > 0) {
                params.set("propertyType", filters.propertyType[0]);
            }
            if (filters?.petPolicy) {
                params.set("petPolicy", filters.petPolicy);
            }
            if (filters?.city) {
                params.set("city", filters.city);
            }

            const queryString = params.toString();
            const url = `/api/properties${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch properties: ${response.statusText}`);
            }

            const data: ApiResponse = await response.json();
            setProperties(data.properties || []);
        } catch (err) {
            console.error("Error fetching properties:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch properties");
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters?.minPrice, filters?.maxPrice, filters?.bedrooms, filters?.bathrooms, filters?.propertyType, filters?.petPolicy, filters?.city]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    return {
        properties,
        isLoading,
        error,
        refetch: fetchProperties,
    };
}

interface UsePropertyResult {
    property: Property | null;
    isLoading: boolean;
    error: string | null;
}

export function useProperty(id: string): UsePropertyResult {
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProperty() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/properties/${id}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch property: ${response.statusText}`);
                }

                const data = await response.json();
                setProperty(data.property);
            } catch (err) {
                console.error("Error fetching property:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch property");
                setProperty(null);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchProperty();
        }
    }, [id]);

    return {
        property,
        isLoading,
        error,
    };
}
