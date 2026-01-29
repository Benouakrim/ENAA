import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EventWizardNew from "@/components/EventWizardNew";
import { syncCurrentUser, getClerkUserData } from "@/lib/sync-clerk";

export default async function CreateEventPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Sync and get user data
  const user = await syncCurrentUser();
  const clerkData = await getClerkUserData();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Créer un événement
          </h1>
          <p className="text-muted-foreground">
            Complétez les étapes suivantes pour publier votre événement
          </p>
        </div>
        <EventWizardNew 
          userId={userId}
          initialUserData={{
            email: user?.email || clerkData?.email,
            firstName: user?.firstName || clerkData?.firstName,
            lastName: user?.lastName || clerkData?.lastName,
            phone: user?.phone || clerkData?.phone,
            country: user?.country || clerkData?.country,
            city: user?.city || undefined,
            birthday: user?.birthday,
          }}
        />
      </div>
    </div>
  );
}
