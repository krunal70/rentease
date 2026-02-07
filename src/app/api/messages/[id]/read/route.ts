import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/messages/[id]/read - Mark all messages in conversation as read
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id: conversationId } = await params;

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is a participant
        const { data: participation } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("conversation_id", conversationId)
            .eq("user_id", user.id)
            .single();

        if (!participation) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 403 }
            );
        }

        // Mark all messages from other users as read
        const { error } = await supabase
            .from("messages")
            .update({ read: true })
            .eq("conversation_id", conversationId)
            .neq("sender_id", user.id)
            .eq("read", false);

        if (error) {
            console.error("Error marking messages as read:", error);
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
