import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * List animations in a Spline scene
 * @param {Object} params - Parameters
 * @param {string} params.sceneId - ID of the Spline scene
 * @param {string} [params.objectId] - Optional object ID to filter animations
 * @returns {Promise<Object>} List of animations
 */
export async function listAnimations(params) {
  const { sceneId, objectId } = params;
  const apiConfig = getApiConfig();

  try {
    // Prepare request URL
    let url = `${apiConfig.baseUrl}/scenes/${sceneId}/animations`;
    
    // If objectId is provided, filter animations for that object
    if (objectId) {
      url = `${apiConfig.baseUrl}/scenes/${sceneId}/objects/${objectId}/animations`;
    }

    // Make API request to list animations
    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.apiKey}`,
        },
      }
    );

    return {
      success: true,
      animations: response.data.animations || [],
      total: response.data.total || 0,
      message: objectId 
        ? `Retrieved animations for object ${objectId} in scene ${sceneId}.`
        : `Retrieved all animations in scene ${sceneId}.`,
    };
  } catch (error) {
    console.error('Error listing animations:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}