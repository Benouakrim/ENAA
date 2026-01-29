"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { saveClientPreferences } from "@/actions/user-actions";
import {
  Heart,
  Cake,
  Briefcase,
  Wine,
  Church,
  GraduationCap,
  Baby,
  Gem,
  Crown,
  Building2,
  Sparkles,
  Flower2,
  Palette,
  TreePine,
  Star,
  PartyPopper,
  MapPin,
  UtensilsCrossed,
  Camera,
  Music,
  Lamp,
  Flower,
  Video,
  Mic,
  Car,
  Wand2,
  Scissors,
  Euro,
  Users,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SkipForward,
} from "lucide-react";

const eventTypes = [
  { id: "Mariage", label: "Mariage", description: "Célébrez votre union", icon: Heart },
  { id: "Anniversaire", label: "Anniversaire", description: "Fêtez un moment spécial", icon: Cake },
  { id: "Corporatif", label: "Corporatif", description: "Événement professionnel", icon: Briefcase },
  { id: "Soirée Privée", label: "Soirée Privée", description: "Réception personnalisée", icon: Wine },
  { id: "Baptême/Communion", label: "Baptême/Communion", description: "Célébration religieuse", icon: Church },
  { id: "Remise de diplômes", label: "Remise de diplômes", description: "Célébrez votre réussite", icon: GraduationCap },
  { id: "Baby Shower", label: "Baby Shower", description: "Fêtez l'arrivée de bébé", icon: Baby },
  { id: "Fiançailles", label: "Fiançailles", description: "Annoncez votre engagement", icon: Gem },
];

const vibeOptions = [
  { id: "Chic/Luxe", label: "Chic/Luxe", description: "Élégance et raffinement", icon: Crown },
  { id: "Traditionnel", label: "Traditionnel", description: "Classique et intemporel", icon: Building2 },
  { id: "Moderne", label: "Moderne", description: "Contemporain et épuré", icon: Sparkles },
  { id: "Bohème", label: "Bohème", description: "Naturel et décontracté", icon: Flower2 },
  { id: "Thématique", label: "Thématique", description: "Créatif et personnalisé", icon: Palette },
  { id: "Champêtre", label: "Champêtre", description: "Rustique et naturel", icon: TreePine },
  { id: "Romantique", label: "Romantique", description: "Doux et poétique", icon: Heart },
  { id: "Minimaliste", label: "Minimaliste", description: "Simple et épuré", icon: Star },
  { id: "Festif", label: "Festif", description: "Joyeux et coloré", icon: PartyPopper },
];

const serviceOptions = [
  { id: "Lieu/Salle", label: "Lieu/Salle", description: "Location de salle", icon: MapPin },
  { id: "Traiteur", label: "Traiteur", description: "Service de restauration", icon: UtensilsCrossed },
  { id: "Photographe", label: "Photographe", description: "Capturer vos moments", icon: Camera },
  { id: "DJ/Musique", label: "DJ/Musique", description: "Animation musicale", icon: Music },
  { id: "Décoration", label: "Décoration", description: "Mise en scène", icon: Lamp },
  { id: "Fleuriste", label: "Fleuriste", description: "Compositions florales", icon: Flower },
  { id: "Vidéaste", label: "Vidéaste", description: "Film souvenir", icon: Video },
  { id: "Animation", label: "Animation", description: "Divertissement", icon: Mic },
  { id: "Transport", label: "Transport", description: "Véhicules de prestige", icon: Car },
  { id: "Wedding Planner", label: "Wedding Planner", description: "Organisation complète", icon: Wand2 },
  { id: "Maquillage/Coiffure", label: "Maquillage/Coiffure", description: "Beauté et mise en forme", icon: Scissors },
  { id: "Pâtisserie", label: "Pâtisserie", description: "Gâteaux et desserts", icon: Cake },
];

const budgetOptions = [
  { value: "BUDGET", label: "Économique", description: "Moins de 500€" },
  { value: "STANDARD", label: "Standard", description: "500€ - 1500€" },
  { value: "PREMIUM", label: "Premium", description: "1500€ - 4000€" },
  { value: "LUXE", label: "Luxe", description: "Plus de 4000€" },
];

const guestOptions = [
  { value: "1-20", label: "Intime", description: "1-20 invités" },
  { value: "20-50", label: "Petit", description: "20-50 invités" },
  { value: "50-100", label: "Moyen", description: "50-100 invités" },
  { value: "100-200", label: "Grand", description: "100-200 invités" },
  { value: "200+", label: "Très grand", description: "Plus de 200 invités" },
];

const regions = [
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Auvergne-Rhône-Alpes",
  "Bretagne",
  "Normandie",
  "Hauts-de-France",
  "Grand Est",
  "Pays de la Loire",
  "Centre-Val de Loire",
  "Bourgogne-Franche-Comté",
  "Corse",
];

interface ClientPreferences {
  eventTypes: string[];
  styles: string[];
  services: string[];
  budget: string | null;
  guestCount: string | null;
  region: string | null;
}

