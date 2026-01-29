"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavorite } from "@/actions/user-actions";
import { useUser } from "@clerk/nextjs";

interface FavoriteActionsProps {
  serviceId: string;
  isFavorited: boolean;
}

export default function FavoriteActions({
  serviceId,
  isFavorited: initialFavorited,
}: FavoriteActionsProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter");
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleFavorite(user.id, serviceId);

      if (result.action === "removed") {
        setIsFavorited(false);
        toast.success("Retiré des favoris");
        router.refresh();
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

  return (
    <Button
      variant={isFavorited ? "destructive" : "secondary"}
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className={isFavorited ? "bg-red-500 hover:bg-red-600" : "bg-white/90 hover:bg-white"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-white text-white" : "text-gray-600"}`} />
      )}
    </Button>
  );
}
