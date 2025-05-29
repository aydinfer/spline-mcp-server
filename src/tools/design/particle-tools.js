/**
 * Particle System Tools for Spline.design
 * 
 * Tools for creating and manipulating particle systems.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register particle system tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerParticleTools(server) {
  server.tool(
    "createParticleSystem",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      emitterType: z.enum(["point", "box", "sphere", "circle", "mesh"]).describe("Type of particle emitter"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      rotation: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Rotation in degrees"),
      parameters: z.object({
        // Emission parameters
        rate: z.number().positive().describe("Particles per second"),
        burstCount: z.number().int().min(0).default(0).describe("Number of particles to emit in a burst"),
        burstInterval: z.number().positive().optional().describe("Interval between bursts (seconds)"),
        duration: z.number().positive().optional().describe("Duration of emission (seconds, 0 for continuous)"),
        loop: z.boolean().default(true).describe("Whether the emission loops"),
        
        // Emitter shape parameters
        size: z.object({
          x: z.number().positive(),
          y: z.number().positive(),
          z: z.number().positive(),
        }).optional().describe("Emitter size for box/sphere emitters"),
        radius: z.number().positive().optional().describe("Radius for circle/sphere emitters"),
        sourceMeshId: z.string().optional().describe("Source mesh ID for mesh emitters"),
        emitFromVolume: z.boolean().default(true).optional().describe("Emit from volume or surface"),
        
        // Particle appearance
        particleShape: z.enum(["point", "sphere", "cube", "custom"]).default("sphere").describe("Particle shape"),
        customMeshId: z.string().optional().describe("Custom mesh ID for custom particle shape"),
        particleSize: z.number().positive().default(0.1).describe("Particle size"),
        sizeVariation: z.number().min(0).max(1).default(0).describe("Random variation in particle size"),
        startSize: z.number().positive().optional().describe("Initial particle size"),
        endSize: z.number().positive().optional().describe("Final particle size"),
        
        // Particle material
        material: z.string().optional().describe("Material ID to apply to particles"),
        color: z.string().optional().describe("Particle color (hex/rgb)"),
        startColor: z.string().optional().describe("Initial particle color (hex/rgb)"),
        endColor: z.string().optional().describe("Final particle color (hex/rgb)"),
        opacity: z.number().min(0).max(1).default(1).describe("Particle opacity"),
        startOpacity: z.number().min(0).max(1).optional().describe("Initial particle opacity"),
        endOpacity: z.number().min(0).max(1).optional().describe("Final particle opacity"),
        
        // Particle behavior
        lifetime: z.number().positive().default(1).describe("Particle lifetime in seconds"),
        lifetimeVariation: z.number().min(0).max(1).default(0).describe("Random variation in particle lifetime"),
        speed: z.number().default(1).describe("Particle movement speed"),
        speedVariation: z.number().min(0).max(1).default(0).describe("Random variation in particle speed"),
        direction: z.object({
          x: z.number().default(0),
          y: z.number().default(1),
          z: z.number().default(0),
        }).optional().describe("Base emission direction"),
        directionVariation: z.number().min(0).max(1).default(0).describe("Random variation in emission direction"),
        
        // Physics
        gravity: z.object({
          x: z.number().default(0),
          y: z.number().default(0),
          z: z.number().default(0),
        }).optional().describe("Gravity force"),
        drag: z.number().min(0).default(0).describe("Air drag coefficient"),
        turbulence: z.number().min(0).default(0).describe("Turbulence strength"),
        turbulenceScale: z.number().positive().default(1).describe("Turbulence scale"),
        
        // Collision
        collisionEnabled: z.boolean().default(false).describe("Enable collision detection"),
        collideWith: z.array(z.string()).optional().describe("Object IDs to collide with"),
        bounciness: z.number().min(0).max(1).default(0.5).describe("Collision bounciness"),
      }).describe("Particle system parameters"),
    },
    async ({ sceneId, emitterType, position, rotation, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/particles`, {
          method: "POST",
          body: JSON.stringify({
            emitterType,
            position,
            rotation,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created ${emitterType} particle system (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating particle system: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateParticleSystem",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      particleSystemId: z.string().min(1).describe("Particle system ID"),
      parameters: z.record(z.any()).describe("Updated particle system parameters"),
    },
    async ({ sceneId, particleSystemId, parameters }) => {
      try {
        await updateSplineObject(sceneId, particleSystemId, { 
          parameters,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated particle system ${particleSystemId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating particle system: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "controlParticleSystem",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      particleSystemId: z.string().min(1).describe("Particle system ID"),
      action: z.enum(["play", "pause", "stop", "burst"]).describe("Control action"),
      burstCount: z.number().int().positive().optional().describe("Number of particles to emit in burst mode"),
    },
    async ({ sceneId, particleSystemId, action, burstCount }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${particleSystemId}/control`, {
          method: "POST",
          body: JSON.stringify({
            action,
            burstCount,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Particle system ${particleSystemId} ${action} command sent`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error controlling particle system: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "createParticleForce",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      particleSystemId: z.string().min(1).describe("Particle system ID"),
      forceType: z.enum(["wind", "vortex", "attractor", "repeller", "turbulence"]).describe("Type of force field"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      parameters: z.object({
        // Common parameters
        strength: z.number().default(1).describe("Force strength"),
        radius: z.number().positive().optional().describe("Force field radius (0 for infinite)"),
        falloff: z.enum(["none", "linear", "quadratic", "cubic"]).default("quadratic")
          .describe("Force falloff with distance"),
        
        // Wind force parameters
        direction: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Wind direction vector"),
        
        // Vortex force parameters
        axis: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Vortex rotation axis"),
        
        // Turbulence parameters
        scale: z.number().positive().default(1).describe("Turbulence scale"),
        speed: z.number().default(1).describe("Turbulence animation speed"),
        octaves: z.number().int().min(1).max(8).default(3).describe("Turbulence detail octaves"),
      }).describe("Force field parameters"),
    },
    async ({ sceneId, particleSystemId, forceType, position, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${particleSystemId}/forces`, {
          method: "POST",
          body: JSON.stringify({
            forceType,
            position,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Added ${forceType} force to particle system ${particleSystemId} (Force ID: ${result.forceId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating particle force: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}