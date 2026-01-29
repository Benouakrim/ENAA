"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CartItemActionsProps {
  itemId: string;
}

export function CartItemActions({ itemId }: CartItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      toast.success('Service retiré du panier');
      router.refresh();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleRemove}
      disabled={isLoading}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Retirer
        </>
      )}
    </Button>
  );
}
