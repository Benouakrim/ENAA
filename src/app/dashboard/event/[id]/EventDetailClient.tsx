"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { acceptProposal } from "@/actions/event-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate as formatDateHelper } from "@/lib/format";
import {
  Calendar,
  MapPin,
  Users,
  Euro,
  Sparkles,
  Heart,
  Cake,
  Briefcase,
  Wine,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  Award,
  Loader2,
} from "lucide-react";

interface EventDetailClientProps {
  event: any;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const router = useRouter();
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);

  // Helper to get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "Mariage":
        return Heart;
      case "Anniversaire":
        return Cake;
      case "Corporatif":
        return Briefcase;
      case "Soirée Privée":
        return Wine;
      default:
        return Sparkles;
    }
  };

  const EventIcon = getEventTypeIcon(event.type);

  // Check if event is already booked
  const isBooked = event.status === "BOOKED";
  const acceptedProposal = event.proposals?.find((p: any) => p.status === "ACCEPTED");

  // Handle accept proposal
  const handleAcceptProposal = async (proposalId: string) => {
    setAcceptingProposalId(proposalId);
    try {
      const result = await acceptProposal(proposalId, event.id);

      if (result.success) {
        toast.success("Proposition acceptée !", {
          description: "Le prestataire a été confirmé pour votre événement.",
        });
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible d'accepter la proposition.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      toast.error("Erreur", {
        description: "Une erreur inattendue est survenue.",
      });
    } finally {
      setAcceptingProposalId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/client")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>

        {/* Event Details Section */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <EventIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl">{event.type}</CardTitle>
                <CardDescription className="text-base mt-1">
                  <StatusBadge status={event.status as any} />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date de l&apos;événement</p>
                  <p className="font-semibold text-lg">{formatDateHelper(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Lieu</p>
                  <p className="font-semibold text-lg">{event.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Nombre d&apos;invités</p>
                  <p className="font-semibold text-lg">{event.guestCount} personnes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Euro className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Budget prévu</p>
                  <p className="font-semibold text-lg">{event.budgetRange}</p>
                </div>
              </div>

              {event.vibe && (
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-pink-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Ambiance souhaitée</p>
                    <p className="font-semibold text-lg">{event.vibe}</p>
                  </div>
                </div>
              )}

              {event.services && event.services.length > 0 && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Award className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Services recherchés</p>
                    <div className="flex flex-wrap gap-2">
                      {event.services.map((service: string) => (
                        <Badge key={service} variant="secondary" className="bg-purple-100 text-purple-700">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Proposals Section */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-2xl">
              Propositions reçues ({event.proposals?.length || 0})
            </CardTitle>
            <CardDescription>
              {isBooked 
                ? "Vous avez confirmé un prestataire pour cet événement"
                : "Consultez et acceptez les propositions des prestataires"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!event.proposals || event.proposals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune proposition pour le moment
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Les prestataires n&apos;ont pas encore envoyé de propositions pour votre événement.
                  Revenez bientôt pour consulter les offres.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {event.proposals.map((proposal: any) => {
                  const isAccepted = proposal.status === "ACCEPTED";
                  const isRejected = proposal.status === "REJECTED";
                  const isPending = proposal.status === "PENDING";
                  const isCurrentlyAccepting = acceptingProposalId === proposal.id;

                  return (
                    <Card
                      key={proposal.id}
                      className={`border-2 transition-all ${
                        isAccepted
                          ? "border-green-500 bg-green-50/50"
                          : isRejected
                          ? "border-gray-300 bg-gray-50 opacity-60"
                          : "border-purple-200 hover:border-purple-400"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          {/* Vendor Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isAccepted ? "bg-green-100" : "bg-purple-100"
                              }`}>
                                <Building2 className={`w-6 h-6 ${
                                  isAccepted ? "text-green-600" : "text-purple-600"
                                }`} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">
                                  {proposal.vendor.companyName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {proposal.vendor.city} • {proposal.vendor.priceRange}
                                </p>
                              </div>
                              {isAccepted && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Prestataire Confirmé
                                </Badge>
                              )}
                              {isRejected && (
                                <Badge variant="secondary" className="bg-gray-200">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Non retenu
                                </Badge>
                              )}
                              {isPending && !isBooked && (
                                <Badge variant="outline" className="border-amber-500 text-amber-700">
                                  <Clock className="w-4 h-4 mr-1" />
                                  En attente
                                </Badge>
                              )}
                            </div>

                            {/* Services */}
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">Services proposés :</p>
                              <div className="flex flex-wrap gap-2">
                                {proposal.vendor.services.map((service: string) => (
                                  <Badge key={service} variant="secondary">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">Tarif proposé</p>
                              <p className="text-3xl font-bold text-purple-600">
                                {formatCurrency(proposal.price)}
                              </p>
                            </div>

                            {/* Message */}
                            {proposal.message && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Message du prestataire :</p>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <p className="text-gray-700 whitespace-pre-wrap">
                                    {proposal.message}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Vendor Description */}
                            {proposal.vendor.description && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">À propos :</p>
                                <p className="text-sm text-gray-700">
                                  {proposal.vendor.description.substring(0, 200)}
                                  {proposal.vendor.description.length > 200 ? "..." : ""}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          {!isBooked && isPending && (
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={() => handleAcceptProposal(proposal.id)}
                                disabled={isCurrentlyAccepting}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white min-w-[140px]"
                              >
                                {isCurrentlyAccepting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Confirmation...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Accepter
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booked Event Info */}
        {isBooked && acceptedProposal && (
          <Card className="mt-8 border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">
                    Événement confirmé !
                  </h3>
                  <p className="text-green-700">
                    Vous avez choisi {acceptedProposal.vendor.companyName} pour votre événement.
                    Le prestataire a été notifié de votre confirmation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
