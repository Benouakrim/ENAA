import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import ConversationRedirect from "./ConversationRedirect";

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

export default async function MessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Get all conversations for this user
  const conversations = await prisma.conversation.findMany({
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

  // Calculate unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          read: false,
        },
      });

      // Get the other user
      const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;

      return {
        ...conv,
        unreadCount,
        otherUser,
      };
    })
  );

  const totalUnread = conversationsWithUnread.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Handle vendor query param redirect */}
      <ConversationRedirect />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communiquez avec vos clients et prestataires
          </p>
        </div>
        {totalUnread > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Messages Content */}
      {conversations.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aucune conversation
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Vous n&apos;avez pas encore de conversations. Elles apparaîtront ici lorsque vous échangerez avec des {user.role === "VENDOR" ? "clients" : "prestataires"}.
            </p>
            <Button asChild>
              <Link href={user.role === "VENDOR" ? "/dashboard/vendor" : "/services"}>
                {user.role === "VENDOR" ? "Voir mes réservations" : "Parcourir les services"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {conversationsWithUnread.map((conv) => {
                  const displayName = conv.otherUser.vendorProfile?.companyName ||
                    `${conv.otherUser.firstName || ""} ${conv.otherUser.lastName || ""}`.trim() ||
                    "Utilisateur";
                  const lastMessage = conv.messages[0];

                  return (
                    <Link
                      key={conv.id}
                      href={`/dashboard/messages/${conv.id}`}
                      className="block p-4 hover:bg-muted/50 transition-colors"
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
                            {conv.unreadCount > 0 && (
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

          {/* Message Area Placeholder */}
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez une conversation pour voir les messages
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
