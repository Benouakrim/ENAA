"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Sparkles,
  ShoppingCart,
  Search,
  Calendar,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserRole {
  role: "CLIENT" | "VENDOR" | null;
}

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole["role"]>(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch user data when user changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!user) {
        if (isMounted) {
          setUserRole(null);
          setCartCount(0);
        }
        return;
      }
      
      try {
        const [roleRes, cartRes] = await Promise.all([
          fetch("/api/user/role"),
          fetch("/api/cart/count")
        ]);
        
        if (!isMounted) return;
        
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          setUserRole(roleData.role);
        }
        
        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartCount(cartData.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Don't show navbar on dashboard pages (they have their own sidebar)
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-foreground">ENAA Orchidée</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/services" 
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === "/services" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
              )}
            >
              Tous les services
            </Link>
            <Link 
              href="/services?featured=true" 
              className={cn(
                "text-sm font-medium transition-colors flex items-center gap-1",
                pathname.includes("featured") ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
              )}
            >
              <Sparkles className="h-4 w-4" />
              Coups de cœur
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-8">
            <form action="/services" method="get" className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q"
                placeholder="Rechercher un service..." 
                className="pl-9 pr-4"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-md transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoaded && user ? (
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">
                    {userRole === "VENDOR" ? "Espace vendeur" : "Mon espace"}
                  </Link>
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            ) : isLoaded ? (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Se connecter</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link href="/sign-up">S&apos;inscrire</Link>
                </Button>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form action="/services" method="get" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q"
                placeholder="Rechercher..." 
                className="pl-9"
              />
            </form>
            
            <div className="space-y-2">
              <Link
                href="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-purple-50"
              >
                Tous les services
              </Link>
              <Link
                href="/services?featured=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4" />
                Coups de cœur
              </Link>
              
              {!user && (
                <>
                  <Link
                    href="/onboarding/vendor"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-purple-50"
                  >
                    <Award className="h-4 w-4" />
                    Devenir prestataire
                  </Link>
                  <div className="pt-2 space-y-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                        Se connecter
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                        S&apos;inscrire
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
