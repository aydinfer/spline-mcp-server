import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Create a new animation for an object in a Spline scene
 * @param {Object} params - Parameters
 * @param {string} params.sceneId - ID of the Spline scene
 * @param {string} params.objectId - ID of the object to animate
 * @param {string} params.animationName - Name for the new animation
 * @param {Object} params.keyframes - Keyframe data for the animation
 * @param {Object} [params.options] - Additional animation options
 * @param {number} [params.options.duration=1] - Duration of the animation in seconds
 * @param {string} [params.options.easing='linear'] - Easing function (linear, easeIn, easeOut, easeInOut)
 * @param {boolean} [params.options.loop=false] - Whether to loop the animation
 * @returns {Promise<Object>} Animation creation result
 */
export async function createAnimation(params) {
  const { 
    sceneId, 
    objectId, 
    animationName, 
    keyframes,
    options = {
      duration: 1,
      easing: 'linear',
      loop: false
    } 
  } = params;
  
  const apiConfig = getApiConfig();

  try {
    // Make API request to create animation
    const response = await axios.post(
      `${apiConfig.baseUrl}/scenes/${sceneId}/objects/${objectId}/animations`,
      {
        name: animationName,
        keyframes,
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
      message: `Animation "${animationName}" created for object ${objectId} in scene ${sceneId}.`,
    };
  } catch (error) {
    console.error('Error creating animation:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}