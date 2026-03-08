/**
 * Utility functions for handling API errors consistently across the application
 */

/**
 * Handles API response errors and returns appropriate error messages
 * @param {Response} response - The fetch response object
 * @param {string} defaultMessage - Default error message if parsing fails
 * @returns {Promise<string>} - Error message to display to user
 */
export const handleApiError = async (response, defaultMessage = 'An error occurred') => {
  // Handle rate limiting
  if (response.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Handle other HTTP errors
  try {
    const data = await response.json();
    return data.message || defaultMessage;
  } catch (parseError) {
    // If response is not JSON, return default message
    return defaultMessage;
  }
};

/**
 * Handles fetch errors (network issues, etc.)
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @returns {string} - Error message to display to user
 */
export const handleFetchError = (error, defaultMessage = 'Network error. Please try again.') => {
  console.error('Fetch error:', error);
  
  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    return 'Server error. Please try again later.';
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return defaultMessage;
};

/**
 * Makes an API request with consistent error handling
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const apiRequest = async (url, options = {}, errorMessage = 'Request failed') => {
  try {
    const response = await fetch(url, options);
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await handleApiError(response, errorMessage);
      return { success: false, error };
    }
  } catch (error) {
    const errorMessage = handleFetchError(error, errorMessage);
    return { success: false, error: errorMessage };
  }
};
