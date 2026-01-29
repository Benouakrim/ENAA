"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createServiceListing, updateServiceListing } from "@/actions/service-listing-actions";
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  MapPin,
  Euro,
  Image as ImageIcon,
  Tag,
} from "lucide-react";

const categories = [
  { value: "VENUE", label: "Lieu & Salle" },
  { value: "CATERER", label: "Traiteur" },
  { value: "PHOTOGRAPHER", label: "Photographe" },
  { value: "DJ", label: "DJ & Musique" },
  { value: "DECORATOR", label: "Décoration" },
  { value: "FLORIST", label: "Fleuriste" },
  { value: "VIDEOGRAPHER", label: "Vidéaste" },
  { value: "MAKEUP", label: "Maquillage & Coiffure" },
  { value: "PLANNER", label: "Wedding Planner" },
  { value: "PATISSERIE", label: "Pâtisserie" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ANIMATOR", label: "Animation" },
];

const priceTypes = [
  { value: "fixed", label: "Prix fixe" },
  { value: "per_person", label: "Par personne" },
  { value: "per_hour", label: "Par heure" },
  { value: "per_day", label: "Par jour" },
  { value: "quote", label: "Sur devis" },
];

const priceRanges = [
  { value: "BUDGET", label: "Budget (0-500€)" },
  { value: "STANDARD", label: "Standard (500-1500€)" },
  { value: "PREMIUM", label: "Premium (1500-4000€)" },
  { value: "LUXE", label: "Luxe (4000€+)" },
];

const eventTypes = [
  "Mariage",
  "Anniversaire",
  "Baptême",
  "Communion",
  "Fiançailles",
  "Baby Shower",
  "Soirée privée",
  "Événement corporate",
  "Remise de diplômes",
  "Autre",
];

const styles = [
  "Classique",
  "Moderne",
  "Bohème",
  "Champêtre",
  "Romantique",
  "Minimaliste",
  "Luxueux",
  "Vintage",
  "Oriental",
  "Tropical",
];

interface VendorProfile {
  id: string;
  city: string;
  region: string;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  region: string;
  address: string | null;
  priceType: string;
  price: number;
  priceMax: number | null;
  priceRange: string;
  eventTypes: string[];
  styles: string[];
  amenities: string[];
  images: string[];
  minCapacity: number | null;
  maxCapacity: number | null;
  active: boolean;
}

interface ServiceFormClientProps {
  vendorProfile: VendorProfile;
  mode: "create" | "edit";
  service?: ServiceData;
}

export default function ServiceFormClient({
  vendorProfile,
  mode,
  service,
}: ServiceFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dev-only mock data
  const isDev = process.env.NODE_ENV === 'development';
  const mockData = isDev && !service ? {
    title: "Salle de Réception Élégante au Cœur de Paris",
    description: "Magnifique salle de réception de 300m² avec une capacité d'accueil de 150 personnes. Décoration moderne et élégante, équipements audiovisuels professionnels, cuisine équipée, et une terrasse panoramique avec vue sur la ville. Idéale pour mariages, événements corporate et célébrations privées.",
    category: "VENUE",
    city: vendorProfile.city,
    region: vendorProfile.region,
    address: "15 Avenue des Champs-Élysées, Paris",
    priceType: "fixed",
    price: "2500",
    priceMax: "",
    priceRange: "PREMIUM",
    eventTypes: ["Mariage", "Corporatif", "Anniversaire"],
    styles: ["Moderne", "Chic/Luxe", "Romantique"],
    amenities: "Wi-Fi, Parking, Climatisation, Système audio, Éclairage LED, Cuisine équipée, Toilettes PMR",
    images: "https://placehold.co/800x600/e6e6fa/4a4a4a?text=Salle+Reception+1\nhttps://placehold.co/800x600/fff0f5/4a4a4a?text=Salle+Reception+2\nhttps://placehold.co/800x600/f0f8ff/4a4a4a?text=Salle+Reception+3",
    minCapacity: "50",
    maxCapacity: "150",
    active: true,
  } : null;
  
  const [formData, setFormData] = useState({
    title: service?.title || mockData?.title || "",
    description: service?.description || mockData?.description || "",
    category: service?.category || mockData?.category || "",
    city: service?.city || mockData?.city || vendorProfile.city,
    region: service?.region || mockData?.region || vendorProfile.region,
    address: service?.address || mockData?.address || "",
    priceType: service?.priceType || mockData?.priceType || "fixed",
    price: service?.price?.toString() || mockData?.price || "",
    priceMax: service?.priceMax?.toString() || mockData?.priceMax || "",
    priceRange: service?.priceRange || mockData?.priceRange || "STANDARD",
    eventTypes: service?.eventTypes || mockData?.eventTypes || [],
    styles: service?.styles || mockData?.styles || [],
    amenities: service?.amenities?.join(", ") || mockData?.amenities || "",
    images: service?.images?.join("\n") || mockData?.images || "",
    minCapacity: service?.minCapacity?.toString() || mockData?.minCapacity || "",
    maxCapacity: service?.maxCapacity?.toString() || mockData?.maxCapacity || "",
    active: service?.active ?? mockData?.active ?? true,
  });

  const handleEventTypeToggle = (eventType: string) => {
    setFormData({
      ...formData,
      eventTypes: formData.eventTypes.includes(eventType)
        ? formData.eventTypes.filter((e) => e !== eventType)
        : [...formData.eventTypes, eventType],
    });
  };

  const handleStyleToggle = (style: string) => {
    setFormData({
      ...formData,
      styles: formData.styles.includes(style)
        ? formData.styles.filter((s) => s !== style)
        : [...formData.styles, style],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast.error("Champs requis manquants", {
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        region: formData.region,
        address: formData.address || undefined,
        priceType: formData.priceType,
        price: parseFloat(formData.price),
        priceMax: formData.priceMax ? parseFloat(formData.priceMax) : undefined,
        priceRange: formData.priceRange,
        eventTypes: formData.eventTypes,
        styles: formData.styles,
        amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
        images: formData.images.split("\n").map((i) => i.trim()).filter(Boolean),
        minCapacity: formData.minCapacity ? parseInt(formData.minCapacity) : undefined,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        active: formData.active,
      };

      let result;
      if (mode === "edit" && service) {
        result = await updateServiceListing(service.id, serviceData);
      } else {
        result = await createServiceListing(serviceData);
      }

      if (result.success) {
        toast.success(mode === "edit" ? "Service mis à jour !" : "Service créé !", {
          description: mode === "edit" 
            ? "Vos modifications ont été enregistrées."
            : "Votre service est maintenant visible par les clients.",
        });
        router.push("/dashboard/vendor/services");
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de sauvegarder le service.",
        });
      }
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Erreur inattendue", {
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/vendor/services">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux services
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">
          {mode === "edit" ? "Modifier le service" : "Nouveau service"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {mode === "edit"
            ? "Modifiez les informations de votre service"
            : "Créez une nouvelle offre pour vos clients"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Les informations principales de votre service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Titre du service *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Photographe de mariage professionnel"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Service actif (visible par les clients)
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre service en détail..."
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 50 caractères. Décrivez ce qui rend votre service unique.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Paris"
                  required
                />
              </div>

              <div>
                <Label htmlFor="region">Région</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Ex: Île-de-France"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Tarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="priceType">Type de tarif</Label>
                <Select
                  value={formData.priceType}
                  onValueChange={(value) => setFormData({ ...formData, priceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Prix *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priceMax">Prix max (optionnel)</Label>
                <Input
                  id="priceMax"
                  type="number"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="priceRange">Gamme de prix</Label>
                <Select
                  value={formData.priceRange}
                  onValueChange={(value) => setFormData({ ...formData, priceRange: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.category === "VENUE" || formData.category === "CATERER") && (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="minCapacity">Capacité minimum</Label>
                  <Input
                    id="minCapacity"
                    type="number"
                    value={formData.minCapacity}
                    onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value })}
                    placeholder="Ex: 50"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxCapacity">Capacité maximum</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    placeholder="Ex: 200"
                    min="0"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Types & Styles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Types d&apos;événements & Styles
            </CardTitle>
            <CardDescription>
              Sélectionnez les types d&apos;événements et styles correspondants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Types d&apos;événements</Label>
              <div className="flex flex-wrap gap-2">
                {eventTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.eventTypes.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEventTypeToggle(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Styles</Label>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Button
                    key={style}
                    type="button"
                    variant={formData.styles.includes(style) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStyleToggle(style)}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images & Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Médias & Équipements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="images">URLs des images (une par ligne)</Label>
              <Textarea
                id="images"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                placeholder="https://exemple.com/image1.jpg&#10;https://exemple.com/image2.jpg"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ajoutez les URLs de vos images, une par ligne
              </p>
            </div>

            <div>
              <Label htmlFor="amenities">Équipements & Inclusions (séparés par des virgules)</Label>
              <Textarea
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, Parking, Climatisation, DJ inclus..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/vendor/services">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === "edit" ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === "edit" ? "Sauvegarder" : "Créer le service"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
