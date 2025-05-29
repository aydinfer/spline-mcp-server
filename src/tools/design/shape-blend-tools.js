/**
 * Shape Blend Tools for Spline.design
 * 
 * Tools for creating shape blends between two shapes or objects.
 */

import { z } from "zod";
import { fetchFromSplineApi } from "../../utils/api-client.js";

/**
 * Register shape blend tools
 * @param {McpServer} server - The MCP server instance
 */
export function registerShapeBlendTools(server) {
  server.tool(
    "createShapeBlend",
    {
      sceneId: z.string().min(1).describe("Scene ID"),
      sourceObjectId: z.string().min(1).describe("Source shape object ID"),
      targetObjectId: z.string().min(1).describe("Target shape object ID"),
      steps: z.number().int().min(1).max(100).default(10).describe("Number of intermediate steps"),
      easing: z.enum(["linear", "easeIn", "easeOut", "easeInOut"]).default("linear").describe("Easing function"),
      createGroup: z.boolean().default(true).describe("Create a group containing all blend shapes"),
      material: z.string().optional().describe("Material ID to apply to blend shapes"),
    },
    async ({ sceneId, sourceObjectId, targetObjectId, steps, easing, createGroup, material }) => {
      try {
        const result = await fetchFromSplineApi(`/scenes/${sceneId}/objects/blend`, {
          method: "POST",
          body: JSON.stringify({
            sourceObjectId,
            targetObjectId,
            steps,
            easing,
            createGroup,
            material,
          }),
        });

        return {
          content: [{
            type: "text",
            text: createGroup
              ? `Created shape blend group (ID: ${result.groupId}) with ${steps} steps`
              : `Created ${steps} shape blend objects`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error creating shape blend: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
}