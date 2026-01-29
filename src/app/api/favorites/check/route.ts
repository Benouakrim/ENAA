import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isFavorited: false });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID requis" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
