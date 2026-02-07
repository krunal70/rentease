import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/properties/[id] - Get a single property
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("properties")
            .select("*, profiles!properties_owner_id_fkey(name, email, phone, avatar)")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Property not found" },
                    { status: 404 }
                );
            }
            console.error("Error fetching property:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform to match frontend type
        const property = {
            id: data.id,
            title: data.title,
            description: data.description,
            address: {
                street: data.address_street,
                city: data.address_city,
                state: data.address_state,
                zipCode: data.address_zip_code,
                latitude: data.address_latitude,
                longitude: data.address_longitude,
            },
            propertyType: data.property_type,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            squareFeet: data.square_feet,
            price: data.price,
            deposit: data.deposit,
            amenities: data.amenities || [],
            images: data.images || [],
            availableFrom: data.available_from,
            petPolicy: data.pet_policy,
            ownerId: data.owner_id,
            owner: data.profiles
                ? {
                    name: data.profiles.name,
                    email: data.profiles.email,
                    phone: data.profiles.phone,
                    avatar: data.profiles.avatar,
                }
                : null,
            status: data.status,
            createdAt: data.created_at,
        };

        return NextResponse.json({ property });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/properties/[id] - Update a property (owner only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check ownership
        const { data: existingProperty } = await supabase
            .from("properties")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!existingProperty) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (existingProperty.owner_id !== user.id) {
            return NextResponse.json(
                { error: "You can only update your own properties" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Build update object
        const updateData: Record<string, unknown> = {};

        if (body.title) updateData.title = body.title;
        if (body.description) updateData.description = body.description;
        if (body.address) {
            if (body.address.street) updateData.address_street = body.address.street;
            if (body.address.city) updateData.address_city = body.address.city;
            if (body.address.state) updateData.address_state = body.address.state;
            if (body.address.zipCode) updateData.address_zip_code = body.address.zipCode;
            if (body.address.latitude !== undefined)
                updateData.address_latitude = body.address.latitude;
            if (body.address.longitude !== undefined)
                updateData.address_longitude = body.address.longitude;
        }
        if (body.propertyType) updateData.property_type = body.propertyType;
        if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms;
        if (body.bathrooms !== undefined) updateData.bathrooms = body.bathrooms;
        if (body.squareFeet) updateData.square_feet = body.squareFeet;
        if (body.price) updateData.price = body.price;
        if (body.deposit) updateData.deposit = body.deposit;
        if (body.amenities) updateData.amenities = body.amenities;
        if (body.images) updateData.images = body.images;
        if (body.availableFrom) updateData.available_from = body.availableFrom;
        if (body.petPolicy) updateData.pet_policy = body.petPolicy;
        if (body.status) updateData.status = body.status;

        const { data, error } = await supabase
            .from("properties")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating property:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ property: data });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/properties/[id] - Delete a property (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check ownership
        const { data: existingProperty } = await supabase
            .from("properties")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!existingProperty) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            );
        }

        if (existingProperty.owner_id !== user.id) {
            return NextResponse.json(
                { error: "You can only delete your own properties" },
                { status: 403 }
            );
        }

        const { error } = await supabase.from("properties").delete().eq("id", id);

        if (error) {
            console.error("Error deleting property:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
