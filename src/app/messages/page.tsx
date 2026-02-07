"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MessageSquare,
    Send,
    Search,
    MoreVertical,
    Phone,
    Video,
    ChevronLeft,
    Paperclip,
    Smile,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Participant {
    id: string;
    name: string;
    avatar?: string;
}

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
    read: boolean;
}

interface Conversation {
    id: string;
    propertyId?: string;
    property?: {
        id: string;
        title: string;
        image?: string;
    };
    participants: Participant[];
    lastMessage?: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
        read: boolean;
    };
    unreadCount: number;
    createdAt: string;
}

export default function MessagesPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Load conversations from API
    const fetchConversations = useCallback(async () => {
        try {
            const response = await fetch("/api/messages");
            if (!response.ok) {
                if (response.status === 401) return;
                throw new Error("Failed to load conversations");
            }
            const data = await response.json();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setIsLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchConversations();
        }
    }, [isAuthenticated, fetchConversations]);

    // Load messages when conversation is selected
    const fetchMessages = useCallback(async (conversationId: string) => {
        setIsLoadingMessages(true);
        try {
            const response = await fetch(`/api/messages/${conversationId}`);
            if (!response.ok) {
                throw new Error("Failed to load messages");
            }
            const data = await response.json();
            setMessages(data.messages || []);

            // Mark messages as read
            await fetch(`/api/messages/${conversationId}/read`, { method: "POST" });
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation, fetchMessages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Filter conversations by search
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            conv.participants.some((p) => p.name.toLowerCase().includes(query)) ||
            conv.property?.title.toLowerCase().includes(query)
        );
    });

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        setIsSending(true);
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content: newMessage.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, data.message]);
            setNewMessage("");

            // Update conversation's last message in the list
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedConversation.id
                        ? { ...c, lastMessage: data.message }
                        : c
                )
            );
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: string) => {
        const today = new Date();
        const messageDate = new Date(date);
        if (messageDate.toDateString() === today.toDateString()) {
            return "Today";
        }
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        return messageDate.toLocaleDateString();
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container py-8 px-4">
                    <Skeleton className="h-[600px] w-full" />
                </main>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-muted/30">
                <div className="container py-8 px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Messages</h1>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchConversations}
                            disabled={isLoadingConversations}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingConversations ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    <Card className="h-[600px] flex overflow-hidden">
                        {/* Conversations List */}
                        <div
                            className={`w-full md:w-80 border-r flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"
                                }`}
                        >
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {isLoadingConversations ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="flex-1">
                                                    <Skeleton className="h-4 w-24 mb-2" />
                                                    <Skeleton className="h-3 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No conversations yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Start by contacting a property owner
                                        </p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const otherParticipant = conv.participants[0];
                                        const isSelected = selectedConversation?.id === conv.id;
                                        const hasUnread = conv.unreadCount > 0;

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`w-full p-4 flex items-start gap-3 hover:bg-muted transition-colors text-left ${isSelected ? "bg-muted" : ""
                                                    }`}
                                            >
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={otherParticipant?.avatar} />
                                                    <AvatarFallback>
                                                        {otherParticipant?.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("") || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium truncate">
                                                            {otherParticipant?.name || "Unknown"}
                                                        </p>
                                                        {conv.lastMessage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(conv.lastMessage.createdAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.property && (
                                                        <p className="text-xs text-primary truncate">
                                                            {conv.property.title}
                                                        </p>
                                                    )}
                                                    {conv.lastMessage && (
                                                        <p
                                                            className={`text-sm truncate ${hasUnread
                                                                    ? "text-foreground font-medium"
                                                                    : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                                {hasUnread && (
                                                    <Badge variant="default" className="shrink-0">
                                                        {conv.unreadCount}
                                                    </Badge>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div
                            className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"
                                }`}
                        >
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="md:hidden"
                                                onClick={() => setSelectedConversation(null)}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Avatar>
                                                <AvatarImage
                                                    src={selectedConversation.participants[0]?.avatar}
                                                />
                                                <AvatarFallback>
                                                    {selectedConversation.participants[0]?.name
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("") || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {selectedConversation.participants[0]?.name || "Unknown"}
                                                </p>
                                                {selectedConversation.property && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Re: {selectedConversation.property.title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Video className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {isLoadingMessages ? (
                                            <div className="flex justify-center py-8">
                                                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center">
                                                <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                                                <p className="text-muted-foreground">No messages yet</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Send a message to start the conversation
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map((message, index) => {
                                                const isOwn = message.senderId === user.id;
                                                const showDate =
                                                    index === 0 ||
                                                    formatDate(message.createdAt) !==
                                                    formatDate(messages[index - 1].createdAt);

                                                return (
                                                    <div key={message.id}>
                                                        {showDate && (
                                                            <div className="flex justify-center my-4">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {formatDate(message.createdAt)}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`flex ${isOwn ? "justify-end" : "justify-start"
                                                                }`}
                                                        >
                                                            <div
                                                                className={`max-w-[70%] px-4 py-2 rounded-2xl ${isOwn
                                                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                                                        : "bg-muted rounded-bl-md"
                                                                    }`}
                                                            >
                                                                <p className="text-sm">{message.content}</p>
                                                                <p
                                                                    className={`text-xs mt-1 ${isOwn
                                                                            ? "text-primary-foreground/70"
                                                                            : "text-muted-foreground"
                                                                        }`}
                                                                >
                                                                    {formatTime(message.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-4 border-t">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                className="flex-1"
                                                disabled={isSending}
                                            />
                                            <Button variant="ghost" size="icon">
                                                <Smile className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() || isSending}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="p-4 rounded-full bg-muted mb-4">
                                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Your Messages</h3>
                                    <p className="text-muted-foreground mt-1 max-w-sm">
                                        Select a conversation to view messages, or start a new one by
                                        contacting a property owner.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
