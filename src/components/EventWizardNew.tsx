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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Globe,
  HelpCircle,
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
  | "Je ne sais pas encore"
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
  | "Je n'ai pas encore décidé"
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

type TimePreference = "Matin" | "Après-midi" | "Soir" | "Journée entière" | "Pas encore défini" | null;

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  birthday: string;
}

interface EventData {
  type: EventType;
  date: string;
  city: string;
  venue: string;
  guestCount: number;
  guestCountUndecided: boolean;
  budgetRange: string;
  vibe: EventVibe;
  services: Service[];
  timePreference: TimePreference;
  additionalDetails: string;
  region: string;
}

interface EventWizardProps {
  userId: string;
  initialUserData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    city?: string;
    birthday?: Date | null;
  };
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
  { id: "Je ne sais pas encore" as const, label: "Je ne sais pas encore", description: "Je réfléchis encore", icon: HelpCircle },
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
  { id: "Je n'ai pas encore décidé" as const, label: "Je n'ai pas encore décidé", description: "J'explore mes options", icon: HelpCircle },
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
  { value: "Je n'ai pas encore de budget défini", label: "Je n'ai pas encore de budget défini" },
];

const timePreferences = [
  { id: "Matin" as const, label: "Matin", icon: Sun, description: "8h - 12h" },
  { id: "Après-midi" as const, label: "Après-midi", icon: Sun, description: "12h - 18h" },
  { id: "Soir" as const, label: "Soir", icon: Moon, description: "18h - Minuit" },
  { id: "Journée entière" as const, label: "Journée entière", icon: Clock, description: "Toute la journée" },
  { id: "Pas encore défini" as const, label: "Pas encore défini", icon: HelpCircle, description: "À déterminer" },
];

const countries = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Canada",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d'Ivoire",
  "Autre",
];

const frenchRegions = [
  "Île-de-France",
  "Provence-Alpes-Côte d'Azur",
  "Auvergne-Rhône-Alpes",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Bretagne",
  "Hauts-de-France",
  "Grand Est",
  "Normandie",
  "Pays de la Loire",
  "Je ne sais pas encore",
];

