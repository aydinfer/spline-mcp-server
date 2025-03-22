import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Create an event-triggered animation in a Spline scene
 * @param {Object} params - Parameters
 * @param {string} params.sceneId - ID of the Spline scene
 * @param {string} params.objectId - ID of the object to animate
 * @param {string} params.eventType - Type of event to trigger the animation
 *                                   (e.g., 'onClick', 'onHover', 'onDrag')
 * @param {string} params.animationName - Name for the new animation
 * @param {Object} params.targetState - Target state for the object (position, rotation, scale, etc.)
 * @param {Object} [params.options] - Additional animation options
 * @param {number} [params.options.duration=1] - Duration of the animation in seconds
 * @param {string} [params.options.easing='easeInOut'] - Easing function (linear, easeIn, easeOut, easeInOut)
 * @returns {Promise<Object>} Event animation creation result
 */
export async function createEventAnimation(params) {
  const { 
    sceneId, 
    objectId, 
    eventType, 
    animationName, 
    targetState,
    options = {
      duration: 1,
      easing: 'easeInOut'
    } 
  } = params;
  
  const apiConfig = getApiConfig();

  try {
    // Make API request to create event-based animation
    const response = await axios.post(
      `${apiConfig.baseUrl}/scenes/${sceneId}/objects/${objectId}/events`,
      {
        type: eventType,
        animation: {
          name: animationName,
          targetState,
          ...options
        }
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
      eventId: response.data.eventId,
      animationId: response.data.animationId,
      message: `Event-based animation "${animationName}" created for object ${objectId} triggered by ${eventType}.`,
    };
  } catch (error) {
    console.error('Error creating event animation:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}