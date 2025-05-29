import { z } from 'zod';
import apiClient from '../utils/api-client.js';
import openaiClient from '../utils/openai-client.js';

/**
 * API and Webhook management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerApiWebhookTools = (server) => {
  // Configure API connection
  server.tool(
    'configureApi',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('API name'),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'])
        .describe('HTTP method'),
      url: z.string().url().describe('API endpoint URL'),
      headers: z.record(z.string()).optional().describe('HTTP headers'),
      body: z.record(z.any()).optional().describe('Request body (for POST, PUT, PATCH)'),
      queryParams: z.record(z.string()).optional().describe('URL query parameters'),
      requestOnStart: z.boolean().optional().default(false)
        .describe('Whether to call API when scene loads'),
      variableMappings: z.array(z.object({
        responseField: z.string().describe('Field from API response'),
        variableName: z.string().describe('Spline variable name'),
        variableType: z.enum(['string', 'number', 'boolean']).describe('Variable type'),
      })).optional().describe('Mappings from API response to Spline variables'),
    },
    async ({ 
      sceneId, 
      name, 
      method, 
      url, 
      headers, 
      body, 
      queryParams, 
      requestOnStart, 
      variableMappings 
    }) => {
      try {
        const apiConfig = {
          name,
          method,
          url,
          ...(headers && { headers }),
          ...(body && { body }),
          ...(queryParams && { queryParams }),
          requestOnStart: requestOnStart || false,
          ...(variableMappings && { variableMappings }),
        };
        
        const result = await apiClient.configureApi(sceneId, apiConfig);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `API connection configured successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring API: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get all API connections in a scene
  server.tool(
    'getApis',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const apis = await apiClient.getApis(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(apis, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving APIs: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Delete an API connection
  server.tool(
    'deleteApi',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      apiId: z.string().min(1).describe('API connection ID'),
    },
    async ({ sceneId, apiId }) => {
      try {
        await apiClient.deleteApi(sceneId, apiId);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `API connection ${apiId} deleted successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error deleting API connection: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create a webhook
  server.tool(
    'createWebhook',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('Webhook name'),
      parameterMappings: z.array(z.object({
        paramName: z.string().describe('Parameter name in webhook'),
        variableName: z.string().describe('Spline variable name'),
        variableType: z.enum(['string', 'number', 'boolean']).describe('Variable type'),
      })).optional().describe('Parameter mappings'),
    },
    async ({ sceneId, name, parameterMappings }) => {
      try {
        const webhookData = {
          name,
          ...(parameterMappings && { parameterMappings }),
        };
        
        const result = await apiClient.createWebhook(sceneId, webhookData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Webhook created successfully with ID: ${result.id} and URL: ${result.url}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating webhook: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get all webhooks in a scene
  server.tool(
    'getWebhooks',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const webhooks = await apiClient.getWebhooks(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(webhooks, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving webhooks: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Delete a webhook
  server.tool(
    'deleteWebhook',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      webhookId: z.string().min(1).describe('Webhook ID'),
    },
    async ({ sceneId, webhookId }) => {
      try {
        await apiClient.deleteWebhook(sceneId, webhookId);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Webhook ${webhookId} deleted successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error deleting webhook: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Trigger a webhook manually
  server.tool(
    'triggerWebhook',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      webhookId: z.string().min(1).describe('Webhook ID'),
      data: z.record(z.any()).describe('Data to send with the webhook'),
    },
    async ({ sceneId, webhookId, data }) => {
      try {
        await apiClient.triggerWebhook(sceneId, webhookId, data);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Webhook ${webhookId} triggered successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error triggering webhook: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure OpenAI for text generation
  server.tool(
    'configureOpenAI',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      model: z.enum(['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-4o'])
        .default('gpt-3.5-turbo').describe('OpenAI model to use'),
      apiKey: z.string().optional().describe('OpenAI API key (uses env var if not provided)'),
      prompt: z.string().min(1).describe('System prompt/behavior for the AI'),
      requestOnStart: z.boolean().optional().default(false)
        .describe('Whether to call OpenAI when scene loads'),
      variableMappings: z.array(z.object({
        responseField: z.string().describe('Field from API response'),
        variableName: z.string().describe('Spline variable name'),
      })).optional().describe('Mappings from OpenAI response to Spline variables'),
    },
    async ({ sceneId, model, apiKey, prompt, requestOnStart, variableMappings }) => {
      try {
        const openaiConfig = {
          model,
          apiKey: apiKey || process.env.OPENAI_API_KEY,
          prompt,
          requestOnStart: requestOnStart || false,
          ...(variableMappings && { variableMappings }),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/openai`, openaiConfig);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `OpenAI integration configured successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring OpenAI: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate text with OpenAI (direct use, not through Spline)
  server.tool(
    'generateTextWithOpenAI',
    {
      prompt: z.string().min(1).describe('Prompt for text generation'),
      model: z.enum(['gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o-mini', 'gpt-4o'])
        .default('gpt-3.5-turbo').describe('OpenAI model to use'),
      maxTokens: z.number().min(1).max(4096).default(256)
        .describe('Maximum number of tokens to generate'),
      temperature: z.number().min(0).max(2).default(0.7)
        .describe('Temperature for text generation (0-2)'),
    },
    async ({ prompt, model, maxTokens, temperature }) => {
      try {
        const generatedText = await openaiClient.generateText(
          prompt,
          model,
          maxTokens,
          temperature
        );
        
        return {
          content: [
            { 
              type: 'text', 
              text: generatedText 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating text: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
