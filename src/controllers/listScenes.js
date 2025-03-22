import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * List available Spline scenes
 * @param {Object} params - Parameters
 * @param {number} [params.limit=10] - Number of scenes to return
 * @param {number} [params.offset=0] - Offset for pagination
 * @returns {Promise<Object>} List of scenes
 */
export async function listScenes(params) {
  const { limit = 10, offset = 0 } = params;
  const apiConfig = getApiConfig();

  try {
    // Make API request to list scenes
    const response = await axios.get(
      `${apiConfig.baseUrl}/scenes`,
      {
        params: {
          limit,
          offset,
        },
        headers: {
          Authorization: `Bearer ${apiConfig.apiKey}`,
        },
      }
    );

    return {
      success: true,
      scenes: response.data.scenes || [],
      total: response.data.total || 0,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error listing scenes:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}