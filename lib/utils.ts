/**
 * Utility function to merge class names
 * Works with or without tailwind-merge
 */
export function cn(...inputs) {
  try {
    // Try to use tailwind-merge if available
    const { twMerge } = require('tailwind-merge');
    const { clsx } = require('clsx');
    return twMerge(clsx(inputs));
  } catch (e) {
    // Fallback: simple class name joining
    return inputs
      .filter(Boolean)
      .map(input => {
        if (typeof input === 'string') return input;
        if (typeof input === 'object' && input !== null) {
          return Object.entries(input)
            .filter(([_, value]) => Boolean(value))
            .map(([key]) => key)
            .join(' ');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
}