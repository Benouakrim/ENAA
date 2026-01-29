"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Share2,
  Phone,
  Mail,
  Globe,
  Instagram,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ServiceType, serviceTypeLabels } from "@/lib/service-types";
import { toast } from "sonner";

interface ServiceDetailClientProps {
  service: any;
}

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const images = service.images?.length > 0 
    ? service.images 
    : ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: service.name,
        text: service.description,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  const handleContact = async () => {
    if (!message.trim()) {
      toast.error("Veuillez écrire un message");
      return;
    }
    
    setIsSending(true);
    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Message envoyé au prestataire !");
    setMessage("");
    setIsSending(false);
  };

  const formatPrice = (min: number, max: number) => {
    if (min === max) return `${min}€`;
    return `${min}€ - ${max}€`;
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case "BUDGET": return "Budget";
      case "STANDARD": return "Standard";
      case "PREMIUM": return "Premium";
      case "LUXE": return "Luxe";
      default: return range;
    }
  };

  // Get type-specific details
  const getSpecificDetails = () => {
    const details: { label: string; value: string }[] = [];

    if (service.capacity) {
      details.push({ label: "Capacité", value: `${service.capacity} personnes` });
    }
    if (service.venueType) {
      details.push({ label: "Type de lieu", value: service.venueType });
    }
    if (service.cuisineTypes?.length) {
      details.push({ label: "Types de cuisine", value: service.cuisineTypes.join(", ") });
    }
    if (service.musicStyles?.length) {
      details.push({ label: "Styles musicaux", value: service.musicStyles.join(", ") });
    }
    if (service.styles?.length) {
      details.push({ label: "Styles", value: service.styles.join(", ") });
    }
    if (service.specialties?.length) {
      details.push({ label: "Spécialités", value: service.specialties.join(", ") });
    }
    if (service.packages?.length) {
      details.push({ label: "Forfaits", value: service.packages.join(", ") });
    }
    if (service.equipment?.length) {
      details.push({ label: "Équipement", value: service.equipment.join(", ") });
    }
    if (service.amenities?.length) {
      details.push({ label: "Équipements", value: service.amenities.join(", ") });
    }
    if (service.services?.length) {
      details.push({ label: "Services", value: service.services.join(", ") });
    }

    return details;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/client/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour aux résultats
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
            <Image
              src={images[currentImageIndex]}
              alt={service.name}
              fill
              className="object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            {service.featured && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary text-white gap-1">
                  <Sparkles className="h-3 w-3" />
                  En vedette
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 ${
                    index === currentImageIndex ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title and Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {serviceTypeLabels[service.serviceType as ServiceType]}
                  </Badge>
                  {service.verified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground">{service.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{service.city}, {service.region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{service.rating?.toFixed(1)}</span>
                    <span>({service.reviewCount} avis)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            {getSpecificDetails().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {getSpecificDetails().map((detail, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {detail.label}
                        </p>
                        <p className="text-foreground">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Types */}
            {service.eventTypes?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Types d&apos;événements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {service.eventTypes.map((type: string) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tarif</span>
                  <Badge variant="outline">{getPriceRangeLabel(service.priceRange)}</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(service.priceMin, service.priceMax)}
                  </span>
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-4">
                <Textarea
                  placeholder="Bonjour, je suis intéressé(e) par vos services pour mon événement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button
                  className="w-full gap-2"
                  onClick={handleContact}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Contacter le prestataire
                    </>
                  )}
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t">
                {service.phone && (
                  <a
                    href={`tel:${service.phone}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{service.phone}</span>
                  </a>
                )}
                {service.email && (
                  <a
                    href={`mailto:${service.email}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{service.email}</span>
                  </a>
                )}
                {service.website && (
                  <a
                    href={service.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Site web</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
                {service.instagram && (
                  <a
                    href={`https://instagram.com/${service.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>{service.instagram}</span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
