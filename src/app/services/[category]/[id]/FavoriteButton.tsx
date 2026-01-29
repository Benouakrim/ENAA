"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavorite } from "@/actions/user-actions";

interface FavoriteButtonProps {
  serviceId: string;
  userId: string | null;
}

export function FavoriteButton({ serviceId, userId }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (userId) {
      checkFavoriteStatus();
    } else {
      setIsChecking(false);
    }
  }, [userId, serviceId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?serviceId=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async () => {
    if (!userId) {
      toast.error("Veuillez vous connecter pour ajouter aux favoris");
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleFavorite(userId, serviceId);

      if (result.action === "removed") {
        setIsFavorited(false);
        toast.success("Retiré des favoris");
      } else {
        setIsFavorited(true);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={isFavorited ? "text-red-500 hover:text-red-600" : ""}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500" : ""}`} />
      )}
    </Button>
  );
}
