/**
 * Currency utility functions
 */

// Get currency symbol from environment variable
export const getCurrency = (): string => {
  return import.meta.env.VITE_CURRENCY || '$';
};

// Format price with currency symbol
export const formatPrice = (price: number): string => {
  const currency = getCurrency();
  return `${currency}${price.toFixed(2)}`;
};

// Format price without decimals for whole numbers
export const formatPriceSimple = (price: number): string => {
  const currency = getCurrency();
  return price % 1 === 0 ? `${currency}${price}` : `${currency}${price.toFixed(2)}`;
};

// Get currency symbol only
export const getCurrencySymbol = (): string => {
  return getCurrency();
};