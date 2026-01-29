import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { getEventsByUser } from "@/actions/event-actions";
import { getUserOnboardingStatus } from "@/actions/user-actions";
import OnboardingStatus from "@/components/OnboardingStatus";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Sparkles,
  Heart,
  Cake,
  Briefcase,
  Wine,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Euro,
  ChevronRight,
  Church,
  GraduationCap,
  Baby,
  Gem,
} from "lucide-react";

type EventWithProposals = {
  id: string;
  type: string;
  date: Date;
  city: string;
  guestCount: number;
  budgetRange: string;
  vibe: string | null;
  status: string;
  proposals?: Array<{ id: string; status: string }>;
  services?: string[];
};

const eventTypeIcons: Record<string, any> = {
  Mariage: Heart,
  Anniversaire: Cake,
  Corporatif: Briefcase,
  "Soirée Privée": Wine,
  "Baptême/Communion": Church,
  "Remise de diplômes": GraduationCap,
  "Baby Shower": Baby,
  Fiançailles: Gem,
};

export default async function ClientDashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const userName = user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0] || "Utilisateur";

  // Fetch user's onboarding status
  const onboardingStatus = await getUserOnboardingStatus(user.id);

  // Fetch user's events
  const result = await getEventsByUser();
  const events: EventWithProposals[] = result.success && result.data ? result.data : [];

  // Calculate statistics
  const totalEvents = events.length;
  const openEvents = events.filter((e) => e.status === "OPEN").length;
  const bookedEvents = events.filter((e) => e.status === "BOOKED").length;
  const totalProposals = events.reduce((acc, e) => acc + (e.proposals?.length || 0), 0);
  const pendingProposals = events.reduce(
    (acc, e) => acc + (e.proposals?.filter((p) => p.status === "PENDING").length || 0),
    0
  );

  // Get upcoming events (sorted by date)
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos événements et consultez les propositions des prestataires
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/create-event">
            <Plus className="h-5 w-5" />
            Créer un événement
          </Link>
        </Button>
      </div>

      {/* Onboarding Status */}
      {onboardingStatus && (
        <OnboardingStatus
          onboardingCompleted={onboardingStatus.onboardingCompleted}
          wizardCompleted={onboardingStatus.wizardCompleted}
          role={onboardingStatus.role}
          preferences={{
            preferredEventTypes: onboardingStatus.preferredEventTypes,
            preferredBudget: onboardingStatus.preferredBudget,
            preferredGuestCount: onboardingStatus.preferredGuestCount,
            preferredStyles: onboardingStatus.preferredStyles,
            preferredRegion: onboardingStatus.preferredRegion,
          }}
        />
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total événements</p>
                <p className="text-3xl font-bold text-blue-600">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">En cours</p>
                <p className="text-3xl font-bold text-green-600">{openEvents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Propositions</p>
                <p className="text-3xl font-bold text-purple-600">{totalProposals}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">En attente</p>
                <p className="text-3xl font-bold text-amber-600">{pendingProposals}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Prochains événements</CardTitle>
              <CardDescription>Vos événements à venir</CardDescription>
            </div>
            <Link href="#all-events" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const EventIcon = eventTypeIcons[event.type] || Calendar;
                const daysUntil = Math.ceil(
                  (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Link
                    key={event.id}
                    href={`/dashboard/event/${event.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <EventIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{event.type}</h3>
                        <StatusBadge status={event.status as any} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.city}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={daysUntil <= 7 ? "destructive" : daysUntil <= 30 ? "secondary" : "outline"}>
                        {daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? "Demain" : `J-${daysUntil}`}
                      </Badge>
                      {event.proposals && event.proposals.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.proposals.length} proposition(s)
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Events Section */}
      <div id="all-events">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Tous mes événements</h2>
          {events.length > 0 && (
            <p className="text-sm text-muted-foreground">{events.length} événement(s)</p>
          )}
        </div>

        {events.length === 0 ? (
          // Empty State
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun événement pour le moment
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Commencez par créer votre premier événement et recevez des propositions de prestataires qualifiés
              </p>
              <Button asChild size="lg">
                <Link href="/create-event">
                  <Plus className="mr-2 h-5 w-5" />
                  Créer mon premier événement
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Events Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: EventWithProposals) => {
              const EventIcon = eventTypeIcons[event.type] || Calendar;

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/event/${event.id}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <EventIcon className="h-6 w-6 text-primary" />
                        </div>
                        <StatusBadge status={event.status as any} />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {event.type}
                      </CardTitle>
                      <CardDescription>
                        {event.vibe || "Style non défini"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.guestCount} invités</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        <span>{event.budgetRange}</span>
                      </div>

                      {/* Services */}
                      {event.services && event.services.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {event.services.slice(0, 3).map((service) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {event.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{event.services.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Proposals Count */}
                      {event.proposals && event.proposals.length > 0 && (
                        <div className="pt-3 border-t border-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Propositions reçues</span>
                            <span className="font-semibold text-primary flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {event.proposals.length}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
