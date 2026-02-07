import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/messages/[id] - Get messages for a specific conversation
export async function GET(
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
                { error: "Not authorized to view this conversation" },
                { status: 403 }
            );
        }

        // Fetch messages
        const { data: messages, error } = await supabase
            .from("messages")
            .select(
                `
                id,
                conversation_id,
                sender_id,
                content,
                attachments,
                read,
                created_at,
                profiles!messages_sender_id_fkey(name, avatar)
            `
            )
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const transformedMessages = messages?.map((msg) => ({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            content: msg.content,
            attachments: msg.attachments || [],
            read: msg.read,
            createdAt: msg.created_at,
            sender: msg.profiles
                ? {
                    name: (msg.profiles as any).name,
                    avatar: (msg.profiles as any).avatar,
                }
                : null,
        }));

        return NextResponse.json({ messages: transformedMessages });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
