/**
 * 3D Sculpting Tools for Spline.design
 * 
 * Tools for creating and manipulating sculpted 3D objects.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register 3D sculpting tools
 * @param {McpServer} server - The MCP server instance
 */
export function register3DSculptingTools(server) {
  server.tool(
    "createSculptObject",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      baseShape: z.enum(["sphere", "cube", "cylinder", "plane", "torus"]).default("sphere").describe("Base shape to sculpt"),
      resolution: z.enum(["low", "medium", "high", "ultra"]).default("medium").describe("Sculpting resolution"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      scale: z.number().positive().default(1).describe("Uniform scale factor"),
      material: z.string().optional().describe("Material ID to apply"),
    },
    async ({ sceneId, baseShape, resolution, position, scale, material }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/sculpt`, {
          method: "POST",
          body: JSON.stringify({
            baseShape,
            resolution,
            position,
            scale,
            material,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created sculpt object (ID: ${result.objectId}) from ${baseShape} base`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating sculpt object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "applySculptingBrush",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Sculpt object ID"),
      brushType: z.enum([
        "grab", "move", "pinch", "inflate", "smooth", 
        "flatten", "clay", "crease", "twist", "snake"
      ]).describe("Sculpting brush type"),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).describe("Brush position in 3D space"),
      normal: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).optional().describe("Surface normal direction"),
      strength: z.number().min(0).max(1).default(0.5).describe("Brush strength"),
      size: z.number().positive().default(1).describe("Brush size"),
      symmetric: z.boolean().default(false).describe("Apply symmetrically on X axis"),
      recordHistory: z.boolean().default(true).describe("Record in undo history"),
    },
    async ({ sceneId, objectId, brushType, position, normal, strength, size, symmetric, recordHistory }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/sculpt`, {
          method: "POST",
          body: JSON.stringify({
            brushType,
            position,
            normal,
            strength,
            size,
            symmetric,
            recordHistory,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Applied ${brushType} brush to sculpt object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error applying sculpting brush: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "commitSculptChanges",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Sculpt object ID"),
      optimizeMesh: z.boolean().default(true).describe("Optimize mesh after commit")
    },
    async ({ sceneId, objectId, optimizeMesh }) => {
      try {
        await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/sculpt/commit`, {
          method: "POST",
          body: JSON.stringify({
            optimizeMesh,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Committed sculpting changes to object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error committing sculpt changes: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}