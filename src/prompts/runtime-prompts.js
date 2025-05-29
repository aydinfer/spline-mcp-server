import { z } from 'zod';

/**
 * Prompts for runtime and code generation in Spline.design
 * @param {object} server - MCP server instance
 */
export const registerRuntimePrompts = (server) => {
  // Create interactive scene prompt
  server.prompt(
    'create-interactive-scene',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      interactivity: z.enum(['basic', 'advanced']).default('basic').describe('Level of interactivity'),
      format: z.enum(['vanilla', 'react', 'next']).default('vanilla').describe('Code format'),
      responsive: z.boolean().default(true).describe('Whether to make responsive'),
    },
    ({ sceneId, interactivity, format, responsive }) => {
      let interactivityText = '';
      
      if (interactivity === 'basic') {
        interactivityText = `
- Basic mouse interactions (click, hover)
- Simple property changes
- Accessing object properties`;
      } else if (interactivity === 'advanced') {
        interactivityText = `
- Advanced mouse and keyboard interactions
- Custom animations and transitions
- Object manipulation (position, rotation, scale)
- Material modifications
- Camera controls
- Physics interactions (if applicable)`;
      }
      
      let formatText = '';
      if (format === 'vanilla') {
        formatText = 'vanilla JavaScript using the @splinetool/runtime package';
      } else if (format === 'react') {
        formatText = 'React components using @splinetool/react-spline';
      } else if (format === 'next') {
        formatText = 'Next.js components using @splinetool/react-spline/next';
      }
      
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create an interactive ${interactivity} scene for Spline scene ID "${sceneId}" using ${formatText}.
            
I want the code to be ${responsive ? 'responsive' : 'fixed-size'} and include:
${interactivityText}

First, use the appropriate tool to generate the code (generateRuntimeCode, generateReactComponent, or generateSceneInteractionCode). Then explain the key parts of the code and how I can integrate it into my project.

Please provide detailed instructions on:
1. How to set up the project with necessary dependencies
2. How to integrate the code
3. How to customize the interactions further

I want to understand how to work with Spline's runtime API to create truly interactive 3D experiences.`
          }
        }]
      };
    }
  );

  // Create animation sequence prompt
  server.prompt(
    'create-animation-sequence',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectNames: z.string().describe('Comma-separated list of object names'),
      sequenceType: z.enum(['parallel', 'sequential', 'choreographed']).default('sequential')
        .describe('Animation sequence type'),
      duration: z.number().int().min(100).default(2000).describe('Total animation duration (ms)'),
    },
    ({ sceneId, objectNames, sequenceType, duration }) => {
      const objects = objectNames.split(',').map(name => name.trim());
      
      let sequenceText = '';
      if (sequenceType === 'parallel') {
        sequenceText = 'all objects animate simultaneously';
      } else if (sequenceType === 'sequential') {
        sequenceText = 'objects animate one after another in sequence';
      } else if (sequenceType === 'choreographed') {
        sequenceText = 'objects animate in a custom choreographed pattern with varying timings and effects';
      }
      
      let objectsList = '';
      objects.forEach((obj, index) => {
        objectsList += `- Object ${index + 1}: "${obj}"\n`;
      });
      
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create an animation sequence for Spline scene ID "${sceneId}" where ${sequenceText}.
            
Objects to animate:
${objectsList}

Total animation duration: ${duration}ms

Please help me create a complex animation sequence using the Spline runtime API. I want a solution that:
1. Uses the official @splinetool/runtime package
2. Creates smooth, professional animations
3. Includes proper easing functions
4. Is reusable and customizable

Use the generateComprehensiveExample tool or other appropriate tools to create this animation sequence, and then explain how it works and how I can modify it.`
          }
        }]
      };
    }
  );

  // React component integration prompt
  server.prompt(
    'create-react-integration',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      framework: z.enum(['react', 'next', 'remix']).default('react').describe('React framework'),
      features: z.array(z.enum([
        'responsiveness', 'interactivity', 'loading', 'controls', 'api-integration', 'performance'
      ])).min(1).describe('Desired features'),
    },
    ({ sceneId, framework, features }) => {
      let featuresText = '';
      
      if (features.includes('responsiveness')) {
        featuresText += '- Fully responsive design that works on all screen sizes\n';
      }
      
      if (features.includes('interactivity')) {
        featuresText += '- Rich interactivity with mouse and keyboard controls\n';
      }
      
      if (features.includes('loading')) {
        featuresText += '- Optimized loading with proper loading states and fallbacks\n';
      }
      
      if (features.includes('controls')) {
        featuresText += '- Custom UI controls for manipulating the 3D scene\n';
      }
      
      if (features.includes('api-integration')) {
        featuresText += '- Integration with external APIs for dynamic data\n';
      }
      
      if (features.includes('performance')) {
        featuresText += '- Performance optimizations for smooth rendering\n';
      }
      
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create a complete ${framework.charAt(0).toUpperCase() + framework.slice(1)} integration for Spline scene ID "${sceneId}" with these features:

${featuresText}

I want to go beyond basic embedding and create a truly interactive and professional integration. Please:

1. Generate the complete component code using generateReactComponent
2. Show me how to properly structure and optimize the component
3. Explain how to integrate it with ${framework} routing and data fetching
4. Provide tips for improving performance and user experience

I'm looking for a solution that feels seamless with my ${framework} application and leverages the full power of Spline's runtime.`
          }
        }]
      };
    }
  );
};
