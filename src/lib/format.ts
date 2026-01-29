/**
 * Format a number as Euro currency using French locale
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "1 234,56 €")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Format a date using French locale
 * @param date - The date to format
 * @returns Formatted date string (e.g., "15 mars 2024")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}
