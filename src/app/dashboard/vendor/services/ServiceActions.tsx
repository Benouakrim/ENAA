"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteServiceListing, toggleServiceStatus } from "@/actions/service-listing-actions";
import { Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

interface ServiceActionsProps {
  serviceId: string;
  isActive: boolean;
}

export default function ServiceActions({ serviceId, isActive }: ServiceActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteServiceListing(serviceId);

      if (result.success) {
        toast.success("Service supprimé", {
          description: "Le service a été supprimé avec succès.",
        });
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de supprimer le service.",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);

    try {
      const result = await toggleServiceStatus(serviceId);

      if (result.success) {
        toast.success(isActive ? "Service désactivé" : "Service activé", {
          description: isActive 
            ? "Le service n'est plus visible par les clients."
            : "Le service est maintenant visible par les clients.",
        });
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de modifier le statut.",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isToggling}
      >
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <>
            <ToggleRight className="h-4 w-4 mr-2" />
            Désactiver
          </>
        ) : (
          <>
            <ToggleLeft className="h-4 w-4 mr-2" />
            Activer
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </>
        )}
      </Button>
    </>
  );
}
