import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Get details about a Spline scene
 * @param {Object} params - Parameters
 * @param {string} params.sceneId - ID of the Spline scene
 * @returns {Promise<Object>} Scene details
 */
export async function getSceneDetails(params) {
  const { sceneId } = params;
  const apiConfig = getApiConfig();

  try {
    // Make API request to get scene details
    const response = await axios.get(
      `${apiConfig.baseUrl}/scenes/${sceneId}`,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.apiKey}`,
        },
      }
    );

    return {
      success: true,
      scene: response.data,
    };
  } catch (error) {
    console.error('Error getting scene details:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}