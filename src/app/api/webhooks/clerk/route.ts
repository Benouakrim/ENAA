import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper to extract country from phone number
function getCountryFromPhone(phoneNumber: string): string | null {
  const countryMap: Record<string, string> = {
    '+33': 'France',
    '+212': 'Maroc',
    '+213': 'Algérie',
    '+216': 'Tunisie',
    '+1': 'USA/Canada',
    '+44': 'Royaume-Uni',
    '+32': 'Belgique',
    '+41': 'Suisse',
    '+34': 'Espagne',
    '+39': 'Italie',
    '+49': 'Allemagne',
  };
  
  for (const [code, country] of Object.entries(countryMap)) {
    if (phoneNumber.startsWith(code)) {
      return country;
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return new Response("Error occured -- no webhook secret", {
      status: 500,
    });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  switch (eventType) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name, phone_numbers, image_url } = evt.data;
      
      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address;
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id)?.phone_number;
      const phoneCountry = primaryPhone ? getCountryFromPhone(primaryPhone) : null;

      if (!primaryEmail) {
        console.error("No primary email found for user:", id);
        return new Response("No primary email", { status: 400 });
      }

      try {
        await prisma.user.create({
          data: {
            id: id,
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            country: phoneCountry,
            role: "CLIENT", // Default role
          },
        });
        console.log("User created in database:", id);
      } catch (error) {
        console.error("Error creating user in database:", error);
        // User might already exist, try to update instead
        await prisma.user.upsert({
          where: { id: id },
          create: {
            id: id,
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            country: phoneCountry,
          },
          update: {
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            ...(phoneCountry && { country: phoneCountry }),
          },
        });
      }
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name, phone_numbers, image_url } = evt.data;
      
      const primaryEmail = email_addresses?.find((e) => e.id === evt.data.primary_email_address_id)?.email_address;
      const primaryPhone = phone_numbers?.find((p) => p.id === evt.data.primary_phone_number_id)?.phone_number;
      const phoneCountry = primaryPhone ? getCountryFromPhone(primaryPhone) : null;

      if (!primaryEmail) {
        console.error("No primary email found for user:", id);
        return new Response("No primary email", { status: 400 });
      }

      try {
        await prisma.user.update({
          where: { id: id },
          data: {
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            ...(phoneCountry && { country: phoneCountry }),
          },
        });
        console.log("User updated in database:", id);
      } catch (error) {
        console.error("Error updating user in database:", error);
        // If user doesn't exist, create them
        await prisma.user.upsert({
          where: { id: id },
          create: {
            id: id,
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            country: phoneCountry,
          },
          update: {
            email: primaryEmail,
            firstName: first_name || null,
            lastName: last_name || null,
            phone: primaryPhone || null,
            avatarUrl: image_url || null,
            ...(phoneCountry && { country: phoneCountry }),
          },
        });
      }
      break;
    }

    case "user.deleted": {
      const { id } = evt.data;
      
      if (!id) {
        console.error("No user ID in delete event");
        return new Response("No user ID", { status: 400 });
      }

      try {
        await prisma.user.delete({
          where: { id: id },
        });
        console.log("User deleted from database:", id);
      } catch (error) {
        console.error("Error deleting user from database:", error);
        // User might not exist, that's okay
      }
      break;
    }

    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ message: "Clerk webhook endpoint" });
}
