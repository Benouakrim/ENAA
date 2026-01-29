"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVendorProfile } from "@/actions/vendor-actions";
import {
  Check,
  Sparkles,
  Building2,
  MapPin,
  UtensilsCrossed,
  Camera,
  Music,
  Lamp,
  Flower,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Euro,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ImageIcon,
  Star,
  Clock,
  Users,
  Video,
  Mic,
  Car,
  Scissors,
  Wand2,
  Cake,
  Calendar,
  FileText,
  Briefcase,
  CheckCircle2,
  Heart,
} from "lucide-react";

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

type PriceRange = "Standard" | "Premium" | "Luxe" | null;

type EventType = "Mariage" | "Anniversaire" | "Corporatif" | "Soirée Privée" | "Tous types";

interface VendorData {
  // Step 1: Company Info
  companyName: string;
  description: string;
  yearFounded: string;
  teamSize: string;
  
  // Step 2: Location
  city: string;
  address: string;
  travelRadius: string;
  
  // Step 3: Services
  services: Service[];
  specializations: string[];
  
  // Step 4: Pricing
  priceRange: PriceRange;
  minimumBudget: string;
  
  // Step 5: Experience
  yearsExperience: string;
  eventsCompleted: string;
  eventTypes: EventType[];
  
  // Step 6: Contact & Socials
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  
  // Step 7: Additional Info
  portfolio: string;
  certifications: string;
  availability: string;
}

const serviceOptions = [
  { id: "Lieu/Salle" as const, label: "Lieu/Salle", description: "Location de salle", icon: MapPin },
  { id: "Traiteur" as const, label: "Traiteur", description: "Service de restauration", icon: UtensilsCrossed },
  { id: "Photographe" as const, label: "Photographe", description: "Capturer les moments", icon: Camera },
  { id: "DJ/Musique" as const, label: "DJ/Musique", description: "Animation musicale", icon: Music },
  { id: "Décoration" as const, label: "Décoration", description: "Mise en scène", icon: Lamp },
  { id: "Fleuriste" as const, label: "Fleuriste", description: "Compositions florales", icon: Flower },
  { id: "Vidéaste" as const, label: "Vidéaste", description: "Film souvenir", icon: Video },
  { id: "Animation" as const, label: "Animation", description: "Divertissement", icon: Mic },
  { id: "Transport" as const, label: "Transport", description: "Véhicules de prestige", icon: Car },
  { id: "Wedding Planner" as const, label: "Wedding Planner", description: "Organisation complète", icon: Wand2 },
  { id: "Maquillage/Coiffure" as const, label: "Maquillage/Coiffure", description: "Beauté et style", icon: Scissors },
  { id: "Pâtisserie" as const, label: "Pâtisserie", description: "Gâteaux et desserts", icon: Cake },
];

const priceRangeOptions = [
  { value: "Standard" as const, label: "Standard", description: "Offres accessibles et compétitives", icon: Euro },
  { value: "Premium" as const, label: "Premium", description: "Services haut de gamme", icon: Star },
  { value: "Luxe" as const, label: "Luxe", description: "Excellence et prestige", icon: Award },
];

const eventTypeOptions = [
  { id: "Tous types" as const, label: "Tous types d'événements" },
  { id: "Mariage" as const, label: "Mariages" },
  { id: "Anniversaire" as const, label: "Anniversaires" },
  { id: "Corporatif" as const, label: "Événements corporate" },
  { id: "Soirée Privée" as const, label: "Soirées privées" },
];

const teamSizeOptions = [
  { value: "1", label: "Je travaille seul(e)" },
  { value: "2-5", label: "2 à 5 personnes" },
  { value: "6-10", label: "6 à 10 personnes" },
  { value: "11-20", label: "11 à 20 personnes" },
  { value: "20+", label: "Plus de 20 personnes" },
];

const travelRadiusOptions = [
  { value: "local", label: "Ma ville uniquement" },
  { value: "region", label: "Ma région (50km)" },
  { value: "national", label: "France entière" },
  { value: "international", label: "International" },
];

