"use client";

import { useState, useEffect, useCallback } from "react";
import { Application } from "@/types";

interface UseApplicationsResult {
    applications: Application[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

interface ApiResponse {
    applications: Application[];
}

export function useApplications(): UseApplicationsResult {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/applications");

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated
                    setApplications([]);
                    return;
                }
                throw new Error(`Failed to fetch applications: ${response.statusText}`);
            }

            const data: ApiResponse = await response.json();
            setApplications(data.applications || []);
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch applications");
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return {
        applications,
        isLoading,
        error,
        refetch: fetchApplications,
    };
}
