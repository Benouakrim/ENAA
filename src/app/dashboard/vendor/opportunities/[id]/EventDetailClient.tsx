"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { submitProposal } from "@/actions/vendor-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/format";
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
  Clock,
  Send,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Validation schema
const proposalSchema = z.object({
  price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
  message: z.string().min(20, "Le message doit contenir au moins 20 caractères"),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface EventDetailClientProps {
  event: any;
  vendorProfile: any;
  existingProposal: any;
}

export default function EventDetailClient({ 
  event, 
  vendorProfile, 
  existingProposal 
}: EventDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dev-only mock data
  const isDev = process.env.NODE_ENV === 'development';
  const mockDefaults = isDev && !existingProposal ? {
    price: 2500,
    message: `Bonjour,\n\nNous sommes ravis de vous proposer nos services pour votre ${event.type}. Avec plus de 10 ans d'expérience dans l'organisation d'événements similaires, nous garantissons une prestation de qualité exceptionnelle.\n\nNotre offre comprend :\n- Service complet le jour J\n- Équipe professionnelle dédiée\n- Matériel de qualité premium\n- Support personnalisé avant et pendant l'événement\n\nNous serions heureux d'échanger avec vous pour personnaliser cette proposition selon vos besoins spécifiques.\n\nCordialement,\n${vendorProfile.companyName}`,
  } : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema) as any,
    defaultValues: existingProposal ? {
      price: existingProposal.price,
      message: existingProposal.message || "",
    } : mockDefaults,
  });

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

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const onSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitProposal({
        eventId: event.id,
        price: data.price,
        message: data.message,
      });

      if (result.success) {
        toast.success("Devis envoyé !", {
          description: "Votre proposition a été envoyée avec succès au client.",
        });
        router.push("/dashboard/vendor");
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible d'envoyer la proposition.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur", {
        description: "Une erreur inattendue est survenue.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/vendor")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux opportunités
        </Button>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Event Details */}
          <div className="space-y-6">
            {/* Main Event Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <EventIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl">{event.type}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {event.status === "DRAFT" && (
                        <Badge variant="outline" className="mr-2">
                          Brouillon
                        </Badge>
                      )}
                      Publié le {new Date(event.createdAt).toLocaleDateString("fr-FR")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Key Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Date de l&apos;événement</p>
                      <p className="font-semibold text-lg">{formatDate(event.date)}</p>
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
                </div>
              </CardContent>
            </Card>

            {/* Services Required */}
            {event.services && event.services.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Services recherchés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {event.services.map((service: string) => {
                      const isMyService = vendorProfile.services.includes(service);
                      return (
                        <Badge
                          key={service}
                          variant={isMyService ? "default" : "secondary"}
                          className={`px-4 py-2 text-base ${
                            isMyService
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {isMyService && <CheckCircle2 className="w-4 h-4 mr-2" />}
                          {service}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competition Info */}
            {event._count && (
              <Card className="shadow-lg bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        {event._count.proposals} proposition(s) déjà envoyée(s)
                      </p>
                      <p className="text-sm text-blue-700">
                        Répondez rapidement pour maximiser vos chances
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Proposal Form */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  {existingProposal ? "Votre proposition" : "Envoyer une proposition"}
                </CardTitle>
                <CardDescription>
                  {existingProposal 
                    ? "Vous avez déjà envoyé une proposition pour cet événement"
                    : "Proposez vos services et votre tarif pour cet événement"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {existingProposal ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-900">
                          Proposition envoyée
                        </p>
                      </div>
                      <p className="text-sm text-green-700">
                        Statut : <StatusBadge status={existingProposal.status as any} />
                      </p>
                    </div>

                    <div>
                      <Label>Votre tarif</Label>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(existingProposal.price)}
                      </p>
                    </div>

                    {existingProposal.message && (
                      <div>
                        <Label>Votre message</Label>
                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                          {existingProposal.message}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => router.push("/dashboard/vendor")}
                      className="w-full"
                      variant="outline"
                    >
                      Retour au tableau de bord
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Price Input */}
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-base font-semibold">
                        Votre tarif <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="Ex: 1500"
                          {...register("price", { valueAsNumber: true })}
                          className={`pl-10 text-lg ${errors.price ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500">{errors.price.message}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Budget client : {event.budgetRange}
                      </p>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-base font-semibold">
                        Pourquoi vous choisir ? <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-sm text-gray-600">
                        Présentez votre expérience, votre approche et ce qui vous rend unique
                      </p>
                      <textarea
                        id="message"
                        rows={8}
                        placeholder="Exemple : Avec plus de 10 ans d'expérience dans l'organisation d'événements haut de gamme, je m'engage à faire de votre événement un moment inoubliable..."
                        {...register("message")}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.message ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-500">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-lg shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Envoyer la proposition
                          </>
                        )}
                      </Button>
                      <p className="text-center text-sm text-gray-500 mt-3">
                        En envoyant cette proposition, vous vous engagez à respecter votre tarif
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
