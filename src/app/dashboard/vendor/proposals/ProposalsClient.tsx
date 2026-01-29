"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Euro,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";

interface Proposal {
  id: string;
  eventId: string;
  price: number;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    type: string;
    date: string;
    city: string;
    guestCount: number;
    budgetRange: string;
    status: string;
    client: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
}

interface ProposalsClientProps {
  initialProposals: Proposal[];
}

export default function ProposalsClient({ initialProposals }: ProposalsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Calculate statistics
  const stats = useMemo(() => {
    const total = initialProposals.length;
    const pending = initialProposals.filter((p) => p.status === "PENDING").length;
    const accepted = initialProposals.filter((p) => p.status === "ACCEPTED").length;
    const rejected = initialProposals.filter((p) => p.status === "REJECTED").length;
    const totalRevenue = initialProposals
      .filter((p) => p.status === "ACCEPTED")
      .reduce((sum, p) => sum + p.price, 0);

    return { total, pending, accepted, rejected, totalRevenue };
  }, [initialProposals]);

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let filtered = [...initialProposals];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          p.event.type.toLowerCase().includes(searchLower) ||
          p.event.city.toLowerCase().includes(searchLower) ||
          p.event.client.firstName?.toLowerCase().includes(searchLower) ||
          p.event.client.lastName?.toLowerCase().includes(searchLower) ||
          p.event.client.email.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "eventDate") {
        comparison = new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [initialProposals, statusFilter, searchQuery, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Propositions</h1>
          <p className="text-gray-600 mt-1">Suivez l&apos;état de toutes vos propositions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="border-blue-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">En attente</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Acceptées</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Refusées</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Revenus</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalRevenue.toLocaleString()}€
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par type, ville, client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="ACCEPTED">Acceptées</SelectItem>
                    <SelectItem value="REJECTED">Refusées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date de création</SelectItem>
                      <SelectItem value="eventDate">Date événement</SelectItem>
                      <SelectItem value="price">Prix</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                    {sortOrder === "asc" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune proposition trouvée
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || statusFilter !== "ALL"
                    ? "Essayez de modifier vos filtres de recherche."
                    : "Vous n'avez pas encore envoyé de propositions."}
                </p>
                {!searchQuery && statusFilter === "ALL" && (
                  <Link href="/dashboard/vendor">
                    <Button>Voir les opportunités</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => {
              const clientName = proposal.event.client.firstName
                ? `${proposal.event.client.firstName} ${proposal.event.client.lastName || ""}`
                : proposal.event.client.email;

              return (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {proposal.event.type}
                          </h3>
                          <Badge className={getStatusColor(proposal.status)}>
                            {getStatusIcon(proposal.status)}
                            <span className="ml-1">
                              {proposal.status === "PENDING"
                                ? "En attente"
                                : proposal.status === "ACCEPTED"
                                ? "Acceptée"
                                : "Refusée"}
                            </span>
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>Client: {clientName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{proposal.event.city}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(proposal.event.date)}</span>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{proposal.event.guestCount} invités</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Euro className="h-4 w-4" />
                              <span>Budget: {proposal.event.budgetRange}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>Envoyée le {formatDate(proposal.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {proposal.message && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700 italic">
                              &quot;{proposal.message}&quot;
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {proposal.price.toLocaleString()}€
                        </div>
                        <Link href={`/dashboard/vendor/opportunities/${proposal.eventId}`}>
                          <Button variant="outline" size="sm">
                            Voir l&apos;événement
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
