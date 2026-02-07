import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/properties - List all available properties with optional filters
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // Build query with filters
        let query = supabase
            .from("properties")
            .select("*, profiles!properties_owner_id_fkey(name, avatar)")
            .order("created_at", { ascending: false });

        // Apply filters
        const city = searchParams.get("city");
        if (city) {
            query = query.ilike("address_city", `%${city}%`);
        }

        const minPrice = searchParams.get("minPrice");
        if (minPrice) {
            query = query.gte("price", parseFloat(minPrice));
        }

        const maxPrice = searchParams.get("maxPrice");
        if (maxPrice) {
            query = query.lte("price", parseFloat(maxPrice));
        }

        const bedrooms = searchParams.get("bedrooms");
        if (bedrooms) {
            query = query.gte("bedrooms", parseInt(bedrooms));
        }

        const bathrooms = searchParams.get("bathrooms");
        if (bathrooms) {
            query = query.gte("bathrooms", parseFloat(bathrooms));
        }

        const propertyType = searchParams.get("propertyType");
        if (propertyType) {
            query = query.eq("property_type", propertyType);
        }

        const petPolicy = searchParams.get("petPolicy");
        if (petPolicy) {
            query = query.eq("pet_policy", petPolicy);
        }

        const status = searchParams.get("status");
        if (status) {
            query = query.eq("status", status);
        } else {
            // By default, only show available properties for public listing
            query = query.eq("status", "available");
        }

        // Pagination
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching properties:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data to match frontend Property type
        const properties = data?.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            address: {
                street: p.address_street,
                city: p.address_city,
                state: p.address_state,
                zipCode: p.address_zip_code,
                latitude: p.address_latitude,
                longitude: p.address_longitude,
            },
            propertyType: p.property_type,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            squareFeet: p.square_feet,
            price: p.price,
            deposit: p.deposit,
            amenities: p.amenities || [],
            images: p.images || [],
            availableFrom: p.available_from,
            petPolicy: p.pet_policy,
            ownerId: p.owner_id,
            ownerName: p.profiles?.name,
            ownerAvatar: p.profiles?.avatar,
            status: p.status,
            createdAt: p.created_at,
        }));

        return NextResponse.json({
            properties,
            pagination: {
                page,
                limit,
                total: count,
            },
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/properties - Create a new property (landlords/property_managers only)
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

        if (!profile || profile.role === "tenant") {
            return NextResponse.json(
                { error: "Only landlords and property managers can create properties" },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            "title",
            "description",
            "address",
            "propertyType",
            "squareFeet",
            "price",
            "deposit",
            "availableFrom",
            "petPolicy",
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Insert property
        const { data, error } = await supabase
            .from("properties")
            .insert({
                title: body.title,
                description: body.description,
                address_street: body.address.street,
                address_city: body.address.city,
                address_state: body.address.state,
                address_zip_code: body.address.zipCode,
                address_latitude: body.address.latitude,
                address_longitude: body.address.longitude,
                property_type: body.propertyType,
                bedrooms: body.bedrooms || 0,
                bathrooms: body.bathrooms || 1,
                square_feet: body.squareFeet,
                price: body.price,
                deposit: body.deposit,
                amenities: body.amenities || [],
                images: body.images || [],
                available_from: body.availableFrom,
                pet_policy: body.petPolicy,
                owner_id: user.id,
                status: "available",
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating property:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ property: data }, { status: 201 });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
