"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  Settings,
  Menu,
  X,
  Sparkles,
  Briefcase,
  Plus,
  Award,
  User as UserIcon,
  TrendingUp,
  Store,
  ShoppingBag,
  Heart,
  Package,
  BarChart3,
  FileText,
  CreditCard,
} from "lucide-react";

const clientNavigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard/client",
    icon: BarChart3,
  },
  {
    name: "Mes réservations",
    href: "/dashboard/client/bookings",
    icon: ShoppingBag,
  },
  {
    name: "Favoris",
    href: "/dashboard/client/favorites",
    icon: Heart,
  },
  {
    name: "Parcourir les services",
    href: "/services",
    icon: Store,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const vendorNavigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard/vendor",
    icon: BarChart3,
  },
  {
    name: "Mes services",
    href: "/dashboard/vendor/services",
    icon: Package,
  },
  {
    name: "Réservations",
    href: "/dashboard/vendor/bookings",
    icon: ShoppingBag,
  },
  {
    name: "Mon profil",
    href: "/dashboard/vendor/profile",
    icon: UserIcon,
  },
  {
    name: "Revenus",
    href: "/dashboard/vendor/earnings",
    icon: CreditCard,
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"CLIENT" | "VENDOR" | null>(null);

  // Fetch user role
  useEffect(() => {
    if (user) {
      fetch("/api/user/role")
        .then((res) => res.json())
        .then((data) => setUserRole(data.role))
        .catch((err) => console.error("Failed to fetch user role:", err));
    }
  }, [user]);

  // Select navigation based on role
  const navigation = userRole === "VENDOR" ? vendorNavigation : clientNavigation;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-border transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <Link 
            href={userRole === "VENDOR" ? "/dashboard/vendor" : "/dashboard/client"}
            className="flex items-center gap-3 h-16 px-4 border-b border-border hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <span className="text-lg font-bold text-foreground">ENAA Orchidée</span>
              {userRole && (
                <div className="text-xs text-muted-foreground">
                  {userRole === "VENDOR" ? "Espace Prestataire" : "Espace Client"}
                </div>
              )}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="px-4 py-2 text-xs text-muted-foreground">
              © 2026 ENAA Orchidée
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
