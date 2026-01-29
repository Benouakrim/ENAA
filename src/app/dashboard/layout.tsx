import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardTopBar from "@/components/DashboardTopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Get user's display name
  const userName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.emailAddresses[0]?.emailAddress || "Utilisateur";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <DashboardTopBar userName={userName} />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
