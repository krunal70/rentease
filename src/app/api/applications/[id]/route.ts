import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/applications/[id] - Get a specific application
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the application with related data
        const { data: application, error } = await supabase
            .from("applications")
            .select(
                `
                *,
                properties!applications_property_id_fkey(id, title, address_city, address_state, images, price, owner_id),
                profiles!applications_applicant_id_fkey(name, email, avatar)
            `
            )
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching application:", error);
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Check authorization: user must be the applicant or property owner
        const isApplicant = application.applicant_id === user.id;
        const isOwner = application.properties?.owner_id === user.id;

        if (!isApplicant && !isOwner) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        // Transform data
        const transformedApplication = {
            id: application.id,
            propertyId: application.property_id,
            applicantId: application.applicant_id,
            status: application.status,
            personalInfo: {
                fullName: application.personal_full_name,
                dateOfBirth: application.personal_date_of_birth,
                phoneNumber: application.personal_phone_number,
            },
            employment: {
                employer: application.employment_employer,
                position: application.employment_position,
                income: application.employment_income,
                duration: application.employment_duration,
            },
            rentalHistory: {
                currentAddress: application.rental_current_address,
                landlordName: application.rental_landlord_name,
                landlordPhone: application.rental_landlord_phone,
                monthlyRent: application.rental_monthly_rent,
                duration: application.rental_duration,
            },
            documents: application.documents || [],
            submittedAt: application.submitted_at,
            property: application.properties
                ? {
                    id: application.properties.id,
                    title: application.properties.title,
                    city: application.properties.address_city,
                    state: application.properties.address_state,
                    image: application.properties.images?.[0],
                    price: application.properties.price,
                }
                : null,
            applicant: application.profiles
                ? {
                    name: application.profiles.name,
                    email: application.profiles.email,
                    avatar: application.profiles.avatar,
                }
                : null,
        };

        return NextResponse.json({ application: transformedApplication });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/applications/[id] - Update application status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the application to check ownership
        const { data: application, error: fetchError } = await supabase
            .from("applications")
            .select(
                `
                *,
                properties!applications_property_id_fkey(owner_id)
            `
            )
            .eq("id", id)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Check if user is the property owner
        if (application.properties?.owner_id !== user.id) {
            return NextResponse.json(
                { error: "Only the property owner can update application status" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses = ["pending", "under_review", "approved", "rejected"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Update the application
        const { data: updatedApplication, error: updateError } = await supabase
            .from("applications")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating application:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // If approved, update property status to 'pending'
        if (status === "approved") {
            await supabase
                .from("properties")
                .update({ status: "pending" })
                .eq("id", application.property_id);
        }

        return NextResponse.json({ application: updatedApplication });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
