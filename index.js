#!/usr/bin/env node

import { McpServer } from '@anthropic-ai/mcp-server';
import dotenv from 'dotenv';
import { exportScene } from './src/controllers/exportScene.js';
import { importScene } from './src/controllers/importScene.js';
import { getSceneDetails } from './src/controllers/getSceneDetails.js';
import { listScenes } from './src/controllers/listScenes.js';
import { createAnimation } from './src/controllers/createAnimation.js';
import { triggerAnimation } from './src/controllers/triggerAnimation.js';
import { listAnimations } from './src/controllers/listAnimations.js';
import { createEventAnimation } from './src/controllers/createEventAnimation.js';

dotenv.config();

const server = new McpServer({
  name: 'spline-mcp-server',
  description: 'An MCP server for working with Spline 3D design tool API, including animation capabilities',
  version: '1.0.0',
  homepage: 'https://github.com/aydinfer/spline-mcp-server',
  endpoints: {
    // Original endpoints
    exportScene: {
      description: 'Export a Spline scene to various formats (GLB, GLTF, FBX, OBJ)',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene to export' },
        format: { type: 'string', enum: ['glb', 'gltf', 'fbx', 'obj'], description: 'Export format' },
        options: { type: 'object', description: 'Additional export options', optional: true },
      },
      handler: exportScene,
    },
    importScene: {
      description: 'Import a 3D model into Spline',
      parameters: {
        modelUrl: { type: 'string', description: 'URL of the 3D model to import' },
        modelFormat: { type: 'string', enum: ['glb', 'gltf', 'fbx', 'obj'], description: 'Format of the model being imported' },
        projectId: { type: 'string', description: 'ID of the project to import into', optional: true },
      },
      handler: importScene,
    },
    getSceneDetails: {
      description: 'Get details about a Spline scene',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene' },
      },
      handler: getSceneDetails,
    },
    listScenes: {
      description: 'List available Spline scenes',
      parameters: {
        limit: { type: 'number', description: 'Number of scenes to return', optional: true },
        offset: { type: 'number', description: 'Offset for pagination', optional: true },
      },
      handler: listScenes,
    },
    
    // New animation endpoints
    createAnimation: {
      description: 'Create a new animation for an object in a Spline scene',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene' },
        objectId: { type: 'string', description: 'ID of the object to animate' },
        animationName: { type: 'string', description: 'Name for the new animation' },
        keyframes: { type: 'object', description: 'Keyframe data for the animation' },
        options: { 
          type: 'object', 
          description: 'Additional animation options (duration, easing, loop)',
          optional: true 
        },
      },
      handler: createAnimation,
    },
    triggerAnimation: {
      description: 'Trigger an animation in a Spline scene',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene' },
        objectId: { type: 'string', description: 'ID of the object to animate' },
        animationName: { type: 'string', description: 'Name of the animation to trigger' },
        options: { 
          type: 'object', 
          description: 'Additional options (loop, duration)',
          optional: true 
        },
      },
      handler: triggerAnimation,
    },
    listAnimations: {
      description: 'List animations in a Spline scene',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene' },
        objectId: { 
          type: 'string', 
          description: 'Optional object ID to filter animations',
          optional: true 
        },
      },
      handler: listAnimations,
    },
    createEventAnimation: {
      description: 'Create an event-triggered animation in a Spline scene',
      parameters: {
        sceneId: { type: 'string', description: 'ID of the Spline scene' },
        objectId: { type: 'string', description: 'ID of the object to animate' },
        eventType: { 
          type: 'string', 
          description: 'Type of event to trigger the animation (onClick, onHover, onDrag)' 
        },
        animationName: { type: 'string', description: 'Name for the new animation' },
        targetState: { 
          type: 'object', 
          description: 'Target state for the object (position, rotation, scale, etc.)' 
        },
        options: { 
          type: 'object', 
          description: 'Additional animation options (duration, easing)',
          optional: true 
        },
      },
      handler: createEventAnimation,
    },
  },
});

server.start();