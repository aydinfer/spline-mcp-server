/**
 * Pen Tools for Spline.design
 * 
 * Tools for creating and manipulating paths and shapes using the pen tool.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register pen tools for drawing and path creation
 * @param {McpServer} server - The MCP server instance
 */
export function registerPenTools(server) {
  server.tool(
    "createPenPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      points: z.array(z.object({
        x: z.number(),
        y: z.number(),
        z: z.number().default(0),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional(),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional(),
      })).min(2).describe("Path points with optional Bezier handles"),
      closed: z.boolean().default(false).describe("Whether the path is closed"),
      strokeWidth: z.number().positive().default(1).describe("Stroke width"),
      fillPath: z.boolean().default(false).describe("Fill the path (for closed paths)"),
      material: z.string().optional().describe("Material ID to apply"),
      strokeMaterial: z.string().optional().describe("Material ID for stroke (if different from fill)"),
    },
    async ({ sceneId, points, closed, strokeWidth, fillPath, material, strokeMaterial }) => {
      try {
        // Force path to be open if fillPath is false
        if (!fillPath) {
          closed = false;
        }

        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/path`, {
          method: "POST",
          body: JSON.stringify({
            points,
            closed,
            strokeWidth,
            fillPath,
            material,
            strokeMaterial,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created pen path (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating pen path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updatePenPath",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Path Object ID"),
      points: z.array(z.object({
        index: z.number().int().min(0).describe("Point index to update"),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated position"),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated in-handle"),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Updated out-handle"),
      })).min(1).describe("Points to update"),
      addPoints: z.array(z.object({
        afterIndex: z.number().int().min(0).describe("Index after which to add the point"),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).describe("Position"),
        handleIn: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("In-handle"),
        handleOut: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }).optional().describe("Out-handle"),
      })).optional().describe("Points to add"),
      removePointIndices: z.array(z.number().int().min(0)).optional().describe("Indices of points to remove"),
      closed: z.boolean().optional().describe("Update path closure"),
      strokeWidth: z.number().positive().optional().describe("Update stroke width"),
      fillPath: z.boolean().optional().describe("Update path filling"),
    },
    async ({ sceneId, objectId, points, addPoints, removePointIndices, closed, strokeWidth, fillPath }) => {
      try {
        await updateSplineObject(sceneId, objectId, { 
          pathUpdates: {
            points,
            addPoints,
            removePointIndices,
          },
          closed, 
          strokeWidth,
          fillPath,
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated pen path ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating pen path: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}