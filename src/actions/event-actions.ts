"use server";

/**
 * DEPRECATED: The demand-driven event model has been replaced with a supply-driven marketplace model.
 * Clients now browse ServiceListings and make Bookings directly.
 * These functions are kept for backwards compatibility but will return errors.
 */

export async function createEvent() {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Veuillez parcourir nos services pour réserver.",
  };
}

export async function getEventsByUser() {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Consultez vos réservations dans le tableau de bord.",
    data: [],
  };
}

export async function getAllEvents() {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible.",
    data: [],
  };
}

export async function getOpenEvents() {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Les prestataires gèrent leurs services directement.",
    data: [],
  };
}

export async function acceptProposal(_proposalId?: string, _eventId?: string) {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Le système de propositions a été remplacé par des réservations directes.",
  };
}