export default function VendorWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dev-only mock data
  const isDev = process.env.NODE_ENV === 'development';
  
  const [vendorData, setVendorData] = useState<VendorData>({
    companyName: isDev ? "Élégance Événements Paris" : "",
    description: isDev ? "Spécialiste de l'organisation d'événements haut de gamme depuis 2015. Nous créons des expériences uniques et inoubliables pour vos mariages, anniversaires et événements corporate. Notre équipe passionnée met son expertise à votre service pour réaliser vos rêves les plus fous." : "",
    yearFounded: isDev ? "2015" : "",
    teamSize: isDev ? "6-10" : "",
    city: isDev ? "Paris" : "",
    address: isDev ? "42 Avenue Montaigne, 75008 Paris" : "",
    travelRadius: isDev ? "region" : "",
    services: isDev ? ["Lieu/Salle", "Décoration", "Wedding Planner"] : [],
    specializations: isDev ? ["Mariages de luxe", "Événements corporate", "Décoration florale"] : [],
    priceRange: isDev ? "Premium" : null,
    minimumBudget: isDev ? "5000" : "",
    yearsExperience: isDev ? "8" : "",
    eventsCompleted: isDev ? "150" : "",
    eventTypes: isDev ? ["Mariage", "Corporatif"] : [],
    phone: isDev ? "+33 1 42 56 78 90" : "",
    email: isDev ? "contact@elegance-events.fr" : "",
    website: isDev ? "https://www.elegance-events.fr" : "",
    instagram: isDev ? "@elegance_events_paris" : "",
    facebook: isDev ? "EleganceEventsParis" : "",
    portfolio: isDev ? "https://www.elegance-events.fr/portfolio" : "",
    certifications: isDev ? "Certifié Wedding Planner International, Label Qualité Événementiel" : "",
    availability: isDev ? "Disponible toute l'année, réservation recommandée 6 mois à l'avance pour les mariages" : "",
  });

  const totalSteps = 7;
  const stepTitles = [
    "Votre entreprise",
    "Localisation",
    "Services proposés",
    "Tarification",
    "Expérience",
    "Contact & Réseaux",
    "Récapitulatif",
  ];

  const handleServiceToggle = (service: Service) => {
    const isSelected = vendorData.services.includes(service);
    setVendorData({
      ...vendorData,
      services: isSelected
        ? vendorData.services.filter((s) => s !== service)
        : [...vendorData.services, service],
    });
  };

  const handleEventTypeToggle = (eventType: EventType) => {
    const isSelected = vendorData.eventTypes.includes(eventType);
    setVendorData({
      ...vendorData,
      eventTypes: isSelected
        ? vendorData.eventTypes.filter((e) => e !== eventType)
        : [...vendorData.eventTypes, eventType],
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createVendorProfile({
        companyName: vendorData.companyName,
        description: vendorData.description,
        city: vendorData.city,
      });

      if (result.success) {
        toast.success("Profil créé avec succès !", {
          description: "Bienvenue dans notre réseau de prestataires d'excellence.",
        });
        router.push("/dashboard/vendor");
      } else {
        toast.error("Erreur lors de l'inscription", {
          description: result.error || "Une erreur est survenue. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur", { description: "Une erreur inattendue est survenue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSkipStep = (step: number) => [4, 5, 6].includes(step);

  const handleSkip = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handleNext = async () => {
    if (currentStep === 1 && (!vendorData.companyName || vendorData.description.length < 50)) {
      toast.error("Veuillez remplir les champs obligatoires", {
        description: "Le nom et la description (min. 50 caractères) sont requis.",
      });
      return;
    }
    if (currentStep === 2 && !vendorData.city) {
      toast.error("Veuillez indiquer votre ville");
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
      case 1: return vendorData.companyName && vendorData.description.length >= 50;
      case 2: return !!vendorData.city;
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
          {/* Step 1: Company Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Présentez votre entreprise</h2>
                <p className="text-muted-foreground">Ces informations aideront les clients à vous connaître</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Nom de l&apos;entreprise <span className="text-destructive">*</span>
                  </Label>
                  <Input id="companyName" placeholder="Ex: Élégance Événements" value={vendorData.companyName} onChange={(e) => setVendorData({ ...vendorData, companyName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />Description de votre activité <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Minimum 50 caractères - {vendorData.description.length}/50</p>
                  <Textarea id="description" placeholder="Décrivez votre entreprise, vos services, votre expérience..." value={vendorData.description} onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })} className="min-h-[150px]" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearFounded" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />Année de création
                    </Label>
                    <Input id="yearFounded" type="number" placeholder="2015" value={vendorData.yearFounded} onChange={(e) => setVendorData({ ...vendorData, yearFounded: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />Taille de l&apos;équipe
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {teamSizeOptions.slice(0, 4).map((option) => (
                        <Card key={option.value} className={`cursor-pointer transition-all ${vendorData.teamSize === option.value ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setVendorData({ ...vendorData, teamSize: option.value })}>
                          <CardContent className="p-3 text-center">
                            <p className="text-sm font-medium">{option.label}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Où êtes-vous situé ?</h2>
                <p className="text-muted-foreground">Indiquez votre zone d&apos;intervention</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />Ville principale <span className="text-destructive">*</span>
                  </Label>
                  <Input id="city" placeholder="Paris, Lyon, Marseille..." value={vendorData.city} onChange={(e) => setVendorData({ ...vendorData, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Adresse (optionnel)
                  </Label>
                  <Input id="address" placeholder="123 Rue de la Paix" value={vendorData.address} onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />Zone de déplacement
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {travelRadiusOptions.map((option) => (
                      <Card key={option.value} className={`cursor-pointer transition-all ${vendorData.travelRadius === option.value ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setVendorData({ ...vendorData, travelRadius: option.value })}>
                        <CardContent className="p-4 text-center">
                          <p className="font-medium">{option.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quels services proposez-vous ?</h2>
                <p className="text-muted-foreground">Sélectionnez tous les services que vous offrez</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                {serviceOptions.map((service) => {
                  const Icon = service.icon;
                  const isSelected = vendorData.services.includes(service.id);
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
              {vendorData.services.length > 0 && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">{vendorData.services.length} service(s) sélectionné(s) : {vendorData.services.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Quelle est votre gamme de prix ?</h2>
                <p className="text-muted-foreground">Définissez votre positionnement tarifaire</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                {priceRangeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = vendorData.priceRange === option.value;
                  return (
                    <Card key={option.value} className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setVendorData({ ...vendorData, priceRange: option.value })}>
                      <CardContent className="p-6 text-center relative">
                        {isSelected && <div className="absolute top-3 right-3"><div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div></div>}
                        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                          <Icon className={`h-8 w-8 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <h3 className="text-xl font-bold">{option.label}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{option.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="max-w-md mx-auto mt-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumBudget" className="text-sm font-medium flex items-center gap-2">
                    <Euro className="h-4 w-4" />Budget minimum par prestation (optionnel)
                  </Label>
                  <Input id="minimumBudget" type="text" placeholder="Ex: 500€" value={vendorData.minimumBudget} onChange={(e) => setVendorData({ ...vendorData, minimumBudget: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Experience */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Parlez-nous de votre expérience</h2>
                <p className="text-muted-foreground">Ces informations renforcent la confiance des clients</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />Années d&apos;expérience
                    </Label>
                    <Input id="yearsExperience" type="number" placeholder="5" value={vendorData.yearsExperience} onChange={(e) => setVendorData({ ...vendorData, yearsExperience: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventsCompleted" className="text-sm font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />Événements réalisés
                    </Label>
                    <Input id="eventsCompleted" type="number" placeholder="100" value={vendorData.eventsCompleted} onChange={(e) => setVendorData({ ...vendorData, eventsCompleted: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" />Types d&apos;événements
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {eventTypeOptions.map((option) => {
                      const isSelected = vendorData.eventTypes.includes(option.id);
                      return (
                        <Card key={option.id} className={`cursor-pointer transition-all ${isSelected ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => handleEventTypeToggle(option.id)}>
                          <CardContent className="p-3 flex items-center gap-2">
                            <Checkbox checked={isSelected} onCheckedChange={() => handleEventTypeToggle(option.id)} />
                            <span className="text-sm font-medium">{option.label}</span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />Certifications / Diplômes
                  </Label>
                  <Textarea id="certifications" placeholder="Listez vos certifications, formations, diplômes..." value={vendorData.certifications} onChange={(e) => setVendorData({ ...vendorData, certifications: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Contact & Socials */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Vos coordonnées</h2>
                <p className="text-muted-foreground">Comment les clients peuvent-ils vous contacter ?</p>
              </div>
              <div className="space-y-6 mt-8 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />Téléphone
                    </Label>
                    <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={vendorData.phone} onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />Email professionnel
                    </Label>
                    <Input id="email" type="email" placeholder="contact@votreentreprise.com" value={vendorData.email} onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />Site web
                  </Label>
                  <Input id="website" type="url" placeholder="https://www.votreentreprise.com" value={vendorData.website} onChange={(e) => setVendorData({ ...vendorData, website: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-sm font-medium flex items-center gap-2">
                      <Instagram className="h-4 w-4" />Instagram
                    </Label>
                    <Input id="instagram" placeholder="@votre_compte" value={vendorData.instagram} onChange={(e) => setVendorData({ ...vendorData, instagram: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-sm font-medium flex items-center gap-2">
                      <Facebook className="h-4 w-4" />Facebook
                    </Label>
                    <Input id="facebook" placeholder="Votre page Facebook" value={vendorData.facebook} onChange={(e) => setVendorData({ ...vendorData, facebook: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio" className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />Lien vers portfolio / galerie
                  </Label>
                  <Input id="portfolio" type="url" placeholder="https://..." value={vendorData.portfolio} onChange={(e) => setVendorData({ ...vendorData, portfolio: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Summary */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Récapitulatif de votre profil</h2>
                <p className="text-muted-foreground">Vérifiez vos informations avant de créer votre profil</p>
              </div>
              <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Building2 className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Entreprise</h3><p className="text-lg font-bold text-primary">{vendorData.companyName}</p><p className="text-sm text-muted-foreground mt-1">{vendorData.description.substring(0, 150)}...</p></div></div></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><MapPin className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Localisation</h3><p className="text-muted-foreground">{vendorData.city}{vendorData.travelRadius && ` • ${travelRadiusOptions.find(o => o.value === vendorData.travelRadius)?.label}`}</p></div></div></CardContent></Card>
                <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Sparkles className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Services proposés</h3><div className="flex flex-wrap gap-2 mt-2">{vendorData.services.map((service) => (<span key={service} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{service}</span>))}</div></div></div></CardContent></Card>
                {vendorData.priceRange && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Euro className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Gamme de prix</h3><p className="text-muted-foreground">{vendorData.priceRange}{vendorData.minimumBudget && ` • Budget minimum: ${vendorData.minimumBudget}`}</p></div></div></CardContent></Card>}
                {(vendorData.phone || vendorData.email) && <Card className="border-border"><CardContent className="p-4"><div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Phone className="h-6 w-6 text-primary" /></div><div className="flex-1"><h3 className="font-semibold text-foreground mb-1">Contact</h3><p className="text-muted-foreground">{vendorData.phone && `Tél: ${vendorData.phone}`}{vendorData.phone && vendorData.email && " • "}{vendorData.email && `Email: ${vendorData.email}`}</p></div></div></CardContent></Card>}
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
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Création en cours...</>) : currentStep === totalSteps ? (<><CheckCircle2 className="h-4 w-4" />Créer mon profil</>) : (<>Suivant<ChevronRight className="h-4 w-4" /></>)}
          </Button>
        </div>
      </div>
    </div>
  );
}
