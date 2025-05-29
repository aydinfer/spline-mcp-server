/**
 * Cloner Tools for Spline.design
 * 
 * Tools for creating and manipulating cloner objects for repeating elements in various patterns.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register cloner tools for creating repeated elements
 * @param {McpServer} server - The MCP server instance
 */
export function registerClonerTools(server) {
  server.tool(
    "createCloner",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      sourceObjectId: z.string().min(1).describe("Source object ID to clone"),
      type: z.enum([
        "linear", "grid", "radial", "object", "random"
      ]).describe("Type of cloner arrangement"),
      count: z.number().int().positive().describe("Number of clones to create"),
      parameters: z.object({
        // Linear cloner parameters
        spacing: z.number().optional().describe("Spacing between clones for linear/grid"),
        direction: z.enum(["x", "y", "z"]).optional().describe("Direction for linear cloner"),
        
        // Grid cloner parameters
        columns: z.number().int().positive().optional().describe("Number of columns for grid"),
        rows: z.number().int().positive().optional().describe("Number of rows for grid"),
        planes: z.number().int().positive().optional().describe("Number of planes for 3D grid"),
        columnSpacing: z.number().optional().describe("Column spacing for grid"),
        rowSpacing: z.number().optional().describe("Row spacing for grid"),
        planeSpacing: z.number().optional().describe("Plane spacing for 3D grid"),
        
        // Radial cloner parameters
        radius: z.number().positive().optional().describe("Radius for radial cloner"),
        startAngle: z.number().default(0).optional().describe("Start angle for radial cloner"),
        endAngle: z.number().default(360).optional().describe("End angle for radial cloner"),
        axis: z.enum(["x", "y", "z"]).default("y").optional().describe("Rotation axis for radial cloner"),
        
        // Object cloner parameters
        targetObjectId: z.string().optional().describe("Target object ID for object cloner"),
        alignToNormals: z.boolean().default(false).optional().describe("Align clones to surface normals"),
        
        // Random cloner parameters
        seed: z.number().int().optional().describe("Random seed"),
        area: z.object({
          width: z.number().positive(),
          height: z.number().positive(),
          depth: z.number().positive().optional(),
        }).optional().describe("Random distribution area"),
        
        // Common parameters
        rotation: z.object({
          x: z.number().default(0),
          y: z.number().default(0),
          z: z.number().default(0),
        }).optional().describe("Rotation offset between clones"),
        scale: z.object({
          x: z.number().default(1),
          y: z.number().default(1),
          z: z.number().default(1),
        }).optional().describe("Scale offset between clones"),
        scaleMode: z.enum(["absolute", "relative"]).default("absolute").optional()
          .describe("Scale mode: absolute values or relative multipliers"),
      }).optional().describe("Cloner-specific parameters"),
      createGroup: z.boolean().default(true).describe("Create a group containing the clones"),
    },
    async ({ sceneId, sourceObjectId, type, count, parameters, createGroup }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/cloner`, {
          method: "POST",
          body: JSON.stringify({
            sourceObjectId,
            type,
            count,
            parameters,
            createGroup,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created ${type} cloner with ${count} instances (ID: ${result.clonerId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating cloner: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateCloner",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      clonerId: z.string().min(1).describe("Cloner ID"),
      count: z.number().int().positive().optional().describe("Updated number of clones"),
      parameters: z.record(z.any()).optional().describe("Updated cloner parameters"),
      sourceObjectId: z.string().optional().describe("New source object ID"),
    },
    async ({ sceneId, clonerId, count, parameters, sourceObjectId }) => {
      try {
        await updateSplineObject(sceneId, clonerId, { 
          count,
          parameters,
          sourceObjectId,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated cloner ${clonerId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating cloner: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "applyEffectorToCloner",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      clonerId: z.string().min(1).describe("Cloner ID"),
      effectorType: z.enum(["delay", "step", "random", "sound", "noise"]).describe("Type of effector to apply"),
      parameters: z.object({
        // Delay effector parameters
        delay: z.number().optional().describe("Delay factor (0-1)"),
        
        // Step effector parameters
        steps: z.number().int().positive().optional().describe("Number of steps"),
        loop: z.boolean().default(false).optional().describe("Loop step pattern"),
        
        // Random effector parameters
        seed: z.number().int().optional().describe("Random seed"),
        min: z.number().optional().describe("Minimum value"),
        max: z.number().optional().describe("Maximum value"),
        
        // Sound effector parameters
        audioUrl: z.string().url().optional().describe("URL to audio file"),
        frequency: z.enum(["low", "mid", "high"]).optional().describe("Frequency range to affect"),
        
        // Noise effector parameters
        noiseType: z.enum(["perlin", "simplex", "worley"]).optional().describe("Type of noise"),
        scale: z.number().positive().optional().describe("Noise scale"),
        
        // Common parameters
        strength: z.number().min(0).max(1).default(1).optional().describe("Effector strength"),
        affectedProperties: z.array(z.enum([
          "position", "rotation", "scale", "color", "opacity"
        ])).optional().describe("Properties affected by the effector"),
      }).describe("Effector-specific parameters"),
    },
    async ({ sceneId, clonerId, effectorType, parameters }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${clonerId}/effectors`, {
          method: "POST",
          body: JSON.stringify({
            type: effectorType,
            parameters,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Applied ${effectorType} effector to cloner ${clonerId} (Effector ID: ${result.effectorId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error applying effector: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}