import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/applications - List applications
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile to check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const { searchParams } = new URL(request.url);
        let query = supabase
            .from("applications")
            .select(
                `
                *,
                properties!applications_property_id_fkey(id, title, address_city, address_state, images, price),
                profiles!applications_applicant_id_fkey(name, email, avatar)
            `
            )
            .order("submitted_at", { ascending: false });

        // Filter based on role
        if (profile?.role === "tenant") {
            // Tenants see their own applications
            query = query.eq("applicant_id", user.id);
        } else {
            // Landlords/managers see applications for their properties
            // First get properties owned by this user
            const { data: ownedProperties } = await supabase
                .from("properties")
                .select("id")
                .eq("owner_id", user.id);

            if (ownedProperties && ownedProperties.length > 0) {
                const propertyIds = ownedProperties.map((p) => p.id);
                query = query.in("property_id", propertyIds);
            } else {
                // No properties, return empty
                return NextResponse.json({ applications: [] });
            }
        }

        // Filter by status
        const status = searchParams.get("status");
        if (status) {
            query = query.eq("status", status);
        }

        // Filter by property
        const propertyId = searchParams.get("propertyId");
        if (propertyId) {
            query = query.eq("property_id", propertyId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching applications:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data to match frontend type
        const applications = data?.map((app) => ({
            id: app.id,
            propertyId: app.property_id,
            applicantId: app.applicant_id,
            status: app.status,
            personalInfo: {
                fullName: app.personal_full_name,
                dateOfBirth: app.personal_date_of_birth,
                phoneNumber: app.personal_phone_number,
            },
            employment: {
                employer: app.employment_employer,
                position: app.employment_position,
                income: app.employment_income,
                duration: app.employment_duration,
            },
            rentalHistory: {
                currentAddress: app.rental_current_address,
                landlordName: app.rental_landlord_name,
                landlordPhone: app.rental_landlord_phone,
                monthlyRent: app.rental_monthly_rent,
                duration: app.rental_duration,
            },
            documents: app.documents || [],
            submittedAt: app.submitted_at,
            property: app.properties
                ? {
                    id: app.properties.id,
                    title: app.properties.title,
                    city: app.properties.address_city,
                    state: app.properties.address_state,
                    image: app.properties.images?.[0],
                    price: app.properties.price,
                }
                : null,
            applicant: app.profiles
                ? {
                    name: app.profiles.name,
                    email: app.profiles.email,
                    avatar: app.profiles.avatar,
                }
                : null,
        }));

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/applications - Create a new application (tenants only)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check user role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "tenant") {
            return NextResponse.json(
                { error: "Only tenants can submit applications" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate property exists
        const { data: property } = await supabase
            .from("properties")
            .select("id, status")
            .eq("id", body.propertyId)
            .single();

        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (property.status !== "available") {
            return NextResponse.json(
                { error: "This property is no longer available" },
                { status: 400 }
            );
        }

        // Check for existing application
        const { data: existingApp } = await supabase
            .from("applications")
            .select("id")
            .eq("property_id", body.propertyId)
            .eq("applicant_id", user.id)
            .single();

        if (existingApp) {
            return NextResponse.json(
                { error: "You have already applied for this property" },
                { status: 400 }
            );
        }

        // Insert application
        const { data, error } = await supabase
            .from("applications")
            .insert({
                property_id: body.propertyId,
                applicant_id: user.id,
                status: "pending",
                personal_full_name: body.personalInfo.fullName,
                personal_date_of_birth: body.personalInfo.dateOfBirth,
                personal_phone_number: body.personalInfo.phoneNumber,
                personal_ssn: body.personalInfo.ssn,
                employment_employer: body.employment.employer,
                employment_position: body.employment.position,
                employment_income: body.employment.income,
                employment_duration: body.employment.duration,
                rental_current_address: body.rentalHistory.currentAddress,
                rental_landlord_name: body.rentalHistory.landlordName,
                rental_landlord_phone: body.rentalHistory.landlordPhone,
                rental_monthly_rent: body.rentalHistory.monthlyRent,
                rental_duration: body.rentalHistory.duration,
                documents: body.documents || [],
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating application:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ application: data }, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
