#!/usr/bin/env node

import { McpServer } from '@anthropic-ai/mcp-server';
import dotenv from 'dotenv';
import { exportScene } from './src/controllers/exportScene.js';
import { importScene } from './src/controllers/importScene.js';
import { getSceneDetails } from './src/controllers/getSceneDetails.js';
import { listScenes } from './src/controllers/listScenes.js';

dotenv.config();

const server = new McpServer({
  name: 'spline-mcp-server',
  description: 'An MCP server for working with Spline 3D design tool API',
  version: '1.0.0',
  homepage: 'https://github.com/aydinfer/spline-mcp-server',
  endpoints: {
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
  },
});

server.start();