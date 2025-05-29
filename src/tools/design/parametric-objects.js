/**
 * Parametric Object Tools for Spline.design
 * 
 * Tools for creating and manipulating parametric 2D and 3D objects in Spline.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register parametric object creation and manipulation tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerParametricObjectTools(server) {
  server.tool(
    "createParametricObject",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      type: z.enum([
        "cube", "sphere", "cylinder", "cone", "torus", 
        "plane", "circle", "rectangle", "triangle", "polygon", 
        "star", "ring", "rounded-rectangle", "ellipse"
      ]).describe("Type of parametric object"),
      parameters: z.record(z.any()).describe("Parametric properties specific to the object type"),
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
      scale: z.object({
        x: z.number().default(1),
        y: z.number().default(1),
        z: z.number().default(1),
      }).optional().describe("Scale factors"),
      material: z.string().optional().describe("Material ID to apply"),
    },
    async ({ sceneId, type, parameters, position, rotation, scale, material }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/parametric`, {
          method: "POST",
          body: JSON.stringify({
            type,
            parameters,
            position,
            rotation,
            scale,
            material,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created parametric ${type} object (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating parametric object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateParametricObject",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      parameters: z.record(z.any()).describe("Updated parametric properties"),
    },
    async ({ sceneId, objectId, parameters }) => {
      try {
        await updateSplineObject(sceneId, objectId, { parameters });
        return {
          content: [{
            type: "text",
            text: `Updated parametric object parameters for ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating parametric object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateObjectPivot",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Object ID"),
      pivotPosition: z.enum([
        "center", "top", "bottom", "left", "right", 
        "front", "back", "topLeft", "topRight", "bottomLeft", "bottomRight",
        "custom"
      ]).describe("Predefined pivot position or 'custom' for manual coordinates"),
      customPosition: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).optional().describe("Custom pivot position (when pivotPosition is 'custom')"),
    },
    async ({ sceneId, objectId, pivotPosition, customPosition }) => {
      try {
        // Validate custom position is provided when needed
        if (pivotPosition === 'custom' && !customPosition) {
          throw new Error("Custom position must be provided when pivot position is 'custom'");
        }

        await updateSplineObject(sceneId, objectId, { 
          pivotPosition: pivotPosition === 'custom' ? customPosition : pivotPosition 
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated pivot for object ${objectId} to ${pivotPosition}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating object pivot: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}