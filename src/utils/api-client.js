import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * SplineApiClient class for interacting with Spline.design APIs
 */
export class SplineApiClient {
  constructor(apiKey = process.env.SPLINE_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.spline.design';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Make a request to the Spline API
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @returns {Promise<object>} - API response
   */
  async request(method, endpoint, data = null) {
    try {
      const response = await this.client({
        method,
        url: endpoint,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' && data ? data : undefined,
      });
      return response.data;
    } catch (error) {
      console.error(`Spline API error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Get scene details
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<object>} - Scene details
   */
  async getScene(sceneId) {
    return this.request('GET', `/scenes/${sceneId}`);
  }

  /**
   * List objects in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of objects
   */
  async getObjects(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/objects`);
  }

  /**
   * Get object details
   * @param {string} sceneId - ID of the scene
   * @param {string} objectId - ID of the object
   * @returns {Promise<object>} - Object details
   */
  async getObject(sceneId, objectId) {
    return this.request('GET', `/scenes/${sceneId}/objects/${objectId}`);
  }

  /**
   * Update object properties
   * @param {string} sceneId - ID of the scene
   * @param {string} objectId - ID of the object
   * @param {object} properties - Properties to update
   * @returns {Promise<object>} - Updated object
   */
  async updateObject(sceneId, objectId, properties) {
    return this.request('PUT', `/scenes/${sceneId}/objects/${objectId}`, properties);
  }

  /**
   * Create a new object
   * @param {string} sceneId - ID of the scene
   * @param {object} objectData - Object data
   * @returns {Promise<object>} - Created object
   */
  async createObject(sceneId, objectData) {
    return this.request('POST', `/scenes/${sceneId}/objects`, objectData);
  }

  /**
   * Delete an object
   * @param {string} sceneId - ID of the scene
   * @param {string} objectId - ID of the object
   * @returns {Promise<object>} - Response
   */
  async deleteObject(sceneId, objectId) {
    return this.request('DELETE', `/scenes/${sceneId}/objects/${objectId}`);
  }

  /**
   * Get material details
   * @param {string} sceneId - ID of the scene
   * @param {string} materialId - ID of the material
   * @returns {Promise<object>} - Material details
   */
  async getMaterial(sceneId, materialId) {
    return this.request('GET', `/scenes/${sceneId}/materials/${materialId}`);
  }

  /**
   * List materials in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of materials
   */
  async getMaterials(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/materials`);
  }

  /**
   * Update material properties
   * @param {string} sceneId - ID of the scene
   * @param {string} materialId - ID of the material
   * @param {object} properties - Properties to update
   * @returns {Promise<object>} - Updated material
   */
  async updateMaterial(sceneId, materialId, properties) {
    return this.request('PUT', `/scenes/${sceneId}/materials/${materialId}`, properties);
  }

  /**
   * Get state details
   * @param {string} sceneId - ID of the scene
   * @param {string} stateId - ID of the state
   * @returns {Promise<object>} - State details
   */
  async getState(sceneId, stateId) {
    return this.request('GET', `/scenes/${sceneId}/states/${stateId}`);
  }

  /**
   * List states in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of states
   */
  async getStates(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/states`);
  }

  /**
   * Trigger a state
   * @param {string} sceneId - ID of the scene
   * @param {string} stateId - ID of the state
   * @returns {Promise<object>} - Response
   */
  async triggerState(sceneId, stateId) {
    return this.request('POST', `/scenes/${sceneId}/states/${stateId}/trigger`);
  }

  /**
   * Get event details
   * @param {string} sceneId - ID of the scene
   * @param {string} eventId - ID of the event
   * @returns {Promise<object>} - Event details
   */
  async getEvent(sceneId, eventId) {
    return this.request('GET', `/scenes/${sceneId}/events/${eventId}`);
  }

  /**
   * List events in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of events
   */
  async getEvents(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/events`);
  }

  /**
   * Trigger an event
   * @param {string} sceneId - ID of the scene
   * @param {string} eventId - ID of the event
   * @param {object} eventData - Event data
   * @returns {Promise<object>} - Response
   */
  async triggerEvent(sceneId, eventId, eventData = {}) {
    return this.request('POST', `/scenes/${sceneId}/events/${eventId}/trigger`, eventData);
  }

  /**
   * Create a webhook
   * @param {string} sceneId - ID of the scene
   * @param {object} webhookData - Webhook configuration
   * @returns {Promise<object>} - Created webhook
   */
  async createWebhook(sceneId, webhookData) {
    return this.request('POST', `/scenes/${sceneId}/webhooks`, webhookData);
  }

  /**
   * List webhooks in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of webhooks
   */
  async getWebhooks(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/webhooks`);
  }

  /**
   * Delete a webhook
   * @param {string} sceneId - ID of the scene
   * @param {string} webhookId - ID of the webhook
   * @returns {Promise<object>} - Response
   */
  async deleteWebhook(sceneId, webhookId) {
    return this.request('DELETE', `/scenes/${sceneId}/webhooks/${webhookId}`);
  }

  /**
   * Manually trigger a webhook
   * @param {string} sceneId - ID of the scene
   * @param {string} webhookId - ID of the webhook
   * @param {object} data - Data to send with the webhook
   * @returns {Promise<object>} - Response
   */
  async triggerWebhook(sceneId, webhookId, data) {
    return this.request('POST', `/scenes/${sceneId}/webhooks/${webhookId}/trigger`, data);
  }

  /**
   * Configure an API connection
   * @param {string} sceneId - ID of the scene
   * @param {object} apiConfig - API configuration
   * @returns {Promise<object>} - Created API connection
   */
  async configureApi(sceneId, apiConfig) {
    return this.request('POST', `/scenes/${sceneId}/apis`, apiConfig);
  }

  /**
   * List API connections in a scene
   * @param {string} sceneId - ID of the scene
   * @returns {Promise<Array>} - List of API connections
   */
  async getApis(sceneId) {
    return this.request('GET', `/scenes/${sceneId}/apis`);
  }

  /**
   * Delete an API connection
   * @param {string} sceneId - ID of the scene
   * @param {string} apiId - ID of the API connection
   * @returns {Promise<object>} - Response
   */
  async deleteApi(sceneId, apiId) {
    return this.request('DELETE', `/scenes/${sceneId}/apis/${apiId}`);
  }
}

export default new SplineApiClient();
