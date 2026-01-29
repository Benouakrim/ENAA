"use server";

/**
 * DEPRECATED: The demand-driven proposal model has been replaced with a supply-driven marketplace model.
 * Vendors now create ServiceListings and clients make Bookings.
 * These functions are kept for backwards compatibility but will return errors.
 */

export async function getVendorProposals() {
  return {
    success: false,
    error: "Cette fonctionnalité n'est plus disponible. Veuillez gérer vos services depuis le tableau de bord.",
    data: [],
  };
}
