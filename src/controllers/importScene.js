import axios from 'axios';
import { getApiConfig } from '../utils/apiConfig.js';

/**
 * Import a 3D model into Spline
 * @param {Object} params - Import parameters
 * @param {string} params.modelUrl - URL of the 3D model to import
 * @param {string} params.modelFormat - Format of the model being imported
 * @param {string} [params.projectId] - ID of the project to import into
 * @returns {Promise<Object>} Import result with scene ID
 */
export async function importScene(params) {
  const { modelUrl, modelFormat, projectId } = params;
  const apiConfig = getApiConfig();

  try {
    // Prepare request data
    const requestData = {
      modelUrl,
      modelFormat,
    };

    if (projectId) {
      requestData.projectId = projectId;
    }

    // Make API request to import the model
    const response = await axios.post(
      `${apiConfig.baseUrl}/scenes/import`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      sceneId: response.data.sceneId,
      sceneName: response.data.name,
      message: `Model has been imported successfully as scene ${response.data.sceneId}.`,
    };
  } catch (error) {
    console.error('Error importing model:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status || 500,
    };
  }
}