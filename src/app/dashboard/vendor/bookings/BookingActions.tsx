"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateBookingItemStatus } from "@/actions/booking-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

interface BookingActionsProps {
  bookingItemId: string;
  currentStatus: string;
}

export default function BookingActions({
  bookingItemId,
  currentStatus,
}: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const result = await updateBookingItemStatus(bookingItemId, newStatus);

      if (result.success) {
        toast.success("Statut mis à jour", {
          description: `La réservation a été mise à jour avec succès.`,
        });
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de mettre à jour le statut.",
        });
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show actions for completed or cancelled bookings
  if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED" || currentStatus === "REFUNDED") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus === "PENDING" && (
          <>
            <DropdownMenuItem onClick={() => handleStatusChange("CONFIRMED")}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Confirmer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("CANCELLED")}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser
            </DropdownMenuItem>
          </>
        )}
        {currentStatus === "CONFIRMED" && (
          <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>
            <Loader2 className="h-4 w-4 mr-2 text-blue-600" />
            Marquer en cours
          </DropdownMenuItem>
        )}
        {currentStatus === "PAID" && (
          <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>
            <Loader2 className="h-4 w-4 mr-2 text-blue-600" />
            Démarrer la prestation
          </DropdownMenuItem>
        )}
        {currentStatus === "IN_PROGRESS" && (
          <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Marquer comme terminé
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
