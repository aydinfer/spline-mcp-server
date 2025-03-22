/**
 * Get API configuration from environment variables
 * @returns {Object} API configuration
 */
export function getApiConfig() {
  const apiKey = process.env.SPLINE_API_KEY;
  const baseUrl = process.env.SPLINE_API_URL || 'https://api.spline.design';

  if (!apiKey) {
    throw new Error('SPLINE_API_KEY environment variable is not set');
  }

  return {
    apiKey,
    baseUrl,
  };
}