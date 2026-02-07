import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profile - Get current user's profile
export async function GET() {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            profile: {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                phone: profile.phone,
                avatar: profile.avatar,
                createdAt: profile.created_at,
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

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const updateData: Record<string, unknown> = {};
        if (body.name) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.avatar !== undefined) updateData.avatar = body.avatar;

        const { data: profile, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            console.error("Error updating profile:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            profile: {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                phone: profile.phone,
                avatar: profile.avatar,
                createdAt: profile.created_at,
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
