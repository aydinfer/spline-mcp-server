import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * OpenAIClient class for interacting with OpenAI API
 */
export class OpenAIClient {
  constructor(apiKey = process.env.OPENAI_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Generate text using OpenAI API
   * @param {string} prompt - Text prompt
   * @param {string} model - OpenAI model to use
   * @param {number} maxTokens - Maximum number of tokens
   * @param {number} temperature - Temperature for randomness
   * @returns {Promise<string>} - Generated text
   */
  async generateText(prompt, model = 'gpt-3.5-turbo', maxTokens = 100, temperature = 0.7) {
    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error(`OpenAI API error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Configure Spline OpenAI integration settings
   * @param {string} sceneId - Scene ID
   * @param {string} model - Model to use (e.g. 'gpt-3.5-turbo', 'gpt-4')
   * @param {string} prompt - System prompt to use
   * @returns {Object} - Configuration object for Spline
   */
  createSplineOpenAIConfig(sceneId, model = 'gpt-3.5-turbo', prompt = '') {
    return {
      sceneId,
      apiKey: this.apiKey,
      model,
      prompt,
      requestOnStart: false, // Whether to request on scene start
    };
  }
}

export default new OpenAIClient();
