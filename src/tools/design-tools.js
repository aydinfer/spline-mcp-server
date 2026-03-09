import { registerParametricObjectTools } from './design/parametric-objects.js';
import { registerTextTools } from './design/text-tools.js';
import { registerParticleTools } from './design/particle-tools.js';
import { registerPhysicsTools } from './design/physics-tools.js';
import { registerBooleanOperationTools } from './design/boolean-operations.js';
import { registerClonerTools } from './design/cloner-tools.js';
import { registerComponentTools } from './design/component-tools.js';
import { registerExtrusionTools } from './design/extrusion-tools.js';
import { registerGaussianSplattingTools } from './design/gaussian-splatting-tools.js';
import { registerHanaTools } from './design/hana-tools.js';
import { register3DLibraryTools } from './design/library-tools.js';
import { register3DModelingTools } from './design/modeling-tools.js';
import { registerMultiSceneTools } from './design/multi-scene-tools.js';
import { register3DPathTools } from './design/path-tools.js';
import { registerPenTools } from './design/pen-tools.js';
import { register3DSculptingTools } from './design/sculpting-tools.js';
import { registerShapeBlendTools } from './design/shape-blend-tools.js';
import { registerUISceneTools } from './design/ui-scene-tools.js';
import { registerVersionHistoryTools } from './design/version-history-tools.js';

/**
 * Register all advanced design tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerDesignTools = (server) => {
  registerParametricObjectTools(server);
  registerTextTools(server);
  registerParticleTools(server);
  registerPhysicsTools(server);
  registerBooleanOperationTools(server);
  registerClonerTools(server);
  registerComponentTools(server);
  registerExtrusionTools(server);
  registerGaussianSplattingTools(server);
  registerHanaTools(server);
  register3DLibraryTools(server);
  register3DModelingTools(server);
  registerMultiSceneTools(server);
  register3DPathTools(server);
  registerPenTools(server);
  register3DSculptingTools(server);
  registerShapeBlendTools(server);
  registerUISceneTools(server);
  registerVersionHistoryTools(server);
};
