import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date, locale: string = 'pt-BR'): string {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try to parse if it's already in DD/MM/YYYY format from a buggy input
      const parts = typeof dateString === 'string' ? dateString.split('/') : [];
      if (parts.length === 3) {
        const parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString(locale, { timeZone: 'UTC' }); // Use UTC to avoid timezone shifts from T00:00:00
        }
      }
      return "Data inválida";
    }
    return date.toLocaleDateString(locale, { timeZone: 'UTC' }); // Use UTC if date part is most important
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Data inválida";
  }
}

export function formatCurrency(value: number, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

// Helper to get current date as YYYY-MM-DD string
export function getCurrentDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
