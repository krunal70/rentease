import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/messages - List user's conversations with last message
export async function GET() {
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get conversations where user is a participant
        const { data: participations } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", user.id);

        if (!participations || participations.length === 0) {
            return NextResponse.json({ conversations: [] });
        }

        const conversationIds = participations.map((p) => p.conversation_id);

        // Get conversations with participants and last message
        const { data: conversations, error } = await supabase
            .from("conversations")
            .select(
                `
                id,
                property_id,
                created_at,
                properties(id, title, images),
                conversation_participants(user_id, profiles(id, name, avatar))
            `
            )
            .in("id", conversationIds)
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching conversations:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get last message for each conversation
        const conversationsWithMessages = await Promise.all(
            (conversations || []).map(async (conv) => {
                const { data: lastMessage } = await supabase
                    .from("messages")
                    .select("id, content, sender_id, created_at, read")
                    .eq("conversation_id", conv.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                // Get unread count
                const { count: unreadCount } = await supabase
                    .from("messages")
                    .select("*", { count: "exact", head: true })
                    .eq("conversation_id", conv.id)
                    .eq("read", false)
                    .neq("sender_id", user.id);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const property = conv.properties as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const participants = conv.conversation_participants as any[];

                return {
                    id: conv.id,
                    propertyId: conv.property_id,
                    property: property
                        ? {
                            id: property.id,
                            title: property.title,
                            image: property.images?.[0],
                        }
                        : null,
                    participants: participants
                        ?.map((p) => ({
                            id: p.profiles?.id,
                            name: p.profiles?.name,
                            avatar: p.profiles?.avatar,
                        }))
                        .filter((p) => p.id !== user.id),
                    lastMessage: lastMessage
                        ? {
                            id: lastMessage.id,
                            content: lastMessage.content,
                            senderId: lastMessage.sender_id,
                            createdAt: lastMessage.created_at,
                            read: lastMessage.read,
                        }
                        : null,
                    unreadCount: unreadCount || 0,
                    createdAt: conv.created_at,
                };
            })
        );

        return NextResponse.json({ conversations: conversationsWithMessages });
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/messages - Send a new message or create a conversation
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

        const body = await request.json();

        if (!body.content?.trim()) {
            return NextResponse.json(
                { error: "Message content is required" },
                { status: 400 }
            );
        }

        let conversationId = body.conversationId;

        // If no conversation exists, create one
        if (!conversationId && body.recipientId) {
            // Check if conversation already exists between these users
            const { data: existingConvs } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("user_id", user.id);

            const existingConvIds = existingConvs?.map((c) => c.conversation_id) || [];

            if (existingConvIds.length > 0) {
                const { data: recipientConvs } = await supabase
                    .from("conversation_participants")
                    .select("conversation_id")
                    .eq("user_id", body.recipientId)
                    .in("conversation_id", existingConvIds);

                if (recipientConvs && recipientConvs.length > 0) {
                    conversationId = recipientConvs[0].conversation_id;
                }
            }

            // Create new conversation if none exists
            if (!conversationId) {
                const { data: newConv, error: convError } = await supabase
                    .from("conversations")
                    .insert({ property_id: body.propertyId || null })
                    .select()
                    .single();

                if (convError) {
                    console.error("Error creating conversation:", convError);
                    return NextResponse.json(
                        { error: convError.message },
                        { status: 500 }
                    );
                }

                conversationId = newConv.id;

                // Add participants
                await supabase.from("conversation_participants").insert([
                    { conversation_id: conversationId, user_id: user.id },
                    { conversation_id: conversationId, user_id: body.recipientId },
                ]);
            }
        }

        if (!conversationId) {
            return NextResponse.json(
                { error: "Conversation ID or recipient ID is required" },
                { status: 400 }
            );
        }

        // Send message
        const { data: message, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content: body.content,
                attachments: body.attachments || [],
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update conversation updated_at
        await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);

        return NextResponse.json({
            message: {
                id: message.id,
                conversationId: message.conversation_id,
                senderId: message.sender_id,
                content: message.content,
                attachments: message.attachments,
                createdAt: message.created_at,
                read: message.read,
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
