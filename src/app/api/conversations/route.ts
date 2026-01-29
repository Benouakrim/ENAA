import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST - Create a new conversation or get existing one
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, serviceId, message } = body;

    if (!recipientId) {
      return NextResponse.json(
        { error: "ID du destinataire requis" },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Destinataire introuvable" },
        { status: 404 }
      );
    }

    // Check if conversation already exists (in either direction)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: userId },
        ],
      },
    });

    // Create conversation if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: recipientId,
          serviceId: serviceId || null,
        },
      });
    }

    // If initial message provided, create it
    if (message && message.trim()) {
      const newMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: message.trim(),
          type: "TEXT",
        },
      });

      // Update conversation's last message
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: message.trim().substring(0, 100),
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
