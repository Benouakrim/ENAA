"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ConversationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendor");
  const [isLoading, setIsLoading] = useState(!!vendorId);

  useEffect(() => {
    if (vendorId) {
      startConversation(vendorId);
    }
  }, [vendorId]);

  const startConversation = async (recipientId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      
      if (data.conversationId) {
        router.replace(`/dashboard/messages/${data.conversationId}`);
      } else {
        setIsLoading(false);
        router.replace("/dashboard/messages");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erreur lors de la création de la conversation");
      setIsLoading(false);
      router.replace("/dashboard/messages");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Chargement de la conversation...</span>
      </div>
    );
  }

  return null;
}
