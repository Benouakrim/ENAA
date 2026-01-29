"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

interface ContactVendorButtonProps {
  vendorUserId: string;
  serviceId?: string;
  className?: string;
}

export function ContactVendorButton({
  vendorUserId,
  serviceId,
  className,
}: ContactVendorButtonProps) {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    if (!isSignedIn) {
      toast.error("Veuillez vous connecter pour contacter ce prestataire");
      router.push("/sign-in");
      return;
    }

    if (user?.id === vendorUserId) {
      toast.error("Vous ne pouvez pas vous contacter vous-même");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: vendorUserId,
          serviceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();

      if (data.conversationId) {
        router.push(`/dashboard/messages/${data.conversationId}`);
      } else {
        router.push("/dashboard/messages");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erreur lors de la création de la conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleContact}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Contacter le prestataire
    </Button>
  );
}
