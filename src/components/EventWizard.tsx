"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveClientPreferences, completeOnboarding } from "@/actions/user-actions";
import { 
  Heart, 
  Cake, 
  Briefcase, 
  Wine,
  Check,
  Sparkles,
  Crown,
  Building2,
  Flower2,
  Palette,
  MapPin,
  UtensilsCrossed,
  Camera,
  Music,
  Lamp,
  Flower,
  Euro,
  Calendar,
  Users,
  Wand2,
  Loader2,
  GraduationCap,
  Baby,
  PartyPopper,
  Gem,
  Church,
  TreePine,
  Sun,
  Moon,
  Star,
  Gift,
  Video,
  Mic,
  Car,
  Scissors,
  SkipForward,
  ChevronRight,
  ChevronLeft,
  Clock,
  Phone,
  Mail,
} from "lucide-react";

type EventType = 
  | "Mariage" 
  | "Anniversaire" 
  | "Corporatif" 
  | "Soirée Privée" 
  | "Baptême/Communion" 
  | "Remise de diplômes" 
  | "Baby Shower" 
  | "Fiançailles"
  | null;

type EventVibe = 
  | "Chic/Luxe" 
  | "Traditionnel" 
  | "Moderne" 
  | "Bohème" 
  | "Thématique" 
  | "Champêtre" 
  | "Romantique" 
  | "Minimaliste"
  | "Festif"
  | null;

type Service = 
  | "Lieu/Salle" 
  | "Traiteur" 
  | "Photographe" 
  | "DJ/Musique" 
  | "Décoration" 
  | "Fleuriste"
  | "Vidéaste"
  | "Animation"
  | "Transport"
  | "Wedding Planner"
  | "Maquillage/Coiffure"
  | "Pâtisserie";

type TimePreference = "Matin" | "Après-midi" | "Soir" | "Journée entière" | null;

interface EventData {
  type: EventType;
  date: string;
  city: string;
  venue: string;
  guestCount: number;
  budgetRange: string;
  vibe: EventVibe;
  services: Service[];
  timePreference: TimePreference;
  additionalDetails: string;
  contactPhone: string;
  contactEmail: string;
  region: string;
}

const eventTypes = [
  { id: "Mariage" as const, label: "Mariage", description: "Célébrez votre union", icon: Heart },
  { id: "Anniversaire" as const, label: "Anniversaire", description: "Fêtez un moment spécial", icon: Cake },
  { id: "Corporatif" as const, label: "Corporatif", description: "Événement professionnel", icon: Briefcase },
  { id: "Soirée Privée" as const, label: "Soirée Privée", description: "Réception personnalisée", icon: Wine },
  { id: "Baptême/Communion" as const, label: "Baptême/Communion", description: "Célébration religieuse", icon: Church },
  { id: "Remise de diplômes" as const, label: "Remise de diplômes", description: "Célébrez votre réussite", icon: GraduationCap },
  { id: "Baby Shower" as const, label: "Baby Shower", description: "Fêtez l'arrivée de bébé", icon: Baby },
  { id: "Fiançailles" as const, label: "Fiançailles", description: "Annoncez votre engagement", icon: Gem },
];

const vibeOptions = [
  { id: "Chic/Luxe" as const, label: "Chic/Luxe", description: "Élégance et raffinement", icon: Crown },
  { id: "Traditionnel" as const, label: "Traditionnel", description: "Classique et intemporel", icon: Building2 },
  { id: "Moderne" as const, label: "Moderne", description: "Contemporain et épuré", icon: Sparkles },
  { id: "Bohème" as const, label: "Bohème", description: "Naturel et décontracté", icon: Flower2 },
  { id: "Thématique" as const, label: "Thématique", description: "Créatif et personnalisé", icon: Palette },
  { id: "Champêtre" as const, label: "Champêtre", description: "Rustique et naturel", icon: TreePine },
  { id: "Romantique" as const, label: "Romantique", description: "Doux et poétique", icon: Heart },
  { id: "Minimaliste" as const, label: "Minimaliste", description: "Simple et épuré", icon: Star },
  { id: "Festif" as const, label: "Festif", description: "Joyeux et coloré", icon: PartyPopper },
];

