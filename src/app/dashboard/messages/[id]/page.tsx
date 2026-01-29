import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MessagesClient from "../MessagesClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      user1: {
        include: {
          vendorProfile: true,
        },
      },
      user2: {
        include: {
          vendorProfile: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  // Verify user is part of this conversation
  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    redirect("/dashboard/messages");
  }

  // Get the other user
  const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  // Get all conversations for the sidebar
  const allConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        include: {
          vendorProfile: true,
        },
      },
      user2: {
        include: {
          vendorProfile: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  const conversationsWithMeta = await Promise.all(
    allConversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          read: false,
        },
      });
      const other = conv.user1Id === userId ? conv.user2 : conv.user1;
      return { ...conv, unreadCount, otherUser: other };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/messages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1 hidden lg:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[550px] overflow-y-auto">
              {conversationsWithMeta.map((conv) => {
                const displayName = conv.otherUser.vendorProfile?.companyName ||
                  `${conv.otherUser.firstName || ""} ${conv.otherUser.lastName || ""}`.trim() ||
                  "Utilisateur";
                const lastMessage = conv.messages[0];
                const isActive = conv.id === id;

                return (
                  <Link
                    key={conv.id}
                    href={`/dashboard/messages/${conv.id}`}
                    className={`block p-4 hover:bg-muted/50 transition-colors ${
                      isActive ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={conv.otherUser.avatarUrl || conv.otherUser.vendorProfile?.logo || ""}
                        />
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">
                            {displayName}
                          </p>
                          {conv.unreadCount > 0 && conv.id !== id && (
                            <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                        {conv.lastMessageAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Message Area */}
        <Card className="lg:col-span-2">
          <MessagesClient
            conversationId={id}
            currentUserId={userId}
            messages={conversation.messages.map((m) => ({
              id: m.id,
              content: m.content,
              senderId: m.senderId,
              createdAt: m.createdAt,
              read: m.read,
            }))}
            otherUser={{
              id: otherUser.id,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
              avatarUrl: otherUser.avatarUrl,
              vendorProfile: otherUser.vendorProfile
                ? {
                    companyName: otherUser.vendorProfile.companyName,
                    logo: otherUser.vendorProfile.logo,
                  }
                : null,
            }}
          />
        </Card>
      </div>
    </div>
  );
}
