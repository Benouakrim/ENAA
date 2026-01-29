import { Badge } from "@/components/ui/badge";

type Status = "OPEN" | "BOOKED" | "PENDING" | "ACCEPTED" | "REJECTED" | "DRAFT" | "IN_PROGRESS" | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  OPEN: {
    label: "Ouvert",
    className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
  },
  BOOKED: {
    label: "Réservé",
    className: "bg-green-600 hover:bg-green-700 text-white border-green-700",
  },
  PENDING: {
    label: "En attente",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600",
  },
  ACCEPTED: {
    label: "Acceptée",
    className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700",
  },
  REJECTED: {
    label: "Refusée",
    className: "bg-red-600 hover:bg-red-700 text-white border-red-700",
  },
  DRAFT: {
    label: "Brouillon",
    className: "bg-gray-400 hover:bg-gray-500 text-white border-gray-500",
  },
  IN_PROGRESS: {
    label: "En cours",
    className: "bg-purple-600 hover:bg-purple-700 text-white border-purple-700",
  },
  CANCELLED: {
    label: "Annulé",
    className: "bg-orange-600 hover:bg-orange-700 text-white border-orange-700",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}