const serviceOptions = [
  { id: "Lieu/Salle" as const, label: "Lieu/Salle", description: "Location de salle", icon: MapPin },
  { id: "Traiteur" as const, label: "Traiteur", description: "Service de restauration", icon: UtensilsCrossed },
  { id: "Photographe" as const, label: "Photographe", description: "Capturer vos moments", icon: Camera },
  { id: "DJ/Musique" as const, label: "DJ/Musique", description: "Animation musicale", icon: Music },
  { id: "Décoration" as const, label: "Décoration", description: "Mise en scène", icon: Lamp },
  { id: "Fleuriste" as const, label: "Fleuriste", description: "Compositions florales", icon: Flower },
  { id: "Vidéaste" as const, label: "Vidéaste", description: "Film souvenir", icon: Video },
  { id: "Animation" as const, label: "Animation", description: "Divertissement", icon: Mic },
  { id: "Transport" as const, label: "Transport", description: "Véhicules de prestige", icon: Car },
  { id: "Wedding Planner" as const, label: "Wedding Planner", description: "Organisation complète", icon: Wand2 },
  { id: "Maquillage/Coiffure" as const, label: "Maquillage/Coiffure", description: "Beauté et mise en forme", icon: Scissors },
  { id: "Pâtisserie" as const, label: "Pâtisserie", description: "Gâteaux et desserts", icon: Cake },
];

const budgetOptions = [
  { value: "Moins de 1000€", label: "Moins de 1000€" },
  { value: "1000€ - 3000€", label: "1000€ - 3000€" },
  { value: "3000€ - 5000€", label: "3000€ - 5000€" },
  { value: "5000€ - 10000€", label: "5000€ - 10000€" },
  { value: "10000€ - 20000€", label: "10000€ - 20000€" },
  { value: "20000€ - 50000€", label: "20000€ - 50000€" },
  { value: "Plus de 50000€", label: "Plus de 50000€" },
  { value: "Je ne sais pas", label: "Je ne sais pas encore" },
];

const timePreferences = [
  { id: "Matin" as const, label: "Matin", icon: Sun, description: "8h - 12h" },
  { id: "Après-midi" as const, label: "Après-midi", icon: Sun, description: "12h - 18h" },
  { id: "Soir" as const, label: "Soir", icon: Moon, description: "18h - Minuit" },
  { id: "Journée entière" as const, label: "Journée entière", icon: Clock, description: "Toute la journée" },
];