export default function ClientWizard() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<ClientPreferences>({
    eventTypes: [],
    styles: [],
    services: [],
    budget: null,
    guestCount: null,
    region: null,
  });

  const totalSteps = 5;
  const stepTitles = [
    "Types d'événements",
    "Style préféré",
    "Services recherchés",
    "Budget et capacité",
    "Récapitulatif",
  ];

  const toggleEventType = (type: string) => {
    setPreferences({
      ...preferences,
      eventTypes: preferences.eventTypes.includes(type)
        ? preferences.eventTypes.filter((t) => t !== type)
        : [...preferences.eventTypes, type],
    });
  };

  const toggleStyle = (style: string) => {
    setPreferences({
      ...preferences,
      styles: preferences.styles.includes(style)
        ? preferences.styles.filter((s) => s !== style)
        : [...preferences.styles, style],
    });
  };

  const toggleService = (service: string) => {
    setPreferences({
      ...preferences,
      services: preferences.services.includes(service)
        ? preferences.services.filter((s) => s !== service)
        : [...preferences.services, service],
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.eventTypes.length > 0;
      case 2:
        return preferences.styles.length > 0;
      case 3:
        return preferences.services.length > 0;
      case 4:
        return true; // Budget and guests are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await saveClientPreferences({
        preferredEventTypes: preferences.eventTypes,
        preferredStyles: preferences.styles,
        preferredCategories: preferences.services,
        preferredBudget: preferences.budget || undefined,
        preferredGuestCount: preferences.guestCount || undefined,
        preferredRegion: preferences.region || undefined,
      });

      if (result.success) {
        toast.success("Préférences enregistrées !", {
          description: "Votre profil a été personnalisé avec succès.",
        });
        router.push("/dashboard/client");
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible d'enregistrer vos préférences.",
        });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Erreur", {
        description: "Impossible d'enregistrer vos préférences. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await saveClientPreferences({
        preferredEventTypes: [],
        preferredStyles: [],
        preferredCategories: [],
      });

      if (result.success) {
        toast.info("Préférences ignorées", {
          description: "Vous pouvez les compléter plus tard dans les paramètres.",
        });
        router.push("/dashboard/client");
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de continuer.",
        });
      }
    } catch (error) {
      console.error("Error skipping wizard:", error);
      toast.error("Erreur", {
        description: "Impossible de continuer. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quels types d&apos;événements vous intéressent ?
              </h2>
              <p className="text-gray-600">
                Sélectionnez un ou plusieurs types pour personnaliser vos recommandations
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {eventTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = preferences.eventTypes.includes(type.id);
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-blue-300"
                    }`}
                    onClick={() => toggleEventType(type.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div
                        className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm">{type.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quel style vous attire ?
              </h2>
              <p className="text-gray-600">
                Choisissez les ambiances qui correspondent à vos goûts
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vibeOptions.map((vibe) => {
                const Icon = vibe.icon;
                const isSelected = preferences.styles.includes(vibe.id);
                return (
                  <Card
                    key={vibe.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-blue-300"
                    }`}
                    onClick={() => toggleStyle(vibe.id)}
                  >
                    <CardContent className="p-4 text-center relative">
                      <div
                        className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-sm">{vibe.label}</h3>
                      <p className="text-xs text-gray-500 mt-1">{vibe.description}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quels services recherchez-vous ?
              </h2>
              <p className="text-gray-600">
                Sélectionnez les types de prestataires dont vous aurez besoin
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceOptions.map((service) => {
                const Icon = service.icon;
                const isSelected = preferences.services.includes(service.id);
                return (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:border-blue-300"
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardContent className="p-4 text-center relative">
                      <div
                        className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-sm">{service.label}</h3>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Budget et nombre d&apos;invités
              </h2>
              <p className="text-gray-600">
                Ces informations nous aident à mieux vous recommander (optionnel)
              </p>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-500" />
                Budget estimé
              </Label>
              <RadioGroup
                value={preferences.budget || ""}
                onValueChange={(value) => setPreferences({ ...preferences, budget: value })}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {budgetOptions.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-300 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500 peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-sm text-gray-500">{option.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Guest Count */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Nombre d&apos;invités habituel
              </Label>
              <RadioGroup
                value={preferences.guestCount || ""}
                onValueChange={(value) => setPreferences({ ...preferences, guestCount: value })}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                {guestOptions.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`guest-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`guest-${option.value}`}
                      className="flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all hover:border-blue-300 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500 peer-data-[state=checked]:bg-blue-50"
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Region */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Région préférée
              </Label>
              <RadioGroup
                value={preferences.region || ""}
                onValueChange={(value) => setPreferences({ ...preferences, region: value })}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                {regions.map((region) => (
                  <div key={region}>
                    <RadioGroupItem
                      value={region}
                      id={`region-${region}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`region-${region}`}
                      className="flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all hover:border-blue-300 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-blue-500 peer-data-[state=checked]:bg-blue-50 text-sm"
                    >
                      {region}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Récapitulatif de vos préférences
              </h2>
              <p className="text-gray-600">
                Vérifiez vos choix avant de continuer
              </p>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Event Types */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-blue-500" />
                    Types d&apos;événements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.eventTypes.length > 0 ? (
                      preferences.eventTypes.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Aucun sélectionné</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Styles */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Styles préférés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.styles.length > 0 ? (
                      preferences.styles.map((style) => (
                        <span
                          key={style}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {style}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Aucun sélectionné</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-blue-500" />
                    Services recherchés
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.services.length > 0 ? (
                      preferences.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Aucun sélectionné</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Guests */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-blue-500" />
                    Budget et capacité
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <span className="ml-2 font-medium">
                        {preferences.budget
                          ? budgetOptions.find((b) => b.value === preferences.budget)?.label
                          : "Non spécifié"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Invités:</span>
                      <span className="ml-2 font-medium">
                        {preferences.guestCount
                          ? guestOptions.find((g) => g.value === preferences.guestCount)?.label
                          : "Non spécifié"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Région:</span>
                      <span className="ml-2 font-medium">
                        {preferences.region || "Non spécifiée"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Étape {currentStep} sur {totalSteps}</span>
          <span>{stepTitles[currentStep - 1]}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-gray-500"
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Passer
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed() || isSubmitting}
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Terminer
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
