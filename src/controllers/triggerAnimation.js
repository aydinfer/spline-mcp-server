import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Trigger an animation in a Spline scene
 * @param {Object} params - Parameters
 * @param {string} params.sceneId - ID of the Spline scene
 * @param {string} params.objectId - ID of the object to animate
 * @param {string} params.animationName - Name of the animation to trigger
 * @param {Object} [params.options] - Additional animation options
 * @param {boolean} [params.options.loop=false] - Whether to loop the animation
 * @param {number} [params.options.duration] - Duration of the animation in seconds
 * @returns {Promise<Object>} Animation trigger result
 */
export async function triggerAnimation(params) {
  const { sceneId, objectId, animationName, options = {} } = params;
  const apiConfig = getApiConfig();

  try {
    // Make API request to trigger animation
    const response = await axios.post(
      `${apiConfig.baseUrl}/scenes/${sceneId}/objects/${objectId}/animations/${animationName}/trigger`,
      {
        ...options
      },
      {
        headers: {
          Authorization: `Bearer ${apiConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      animationId: response.data.animationId,
      message: `Animation "${animationName}" triggered for object ${objectId} in scene ${sceneId}.`,
    };
  } catch (error) {
    console.error('Error triggering animation:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}