/**
 * Extrusion Tools for Spline.design
 * 
 * Tools for extruding 2D shapes into 3D objects.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register extrusion tools for 2D to 3D conversion
 * @param {McpServer} server - The MCP server instance
 */
export function registerExtrusionTools(server) {
  server.tool(
    "extrude2DShape",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("2D Object ID to extrude"),
      depth: z.number().positive().describe("Extrusion depth"),
      steps: z.number().int().positive().default(1).describe("Number of extrusion steps"),
      bevel: z.boolean().default(false).describe("Apply bevel to edges"),
      bevelSize: z.number().optional().describe("Bevel size (when bevel is true)"),
      material: z.string().optional().describe("Material ID to apply to extruded object"),
    },
    async ({ sceneId, objectId, depth, steps, bevel, bevelSize, material }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/extrude`, {
          method: "POST",
          body: JSON.stringify({
            depth,
            steps,
            bevel,
            bevelSize,
            material,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Extruded 2D shape into 3D object (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error extruding shape: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "lathe2DShape",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("2D Object ID to lathe"),
      segments: z.number().int().min(3).max(64).default(32).describe("Number of segments"),
      angle: z.number().min(0).max(360).default(360).describe("Rotation angle in degrees"),
      axis: z.enum(["x", "y", "z"]).default("y").describe("Rotation axis"),
      material: z.string().optional().describe("Material ID to apply"),
    },
    async ({ sceneId, objectId, segments, angle, axis, material }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/${objectId}/lathe`, {
          method: "POST",
          body: JSON.stringify({
            segments,
            angle,
            axis,
            material,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created lathed 3D object (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating lathed object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}