export default function EventWizard({ userId, initialUserData }: EventWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dev-only mock data
  const isDev = process.env.NODE_ENV === 'development';
  
  // User info state - pre-populated from Clerk or mock data
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: initialUserData?.firstName || (isDev ? "Marie" : ""),
    lastName: initialUserData?.lastName || (isDev ? "Laurent" : ""),
    email: initialUserData?.email || (isDev ? "marie.laurent@example.com" : ""),
    phone: initialUserData?.phone || (isDev ? "+33 6 45 78 90 12" : ""),
    country: initialUserData?.country || (isDev ? "France" : ""),
    city: initialUserData?.city || (isDev ? "Paris" : ""),
    birthday: initialUserData?.birthday ? new Date(initialUserData.birthday).toISOString().split('T')[0] : (isDev ? "1995-06-15" : ""),
  });

  // Event data state - with mock data in dev
  const [eventData, setEventData] = useState<EventData>({
    type: isDev ? "Mariage" : null,
    date: isDev ? "2026-07-27" : "", // Static future date in dev
    city: isDev ? "Paris" : "",
    venue: isDev ? "Château de Versailles" : "",
    guestCount: isDev ? 120 : 50,
    guestCountUndecided: false,
    budgetRange: isDev ? "10000€ - 20000€" : "",
    vibe: isDev ? "Romantique" : null,
    services: isDev ? ["Lieu/Salle", "Traiteur", "Photographe", "DJ/Musique", "Fleuriste"] : [],
    timePreference: isDev ? "Soir" : null,
    additionalDetails: isDev ? "Nous recherchons un lieu élégant avec une grande salle de réception et un jardin pour la cérémonie. Nous aimerions une atmosphère romantique avec beaucoup de fleurs et des bougies." : "",
    region: isDev ? "Île-de-France" : "",
  });

  const totalSteps = 8;
  const stepTitles = [
    "Vos informations", 
    "Type d'événement", 
    "Date et lieu", 
    "Ambiance", 
    "Services", 
    "Budget", 
    "Détails supplémentaires", 
    "Récapitulatif"
  ];

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
      // Save preferences to user profile using new schema fields
      const result = await saveClientPreferences({
        preferredEventTypes: eventData.type && eventData.type !== "Je ne sais pas encore" ? [eventData.type] : [],
        preferredStyles: eventData.vibe && eventData.vibe !== "Je n'ai pas encore décidé" ? [eventData.vibe] : [],
        preferredCategories: eventData.services,
        preferredBudget: eventData.budgetRange || undefined,
        preferredGuestCount: eventData.guestCountUndecided ? "Non défini" : String(eventData.guestCount),
        preferredRegion: eventData.region || undefined,
      });

      if (!result.success) {
        toast.error("Erreur lors de la sauvegarde", {
          description: result.error,
        });
        setIsSubmitting(false);
        return;
      }

      // Mark onboarding as complete
      await completeOnboarding();

      toast.success("Profil complété avec succès !", {
        description: "Découvrez maintenant les prestataires adaptés à vos besoins.",
      });
      
      router.push("/dashboard/client/services");
    } catch (error) {
      console.error("Error submitting wizard:", error);
      toast.error("Erreur inattendue", { description: "Impossible de sauvegarder. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // All steps can be skipped except user info and summary
  const canSkipStep = (step: number) => step >= 2 && step <= 7;

  const handleSkip = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      await handleSubmit();
      return;
    }
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
          {/* Step 1: User Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Vos informations</h2>
                <p className="text-muted-foreground">Vérifiez et complétez vos informations personnelles</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />Prénom
                  </Label>
                  <Input 
                    id="firstName" 
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />Nom
                  </Label>
                  <Input 
                    id="lastName" 
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />Email
                    {initialUserData?.email && (
                      <span className="text-xs text-muted-foreground">(non modifiable)</span>
                    )}
                  </Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => !initialUserData?.email && setUserInfo({ ...userInfo, email: e.target.value })}
                    placeholder="votre@email.com"
                    disabled={!!initialUserData?.email}
                    className={initialUserData?.email ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />Téléphone
                    {initialUserData?.phone && (
                      <span className="text-xs text-muted-foreground">(non modifiable)</span>
                    )}
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => !initialUserData?.phone && setUserInfo({ ...userInfo, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    disabled={!!initialUserData?.phone}
                    className={initialUserData?.phone ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />Pays
                  </Label>
                  <Select 
                    value={userInfo.country} 
                    onValueChange={(v) => setUserInfo({ ...userInfo, country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />Date de naissance (optionnel)
                  </Label>
                  <Input 
                    id="birthday" 
                    type="date"
                    value={userInfo.birthday}
                    onChange={(e) => setUserInfo({ ...userInfo, birthday: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Event Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel type d&apos;événement organisez-vous ?</h2>
                <p className="text-muted-foreground">Sélectionnez le type d&apos;événement qui correspond à votre projet (optionnel)</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                {eventTypes.map((eventType) => {
                  const Icon = eventType.icon;
                  const isSelected = eventData.type === eventType.id;
                  const isUndecided = eventType.id === "Je ne sais pas encore";
                  return (
                    <Card 
                      key={eventType.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? "border-primary border-2 bg-primary/5" 
                          : isUndecided
                            ? "border-dashed border-2 border-muted-foreground/30 hover:border-primary/50"
                            : "border-border hover:border-primary/50"
                      }`} 
                      onClick={() => handleTypeSelect(eventType.id)}
                    >
                      <CardContent className="p-4 relative">
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-primary/20" : isUndecided ? "bg-muted" : "bg-muted"
                          }`}>
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

          {/* Step 3: Date and Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Détails de votre événement</h2>
                <p className="text-muted-foreground">Tous les champs sont optionnels</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />Date de l&apos;événement
                  </Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={eventData.date} 
                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })} 
                    min={new Date().toISOString().split('T')[0]} 
                  />
                  <p className="text-xs text-muted-foreground">Laissez vide si pas encore défini</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />Région
                  </Label>
                  <Select 
                    value={eventData.region} 
                    onValueChange={(v) => setEventData({ ...eventData, region: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {frenchRegions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />Ville
                  </Label>
                  <Input 
                    id="city" 
                    type="text" 
                    placeholder="Paris, Lyon, Marseille..." 
                    value={eventData.city} 
                    onChange={(e) => setEventData({ ...eventData, city: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Lieu (optionnel)
                  </Label>
                  <Input 
                    id="venue" 
                    type="text" 
                    placeholder="Château, Salle des fêtes, Hôtel..." 
                    value={eventData.venue} 
                    onChange={(e) => setEventData({ ...eventData, venue: e.target.value })} 
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label htmlFor="guestCount" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />Nombre d&apos;invités
                  </Label>
                  <div className="flex items-center gap-4 mb-2">
                    <Checkbox 
                      id="guestUndecided"
                      checked={eventData.guestCountUndecided}
                      onCheckedChange={(checked) => setEventData({ ...eventData, guestCountUndecided: !!checked })}
                    />
                    <Label htmlFor="guestUndecided" className="text-sm text-muted-foreground cursor-pointer">
                      Je ne sais pas encore combien d&apos;invités
                    </Label>
                  </div>
                  {!eventData.guestCountUndecided && (
                    <div className="flex items-center gap-4">
                      <Slider 
                        id="guestCount" 
                        min={10} 
                        max={500} 
                        step={10} 
                        value={[eventData.guestCount]} 
                        onValueChange={(value) => setEventData({ ...eventData, guestCount: value[0] })} 
                        className="flex-1" 
                      />
                      <div className="w-20 text-center">
                        <div className="text-2xl font-bold text-primary">{eventData.guestCount}</div>
                        <div className="text-xs text-muted-foreground">invités</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3 mt-6">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />Préférence horaire
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {timePreferences.map((time) => {
                    const Icon = time.icon;
                    const isSelected = eventData.timePreference === time.id;
                    return (
                      <Card 
                        key={time.id} 
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"
                        }`} 
                        onClick={() => handleTimeSelect(time.id)}
                      >
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

          {/* Step 4: Vibe */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel style recherchez-vous ?</h2>
                <p className="text-muted-foreground">Choisissez l&apos;ambiance qui correspond à votre vision (optionnel)</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                {vibeOptions.map((vibe) => {
                  const Icon = vibe.icon;
                  const isSelected = eventData.vibe === vibe.id;
                  const isUndecided = vibe.id === "Je n'ai pas encore décidé";
                  return (
                    <Card 
                      key={vibe.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? "border-primary border-2 bg-primary/5" 
                          : isUndecided
                            ? "border-dashed border-2 border-muted-foreground/30 hover:border-primary/50"
                            : "border-border hover:border-primary/50"
                      }`} 
                      onClick={() => handleVibeSelect(vibe.id)}
                    >
                      <CardContent className="p-4 relative">
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
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

          {/* Step 5: Services */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quels services recherchez-vous ?</h2>
                <p className="text-muted-foreground">Sélectionnez les services dont vous avez besoin (optionnel)</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                {serviceOptions.map((service) => {
                  const Icon = service.icon;
                  const isSelected = eventData.services.includes(service.id);
                  return (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"
                      }`} 
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <CardContent className="p-4 relative">
                        <div className="absolute top-2 right-2">
                          <Checkbox 
                            checked={isSelected} 
                            onCheckedChange={() => handleServiceToggle(service.id)} 
                            className="border-2" 
                          />
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
                  <p className="text-sm text-muted-foreground">
                    {eventData.services.length} service(s) sélectionné(s) : {eventData.services.join(", ")}
                  </p>
                </div>
              )}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  Vous pourrez toujours modifier vos préférences plus tard dans les paramètres
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Budget */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quel est votre budget ?</h2>
                <p className="text-muted-foreground">Cette information aide à vous proposer des prestataires adaptés (optionnel)</p>
              </div>
              <div className="mt-8 max-w-md mx-auto">
                <RadioGroup 
                  value={eventData.budgetRange} 
                  onValueChange={(value) => setEventData({ ...eventData, budgetRange: value })} 
                  className="space-y-3"
                >
                  {budgetOptions.map((option) => {
                    const isUndecided = option.value.includes("pas encore");
                    return (
                      <div 
                        key={option.value} 
                        className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                          eventData.budgetRange === option.value 
                            ? "border-primary bg-primary/5 border-2" 
                            : isUndecided
                              ? "border-dashed border-muted-foreground/30 hover:border-primary/50"
                              : "border-border hover:border-primary/50"
                        }`} 
                        onClick={() => setEventData({ ...eventData, budgetRange: option.value })}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {isUndecided ? (
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Euro className="h-4 w-4 text-primary" />
                            )}
                            {option.label}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 7: Additional Details */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Informations complémentaires</h2>
                <p className="text-muted-foreground">Ajoutez des détails pour nous aider à mieux comprendre votre projet (optionnel)</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="additionalDetails" className="text-sm font-medium text-foreground">
                    Description du projet
                  </Label>
                  <Textarea 
                    id="additionalDetails" 
                    placeholder="Décrivez votre vision, vos attentes spécifiques, le thème de votre événement, des contraintes particulières..." 
                    value={eventData.additionalDetails} 
                    onChange={(e) => setEventData({ ...eventData, additionalDetails: e.target.value })} 
                    className="min-h-[150px]" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Summary */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Récapitulatif</h2>
                <p className="text-muted-foreground">Vérifiez vos informations avant de continuer</p>
              </div>
              <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                {/* User Info */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Vos informations</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {(userInfo.firstName || userInfo.lastName) && (
                            <p>{userInfo.firstName} {userInfo.lastName}</p>
                          )}
                          {userInfo.email && <p>{userInfo.email}</p>}
                          {userInfo.phone && <p>{userInfo.phone}</p>}
                          {userInfo.country && <p>{userInfo.country}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Type */}
                {eventData.type && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          {eventData.type === "Mariage" && <Heart className="h-6 w-6 text-primary" />}
                          {eventData.type === "Anniversaire" && <Cake className="h-6 w-6 text-primary" />}
                          {eventData.type === "Corporatif" && <Briefcase className="h-6 w-6 text-primary" />}
                          {eventData.type === "Soirée Privée" && <Wine className="h-6 w-6 text-primary" />}
                          {eventData.type === "Baptême/Communion" && <Church className="h-6 w-6 text-primary" />}
                          {eventData.type === "Remise de diplômes" && <GraduationCap className="h-6 w-6 text-primary" />}
                          {eventData.type === "Baby Shower" && <Baby className="h-6 w-6 text-primary" />}
                          {eventData.type === "Fiançailles" && <Gem className="h-6 w-6 text-primary" />}
                          {eventData.type === "Je ne sais pas encore" && <HelpCircle className="h-6 w-6 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Type d&apos;événement</h3>
                          <p className="text-muted-foreground">{eventData.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Date and Location */}
                {(eventData.date || eventData.city || eventData.region) && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Date et lieu</h3>
                          <p className="text-muted-foreground">
                            {eventData.date 
                              ? new Date(eventData.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) 
                              : "Date non définie"}
                            {(eventData.city || eventData.region) && " • "}
                            {eventData.city}{eventData.city && eventData.region && ", "}{eventData.region}
                          </p>
                          {eventData.timePreference && (
                            <p className="text-sm text-muted-foreground mt-1">Préférence : {eventData.timePreference}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Guest Count */}
                <Card className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Nombre d&apos;invités</h3>
                        <p className="text-muted-foreground">
                          {eventData.guestCountUndecided ? "Non encore défini" : `${eventData.guestCount} personnes`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vibe */}
                {eventData.vibe && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Wand2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Style recherché</h3>
                          <p className="text-muted-foreground">{eventData.vibe}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Services */}
                {eventData.services.length > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Services souhaités</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {eventData.services.map((service) => (
                              <span key={service} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Budget */}
                {eventData.budgetRange && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Euro className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Budget estimé</h3>
                          <p className="text-muted-foreground">{eventData.budgetRange}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Details */}
                {eventData.additionalDetails && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Gift className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">Détails supplémentaires</h3>
                          <p className="text-muted-foreground">{eventData.additionalDetails}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
          <Button onClick={handleNext} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : currentStep === totalSteps ? (
              <>
                <Sparkles className="h-4 w-4" />
                Découvrir les prestataires
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
