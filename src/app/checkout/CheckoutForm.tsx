"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface CheckoutFormProps {
  cartId: string;
  total: number;
}

export function CheckoutForm({ cartId, total }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions générales");
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId,
          eventDate: formData.get('eventDate'),
          eventType: formData.get('eventType'),
          eventAddress: formData.get('eventAddress'),
          notes: formData.get('notes'),
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const data = await response.json();

      // If we have a Stripe checkout URL, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Otherwise, go to confirmation page
        router.push(`/checkout/success?bookingId=${data.bookingId}`);
      }
    } catch {
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      setIsLoading(false);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Terms & Conditions */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Checkbox 
          id="terms" 
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
            J&apos;accepte les conditions générales de vente
          </Label>
          <p className="text-xs text-muted-foreground">
            En cliquant sur ce bouton, vous acceptez nos{" "}
            <a href="/legal/terms" className="text-primary hover:underline">CGV</a>,{" "}
            notre{" "}
            <a href="/legal/privacy" className="text-primary hover:underline">politique de confidentialité</a>{" "}
            et nos conditions d&apos;annulation.
          </p>
        </div>
      </div>

      <Button 
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        size="lg"
        disabled={isLoading || !acceptTerms}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Payer {formatPrice(total)}
            <ArrowRight className="h-5 w-5 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
