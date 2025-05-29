/**
 * Text Tools for Spline.design
 * 
 * Tools for creating and manipulating 2D and 3D text objects.
 */

import { z } from "zod";
import { fetchFromSplineApi, updateSplineObject } from "../../utils/api-client.js";

/**
 * Register text tools for 2D and 3D text
 * @param {McpServer} server - The MCP server instance
 */
export function registerTextTools(server) {
  server.tool(
    "create3DText",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      text: z.string().min(1).describe("Text content"),
      font: z.string().optional().describe("Font name"),
      size: z.number().positive().default(1).describe("Text size"),
      depth: z.number().positive().default(0.2).describe("Extrusion depth for 3D"),
      position: z.object({
        x: z.number().default(0),
        y: z.number().default(0),
        z: z.number().default(0),
      }).optional().describe("Position in 3D space"),
      alignment: z.enum(["left", "center", "right"]).default("left").describe("Text alignment"),
      material: z.string().optional().describe("Material ID to apply"),
      is3D: z.boolean().default(true).describe("Create 3D extruded text or flat 2D text"),
    },
    async ({ sceneId, text, font, size, depth, position, alignment, material, is3D }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/text`, {
          method: "POST",
          body: JSON.stringify({
            text,
            font,
            size,
            depth,
            position,
            alignment,
            material,
            is3D,
          }),
        });

        return {
          content: [{
            type: "text",
            text: `Created ${is3D ? '3D' : '2D'} text object (ID: ${result.objectId})`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating text object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "updateTextObject",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      objectId: z.string().min(1).describe("Text Object ID"),
      text: z.string().optional().describe("Updated text content"),
      font: z.string().optional().describe("Updated font"),
      size: z.number().positive().optional().describe("Updated text size"),
      depth: z.number().positive().optional().describe("Updated extrusion depth"),
      alignment: z.enum(["left", "center", "right"]).optional().describe("Updated text alignment"),
    },
    async ({ sceneId, objectId, text, font, size, depth, alignment }) => {
      try {
        await updateSplineObject(sceneId, objectId, { 
          text, 
          font, 
          size, 
          depth,
          alignment
        });
        
        return {
          content: [{
            type: "text",
            text: `Updated text object ${objectId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating text object: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}