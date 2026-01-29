"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  serviceId: string;
  userId: string | null;
}

export function AddToCartButton({ serviceId, userId }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  async function handleAddToCart() {
    if (!userId) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      setIsAdded(true);
      toast.success('Service ajouté au panier !');
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      size="lg"
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Ajout en cours...
        </>
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Ajouté au panier
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ajouter au panier
        </>
      )}
    </Button>
  );
}
