"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
}

interface MessagesClientProps {
  conversationId: string;
  currentUserId: string;
  messages: Message[];
  otherUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    vendorProfile?: {
      companyName: string;
      logo: string | null;
    } | null;
  };
}

export default function MessagesClient({
  conversationId,
  currentUserId,
  messages: initialMessages,
  otherUser,
}: MessagesClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = otherUser.vendorProfile?.companyName ||
    `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() ||
    "Utilisateur";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
    }).format(new Date(date));
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatarUrl || otherUser.vendorProfile?.logo || ""} />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{displayName}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex items-center justify-center my-4">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {formatDate(new Date(date))}
              </span>
            </div>
            {dateMessages.map((message) => {
              const isOwn = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" disabled={isSending || !newMessage.trim()}>
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
