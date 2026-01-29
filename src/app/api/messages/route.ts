import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Conversation ID et contenu requis" },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à envoyer des messages dans cette conversation" },
        { status: 403 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
        type: "TEXT",
      },
    });

    // Update conversation's last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content.trim().substring(0, 100),
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID requis" },
        { status: 400 }
      );
    }

    // Verify user is part of this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir ces messages" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
}
