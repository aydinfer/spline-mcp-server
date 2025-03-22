import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Export a Spline scene to various formats (GLB, GLTF, FBX, OBJ)
 * @param {Object} params - Export parameters
 * @param {string} params.sceneId - ID of the Spline scene to export
 * @param {string} params.format - Export format (glb, gltf, fbx, obj)
 * @param {Object} [params.options] - Additional export options
 * @returns {Promise<Object>} Export result with download URL
 */
export async function exportScene(params) {
  const { sceneId, format, options = {} } = params;
  const apiConfig = getApiConfig();

  try {
    // Make API request to export the scene
    const response = await axios.post(
      `${apiConfig.baseUrl}/scenes/${sceneId}/export`,
      {
        format,
        ...options,
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
      downloadUrl: response.data.downloadUrl,
      format,
      message: `Scene ${sceneId} has been exported to ${format} format successfully.`,
    };
  } catch (error) {
    console.error('Error exporting scene:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}