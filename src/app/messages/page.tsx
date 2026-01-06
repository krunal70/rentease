"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";
import {
    getConversationsByUserId,
    getMessagesByConversationId,
    getPropertyById,
    getUserById,
    mockMessages,
} from "@/data/mock";
import { Conversation, Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

export default function MessagesPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Load conversations
    const conversations = user ? getConversationsByUserId(user.id) : [];

    // Filter conversations by search
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const otherUserId = conv.participants.find((p) => p !== user?.id);
        const otherUser = otherUserId ? getUserById(otherUserId) : null;
        const property = conv.propertyId ? getPropertyById(conv.propertyId) : null;
        return (
            otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property?.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            const convMessages = getMessagesByConversationId(selectedConversation.id);
            setMessages(convMessages);
        }
    }, [selectedConversation]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const message: Message = {
            id: `msg-${Date.now()}`,
            conversationId: selectedConversation.id,
            senderId: user.id,
            content: newMessage.trim(),
            createdAt: new Date(),
            read: false,
        };

        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        toast.success("Message sent!");
    };

    const getOtherParticipant = (conversation: Conversation) => {
        const otherUserId = conversation.participants.find((p) => p !== user?.id);
        return otherUserId ? getUserById(otherUserId) : null;
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
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

    if (isLoading) {
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
                    <h1 className="text-3xl font-bold mb-6">Messages</h1>

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
                                {filteredConversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No conversations yet</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Start by contacting a property owner
                                        </p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const otherUser = getOtherParticipant(conv);
                                        const property = conv.propertyId
                                            ? getPropertyById(conv.propertyId)
                                            : null;
                                        const isSelected = selectedConversation?.id === conv.id;
                                        const hasUnread =
                                            conv.lastMessage && !conv.lastMessage.read && conv.lastMessage.senderId !== user.id;

                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`w-full p-4 flex items-start gap-3 hover:bg-muted transition-colors text-left ${isSelected ? "bg-muted" : ""
                                                    }`}
                                            >
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={otherUser?.avatar} />
                                                    <AvatarFallback>
                                                        {otherUser?.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium truncate">
                                                            {otherUser?.name}
                                                        </p>
                                                        {conv.lastMessage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(conv.lastMessage.createdAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {property && (
                                                        <p className="text-xs text-primary truncate">
                                                            {property.title}
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
                                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
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
                                                    src={getOtherParticipant(selectedConversation)?.avatar}
                                                />
                                                <AvatarFallback>
                                                    {getOtherParticipant(selectedConversation)
                                                        ?.name.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {getOtherParticipant(selectedConversation)?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedConversation.propertyId && (
                                                        <>
                                                            Re:{" "}
                                                            {getPropertyById(selectedConversation.propertyId)?.title}
                                                        </>
                                                    )}
                                                </p>
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
                                        {messages.map((message, index) => {
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
                                        })}
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
                                            />
                                            <Button variant="ghost" size="icon">
                                                <Smile className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
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
