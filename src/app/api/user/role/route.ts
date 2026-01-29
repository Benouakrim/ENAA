import { ensureUserExists, updateUserRole } from "@/lib/sync-user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Ensure user exists in database and get their info
    const user = await ensureUserExists();

    if (!user) {
      return NextResponse.json({ role: null }, { status: 200 });
    }

    return NextResponse.json({ role: user.role || null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user role:", error);
    // Return a proper error response with more details
    return NextResponse.json(
      { 
        role: null, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !["CLIENT", "VENDOR"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const user = await updateUserRole(role);

    if (!user) {
      return NextResponse.json(
        { error: "User not found or not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, role: user.role }, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