export default function EventWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<EventData>({
    type: null,
    date: "",
    city: "",
    venue: "",
    guestCount: 50,
    budgetRange: "",
    vibe: null,
    services: [],
    timePreference: null,
    additionalDetails: "",
    contactPhone: "",
    contactEmail: "",
    region: "",
  });

  const totalSteps = 7;
  const stepTitles = ["Type d'événement", "Date et lieu", "Ambiance", "Services", "Budget", "Détails supplémentaires", "Récapitulatif"];

  const handleTypeSelect = (type: EventType) => setEventData({ ...eventData, type });
  const handleVibeSelect = (vibe: EventVibe) => setEventData({ ...eventData, vibe });
  const handleTimeSelect = (time: TimePreference) => setEventData({ ...eventData, timePreference: time });

  const handleServiceToggle = (service: Service) => {
    const isSelected = eventData.services.includes(service);
    setEventData({
      ...eventData,
      services: isSelected
        ? eventData.services.filter((s) => s !== service)
        : [...eventData.services, service],
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Save preferences to user profile
      const result = await saveClientPreferences({
        preferredEventTypes: eventData.type ? [eventData.type] : [],
        preferredStyles: eventData.vibe ? [eventData.vibe] : [],
        preferredCategories: eventData.services,
        preferredBudget: eventData.budgetRange || undefined,
        preferredGuestCount: String(eventData.guestCount),
        preferredRegion: eventData.region || eventData.city || undefined,
      });

      if (result.success) {
        // Mark onboarding as complete
        await completeOnboarding();
        
        toast.success("Profil complété avec succès !", {
          description: "Découvrez maintenant les prestataires adaptés à vos besoins.",
        });
        router.push("/dashboard/client/services");
      } else {
        toast.error("Erreur lors de la sauvegarde", {
          description: result.error || "Une erreur est survenue. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Error submitting preferences:", error);
      toast.error("Erreur inattendue", { description: "Impossible de sauvegarder. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSkipStep = (step: number) => [3, 4, 5, 6].includes(step);

  const handleSkip = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleNext = async () => {
    if (currentStep === 1 && !eventData.type) {
      toast.error("Veuillez sélectionner un type d'événement");
      return;
    }
    if (currentStep === 2 && (!eventData.date || !eventData.city)) {
      toast.error("Veuillez renseigner la date et la ville");
      return;
    }
    if (currentStep === totalSteps) {
      await handleSubmit();
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!eventData.type;
      case 2: return !!eventData.date && !!eventData.city;
      default: return true;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Étape {currentStep} : {stepTitles[currentStep - 1]}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i + 1 < currentStep ? "bg-primary text-white" : i + 1 === currentStep ? "bg-primary/20 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6">
          {/* Step 1: Event Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel type d&apos;événement organisez-vous ?</h2>
                <p className="text-muted-foreground">Sélectionnez le type d&apos;événement qui correspond à votre projet</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {eventTypes.map((eventType) => {
                  const Icon = eventType.icon;
                  const isSelected = eventData.type === eventType.id;
                  return (
                    <Card key={eventType.id} className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleTypeSelect(eventType.id)}>
                      <CardContent className="p-4 relative">
                        {isSelected && <div className="absolute top-2 right-2"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div></div>}
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                            <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{eventType.label}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{eventType.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Date and Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Détails de votre événement</h2>
                <p className="text-muted-foreground">Partagez-nous les informations essentielles</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />Date de l&apos;événement <span className="text-destructive">*</span>
                  </Label>
                  <Input id="date" type="date" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />Ville <span className="text-destructive">*</span>
                  </Label>
                  <Input id="city" type="text" placeholder="Paris, Lyon, Marseille..." value={eventData.city} onChange={(e) => setEventData({ ...eventData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Lieu (optionnel)
                  </Label>
                  <Input id="venue" type="text" placeholder="Château, Salle des fêtes, Hôtel..." value={eventData.venue} onChange={(e) => setEventData({ ...eventData, venue: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="guestCount" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />Nombre d&apos;invités
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider id="guestCount" min={10} max={500} step={10} value={[eventData.guestCount]} onValueChange={(value) => setEventData({ ...eventData, guestCount: value[0] })} className="flex-1" />
                    <div className="w-20 text-center">
                      <div className="text-2xl font-bold text-primary">{eventData.guestCount}</div>
                      <div className="text-xs text-muted-foreground">invités</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Préférence horaire</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timePreferences.map((time) => {
                    const Icon = time.icon;
                    const isSelected = eventData.timePreference === time.id;
                    return (
                      <Card key={time.id} className={`cursor-pointer transition-all ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleTimeSelect(time.id)}>
                        <CardContent className="p-3 flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <div>
                            <p className="text-sm font-medium">{time.label}</p>
                            <p className="text-xs text-muted-foreground">{time.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vibe */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel style recherchez-vous ?</h2>
                <p className="text-muted-foreground">Choisissez l&apos;ambiance qui correspond à votre vision</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {vibeOptions.map((vibe) => {
                  const Icon = vibe.icon;
                  const isSelected = eventData.vibe === vibe.id;
                  return (
                    <Card key={vibe.id} className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleVibeSelect(vibe.id)}>
                      <CardContent className="p-4 relative">
                        {isSelected && <div className="absolute top-2 right-2"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="h-3 w-3 text-white" /></div></div>}
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                            <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">{vibe.label}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{vibe.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quels services recherchez-vous ?</h2>
                <p className="text-muted-foreground">Sélectionnez tous les services dont vous avez besoin</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                {serviceOptions.map((service) => {
                  const Icon = service.icon;
                  const isSelected = eventData.services.includes(service.id);
                  return (
                    <Card key={service.id} className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleServiceToggle(service.id)}>
                      <CardContent className="p-4 relative">
                        <div className="absolute top-2 right-2">
                          <Checkbox checked={isSelected} onCheckedChange={() => handleServiceToggle(service.id)} className="border-2" />
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 pr-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xs text-foreground">{service.label}</h3>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {eventData.services.length > 0 && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">{eventData.services.length} service(s) sélectionné(s) : {eventData.services.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Budget */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel est votre budget ?</h2>
                <p className="text-muted-foreground">Cette information aide les prestataires à vous proposer des offres adaptées</p>
              </div>
              <div className="mt-8 max-w-md mx-auto">
                <RadioGroup value={eventData.budgetRange} onValueChange={(value) => setEventData({ ...eventData, budgetRange: value })} className="space-y-3">
                  {budgetOptions.map((option) => (
                    <div key={option.value} className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${eventData.budgetRange === option.value ? "border-primary bg-primary/5 border-2" : "border-border hover:border-primary/50"}`} onClick={() => setEventData({ ...eventData, budgetRange: option.value })}>
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium text-foreground">
                        <div className="flex items-center gap-2"><Euro className="h-4 w-4 text-primary" />{option.label}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 6: Additional Details */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Informations complémentaires</h2>
                <p className="text-muted-foreground">Ajoutez des détails pour aider les prestataires à mieux comprendre votre projet</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="additionalDetails" className="text-sm font-medium text-foreground">Description du projet</Label>
                  <Textarea id="additionalDetails" placeholder="Décrivez votre vision, vos attentes spécifiques, le thème de votre événement..." value={eventData.additionalDetails} onChange={(e) => setEventData({ ...eventData, additionalDetails: e.target.value })} className="min-h-[120px]" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground flex items-center gap-2"><Phone className="h-4 w-4" />Téléphone (optionnel)</Label>
                    <Input id="contactPhone" type="tel" placeholder="06 12 34 56 78" value={eventData.contactPhone} onChange={(e) => setEventData({ ...eventData, contactPhone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Email de contact (optionnel)</Label>
                    <Input id="contactEmail" type="email" placeholder="contact@example.com" value={eventData.contactEmail} onChange={(e) => setEventData({ ...eventData, contactEmail: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Summary */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Récapitulatif de votre événement</h2>
                <p className="text-muted-foreground">Vérifiez vos informations avant de publier</p>
              </div>
              <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">{eventData.type === "Mariage" && <Heart className="h-6 w-6 text-primary" />}{eventData.type === "Anniversaire" && <Cake className="h-6 w-6 text-primary" />}{eventData.type === "Corporatif" && <Briefcase className="h-6 w-6 text-primary" />}{eventData.type === "Soirée Privée" && <Wine className="h-6 w-6 text-primary" />}{eventData.type === "Baptême/Communion" && <Church className="h-6 w-6 text-primary" />}{eventData.type === "Remise de diplômes" && <GraduationCap className="h-6 w-6 text-primary" />}{eventData.type === "Baby Shower" && <Baby className="h-6 w-6 text-primary" />}{eventData.type === "Fiançailles" && <Gem className="h-6 w-6 text-primary" />}</div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Type d&apos;événement</h3><p className="text-muted-foreground">{eventData.type}</p></div></div></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Date et lieu</h3><p className="text-muted-foreground">{eventData.date ? new Date(eventData.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : "Non spécifié"} • {eventData.city || "Non spécifié"}{eventData.venue && ` • ${eventData.venue}`}</p>{eventData.timePreference && <p className="text-sm text-muted-foreground mt-1">Préférence : {eventData.timePreference}</p>}</div></div></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Users className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Nombre d&apos;invités</h3><p className="text-muted-foreground">{eventData.guestCount} personnes</p></div></div></CardContent></Card>
                {eventData.vibe && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Wand2 className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Style recherché</h3><p className="text-muted-foreground">{eventData.vibe}</p></div></div></CardContent></Card>}
                {eventData.services.length > 0 && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Sparkles className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Services souhaités</h3><div className="flex flex-wrap gap-2 mt-2">{eventData.services.map((service) => (<span key={service} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{service}</span>))}</div></div></div></CardContent></Card>}
                {eventData.budgetRange && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Euro className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Budget estimé</h3><p className="text-muted-foreground">{eventData.budgetRange}</p></div></div></CardContent></Card>}
                {eventData.additionalDetails && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Gift className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Détails supplémentaires</h3><p className="text-muted-foreground">{eventData.additionalDetails}</p></div></div></CardContent></Card>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting} className="gap-2">
          <ChevronLeft className="h-4 w-4" />Précédent
        </Button>
        <div className="flex gap-3">
          {canSkipStep(currentStep) && (
            <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting} className="gap-2 text-muted-foreground">
              <SkipForward className="h-4 w-4" />Passer cette étape
            </Button>
          )}
          <Button onClick={handleNext} disabled={!isStepValid() || isSubmitting} className="gap-2">
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Création en cours...</>) : currentStep === totalSteps ? (<><Sparkles className="h-4 w-4" />Publier l&apos;événement</>) : (<>Suivant<ChevronRight className="h-4 w-4" /></>)}
          </Button>
        </div>
      </div>
    </div>
  );
}
