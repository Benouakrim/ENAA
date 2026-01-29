"use client";

import { UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";

interface DashboardTopBarProps {
  userName: string;
}

export default function DashboardTopBar({ userName }: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-white px-6">
      <div className="flex flex-1 items-center justify-between">
        {/* Left side - could add breadcrumbs or page title here */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 lg:hidden" /> {/* Spacer for mobile menu button */}
        </div>

        {/* Right side - User info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{userName}</span>
          </div>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
