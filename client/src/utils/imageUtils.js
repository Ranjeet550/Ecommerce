/**
 * Utility functions for handling images
 */

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // For local development
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }

  // For production, use the environment variable or fallback to a default
  return import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://your-backend-api-url.com';
};

// Base URL for the API
const API_BASE_URL = getApiBaseUrl();

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path from the database
 * @returns {string} The full URL for the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If the image path is already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If the image path starts with a slash, append it to the API base URL
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's a relative path and append it to the API base URL
  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Get a placeholder image URL for a product
 * @param {string} productName - The name of the product
 * @returns {string} A placeholder image URL
 */
export const getPlaceholderImage = (productName = '') => {
  // Use a placeholder image service with the product name as text
  const encodedName = encodeURIComponent(productName);
  return `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodedName}`;
};
