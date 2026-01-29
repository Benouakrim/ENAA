"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateVendorProfile } from "@/actions/vendor-actions";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Save,
  Loader2,
  ArrowLeft,
  Clock,
  Navigation,
} from "lucide-react";
import Link from "next/link";

const responseTimeOptions = [
  { value: "< 1h", label: "Moins d'1 heure" },
  { value: "< 4h", label: "Moins de 4 heures" },
  { value: "< 24h", label: "Moins de 24 heures" },
  { value: "< 48h", label: "Moins de 48 heures" },
  { value: "< 1 semaine", label: "Moins d'une semaine" },
];

const teamSizeOptions = [
  { value: "Solo", label: "Solo" },
  { value: "2-5 personnes", label: "2-5 personnes" },
  { value: "6-10 personnes", label: "6-10 personnes" },
  { value: "11-20 personnes", label: "11-20 personnes" },
  { value: "20+ personnes", label: "Plus de 20 personnes" },
];

interface VendorProfile {
  id: string;
  companyName: string;
  description: string | null;
  city: string;
  region: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  yearFounded: number | null;
  teamSize: string | null;
  travelRadius: number | null;
  responseTime: string | null;
}

interface VendorProfileEditClientProps {
  profile: VendorProfile;
}

export default function VendorProfileEditClient({ profile }: VendorProfileEditClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dev-only mock data for empty fields
  const isDev = process.env.NODE_ENV === 'development';
  const mockFallback = (actual: string | null | undefined, mock: string) => 
    actual || (isDev ? mock : "");
  
  const [formData, setFormData] = useState({
    companyName: profile.companyName,
    description: mockFallback(profile.description, "Spécialiste de l'organisation d'événements depuis plus de 10 ans. Nous créons des expériences uniques et mémorables pour vos moments les plus précieux. Notre équipe passionnée met tout en œuvre pour transformer vos rêves en réalité avec professionnalisme et créativité."),
    city: profile.city,
    region: mockFallback(profile.region, "Île-de-France"),
    address: mockFallback(profile.address, "42 Rue du Commerce, 75015 Paris"),
    phone: mockFallback(profile.phone, "+33 1 42 56 78 90"),
    email: mockFallback(profile.email, "contact@events-prestige.fr"),
    website: mockFallback(profile.website, "https://www.events-prestige.fr"),
    instagram: mockFallback(profile.instagram, "@events_prestige_paris"),
    facebook: mockFallback(profile.facebook, "EventsPrestigeParis"),
    yearFounded: profile.yearFounded?.toString() || (isDev ? "2010" : ""),
    teamSize: profile.teamSize || (isDev ? "6-10 personnes" : ""),
    travelRadius: profile.travelRadius?.toString() || (isDev ? "100" : ""),
    responseTime: profile.responseTime || (isDev ? "< 4h" : ""),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.description || !formData.city) {
      toast.error("Champs requis manquants", {
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }

    if (formData.description.length < 50) {
      toast.error("Description trop courte", {
        description: "La description doit contenir au moins 50 caractères.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateVendorProfile({
        companyName: formData.companyName,
        description: formData.description,
        city: formData.city,
        region: formData.region || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        yearFounded: formData.yearFounded ? parseInt(formData.yearFounded) : undefined,
        teamSize: formData.teamSize || undefined,
        travelRadius: formData.travelRadius ? parseInt(formData.travelRadius) : undefined,
        responseTime: formData.responseTime || undefined,
      });

      if (result.success) {
        toast.success("Profil mis à jour !", {
          description: "Vos modifications ont été enregistrées avec succès.",
        });
        router.push("/dashboard/vendor/profile");
        router.refresh();
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de mettre à jour le profil.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
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
        <Link href="/dashboard/vendor/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au profil
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Modifier mon profil</h1>
        <p className="text-muted-foreground mt-1">
          Mettez à jour vos informations professionnelles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>Les informations de base de votre entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">
                Nom de l&apos;entreprise <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ex: Élégance Events"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez vos services et votre expertise..."
                rows={5}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 50 caractères ({formData.description.length}/50)
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearFounded">Année de création</Label>
                <Input
                  id="yearFounded"
                  type="number"
                  value={formData.yearFounded}
                  onChange={(e) => setFormData({ ...formData, yearFounded: e.target.value })}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              <div>
                <Label htmlFor="teamSize">Taille de l&apos;équipe</Label>
                <Select
                  value={formData.teamSize}
                  onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="responseTime">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Temps de réponse habituel
                </Label>
                <Select
                  value={formData.responseTime}
                  onValueChange={(value) => setFormData({ ...formData, responseTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {responseTimeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="travelRadius">
                  <Navigation className="h-4 w-4 inline mr-1" />
                  Zone de déplacement (km)
                </Label>
                <Input
                  id="travelRadius"
                  type="number"
                  value={formData.travelRadius}
                  onChange={(e) => setFormData({ ...formData, travelRadius: e.target.value })}
                  placeholder="Ex: 50"
                  min="0"
                />
              </div>
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
                <Label htmlFor="city">
                  Ville <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Région</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Île-de-France"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse complète</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Réseaux sociaux</CardTitle>
            <CardDescription>Comment vos clients peuvent vous contacter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email professionnel
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">
                <Globe className="h-4 w-4 inline mr-1" />
                Site web
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.exemple.fr"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">
                  <Instagram className="h-4 w-4 inline mr-1" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="username (sans @)"
                />
              </div>
              <div>
                <Label htmlFor="facebook">
                  <Facebook className="h-4 w-4 inline mr-1" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/vendor/profile">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
